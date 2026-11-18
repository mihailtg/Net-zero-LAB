const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

function environment() {
  let language = 'en';
  const nodes = new Map();
  const configs = new Map();
  const context = { console, document: { documentElement: { getAttribute: () => language }, addEventListener() {}, getElementById: (id) => nodes.get(id) || null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null }, getComputedStyle: () => ({ getPropertyValue: () => '' }),
    Chart: class { constructor(node, config) { Object.assign(this, config); configs.set(node.id, config); } update() {} destroy() {} },
  };
  context.window = context; vm.createContext(context);
  for (const file of ['core-i18n-bg.js', 'core-i18n.js', 'cluster-data.js', 'app.js']) vm.runInContext(read(file), context);
  const value = (expression) => JSON.parse(vm.runInContext(`JSON.stringify(${expression})`, context));
  return { context, value, nodes, configs, language: (lang) => { language = lang; } };
}

test('corrected 2023 and final 2024 IPPU values are shared by the application and JSON dataset', () => {
  const { context, value } = environment();
  const inventory = JSON.parse(JSON.stringify(context.getInfographicSourceData().inventory));
  assert.deepEqual(inventory, JSON.parse(read('db_data.json')));
  assert.equal(inventory.nat_2023.ippu, 3925.62);
  assert.equal(inventory.ippu_hist.find((row) => row.year === 2023).total, 3925.62);
  assert.equal(inventory.chemical_industry_emissions_trend.find((row) => row.year === 2023).value, 3925.62);
  assert.equal(inventory.ippu_hist.find((row) => row.year === 2022).total, 4554.75, 'earlier years must remain intact');
  assert.equal(inventory.ippu_hist.at(-1).year, 2024);
  assert.equal(inventory.ippu_hist.at(-1).total, 4096.25);
  assert.equal(inventory.chemical_industry_emissions_trend.at(-1).value, 4096.25);
  const latest = value('getIppuBreakdown()');
  assert.deepEqual(latest.rows.map((row) => row.value), [2039.82, 1076.03, 200.08, 14.17, null, 713.86, 52.29, null]);
  assert.deepEqual(latest.rows.map((row) => row.notation), [null, null, null, null, 'NO', null, null, 'IE,NA']);
  assert.ok(Math.abs(latest.sum - latest.total) < 1e-8);
  assert.equal(latest.difference, 0);
  assert.equal(value('getIppuBreakdown(2023)').difference, 69.97, 'no unsupported sector reassignment');
});

test('dashboard and emissions charts show the corrected totals, all eight latest categories and literal notations', () => {
  const { context, nodes, configs, value } = environment();
  for (const id of ['emissionsTrendChart', 'ipuPieChart', 'ippuTotalChart', 'ippu2023PieChart', 'ippuStackedChart', 'ippuDataTable', 'dashboardIppuNote', 'ippuReconciliation', 'ippuBreakdownTotal', 'chemicalIppuShare', 'chemicalIppuShareBar', 'chemicalIppuShareNote']) nodes.set(id, { id, innerHTML: '', textContent: '', style: {} });
  context.buildCharts(); context.buildIppuCharts(); context.updateDashboardWithDbData();
  for (const id of ['emissionsTrendChart', 'ippuTotalChart']) {
    const config = configs.get(id);
    const labels = Array.from(config.data.labels).map(Number);
    assert.equal(config.data.datasets[0].data[labels.indexOf(2023)], 3925.62);
    assert.equal(config.data.datasets[0].data[labels.indexOf(2024)], 4096.25);
  }
  for (const id of ['ipuPieChart', 'ippu2023PieChart']) {
    const config = configs.get(id);
    assert.deepEqual(Array.from(config.data.datasets[0].data), [2039.82, 1076.03, 200.08, 14.17, null, 713.86, 52.29, null]);
    assert.match(config.data.labels[4], /NO/); assert.match(config.data.labels[7], /IE,NA/);
    assert.match(config.options.plugins.tooltip.callbacks.label({ label: '2.B', parsed: 1076.03 }), /26.3%/);
  }
  const stack = configs.get('ippuStackedChart');
  assert.equal(stack.data.datasets.length, 9);
  assert.equal(stack.data.datasets[3].data.at(-1), 14.17);
  assert.equal(stack.data.datasets[4].data.at(-1), null);
  assert.equal(stack.data.datasets[7].data.at(-1), null);
  assert.equal(stack.data.datasets.at(-1).type, 'line');
  assert.equal(stack.data.datasets.at(-1).data.at(-1), 4096.25);
  assert.match(nodes.get('ippuDataTable').innerHTML, /NO/);
  assert.match(nodes.get('ippuDataTable').innerHTML, /IE,NA/);
  assert.match(nodes.get('ippuBreakdownTotal').textContent, /4,096.25/);
  assert.match(nodes.get('dashboardIppuNote').textContent, /69.97/);
  assert.equal(nodes.get('chemicalIppuShare').textContent, '26.3%');
});

test('dataset tables preserve notations and update values and category labels in Bulgarian', () => {
  const { context, nodes, language } = environment();
  nodes.set('datasetStats', { innerHTML: '' }); nodes.set('datasetContent', { innerHTML: '' });
  context.renderDatasetTables();
  assert.match(nodes.get('datasetContent').innerHTML, /Industrial Processes and Product Use \(IPPU\) breakdown 2024/);
  assert.match(nodes.get('datasetContent').innerHTML, /NO/); assert.match(nodes.get('datasetContent').innerHTML, /IE,NA/);
  language('bg'); context.renderDatasetTables();
  assert.match(nodes.get('datasetContent').innerHTML, /Разбивка на индустриални процеси и използване на продукти \(IPPU\) 2024/);
  assert.match(nodes.get('datasetContent').innerHTML, /Електронна промишленост/);
  assert.match(nodes.get('datasetContent').innerHTML, /4096,25|4\s096,25/);
  assert.match(nodes.get('datasetStats').innerHTML, /2010-2024/);
  assert.doesNotMatch(nodes.get('datasetContent').innerHTML, /in-app dataset|app\.js|Database_01|предоставени от|supplied by/);
  assert.match(nodes.get('datasetContent').innerHTML, /https:\/\/unfccc.int\/documents\/656446/);
});
