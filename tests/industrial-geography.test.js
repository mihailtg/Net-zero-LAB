const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Data = require('../cluster-data.js');
require('../cluster-i18n.js');
const Geography = require('../industrial-geography.js');

const THEME = {
  text: '#111111',
  muted: '#666666',
  faint: '#888888',
  surface: '#ffffff',
  surface2: '#f4f4f4',
  border: '#cccccc',
  divider: '#dddddd',
  mapFill: '#eeeeee',
  sectors: {
    Chemicals: '#15803d',
    'Mineral Materials': '#2563eb',
    Metals: '#dc2626',
    'Other Manufacturing': '#d97706',
  },
  context: {
    power_heat: { fill: '#f2dca5', line: '#9a6700', symbol: 'square' },
    district_heating: { fill: '#bfe3df', line: '#0f766e', symbol: 'diamond' },
  },
};

function top20() {
  return Data.createDefaultCompanies()
    .filter((company) => Number.isFinite(Number(company.etsRank2024)))
    .sort((a, b) => a.etsRank2024 - b.etsRank2024);
}

test('all Top 20 ETS installations have valid Bulgarian geography and cover six regions', () => {
  const companies = top20();
  assert.equal(companies.length, 20);
  assert.equal(Data.STATISTICAL_REGIONS.length, 6);

  const validRegions = new Set(Data.STATISTICAL_REGIONS.map((region) => region.id));
  companies.forEach((company) => {
    assert.ok(company.geography, `${company.id} is missing geography`);
    assert.ok(company.geography.longitude >= 22 && company.geography.longitude <= 29, `${company.id} longitude is outside Bulgaria`);
    assert.ok(company.geography.latitude >= 41 && company.geography.latitude <= 45, `${company.id} latitude is outside Bulgaria`);
    assert.ok(validRegions.has(company.geography.regionId), `${company.id} has an invalid region`);
    assert.ok(company.geography.locality);
    assert.ok(company.geography.sourceUrl);
  });

  const counts = Object.fromEntries(Geography.regionSummary(companies).map((item) => [item.region.id, item.count]));
  assert.deepEqual(counts, { BG31: 3, BG32: 2, BG33: 5, BG41: 4, BG42: 4, BG34: 2 });
  assert.ok(Math.abs(Geography.sumEmissions(companies) - 6462.515) < 0.000001);
});

test('energy context is separate, pale, and excluded from every analytical baseline', () => {
  const context = Geography.getContextInstallations();
  const companyIds = new Set(Data.createDefaultCompanies().map((company) => company.id));
  const validRegions = new Set(Data.STATISTICAL_REGIONS.map((region) => region.id));

  assert.equal(context.length, 28);
  assert.deepEqual(
    Object.fromEntries(Geography.contextSummary(context).map((item) => [item.category, item.count])),
    { power_heat: 7, district_heating: 21 }
  );
  context.forEach((installation) => {
    assert.equal(installation.analysisIncluded, false);
    assert.equal(installation.contextOnly, true);
    assert.equal(companyIds.has(installation.id), false);
    assert.ok(validRegions.has(installation.regionId));
    assert.ok(installation.longitude >= 22 && installation.longitude <= 29);
    assert.ok(installation.latitude >= 41 && installation.latitude <= 45);
    assert.match(installation.sourceUrl, /^https:\/\/eea\.government\.bg\//);
  });

  assert.equal(top20().length, 20);
  assert.ok(Math.abs(Geography.sumEmissions(top20()) - 6462.515) < 0.000001);
});

test('overlapping map markers are placed side by side without changing their source coordinates', () => {
  const crowded = Array.from({ length: 9 }, (_, index) => ({
    id: `crowded-${index}`,
    longitude: 25.3,
    latitude: 42.7,
    markerSize: index === 0 ? 28 : 12,
    priority: index + 1,
  }));
  const placements = Geography.resolveMapMarkerCollisions(crowded, { width: 360, height: 430 });

  assert.equal(placements.size, crowded.length);
  assert.equal(placements.get('crowded-0').originalX, 25.3);
  assert.equal(placements.get('crowded-0').originalY, 42.7);
  assert.ok([...placements.values()].filter((placement) => placement.displaced).length >= crowded.length - 1);

  const resolved = [...placements.values()];
  for (let index = 0; index < resolved.length; index += 1) {
    for (let comparison = index + 1; comparison < resolved.length; comparison += 1) {
      const distance = Math.hypot(
        resolved[index].pixelX - resolved[comparison].pixelX,
        resolved[index].pixelY - resolved[comparison].pixelY
      );
      assert.ok(distance >= resolved[index].radius + resolved[comparison].radius + 2.99);
    }
  }
});

test('map and bubble models preserve all installations and emission sizing', () => {
  const companies = top20();
  const map = Geography.mapTraces(companies, THEME);
  const analysisTraces = map.filter((trace) => trace.meta?.analysisIncluded === true);
  const contextTraces = map.filter((trace) => trace.meta?.contextOnly === true);
  const collisionGuides = map.find((trace) => trace.meta?.layer === 'collision-guides');
  assert.equal(map.length, 8);
  assert.equal(map[0].x.length, Geography.BULGARIA_OUTLINE.length);
  assert.ok(collisionGuides);
  assert.ok(collisionGuides.x.filter((value) => value === null).length > 0);
  assert.equal(analysisTraces.reduce((sum, trace) => sum + trace.x.length, 0), 20);
  assert.equal(contextTraces.reduce((sum, trace) => sum + trace.x.length, 0), 28);
  assert.deepEqual(contextTraces.map((trace) => trace.marker.symbol), ['square', 'diamond']);
  contextTraces.forEach((trace) => {
    assert.equal(trace.marker.opacity < 1, true);
    assert.equal(trace.meta.analysisIncluded, false);
  });

  const bySector = Geography.bubbleModel(companies, 'sector', THEME);
  assert.equal(bySector.groups.length, 4);
  assert.equal(bySector.traces.reduce((sum, trace) => sum + trace.x.length, 0), 20);
  assert.deepEqual(
    Object.fromEntries(bySector.groups.map((group) => [group.key, group.count])),
    { Chemicals: 4, 'Mineral Materials': 12, Metals: 3, 'Other Manufacturing': 1 }
  );

  const rankedSizes = bySector.traces.flatMap((trace) => trace.customdata.map((row, index) => ({ rank: row[0], size: trace.marker.size[index] })));
  const largestBubble = rankedSizes.reduce((largest, item) => item.size > largest.size ? item : largest);
  assert.equal(largestBubble.rank, 1);

  const byRegion = Geography.bubbleModel(companies, 'region', THEME);
  assert.equal(byRegion.groups.length, 6);
  assert.equal(byRegion.positions.size, 20);
  assert.deepEqual(byRegion.groups.map((group) => group.key), ['BG31', 'BG32', 'BG33', 'BG41', 'BG42', 'BG34']);
  byRegion.positions.forEach((position) => {
    assert.ok(Number.isFinite(position.x));
    assert.ok(Number.isFinite(position.y));
  });

  const regionGroups = Object.fromEntries(byRegion.groups.map((group) => [group.key, group]));
  assert.ok(regionGroups.BG31.definition.x < regionGroups.BG32.definition.x);
  assert.ok(regionGroups.BG32.definition.x < regionGroups.BG33.definition.x);
  assert.equal(regionGroups.BG31.definition.y, regionGroups.BG33.definition.y);
  assert.ok(regionGroups.BG41.definition.x < regionGroups.BG42.definition.x);
  assert.ok(regionGroups.BG42.definition.x < regionGroups.BG34.definition.x);
  assert.equal(regionGroups.BG41.definition.y, regionGroups.BG34.definition.y);
  assert.ok(regionGroups.BG31.definition.y > regionGroups.BG41.definition.y);

  const withContextBySector = Geography.bubbleModel(companies, 'sector', THEME, {
    includeContext: true,
    contextInstallations: Geography.getContextInstallations(),
  });
  const sectorContextTraces = withContextBySector.traces.filter((trace) => trace.meta?.contextOnly === true);
  assert.deepEqual(
    withContextBySector.groups.map((group) => group.key),
    ['Chemicals', 'Mineral Materials', 'Metals', 'Other Manufacturing', 'context:power_heat', 'context:district_heating']
  );
  assert.equal(withContextBySector.positions.size, 48);
  assert.equal(withContextBySector.traces.reduce((sum, trace) => sum + trace.x.length, 0), 48);
  assert.equal(sectorContextTraces.reduce((sum, trace) => sum + trace.x.length, 0), 28);
  assert.deepEqual(sectorContextTraces.map((trace) => trace.marker.symbol), ['square', 'diamond']);
  sectorContextTraces.forEach((trace) => assert.equal(trace.meta.analysisIncluded, false));

  const withContextByRegion = Geography.bubbleModel(companies, 'region', THEME, {
    includeContext: true,
    contextInstallations: Geography.getContextInstallations(),
  });
  assert.equal(withContextByRegion.groups.length, 6);
  assert.equal(withContextByRegion.positions.size, 48);
  assert.equal(withContextByRegion.traces.filter((trace) => trace.meta?.contextOnly).reduce((sum, trace) => sum + trace.x.length, 0), 28);
  assert.ok(Math.abs(Geography.sumEmissions(companies) - 6462.515) < 0.000001);
});

test('render builds both Plotly views without undefined values', async () => {
  const originalDocument = global.document;
  const originalPlotly = global.Plotly;
  const originalGetComputedStyle = global.getComputedStyle;
  const originalInfrastructure = global.IndustrialInfrastructure;
  const calls = [];
  const infrastructureCalls = [];
  const contextListeners = new Map();
  let currentLanguage = 'en';
  const nodes = {
    industrialGeographyGrid: {
      innerHTML: '',
      querySelectorAll() { return []; },
      querySelector(selector) {
        return selector === '[data-geo-context-visible]' ? {
          addEventListener(type, listener) { contextListeners.set(type, listener); },
        } : null;
      },
    },
    industrialGeoMap: { id: 'industrialGeoMap', innerHTML: '', clientWidth: 900, clientHeight: 500 },
    industrialGeoBubbles: { id: 'industrialGeoBubbles', innerHTML: '', clientHeight: 560 },
  };

  global.document = {
    documentElement: { getAttribute: () => currentLanguage },
    getElementById(id) { return nodes[id] || null; },
  };
  global.getComputedStyle = () => ({ getPropertyValue: () => '' });
  global.Plotly = {
    purge() {},
    react(node, traces, layout) { calls.push({ node, traces, layout }); },
  };
  global.IndustrialInfrastructure = { render(options) { infrastructureCalls.push(options); } };

  try {
    Geography.setIncludeContextInClusters(false);
    calls.length = 0;
    Geography.setClusterMode('sector');
    assert.match(nodes.industrialGeographyGrid.innerHTML, /industrialGeoMap/);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /data-geo-cluster-mode="region"/);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /data-geo-context-clusters\s*>/);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /Context only · excluded from analysis/);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /By default they are excluded from emission clusters/);
    assert.doesNotMatch(nodes.industrialGeographyGrid.innerHTML, /undefined|NaN/);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].traces.filter((trace) => trace.meta?.analysisIncluded).reduce((sum, trace) => sum + trace.x.length, 0), 53);
    assert.equal(calls[0].traces.filter((trace) => trace.meta?.contextOnly).reduce((sum, trace) => sum + trace.x.length, 0), 28);
    assert.equal(calls[1].traces.reduce((sum, trace) => sum + trace.x.length, 0), 53);

    Geography.setIncludeContextInClusters(true);
    assert.equal(Geography.getIncludeContextInClusters(), true);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /data-geo-context-clusters checked/);
    assert.equal(calls.length, 4);
    assert.equal(calls[3].traces.reduce((sum, trace) => sum + trace.x.length, 0), 81);
    assert.equal(calls[3].traces.filter((trace) => trace.meta?.contextOnly).reduce((sum, trace) => sum + trace.x.length, 0), 28);

    Geography.setClusterMode('region');
    assert.equal(Geography.getClusterMode(), 'region');
    assert.equal(calls.length, 6);
    assert.equal(calls[5].layout.annotations.length, 6);
    assert.equal(calls[5].traces.reduce((sum, trace) => sum + trace.x.length, 0), 81);

    assert.match(nodes.industrialGeographyGrid.innerHTML, /data-geo-context-visible checked/);
    const kpis = nodes.industrialGeographyGrid.innerHTML.match(/<div class="industrial-geo-kpis"[\s\S]*?<\/div>\s*<\/div>/)[0];
    contextListeners.get('change')({ currentTarget: { checked: false } });
    assert.equal(Geography.getContextVisible(), false);
    assert.equal(calls[6].traces.filter(trace => trace.meta?.contextOnly).length, 0);
    assert.equal(calls[7].traces.filter(trace => trace.meta?.contextOnly).length, 0);
    assert.equal(calls[7].traces.reduce((sum, trace) => sum + trace.x.length, 0), 53);
    assert.equal(infrastructureCalls.at(-1).contextInstallations.length, 0);
    assert.ok(nodes.industrialGeographyGrid.innerHTML.includes(kpis));
    assert.doesNotMatch(nodes.industrialGeographyGrid.innerHTML, /class="industrial-geo-context-legend"/);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /data-geo-context-clusters checked disabled/);

    currentLanguage = 'bg';
    Geography.setClusterMode('activity');
    assert.equal(Geography.getContextVisible(), false);
    assert.match(nodes.industrialGeographyGrid.innerHTML, /Показвай допълнителния ETS контекст/);
    assert.equal(calls.at(-2).traces.filter(trace => trace.meta?.contextOnly).length, 0);
    assert.equal(calls.at(-1).traces.filter(trace => trace.meta?.contextOnly).length, 0);

    contextListeners.get('change')({ currentTarget: { checked: true } });
    assert.equal(Geography.getContextVisible(), true);
    assert.equal(calls.at(-2).traces.filter(trace => trace.meta?.contextOnly).reduce((sum, trace) => sum + trace.x.length, 0), 28);
    assert.equal(calls.at(-1).traces.filter(trace => trace.meta?.contextOnly).reduce((sum, trace) => sum + trace.x.length, 0), 28);
    assert.equal(infrastructureCalls.at(-1).contextInstallations.length, 28);

    // A fast toggle can replace a chart while Plotly is still calculating margins.
    const purged = [];
    let finishDrawing;
    const drawing = new Promise(resolve => { finishDrawing = resolve; });
    global.Plotly.react = () => drawing;
    global.Plotly.purge = node => purged.push(node.id);
    Geography.render();
    purged.length = 0;
    Geography.setContextVisible(false);
    assert.deepEqual(purged, [], 'pending plots must remain intact until their drawing completes');
    finishDrawing();
    await drawing;
    await Promise.resolve();
    assert.deepEqual(purged.sort(), ['industrialGeoBubbles', 'industrialGeoMap']);
  } finally {
    Geography.setIncludeContextInClusters(false);
    Geography.setContextVisible(true);
    if (originalDocument === undefined) delete global.document;
    else global.document = originalDocument;
    if (originalPlotly === undefined) delete global.Plotly;
    else global.Plotly = originalPlotly;
    if (originalGetComputedStyle === undefined) delete global.getComputedStyle;
    else global.getComputedStyle = originalGetComputedStyle;
    if (originalInfrastructure === undefined) delete global.IndustrialInfrastructure;
    else global.IndustrialInfrastructure = originalInfrastructure;
  }
});

test('section is placed after Cluster Analysis and opens directly without an access gate', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const i18n = require('../cluster-i18n.js');

  assert.ok(html.indexOf('section-industrial-geography') > html.indexOf('section-cluster'));
  assert.match(html, /data-section="industrial-geography"/);
  assert.match(html, /<div id="industrialGeographyContent">/);
  assert.doesNotMatch(html, /industrialGeographyAccessGate|type="password"/);
  assert.doesNotMatch(app, /INDUSTRIAL_GEOGRAPHY_ACCESS_PASSWORD_BASE|nzlIndustrialGeographyAccessUnlocked/);
  assert.match(app, /Индустриална география/);

  const requiredKeys = [
    'geo.mapTitle', 'geo.legendTitle', 'geo.bubbleTitle', 'geo.bySector', 'geo.byRegion',
    'geo.includeContextClusters', 'geo.includeContextClustersDesc',
    'geo.regionalDistribution', 'geo.approximateNote', 'geo.nutsNote', 'geo.contextLayerTitle',
    'geo.contextLayerDesc', 'geo.contextNotAnalysedLong', 'geo.powerHeat', 'geo.districtHeating',
    'geo.displacementGuides',
  ];
  requiredKeys.forEach((key) => {
    assert.ok(i18n.COPY.en[key], `missing English ${key}`);
    assert.ok(i18n.COPY.bg[key], `missing Bulgarian ${key}`);
  });
  assert.match(i18n.COPY.bg['geo.mapTitle'], /България/);
});
