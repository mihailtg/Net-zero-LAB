const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Data = require('../cluster-data.js');
const I18n = require('../cluster-i18n.js');
require('../industrial-geography.js');
const Infrastructure = require('../industrial-infrastructure.js');

const THEME = {
  text: '#111111',
  muted: '#666666',
  faint: '#888888',
  surface: '#ffffff',
  surface2: '#f4f4f4',
  border: '#cccccc',
  divider: '#dddddd',
  mapFill: '#eeeeee',
  hydrogen: '#087f5b',
  hydrogenFill: 'rgba(8, 127, 91, 0.12)',
  ammonia: '#b7791f',
  ccs: '#7048a8',
  sectors: {
    Chemicals: '#15803d',
    'Mineral Materials': '#2563eb',
    Metals: '#dc2626',
    'Other Manufacturing': '#d97706',
  },
};

function top20() {
  return Data.createDefaultCompanies()
    .filter((company) => Number.isFinite(Number(company.etsRank2024)))
    .sort((a, b) => a.etsRank2024 - b.etsRank2024);
}

test('infrastructure planning data references valid companies, nodes, and official sources', () => {
  const companies = top20();
  const companyIds = new Set(companies.map((company) => company.id));
  const nodeIds = new Set(Data.AMMONIA_LOGISTICS_NODES.map((node) => node.id));

  assert.equal(Data.ELECTROLYZER_VALLEY_CANDIDATES.length, 5);
  assert.equal(Data.AMMONIA_LOGISTICS_NODES.length, 7);
  assert.equal(Data.AMMONIA_LOGISTICS_ROUTES.length, 4);
  assert.equal(Data.CEMENT_CCS_STORAGE_SITES.length, 4);
  assert.equal(Data.CEMENT_CCS_CONNECTIONS.length, 3);
  assert.equal(Data.CENTRAL_CCS_HUB.phaseOneCaptureKtPerYear, 800);

  Data.ELECTROLYZER_VALLEY_CANDIDATES.forEach((candidate) => {
    assert.ok(candidate.phaseUnits[2030] > 0);
    assert.ok(candidate.phaseUnits[2040] > candidate.phaseUnits[2030]);
    assert.equal(candidate.phaseUnits[2030] * 20 % 20, 0);
    candidate.anchorCompanyIds.forEach((id) => assert.ok(companyIds.has(id), `${candidate.id} has unknown company ${id}`));
    Object.values(candidate.evidenceScores4).forEach((score) => assert.ok(score >= 0 && score <= 4));
  });

  Data.CENTRAL_CCS_HUB.sourceCompanyIds.forEach((id) => assert.ok(companyIds.has(id)));
  const storageIds = new Set(Data.CEMENT_CCS_STORAGE_SITES.map((site) => site.id));
  Data.CEMENT_CCS_CONNECTIONS.forEach((connection) => {
    assert.ok(companyIds.has(connection.plantId));
    assert.ok(storageIds.has(connection.primaryStorageId));
    connection.alternativeStorageIds.forEach((id) => assert.ok(storageIds.has(id)));
    assert.equal(Data.CEMENT_CCS_COVERAGE_PATHWAY[connection.plantId][2050], 100);
  });
  Data.AMMONIA_LOGISTICS_ROUTES.forEach((route) => {
    assert.ok(route.nodeIds.length >= 2);
    route.nodeIds.forEach((id) => assert.ok(nodeIds.has(id), `${route.id} has unknown node ${id}`));
  });
  Data.INFRASTRUCTURE_SITING_SOURCES.forEach((source) => assert.match(source.url, /^https:\/\//));
});

test('electrolyzer valley screening is transparent, differentiated, and phase-aware', () => {
  const companies = top20();
  const results2030 = Infrastructure.evaluateValleys(companies, '2030');
  const results2040 = Infrastructure.evaluateValleys(companies, '2040');

  assert.equal(results2030.length, 5);
  assert.deepEqual(results2030.map((valley) => valley.id), [
    'devnya-varna',
    'stara-zagora-dimitrovgrad',
    'burgas-industrial-port',
    'sofia-pernik',
    'plovdiv-pazardzhik',
  ]);
  assert.equal(results2030[0].score20, 19.1);
  assert.ok(results2030[0].score20 - results2030.at(-1).score20 > 5);

  results2030.forEach((valley, index) => {
    assert.equal(valley.rank, index + 1);
    assert.equal(valley.capacityMW, valley.units * 20);
    assert.ok(valley.hydrogenOutputKt > 0);
    assert.ok(valley.electricityTWh > 0);
    assert.ok(valley.ammoniaEquivalentKt > valley.hydrogenOutputKt);
    assert.equal(Object.keys(valley.dimensions).length, 5);
    Object.values(valley.dimensions).forEach((score) => assert.ok(score >= 0 && score <= 4));
    assert.ok(Math.abs(valley.score20 - Object.values(valley.dimensions).reduce((sum, score) => sum + score, 0)) < 1e-10);

    const later = results2040.find((candidate) => candidate.id === valley.id);
    assert.ok(later.capacityMW > valley.capacityMW);
    assert.ok(later.hydrogenOutputKt > valley.hydrogenOutputKt);
  });

  const expectedPerUnitKt = 20 * 0.7 * 8760 / (55 * 1000);
  assert.ok(Math.abs(Infrastructure.getHydrogenOutputKt(20) - expectedPerUnitKt) < 1e-12);
  assert.equal(results2030.reduce((sum, valley) => sum + valley.capacityMW, 0), 1100);
  assert.ok(Math.abs(results2030.reduce((sum, valley) => sum + valley.hydrogenOutputKt, 0) - 122.64) < 0.01);
});

test('central CCS concept keeps capture at plants and centralizes the shared transport chain', () => {
  const assessment = Infrastructure.getCcsAssessment(top20());

  assert.equal(assessment.id, 'devnya-ccs-hub');
  assert.equal(assessment.phaseOneCaptureKtPerYear, 800);
  assert.equal(assessment.clusterBackbonePotentialKtPerYear, 1100);
  assert.equal(assessment.storageLocationSchematic, true);
  assert.deepEqual(assessment.sourceCompanies.map((company) => company.id), ['solvay', 'heidelberg', 'agropolychim']);
  assert.ok(Math.abs(assessment.sourceBaselineKt - 2265.33) < 0.000001);
  assert.match(assessment.architectureNote.en, /Capture must remain at each emitting plant/);
  assert.match(assessment.architectureNote.en, /drying, compression, metering, aggregation/);
});

test('all cement process streams reach CCS coverage by 2050 on a five or ten year roadmap', () => {
  const network5 = Infrastructure.getCementCcsNetwork(top20(), 5);
  const network10 = Infrastructure.getCementCcsNetwork(top20(), 10);

  assert.deepEqual(network5.plants.map((plant) => plant.company.id), ['heidelberg', 'holcim', 'zlatna-panega']);
  assert.deepEqual(network5.milestoneYears, [2025, 2030, 2035, 2040, 2045, 2050]);
  assert.deepEqual(network10.milestoneYears, [2030, 2040, 2050]);
  assert.ok(Math.abs(network5.totalBaselineKt - 1459.075) < 0.000001);
  assert.ok(Math.abs(network5.processEmissionsKt - 948.39875) < 0.000001);
  assert.ok(Math.abs(network5.effectiveStoredKt2050 - 900.9788125) < 0.000001);
  assert.ok(Math.abs(network5.cumulativeStoredMt2050 - 15.69307831) < 0.000001);
  assert.equal(network5.systemCoverage2050, 100);

  const coverageByYear = Object.fromEntries(network5.milestones.map((milestone) => [milestone.year, milestone.systemCoverage]));
  assert.equal(coverageByYear[2025], 0);
  assert.ok(coverageByYear[2030] > 48 && coverageByYear[2030] < 49);
  assert.ok(coverageByYear[2040] > 88 && coverageByYear[2040] < 90);
  assert.equal(coverageByYear[2050], 100);

  network5.plants.forEach((plant) => {
    assert.equal(plant.milestones.at(-1).systemCoverage, 100);
    assert.ok(plant.processEmissionsKt > 0);
    assert.ok(plant.cumulativeStoredMt2050 > 0);
    assert.ok(plant.primaryStorage);
    assert.ok(plant.alternativeStorage.length > 0);
  });
  assert.equal(Infrastructure.getCoverageAtYear(Data.CEMENT_CCS_COVERAGE_PATHWAY.holcim, 2032.5), 30);
});

test('Galata and Pleven are represented with their verified maturity limitations', () => {
  const network = Infrastructure.getCementCcsNetwork(top20(), 5);
  const storageById = new Map(network.storageSites.map((site) => [site.id, site]));
  const galata = storageById.get('galata');
  const pleven = storageById.get('pleven-zone');
  const devnya = storageById.get('devnya-onshore');

  assert.equal(galata.capacityMtMin, 4);
  assert.equal(galata.capacityMtMax, 6);
  assert.equal(galata.maturity, 'legacy_alternative');
  assert.match(galata.status.en, /February 2026/);
  assert.equal(pleven.capacityMtMin, 1600);
  assert.equal(pleven.capacityMtMean, 1800);
  assert.equal(pleven.capacityMtMax, 2000);
  assert.equal(pleven.maturity, 'screening_resource');
  assert.equal(pleven.expectedOperationalYear, null);
  assert.match(pleven.status.en, /not a certified storage capacity/);
  assert.equal(devnya.expectedOperationalYear, 2029);
  assert.equal(devnya.injectionTargetKtPerYear, 800);
});

test('ammonia network resolves every route and distinguishes all three end uses', () => {
  const network = Infrastructure.getAmmoniaNetwork();
  const applications = new Set(network.nodes.flatMap((node) => node.applications));

  assert.equal(network.nodes.length, 7);
  assert.equal(network.routes.length, 4);
  network.routes.forEach((route) => assert.equal(route.nodes.length, route.nodeIds.length));
  assert.ok(applications.has('feedstock'));
  assert.ok(applications.has('direct_fuel'));
  assert.ok(applications.has('cracking'));
  assert.match(I18n.COPY.en['infra.technologyCorrectionDesc'], /catalytic cracking/);
  assert.match(I18n.COPY.en['infra.technologyCorrectionDesc'], /emerging route/);
});

test('planning map model exposes independent ETS, valley, CCS, and ammonia layers', () => {
  const companies = top20();
  const contextInstallations = Data.GEOGRAPHY_CONTEXT_INSTALLATIONS;
  const evaluatedValleys = Infrastructure.evaluateValleys(companies, '2030');
  const common = { companies, contextInstallations, evaluatedValleys, theme: THEME };
  const model = Infrastructure.buildPlanningMapModel(common);
  const layers = model.traces.map((trace) => trace.meta?.layer);

  assert.equal(model.shapes.length, 5);
  assert.ok(layers.includes('base'));
  assert.ok(layers.includes('ets-analysis'));
  assert.ok(layers.includes('ets-context'));
  assert.ok(layers.includes('valleys'));
  assert.ok(layers.includes('ccs-route'));
  assert.ok(layers.includes('ccs-node'));
  assert.equal(model.traces.filter((trace) => trace.meta?.layer === 'ccs-route' && trace.meta?.routeRole === 'primary').length, 3);
  assert.equal(model.traces.filter((trace) => trace.meta?.layer === 'ccs-route' && trace.meta?.routeRole === 'alternative').length, 3);
  const ccsNodes = model.traces.find((trace) => trace.meta?.layer === 'ccs-node');
  assert.equal(ccsNodes.x.length, 7);
  assert.equal(new Set(ccsNodes.x.map((x, index) => `${x.toFixed(6)}:${ccsNodes.y[index].toFixed(6)}`)).size, 7);
  assert.ok(model.traces.some((trace) => trace.meta?.layer === 'ccs-guides'));
  assert.equal(layers.filter((layer) => layer === 'ammonia-route').length, 4);
  assert.ok(layers.includes('ammonia-node'));

  model.traces.forEach((trace) => {
    [...(trace.x || []), ...(trace.y || [])].forEach((value) => {
      assert.ok(value === null || Number.isFinite(value), `${trace.meta?.layer} contains an invalid coordinate`);
    });
  });

  const baseOnly = Infrastructure.buildPlanningMapModel({
    ...common,
    layers: { ets: false, valleys: false, ccs: false, ammonia: false },
  });
  assert.deepEqual(baseOnly.traces.map((trace) => trace.meta?.layer), ['base']);
  assert.equal(baseOnly.shapes.length, 0);
  assert.equal(baseOnly.annotations.length, 0);
});

test('render builds the full decision interface and updates the 2030/2040 portfolio', () => {
  const originalDocument = global.document;
  const originalPlotly = global.Plotly;
  const originalGetComputedStyle = global.getComputedStyle;
  const calls = [];
  const nodes = {
    industrialInfrastructurePlanning: {
      innerHTML: '',
      querySelectorAll() { return []; },
    },
    industrialInfrastructureMap: {
      id: 'industrialInfrastructureMap',
      innerHTML: '',
      clientWidth: 900,
      clientHeight: 540,
    },
  };

  global.document = {
    documentElement: { getAttribute: () => 'en' },
    getElementById(id) { return nodes[id] || null; },
  };
  global.getComputedStyle = () => ({ getPropertyValue: () => '' });
  global.Plotly = {
    purge() {},
    react(node, traces, layout) { calls.push({ node, traces, layout }); },
  };

  try {
    Infrastructure.setPhase('2030');
    Infrastructure.render({
      companies: top20(),
      contextInstallations: Data.GEOGRAPHY_CONTEXT_INSTALLATIONS,
      theme: THEME,
    });
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /industrialInfrastructureMap/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /data-infra-layer="ammonia"/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /19\.1<small>\/20<\/small>/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /ANRAV/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /catalytic cracking/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, />1,100<\/strong><small>MW/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /data-ccs-interval="5"/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /All clinker plants connected/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, />948<\/strong><small>kt CO2/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, />15\.7<\/strong><small>Mt CO2/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /Pleven saline-aquifer zone/);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /Galata is no longer the ANRAV base case/);
    assert.doesNotMatch(nodes.industrialInfrastructurePlanning.innerHTML, /undefined|NaN/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].layout.shapes.length, 5);

    Infrastructure.setPhase('2040');
    assert.equal(Infrastructure.getState().phase, '2040');
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, />2,700<\/strong><small>MW/);
    assert.equal(calls.length, 2);

    Infrastructure.setCcsInterval(10);
    assert.equal(Infrastructure.getState().ccsIntervalYears, 10);
    assert.match(nodes.industrialInfrastructurePlanning.innerHTML, /class="active" data-ccs-interval="10"/);
    assert.equal(calls.length, 3);
  } finally {
    Infrastructure.setCcsInterval(5);
    Infrastructure.setPhase('2030');
    if (originalDocument === undefined) delete global.document;
    else global.document = originalDocument;
    if (originalPlotly === undefined) delete global.Plotly;
    else global.Plotly = originalPlotly;
    if (originalGetComputedStyle === undefined) delete global.getComputedStyle;
    else global.getComputedStyle = originalGetComputedStyle;
  }
});

test('infrastructure module, stylesheet, host integration, and translations are wired', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const geography = fs.readFileSync(path.join(root, 'industrial-geography.js'), 'utf8');
  const infrastructure = fs.readFileSync(path.join(root, 'industrial-infrastructure.js'), 'utf8');

  assert.match(html, /href="industrial-infrastructure\.css"/);
  assert.match(html, /src="industrial-infrastructure\.js"/);
  assert.match(geography, /id="industrialInfrastructurePlanning"/);
  assert.match(geography, /IndustrialInfrastructure\?\.render/);
  assert.ok(fs.statSync(path.join(root, 'industrial-infrastructure.css')).size > 1000);

  const staticKeys = [...infrastructure.matchAll(/t\('(infra\.[^']+)'/g)].map((match) => match[1]);
  const dynamicKeys = [
    ...Data.AMMONIA_LOGISTICS_ROUTES.map((route) => `infra.mode.${route.mode}`),
    ...new Set(Data.AMMONIA_LOGISTICS_NODES.flatMap((node) => node.applications).map((application) => `infra.application.${application}`)),
    ...Data.CEMENT_CCS_STORAGE_SITES.map((site) => `infra.maturity.${site.maturity}`),
    ...Data.CEMENT_CCS_CONNECTIONS.map((connection) => `infra.transport.${connection.transportMode}`),
    'infra.storageShort.devnya',
    'infra.storageShort.beli',
    'infra.storageShort.pleven',
    'infra.storageShort.galata',
  ];
  [...new Set([...staticKeys, ...dynamicKeys])].forEach((key) => {
    assert.ok(I18n.COPY.en[key], `missing English ${key}`);
    assert.ok(I18n.COPY.bg[key], `missing Bulgarian ${key}`);
  });
});
