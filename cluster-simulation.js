(function initClusterSimulation(root, factory) {
  const data = root.ClusterData || (typeof require === 'function' ? require('./cluster-data.js') : null);
  const model = root.ClusterModel || (typeof require === 'function' ? require('./cluster-model.js') : null);
  const api = factory(root, data, model);
  root.ClusterSimulation = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createClusterSimulation(root, Data, Model) {
  'use strict';

  if (!Data || !Model) throw new Error('ClusterData and ClusterModel must be loaded before ClusterSimulation.');

  const STORAGE_KEY = 'nzlClusterSimulationDataV8';
  const LEGACY_STORAGE_KEYS = [
    { key: 'nzlClusterSimulationDataV7', migrate: 'extend' },
    { key: 'nzlClusterSimulationDataV6', migrate: 'recalibrate' },
    { key: 'nzlClusterSimulationDataV5', migrate: 'recalibrate' },
    { key: 'nzlClusterSimulationDataV4', migrate: 'recalibrate' },
    { key: 'nzlClusterSimulationDataV3', migrate: 'recalibrate' },
    { key: 'nzlClusterSimulationDataV2', migrate: 'recalibrate' },
    { key: 'nzlClusterSimulationDataV1', migrate: 'legacy' },
  ];
  const UNDO_LIMIT = 25;
  const listeners = new Set();
  const undoStack = [];

  function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function sanitizeBoolean(value, fallback) {
    if (value === undefined || value === null) return Boolean(fallback);
    if (value === false || value === 0 || value === 'false' || value === '0') return false;
    return true;
  }

  function sanitizeTechnologies(candidate, fallback = Data.TECHNOLOGY_DEFAULTS) {
    const source = candidate || {};
    const base = fallback || Data.TECHNOLOGY_DEFAULTS;
    return {
      greenHydrogen: sanitizeBoolean(source.greenHydrogen, base.greenHydrogen),
      electrolyzers: sanitizeBoolean(source.electrolyzers, base.electrolyzers),
      electrolyzerUnits: Math.max(0, Math.min(
        Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits,
        Math.round(Number(source.electrolyzerUnits ?? base.electrolyzerUnits) || 0)
      )),
      ammoniaStorage: sanitizeBoolean(source.ammoniaStorage, base.ammoniaStorage),
      hydrogenToAmmoniaShare: Math.max(0, Math.min(
        100,
        Math.round(Number(source.hydrogenToAmmoniaShare ?? base.hydrogenToAmmoniaShare) || 0)
      )),
      ccs: sanitizeBoolean(source.ccs, base.ccs),
      nuclearReactors: Math.max(0, Math.min(
        Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors,
        Math.round(Number(source.nuclearReactors ?? base.nuclearReactors) || 0)
      )),
    };
  }

  function sanitizeTransitionDynamics(candidate, fallback) {
    const source = candidate || fallback;
    if (!source) return undefined;
    const allowedTypes = ['front_loaded_plateau', 'deindustrialisation'];
    if (!allowedTypes.includes(source.type)) return undefined;
    const bounded = (value, fallbackValue, minimum, maximum) => Math.max(
      minimum,
      Math.min(maximum, Number.isFinite(Number(value)) ? Number(value) : fallbackValue)
    );
    if (source.type === 'front_loaded_plateau') {
      const earlyResponseYear = bounded(source.earlyResponseYear, 2031, 2027, 2040);
      const plateauYear = bounded(source.plateauYear, 2036, earlyResponseYear + 1, 2045);
      const earlyResponseShare = bounded(source.earlyResponseShare, 0.82, 0.20, 0.95);
      return {
        type: source.type,
        technicalReduction2050: bounded(source.technicalReduction2050, 0.34, 0.05, 0.80),
        earlyResponseYear,
        earlyResponseShare,
        plateauYear,
        plateauShare: bounded(source.plateauShare, 0.94, earlyResponseShare, 0.99),
      };
    }
    const closureStartYear = bounded(source.closureStartYear, 2027, 2025, 2045);
    return {
      type: source.type,
      technicalReduction2050: bounded(source.technicalReduction2050, 0.22, 0, 0.80),
      closureStartYear,
      closureMidpoint: bounded(source.closureMidpoint, 2038, closureStartYear + 1, 2049),
      closureRate: bounded(source.closureRate, 0.22, 0.05, 1),
    };
  }

  function sanitizeScenario(candidate, fallback) {
    const base = fallback || Data.DEFAULT_SCENARIOS.find((scenario) => scenario.id === candidate?.id) || Data.DEFAULT_SCENARIOS[0];
    const custom = Boolean(candidate?.custom || !Data.DEFAULT_SCENARIOS.some((scenario) => scenario.id === candidate?.id));
    // Built-in explanations follow the current wording; saved numerical inputs stay editable.
    // User-created scenarios retain their own names and descriptions.
    const copySource = custom ? candidate : base;
    const values = Object.fromEntries(Data.SCENARIO_PARAMETER_KEYS.map((key) => [
      key,
      Model.clamp01(candidate?.values?.[key] ?? candidate?.[key] ?? base.values[key]),
    ]));
    const localized = (value, baseValue, generic) => ({
      en: String(value?.en || baseValue?.en || generic.en).slice(0, 500),
      bg: String(value?.bg || baseValue?.bg || value?.en || baseValue?.en || generic.bg).slice(0, 500),
    });
    const generic = {
      role: { en: 'Custom scenario', bg: 'Потребителски сценарий' },
      description: { en: 'User-defined scenario based on the current model inputs.', bg: 'Потребителски сценарий според текущите входове на модела.' },
      basis: { en: 'Assumptions require user validation.', bg: 'Допусканията изискват потребителска валидация.' },
    };
    const focusSource = Array.isArray(copySource?.focus) ? copySource.focus : custom ? [] : base.focus || [];
    const evidenceSource = Array.isArray(copySource?.evidence) ? copySource.evidence : custom ? [] : base.evidence || [];
    return {
      id: String(candidate?.id || base.id).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || base.id,
      name: {
        en: String(copySource?.name?.en || base.name.en || base.id).slice(0, 120),
        bg: String(copySource?.name?.bg || base.name.bg || copySource?.name?.en || base.id).slice(0, 120),
      },
      theme: String(candidate?.theme || base.theme || 'custom').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'custom',
      custom,
      role: localized(copySource?.role, custom ? null : base.role, generic.role),
      description: localized(copySource?.description, custom ? null : base.description, generic.description),
      basis: localized(copySource?.basis, custom ? null : base.basis, generic.basis),
      focus: focusSource.slice(0, 8).map((item) => localized(item, null, { en: '', bg: '' })),
      evidence: evidenceSource.slice(0, 8).map((item) => ({
        name: localized(item?.name, null, { en: 'Source', bg: 'Източник' }),
        url: String(item?.url || '').slice(0, 1000),
      })),
      values,
      technologies: sanitizeTechnologies(candidate?.technologies, base.technologies),
      transitionDynamics: sanitizeTransitionDynamics(candidate?.transitionDynamics, base.transitionDynamics),
    };
  }

  function sanitizeCompany(candidate, fallback) {
    const factors = {};
    Data.COMPANY_METRIC_DEFINITIONS.forEach((metric) => {
      factors[metric.key] = {};
      metric.factors.forEach((factor) => {
        factors[metric.key][factor.key] = Model.clamp01(
          candidate?.factors?.[metric.key]?.[factor.key]
          ?? fallback.factors[metric.key][factor.key]
        );
      });
    });
    return {
      ...fallback,
      provenance: { ...fallback.provenance, ...(candidate?.provenance || {}) },
      factors,
    };
  }

  function sanitizeState(candidate) {
    const defaults = Data.createDefaultState();
    const savedScenarios = Array.isArray(candidate?.scenarios) ? candidate.scenarios : [];
    const scenarios = defaults.scenarios.map((fallback) => {
      const saved = savedScenarios.find((scenario) => scenario.id === fallback.id || scenario.theme === fallback.theme);
      return sanitizeScenario(saved || fallback, fallback);
    });
    savedScenarios
      .filter((scenario) => scenario?.custom && !scenarios.some((entry) => entry.id === scenario.id))
      .forEach((scenario) => scenarios.push(sanitizeScenario(scenario, defaults.scenarios[0])));

    const savedCompanies = Array.isArray(candidate?.companies) ? candidate.companies : [];
    const companies = defaults.companies.map((fallback) => {
      const saved = savedCompanies.find((company) => company.id === fallback.id || company.company === fallback.company);
      return sanitizeCompany(saved || fallback, fallback);
    });

    const selectedScenarioId = scenarios.some((scenario) => scenario.id === candidate?.selectedScenarioId)
      ? candidate.selectedScenarioId
      : defaults.selectedScenarioId;
    const comparisonScenarioId = scenarios.some((scenario) => scenario.id === candidate?.comparisonScenarioId)
      ? candidate.comparisonScenarioId
      : defaults.comparisonScenarioId;
    const selectedCompanyId = companies.some((company) => company.id === candidate?.selectedCompanyId)
      ? candidate.selectedCompanyId
      : defaults.selectedCompanyId;
    const selectedMetricKey = Data.COMPANY_METRIC_KEYS.includes(candidate?.selectedMetricKey)
      ? candidate.selectedMetricKey
      : defaults.selectedMetricKey;

    return {
      version: Data.VERSION,
      scenarios,
      companies,
      selectedScenarioId,
      comparisonScenarioId,
      selectedCompanyId,
      selectedMetricKey,
      monteCarlo: {
        uncertainty20: Math.max(0, Math.min(5, Number(candidate?.monteCarlo?.uncertainty20 ?? defaults.monteCarlo.uncertainty20))),
        iterations: Math.max(100, Math.min(2000, Math.round(Number(candidate?.monteCarlo?.iterations ?? defaults.monteCarlo.iterations)))),
        seed: Math.round(Number(candidate?.monteCarlo?.seed ?? defaults.monteCarlo.seed)) || defaults.monteCarlo.seed,
      },
    };
  }

  function migrateLegacyState(legacy) {
    const migrated = Data.createDefaultState();
    (legacy?.scenarios || []).forEach((legacyScenario) => {
      const target = migrated.scenarios.find((scenario) => scenario.theme === legacyScenario.theme);
      if (!target) return;
      Data.SCENARIO_PARAMETER_KEYS.forEach((key) => {
        if (legacyScenario.values?.[key] !== undefined) target.values[key] = Model.clamp01(legacyScenario.values[key]);
      });
    });
    (legacy?.companies || []).forEach((legacyCompany) => {
      const index = migrated.companies.findIndex((company) => company.company === legacyCompany.company);
      if (index < 0) return;
      let company = migrated.companies[index];
      Data.COMPANY_METRIC_KEYS.forEach((key) => {
        if (legacyCompany.values?.[key] === undefined) return;
        company = Model.setCompanyMetricTarget(company, key, Model.clamp01(Number(legacyCompany.values[key]) / 5));
      });
      migrated.companies[index] = company;
    });
    return migrated;
  }

  function recalibrateScenarioSet(legacy) {
    const customScenarios = (legacy?.scenarios || []).filter((scenario) => (
      scenario?.custom || !Data.DEFAULT_SCENARIOS.some((baseline) => baseline.id === scenario?.id)
    ));
    return {
      ...legacy,
      version: Data.VERSION,
      scenarios: [...Data.createDefaultScenarios(), ...customScenarios],
    };
  }

  function extendScenarioSet(legacy) {
    const existingScenarios = Array.isArray(legacy?.scenarios) ? legacy.scenarios : [];
    const existingIds = new Set(existingScenarios.map((scenario) => scenario?.id));
    const addedScenarios = Data.createDefaultScenarios().filter((scenario) => !existingIds.has(scenario.id));
    return {
      ...legacy,
      version: Data.VERSION,
      scenarios: [...existingScenarios, ...addedScenarios],
    };
  }

  function decodeBase64Url(value) {
    const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = root.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return root.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function readSharedScenario() {
    try {
      if (!root.location?.hash) return null;
      const params = new URLSearchParams(root.location.hash.slice(1));
      const encoded = params.get('clusterScenario');
      if (!encoded) return null;
      const parsed = JSON.parse(decodeBase64Url(encoded));
      if (![2, 3, 4, 5, 6, 7, Data.VERSION].includes(parsed?.version) || !parsed.scenario) return null;
      const shared = sanitizeScenario({
        ...parsed.scenario,
        id: `shared-${parsed.scenario.id}`,
        custom: true,
        name: {
          en: `${parsed.scenario.name?.en || 'Shared scenario'} (shared)`,
          bg: `${parsed.scenario.name?.bg || parsed.scenario.name?.en || 'Споделен сценарий'} (споделен)`,
        },
      }, Data.DEFAULT_SCENARIOS[0]);
      return shared;
    } catch (error) {
      return null;
    }
  }

  function loadState() {
    let loaded = null;
    try {
      const raw = root.localStorage?.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw);
      if (!loaded) {
        for (const legacy of LEGACY_STORAGE_KEYS) {
          const legacyRaw = root.localStorage?.getItem(legacy.key);
          if (!legacyRaw) continue;
          const parsed = JSON.parse(legacyRaw);
          if (legacy.migrate === 'legacy') loaded = migrateLegacyState(parsed);
          else if (legacy.migrate === 'recalibrate') loaded = recalibrateScenarioSet(parsed);
          else if (legacy.migrate === 'extend') loaded = extendScenarioSet(parsed);
          else loaded = parsed;
          break;
        }
      }
    } catch (error) {
      loaded = null;
    }
    const next = sanitizeState(loaded || Data.createDefaultState());
    const sharedScenario = readSharedScenario();
    if (sharedScenario) {
      const existingIndex = next.scenarios.findIndex((scenario) => scenario.id === sharedScenario.id);
      if (existingIndex >= 0) next.scenarios[existingIndex] = sharedScenario;
      else next.scenarios.push(sharedScenario);
      next.selectedScenarioId = sharedScenario.id;
    }
    return next;
  }

  let state = loadState();

  function persist() {
    try {
      root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Browser persistence is optional; the in-memory model remains usable.
    }
  }

  function notify(type, detail = {}) {
    const event = { type, detail, state: getState() };
    listeners.forEach((listener) => listener(event));
  }

  function pushUndo() {
    undoStack.push(clone(state));
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
  }

  function commit(type, detail) {
    persist();
    notify(type, detail);
  }

  function getState() {
    return state;
  }

  function getSelectedScenario() {
    return state.scenarios.find((scenario) => scenario.id === state.selectedScenarioId) || state.scenarios[0];
  }

  function getSelectedCompany() {
    return state.companies.find((company) => company.id === state.selectedCompanyId) || state.companies[0];
  }

  function getComparisonScenario() {
    return state.scenarios.find((scenario) => scenario.id === state.comparisonScenarioId)
      || state.scenarios.find((scenario) => scenario.id === 'pressure')
      || state.scenarios[0];
  }

  function selectScenario(scenarioId) {
    if (!state.scenarios.some((scenario) => scenario.id === scenarioId)) return false;
    state.selectedScenarioId = scenarioId;
    commit('selection', { scenarioId });
    return true;
  }

  function selectCompany(companyId) {
    if (!state.companies.some((company) => company.id === companyId)) return false;
    state.selectedCompanyId = companyId;
    commit('selection', { companyId });
    return true;
  }

  function selectComparisonScenario(scenarioId) {
    if (!state.scenarios.some((scenario) => scenario.id === scenarioId)) return false;
    state.comparisonScenarioId = scenarioId;
    commit('selection', { comparisonScenarioId: scenarioId });
    return true;
  }

  function selectMetric(metricKey) {
    if (!Data.COMPANY_METRIC_KEYS.includes(metricKey)) return false;
    state.selectedMetricKey = metricKey;
    commit('selection', { metricKey });
    return true;
  }

  function updateScenarioValue(scenarioId, key, score20) {
    if (!Data.SCENARIO_PARAMETER_KEYS.includes(key)) return false;
    const scenario = state.scenarios.find((entry) => entry.id === scenarioId);
    if (!scenario) return false;
    pushUndo();
    scenario.values[key] = Model.fromScore20(score20);
    commit('scenario-update', { scenarioId, key });
    return true;
  }

  function updateScenarioTechnology(scenarioId, key, nextValue) {
    const booleanKeys = ['greenHydrogen', 'electrolyzers', 'ammoniaStorage', 'ccs'];
    const countKeys = ['electrolyzerUnits', 'nuclearReactors'];
    const percentageKeys = ['hydrogenToAmmoniaShare'];
    if (![...booleanKeys, ...countKeys, ...percentageKeys].includes(key)) return false;
    const scenario = state.scenarios.find((entry) => entry.id === scenarioId);
    if (!scenario) return false;
    const technologies = sanitizeTechnologies(scenario.technologies);
    if (countKeys.includes(key)) {
      const maximum = key === 'nuclearReactors'
        ? Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors
        : Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits;
      technologies[key] = Math.max(0, Math.min(
        maximum,
        Math.round(Number(nextValue) || 0)
      ));
    } else if (percentageKeys.includes(key)) {
      technologies[key] = Math.max(0, Math.min(100, Math.round(Number(nextValue) || 0)));
    } else {
      technologies[key] = sanitizeBoolean(nextValue, technologies[key]);
    }
    pushUndo();
    scenario.technologies = technologies;
    commit('technology-update', { scenarioId, key, value: technologies[key] });
    return true;
  }

  function updateCompanyMetric(companyId, metricKey, score20) {
    if (!Data.COMPANY_METRIC_KEYS.includes(metricKey)) return false;
    const index = state.companies.findIndex((company) => company.id === companyId);
    if (index < 0) return false;
    pushUndo();
    state.companies[index] = Model.setCompanyMetricTarget(state.companies[index], metricKey, Model.fromScore20(score20));
    commit('company-update', { companyId, metricKey });
    return true;
  }

  function updateCompanyFactor(companyId, metricKey, factorKey, score20) {
    const index = state.companies.findIndex((company) => company.id === companyId);
    if (index < 0) return false;
    const definition = Model.getMetricDefinition(metricKey);
    if (!definition?.factors.some((factor) => factor.key === factorKey)) return false;
    pushUndo();
    state.companies[index] = Model.setCompanyFactor(
      state.companies[index],
      metricKey,
      factorKey,
      Model.fromScore20(score20)
    );
    commit('factor-update', { companyId, metricKey, factorKey });
    return true;
  }

  function cloneScenario(scenarioId, language = 'en') {
    const source = state.scenarios.find((scenario) => scenario.id === scenarioId);
    if (!source) return null;
    pushUndo();
    const suffix = Date.now().toString(36);
    const copy = sanitizeScenario({
      ...clone(source),
      id: `${source.id}-copy-${suffix}`,
      theme: 'custom',
      custom: true,
      name: {
        en: `${source.name.en} - copy`,
        bg: `${source.name.bg || source.name.en} - копие`,
      },
    }, source);
    state.scenarios.push(copy);
    state.selectedScenarioId = copy.id;
    commit('scenario-clone', { sourceId: scenarioId, scenarioId: copy.id, language });
    return copy;
  }

  function deleteScenario(scenarioId) {
    const scenario = state.scenarios.find((entry) => entry.id === scenarioId);
    if (!scenario?.custom) return false;
    pushUndo();
    state.scenarios = state.scenarios.filter((entry) => entry.id !== scenarioId);
    if (state.selectedScenarioId === scenarioId) state.selectedScenarioId = 'volatile';
    if (state.comparisonScenarioId === scenarioId) state.comparisonScenarioId = 'pressure';
    commit('scenario-delete', { scenarioId });
    return true;
  }

  function resetScenario(scenarioId) {
    const index = state.scenarios.findIndex((scenario) => scenario.id === scenarioId);
    const baseline = Data.DEFAULT_SCENARIOS.find((scenario) => scenario.id === scenarioId);
    if (index < 0 || !baseline) return false;
    pushUndo();
    state.scenarios[index] = sanitizeScenario(baseline, baseline);
    commit('scenario-reset', { scenarioId });
    return true;
  }

  function resetAll() {
    pushUndo();
    const defaults = Data.createDefaultState();
    state = sanitizeState(defaults);
    commit('reset-all');
    return true;
  }

  function undo() {
    if (!undoStack.length) return false;
    state = sanitizeState(undoStack.pop());
    commit('undo');
    return true;
  }

  function canUndo() {
    return undoStack.length > 0;
  }

  function setMonteCarloOptions(nextOptions) {
    state.monteCarlo = {
      uncertainty20: Math.max(0, Math.min(5, Number(nextOptions?.uncertainty20 ?? state.monteCarlo.uncertainty20))),
      iterations: Math.max(100, Math.min(2000, Math.round(Number(nextOptions?.iterations ?? state.monteCarlo.iterations)))),
      seed: Math.round(Number(nextOptions?.seed ?? state.monteCarlo.seed)) || state.monteCarlo.seed,
    };
    commit('monte-carlo-options', state.monteCarlo);
  }

  function exportStateJson() {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: Data.VERSION,
      state,
    }, null, 2);
  }

  function importStateJson(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      const candidate = parsed?.state || parsed;
      if (!candidate || !Array.isArray(candidate.scenarios) || !Array.isArray(candidate.companies)) {
        return { ok: false, error: 'invalid_shape' };
      }
      pushUndo();
      state = sanitizeState(candidate);
      commit('state-import');
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'invalid_json' };
    }
  }

  function getShareUrl(scenarioId = state.selectedScenarioId) {
    const scenario = state.scenarios.find((entry) => entry.id === scenarioId);
    if (!scenario || !root.location?.href) return '';
    const payload = encodeBase64Url(JSON.stringify({ version: Data.VERSION, scenario }));
    const url = new URL(root.location.href);
    const params = new URLSearchParams();
    params.set('clusterScenario', payload);
    url.hash = params.toString();
    return url.toString();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  persist();

  return Object.freeze({
    STORAGE_KEY,
    getState,
    getSelectedScenario,
    getComparisonScenario,
    getSelectedCompany,
    selectScenario,
    selectComparisonScenario,
    selectCompany,
    selectMetric,
    updateScenarioValue,
    updateScenarioTechnology,
    updateCompanyMetric,
    updateCompanyFactor,
    cloneScenario,
    deleteScenario,
    resetScenario,
    resetAll,
    undo,
    canUndo,
    setMonteCarloOptions,
    exportStateJson,
    importStateJson,
    getShareUrl,
    subscribe,
  });
});
