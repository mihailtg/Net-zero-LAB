const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Data = require('../cluster-data');
const Model = require('../cluster-model');
const Infographics = require('../infographics');
const Geography = require('../bulgaria-regions');
const read = (name) => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');

// Evaluate the actual application data adapter, not a duplicate fixture of its numbers.
const context = {
  console, ClusterData: Data,
  document: { addEventListener() {}, getElementById: () => null, querySelectorAll: () => [], documentElement: { getAttribute: () => 'en' } },
  localStorage: { getItem: () => null },
};
context.window = context;
vm.createContext(context);
vm.runInContext(read('app.js'), context);
const source = context.getInfographicSourceData();
const english = Infographics.buildSeries(source, 'en');
const bulgarian = Infographics.buildSeries(source, 'bg');
const find = (id, cards = english) => cards.find((card) => card.id === id);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('infographic series covers the platform in both languages with exportable self-contained SVGs', () => {
  assert.equal(english.length, 12);
  assert.ok(!english.some(card => ['investment-scale', 'industrial-processes'].includes(card.id)));
  assert.deepEqual(bulgarian.map((card) => card.id), english.map((card) => card.id));
  for (const [index, card] of english.entries()) {
    const bg = bulgarian[index];
    assert.notEqual(bg.title, card.title);
    assert.notEqual(bg.subtitle, card.subtitle);
    assert.notEqual(bg.note, card.note);
    assert.match(bg.title, /[А-Яа-я]/);
    assert.ok(card.facts.length && bg.facts.length);
    for (const item of [card, bg]) {
      assert.match(item.svg, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
      assert.match(item.svg, /<title /);
      assert.match(item.svg, /<desc /);
      assert.match(item.svg, /aria-labelledby=/);
      assert.match(item.svg, new RegExp(`xml:lang="${item.lang}"`));
      assert.doesNotMatch(item.svg, /\b(?:undefined|NaN|Infinity)\b|\?{3}|\uFFFD|svilosa|Свилоза/i);
      assert.doesNotMatch(item.svg, /<script|<image|<foreignObject|https?:\/\/fonts/);
      if (['national-emissions', 'industrial-processes', 'emissions-history', 'six-regions', 'regional-emissions-map', 'company-landscape', 'bulgaria-auction-revenue'].includes(item.id)) assert.ok(item.sources.length > 0);
      assert.ok(item.sources.every((entry) => /^https:\/\//.test(entry.url)));
      assert.doesNotMatch(item.svg, /github\.com\/mihailtg|blob\/main|project owner|собственика на проекта|Database_01|Heidelberg-Part01|user-provided/i);
    }
  }
});

test('company ETS citations use the official Union Registry and internal model files are not public sources', () => {
  const registryUrl = 'https://climate.ec.europa.eu/areas-action/carbon-markets/eu-emissions-trading-system-eu-ets/union-registry_en';
  assert.equal(Data.ETS_REGISTRY_URL, registryUrl);
  assert.ok(find('company-landscape').sources.some(source => source.url === registryUrl));
  for (const cards of [english, bulgarian]) {
    cards.forEach(card => assert.ok(card.sources.every(source => !/github\.com|\/(?:app|cluster-data|cluster-model|company-registry-2025)\.js/.test(source.url))));
  }
});

test('national and process graphics reconcile to the inventory without mixing removals or ETS', () => {
  const national = find('national-emissions').data;
  near(national.gross, 45434.89);
  near(national.lulucf, -8601.07);
  assert.equal(find('emissions-history').data.history.length, 15);
  near(find('emissions-history').data.history.at(-1).total, 4096.25);
  near(find('emissions-history').data.history.find((row) => row.year === 2023).total, 3925.62);
  assert.match(find('national-emissions').note, /excludes industrial fuel combustion/);
});

test('six-region poster retains the verified 2024 set, while roster poster shares all active profiles', () => {
  const regional = find('six-regions').data;
  assert.deepEqual(regional.regions.map((region) => region.id), Data.STATISTICAL_REGIONS.map((region) => region.id));
  assert.deepEqual(regional.regions.map((region) => region.count), [3, 2, 5, 2, 4, 4]);
  near(regional.total, 6462.515);
  const roster = find('company-landscape').data;
  assert.deepEqual(roster.companyIds, Data.createCompanyRoster().map((company) => company.id));
  assert.equal(roster.companyIds.length, 56);
  assert.equal(roster.registry2025Count, 52);
  assert.equal(roster.verifiedCount, 20);
  assert.equal(roster.supplementalCount, 3);
  assert.match(find('six-regions').note, /not a complete regional/);
});

test('regional map shares reconcile to the bar chart and each shape uses the matching region', () => {
  const map = find('regional-emissions-map');
  const bars = find('six-regions').data;
  near(map.data.total, bars.total);
  near(map.data.regions.reduce((sum, region) => sum + region.share, 0), 100);
  assert.deepEqual(map.data.regions.map((region) => region.id), bars.regions.map((region) => region.id));
  for (const [index, region] of map.data.regions.entries()) {
    near(region.value, bars.regions[index].value);
    near(region.share, region.value / map.data.total * 100);
    assert.equal(region.count, bars.regions[index].count);
    assert.match(map.svg, new RegExp(`data-map-region="${region.id}"`));
    assert.ok(map.facts.some((fact) => fact.startsWith(region.id)));
  }
  assert.equal((map.svg.match(/data-map-region=/g) || []).length, 6);
  assert.match(map.note, /not all emissions in Bulgaria/);
  assert.match(map.note, /EuroGeographics/);
  assert.match(find('regional-emissions-map', bulgarian).note, /не всички емисии в България/);
  assert.ok(map.sources.some((source) => source.url === Geography.source));
  assert.ok(english.every((card) => card.svg.includes(' / 12')));
  const html = read('index.html');
  assert.ok(html.indexOf('src="bulgaria-regions.js"') < html.indexOf('src="infographics.js"'));
});

test('bundled official boundaries put representative cities in the correct planning region', () => {
  function inside([x, y], ring) {
    let result = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
      if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
    }
    return result;
  }
  const cities = { BG31: [22.87, 43.99], BG32: [25.97, 43.84], BG33: [27.91, 43.21], BG34: [27.46, 42.50], BG41: [23.32, 42.69], BG42: [24.75, 42.14] };
  assert.deepEqual(Geography.regions.map((region) => region.id), Data.STATISTICAL_REGIONS.map((region) => region.id));
  for (const region of Geography.regions) {
    assert.ok(region.polygons.some((polygon) => inside(cities[region.id], polygon[0]) && !polygon.slice(1).some((ring) => inside(cities[region.id], ring))), region.id);
    for (const polygon of region.polygons) for (const ring of polygon) {
      assert.deepEqual(ring[0], ring.at(-1));
      assert.ok(ring.every(([lon, lat]) => lon >= 22 && lon <= 29 && lat >= 41 && lat <= 45));
    }
  }
});

test('physical balance and ANRAV financing reconcile and label their assumptions', () => {
  const hydrogen = find('hydrogen-ammonia').data;
  near(hydrogen.electricityGWh, 122.64);
  near(hydrogen.h2Kt, 122.64 / 55);
  near(hydrogen.nh3Kt, hydrogen.h2Kt * .7 / (3 / 17));
  assert.match(find('hydrogen-ammonia').note, /before readiness/);
  const ccus = find('ccus-value-chain').data;
  near(ccus.grant + ccus.remaining, ccus.capex);
  assert.ok(ccus.storageIncluded < ccus.grant);
  assert.match(source.roiPathways.find((p) => p.id === 'hm-anrav').note, /€190M.*€38M.*€410M/);
  assert.match(find('ccus-value-chain').note, /not a verified final project budget/);
});

test('finance posters read actual calculator inputs and respond when those inputs change', () => {
  assert.deepEqual(Array.from(find('cbam-phase-in').data.factors), Array.from(source.cbamFactors));
  assert.deepEqual(Array.from(find('carbon-price-scenarios').data.prices[1].values), Array.from(source.etsPrices.base));
  const modified = { ...source, inventory: { ...source.inventory, nat_2023: { ...source.inventory.nat_2023, energy: 1000 } },
    roiPathways: source.roiPathways.map((p) => p.id === 'hm-anrav' ? { ...p, capex_M: 650 } : p) };
  const result = Infographics.buildSeries(modified, 'en');
  near(find('national-emissions', result).data.gross, 13581.43);
  near(find('ccus-value-chain', result).data.remaining, 460);
  assert.match(find('carbon-price-scenarios').note, /not live market prices/);
});

test('auction revenue poster preserves the full 2012–2025 series, reconciles the total and retains all annual sources', () => {
  const card = find('bulgaria-auction-revenue');
  const years = Array.from({ length: 14 }, (_, index) => 2012 + index);
  assert.deepEqual(card.data.years, years);
  assert.deepEqual(card.data.revenuesEur, [22137930, 53017680, 36192295, 120908480, 85079960, 130150145, 367342575, 439191170, 447545340, 830904805, 1091346540, 1167622025, 822205680, 829233344]);
  assert.equal(card.data.totalEur, 6442877969);
  assert.equal(card.data.revenuesEur.reduce((sum, value) => sum + value, 0), card.data.totalEur);
  assert.equal(card.data.scope, 'revenue-excludes-aviation-market-inputs-include-aviation');
  assert.deepEqual([...card.svg.matchAll(/data-revenue-year="(\d+)"/g)].map((match) => Number(match[1])), years);
  near(card.data.change2025Percent, (829233344 / 822205680 - 1) * 100);
  assert.equal(card.data.peakYear, 2023);
  assert.equal(card.data.peakRevenueEur, 1167622025);
  assert.equal(card.data.exceptional2013ReceiptEur, 388700);
  assert.equal(card.data.revenuesEur[1], 52628980 + card.data.exceptional2013ReceiptEur);
  assert.equal(card.sources.length, 14);
  for (const source of card.sources) {
    assert.match(source.url, /^https:\/\/www.moew.government.bg\/.*\.pdf$/);
    assert.ok(card.svg.includes(source.url));
  }
  assert.match(card.note, /reported historical revenue excludes aviation/);
  assert.match(card.note, /exceptional auction of remaining 2012 allowances/);
  assert.match(card.svg, /<metadata>/);
  assert.match(card.svg, /€ million/);
  assert.ok(card.printSources[0].url.includes('moew.government.bg/bg/'));
  const bg = find('bulgaria-auction-revenue', bulgarian);
  assert.match(bg.note, /без авиация/);
  assert.match(bg.title, /Приходи за България от търгове на квоти/);
  for (const omitted of [1094202075, 1172152695, 826345520, 2855535, 4530670, 4139840, 6949036]) {
    assert.ok(!card.data.revenuesEur.includes(omitted));
    assert.ok(!card.svg.replace(/[\s,]/g, '').includes(String(omitted)));
    assert.ok(!bg.svg.replace(/[\s,]/g, '').includes(String(omitted)));
  }
});

test('auction infographic includes all supplied prices, total quantities and the missing 2026 revenue without fabricating an observation', () => {
  const card = find('bulgaria-auction-revenue');
  assert.deepEqual(card.data.marketData.map((row) => row.priceEur), [6.76, 4.38, 5.92, 7.62, 5.26, 5.76, 15.43, 24.61, 24.28, 53.01, 79.78, 83.35, 64.69, 73.40]);
  assert.deepEqual(card.data.marketData.map((row) => row.totalAllowances), [3277000, 12110500, 6151500, 15990000, 16216000, 22632500, 23868500, 17889000, 18474000, 15711500, 13716000, 14062500, 12774500, 11392500]);
  assert.deepEqual(card.data.snapshot2026, { year: 2026, asOf: '2026-11-16', priceEur: 79.47, totalAllowances: 8014500, reportedRevenueExAviationEur: null });
  assert.equal(card.data.forecast2026.reportedRevenueExAviationEur, null);
  assert.equal((card.svg.match(/data-auction-table-year=/g) || []).length, 15);
  assert.match(card.svg, /Not separately reported/);
  assert.match(card.svg, /data-revenue-forecast-year="2026"/);
  assert.match(card.svg, /stroke-dasharray="5 3"/);
  assert.doesNotMatch(card.svg, /data-revenue-year="2026"/);
  assert.equal(card.height, 1680);
  assert.match(card.svg, /height="1680" viewBox="0 0 1200 1680"/);
  assert.match(read('infographics.css'), /@page ig-portrait/);
});

test('2026 forecast annualizes the inclusive 16 November snapshot and applies an explicit 2025 non-aviation revenue share', () => {
  const estimate = Infographics.estimateAuctionRevenue();
  assert.equal(estimate.elapsedDays, 320);
  assert.equal(estimate.yearDays, 365);
  near(estimate.grossProxyYtdEur, 636912315);
  near(estimate.installationShare, 829233344 / 836182380);
  near(estimate.annualInstallationRevenueEur, 720440763.0725789);
  assert.equal(Math.round(estimate.annualInstallationRevenueEur / 100000), 7204);
  assert.ok(estimate.annualInstallationRevenueEur < estimate.grossProxyYtdEur * 365 / 320);
  const changed = Infographics.estimateAuctionRevenue({ year: 2026, asOf: '2026-11-16', priceEur: 158.94, totalAllowances: 8014500, reportedRevenueExAviationEur: null });
  near(changed.annualInstallationRevenueEur, estimate.annualInstallationRevenueEur * 2);
  const noAviation = Infographics.estimateAuctionRevenue({ year: 2026, asOf: '2026-12-31', priceEur: 79.47, totalAllowances: 8014500, reportedRevenueExAviationEur: null }, { installationRevenueEur: 1, aviationRevenueEur: 0 });
  near(noAviation.annualInstallationRevenueEur, 636912315);
  assert.throws(() => Infographics.estimateAuctionRevenue({ year: 2026, asOf: '2026-02-30', priceEur: 79.47, totalAllowances: 8014500 }), RangeError);
  assert.equal(find('bulgaria-auction-revenue').data.totalEur, 6442877969, 'forecast must not enter the historical total');
});

test('all 14 revenue columns share a zero baseline and proportional heights with distinct peak/latest highlights', () => {
  const card = find('bulgaria-auction-revenue');
  const bars = [...card.svg.matchAll(/<rect data-revenue-year="(\d+)" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" rx="[\d.]+" fill="([#\w]+)"/g)]
    .map((match) => ({ year: Number(match[1]), x: Number(match[2]), y: Number(match[3]), width: Number(match[4]), height: Number(match[5]), color: match[6] }));
  assert.equal(bars.length, 14);
  bars.forEach((bar, index) => {
    near(bar.y + bar.height, bars[0].y + bars[0].height);
    near(bar.height / card.data.revenuesEur[index], bars[0].height / card.data.revenuesEur[0]);
    if (index) assert.ok(bar.x > bars[index - 1].x + bars[index - 1].width);
  });
  assert.notEqual(bars.find((bar) => bar.year === 2023).color, bars[0].color);
  assert.notEqual(bars.at(-1).color, bars[0].color);
});

test('scenario poster preserves default order and separates closure from technology reductions', () => {
  const rows = find('different-scenarios').data.scenarios;
  const state = Data.createDefaultState();
  assert.deepEqual(rows.map((row) => row.id), state.scenarios.map((scenario) => scenario.id));
  for (const [index, row] of rows.entries()) {
    const final = Model.buildTransitionTrajectory(state.scenarios[index], state.companies).aggregate.points.at(-1);
    near(row.value, final.reduction * 100);
    near(row.technical + row.closure, row.value);
  }
  const shutdown = rows.find((row) => row.id === 'shutdown');
  assert.equal(shutdown.activity, 0);
  assert.ok(shutdown.closure > shutdown.technical);
  assert.match(find('different-scenarios').note, /no ranking/);
});

test('gallery is wired into navigation, language switching and responsive print styling', () => {
  const html = read('index.html');
  const app = read('app.js');
  assert.match(html, /data-section="infographics"/);
  assert.match(html, /id="section-infographics"/);
  assert.match(html, /href="infographics.css"/);
  assert.ok(html.indexOf('src="infographics.js"') > html.indexOf('src="cluster-model.js"'));
  assert.match(app, /if \(id === 'infographics'\)/);
  assert.match(app, /section-infographics.*NZLInfographics\?\.render/);
  assert.match(read('infographics.css'), /@media\(max-width:850px\)/);
  assert.match(read('infographics.css'), /@media print/);
});

test('closing a poster stays closed during a language change; queued print events keep an open poster synchronized', () => {
  const nodes = new Map([['infographicsContent', { innerHTML: '' }]]);
  const queued = [];
  const windowEvents = {};
  let language = 'en';
  let sheet = null;
  const bodyClasses = new Set();
  function createElement(tag) {
    const listeners = {};
    const node = { dataset: {}, innerHTML: '', open: false, isConnected: true,
      setAttribute() {}, querySelector: () => ({ focus() {} }),
      addEventListener: (name, callback) => { listeners[name] = callback; },
      showModal() { this.open = true; }, close() { this.open = false; queued.push(listeners.close); },
      remove() { if (sheet === this) sheet = null; },
      click: (target) => listeners.click({ target }),
    };
    return node;
  }
  const document = {
    documentElement: { getAttribute: () => language }, getElementById: (id) => nodes.get(id),
    createElement,
    querySelector: (selector) => selector === '.ig-print' ? sheet : null,
    body: { append: (node) => { if (node.id) nodes.set(node.id, node); if (node.className === 'ig-print') sheet = node; },
      classList: { add: (name) => bodyClasses.add(name), remove: (name) => bodyClasses.delete(name) } },
  };
  const browser = { document, ClusterData: Data, ClusterModel: Model, BulgariaRegions: Geography,
    getInfographicSourceData: () => source,
    addEventListener: (name, callback) => { windowEvents[name] = callback; },
    print: () => windowEvents.afterprint(),
  };
  browser.window = browser;
  vm.createContext(browser); vm.runInContext(read('infographics.js'), browser);
  const module = browser.NZLInfographics;
  const button = (action) => ({ dataset: { igAction: action, igId: 'national-emissions' }, isConnected: true, focus() {},
    closest(selector) { return selector === '[data-ig-action]' ? this : null; } });
  module.render();
  nodes.get('infographicsContent').onclick({ target: button('open') });
  const dialog = nodes.get('igDialog');
  assert.equal(dialog.open, true);
  dialog.click({ closest: () => true });
  language = 'bg'; module.render();
  assert.equal(dialog.open, false, 'language switch must not reopen a just-closed dialog');
  while (queued.length) queued.shift()();
  nodes.get('infographicsContent').onclick({ target: button('open') });
  dialog.click(button('print'));
  assert.equal(dialog.open, true);
  assert.equal(sheet, null);
  assert.equal(bodyClasses.size, 0);
  while (queued.length) queued.shift()();
  language = 'en'; module.render();
  assert.match(dialog.innerHTML, /Bulgaria’s emissions in perspective/);
  assert.doesNotMatch(dialog.innerHTML, /Емисиите на България/);
});
