(function initClusterAnalysis(root) {
  'use strict';

  const Data = root.ClusterData;
  const Model = root.ClusterModel;
  const Simulation = root.ClusterSimulation;
  const I18n = root.ClusterI18n;
  const Charts = root.ClusterCharts;

  if (!Data || !Model || !Simulation || !I18n || !Charts) {
    throw new Error('Cluster Analysis dependencies are not loaded.');
  }

  const MAIN_TABS = ['scenarios', 'markets', 'sectors', 'companies', 'network', 'methodology', 'metrics', 'decisions', 'simulation'];
  const EXPLORER_TABS = ['phase', 'frontier', 'network', 'heatmap', 'data'];
  const OUTCOME_KEYS = ['depth', 'retention', 'continuity', 'balance'];
  let activeMainTab = 'scenarios';
  let activeExplorerTab = 'phase';
  let trajectoryMode = 'scenarios';
  let selectedSectorPathwayId = 'refining';
  let companySearch = '';
  let companyRegionFilter = 'all';
  let companyActivityFilter = 'all';
  const registryCopy = (en, bg) => language() === 'bg' ? bg : en;
  let monteCarloCache = null;
  let toastTimer = null;

  function escapeHtml(value) {
    if (typeof root.escapeHtml === 'function') return root.escapeHtml(value);
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function language() {
    return I18n.getLanguage();
  }

  function t(key, variables = {}) {
    return I18n.t(key, variables, language());
  }

  function localize(value) {
    return I18n.localize(value, language());
  }

  function formatScore(value, decimals = 1) {
    return Model.toScore20(value).toFixed(decimals);
  }

  function formatNumber(value, decimals = 1) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return t('general.notAvailable');
    return new Intl.NumberFormat(language() === 'bg' ? 'bg-BG' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numeric);
  }

  function formatSignedPercent(value, decimals = 1) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return t('general.notAvailable');
    const percent = numeric * 100;
    return `${percent > 0 ? '+' : ''}${formatNumber(percent, decimals)}%`;
  }

  function safeExternalUrl(value) {
    try {
      const parsed = new URL(String(value || ''), root.location?.href || 'http://localhost/');
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
    } catch (error) {
      return '';
    }
  }

  function scoreTone(value) {
    if (value >= 0.75) return 'score-high';
    if (value >= 0.55) return 'score-mid';
    if (value >= 0.35) return 'score-low';
    return 'score-weak';
  }

  function scoreMarkup(value, label = '', compact = false) {
    const score = Model.clamp01(value);
    return `
      <div class="cluster-score ${scoreTone(score)} ${compact ? 'compact' : ''}">
        ${label ? `<span>${escapeHtml(label)}</span>` : ''}
        <strong>${formatScore(score)}</strong>
        <div class="cluster-score-track" aria-hidden="true"><i style="width:${(score * 100).toFixed(1)}%"></i></div>
      </div>
    `;
  }

  function confidenceLabel(confidenceUnit) {
    if (confidenceUnit >= 0.70) return t('metrics.highConfidence');
    if (confidenceUnit >= 0.45) return t('metrics.mediumConfidence');
    return t('metrics.lowConfidence');
  }

  function getPathways() {
    return Array.isArray(root.NZL_ROI_PATHWAYS) ? root.NZL_ROI_PATHWAYS : [];
  }

  function getState() {
    return Simulation.getState();
  }

  function getSelectedScenario() {
    return Simulation.getSelectedScenario();
  }

  function getSelectedCompany() {
    return Simulation.getSelectedCompany();
  }

  function ensureMainTabs() {
    const sectionDesc = root.document.querySelector('#section-cluster .section-desc');
    if (!sectionDesc?.parentElement) return;
    let host = root.document.getElementById('clusterMainTabs');
    if (!host) {
      host = root.document.createElement('div');
      host.id = 'clusterMainTabs';
      host.className = 'cluster-main-tabs';
      host.setAttribute('role', 'tablist');
      host.setAttribute('aria-label', t('section.cluster.title'));
      sectionDesc.insertAdjacentElement('afterend', host);
    }
    host.innerHTML = MAIN_TABS.map((tabId) => `
      <button
        type="button"
        class="cluster-main-tab ${activeMainTab === tabId ? 'active' : ''}"
        role="tab"
        aria-selected="${activeMainTab === tabId}"
        aria-controls="clusterScenarioGrid"
        data-cluster-action="main-tab"
        data-tab="${tabId}"
      >${escapeHtml(t(`tabs.${tabId}`))}</button>
    `).join('');
  }

  function updateSectionMeta() {
    const title = root.document.getElementById('clusterMatrixTitle');
    const desc = root.document.getElementById('clusterMatrixDesc');
    const note = root.document.getElementById('clusterScenarioNote');
    if (title) title.textContent = t(`meta.${activeMainTab}.title`);
    if (desc) desc.textContent = t(`meta.${activeMainTab}.desc`);
    if (note) note.textContent = t(`meta.${activeMainTab}.note`);
  }

  function outcomeKpis(outcome) {
    return `
      <div class="cluster-kpi-strip">
        ${OUTCOME_KEYS.map((key) => `
          <div class="cluster-kpi">
            <span>${escapeHtml(t(`outcome.${key}`))}</span>
            <strong class="${scoreTone(outcome[key])}">${formatScore(outcome[key])}</strong>
            <div class="cluster-score-track ${scoreTone(outcome[key])}" aria-hidden="true"><i style="width:${(outcome[key] * 100).toFixed(1)}%"></i></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderScenarioComparison(state, selectedOutcome) {
    const baseline = Simulation.getComparisonScenario();
    const baselineOutcome = Model.getScenarioOutcome(baseline, state.companies);
    return `
      <div class="cluster-comparison-band">
        <label class="cluster-field">
          <span>${escapeHtml(t('scenario.compareWith'))}</span>
          <select data-cluster-change="comparison-scenario">
            ${state.scenarios.map((scenario) => `<option value="${escapeHtml(scenario.id)}" ${scenario.id === baseline.id ? 'selected' : ''}>${escapeHtml(Model.getScenarioName(scenario, language()))}</option>`).join('')}
          </select>
        </label>
        <div class="cluster-comparison-values" aria-label="${escapeHtml(t('scenario.comparisonTitle'))}">
          ${OUTCOME_KEYS.map((key) => {
            const safeDelta = (selectedOutcome[key] - baselineOutcome[key]) * 20;
            return `<div><span>${escapeHtml(t(`outcome.${key}`))}</span><strong class="${safeDelta > 0.05 ? 'score-high' : safeDelta < -0.05 ? 'score-weak' : ''}">${safeDelta > 0 ? '+' : ''}${safeDelta.toFixed(1)}</strong></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderScenarioRoster(state, selectedScenario) {
    return `
      <section class="cluster-panel cluster-roster-panel" aria-labelledby="clusterRosterTitle">
        <div class="cluster-panel-head">
          <div>
            <h3 id="clusterRosterTitle">${escapeHtml(t('scenario.rosterTitle'))}</h3>
            <p>${escapeHtml(t('scenario.rosterDesc'))}</p>
          </div>
        </div>
        <ul class="cluster-roster-list">
          ${state.scenarios.map((scenario) => {
            const selected = scenario.id === selectedScenario.id;
            return `
              <li class="cluster-roster-item">
              <button
                type="button"
                class="cluster-roster-row theme-${escapeHtml(scenario.theme)} ${selected ? 'active' : ''}"
                data-cluster-action="select-scenario"
                data-scenario-id="${escapeHtml(scenario.id)}"
                aria-pressed="${selected}"
              >
                <span class="cluster-roster-name">
                  <strong>${escapeHtml(Model.getScenarioName(scenario, language()))}</strong>
                  <small>${escapeHtml(localize(scenario.role))}</small>
                </span>
              </button>
              </li>
            `;
          }).join('')}
        </ul>
      </section>
    `;
  }

  function renderScenarioBasis(scenario) {
    const evidence = (scenario.evidence || []).map((item) => ({
      ...item,
      safeUrl: safeExternalUrl(item.url),
    })).filter((item) => item.safeUrl);
    return `
      <div class="cluster-scenario-basis">
        <div class="cluster-scenario-basis-copy">
          <span>${escapeHtml(t('scenario.realWorldBasis'))}</span>
          <strong>${escapeHtml(localize(scenario.basis))}</strong>
        </div>
        <div class="cluster-scenario-focus">
          <span>${escapeHtml(t('scenario.distinctiveAssumptions'))}</span>
          <div>${(scenario.focus || []).map((item) => `<strong>${escapeHtml(localize(item))}</strong>`).join('')}</div>
        </div>
        <div class="cluster-scenario-evidence">
          <span>${escapeHtml(t('scenario.evidenceBase'))}</span>
          <div>${evidence.length ? evidence.map((item) => `<a href="${escapeHtml(item.safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(localize(item.name))}</a>`).join('') : `<strong>${escapeHtml(t('general.notAvailable'))}</strong>`}</div>
        </div>
      </div>
      <p class="cluster-scenario-calibration-note">${escapeHtml(t('scenario.calibrationNote'))}</p>
    `;
  }

  function renderScenarioGroups(scenario) {
    const groups = Model.getScenarioGroupScores(scenario);
    return `
      <section class="cluster-panel" aria-labelledby="clusterGroupTitle">
        <div class="cluster-panel-head compact">
          <h3 id="clusterGroupTitle">${escapeHtml(t('scenario.groups'))}</h3>
        </div>
        <div class="cluster-group-grid">
          ${Data.SCENARIO_GROUPS.map((group) => `
            <div class="cluster-metric-card">
              ${scoreMarkup(groups[group.id], t(`group.${group.id}`))}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderScenarioInputTable(scenario) {
    return `
      <section class="cluster-panel" aria-labelledby="clusterInputTitle">
        <div class="cluster-panel-head compact">
          <h3 id="clusterInputTitle">${escapeHtml(t('scenario.inputs'))}</h3>
        </div>
        <div class="cluster-table-wrap">
          <table class="cluster-table">
            <caption class="sr-only">${escapeHtml(t('scenario.inputs'))}</caption>
            <thead><tr>
              <th scope="col">${escapeHtml(t('general.parameter'))}</th>
              <th scope="col">${escapeHtml(t('general.score'))}</th>
              <th scope="col">${escapeHtml(t('general.scale'))}</th>
            </tr></thead>
            <tbody>
              ${Data.SCENARIO_GROUPS.map((group) => `
                <tr class="cluster-table-group"><th colspan="3" scope="rowgroup">${escapeHtml(t(`group.${group.id}`))}</th></tr>
                ${group.keys.map((key) => {
                  const value = Model.getScenarioValue(scenario, key);
                  return `
                    <tr>
                      <th scope="row">${escapeHtml(t(`parameter.${key}`))}</th>
                      <td><strong class="${scoreTone(value)}">${formatScore(value)}</strong></td>
                      <td>${scoreMarkup(value, '', true)}</td>
                    </tr>
                  `;
                }).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderSystemMatrix() {
    return `
      <section class="cluster-panel" aria-labelledby="clusterSystemMatrixTitle">
        <div class="cluster-panel-head">
          <div>
            <h3 id="clusterSystemMatrixTitle">${escapeHtml(t('scenario.systemMatrix'))}</h3>
            <p>${escapeHtml(t('scenario.systemMatrixDesc'))}</p>
          </div>
        </div>
        <div class="cluster-table-wrap">
          <table class="cluster-table cluster-system-matrix">
            <caption class="sr-only">${escapeHtml(t('scenario.systemMatrix'))}</caption>
            <thead><tr>
              <th scope="col">${escapeHtml(t('general.parameter'))}</th>
              ${Data.SYSTEM_EFFECT_AXES.map((axis) => `<th scope="col">${escapeHtml(t(`axis.${axis}`))}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${Data.SCENARIO_PARAMETER_KEYS.map((key) => `
                <tr>
                  <th scope="row">${escapeHtml(t(`parameter.${key}`))}</th>
                  ${(Data.SYSTEM_EFFECT_MATRIX[key] || []).map((value) => `<td><span class="matrix-level level-${value}">${value}</span></td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderExplorerData(rows) {
    return `
      <div class="cluster-table-wrap">
        <table class="cluster-table">
          <caption class="sr-only">${escapeHtml(t('explorer.data'))}</caption>
          <thead><tr>
            <th scope="col">${escapeHtml(t('general.company'))}</th>
            <th scope="col">${escapeHtml(t('general.cluster'))}</th>
            <th scope="col">${escapeHtml(t('outcome.business'))}</th>
            <th scope="col">${escapeHtml(t('outcome.technology'))}</th>
            <th scope="col">${escapeHtml(t('outcome.execution'))}</th>
            <th scope="col">${escapeHtml(t('outcome.depth'))}</th>
            <th scope="col">${escapeHtml(t('outcome.retention'))}</th>
            <th scope="col">${escapeHtml(t('outcome.balance'))}</th>
          </tr></thead>
          <tbody>${rows.map((row) => `
            <tr>
              <th scope="row">${escapeHtml(row.company)}</th>
              <td>${escapeHtml(row.cluster)}</td>
              <td>${formatScore(row.B_eff)}</td>
              <td>${formatScore(row.T_eff)}</td>
              <td>${formatScore(row.M_eff)}</td>
              <td>${formatScore(row.decarbonisationDepth)}</td>
              <td>${formatScore(row.competitivenessRetention)}</td>
              <td><strong>${formatScore(row.transitionBalance)}</strong></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function renderScenarioExplorer(scenario, state) {
    const rows = Model.applyScenarioToCompanies(state.companies, scenario);
    return `
      <section class="cluster-panel" aria-labelledby="clusterExplorerTitle">
        <div class="cluster-panel-head">
          <div>
            <h3 id="clusterExplorerTitle">${escapeHtml(t('scenario.explorerTitle'))}</h3>
            <p>${escapeHtml(t('scenario.explorerDesc'))}</p>
          </div>
        </div>
        <div class="cluster-subtabs" role="tablist" aria-label="${escapeHtml(t('scenario.explorerTitle'))}">
          ${EXPLORER_TABS.map((tabId) => `
            <button
              type="button"
              role="tab"
              aria-selected="${activeExplorerTab === tabId}"
              class="cluster-subtab ${activeExplorerTab === tabId ? 'active' : ''}"
              data-cluster-action="explorer-tab"
              data-tab="${tabId}"
            >${escapeHtml(t(`explorer.${tabId}`))}</button>
          `).join('')}
        </div>
        ${activeExplorerTab === 'data'
          ? renderExplorerData(rows)
          : `<div class="cluster-chart" id="clusterExplorerChart" role="img" aria-label="${escapeHtml(t(`explorer.${activeExplorerTab}`))}"></div>`}
      </section>
    `;
  }

  function renderTechnologyToggle(scenario, key, titleKey, descriptionKey, contribution) {
    const enabled = Boolean(scenario.technologies?.[key]);
    const stateLabel = enabled
      ? `${t('trajectory.enabled')} · +${(Number(contribution || 0) * 100).toFixed(1)} ${t('trajectory.ppShort')}`
      : t('trajectory.disabled');
    return `
      <label class="cluster-tech-toggle ${enabled ? 'active' : ''}">
        <input
          type="checkbox"
          data-cluster-change="technology-toggle"
          data-scenario-id="${escapeHtml(scenario.id)}"
          data-key="${key}"
          ${enabled ? 'checked' : ''}
        >
        <span class="cluster-switch" aria-hidden="true"><i></i></span>
        <span class="cluster-tech-copy">
          <strong>${escapeHtml(t(titleKey))}</strong>
          <small>${escapeHtml(t(descriptionKey))}</small>
        </span>
        <span class="cluster-tech-state">${escapeHtml(stateLabel)}</span>
      </label>
    `;
  }

  function renderTechnologyControls(scenario, trajectory) {
    const technologies = Model.getTechnologyPortfolio(scenario);
    const reactors = technologies.nuclearReactors;
    const electrolyzerUnits = technologies.electrolyzerUnits;
    const reactorDecrementDisabled = reactors <= 0 ? 'disabled' : '';
    const reactorIncrementDisabled = reactors >= Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors ? 'disabled' : '';
    const electrolyzerDecrementDisabled = electrolyzerUnits <= 0 ? 'disabled' : '';
    const electrolyzerIncrementDisabled = electrolyzerUnits >= Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits ? 'disabled' : '';
    return `
      <div class="cluster-technology-controls" aria-labelledby="clusterTechnologyTitle">
        <div class="cluster-technology-heading">
          <div>
            <h4 id="clusterTechnologyTitle">${escapeHtml(t('trajectory.technologyTitle'))}</h4>
            <p>${escapeHtml(t('trajectory.technologyDesc'))}</p>
          </div>
          <span>${escapeHtml(Model.getScenarioName(scenario, language()))}</span>
        </div>
        <div class="cluster-technology-grid">
          ${renderTechnologyToggle(scenario, 'greenHydrogen', 'trajectory.greenHydrogen', 'trajectory.greenHydrogenDesc', trajectory.aggregate.contributions2050.greenHydrogen)}
          ${renderTechnologyToggle(scenario, 'electrolyzers', 'trajectory.electrolyzers', 'trajectory.electrolyzersDesc', trajectory.aggregate.contributions2050.electrolyzers)}
          ${renderTechnologyToggle(scenario, 'ammoniaStorage', 'trajectory.ammoniaStorage', 'trajectory.ammoniaStorageDesc', trajectory.aggregate.contributions2050.ammonia)}
          <div class="cluster-capacity-control ${trajectory.electrolyzerCapacityMW > 0 ? 'active' : ''}">
            <div class="cluster-tech-copy">
              <strong>${escapeHtml(t('trajectory.electrolyzerUnits'))}</strong>
              <small>${escapeHtml(t('trajectory.electrolyzerUnitsDesc', { unit: Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW }))}</small>
            </div>
            <div class="cluster-capacity-stepper">
              <button type="button" title="${escapeHtml(t('trajectory.decreaseElectrolyzers'))}" aria-label="${escapeHtml(t('trajectory.decreaseElectrolyzers'))}" data-cluster-action="electrolyzer-step" data-delta="-1" ${electrolyzerDecrementDisabled}>-</button>
              <input
                type="number" min="0" max="${Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits}" step="1"
                value="${electrolyzerUnits}"
                aria-label="${escapeHtml(t('trajectory.electrolyzerUnits'))}"
                data-cluster-change="electrolyzer-units"
                data-scenario-id="${escapeHtml(scenario.id)}"
              >
              <button type="button" title="${escapeHtml(t('trajectory.increaseElectrolyzers'))}" aria-label="${escapeHtml(t('trajectory.increaseElectrolyzers'))}" data-cluster-action="electrolyzer-step" data-delta="1" ${electrolyzerIncrementDisabled}>+</button>
            </div>
            <span class="cluster-capacity-output">${formatNumber(trajectory.electrolyzerNameplateMW, 0)} MW ${escapeHtml(t('trajectory.nameplateShort'))} · ${formatNumber(trajectory.electrolyzerHydrogenKt, 1)} kt H2/${escapeHtml(t('general.yearShort'))} · ${formatNumber(trajectory.electrolyzerElectricityTWh, 2)} TWh/${escapeHtml(t('general.yearShort'))} · +${(trajectory.aggregate.contributions2050.electrolyzers * 100).toFixed(1)} ${escapeHtml(t('trajectory.ppShort'))}</span>
          </div>
          ${renderTechnologyToggle(scenario, 'ccs', 'trajectory.ccs', 'trajectory.ccsDesc', trajectory.aggregate.contributions2050.ccs)}
          <div class="cluster-capacity-control ${reactors > 0 ? 'active' : ''}">
            <div class="cluster-tech-copy">
              <strong>${escapeHtml(t('trajectory.nuclear'))}</strong>
              <small>${escapeHtml(t('trajectory.nuclearDesc'))}</small>
            </div>
            <div class="cluster-capacity-stepper">
              <button type="button" title="${escapeHtml(t('trajectory.decreaseReactors'))}" aria-label="${escapeHtml(t('trajectory.decreaseReactors'))}" data-cluster-action="nuclear-step" data-delta="-1" ${reactorDecrementDisabled}>-</button>
              <input
                type="number" min="0" max="${Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors}" step="1"
                value="${reactors}"
                aria-label="${escapeHtml(t('trajectory.reactorCount'))}"
                data-cluster-change="nuclear-reactors"
                data-scenario-id="${escapeHtml(scenario.id)}"
              >
              <button type="button" title="${escapeHtml(t('trajectory.increaseReactors'))}" aria-label="${escapeHtml(t('trajectory.increaseReactors'))}" data-cluster-action="nuclear-step" data-delta="1" ${reactorIncrementDisabled}>+</button>
            </div>
            <span class="cluster-capacity-output">${formatNumber(trajectory.nuclearCapacityMW, 0)} MW · ${formatNumber(trajectory.nuclearGenerationTWh, 1)} TWh/${escapeHtml(t('general.yearShort'))} · +${(trajectory.aggregate.contributions2050.nuclear * 100).toFixed(1)} ${escapeHtml(t('trajectory.ppShort'))}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderTransitionDynamics(trajectory) {
    const type = trajectory.transitionDynamics?.type;
    if (!['front_loaded_plateau', 'deindustrialisation'].includes(type)) return '';
    const point2030 = trajectory.aggregate.points.find((point) => point.year === 2030);
    const isShutdown = type === 'deindustrialisation';
    const metrics = isShutdown
      ? [
        ['trajectory.technicalReduction2050', trajectory.aggregate.technicalReduction2050],
        ['trajectory.closureDriven2050', trajectory.aggregate.closureDrivenReduction2050],
        ['trajectory.industryOperating2050', trajectory.aggregate.industrialActivity2050],
      ]
      : [
        ['trajectory.reduction2030', point2030?.reduction || 0],
        ['trajectory.reduction2050', trajectory.aggregate.target2050],
        ['trajectory.industryOperating2050', trajectory.aggregate.industrialActivity2050],
      ];
    return `
      <div class="cluster-transition-dynamics ${isShutdown ? 'danger' : 'warning'}" role="note">
        <div class="cluster-transition-dynamics-copy">
          <strong>${escapeHtml(t(isShutdown ? 'trajectory.deindustrialisationTitle' : 'trajectory.frontLoadedTitle'))}</strong>
          <p>${escapeHtml(t(isShutdown ? 'trajectory.deindustrialisationNote' : 'trajectory.frontLoadedNote'))}</p>
        </div>
        <div class="cluster-transition-dynamics-metrics">
          ${metrics.map(([label, value]) => `<div><span>${escapeHtml(t(label))}</span><strong>${formatNumber(value * 100, 1)}%</strong></div>`).join('')}
        </div>
      </div>
    `;
  }

  function renderTrajectoryPanel(state, scenario, trajectory) {
    return `
      <section class="cluster-panel cluster-trajectory-panel" aria-labelledby="clusterTrajectoryTitle">
        <div class="cluster-panel-head cluster-toolbar-head">
          <div>
            <h3 id="clusterTrajectoryTitle">${escapeHtml(t('scenario.trajectoryTitle'))}</h3>
            <p>${escapeHtml(t('scenario.trajectoryDesc'))}</p>
          </div>
          <span class="cluster-badge success">${escapeHtml(t('scenario.trajectoryConnected'))}</span>
        </div>
        <div class="cluster-trajectory-toolbar">
          <div class="cluster-segmented" role="tablist" aria-label="${escapeHtml(t('trajectory.viewMode'))}">
            ${['scenarios', 'companies'].map((mode) => `<button type="button" role="tab" aria-selected="${trajectoryMode === mode}" class="${trajectoryMode === mode ? 'active' : ''}" data-cluster-action="trajectory-mode" data-mode="${mode}">${escapeHtml(t(`trajectory.mode.${mode}`))}</button>`).join('')}
          </div>
          ${trajectoryMode === 'companies' ? `
            <label class="cluster-field compact-field">
              <span>${escapeHtml(t('trajectory.highlightCompany'))}</span>
              <select data-cluster-change="select-company">${state.companies.map((company) => `<option value="${escapeHtml(company.id)}" ${company.id === state.selectedCompanyId ? 'selected' : ''}>${escapeHtml(company.company)}</option>`).join('')}</select>
            </label>
          ` : ''}
        </div>
        ${renderTechnologyControls(scenario, trajectory)}
        <div class="cluster-trajectory-kpis">
          <div><span>${escapeHtml(t('trajectory.reduction2050'))}</span><strong>${(trajectory.aggregate.target2050 * 100).toFixed(1)}%</strong></div>
          <div><span>${escapeHtml(t('trajectory.avoided2050'))}</span><strong>${formatNumber(trajectory.aggregate.avoidedEmissions2050Kt, 0)} kt</strong></div>
          <div><span>${escapeHtml(t('trajectory.residual2050'))}</span><strong>${formatNumber(trajectory.aggregate.residualEmissions2050Kt, 0)} kt</strong></div>
          <div><span>${escapeHtml(t('trajectory.electrolyzerCapacity'))}</span><strong>${formatNumber(trajectory.electrolyzerCapacityMW, 0)} MW</strong></div>
          <div><span>${escapeHtml(t('trajectory.nuclearCapacity'))}</span><strong>${formatNumber(trajectory.nuclearCapacityMW, 0)} MW</strong></div>
        </div>
        ${renderTransitionDynamics(trajectory)}
        <div class="cluster-chart" id="clusterTrajectoryChart" role="img" aria-label="${escapeHtml(t(trajectoryMode === 'scenarios' ? 'trajectory.interactiveLabel' : 'scenario.trajectoryTitle'))}"></div>
        <p class="cluster-trajectory-note">${escapeHtml(t('trajectory.screeningNote', {
          electrolyzerUnit: Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW,
          electrolyzerFactor: Math.round(Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor * 100),
          solarFactor: Math.round(Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor * 100),
          electrolyzerEnergy: Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSystemKWhPerKg,
          electrolyzerYear: Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerFirstOnlineYear,
          ammoniaYear: Data.TECHNOLOGY_ASSUMPTIONS.ammoniaFirstOnlineYear,
          nuclearUnit: Data.TECHNOLOGY_ASSUMPTIONS.nuclearUnitMW,
          nuclearFactor: Math.round(Data.TECHNOLOGY_ASSUMPTIONS.nuclearCapacityFactor * 100),
          nuclearYear: Data.TECHNOLOGY_ASSUMPTIONS.nuclearFirstOnlineYear,
        }))}</p>
      </section>
    `;
  }

  function renderScenarios(state) {
    const scenario = getSelectedScenario();
    const outcome = Model.getScenarioOutcome(scenario, state.companies);
    const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);
    const summaryKey = Data.DEFAULT_SCENARIOS.some((entry) => entry.theme === scenario.theme) ? scenario.theme : 'custom';
    return `
      <div class="cluster-view cluster-scenarios-view">
        <div class="cluster-scenario-top">
          ${renderScenarioRoster(state, scenario)}
          <section class="cluster-panel cluster-selected-panel theme-${escapeHtml(scenario.theme)}" aria-labelledby="clusterSelectedTitle">
            <div class="cluster-selected-head">
              <div>
                <span class="cluster-kicker">${escapeHtml(t('scenario.selected'))}</span>
                <h2 id="clusterSelectedTitle">${escapeHtml(Model.getScenarioName(scenario, language()))}</h2>
                <p>${escapeHtml(localize(scenario.description) || t(`scenario.summary.${summaryKey}`))}</p>
              </div>
              <div class="cluster-balance-score ${scoreTone(outcome.balance)}">
                <span>${escapeHtml(t('outcome.balance'))}</span>
                <strong>${formatScore(outcome.balance)}</strong>
              </div>
            </div>
            ${outcomeKpis(outcome)}
            ${renderScenarioBasis(scenario)}
            ${renderScenarioComparison(state, outcome)}
          </section>
        </div>

        ${renderTrajectoryPanel(state, scenario, trajectory)}

        ${renderScenarioGroups(scenario)}
        <div class="cluster-two-column">
          ${renderScenarioInputTable(scenario)}
          ${renderSystemMatrix()}
        </div>
        ${renderScenarioExplorer(scenario, state)}
      </div>
    `;
  }

  function renderMarkets(state) {
    const scenario = getSelectedScenario();
    const assessment = Model.getGreenMarketAssessment(scenario, state.companies);
    const configuredAmmoniaShare = assessment.technologies.hydrogenToAmmoniaShare;
    const effectiveAmmoniaPercent = assessment.hydrogenKt > 0
      ? assessment.hydrogenForAmmoniaKt / assessment.hydrogenKt * 100
      : 0;
    const effectiveFuelPercent = assessment.hydrogenKt > 0
      ? assessment.hydrogenForFuelKt / assessment.hydrogenKt * 100
      : 0;
    const marketableGreenAmmoniaKt = assessment.greenAmmoniaKt * assessment.marketReadiness;
    const marketBadge = assessment.electrolyzerScore >= 0.70 ? 'success' : assessment.electrolyzerScore >= 0.50 ? 'warning' : 'neutral';
    const unitsAtAllocation = assessment.unitsForCurrentAllocation === null
      ? t('general.notAvailable')
      : formatNumber(assessment.unitsForCurrentAllocation, 0);
    const solarAtAllocation = assessment.solarPVForCurrentAllocationPortfolioMW === null
      ? t('general.notAvailable')
      : formatNumber(assessment.solarPVForCurrentAllocationPortfolioMW, 0);
    const productRows = [
      {
        name: t('market.greenAmmonia'),
        output: assessment.greenAmmoniaKt,
        share: assessment.greenAmmoniaShare,
        marketable: marketableGreenAmmoniaKt,
      },
      {
        name: t('market.greenFertilizers'),
        output: assessment.greenFertilizerKt,
        share: assessment.greenAmmoniaShare,
        marketable: assessment.marketableGreenFertilizerKt,
      },
    ];

    return `
      <div class="cluster-view cluster-markets-view">
        <section class="cluster-panel" aria-labelledby="clusterMarketsTitle">
          <div class="cluster-panel-head cluster-toolbar-head">
            <div>
              <h3 id="clusterMarketsTitle">${escapeHtml(t('market.title'))}</h3>
              <p>${escapeHtml(t('market.desc'))}</p>
            </div>
            <span class="cluster-badge ${marketBadge}">${escapeHtml(Model.getScenarioName(scenario, language()))}</span>
          </div>
          <div class="cluster-market-kpis">
            <div><span>${escapeHtml(t('market.electrolyzerScore'))}</span><strong>${formatScore(assessment.electrolyzerScore)} / 20</strong></div>
            <div><span>${escapeHtml(t('market.hydrogenOutput'))}</span><strong>${formatNumber(assessment.hydrogenKt, 1)} kt/${escapeHtml(t('general.yearShort'))}</strong></div>
            <div><span>${escapeHtml(t('market.greenAmmoniaShare'))}</span><strong>${(assessment.greenAmmoniaShare * 100).toFixed(1)}%</strong></div>
            <div><span>${escapeHtml(t('market.marketableGreenShare'))}</span><strong>${(assessment.marketableGreenShare * 100).toFixed(1)}%</strong></div>
            <div><span>${escapeHtml(t('market.hydrogenFuelShare'))}</span><strong>${(assessment.hydrogenFuelShare * 100).toFixed(1)}%</strong></div>
          </div>
        </section>

        <div class="cluster-market-columns">
          <section class="cluster-panel" aria-labelledby="clusterNeochimAnchorTitle">
            <div class="cluster-panel-head cluster-market-score-head">
              <div>
                <h3 id="clusterNeochimAnchorTitle">${escapeHtml(t('market.neochimTitle'))}</h3>
                <p>${escapeHtml(t('market.neochimDesc'))}</p>
              </div>
              <div class="cluster-market-score ${scoreTone(assessment.neochimAnchorScore)}">
                <span>${escapeHtml(t('market.anchorScore'))}</span>
                <strong>${formatScore(assessment.neochimAnchorScore)}</strong>
              </div>
            </div>
            <div class="cluster-market-facts">
              <div><span>${escapeHtml(t('market.currentAmmonia'))}</span><strong>${formatNumber(assessment.ammoniaProductionKt, 1)} kt/${escapeHtml(t('general.yearShort'))}</strong></div>
              <div><span>${escapeHtml(t('market.ammoniaCapacity'))}</span><strong>${formatNumber(assessment.ammoniaCapacityKt, 1)} kt/${escapeHtml(t('general.yearShort'))}</strong></div>
              <div><span>${escapeHtml(t('market.fertilizerSales'))}</span><strong>${formatNumber(assessment.fertilizerSalesKt, 1)} kt/${escapeHtml(t('general.yearShort'))}</strong></div>
              <div><span>${escapeHtml(t('market.euAddressableSales'))}</span><strong>${(assessment.euAddressableSalesShare * 100).toFixed(1)}%</strong></div>
            </div>
            <div class="cluster-market-progress-list">
              <div>
                <span><b>${escapeHtml(t('market.physicalGreenShare'))}</b><strong>${(assessment.greenAmmoniaShare * 100).toFixed(1)}%</strong></span>
                <div class="cluster-market-progress"><i style="width:${(assessment.greenAmmoniaShare * 100).toFixed(1)}%"></i></div>
              </div>
              <div>
                <span><b>${escapeHtml(t('market.marketReadyShare'))}</b><strong>${(assessment.marketableGreenShare * 100).toFixed(1)}%</strong></span>
                <div class="cluster-market-progress market"><i style="width:${(assessment.marketableGreenShare * 100).toFixed(1)}%"></i></div>
              </div>
              <div>
                <span><b>${escapeHtml(t('market.fertilizerProcessReadiness'))}</b><strong>${formatScore(assessment.fertilizerProcessReadiness)} / 20</strong></span>
                <div class="cluster-market-progress process"><i style="width:${(assessment.fertilizerProcessReadiness * 100).toFixed(1)}%"></i></div>
              </div>
            </div>
            <p class="cluster-market-source">${escapeHtml(t('market.sourceNote'))}</p>
          </section>

          <section class="cluster-panel" aria-labelledby="clusterElectrolyzerCaseTitle">
            <div class="cluster-panel-head cluster-market-score-head">
              <div>
                <h3 id="clusterElectrolyzerCaseTitle">${escapeHtml(t('market.electrolyzerTitle'))}</h3>
                <p>${escapeHtml(t('market.electrolyzerDesc'))}</p>
              </div>
              <div class="cluster-market-score ${scoreTone(assessment.electrolyzerScore)}">
                <span>${escapeHtml(t('market.caseScore'))}</span>
                <strong>${formatScore(assessment.electrolyzerScore)}</strong>
              </div>
            </div>
            <div class="cluster-market-facts">
              <div><span>${escapeHtml(t('market.selectedPortfolio'))}</span><strong>${assessment.technologies.electrolyzerUnits} × ${Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW} MW</strong></div>
              <div><span>${escapeHtml(t('market.firmedOutput'))}</span><strong>${formatNumber(assessment.hydrogenKt, 1)} kt H2</strong></div>
              <div><span>${escapeHtml(t('market.solarOnlyOutput'))}</span><strong>${formatNumber(assessment.solarOnlyHydrogenKt, 1)} kt H2</strong></div>
              <div><span>${escapeHtml(t('market.solarRequired'))}</span><strong>${formatNumber(assessment.solarPVRequiredMW, 0)} MWp</strong></div>
            </div>
            <div class="cluster-market-benchmark">
              <strong>${escapeHtml(t('market.neochimBenchmark'))}</strong>
              <span>${escapeHtml(t('market.benchmarkDetail', {
                hydrogen: formatNumber(assessment.hydrogenNeededForCurrentAmmoniaKt, 1),
                fullUnits: assessment.unitsForCurrentAmmoniaAtFullAllocation,
                fullSolar: formatNumber(assessment.solarPVForFullAllocationPortfolioMW, 0),
                allocationUnits: unitsAtAllocation,
                allocationSolar: solarAtAllocation,
              }))}</span>
            </div>
            <p class="cluster-market-source">${escapeHtml(t('market.solarNote', {
              solarFactor: Math.round(Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor * 100),
              firmedFactor: Math.round(Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor * 100),
              low: formatNumber(assessment.solarOnlyUnitHydrogenKt, 2),
              high: formatNumber(assessment.firmedUnitHydrogenKt, 2),
            }))}</p>
          </section>
        </div>

        <section class="cluster-panel" aria-labelledby="clusterHydrogenAllocationTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterHydrogenAllocationTitle">${escapeHtml(t('market.allocationTitle'))}</h3>
              <p>${escapeHtml(t('market.allocationDesc'))}</p>
            </div>
          </div>
          <div class="cluster-allocation-control">
            <label>
              <span>${escapeHtml(t('market.configuredShare'))}</span>
              <strong>${configuredAmmoniaShare}%</strong>
              <input
                type="range" min="0" max="100" step="5" value="${configuredAmmoniaShare}"
                aria-label="${escapeHtml(t('market.configuredShare'))}"
                data-cluster-change="hydrogen-ammonia-share"
                data-scenario-id="${escapeHtml(scenario.id)}"
              >
            </label>
            <div class="cluster-allocation-bar" aria-label="${escapeHtml(t('market.allocationTitle'))}">
              <span class="ammonia" style="width:${effectiveAmmoniaPercent.toFixed(1)}%"><i>NH3 ${effectiveAmmoniaPercent.toFixed(0)}%</i></span>
              <span class="fuel" style="width:${effectiveFuelPercent.toFixed(1)}%"><i>H2 ${effectiveFuelPercent.toFixed(0)}%</i></span>
            </div>
            <div class="cluster-allocation-outputs">
              <div><span>${escapeHtml(t('market.hydrogenForAmmonia'))}</span><strong>${formatNumber(assessment.hydrogenForAmmoniaKt, 1)} kt H2</strong></div>
              <div><span>${escapeHtml(t('market.greenAmmoniaOutput'))}</span><strong>${formatNumber(assessment.greenAmmoniaKt, 1)} kt NH3</strong></div>
              <div><span>${escapeHtml(t('market.hydrogenForFuel'))}</span><strong>${formatNumber(assessment.hydrogenForFuelKt, 1)} kt H2</strong></div>
              <div><span>${escapeHtml(t('market.usefulHydrogenHeat'))}</span><strong>${formatNumber(assessment.usefulHydrogenFuelTWh, 2)} TWh</strong></div>
            </div>
            ${assessment.ammoniaActive ? '' : `<p class="cluster-inline-warning">${escapeHtml(t('market.ammoniaInactive'))}</p>`}
          </div>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterGreenProductsTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterGreenProductsTitle">${escapeHtml(t('market.productsTitle'))}</h3>
              <p>${escapeHtml(t('market.productsDesc'))}</p>
            </div>
          </div>
          <div class="cluster-table-wrap">
            <table class="cluster-table cluster-market-table">
              <thead><tr>
                <th scope="col">${escapeHtml(t('market.product'))}</th>
                <th scope="col">${escapeHtml(t('market.physicalOutput'))}</th>
                <th scope="col">${escapeHtml(t('market.outputShare'))}</th>
                <th scope="col">${escapeHtml(t('market.marketReadyOutput'))}</th>
              </tr></thead>
              <tbody>${productRows.map((product) => `
                <tr>
                  <th scope="row">${escapeHtml(product.name)}</th>
                  <td>${formatNumber(product.output, 1)} kt/${escapeHtml(t('general.yearShort'))}</td>
                  <td>${(product.share * 100).toFixed(1)}%</td>
                  <td>${formatNumber(product.marketable, 1)} kt/${escapeHtml(t('general.yearShort'))}</td>
                </tr>
              `).join('')}</tbody>
            </table>
          </div>
          <p class="cluster-market-source">${escapeHtml(t('market.scopeNote'))}</p>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterFuelMixTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterFuelMixTitle">${escapeHtml(t('market.fuelTitle'))}</h3>
              <p>${escapeHtml(t('market.fuelDesc'))}</p>
            </div>
          </div>
          <div class="cluster-fuel-mix">
            <div class="cluster-fuel-mix-bar" aria-label="${escapeHtml(t('market.fuelTitle'))}">
              <span class="hydrogen" style="width:${(assessment.hydrogenFuelShare * 100).toFixed(1)}%"></span>
              <span class="fossil" style="width:${((1 - assessment.hydrogenFuelShare) * 100).toFixed(1)}%"></span>
            </div>
            <div class="cluster-fuel-legend">
              <span><i class="hydrogen"></i>${escapeHtml(t('market.greenHydrogenFuel'))} <strong>${(assessment.hydrogenFuelShare * 100).toFixed(1)}%</strong></span>
              <span><i class="fossil"></i>${escapeHtml(t('market.fossilFuel'))} <strong>${((1 - assessment.hydrogenFuelShare) * 100).toFixed(1)}%</strong></span>
            </div>
            <div class="cluster-allocation-outputs">
              <div><span>${escapeHtml(t('market.eligibleFuelDemand'))}</span><strong>${formatNumber(assessment.eligibleFuelDemandTWh, 2)} TWh</strong></div>
              <div><span>${escapeHtml(t('market.usefulHydrogenHeat'))}</span><strong>${formatNumber(assessment.usefulHydrogenFuelTWh, 2)} TWh</strong></div>
              <div><span>${escapeHtml(t('market.avoidedCombustion'))}</span><strong>${formatNumber(assessment.displacedCombustionEmissionsKt, 1)} kt CO2</strong></div>
            </div>
            <div class="cluster-fuel-recipients">
              <strong>${escapeHtml(t('market.recipientsTitle'))}</strong>
              ${assessment.fuelRecipients.slice(0, 5).map((company) => `
                <div>
                  <span>${escapeHtml(company.company)}</span>
                  <i><b style="width:${(company.fit * 100).toFixed(1)}%"></b></i>
                  <strong>${formatScore(company.fit)} / 20</strong>
                </div>
              `).join('')}
            </div>
            <p class="cluster-market-source cluster-market-source-inline">${escapeHtml(t('market.fuelScopeNote'))}</p>
          </div>
        </section>
      </div>
    `;
  }

  function renderSectors(state) {
    const scenario = getSelectedScenario();
    const analysis = Model.buildSectorAnalysis(scenario, state.companies);
    const selectedSector = analysis.sectors.find((sector) => sector.id === selectedSectorPathwayId)
      || analysis.sectors[0];
    selectedSectorPathwayId = selectedSector?.id || selectedSectorPathwayId;
    const summaryChangeTone = analysis.summary.yoyChange > 0 ? 'score-weak' : 'score-high';
    const sectorSourceUrl = safeExternalUrl(selectedSector?.source?.url);

    return `
      <div class="cluster-view cluster-sectors-view">
        <section class="cluster-panel" aria-labelledby="clusterSectorsTitle">
          <div class="cluster-panel-head cluster-toolbar-head">
            <div>
              <h3 id="clusterSectorsTitle">${escapeHtml(t('sectors.title'))}</h3>
              <p>${escapeHtml(t('sectors.desc'))}</p>
            </div>
            <span class="cluster-badge neutral">${escapeHtml(t('sectors.currentScenario'))}: ${escapeHtml(Model.getScenarioName(scenario, language()))}</span>
          </div>
          <div class="cluster-kpi-strip cluster-sector-kpis">
            <div class="cluster-kpi"><span>${escapeHtml(t('sectors.top20'))}</span><strong>${analysis.summary.installationCount}</strong><small>${analysis.summary.sectorCount} ${escapeHtml(t('sectors.sectorCount').toLocaleLowerCase(language() === 'bg' ? 'bg' : 'en'))}</small></div>
            <div class="cluster-kpi"><span>${escapeHtml(t('sectors.emissions2024'))}</span><strong>${formatNumber(analysis.summary.emissions2024Kt * 1000, 0)}</strong><small>tCO2e</small></div>
            <div class="cluster-kpi"><span>${escapeHtml(t('sectors.yoyChange'))}</span><strong class="${summaryChangeTone}">${formatSignedPercent(analysis.summary.yoyChange)}</strong><small>${escapeHtml(t(analysis.summary.yoyChange > 0 ? 'sectors.increase' : 'sectors.decrease'))}</small></div>
            <div class="cluster-kpi"><span>${escapeHtml(t('sectors.industryShare'))}</span><strong>${formatNumber(analysis.summary.industrialShare2024, 2)}%</strong><small>2024</small></div>
            <div class="cluster-kpi"><span>${escapeHtml(t('sectors.nationalShare'))}</span><strong>${formatNumber(analysis.summary.nationalShare2024, 2)}%</strong><small>2024</small></div>
          </div>
          <p class="cluster-sector-note">${escapeHtml(t('sectors.verifiedNote'))}</p>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterSectorComparisonTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterSectorComparisonTitle">${escapeHtml(t('sectors.sectorTableTitle'))}</h3>
              <p>${escapeHtml(t('sectors.sectorTableDesc'))}</p>
            </div>
          </div>
          <div class="cluster-table-wrap">
            <table class="cluster-table cluster-sector-table">
              <thead><tr>
                <th scope="col">${escapeHtml(t('general.sector'))}</th>
                <th scope="col">${escapeHtml(t('sectors.installations'))}</th>
                <th scope="col">${escapeHtml(t('sectors.emissions2024Short'))}</th>
                <th scope="col">${escapeHtml(t('sectors.yoyChange'))}</th>
                <th scope="col">${escapeHtml(t('sectors.shareIndustry'))}</th>
                <th scope="col">${escapeHtml(t('sectors.readiness'))}</th>
                <th scope="col">${escapeHtml(t('sectors.pressure'))}</th>
                <th scope="col">${escapeHtml(t('sectors.reduction2030'))}</th>
                <th scope="col">${escapeHtml(t('sectors.reduction2050'))}</th>
              </tr></thead>
              <tbody>${analysis.sectors.map((sector) => `
                <tr class="${sector.id === selectedSector.id ? 'selected' : ''}">
                  <th scope="row"><button type="button" class="cluster-table-link" data-cluster-action="select-sector" data-sector-id="${escapeHtml(sector.id)}">${escapeHtml(localize(sector.name))}</button></th>
                  <td>${sector.installationCount}</td>
                  <td>${formatNumber(sector.emissions2024Kt * 1000, 0)}</td>
                  <td class="${sector.yoyChange > 0 ? 'score-weak' : 'score-high'}">${formatSignedPercent(sector.yoyChange)}</td>
                  <td>${formatNumber(sector.industrialShare2024, 2)}%</td>
                  <td class="${scoreTone(sector.readiness)}">${formatScore(sector.readiness)}</td>
                  <td class="${scoreTone(sector.transitionPressure)}">${formatScore(sector.transitionPressure)}</td>
                  <td>${formatNumber(sector.reduction2030 * 100, 1)}%</td>
                  <td><strong class="${scoreTone(sector.reduction2050)}">${formatNumber(sector.reduction2050 * 100, 1)}%</strong></td>
                </tr>
              `).join('')}</tbody>
            </table>
          </div>
        </section>

        <section class="cluster-panel cluster-sector-pathway" aria-labelledby="clusterSectorPathTitle">
          <div class="cluster-panel-head cluster-sector-path-head">
            <div>
              <span class="cluster-kicker">${escapeHtml(t('sectors.pathwayTitle'))}</span>
              <h3 id="clusterSectorPathTitle">${escapeHtml(localize(selectedSector.name))}</h3>
              <p>${escapeHtml(localize(selectedSector.description))}</p>
            </div>
            <div class="cluster-sector-path-score">
              <span>${escapeHtml(t('sectors.reduction2050'))}</span>
              <strong class="${scoreTone(selectedSector.reduction2050)}">${formatNumber(selectedSector.reduction2050 * 100, 1)}%</strong>
              <small>${escapeHtml(Model.getScenarioName(scenario, language()))}</small>
            </div>
          </div>
          <div class="cluster-sector-path-grid">
            <div class="cluster-sector-timeline">
              <h4>${escapeHtml(t('sectors.pathwayStages'))}</h4>
              ${selectedSector.stages.map((stage, index) => `
                <div class="cluster-sector-stage">
                  <span>${escapeHtml(stage.period)}</span>
                  <i aria-hidden="true">${index + 1}</i>
                  <div><strong>${escapeHtml(localize(stage.title))}</strong><p>${escapeHtml(localize(stage.actions))}</p></div>
                </div>
              `).join('')}
            </div>
            <div class="cluster-sector-path-details">
              <div>
                <h4>${escapeHtml(t('sectors.levers'))}</h4>
                <ul>${selectedSector.levers.map((lever) => `<li>${escapeHtml(localize(lever))}</li>`).join('')}</ul>
              </div>
              <div>
                <h4>${escapeHtml(t('sectors.dependencies'))}</h4>
                <ul>${selectedSector.dependencies.map((dependency) => `<li>${escapeHtml(localize(dependency))}</li>`).join('')}</ul>
              </div>
              <div class="cluster-sector-signals">
                <h4>${escapeHtml(t('sectors.companySignals'))}</h4>
                ${selectedSector.installations.map((company) => {
                  const sourceUrl = safeExternalUrl(company.provenance?.url);
                  return `<div><strong>${escapeHtml(company.installationName || company.company)}</strong><p>${escapeHtml(localize(company.indicator))}</p>${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('general.source'))}</a>` : ''}</div>`;
                }).join('')}
              </div>
            </div>
          </div>
          <div class="cluster-sector-source">
            <span>${escapeHtml(t('sectors.source'))}</span>
            ${sectorSourceUrl ? `<a href="${escapeHtml(sectorSourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(localize(selectedSector.source.name))}</a>` : `<strong>${escapeHtml(localize(selectedSector.source.name))}</strong>`}
            <small>${escapeHtml(selectedSector.source.year)}</small>
          </div>
          <p class="cluster-sector-model-note">${escapeHtml(t('sectors.modelNote'))}</p>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterInstallationRankingTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterInstallationRankingTitle">${escapeHtml(t('sectors.rankingTitle'))}</h3>
              <p>${escapeHtml(t('sectors.rankingDesc'))}</p>
            </div>
          </div>
          <div class="cluster-table-wrap">
            <table class="cluster-table cluster-installation-table">
              <thead>
                <tr>
                  <th scope="col" rowspan="2">${escapeHtml(t('sectors.rank'))}</th>
                  <th scope="col" rowspan="2">${escapeHtml(t('sectors.installation'))}</th>
                  <th scope="col" rowspan="2">${escapeHtml(t('sectors.specificSector'))}</th>
                  <th scope="colgroup" colspan="3">2023</th>
                  <th scope="colgroup" colspan="4">2024</th>
                  <th scope="col" rowspan="2">${escapeHtml(t('sectors.indicator'))}</th>
                </tr>
                <tr>
                  <th scope="col">tCO2e</th>
                  <th scope="col">${escapeHtml(t('sectors.shareBg'))}</th>
                  <th scope="col">${escapeHtml(t('sectors.shareIndustry'))}</th>
                  <th scope="col">tCO2e</th>
                  <th scope="col">${escapeHtml(t('sectors.shareBg'))}</th>
                  <th scope="col">${escapeHtml(t('sectors.shareIndustry'))}</th>
                  <th scope="col">${escapeHtml(t('sectors.yoyChange'))}</th>
                </tr>
              </thead>
              <tbody>${analysis.installations.map((company) => {
                const sourceUrl = safeExternalUrl(company.provenance?.url);
                return `
                  <tr>
                    <td><strong>${company.etsRank2024}</strong></td>
                    <th scope="row"><button type="button" class="cluster-table-link" data-cluster-action="select-company" data-company-id="${escapeHtml(company.id)}">${escapeHtml(company.installationName || company.company)}</button><small>${escapeHtml(company.clusterSector)}</small></th>
                    <td>${escapeHtml(company.specificSector)}</td>
                    <td>${formatNumber(company.emissions2023Kt * 1000, 0)}</td>
                    <td>${formatNumber(company.nationalShare2023, 2)}%</td>
                    <td>${formatNumber(company.industrialShare2023, 2)}%</td>
                    <td><strong>${formatNumber(company.emissions2024Kt * 1000, 0)}</strong></td>
                    <td>${formatNumber(company.nationalShare2024, 2)}%</td>
                    <td>${formatNumber(company.industrialShare2024, 2)}%</td>
                    <td class="${company.yoyChange > 0 ? 'score-weak' : 'score-high'}">${formatSignedPercent(company.yoyChange)}</td>
                    <td class="cluster-indicator-cell">${escapeHtml(localize(company.indicator))}${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('general.source'))}</a>` : ''}</td>
                  </tr>
                `;
              }).join('')}</tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function companyRegions(company) {
    const ids = company.regionIds || [company.geography?.regionId];
    return Data.STATISTICAL_REGIONS.filter((region) => ids.includes(region.id));
  }

  function companyRegionNames(company) {
    return companyRegions(company).map((region) => localize(region.name)).join(' · ');
  }

  function filterCompanies(companies) {
    const query = companySearch.trim().toLocaleLowerCase(language() === 'bg' ? 'bg' : 'en');
    return companies.filter((company) => {
      const matchesRegion = companyRegionFilter === 'all' || companyRegions(company).some((region) => region.id === companyRegionFilter);
      const original = `${company.company} ${company.companyBg || ''} ${company.cluster} ${company.sector}`;
      const translated = [company.company, company.cluster, company.sector, company.mainActivity].map((value) => localize(value)).join(' ');
      const haystack = `${original} ${translated} ${companyRegionNames(company)}`.toLocaleLowerCase(language() === 'bg' ? 'bg' : 'en');
      return matchesRegion && (companyActivityFilter === 'all' || company.mainActivityId === companyActivityFilter) && (!query || haystack.includes(query));
    });
  }

  function renderCompanyScoreGrid(company) {
    const hydrated = Model.hydrateCompany(company);
    return `
      <div class="cluster-company-score-grid">
        ${Data.COMPANY_METRIC_DEFINITIONS.map((metric) => `
          <div class="cluster-metric-card">
            ${scoreMarkup(hydrated[metric.key], localize(metric.title))}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderProvenance(company) {
    const confidence = Model.clamp01(Number(company.provenance?.confidence20 || 0) / 20);
    const sourceUrl = safeExternalUrl(company.provenance?.url);
    const emissionsUrl = safeExternalUrl(company.provenance?.emissionsUrl);
    const sourceName = company.provenance?.source || t('general.notAvailable');
    return `
      <div class="cluster-provenance">
        <div><span>${escapeHtml(t('general.source'))}</span><strong>${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(sourceName)}</a>` : escapeHtml(sourceName)}</strong></div>
        <div><span>${escapeHtml(t('general.year'))}</span><strong>${escapeHtml(company.provenance?.year || t('general.notAvailable'))}</strong></div>
        <div><span>${escapeHtml(t('general.method'))}</span><strong>${escapeHtml(company.provenance?.method || t('general.notAvailable'))}</strong></div>
        <div><span>${escapeHtml(t('general.confidence'))}</span><strong>${formatScore(confidence)} / 20</strong></div>
        ${company.etsRank2024 ? `
          <div><span>${escapeHtml(t('companies.etsRank'))}</span><strong>#${company.etsRank2024}</strong></div>
          <div><span>${escapeHtml(t('sectors.emissions2023'))}</span><strong>${formatNumber(company.emissions2023Kt * 1000, 0)}</strong></div>
          <div><span>${escapeHtml(t('sectors.emissions2024Short'))}</span><strong>${formatNumber(company.emissions2024Kt * 1000, 0)}</strong></div>
          <div><span>${escapeHtml(t('sectors.shareIndustry'))}</span><strong>${formatNumber(company.industrialShare2024, 2)}%</strong></div>
          <div class="wide"><span>${escapeHtml(t('companies.verifiedEmissions'))}</span><strong>${emissionsUrl ? `<a href="${escapeHtml(emissionsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(company.provenance?.emissionsSource || '')}</a>` : escapeHtml(company.provenance?.emissionsSource || '')}</strong></div>
        ` : ''}
        ${company.indicator ? `<div class="wide"><span>${escapeHtml(t('companies.companyIndicator'))}</span><strong>${escapeHtml(localize(company.indicator))}</strong></div>` : ''}
        <div class="wide"><span>${escapeHtml(t('general.note'))}</span><strong>${escapeHtml(company.provenance?.note || '')}</strong></div>
      </div>
    `;
  }

  function renderCompanyPathways(companyDecision) {
    if (!companyDecision?.pathways?.length) {
      return `<p class="cluster-empty-copy">${escapeHtml(t('companies.noPathways'))}</p>`;
    }
    return `
      <div class="cluster-table-wrap">
        <table class="cluster-table compact-table">
          <caption class="sr-only">${escapeHtml(t('companies.pathways'))}</caption>
          <thead><tr>
            <th scope="col">${escapeHtml(t('general.action'))}</th>
            <th scope="col">${escapeHtml(t('general.capex'))}</th>
            <th scope="col">${escapeHtml(t('general.abatement'))}</th>
            <th scope="col">${escapeHtml(t('general.year'))}</th>
          </tr></thead>
          <tbody>${companyDecision.pathways.map((pathway) => `
            <tr>
              <th scope="row">${escapeHtml(pathway.name)}</th>
              <td>${formatNumber(pathway.capex_M, 1)}</td>
              <td>${formatNumber(pathway.co2_kt, 1)}</td>
              <td>${Number(pathway.starts) < 9999 ? escapeHtml(pathway.starts) : t('general.notAvailable')}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function renderCompanies(state) {
    const roster = (Data.createCompanyRoster || Data.createDefaultCompanies)();
    const hydrated = roster.map(company => {
      const assessed = state.companies.find(entry => entry.id === company.id);
      return assessed ? { ...company, ...Model.hydrateCompany(assessed), company: company.company, companyBg: company.companyBg } : company;
    });
    const filtered = filterCompanies(hydrated);
    const selected = getSelectedCompany();
    const selectedHydrated = Model.hydrateCompany(selected);
    const decision = Model.getDecisionLayer(getSelectedScenario(), state.companies, { pathways: getPathways() });
    const selectedDecision = decision.companyPriorities.find((company) => company.id === selected.id);

    return `
      <div class="cluster-view">
        <section class="cluster-panel" aria-labelledby="clusterCompaniesTitle">
          <div class="cluster-panel-head cluster-toolbar-head">
            <div>
              <h3 id="clusterCompaniesTitle">${escapeHtml(t('companies.title'))}</h3>
              <p>${escapeHtml(registryCopy('Operator register · 2025 emissions and free allowances. Model scores remain based on the assessed 2024 set; new operators have no model score.', 'Регистър на операторите · емисии и безплатни квоти за 2025 г. Оценките на модела остават за оценения набор за 2024 г.; новите оператори нямат моделна оценка.'))}</p>
            </div>
            <div class="cluster-filter-row">
              <label class="cluster-field compact-field">
                <span class="sr-only">${escapeHtml(t('companies.search'))}</span>
                <input type="search" value="${escapeHtml(companySearch)}" placeholder="${escapeHtml(t('companies.search'))}" data-cluster-input="company-search">
              </label>
              <label class="cluster-field compact-field">
                <span class="sr-only">${escapeHtml(t('companies.region'))}</span>
                <select data-cluster-change="company-region-filter">
                  <option value="all">${escapeHtml(t('companies.allRegions'))}</option>
                  ${Data.STATISTICAL_REGIONS.map((region) => `<option value="${escapeHtml(region.id)}" ${companyRegionFilter === region.id ? 'selected' : ''}>${escapeHtml(localize(region.name))}</option>`).join('')}
                </select>
              </label>
              <label class="cluster-field compact-field">
                <span>${escapeHtml(registryCopy('Main activity', 'Основна дейност'))}</span>
                <select data-cluster-change="company-activity-filter"><option value="all">${escapeHtml(registryCopy('All activities', 'Всички дейности'))}</option>${[...new Map(roster.map(co => [co.mainActivityId, co.mainActivity])).entries()].map(([id, activity]) => `<option value="${escapeHtml(id)}" ${companyActivityFilter === id ? 'selected' : ''}>${escapeHtml(localize(activity))}</option>`).join('')}</select>
              </label>
            </div>
          </div>
          <div class="cluster-table-wrap">
            <table class="cluster-table">
              <caption class="sr-only">${escapeHtml(t('companies.baselineMetrics'))}</caption>
              <thead><tr>
                <th scope="col">${escapeHtml(t('general.company'))}</th>
                <th scope="col">${escapeHtml(t('companies.region'))}</th>
                <th scope="col">${escapeHtml(registryCopy('Main activity', 'Основна дейност'))}</th>
                <th scope="col">2025 · t CO₂e</th><th scope="col">2025 · EUA</th>
                ${Data.CORE_METRIC_DEFINITIONS.map((metric) => `<th scope="col">${escapeHtml(metric.key.replace('_i', ''))}</th>`).join('')}
                <th scope="col">${escapeHtml(t('general.confidence'))}</th>
              </tr></thead>
              <tbody>${filtered.map((company) => `
                <tr class="${company.id === selected.id ? 'selected' : ''}">
                  <th scope="row">
                    <button type="button" class="cluster-table-link" data-cluster-action="open-company-profile" data-company-id="${escapeHtml(company.id)}">${escapeHtml(language() === 'bg' ? company.companyBg || localize(company.company) : company.company)}</button>
                    <small>${escapeHtml(company.sector)}</small>
                    ${company.modelAssessed ? `<button type="button" class="cluster-table-link" data-cluster-action="select-company" data-company-id="${escapeHtml(company.id)}">${escapeHtml(registryCopy('Model assessment', 'Оценка по модела'))}</button>` : ''}
                  </th>
                  <td>${escapeHtml(companyRegionNames(company))}</td>
                  <td>${escapeHtml(localize(company.mainActivity))}</td>
                  <td>${company.verifiedEmissions2025T == null ? escapeHtml(t('general.notAvailable')) : formatNumber(company.verifiedEmissions2025T, 0)}</td>
                  <td>${company.freeAllowances2025Eua == null ? escapeHtml(t('general.notAvailable')) : formatNumber(company.freeAllowances2025Eua, 0)}</td>
                  ${Data.CORE_METRIC_DEFINITIONS.map((metric) => `<td class="${company.modelAssessed ? scoreTone(company[metric.key]) : ''}">${company.modelAssessed ? formatScore(company[metric.key]) : '—'}</td>`).join('')}
                  <td>${company.modelAssessed ? formatNumber(company.provenance?.confidence20 || 0, 0) : '—'}</td>
                </tr>
              `).join('')}</tbody>
            </table>
          </div>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterSelectedCompanyTitle">
          <div class="cluster-selected-company-head">
            <div>
              <span class="cluster-kicker">${escapeHtml(t('companies.selectedProfile'))}</span>
              <h3 id="clusterSelectedCompanyTitle">${escapeHtml(selected.company)}</h3>
              <p>${escapeHtml(selected.cluster)} · ${escapeHtml(selected.sector)} · ${escapeHtml(t('companies.factorDerived'))}</p>
              <span class="cluster-company-scope">${escapeHtml(t(selected.etsRank2024 ? 'companies.datasetScopeTop20' : 'companies.datasetScopeSupplemental'))}</span>
            </div>
            ${scoreMarkup(selectedDecision?.priority || 0, t('general.priority'))}
          </div>
          ${renderCompanyScoreGrid(selected)}
        </section>

        <div class="cluster-two-column balanced">
          <section class="cluster-panel" aria-labelledby="clusterCompanyEvidenceTitle">
            <div class="cluster-panel-head compact"><h3 id="clusterCompanyEvidenceTitle">${escapeHtml(t('metrics.provenanceTitle'))}</h3></div>
            ${renderProvenance(selected)}
          </section>
          <section class="cluster-panel" aria-labelledby="clusterCompanyPathwaysTitle">
            <div class="cluster-panel-head compact"><h3 id="clusterCompanyPathwaysTitle">${escapeHtml(t('companies.pathways'))}</h3></div>
            ${renderCompanyPathways(selectedDecision)}
          </section>
        </div>
      </div>
    `;
  }

  function renderSharedProjects(projects) {
    return `
      <div class="cluster-table-wrap">
        <table class="cluster-table">
          <caption class="sr-only">${escapeHtml(t('network.sharedTitle'))}</caption>
          <thead><tr>
            <th scope="col">${escapeHtml(t('general.action'))}</th>
            <th scope="col">${escapeHtml(t('general.members'))}</th>
            <th scope="col">${escapeHtml(t('general.capex'))}</th>
            <th scope="col">${escapeHtml(t('general.abatement'))}</th>
            <th scope="col">${escapeHtml(t('general.timeline'))}</th>
            <th scope="col">${escapeHtml(t('general.readiness'))}</th>
            <th scope="col">${escapeHtml(t('general.priority'))}</th>
          </tr></thead>
          <tbody>${projects.map((project) => `
            <tr>
              <th scope="row">
                ${escapeHtml(localize(project.name))}
                <small>${escapeHtml(project.owner ? localize(project.owner) : project.source)}</small>
              </th>
              <td>${escapeHtml(project.memberCompanies.join(', '))}</td>
              <td>${formatNumber(project.capexM, 0)}</td>
              <td>${formatNumber(project.abatementKt, 0)}</td>
              <td>${project.startYear}-${project.endYear}</td>
              <td>${formatScore(project.readiness)}</td>
              <td><strong class="${scoreTone(project.priority)}">${formatScore(project.priority)}</strong></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function renderNetwork(state) {
    const analysis = Model.analyzeNetwork(state.companies);
    const projects = Model.assessSharedInfrastructure(getSelectedScenario(), state.companies);
    const topAnchor = analysis.nodes[0];
    const sharedPotential = projects.reduce((sum, project) => sum + project.abatementKt, 0);
    return `
      <div class="cluster-view">
        <div class="cluster-kpi-strip network-kpis">
          <div class="cluster-kpi"><span>${escapeHtml(t('network.nodes'))}</span><strong>${analysis.nodes.length}</strong></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('network.edges'))}</span><strong>${analysis.edges.length}</strong></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('network.topAnchor'))}</span><strong class="score-weak">${escapeHtml(topAnchor?.company || '-')}</strong></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('network.sharedPotential'))}</span><strong>${formatNumber(sharedPotential, 0)}</strong><small>${escapeHtml(t('general.ktYear'))}</small></div>
        </div>

        <section class="cluster-panel" aria-labelledby="clusterNetworkMapTitle">
          <div class="cluster-panel-head"><div><h3 id="clusterNetworkMapTitle">${escapeHtml(t('network.mapTitle'))}</h3><p>${escapeHtml(t('network.mapDesc'))}</p></div></div>
          <div class="cluster-chart tall" id="clusterNetworkChart" role="img" aria-label="${escapeHtml(t('network.mapTitle'))}"></div>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterNetworkAnalyticsTitle">
          <div class="cluster-panel-head compact"><h3 id="clusterNetworkAnalyticsTitle">${escapeHtml(t('network.analyticsTitle'))}</h3></div>
          <div class="cluster-table-wrap">
            <table class="cluster-table">
              <caption class="sr-only">${escapeHtml(t('network.analyticsTitle'))}</caption>
              <thead><tr>
                <th scope="col">${escapeHtml(t('general.company'))}</th>
                <th scope="col">${escapeHtml(t('network.weightedCentrality'))}</th>
                <th scope="col">${escapeHtml(t('network.bridgeScore'))}</th>
                <th scope="col">${escapeHtml(t('network.failureImpact'))}</th>
                <th scope="col">${escapeHtml(t('network.anchorRisk'))}</th>
              </tr></thead>
              <tbody>${analysis.nodes.map((node) => `
                <tr>
                  <th scope="row">${escapeHtml(node.company)}<small>${escapeHtml(node.cluster)}</small></th>
                  <td>${formatScore(node.weightedCentrality)}</td>
                  <td>${formatScore(node.bridgeScore)}</td>
                  <td>${formatScore(node.failureImpact)}</td>
                  <td><strong class="${scoreTone(node.anchorRisk)}">${formatScore(node.anchorRisk)}</strong></td>
                </tr>
              `).join('')}</tbody>
            </table>
          </div>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterSharedProjectsTitle">
          <div class="cluster-panel-head compact"><h3 id="clusterSharedProjectsTitle">${escapeHtml(t('network.sharedTitle'))}</h3></div>
          ${renderSharedProjects(projects)}
        </section>
      </div>
    `;
  }

  function renderMetricDefinition(metric) {
    const riskDirection = ['higher_risk', 'higher_pressure', 'higher_dependency'].includes(metric.direction);
    return `
      <article class="cluster-method-card">
        <div class="cluster-method-head">
          <span class="cluster-method-code">${escapeHtml(metric.key.replace('_i', ''))}</span>
          <div><h4>${escapeHtml(localize(metric.title))}</h4><p>${escapeHtml(riskDirection ? t('method.higherRisk') : t('method.higherBetter'))}</p></div>
        </div>
        <code>${escapeHtml(metric.formula)}</code>
        <div class="cluster-factor-tags">${metric.factors.map((factor) => `<span>${escapeHtml(localize(factor.title))}</span>`).join('')}</div>
      </article>
    `;
  }

  function renderMethodology() {
    const outputMethods = [
      ['depth', 'method.outputDepth', 'Depth = weighted(T_eff, M_eff, E_i, carbon, infrastructure, power, finance, engineering, coordination)'],
      ['retention', 'method.outputRetention', 'Retention = weighted(B_eff, T_eff, M_eff, market, stability, finance, offtake, certification, resilience)'],
      ['continuity', 'method.outputContinuity', 'Continuity = weighted(retention, K_i, 1-C_i, B_eff, coordination, stability)'],
      ['balance', 'method.outputBalance', 'Balance = sqrt(Depth x Retention)'],
    ];
    return `
      <div class="cluster-view">
        <section class="cluster-scale-band" aria-labelledby="clusterScaleTitle">
          <div><span>0</span><i></i><span>20</span></div>
          <section><h3 id="clusterScaleTitle">${escapeHtml(t('method.scaleTitle'))}</h3><p>${escapeHtml(t('method.scaleDesc'))}</p></section>
        </section>
        <section aria-labelledby="clusterCoreMethodTitle">
          <div class="cluster-section-heading"><h3 id="clusterCoreMethodTitle">${escapeHtml(t('method.coreTitle'))}</h3></div>
          <div class="cluster-method-grid">${Data.CORE_METRIC_DEFINITIONS.map(renderMetricDefinition).join('')}</div>
        </section>
        <section aria-labelledby="clusterSensitivityMethodTitle">
          <div class="cluster-section-heading"><h3 id="clusterSensitivityMethodTitle">${escapeHtml(t('method.sensitivityTitle'))}</h3></div>
          <div class="cluster-method-grid">${Data.SENSITIVITY_DEFINITIONS.map(renderMetricDefinition).join('')}</div>
        </section>
        <section class="cluster-panel" aria-labelledby="clusterOutputMethodTitle">
          <div class="cluster-panel-head compact"><h3 id="clusterOutputMethodTitle">${escapeHtml(t('method.outputsTitle'))}</h3></div>
          <div class="cluster-output-methods">${outputMethods.map(([key, descriptionKey, formula]) => `
            <article>
              <strong>${escapeHtml(t(`outcome.${key}`))}</strong>
              <code>${escapeHtml(formula)}</code>
              <p>${escapeHtml(t(descriptionKey))}</p>
            </article>
          `).join('')}</div>
        </section>
        <section class="cluster-panel" aria-labelledby="clusterTrajectoryMethodTitle">
          <div class="cluster-panel-head">
            <div>
              <h3 id="clusterTrajectoryMethodTitle">${escapeHtml(t('method.trajectoryTitle'))}</h3>
              <p>${escapeHtml(t('method.trajectoryDesc'))}</p>
            </div>
          </div>
          <div class="cluster-output-methods">
            <article><strong>${escapeHtml(t('trajectory.greenHydrogen'))}</strong><code>H2 potential x readiness x adoption curve</code><p>${escapeHtml(t('method.hydrogenAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('trajectory.electrolyzers'))}</strong><code>${Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW} MW/unit x capacity factor / kWh per kg H2</code><p>${escapeHtml(t('method.electrolyzerAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('trajectory.ammoniaStorage'))}</strong><code>NH3 carrier x active electrolysis x logistics readiness</code><p>${escapeHtml(t('method.ammoniaAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('market.productsTitle'))}</strong><code>physical green share x market readiness</code><p>${escapeHtml(t('method.greenMarketAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('market.fuelTitle'))}</strong><code>residual H2 x LHV x process efficiency / eligible heat</code><p>${escapeHtml(t('method.fuelMixAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('trajectory.ccs'))}</strong><code>CCS potential x readiness x adoption curve</code><p>${escapeHtml(t('method.ccsAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('trajectory.nuclear'))}</strong><code>1 unit = ${Data.TECHNOLOGY_ASSUMPTIONS.nuclearUnitMW} MW; diminishing supply benefit</code><p>${escapeHtml(t('method.nuclearAssumption'))}</p></article>
            <article><strong>${escapeHtml(t('method.activityAccounting'))}</strong><code>Total reduction = 1 - (1 - technical reduction) x operating activity</code><p>${escapeHtml(t('method.activityAssumption'))}</p></article>
          </div>
        </section>
      </div>
    `;
  }

  function renderMetrics(state) {
    const selected = getSelectedCompany();
    const hydrated = Model.hydrateCompany(selected);
    const confidence = Model.clamp01(Number(selected.provenance?.confidence20 || 0) / 20);
    return `
      <div class="cluster-view">
        <section class="cluster-panel" aria-labelledby="clusterMetricEvidenceTitle">
          <div class="cluster-panel-head cluster-toolbar-head">
            <div><h3 id="clusterMetricEvidenceTitle">${escapeHtml(t('metrics.provenanceTitle'))}</h3><p>${escapeHtml(confidenceLabel(confidence))}</p></div>
            <label class="cluster-field">
              <span>${escapeHtml(t('metrics.selectCompany'))}</span>
              <select data-cluster-change="select-company">
                ${state.companies.map((company) => `<option value="${escapeHtml(company.id)}" ${company.id === selected.id ? 'selected' : ''}>${escapeHtml(company.company)}</option>`).join('')}
              </select>
            </label>
          </div>
          ${renderProvenance(selected)}
        </section>

        <section class="cluster-panel" aria-labelledby="clusterFactorBreakdownTitle">
          <div class="cluster-panel-head"><div><h3 id="clusterFactorBreakdownTitle">${escapeHtml(t('metrics.factorTitle'))}</h3><p>${escapeHtml(t('companies.factorDerived'))}</p></div></div>
          <div class="cluster-factor-groups">
            ${Data.COMPANY_METRIC_DEFINITIONS.map((metric) => `
              <article class="cluster-factor-group">
                <div class="cluster-factor-group-head">
                  <div><span>${escapeHtml(metric.key)}</span><strong>${escapeHtml(localize(metric.title))}</strong></div>
                  <div class="cluster-aggregate ${scoreTone(hydrated[metric.key])}"><small>${escapeHtml(t('metrics.aggregate'))}</small><strong>${formatScore(hydrated[metric.key])}</strong></div>
                </div>
                <div class="cluster-factor-list">
                  ${metric.factors.map((factor) => {
                    const value = selected.factors[metric.key][factor.key];
                    return `<div><span>${escapeHtml(localize(factor.title))}</span>${scoreMarkup(value, '', true)}</div>`;
                  }).join('')}
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderDecisionCompanyTable(decision) {
    return `
      <div class="cluster-table-wrap">
        <table class="cluster-table">
          <caption class="sr-only">${escapeHtml(t('decision.companyTitle'))}</caption>
          <thead><tr>
            <th scope="col">${escapeHtml(t('general.company'))}</th>
            <th scope="col">${escapeHtml(t('general.priority'))}</th>
            <th scope="col">${escapeHtml(t('general.action'))}</th>
            <th scope="col">${escapeHtml(t('general.capex'))}</th>
            <th scope="col">${escapeHtml(t('general.abatement'))}</th>
            <th scope="col">${escapeHtml(t('general.year'))}</th>
            <th scope="col">${escapeHtml(t('general.confidence'))}</th>
          </tr></thead>
          <tbody>${decision.companyPriorities.map((company) => `
            <tr>
              <th scope="row">${escapeHtml(company.company)}<small>${escapeHtml(company.cluster)} · ${escapeHtml(company.sector)}</small></th>
              <td><strong class="${scoreTone(company.priority)}">${formatScore(company.priority)}</strong></td>
              <td>${escapeHtml(t(`bottleneck.${company.primaryBottleneck}`))}<small>${formatScore(company.bottleneckSeverity)} / 20</small></td>
              <td>${company.pathwayCount ? formatNumber(company.capexM, 1) : '-'}</td>
              <td>${company.pathwayCount ? formatNumber(company.abatementKt, 1) : '-'}</td>
              <td>${company.firstStartYear || '-'}</td>
              <td>${formatScore(company.dataConfidence)}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function renderRecommendations(decision) {
    const companyActions = decision.companyPriorities.slice(0, 3).map((company) => ({
      title: company.company,
      detail: `${t(`bottleneck.${company.primaryBottleneck}`)} · ${t('general.priority')} ${formatScore(company.priority)}/20`,
    }));
    const sharedActions = decision.sharedProjects.slice(0, 2).map((project) => ({
      title: localize(project.name),
      detail: `${formatNumber(project.capexM, 0)} ${t('general.millionEur')} · ${formatNumber(project.abatementKt, 0)} ${t('general.ktYear')}`,
    }));
    return `
      <div class="cluster-recommendation-list">
        ${[...companyActions, ...sharedActions].map((action, index) => `
          <div class="cluster-recommendation"><span>${index + 1}</span><div><strong>${escapeHtml(action.title)}</strong><small>${escapeHtml(action.detail)}</small></div></div>
        `).join('')}
      </div>
    `;
  }

  function renderDecisions(state) {
    const decision = Model.getDecisionLayer(getSelectedScenario(), state.companies, { pathways: getPathways() });
    return `
      <div class="cluster-view cluster-decision-view">
        <div class="cluster-kpi-strip">
          <div class="cluster-kpi"><span>${escapeHtml(t('decision.pathwayCapex'))}</span><strong>${formatNumber(decision.summary.totalCapexM, 0)}</strong><small>${escapeHtml(t('general.millionEur'))}</small></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('decision.pathwayAbatement'))}</span><strong>${formatNumber(decision.summary.totalAbatementKt, 0)}</strong><small>${escapeHtml(t('general.ktYear'))}</small></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('decision.sharedCapex'))}</span><strong>${formatNumber(decision.summary.sharedCapexM, 0)}</strong><small>${escapeHtml(t('general.millionEur'))}</small></div>
          <div class="cluster-kpi"><span>${escapeHtml(t('decision.sharedAbatement'))}</span><strong>${formatNumber(decision.summary.sharedAbatementKt, 0)}</strong><small>${escapeHtml(t('general.ktYear'))}</small></div>
        </div>

        <section class="cluster-panel" aria-labelledby="clusterDecisionCompanyTitle">
          <div class="cluster-panel-head"><div><h3 id="clusterDecisionCompanyTitle">${escapeHtml(t('decision.companyTitle'))}</h3><p>${escapeHtml(t('decision.companyDesc'))}</p></div></div>
          ${renderDecisionCompanyTable(decision)}
        </section>

        <div class="cluster-two-column balanced">
          <section class="cluster-panel" aria-labelledby="clusterPortfolioTitle">
            <div class="cluster-panel-head compact"><h3 id="clusterPortfolioTitle">${escapeHtml(t('decision.portfolioTitle'))}</h3></div>
            <div class="cluster-chart" id="clusterPortfolioChart" role="img" aria-label="${escapeHtml(t('decision.portfolioTitle'))}"></div>
          </section>
          <section class="cluster-panel" aria-labelledby="clusterRecommendationsTitle">
            <div class="cluster-panel-head compact"><h3 id="clusterRecommendationsTitle">${escapeHtml(t('decision.recommendations'))}</h3></div>
            ${renderRecommendations(decision)}
          </section>
        </div>

        <section class="cluster-panel" aria-labelledby="clusterDecisionSharedTitle">
          <div class="cluster-panel-head compact"><h3 id="clusterDecisionSharedTitle">${escapeHtml(t('decision.sharedTitle'))}</h3></div>
          ${renderSharedProjects(decision.sharedProjects)}
        </section>
      </div>
    `;
  }

  function renderSimulationToolbar(state, scenario) {
    return `
      <div class="cluster-sim-toolbar">
        <label class="cluster-field scenario-select-field">
          <span>${escapeHtml(t('general.scenario'))}</span>
          <select data-cluster-change="select-scenario">
            ${state.scenarios.map((entry) => `<option value="${escapeHtml(entry.id)}" ${entry.id === scenario.id ? 'selected' : ''}>${escapeHtml(Model.getScenarioName(entry, language()))}</option>`).join('')}
          </select>
        </label>
        <div class="cluster-command-row" role="group" aria-label="${escapeHtml(t('meta.simulation.title'))}">
          <button type="button" class="cluster-btn" data-cluster-action="clone-scenario">${escapeHtml(t('action.clone'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="reset-scenario" ${scenario.custom ? 'disabled' : ''}>${escapeHtml(t('action.resetScenario'))}</button>
          <button type="button" class="cluster-btn danger" data-cluster-action="delete-scenario" ${!scenario.custom ? 'disabled' : ''}>${escapeHtml(t('action.deleteScenario'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="undo" ${!Simulation.canUndo() ? 'disabled' : ''}>${escapeHtml(t('action.undo'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="reset-all">${escapeHtml(t('action.resetAll'))}</button>
        </div>
        <div class="cluster-command-row" role="group" aria-label="${escapeHtml(t('action.exportGroup'))}">
          <button type="button" class="cluster-btn" data-cluster-action="export-json">${escapeHtml(t('action.exportJson'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="trigger-import">${escapeHtml(t('action.importJson'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="export-csv">${escapeHtml(t('action.exportCsv'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="share">${escapeHtml(t('action.share'))}</button>
          <button type="button" class="cluster-btn" data-cluster-action="print">${escapeHtml(t('action.print'))}</button>
          <input class="sr-only" id="clusterImportFile" type="file" accept="application/json,.json" data-cluster-change="import-file">
        </div>
      </div>
    `;
  }

  function renderScenarioEditor(state) {
    return `
      <section class="cluster-panel" aria-labelledby="clusterScenarioEditorTitle">
        <div class="cluster-panel-head"><div><h3 id="clusterScenarioEditorTitle">${escapeHtml(t('simulation.scenarioInputs'))}</h3><p>${escapeHtml(t('general.scale'))}</p></div></div>
        <div class="cluster-table-wrap">
          <table class="cluster-table cluster-input-table">
            <caption class="sr-only">${escapeHtml(t('simulation.scenarioInputs'))}</caption>
            <thead><tr>
              <th scope="col">${escapeHtml(t('general.scenario'))}</th>
              ${Data.SCENARIO_PARAMETER_KEYS.map((key) => `<th scope="col">${escapeHtml(t(`parameter.${key}`))}</th>`).join('')}
            </tr></thead>
            <tbody>${state.scenarios.map((scenario) => `
              <tr>
                <th scope="row">${escapeHtml(Model.getScenarioName(scenario, language()))}</th>
                ${Data.SCENARIO_PARAMETER_KEYS.map((key) => `
                  <td><input
                    type="number" min="0" max="20" step="0.1"
                    value="${formatScore(Model.getScenarioValue(scenario, key))}"
                    aria-label="${escapeHtml(`${Model.getScenarioName(scenario, language())}: ${t(`parameter.${key}`)}`)}"
                    data-cluster-change="scenario-value"
                    data-scenario-id="${escapeHtml(scenario.id)}"
                    data-key="${key}"
                  ></td>
                `).join('')}
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderCompanyEditor(state) {
    return `
      <section class="cluster-panel" aria-labelledby="clusterCompanyEditorTitle">
        <div class="cluster-panel-head"><div><h3 id="clusterCompanyEditorTitle">${escapeHtml(t('simulation.companyInputs'))}</h3><p>${escapeHtml(t('companies.factorDerived'))}</p></div></div>
        <div class="cluster-table-wrap">
          <table class="cluster-table cluster-input-table">
            <caption class="sr-only">${escapeHtml(t('simulation.companyInputs'))}</caption>
            <thead><tr>
              <th scope="col">${escapeHtml(t('general.company'))}</th>
              ${Data.COMPANY_METRIC_DEFINITIONS.map((metric) => `<th scope="col">${escapeHtml(metric.key)}</th>`).join('')}
            </tr></thead>
            <tbody>${state.companies.map((company) => {
              const hydrated = Model.hydrateCompany(company);
              return `
                <tr>
                  <th scope="row">${escapeHtml(company.company)}</th>
                  ${Data.COMPANY_METRIC_DEFINITIONS.map((metric) => `
                    <td><input
                      type="number" min="0" max="20" step="0.1"
                      value="${formatScore(hydrated[metric.key])}"
                      aria-label="${escapeHtml(`${company.company}: ${localize(metric.title)}`)}"
                      data-cluster-change="company-metric"
                      data-company-id="${escapeHtml(company.id)}"
                      data-key="${metric.key}"
                    ></td>
                  `).join('')}
                </tr>
              `;
            }).join('')}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  function renderFactorEditor(state) {
    const company = getSelectedCompany();
    const metric = Model.getMetricDefinition(state.selectedMetricKey) || Data.CORE_METRIC_DEFINITIONS[0];
    const aggregate = Model.calculateCompanyMetric(company, metric.key);
    return `
      <section class="cluster-panel" aria-labelledby="clusterFactorEditorTitle">
        <div class="cluster-panel-head cluster-toolbar-head">
          <div><h3 id="clusterFactorEditorTitle">${escapeHtml(t('simulation.factorEditor'))}</h3><p>${escapeHtml(t('simulation.factorEditorDesc'))}</p></div>
          <div class="cluster-filter-row">
            <label class="cluster-field"><span>${escapeHtml(t('general.company'))}</span><select data-cluster-change="select-company">${state.companies.map((entry) => `<option value="${escapeHtml(entry.id)}" ${entry.id === company.id ? 'selected' : ''}>${escapeHtml(entry.company)}</option>`).join('')}</select></label>
            <label class="cluster-field"><span>${escapeHtml(t('general.parameter'))}</span><select data-cluster-change="select-metric">${Data.COMPANY_METRIC_DEFINITIONS.map((entry) => `<option value="${entry.key}" ${entry.key === metric.key ? 'selected' : ''}>${escapeHtml(localize(entry.title))}</option>`).join('')}</select></label>
          </div>
        </div>
        <div class="cluster-factor-editor-grid">
          ${metric.factors.map((factor) => {
            const value = company.factors[metric.key][factor.key];
            return `
              <label class="cluster-factor-input">
                <span>${escapeHtml(localize(factor.title))}</span>
                <input
                  type="number" min="0" max="20" step="0.1" value="${formatScore(value)}"
                  data-cluster-change="company-factor"
                  data-company-id="${escapeHtml(company.id)}"
                  data-metric-key="${metric.key}"
                  data-factor-key="${factor.key}"
                >
              </label>
            `;
          }).join('')}
          <div class="cluster-factor-aggregate"><span>${escapeHtml(t('metrics.aggregate'))}</span><strong class="${scoreTone(aggregate)}">${formatScore(aggregate)}</strong></div>
        </div>
      </section>
    `;
  }

  function getMonteCarlo(state, scenario) {
    if (!monteCarloCache || monteCarloCache.scenarioId !== scenario.id) {
      monteCarloCache = { scenarioId: scenario.id, result: Model.runMonteCarlo(scenario, state.companies, state.monteCarlo) };
    }
    return monteCarloCache.result;
  }

  function renderUncertainty(state, scenario) {
    const sensitivity = Model.runSensitivity(scenario, state.companies, 0.05);
    const monteCarlo = getMonteCarlo(state, scenario);
    return `
      <div class="cluster-two-column balanced">
        <section class="cluster-panel" aria-labelledby="clusterSensitivityTitle">
          <div class="cluster-panel-head"><div><h3 id="clusterSensitivityTitle">${escapeHtml(t('simulation.sensitivityTitle'))}</h3><p>${escapeHtml(t('simulation.sensitivityDesc'))}</p></div></div>
          <div class="cluster-chart" id="clusterSensitivityChart" role="img" aria-label="${escapeHtml(t('simulation.sensitivityTitle'))}"></div>
          <div class="cluster-table-wrap compact-results">
            <table class="cluster-table compact-table"><caption class="sr-only">${escapeHtml(t('simulation.sensitivityTitle'))}</caption><thead><tr><th scope="col">${escapeHtml(t('general.parameter'))}</th><th scope="col">${escapeHtml(t('outcome.depth'))}</th><th scope="col">${escapeHtml(t('outcome.retention'))}</th></tr></thead><tbody>
              ${sensitivity.slice(0, 8).map((row) => `<tr><th scope="row">${escapeHtml(t(`parameter.${row.key}`))}</th><td>${row.depthImpact20 >= 0 ? '+' : ''}${row.depthImpact20.toFixed(2)}</td><td>${row.retentionImpact20 >= 0 ? '+' : ''}${row.retentionImpact20.toFixed(2)}</td></tr>`).join('')}
            </tbody></table>
          </div>
        </section>

        <section class="cluster-panel" aria-labelledby="clusterMonteCarloTitle">
          <div class="cluster-panel-head"><div><h3 id="clusterMonteCarloTitle">${escapeHtml(t('simulation.monteCarloTitle'))}</h3><p>${escapeHtml(t('simulation.monteCarloDesc'))}</p></div></div>
          <div class="cluster-mc-controls">
            <label class="cluster-field"><span>${escapeHtml(t('simulation.uncertainty'))}</span><input type="number" min="0" max="5" step="0.5" value="${state.monteCarlo.uncertainty20}" data-cluster-change="mc-uncertainty"></label>
            <label class="cluster-field"><span>${escapeHtml(t('simulation.iterations'))}</span><select data-cluster-change="mc-iterations">${[200, 400, 800, 1200].map((value) => `<option value="${value}" ${state.monteCarlo.iterations === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>
            <label class="cluster-field"><span>${escapeHtml(t('simulation.seed'))}</span><input type="number" step="1" value="${state.monteCarlo.seed}" data-cluster-change="mc-seed"></label>
            <button type="button" class="cluster-btn primary" data-cluster-action="run-monte-carlo">${escapeHtml(t('action.run'))}</button>
          </div>
          <div class="cluster-chart short" id="clusterMonteCarloChart" role="img" aria-label="${escapeHtml(t('simulation.monteCarloTitle'))}"></div>
          <div class="cluster-mc-table">
            ${OUTCOME_KEYS.map((key) => `<div><strong>${escapeHtml(t(`outcome.${key}`))}</strong><span>${t('simulation.p10')} ${formatScore(monteCarlo.summary[key].p10)}</span><span>${t('simulation.median')} ${formatScore(monteCarlo.summary[key].p50)}</span><span>${t('simulation.p90')} ${formatScore(monteCarlo.summary[key].p90)}</span></div>`).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderSimulation(state) {
    const scenario = getSelectedScenario();
    return `
      <div class="cluster-view cluster-simulation-view">
        <section class="cluster-panel cluster-sim-intro" aria-labelledby="clusterSimulationTitle">
          <div class="cluster-panel-head cluster-toolbar-head">
            <div><h3 id="clusterSimulationTitle">${escapeHtml(t('simulation.title'))}</h3><p>${escapeHtml(t('simulation.desc'))}</p></div>
          </div>
          <p class="cluster-sim-note">${escapeHtml(t('simulation.savedLocal'))}</p>
          ${renderSimulationToolbar(state, scenario)}
        </section>

        <div class="cluster-sim-workspace">
          ${renderScenarioEditor(state)}
          ${renderCompanyEditor(state)}
          ${renderFactorEditor(state)}
          ${renderUncertainty(state, scenario)}
        </div>
      </div>
    `;
  }

  function renderActiveView(state) {
    if (activeMainTab === 'markets') return renderMarkets(state);
    if (activeMainTab === 'sectors') return renderSectors(state);
    if (activeMainTab === 'companies') return renderCompanies(state);
    if (activeMainTab === 'network') return renderNetwork(state);
    if (activeMainTab === 'methodology') return renderMethodology();
    if (activeMainTab === 'metrics') return renderMetrics(state);
    if (activeMainTab === 'decisions') return renderDecisions(state);
    if (activeMainTab === 'simulation') return renderSimulation(state);
    return renderScenarios(state);
  }

  function renderCharts() {
    const state = getState();
    const scenario = getSelectedScenario();
    if (activeMainTab === 'scenarios') {
      const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);
      Charts.renderTrajectory('clusterTrajectoryChart', {
        mode: trajectoryMode,
        scenario,
        scenarios: state.scenarios,
        companies: state.companies,
        trajectory,
        trajectories: trajectoryMode === 'scenarios'
          ? Model.buildScenarioTrajectorySet(state.scenarios, state.companies)
          : undefined,
        selectedScenarioId: scenario.id,
        selectedCompanyId: state.selectedCompanyId,
        onScenarioSelect: trajectoryMode === 'scenarios'
          ? (scenarioId) => Simulation.selectScenario(scenarioId)
          : undefined,
      }, language());
      if (activeExplorerTab !== 'data') {
        Charts.renderExplorer('clusterExplorerChart', activeExplorerTab, scenario, state.scenarios, state.companies, language());
      }
    }
    if (activeMainTab === 'network') Charts.renderNetwork('clusterNetworkChart', state.companies, Data.NETWORK_EDGES, language());
    if (activeMainTab === 'decisions') {
      const decision = Model.getDecisionLayer(scenario, state.companies, { pathways: getPathways() });
      Charts.renderPortfolio('clusterPortfolioChart', decision.pathwayPortfolios, language());
    }
    if (activeMainTab === 'simulation') {
      const sensitivity = Model.runSensitivity(scenario, state.companies, 0.05);
      Charts.renderSensitivity('clusterSensitivityChart', sensitivity, language());
      Charts.renderMonteCarlo('clusterMonteCarloChart', getMonteCarlo(state, scenario), language());
    }
  }

  // Every Plotly-backed chart id renderCharts() can mount into clusterScenarioGrid,
  // across every tab. Purged unconditionally before each re-render since it's a
  // safe no-op for ids not currently mounted - see cluster-charts.js purge().
  const CLUSTER_CHART_IDS = [
    'clusterTrajectoryChart', 'clusterExplorerChart', 'clusterNetworkChart',
    'clusterPortfolioChart', 'clusterSensitivityChart', 'clusterMonteCarloChart',
  ];

  function renderClusterAnalysis() {
    const grid = root.document.getElementById('clusterScenarioGrid');
    if (!grid) return;
    root.ClusterAccess?.render?.();
    if (root.ClusterAccess?.isUnlocked() !== true) {
      Charts.purge(CLUSTER_CHART_IDS);
      grid.innerHTML = '';
      return;
    }
    ensureMainTabs();
    updateSectionMeta();
    Charts.purge(CLUSTER_CHART_IDS);
    grid.innerHTML = `${renderActiveView(getState())}<div id="clusterToast" class="cluster-toast" role="status" aria-live="polite" hidden></div>`;
    root.requestAnimationFrame?.(() => {
      if (root.ClusterAccess?.isUnlocked() === true && root.document.getElementById('clusterScenarioGrid')) renderCharts();
    });
  }

  function showToast(message) {
    const toast = root.document.getElementById('clusterToast');
    if (!toast) return;
    root.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = root.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = root.URL.createObjectURL(blob);
    const link = root.document.createElement('a');
    link.href = url;
    link.download = filename;
    root.document.body.appendChild(link);
    link.click();
    link.remove();
    root.URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function exportDecisionCsv() {
    if (root.ClusterAccess?.isUnlocked() !== true) return false;
    const state = getState();
    const decision = Model.getDecisionLayer(getSelectedScenario(), state.companies, { pathways: getPathways() });
    const headers = ['company', 'cluster', 'sector', 'priority_0_20', 'primary_bottleneck', 'bottleneck_0_20', 'capex_m_eur', 'abatement_kt_year', 'first_start_year', 'confidence_0_20'];
    const rows = decision.companyPriorities.map((company) => [
      company.company,
      company.cluster,
      company.sector,
      formatScore(company.priority),
      company.primaryBottleneck,
      formatScore(company.bottleneckSeverity),
      company.capexM,
      company.abatementKt,
      company.firstStartYear || '',
      formatScore(company.dataConfidence),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    downloadFile('cluster-decision-analysis.csv', csv, 'text/csv;charset=utf-8');
  }

  async function copyShareLink() {
    const url = Simulation.getShareUrl();
    if (!url) {
      showToast(t('toast.linkFailed'));
      return;
    }
    try {
      if (root.navigator?.clipboard?.writeText) {
        await root.navigator.clipboard.writeText(url);
      } else {
        const input = root.document.createElement('textarea');
        input.value = url;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        root.document.body.appendChild(input);
        input.select();
        root.document.execCommand('copy');
        input.remove();
      }
      showToast(t('toast.linkCopied'));
    } catch (error) {
      showToast(t('toast.linkFailed'));
    }
  }

  function handleAction(button) {
    const action = button.dataset.clusterAction;
    if (action === 'main-tab') {
      if (!MAIN_TABS.includes(button.dataset.tab)) return;
      activeMainTab = button.dataset.tab;
      renderClusterAnalysis();
      return;
    }
    if (action === 'explorer-tab') {
      if (!EXPLORER_TABS.includes(button.dataset.tab)) return;
      activeExplorerTab = button.dataset.tab;
      renderClusterAnalysis();
      return;
    }
    if (action === 'trajectory-mode') {
      if (!['scenarios', 'companies'].includes(button.dataset.mode)) return;
      trajectoryMode = button.dataset.mode;
      renderClusterAnalysis();
      return;
    }
    if (action === 'select-sector') {
      if (!Data.SECTOR_PATHWAYS.some((sector) => sector.id === button.dataset.sectorId)) return;
      selectedSectorPathwayId = button.dataset.sectorId;
      renderClusterAnalysis();
      return;
    }
    if (action === 'nuclear-step') {
      const scenario = getSelectedScenario();
      const current = scenario.technologies?.nuclearReactors || 0;
      Simulation.updateScenarioTechnology(scenario.id, 'nuclearReactors', current + Number(button.dataset.delta || 0));
      return;
    }
    if (action === 'electrolyzer-step') {
      const scenario = getSelectedScenario();
      const current = scenario.technologies?.electrolyzerUnits || 0;
      Simulation.updateScenarioTechnology(scenario.id, 'electrolyzerUnits', current + Number(button.dataset.delta || 0));
      return;
    }
    if (action === 'select-scenario') {
      Simulation.selectScenario(button.dataset.scenarioId);
      return;
    }
    if (action === 'open-company-profile') {
      root.openCompanyModal?.(button.dataset.companyId);
      return;
    }
    if (action === 'select-company') {
      if (activeMainTab === 'sectors') activeMainTab = 'companies';
      Simulation.selectCompany(button.dataset.companyId);
      return;
    }
    if (action === 'clone-scenario') {
      Simulation.cloneScenario(getSelectedScenario().id, language());
      showToast(t('toast.cloned'));
      return;
    }
    if (action === 'reset-scenario') {
      Simulation.resetScenario(getSelectedScenario().id);
      showToast(t('toast.reset'));
      return;
    }
    if (action === 'delete-scenario') {
      Simulation.deleteScenario(getSelectedScenario().id);
      showToast(t('toast.deleted'));
      return;
    }
    if (action === 'reset-all') {
      if (root.confirm?.(t('action.resetAllConfirm')) === false) return;
      Simulation.resetAll();
      showToast(t('toast.reset'));
      return;
    }
    if (action === 'undo') {
      Simulation.undo();
      showToast(t('toast.undo'));
      return;
    }
    if (action === 'export-json') {
      downloadFile('cluster-analysis-state.json', Simulation.exportStateJson(), 'application/json;charset=utf-8');
      return;
    }
    if (action === 'trigger-import') {
      root.document.getElementById('clusterImportFile')?.click();
      return;
    }
    if (action === 'export-csv') {
      exportDecisionCsv();
      return;
    }
    if (action === 'share') {
      copyShareLink();
      return;
    }
    if (action === 'print') {
      activeMainTab = 'decisions';
      renderClusterAnalysis();
      root.setTimeout(() => root.print(), 120);
      return;
    }
    if (action === 'run-monte-carlo') {
      const scenario = getSelectedScenario();
      monteCarloCache = { scenarioId: scenario.id, result: Model.runMonteCarlo(scenario, getState().companies, getState().monteCarlo) };
      renderClusterAnalysis();
    }
  }

  function handleChange(control) {
    const type = control.dataset.clusterChange;
    if (type === 'select-scenario') Simulation.selectScenario(control.value);
    if (type === 'comparison-scenario') Simulation.selectComparisonScenario(control.value);
    if (type === 'select-company') Simulation.selectCompany(control.value);
    if (type === 'select-metric') Simulation.selectMetric(control.value);
    if (type === 'company-region-filter') {
      companyRegionFilter = Data.STATISTICAL_REGIONS.some((region) => region.id === control.value) ? control.value : 'all';
      renderClusterAnalysis();
    }
    if (type === 'company-activity-filter') {
      companyActivityFilter = control.value;
      renderClusterAnalysis();
    }
    if (type === 'scenario-value') Simulation.updateScenarioValue(control.dataset.scenarioId, control.dataset.key, control.value);
    if (type === 'technology-toggle') {
      Simulation.updateScenarioTechnology(control.dataset.scenarioId, control.dataset.key, control.checked);
    }
    if (type === 'nuclear-reactors') {
      Simulation.updateScenarioTechnology(control.dataset.scenarioId, 'nuclearReactors', control.value);
    }
    if (type === 'electrolyzer-units') {
      Simulation.updateScenarioTechnology(control.dataset.scenarioId, 'electrolyzerUnits', control.value);
    }
    if (type === 'hydrogen-ammonia-share') {
      Simulation.updateScenarioTechnology(control.dataset.scenarioId, 'hydrogenToAmmoniaShare', control.value);
    }
    if (type === 'company-metric') Simulation.updateCompanyMetric(control.dataset.companyId, control.dataset.key, control.value);
    if (type === 'company-factor') {
      Simulation.updateCompanyFactor(control.dataset.companyId, control.dataset.metricKey, control.dataset.factorKey, control.value);
    }
    if (type === 'mc-uncertainty' || type === 'mc-iterations' || type === 'mc-seed') {
      const current = getState().monteCarlo;
      Simulation.setMonteCarloOptions({
        uncertainty20: type === 'mc-uncertainty' ? control.value : current.uncertainty20,
        iterations: type === 'mc-iterations' ? control.value : current.iterations,
        seed: type === 'mc-seed' ? control.value : current.seed,
      });
    }
    if (type === 'import-file') {
      const file = control.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = Simulation.importStateJson(String(reader.result || ''));
        showToast(t(result.ok ? 'toast.imported' : 'toast.importFailed'));
      };
      reader.onerror = () => showToast(t('toast.importFailed'));
      reader.readAsText(file);
      control.value = '';
    }
  }

  function handleInput(control) {
    if (control.dataset.clusterInput !== 'company-search') return;
    companySearch = control.value;
    renderClusterAnalysis();
    root.requestAnimationFrame?.(() => {
      const next = root.document.querySelector('[data-cluster-input="company-search"]');
      if (next) {
        next.focus();
        next.setSelectionRange(next.value.length, next.value.length);
      }
    });
  }

  root.document.addEventListener('click', (event) => {
    if (root.ClusterAccess?.isUnlocked() !== true) return;
    const button = event.target.closest('[data-cluster-action]');
    if (!button || !root.document.getElementById('section-cluster')?.contains(button)) return;
    handleAction(button);
  });

  root.document.addEventListener('change', (event) => {
    if (root.ClusterAccess?.isUnlocked() !== true) return;
    const control = event.target.closest('[data-cluster-change]');
    if (!control || !root.document.getElementById('section-cluster')?.contains(control)) return;
    handleChange(control);
  });

  root.document.addEventListener('input', (event) => {
    if (root.ClusterAccess?.isUnlocked() !== true) return;
    const control = event.target.closest('[data-cluster-input]');
    if (!control || !root.document.getElementById('section-cluster')?.contains(control)) return;
    handleInput(control);
  });

  Simulation.subscribe((event) => {
    if (!['selection', 'monte-carlo-options'].includes(event.type)) monteCarloCache = null;
    renderClusterAnalysis();
  });

  root.ClusterAnalysis = Object.freeze({
    render: renderClusterAnalysis,
    setActiveMainTab(tabId) {
      if (root.ClusterAccess?.isUnlocked() !== true) return false;
      if (!MAIN_TABS.includes(tabId)) return false;
      activeMainTab = tabId;
      renderClusterAnalysis();
      return true;
    },
    getActiveMainTab: () => activeMainTab,
    exportDecisionCsv,
  });

  if (root.document.readyState === 'loading') {
    root.document.addEventListener('DOMContentLoaded', () => {
      const active = root.document.getElementById('section-cluster')?.classList.contains('active');
      if (active) renderClusterAnalysis();
    }, { once: true });
  } else if (root.document.getElementById('section-cluster')?.classList.contains('active')) {
    renderClusterAnalysis();
  }
})(window);
