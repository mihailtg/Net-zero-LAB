const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

function element(tag, children = [], attributes = {}) {
  const node = {
    nodeType: 1, tagName: tag.toUpperCase(), childNodes: children, attributes,
    isConnected: true,
    getAttribute(name) { return this.attributes[name] ?? null; },
    hasAttribute(name) { return Object.hasOwn(this.attributes, name); },
    setAttribute(name, value) { this.attributes[name] = value; },
    closest() { return null; },
  };
  children.forEach((child) => { child.parentElement = node; });
  return node;
}
const textNode = (nodeValue) => ({ nodeType: 3, nodeValue });

function environment(body = element('body')) {
  const html = element('html', [], { 'data-lang': 'en' });
  const nodes = new Map();
  const timers = [];
  const chartConfigs = new Map();
  const context = {
    console,
    document: {
      body, readyState: 'loading', documentElement: html,
      getElementById: (id) => nodes.get(id) || null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener() {},
    },
    localStorage: { getItem: () => null, setItem() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    setTimeout: (callback) => { timers.push(callback); },
    Chart: class {
      constructor(node, config) { Object.assign(this, config); chartConfigs.set(node.id, config); }
      update() {}
      destroy() {}
    },
  };
  context.window = context;
  vm.createContext(context);
  ['company-registry-2025.js', 'core-i18n-bg.js', 'core-i18n.js'].forEach((name) => vm.runInContext(read(name), context));
  return { context, html, nodes, timers, chartConfigs, i18n: context.CoreI18n, run: (code) => vm.runInContext(code, context) };
}

function decode(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, code) => (
    code[0] === '#' ? String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))) : entities[code]
  ));
}

test('all unkeyed static English copy has an explicit Bulgarian translation', () => {
  const messages = require('../core-i18n-bg.js');
  const source = read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  const missing = new Set();
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  for (const token of source.match(/<[^>]*>|[^<]+/g) || []) {
    if (token.startsWith('</')) {
      const tag = token.match(/^<\/([\w-]+)/)?.[1];
      const index = stack.findLastIndex((entry) => entry.tag === tag);
      if (index >= 0) stack.splice(index);
    } else if (token.startsWith('<')) {
      const tag = token.match(/^<([\w-]+)/)?.[1];
      if (tag && !voidTags.has(tag)) stack.push({ tag, keyed: /\bdata-i18n=/.test(token) });
    } else if (!stack.some((entry) => entry.keyed || ['head', 'code', 'script', 'style'].includes(entry.tag))) {
      const text = decode(token).replace(/\s+/g, ' ').trim();
      if (/[a-z]{3}/i.test(text) && !Object.hasOwn(messages, text)) missing.add(text);
    }
  }
  assert.deepEqual([...missing], []);
  assert.ok(Object.keys(messages).length > 900);
  assert.ok(Object.values(messages).every((message) => !/\?{3}|\uFFFD/.test(message)), 'translations must be valid UTF-8');
});

test('language round trips preserve markup, input values, keyed labels and hidden company state', () => {
  const label = textNode('  How it works  ');
  const dynamic = textNode('Year-by-Year Breakdown');
  const keyed = textNode('Managed by its own module');
  const input = element('input', [], { placeholder: 'Close' });
  input.value = '321.75';
  const hiddenCompany = element('div', [textNode('Svilosa AD')], { hidden: '', 'data-company': 'svilosa' });
  const body = element('body', [element('h3', [label]), element('p', [dynamic]), element('span', [keyed], { 'data-i18n': 'module.key' }), input, hiddenCompany]);
  const { html, i18n } = environment(body);
  html.setAttribute('data-lang', 'bg');
  i18n.apply();
  assert.equal(label.nodeValue, '  Как работи  ');
  assert.equal(dynamic.nodeValue, 'Разбивка по години');
  assert.equal(keyed.nodeValue, 'Managed by its own module');
  assert.equal(input.getAttribute('placeholder'), 'Затвори');
  assert.equal(input.value, '321.75');
  assert.equal(hiddenCompany.hasAttribute('hidden'), true);
  assert.equal(hiddenCompany.childNodes[0].nodeValue, 'Свилоза АД');
  dynamic.nodeValue = 'Annual CO₂ emissions';
  i18n.apply();
  assert.equal(dynamic.nodeValue, 'Годишни емисии на CO₂');
  html.setAttribute('data-lang', 'en');
  i18n.apply();
  assert.equal(label.nodeValue, '  How it works  ');
  assert.equal(dynamic.nodeValue, 'Annual CO₂ emissions');
  assert.equal(input.getAttribute('placeholder'), 'Close');
  assert.equal(input.value, '321.75');
});

test('newly rendered DOM content translates without replacing form controls', () => {
  const body = element('body');
  const { context, html, i18n, run } = environment(body);
  let onMutation;
  context.document.readyState = 'complete';
  context.MutationObserver = class {
    constructor(callback) { onMutation = callback; }
    observe() {}
  };
  // Reload only the service to start its observer with the provided DOM.
  run(read('core-i18n.js'));
  html.setAttribute('data-lang', 'bg');
  const generated = element('span', [textNode('Annual CO₂ emissions')]);
  body.childNodes.push(generated);
  generated.parentElement = body;
  onMutation([{ type: 'childList', addedNodes: [generated] }]);
  assert.equal(generated.childNodes[0].nodeValue, 'Годишни емисии на CO₂');
  onMutation([{ type: 'characterData', target: generated.childNodes[0] }]);
  assert.equal(generated.childNodes[0].nodeValue, 'Годишни емисии на CO₂');
});

test('every active company description and project note is translated without changing model data', () => {
  const { context, run, i18n } = environment();
  ['cluster-data.js', 'app.js'].forEach((name) => run(read(name)));
  const companies = JSON.parse(run('JSON.stringify(companies)'));
  const projects = JSON.parse(run('JSON.stringify(ROI_PATHWAYS)'));
  const bgText = (value) => value && typeof value === 'object' ? value.bg : i18n.text(value, 'bg');
  for (const company of companies) {
    for (const field of ['description', 'location', 'sector', 'emissions', 'turnover', 'crf', 'ets', 'netZeroLab', 'challenge']) {
      assert.notEqual(bgText(company[field]), company[field]?.en || company[field], `${company.id}.${field}`);
    }
    for (const value of [...company.initiatives, ...company.pathways]) {
      assert.ok(bgText(value) !== (value?.en || value) || Object.hasOwn(i18n.messages, value?.en || value), `${company.id}: ${value}`);
    }
  }
  for (const project of projects) {
    assert.notEqual(i18n.text(project.name, 'bg'), project.name, project.name);
    assert.notEqual(i18n.text(project.note, 'bg'), project.note, project.note);
  }
  assert.ok(context.ClusterData.createDefaultCompanies().every((company) => company.id !== 'svilosa'));
  assert.equal(run('ROI_PATHWAYS.find(p => p.id === "hm-anrav").capex_M'), 600);
});

test('chart labels, callback text and captions follow the language without changing values or this binding', () => {
  const { html, i18n } = environment();
  html.setAttribute('data-lang', 'bg');
  const source = { type: 'bar', data: { labels: ['Neochim', 'Chemical\nIndustry\n(1.A.2.c)'], datasets: [{ label: 'Liquid fuels', data: [12.5, 40] }] }, options: { plugins: { tooltip: { callbacks: { label() { return this.label; } } } } } };
  const translated = i18n.chartConfig(source);
  assert.equal(translated.type, 'bar');
  assert.equal(translated.options.locale, 'bg-BG');
  assert.equal(translated.data.labels[0], 'Неохим');
  assert.equal(translated.data.labels[1], 'Химическа индустрия (1.A.2.c)');
  assert.equal(translated.data.datasets[0].label, 'Течни горива');
  assert.deepEqual(Array.from(translated.data.datasets[0].data), [12.5, 40]);
  assert.equal(source.data.datasets[0].label, 'Liquid fuels');
  assert.equal(translated.options.plugins.tooltip.callbacks.label.call({ label: '3.2 yrs (long-term)' }), '3.2 год. (дългосрочно)');
  assert.equal(i18n.text('Cumul. Investment — All Companies Combined (M€)'), 'Кумулативна инвестиция — Всички компании общо (млн. €)');
  assert.equal(i18n.text('Active pathway groups: Green H₂ / ammonia · Biomass / circularity'), 'Активни технологични групи: Зелен H₂ / амоняк · Биомаса / кръгови решения');
  html.setAttribute('data-lang', 'en');
  assert.equal(i18n.chartConfig(source).data.datasets[0].label, 'Liquid fuels');
});

test('application language switch keeps calculator inputs, costs and scenario selection', () => {
  const { html, nodes, run, context, chartConfigs } = environment();
  ['cluster-data.js', 'app.js'].forEach((name) => run(read(name)));
  nodes.set('vol-neochim-nh3', { value: '456.7' });
  for (const id of ['cbamChart', 'paybackChart', 'energySubsecChart', 'processEmsChart', 'companyEmissionsChart', 'fuelGroupChart', 'mfgFuelChart', 'ck-2026', 'ck-2026-sub', 'ck-2030', 'ck-2030-sub', 'ck-cumul']) nodes.set(id, { id });
  run('currentScenario = "high"; currentRoiScenario = "low"; setLanguage("bg");');
  run('calcCBAM(); buildPaybackChart(); buildSubsectorCharts(); buildFuel2023Charts();');
  const costs = run('JSON.stringify(lastCalcResult)');
  assert.equal(chartConfigs.get('cbamChart').data.datasets[1].label, 'Неохим');
  assert.equal(chartConfigs.get('fuelGroupChart').data.labels[0], 'Енергийна индустрия');
  assert.equal(chartConfigs.get('mfgFuelChart').data.datasets[0].label, 'Течни горива');
  assert.ok(chartConfigs.get('paybackChart').data.labels.every((label) => /[\u0400-\u04ff]/.test(label)));
  assert.equal(html.getAttribute('data-lang'), 'bg');
  assert.equal(nodes.get('vol-neochim-nh3').value, '456.7');
  assert.equal(run('currentScenario'), 'high');
  assert.equal(run('currentRoiScenario'), 'low');
  run('setLanguage("en")');
  run('calcCBAM()');
  assert.equal(chartConfigs.get('cbamChart').data.datasets[1].label, 'Neochim');
  assert.equal(run('JSON.stringify(lastCalcResult)'), costs);
  assert.equal(nodes.get('vol-neochim-nh3').value, '456.7');
  assert.equal(context.CoreI18n.text('Year'), 'Year');
  const source = read('index.html');
  assert.ok(source.indexOf('src="core-i18n-bg.js"') < source.indexOf('src="core-i18n.js"'));
  assert.ok(source.indexOf('src="core-i18n.js"') < source.indexOf('src="app.js"'));
});

test('Plotly display data translates while IDs, coordinates and event metadata stay intact', () => {
  const { html, i18n, run, context } = environment();
  ['cluster-data.js', 'cluster-i18n.js'].forEach((name) => run(read(name)));
  html.setAttribute('data-lang', 'bg');
  const trace = { name: 'Neochim AD', text: ['Glass', 'Dimitrovgrad'], customdata: [['Fertiliser, Ammonia & Nitric Acid', 553.866]], x: [25.6], y: [42.1], ids: ['neochim'], meta: { entityType: 'companies', scenarioId: 'cluster' } };
  const result = i18n.plotTraces([trace])[0];
  assert.equal(result.name, 'Неохим АД');
  assert.equal(result.text[0], 'Стъкло');
  assert.equal(result.customdata[0][0], 'Торове, амоняк и азотна киселина');
  assert.equal(result.customdata[0][1], 553.866);
  assert.equal(result.meta, trace.meta);
  assert.equal(result.ids, trace.ids);
  assert.equal(result.x, trace.x);
  for (const company of context.ClusterData.createDefaultCompanies()) {
    for (const value of [company.sector, company.specificSector, company.cluster, company.provenance.method, company.provenance.note]) {
      assert.match(context.ClusterI18n.localize(value), /[\u0400-\u04ff]/, value);
    }
  }
});

test('Company Profiles contains the exact active cluster roster and opens a sourced profile for every participant', () => {
  const { context, nodes, run } = environment();
  ['cluster-data.js', 'app.js'].forEach((name) => run(read(name)));
  const profiles = JSON.parse(run('JSON.stringify(companies)'));
  const participants = Array.from(context.ClusterData.createCompanyRoster());
  assert.deepEqual(profiles.map((profile) => [profile.id, profile.name]), participants.map((company) => [company.id, company.company]));
  assert.equal(profiles.length, 56);
  assert.equal(new Set(profiles.map((profile) => profile.id)).size, 56);
  assert.equal(profiles.filter((profile) => profile.baselineOnly).length, 47);
  assert.ok(profiles.every((profile) => profile.id !== 'svilosa'));
  assert.equal(run('companies.find(profile => profile.id === "agropolychim").description === COMPANY_PROFILE_DETAILS.find(profile => profile.id === "agropolychim").description'), true);
  assert.equal(run('companies.find(profile => profile.id === "solvay").initiatives.length'), 6);
  assert.equal(run('CO_KEYS.length'), 8);

  const grid = { id: 'companyGrid', innerHTML: '' };
  const modal = { id: 'modalBody', innerHTML: '' };
  nodes.set(grid.id, grid);
  nodes.set(modal.id, modal);
  nodes.set('companyModal', { classList: { add() {}, remove() {} } });
  context.renderCompanyGrid();
  assert.equal((grid.innerHTML.match(/class="company-card"/g) || []).length, 56);
  assert.doesNotMatch(grid.innerHTML, /\[object Object\]|undefined|svilosa/i);
  assert.doesNotMatch(grid.innerHTML, /co-maturity|mat-advanced|mat-early|Not assessed|Best-in-class/);
  assert.ok(profiles.every(profile => !Object.hasOwn(profile, 'maturity')));
  for (const profile of profiles) {
    context.openCompanyModal(profile.id);
    assert.ok(decode(modal.innerHTML).includes(profile.name), profile.id);
    assert.doesNotMatch(modal.innerHTML, /\[object Object\]|undefined/);
    assert.doesNotMatch(modal.innerHTML, /project owner|собственика на проекта|blob\/main|Database_01|Heidelberg-Part01/i);
    assert.ok(modal.innerHTML.includes(context.ClusterData.ETS_REGISTRY_URL));
    if (profile.baselineOnly && Number.isFinite(profile.emissions2024Kt)) {
      const participant = participants.find((company) => company.id === profile.id);
      assert.ok(modal.innerHTML.includes(`${participant.emissions2024Kt.toFixed(3)} Kt CO₂eq`), profile.id);
      assert.ok(modal.innerHTML.includes(participant.provenance.url), profile.id);
      assert.ok(modal.innerHTML.includes(participant.provenance.emissionsUrl), profile.id);
      assert.match(modal.innerHTML, /sector-level options, not confirmed company commitments/);
    }
  }
});

test('company employment translates both ways while preserving the open profile and activity filter', () => {
  const { context, nodes, run } = environment();
  ['cluster-data.js', 'app.js'].forEach((name) => run(read(name)));
  const grid = { id: 'companyGrid', innerHTML: '' };
  const modal = { id: 'modalBody', innerHTML: '' };
  const modalClasses = new Set();
  nodes.set(grid.id, grid);
  nodes.set(modal.id, modal);
  nodes.set('companyModal', { classList: { add: (value) => modalClasses.add(value), remove: (value) => modalClasses.delete(value) } });
  nodes.set('datasetStats', { innerHTML: '' });
  nodes.set('datasetContent', { innerHTML: '' });
  context.filterCompanyProfiles('glass', '');
  context.openCompanyModal('rubin');
  context.setLanguage('bg');
  assert.equal((grid.innerHTML.match(/class="company-card"/g) || []).length, 6);
  assert.doesNotMatch(grid.innerHTML, /Без оценка|Напреднал етап|Начален етап|co-maturity/);
  assert.match(grid.innerHTML, /Пряко ангажирани служители · 2025/);
  assert.match(modal.innerHTML, /<strong>586<\/strong>/);
  assert.match(modal.innerHTML, /Рубин АД/);
  assert.match(modal.innerHTML, /Възможни технологични пътища за сектора/);
  assert.match(modal.innerHTML, /Няма данни в текущия набор/);
  assert.doesNotMatch(nodes.get('datasetContent').innerHTML, /\[object Object\]/);
  assert.doesNotMatch(nodes.get('datasetContent').innerHTML, /Зрялост|Без оценка/);
  assert.match(nodes.get('datasetContent').innerHTML, /Пряко ангажирани служители · 2025/);
  assert.equal(run('activeCompanyProfileId'), 'rubin');
  assert.ok(modalClasses.has('open'));
  context.setLanguage('en');
  assert.match(modal.innerHTML, /Rubin Trading EAD/);
  assert.match(modal.innerHTML, /Sector transition options/);
  assert.equal(run('currentCompanyActivityFilter'), 'glass');
  assert.equal(run('activeCompanyProfileId'), 'rubin');
  assert.match(modal.innerHTML, /Direct employees · 2025/);
  context.openCompanyModal('ba-glass-plovdiv');
  assert.match(modal.innerHTML, /<strong>592<\/strong>/);
  assert.match(modal.innerHTML, /Operator total · not allocated by site/);
  context.openCompanyModal('industrial-solutions');
  assert.match(modal.innerHTML, /Direct employees · 2025<\/span><strong>Not available<\/strong>/);
});
