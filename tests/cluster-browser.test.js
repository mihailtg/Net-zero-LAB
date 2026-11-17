const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Plotly is served locally so protected charts do not depend on a CDN', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const plotlyPath = path.join(__dirname, '..', 'vendor', 'plotly-2.35.2.min.js');

  assert.match(html, /<script src="vendor\/plotly-2\.35\.2\.min\.js"><\/script>/);
  assert.doesNotMatch(html, /<script src="https:\/\/cdn\.plot\.ly\//);
  assert.ok(fs.statSync(plotlyPath).size > 4_000_000);
});

test('browser modules register in dependency order', () => {
  let currentLanguage = 'en';
  let clusterUnlocked = false;
  const listeners = new Map();
  const nodes = new Map();
  const grid = { id: 'clusterScenarioGrid', innerHTML: '' };
  const section = { id: 'section-cluster', contains: () => true, classList: { contains: () => true } };
  const sectionDesc = {
    parentElement: {},
    insertAdjacentElement(position, node) { nodes.set(node.id, node); },
  };
  nodes.set(grid.id, grid);
  nodes.set(section.id, section);
  ['clusterMatrixTitle', 'clusterMatrixDesc', 'clusterScenarioNote'].forEach((id) => nodes.set(id, { id, textContent: '' }));
  const document = {
    readyState: 'loading',
    documentElement: { getAttribute: () => currentLanguage },
    addEventListener(type, listener) { listeners.set(type, listener); },
    getElementById(id) { return nodes.get(id) || null; },
    querySelector(selector) { return selector === '#section-cluster .section-desc' ? sectionDesc : null; },
    createElement(tagName) {
      return {
        tagName,
        id: '',
        className: '',
        innerHTML: '',
        setAttribute() {},
      };
    },
  };
  const context = {
    ClusterAccess: { isUnlocked: () => clusterUnlocked, render() {} },
    console,
    document,
    location: { href: 'http://127.0.0.1:8765/index.html', hash: '' },
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    structuredClone,
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem(key) {
        if (key !== 'nzlClusterSimulationDataV4') return null;
        return JSON.stringify({
          version: 4,
          selectedScenarioId: 'cluster',
          scenarios: [{
            id: 'cluster',
            technologies: { greenHydrogen: false, ccs: true, nuclearReactors: 2 },
          }],
        });
      },
      setItem() {},
    },
    requestAnimationFrame(callback) { callback(); },
    btoa(value) { return Buffer.from(value, 'binary').toString('base64'); },
    atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  const files = [
    'company-registry-2025.js',
    'core-i18n-bg.js',
    'core-i18n.js',
    'cluster-data.js',
    'cluster-i18n.js',
    'cluster-model.js',
    'cluster-simulation.js',
    'cluster-charts.js',
    'cluster-analysis.js',
    'industrial-geography.js',
  ];
  files.forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  });

  ['ClusterData', 'ClusterI18n', 'ClusterModel', 'ClusterSimulation', 'ClusterCharts', 'ClusterAnalysis', 'IndustrialGeography']
    .forEach((name) => assert.ok(context[name], `${name} was not registered`));
  ['click', 'change', 'input', 'DOMContentLoaded']
    .forEach((type) => assert.ok(listeners.has(type), `${type} listener was not registered`));

  const migrated = context.ClusterSimulation.getSelectedScenario().technologies;
  assert.equal(context.ClusterSimulation.getState().version, 8);
  assert.equal(context.ClusterSimulation.getState().scenarios.length, 7);
  assert.equal(migrated.greenHydrogen, true);
  assert.equal(migrated.nuclearReactors, 0);
  assert.equal(migrated.electrolyzers, true);
  assert.equal(migrated.electrolyzerUnits, 10);
  assert.equal(migrated.ammoniaStorage, true);
  assert.equal(migrated.hydrogenToAmmoniaShare, 50);

  context.ClusterAnalysis.render();
  assert.equal(grid.innerHTML, '');
  assert.equal(context.ClusterAnalysis.setActiveMainTab('simulation'), false);
  assert.equal(context.ClusterAnalysis.exportDecisionCsv(), false);
  clusterUnlocked = true;
  context.ClusterAnalysis.render();
  const roster = () => grid.innerHTML.match(/<ul class="cluster-roster-list">([\s\S]*?)<\/ul>/)[1];
  const rosterIds = () => [...roster().matchAll(/data-scenario-id="([^"]+)"/g)].map((match) => match[1]);
  const expectedScenarioOrder = Array.from(context.ClusterSimulation.getState().scenarios, (scenario) => scenario.id);
  assert.match(grid.innerHTML, /Different scenarios/);
  assert.deepEqual(rosterIds(), expectedScenarioOrder);
  assert.doesNotMatch(roster(), /cluster-rank|cluster-roster-score|cluster-roster-secondary/);
  assert.equal(context.ClusterSimulation.updateScenarioValue('growth', 'finance', 0), true);
  assert.deepEqual(rosterIds(), expectedScenarioOrder);
  assert.equal(context.ClusterSimulation.undo(), true);
  assert.match(grid.innerHTML, /data-cluster-change="technology-toggle"/);
  assert.match(grid.innerHTML, /data-key="greenHydrogen"/);
  assert.match(grid.innerHTML, /data-key="electrolyzers"/);
  assert.match(grid.innerHTML, /data-key="ammoniaStorage"/);
  assert.match(grid.innerHTML, /data-key="ccs"/);
  assert.match(grid.innerHTML, /data-cluster-action="electrolyzer-step"/);
  assert.match(grid.innerHTML, /data-cluster-action="nuclear-step"/);
  assert.match(grid.innerHTML, /data-cluster-action="trajectory-mode"/);
  assert.match(grid.innerHTML, /cluster-scenario-basis/);
  assert.match(grid.innerHTML, /Early emissions cuts, then stagnation/);
  assert.match(grid.innerHTML, /Zero emissions through industrial closure/);

  assert.equal(context.ClusterSimulation.selectScenario('stalled'), true);
  context.ClusterAnalysis.render();
  assert.match(grid.innerHTML, /Fast response, low plateau/);
  assert.match(grid.innerHTML, /Modelled reduction in 2030/);
  assert.doesNotMatch(grid.innerHTML, /undefined|NaN/);

  assert.equal(context.ClusterSimulation.selectScenario('shutdown'), true);
  context.ClusterAnalysis.render();
  assert.match(grid.innerHTML, /Zero emissions do not mean a successful transition/);
  assert.match(grid.innerHTML, /Closure-driven reduction in 2050/);
  assert.match(grid.innerHTML, /Industry operating in 2050/);
  assert.doesNotMatch(grid.innerHTML, /undefined|NaN/);

  assert.equal(context.ClusterSimulation.selectScenario('cluster'), true);
  context.ClusterAnalysis.render();

  assert.equal(context.ClusterAnalysis.setActiveMainTab('markets'), true);
  assert.match(grid.innerHTML, /data-cluster-change="hydrogen-ammonia-share"/);
  assert.match(grid.innerHTML, /clusterFuelMixTitle/);
  assert.match(grid.innerHTML, /clusterNeochimAnchorTitle/);
  assert.doesNotMatch(grid.innerHTML, /undefined|NaN/);

  assert.equal(context.ClusterAnalysis.setActiveMainTab('sectors'), true);
  assert.match(grid.innerHTML, /clusterSectorPathTitle/);
  assert.match(grid.innerHTML, /clusterInstallationRankingTitle/);
  assert.match(grid.innerHTML, /LUKOIL Neftochim Bourgas AD/);
  assert.match(grid.innerHTML, /6,462,515/);
  assert.equal((grid.innerHTML.match(/data-company-id=/g) || []).length, 20);
  assert.doesNotMatch(grid.innerHTML, /undefined|NaN/);

  // Once unlocked, visitors can use simulations and editors without additional prompts.
  context.ClusterSimulation.setMonteCarloOptions({ iterations: 100, uncertainty20: 0 });
  assert.equal(context.ClusterAnalysis.setActiveMainTab('simulation'), true);
  assert.match(grid.innerHTML, /cluster-sim-workspace/);
  assert.doesNotMatch(grid.innerHTML, /type="password"|is-locked|cluster-sim-overlay|undefined|NaN/);
  assert.match(grid.innerHTML, /data-cluster-action="clone-scenario"\s*>/);
  assert.match(grid.innerHTML, /data-cluster-action="trigger-import"\s*>/);
  assert.equal(context.ClusterSimulation.updateScenarioValue('cluster', 'finance', 12), true);
  assert.equal(context.ClusterSimulation.getState().scenarios.find((scenario) => scenario.id === 'cluster').values.finance, 0.6);
  assert.equal(context.ClusterSimulation.undo(), true);
  assert.equal(context.ClusterAnalysis.setActiveMainTab('scenarios'), true);

  currentLanguage = 'bg';
  context.ClusterAnalysis.render();
  assert.match(grid.innerHTML, /Различни сценарии/);
  assert.match(roster(), /Ядрена енергия и електрификация на индустрията/);
  assert.match(roster(), /ВЕИ, зелен водород и зелен амоняк/);
  assert.doesNotMatch(roster(), /Ядрена опора|зелени молекули|Класация/);
  assert.deepEqual(rosterIds(), expectedScenarioOrder);
  assert.equal(context.ClusterAnalysis.setActiveMainTab('companies'), true);
  const search = { dataset: { clusterInput: 'company-search' }, value: 'Неохим' };
  listeners.get('input')({ target: { closest: () => search } });
  assert.match(grid.innerHTML, /data-cluster-action="select-company" data-company-id="neochim"/);
  assert.doesNotMatch(grid.innerHTML, /data-cluster-action="select-company" data-company-id="aurubis"/);
  search.value = '';
  listeners.get('input')({ target: { closest: () => search } });

  const regionalFilter = { dataset: { clusterChange: 'company-region-filter' }, value: 'all' };
  const chooseRegion = (value) => {
    regionalFilter.value = value;
    listeners.get('change')({ target: { closest: () => regionalFilter } });
  };
  const participantIds = () => [...grid.innerHTML.matchAll(/data-cluster-action="select-company" data-company-id="([^"]+)"/g)].map((match) => match[1]);
  const options = () => grid.innerHTML.match(/data-cluster-change="company-region-filter">([\s\S]*?)<\/select>/)[1];
  assert.equal((options().match(/<option /g) || []).length, 7);
  assert.match(options(), /Всички райони/);
  for (const name of ['Северозападен', 'Северен централен', 'Североизточен', 'Югоизточен', 'Югозападен', 'Южен централен']) assert.ok(options().includes(name));
  assert.doesNotMatch(options(), /Devnya|Burgas|Девня|Бургас/);
  const expectedParticipants = {
    BG31: ['zlatna-panega', 'holcim', 'rubin'],
    BG32: ['amylum', 'han-asparuh', 'orgachim', 'biovet'],
    BG33: ['solvay', 'heidelberg', 'trakya-glass', 'agropolychim', 'pasabahce'],
    BG34: ['lukoil', 'promet-steel'],
    BG41: ['znhv-puklina', 'stomana', 'ba-glass-sofia', 'aurubis', 'biovet'],
    BG42: ['neochim', 'ba-glass-plovdiv', 'calcit', 'ognyanovo-k', 'biovet', 'agria'],
  };
  for (const [regionId, expected] of Object.entries(expectedParticipants)) {
    chooseRegion(regionId);
    assert.deepEqual(participantIds().sort(), expected.sort(), regionId);
  }
  chooseRegion('BG33');
  search.value = 'Неохим';
  listeners.get('input')({ target: { closest: () => search } });
  assert.deepEqual(participantIds(), []);
  search.value = 'Солвей';
  listeners.get('input')({ target: { closest: () => search } });
  assert.deepEqual(participantIds(), ['solvay']);
  search.value = '';
  listeners.get('input')({ target: { closest: () => search } });
  currentLanguage = 'en';
  context.ClusterAnalysis.render();
  assert.match(options(), /All regions/);
  assert.match(options(), /value="BG33" selected>North-East/);
  assert.deepEqual(participantIds().sort(), expectedParticipants.BG33.sort());
  chooseRegion('all');
  assert.equal(participantIds().length, 23);
  assert.equal(new Set(participantIds()).size, 23);
  const profileIds = () => [...grid.innerHTML.matchAll(/data-cluster-action="open-company-profile" data-company-id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(profileIds().length, 56);
  assert.ok(profileIds().includes('kcm'));
  assert.ok(profileIds().includes('keraminzhenering'));
  const activityControl = { dataset: { clusterChange: 'company-activity-filter' }, value: 'ceramics' };
  listeners.get('change')({ target: { closest: () => activityControl } });
  assert.equal(profileIds().length, 15);
  assert.ok(profileIds().includes('vos-ceramics'));
  assert.ok(!profileIds().includes('solvay'));
  activityControl.value = 'all';
  listeners.get('change')({ target: { closest: () => activityControl } });
  assert.doesNotMatch(grid.innerHTML, /company-cluster-filter/);
  assert.equal(context.ClusterAnalysis.setActiveMainTab('scenarios'), true);

  const chartClasses = new Set();
  const chartHandlers = new Map();
  let chartTraces = [];
  let chartRenderCount = 0;
  const trajectoryChart = {
    id: 'clusterTrajectoryChart',
    classList: {
      add(name) { chartClasses.add(name); },
      remove(name) { chartClasses.delete(name); },
    },
    on(type, listener) { chartHandlers.set(type, listener); },
    removeListener(type, listener) {
      if (chartHandlers.get(type) === listener) chartHandlers.delete(type);
    },
  };
  nodes.set(trajectoryChart.id, trajectoryChart);
  context.getComputedStyle = () => ({ getPropertyValue: () => '' });
  context.Plotly = {
    react(mount, traces) {
      assert.equal(mount, trajectoryChart);
      chartTraces = traces;
      chartRenderCount += 1;
    },
    purge() {},
  };

  assert.equal(context.ClusterAnalysis.setActiveMainTab('scenarios'), true);
  assert.ok(chartClasses.has('cluster-chart-selectable'));
  assert.equal(typeof chartHandlers.get('plotly_click'), 'function');
  assert.equal(typeof chartHandlers.get('plotly_legendclick'), 'function');

  const clusterTrace = chartTraces.find((trace) => trace.meta?.scenarioId === 'cluster');
  const stalledTrace = chartTraces.find((trace) => trace.meta?.scenarioId === 'stalled');
  assert.equal(clusterTrace.mode, 'lines+markers');
  assert.equal(stalledTrace.mode, 'lines');
  assert.equal(chartTraces.filter((trace) => trace.meta?.entityType === 'scenario').at(-1).meta.scenarioId, 'cluster');
  chartHandlers.get('plotly_click')({ points: [{ data: stalledTrace }] });
  assert.equal(context.ClusterSimulation.getSelectedScenario().id, 'stalled');
  assert.equal(chartTraces.find((trace) => trace.meta?.scenarioId === 'stalled').mode, 'lines+markers');
  assert.equal(chartTraces.filter((trace) => trace.meta?.entityType === 'scenario').at(-1).meta.scenarioId, 'stalled');
  assert.match(grid.innerHTML, /Fast response, low plateau/);

  const growthIndex = chartTraces.findIndex((trace) => trace.meta?.scenarioId === 'growth');
  const legendResult = chartHandlers.get('plotly_legendclick')({ curveNumber: growthIndex, data: chartTraces });
  assert.equal(legendResult, false);
  assert.equal(context.ClusterSimulation.getSelectedScenario().id, 'growth');
  assert.equal(chartTraces.find((trace) => trace.meta?.scenarioId === 'growth').mode, 'lines+markers');
  assert.ok(chartTraces.filter((trace) => trace.meta?.entityType === 'scenario').every((trace) => trace.visible !== false));

  const rendersBeforeRepeatClick = chartRenderCount;
  const selectedTrace = chartTraces.find((trace) => trace.meta?.scenarioId === 'growth');
  chartHandlers.get('plotly_click')({ points: [{ data: selectedTrace }] });
  assert.equal(chartRenderCount, rendersBeforeRepeatClick);
});

test('version 7 state keeps user edits while adding the two stress scenarios', () => {
  const stored = new Map();
  const context = {
    console,
    location: { href: 'http://127.0.0.1:8765/index.html', hash: '' },
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    structuredClone,
    localStorage: {
      getItem(key) {
        if (key !== 'nzlClusterSimulationDataV7') return null;
        return JSON.stringify({
          version: 7,
          selectedScenarioId: 'cluster',
          scenarios: [
            { id: 'cluster', values: { finance: 0.123 }, technologies: { greenHydrogen: false } },
            {
              id: 'saved-v7-scenario',
              custom: true,
              name: { en: 'Saved V7 scenario', bg: 'Запазен V7 сценарий' },
              values: { finance: 0.42 },
            },
          ],
        });
      },
      setItem(key, value) { stored.set(key, value); },
    },
    btoa(value) { return Buffer.from(value, 'binary').toString('base64'); },
    atob(value) { return Buffer.from(value, 'base64').toString('binary'); },
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);

  ['cluster-data.js', 'cluster-model.js', 'cluster-simulation.js'].forEach((file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    vm.runInContext(source, context, { filename: file });
  });

  const state = context.ClusterSimulation.getState();
  assert.equal(state.version, 8);
  assert.equal(state.scenarios.length, 8);
  assert.equal(state.scenarios.find((scenario) => scenario.id === 'cluster').values.finance, 0.123);
  assert.ok(state.scenarios.some((scenario) => scenario.id === 'saved-v7-scenario'));
  assert.equal(state.scenarios.find((scenario) => scenario.id === 'stalled').transitionDynamics.type, 'front_loaded_plateau');
  assert.equal(state.scenarios.find((scenario) => scenario.id === 'shutdown').transitionDynamics.type, 'deindustrialisation');
  assert.ok(stored.has('nzlClusterSimulationDataV8'));
});

test('saved built-in scenarios receive current wording while inputs and custom scenario text are retained', () => {
  const Data = require('../cluster-data.js');
  const saved = Data.createDefaultState();
  const growth = saved.scenarios.find((scenario) => scenario.id === 'growth');
  growth.name = { en: 'Renewables and green molecules', bg: 'ВЕИ и зелени молекули' };
  growth.role = { en: 'Green-molecule opportunity', bg: 'Възможност за зелени молекули' };
  growth.values.finance = 0.123;
  growth.technologies.electrolyzerUnits = 31;
  saved.selectedScenarioId = 'growth';
  saved.scenarios.push({
    ...structuredClone(growth), id: 'my-industrial-scenario', custom: true,
    name: { en: 'My industrial scenario', bg: 'Моят индустриален сценарий' },
    role: { en: 'My assumptions', bg: 'Моите допускания' },
    description: { en: 'User-defined pathway.', bg: 'Потребителски технологичен път.' },
  });
  const context = {
    console, structuredClone,
    localStorage: {
      getItem: (key) => key === 'nzlClusterSimulationDataV8' ? JSON.stringify(saved) : null,
      setItem() {},
    },
  };
  context.window = context;
  vm.createContext(context);
  ['cluster-data.js', 'cluster-model.js', 'cluster-simulation.js'].forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  });
  const state = context.ClusterSimulation.getState();
  const currentGrowth = state.scenarios.find((scenario) => scenario.id === 'growth');
  const defaultGrowth = Data.DEFAULT_SCENARIOS.find((scenario) => scenario.id === 'growth');
  assert.equal(currentGrowth.name.bg, defaultGrowth.name.bg);
  assert.equal(currentGrowth.role.bg, defaultGrowth.role.bg);
  assert.equal(currentGrowth.description.bg, defaultGrowth.description.bg);
  assert.equal(currentGrowth.values.finance, 0.123);
  assert.equal(currentGrowth.technologies.electrolyzerUnits, 31);
  assert.equal(state.selectedScenarioId, 'growth');
  const custom = state.scenarios.find((scenario) => scenario.id === 'my-industrial-scenario');
  assert.equal(custom.name.bg, 'Моят индустриален сценарий');
  assert.equal(custom.role.bg, 'Моите допускания');
  assert.equal(custom.description.bg, 'Потребителски технологичен път.');
});
