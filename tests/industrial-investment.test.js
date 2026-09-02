const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Data = require('../cluster-data.js');
require('../cluster-i18n.js');
const Investment = require('../industrial-investment.js');

function top20() {
  return Data.createDefaultCompanies()
    .filter((company) => Number.isFinite(Number(company.etsRank2024)))
    .sort((a, b) => companyRank(a) - companyRank(b));
}

function companyRank(company) {
  return Number(company.etsRank2024);
}

function close(actual, expected, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
}

test('hydrogen phases preserve the 20 MW modular valley plan and expose its energy requirement', () => {
  const phase2030 = Investment.phaseScale('2030');
  const phase2040 = Investment.phaseScale('2040');

  assert.equal(phase2030.units, 55);
  assert.equal(phase2030.capacityMW, 1100);
  assert.equal(phase2040.units, 135);
  assert.equal(phase2040.capacityMW, 2700);
  close(phase2030.hydrogenKt, 122.64, 0.001);
  close(phase2040.hydrogenKt, 301.0254545454545);
  close(phase2040.electricityTWh, 16.5564);
  assert.equal(phase2040.solarEquivalentMW, 10500);
});

test('portfolio separates plant, shared, and system investments with explicit readiness and ranges', () => {
  const portfolio = Investment.createTechnologyPortfolio({ phase: '2040', reactors: 0, companies: top20() });
  const byId = new Map(portfolio.map((technology) => [technology.id, technology]));

  assert.equal(portfolio.length, 15);
  assert.equal(byId.get('n2o-abatement').status, 'ready');
  assert.equal(byId.get('n2o-abatement').availableYear, 2026);
  assert.equal(byId.get('cement-capture').status, 'conditional');
  assert.equal(byId.get('cement-capture').availableYear, 2029);
  assert.equal(byId.get('electrochemical-soda').status, 'emerging');
  assert.equal(byId.get('new-nuclear').unitCost.central, 9000);
  assert.equal(byId.get('new-nuclear').enabled, false);

  portfolio.forEach((technology) => {
    assert.ok(['direct', 'shared', 'system'].includes(technology.scope));
    assert.ok(technology.cost.low <= technology.cost.central);
    assert.ok(technology.cost.central <= technology.cost.high);
    assert.ok(technology.buildYears[0] > 0);
    assert.ok(technology.buildYears[1] >= technology.buildYears[0]);
    assert.ok(technology.confidence20 >= 0 && technology.confidence20 <= 20);
    assert.ok(technology.sourceIds.length > 0);
  });
});

test('sector and six-region CAPEX allocations reconcile to the selected portfolio', () => {
  const assessment = Investment.calculateInvestmentAssessment(top20(), { phase: '2040', reactors: 0 });
  const sectorTotal = assessment.breakdowns.sector.reduce((sum, row) => sum + row.central, 0);
  const regionTotal = assessment.breakdowns.region.reduce((sum, row) => sum + row.central, 0);

  close(assessment.totals.central, 24179.559, 0.001);
  close(assessment.byScope.direct, 7795.559, 0.001);
  close(assessment.byScope.shared, 16384, 0.001);
  assert.equal(assessment.byScope.system, 0);
  close(sectorTotal, assessment.totals.central, 0.002);
  close(regionTotal, assessment.totals.central, 0.002);
  assert.deepEqual(assessment.breakdowns.region.map((row) => row.id), ['BG31', 'BG32', 'BG33', 'BG41', 'BG42', 'BG34']);
  assert.deepEqual(assessment.breakdowns.sector.map((row) => row.id), ['Chemicals', 'Mineral Materials', 'Metals', 'Other Manufacturing']);
});

test('emissions pathway is monotonic, capped to the ETS baseline, and dependency aware', () => {
  const companies = top20();
  const full = Investment.calculateInvestmentAssessment(companies, { phase: '2040', reactors: 0 });
  const withoutHydrogenSupply = Investment.calculateInvestmentAssessment(companies, {
    phase: '2040',
    reactors: 0,
    disabledIds: ['electrolyzer-valleys'],
  });
  const withoutCo2Network = Investment.calculateInvestmentAssessment(companies, {
    phase: '2040',
    reactors: 0,
    disabledIds: ['co2-network'],
  });

  close(full.trajectory.baselineKt, 6462.515);
  assert.ok(full.reduction2050 > 0.85 && full.reduction2050 < 0.98);
  full.trajectory.points.forEach((point, index) => {
    assert.ok(point.residualKt >= 0 && point.residualKt <= point.baselineKt);
    if (index) assert.ok(point.residualKt <= full.trajectory.points[index - 1].residualKt + 1e-9);
  });

  const finalFull = full.trajectory.points.at(-1);
  const finalNoHydrogen = withoutHydrogenSupply.trajectory.points.at(-1);
  const finalNoCo2 = withoutCo2Network.trajectory.points.at(-1);
  assert.ok(finalNoHydrogen.residualKt > finalFull.residualKt);
  assert.equal(finalNoHydrogen.contributions['hydrogen-integration'], 0);
  assert.ok(finalNoCo2.residualKt > finalFull.residualKt);
  assert.equal(finalNoCo2.contributions['cement-capture'], 0);
  assert.equal(finalNoCo2.contributions['residual-capture'], 0);
});

test('one reactor adds exactly one separate 1,000 MW system investment', () => {
  const companies = top20();
  const zero = Investment.calculateInvestmentAssessment(companies, { phase: '2040', reactors: 0 });
  const one = Investment.calculateInvestmentAssessment(companies, { phase: '2040', reactors: 1 });

  close(one.totals.central - zero.totals.central, 9000);
  assert.equal(one.byScope.system, 9000);
  assert.equal(one.technologies.find((technology) => technology.id === 'new-nuclear').quantityLabel, '1 × 1,000 MW');
  assert.equal(one.breakdowns.region.find((row) => row.id === 'BG31').scopes.system, 9000);
  assert.equal(one.breakdowns.sector.find((row) => row.id === 'System enablers').central, 9000);
  close(one.reduction2050, zero.reduction2050);
});

test('chart models contain finite values and retain low-central-high uncertainty', () => {
  const assessment = Investment.calculateInvestmentAssessment(top20(), { phase: '2030', reactors: 0 });
  ['technology', 'sector', 'region'].forEach((dimension) => {
    const model = Investment.buildCapexChartModel(assessment, dimension);
    assert.equal(model.traces.length, 1);
    assert.ok(model.traces[0].x.length > 0);
    model.traces[0].x.forEach((value) => assert.ok(Number.isFinite(value)));
    model.traces[0].error_x.array.forEach((value) => assert.ok(Number.isFinite(value) && value >= 0));
    model.traces[0].error_x.arrayminus.forEach((value) => assert.ok(Number.isFinite(value) && value >= 0));
  });

  const emissions = Investment.buildEmissionsChartModel(assessment);
  assert.equal(emissions.traces.length, 2);
  emissions.traces.forEach((trace) => trace.y.forEach((value) => assert.ok(Number.isFinite(value))));
});

test('render replaces the legacy static investment screen with the interactive bilingual model', () => {
  const originalDocument = global.document;
  const originalPlotly = global.Plotly;
  const originalGetComputedStyle = global.getComputedStyle;
  const calls = [];
  const nodes = {
    'section-investments': {
      innerHTML: '',
      querySelectorAll() { return []; },
      querySelector() { return null; },
    },
    investmentCapexChart: { innerHTML: '' },
    investmentEmissionsChart: { innerHTML: '' },
  };

  global.document = {
    documentElement: { getAttribute: (name) => (name === 'data-lang' ? 'en' : 'dark') },
    getElementById(id) { return nodes[id] || null; },
  };
  global.getComputedStyle = () => ({ getPropertyValue: () => '' });
  global.Plotly = {
    purge() {},
    react(node, traces, layout) { calls.push({ node, traces, layout }); },
  };

  try {
    Investment.resetPortfolio();
    const assessment = Investment.render({ companies: top20() });
    assert.ok(assessment.totals.central > 0);
    assert.match(nodes['section-investments'].innerHTML, /Investment and technology readiness outlook/);
    assert.match(nodes['section-investments'].innerHTML, /data-investment-breakdown="region"/);
    assert.match(nodes['section-investments'].innerHTML, /data-investment-reactors/);
    assert.match(nodes['section-investments'].innerHTML, /Electrolyser valleys in 20 MW modules/);
    assert.match(nodes['section-investments'].innerHTML, /Class 4\/5 screening range/);
    assert.doesNotMatch(nodes['section-investments'].innerHTML, /undefined|NaN/);
    assert.equal(calls.length, 2);
  } finally {
    Investment.resetPortfolio();
    if (originalDocument === undefined) delete global.document;
    else global.document = originalDocument;
    if (originalPlotly === undefined) delete global.Plotly;
    else global.Plotly = originalPlotly;
    if (originalGetComputedStyle === undefined) delete global.getComputedStyle;
    else global.getComputedStyle = originalGetComputedStyle;
  }
});

test('official sources and application wiring are present', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

  assert.match(html, /href="industrial-investment\.css"/);
  assert.match(html, /src="industrial-investment\.js"/);
  assert.match(app, /IndustrialInvestment\?\.render/);
  assert.ok(fs.statSync(path.join(root, 'industrial-investment.css')).size > 5000);
  Investment.SOURCES.forEach((source) => assert.match(source.url, /^https:\/\//));
  assert.ok(Investment.SOURCES.some((source) => source.url.includes('iea.org')));
  assert.ok(Investment.SOURCES.some((source) => source.url.includes('publications.jrc.ec.europa.eu')));
  assert.ok(Investment.SOURCES.some((source) => source.url.includes('iaea.org')));
});
