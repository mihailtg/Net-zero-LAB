const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function dashboard({ restored = false } = {}) {
  const nodes = new Map();
  const charts = new Map();
  const marked = [{ dataset: { company: 'svilosa' }, hidden: true, disabled: true, tagName: 'OPTION' }];
  const count = { textContent: '' };
  const context = {
    console, structuredClone,
    document: {
      documentElement: { getAttribute: () => 'en' },
      addEventListener() {},
      getElementById: (id) => nodes.get(id) || null,
      querySelectorAll: (selector) => selector === '[data-company]' ? marked
        : selector === '[data-calculator-company-count]' ? [count] : [],
      createElement: () => ({ click() {} }),
    },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    Chart: class {
      constructor(node, config) { Object.assign(this, config); charts.set(node.id, config); }
      update() {}
      destroy() {}
    },
    Blob: class { constructor(parts) { context.csv = parts.join(''); } },
    URL: { createObjectURL: () => 'blob:test' },
    localStorage: { getItem: () => null, setItem() {} },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('company-registry-2025.js'), context);
  let source = read('cluster-data.js');
  if (restored) source = source.replace("Object.freeze(['svilosa'])", 'Object.freeze([])');
  vm.runInContext(source, context);
  vm.runInContext(read('app.js'), context);
  const run = (code) => vm.runInContext(code, context);
  const value = (code) => JSON.parse(run(`JSON.stringify(${code})`));
  return { context, nodes, marked, count, charts, run, value };
}

test('inactive company is absent from profiles, datasets, costs, project charts and CSV', () => {
  const { context, nodes, marked, count, charts, run, value } = dashboard();
  ['companyGrid', 'datasetStats', 'datasetContent', 'cbamTableBody', 'cbamTableFoot',
    'ck-2026', 'ck-2026-sub', 'ck-2030', 'ck-2030-sub', 'ck-cumul', 'cbamChart', 'macChart', 'paybackChart']
    .forEach((id) => nodes.set(id, { id, innerHTML: '', textContent: '' }));
  // A stale, nonzero input must not add the hidden company's costs to any total.
  nodes.set('vol-svilosa-pulp', { value: '200' });
  run('applyCompanyVisibility(); renderCompanyGrid(); renderDatasetTables(); calcCBAM(); buildMacChart(); buildPaybackChart(); exportCSV();');
  assert.equal(marked[0].hidden, true);
  assert.equal(marked[0].disabled, true);
  assert.equal(count.textContent, 8);
  assert.doesNotMatch(nodes.get('companyGrid').innerHTML, /svilosa/i);
  assert.doesNotMatch(nodes.get('datasetContent').innerHTML, /svilosa/i);
  assert.doesNotMatch(context.csv, /svilosa/i);
  assert.ok(value('Object.values(lastCalcResult).flat()').every((cost) => cost === 0));
  assert.equal(value('CO_KEYS').length, 8);
  assert.equal(value('CBAM_CO_LABELS').length, 8);
  charts.forEach((chart) => assert.doesNotMatch(JSON.stringify(chart.data), /svilosa/i));
  assert.ok(value('ROI_PATHWAYS').every((project) => project.co !== 'Svilosa'));
  assert.doesNotMatch(value('I18N.en["section.roi.pill"]'), /9 companies/);
  assert.match(value('I18N.bg["section.roi.pill"]'), /8 /);
});

test('one visibility setting restores retained company data, UI and projects', () => {
  const hidden = dashboard();
  const restored = dashboard({ restored: true });
  restored.run('applyCompanyVisibility()');
  assert.equal(restored.marked[0].hidden, false);
  assert.equal(restored.marked[0].disabled, false);
  assert.equal(restored.count.textContent, 9);
  assert.equal(restored.value('companies.find(co => co.id === "svilosa").name'), 'Svilosa AD');
  assert.equal(restored.value('ROI_PATHWAYS.filter(p => p.co === "Svilosa").length'), 4);
  assert.equal(hidden.value('getEmploymentSummary2025().total'), 19493);
  assert.equal(restored.value('getEmploymentSummary2025().total'), 19506);
  const Data = restored.context.ClusterData;
  assert.equal(Data.createDefaultCompanies().find((company) => company.id === 'svilosa').emissionsKt, 64.53);
  assert.ok(Data.NETWORK_EDGES.some((edge) => edge.source === 'svilosa'));
  assert.ok(Data.SHARED_INFRASTRUCTURE_OPPORTUNITIES.some((project) => project.members.includes('svilosa')));
  assert.deepEqual(hidden.value('DB.subsec_hist'), restored.value('DB.subsec_hist'));
  // Filtering must not change the generated factor profiles of the remaining companies.
  assert.deepEqual(hidden.value('ClusterData.createDefaultCompanies()'), restored.value('ClusterData.createDefaultCompanies().filter(co => co.id !== "svilosa")'));
});

test('saved scenarios cannot reintroduce an inactive company or its network memberships', () => {
  const { context } = dashboard();
  const saved = {
    version: 8,
    scenarios: [],
    companies: [{ id: 'svilosa', company: 'Svilosa AD' }],
    selectedCompanyId: 'svilosa',
  };
  context.localStorage.getItem = (key) => key === 'nzlClusterSimulationDataV8' ? JSON.stringify(saved) : null;
  ['cluster-model.js', 'cluster-simulation.js'].forEach((file) => vm.runInContext(read(file), context));
  const state = context.ClusterSimulation.getState();
  assert.ok(state.companies.every((company) => company.id !== 'svilosa'));
  assert.notEqual(state.selectedCompanyId, 'svilosa');
  assert.equal(context.ClusterSimulation.importStateJson(JSON.stringify(saved)).ok, true);
  assert.ok(context.ClusterSimulation.getState().companies.every((company) => company.id !== 'svilosa'));
  assert.ok(context.ClusterData.COMPANY_BASELINES.every((company) => company.id !== 'svilosa'));
  assert.ok(context.ClusterData.NETWORK_EDGES.every((edge) => edge.source !== 'svilosa' && edge.target !== 'svilosa'));
  assert.ok(context.ClusterData.SHARED_INFRASTRUCTURE_OPPORTUNITIES.every((project) => !project.members.includes('svilosa')));
});

test('browser loads company visibility settings before the dashboard', () => {
  const html = read('index.html');
  assert.ok(html.indexOf('<script src="cluster-data.js">') < html.indexOf('<script src="app.js">'));
  assert.match(html, /data-company="svilosa" hidden disabled/);
  assert.match(read('style.css'), /\[data-company\]\[hidden\]\s*\{\s*display:\s*none !important;/);
});
