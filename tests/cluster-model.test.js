const test = require('node:test');
const assert = require('node:assert/strict');

const Data = require('../cluster-data.js');
const I18n = require('../cluster-i18n.js');
const Model = require('../cluster-model.js');
const Simulation = require('../cluster-simulation.js');

function defaults() {
  return Data.createDefaultState();
}

function outcomeVector(outcome) {
  return [outcome.depth, outcome.retention, outcome.continuity, outcome.balance];
}

test('dynamic UI labels exist in English and Bulgarian', () => {
  const keys = [
    ...['scenarios', 'markets', 'sectors', 'companies', 'network', 'methodology', 'metrics', 'decisions', 'simulation']
      .flatMap((id) => [`tabs.${id}`, `meta.${id}.title`, `meta.${id}.desc`, `meta.${id}.note`]),
    ...['phase', 'frontier', 'network', 'heatmap', 'data'].map((id) => `explorer.${id}`),
    ...['depth', 'retention', 'continuity', 'balance'].map((id) => `outcome.${id}`),
    ...Data.SCENARIO_GROUPS.map((group) => `group.${group.id}`),
    ...Data.SCENARIO_PARAMETER_KEYS.map((key) => `parameter.${key}`),
    ...Data.SYSTEM_EFFECT_AXES.map((key) => `axis.${key}`),
    ...['finance', 'permitting', 'infrastructure', 'market', 'carbon', 'power'].map((key) => `bottleneck.${key}`),
    ...new Set(Data.NETWORK_EDGES.map((edge) => `network.edge.${edge.type}`)),
    ...Data.DEFAULT_SCENARIOS.map((scenario) => `scenario.summary.${scenario.theme}`),
    'scenario.summary.custom',
    'scenario.trajectoryConnected',
    ...['realWorldBasis', 'distinctiveAssumptions', 'evidenceBase', 'calibrationNote']
      .map((key) => `scenario.${key}`),
    ...[
      'technologyTitle', 'technologyDesc', 'greenHydrogen', 'greenHydrogenDesc',
      'electrolyzers', 'electrolyzersDesc', 'ammoniaStorage', 'ammoniaStorageDesc',
      'electrolyzerUnits', 'electrolyzerUnitsDesc', 'decreaseElectrolyzers', 'increaseElectrolyzers',
      'nameplateShort', 'ccs', 'ccsDesc',
      'nuclear', 'nuclearDesc', 'reactorCount', 'decreaseReactors', 'increaseReactors', 'enabled',
      'disabled', 'ppShort', 'viewMode', 'highlightCompany', 'clusterAverage', 'reduction2050', 'avoided2050',
      'residual2050', 'electrolyzerCapacity', 'nuclearCapacity', 'screeningNote', 'reduction2030',
      'technicalReduction2050', 'closureDriven2050', 'industryOperating2050', 'frontLoadedTitle',
      'frontLoadedNote', 'deindustrialisationTitle', 'deindustrialisationNote',
    ].map((key) => `trajectory.${key}`),
    'trajectory.mode.scenarios',
    'trajectory.mode.companies',
    ...[
      'title', 'desc', 'electrolyzerScore', 'hydrogenOutput', 'greenAmmoniaShare',
      'marketableGreenShare', 'hydrogenFuelShare', 'neochimTitle', 'anchorScore',
      'electrolyzerTitle', 'allocationTitle', 'configuredShare', 'productsTitle',
      'fuelTitle', 'greenHydrogenFuel', 'fossilFuel', 'scopeNote', 'solarNote',
    ].map((key) => `market.${key}`),
    ...[
      'title', 'desc', 'top20', 'sectorCount', 'emissions2024', 'yoyChange',
      'industryShare', 'nationalShare', 'sectorTableTitle', 'installations',
      'readiness', 'pressure', 'reduction2030', 'reduction2050', 'pathwayTitle',
      'pathwayStages', 'levers', 'dependencies', 'companySignals', 'source',
      'rankingTitle', 'rank', 'installation', 'specificSector', 'emissions2023',
      'emissions2024Short', 'shareBg', 'shareIndustry', 'indicator', 'verifiedNote',
      'modelNote', 'currentScenario',
    ].map((key) => `sectors.${key}`),
    'chart.residualEmissions',
    'chart.technicalReduction',
    'chart.industryActivity',
    'chart.transitionPercent',
    'method.activityAccounting',
    'method.activityAssumption',
  ];
  ['en', 'bg'].forEach((language) => {
    keys.forEach((key) => assert.notEqual(I18n.t(key, {}, language), key, `${language}.${key}`));
  });
});

test('visual scale converts cleanly between 0-1 and 0-20', () => {
  assert.equal(Model.toScore20(0), 0);
  assert.equal(Model.toScore20(1), 20);
  assert.equal(Model.toScore20(0.625), 12.5);
  assert.equal(Model.fromScore20(12.5), 0.625);
  assert.equal(Model.fromScore20(30), 1);
  assert.equal(Model.fromScore20(-5), 0);
});

test('company aggregates are calculated from visible factor profiles', () => {
  const state = defaults();
  state.companies.forEach((company) => {
    const baseline = Data.COMPANY_BASELINES.find((entry) => entry.id === company.id);
    Data.COMPANY_METRIC_KEYS.forEach((metricKey) => {
      const actual = Model.toScore20(Model.calculateCompanyMetric(company, metricKey));
      assert.ok(Math.abs(actual - baseline.scores20[metricKey]) < 0.02, `${company.id}.${metricKey}`);
    });
  });
});

test('supplied ETS Top 20 is merged exactly without dropping supplemental companies', () => {
  const state = defaults();
  const ranked = state.companies.filter((company) => company.etsRank2024);
  assert.equal(state.companies.length, 24);
  assert.equal(ranked.length, 20);
  assert.deepEqual(ranked.map((company) => company.etsRank2024), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.ok(Math.abs(ranked.reduce((sum, company) => sum + company.emissions2023Kt, 0) - 6182.637) < 1e-9);
  assert.ok(Math.abs(ranked.reduce((sum, company) => sum + company.emissions2024Kt, 0) - 6462.515) < 1e-9);
  assert.ok(Math.abs(ranked.reduce((sum, company) => sum + company.nationalShare2024, 0) - 14.91) < 1e-9);
  assert.ok(Math.abs(ranked.reduce((sum, company) => sum + company.industrialShare2024, 0) - 70.40) < 1e-9);
  assert.equal(state.companies.find((company) => company.id === 'lukoil').emissionsKt, 1803.061);
  assert.equal(state.companies.find((company) => company.id === 'neochim').emissionsKt, 553.866);
  assert.equal(state.companies.filter((company) => company.datasetScope === 'supplemental').length, 4);
});

test('sector analysis reproduces supplied aggregates and stays scenario-linked', () => {
  const state = defaults();
  const cluster = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const pressure = state.scenarios.find((scenario) => scenario.id === 'pressure');
  const analysis = Model.buildSectorAnalysis(cluster, state.companies);
  const pressureAnalysis = Model.buildSectorAnalysis(pressure, state.companies);
  assert.equal(analysis.summary.installationCount, 20);
  assert.equal(analysis.summary.sectorCount, 10);
  assert.equal(analysis.sectors.length, Data.SECTOR_PATHWAYS.length);
  assert.ok(Math.abs(analysis.summary.emissions2024Kt - 6462.515) < 1e-9);
  assert.ok(Math.abs(analysis.summary.yoyChange - 0.04526838628889274) < 1e-12);
  const cement = analysis.sectors.find((sector) => sector.id === 'cement');
  const glass = analysis.sectors.find((sector) => sector.id === 'glass');
  assert.equal(cement.installationCount, 3);
  assert.ok(Math.abs(cement.emissions2024Kt - 1459.075) < 1e-9);
  assert.equal(glass.installationCount, 5);
  assert.ok(Math.abs(glass.emissions2024Kt - 524.408) < 1e-9);
  analysis.sectors.forEach((sector) => {
    ['readiness', 'transitionPressure', 'confidence', 'reduction2030', 'reduction2050']
      .forEach((key) => assert.ok(sector[key] >= 0 && sector[key] <= 1, `${sector.id}.${key}`));
    assert.ok(sector.reduction2050 >= sector.reduction2030, sector.id);
    assert.ok(sector.source.url.startsWith('https://'));
  });
  assert.notEqual(analysis.summary.reduction2050, pressureAnalysis.summary.reduction2050);
});

test('all default scenario outputs stay inside the canonical range without saturation', () => {
  const state = defaults();
  state.scenarios.forEach((scenario) => {
    const outcome = Model.getScenarioOutcome(scenario, state.companies);
    outcomeVector(outcome).forEach((value) => assert.ok(value >= 0 && value <= 1));
    outcome.rows.forEach((row) => {
      ['B_eff', 'T_eff', 'M_eff', 'decarbonisationDepth', 'competitivenessRetention', 'industrialContinuity', 'transitionBalance']
        .forEach((key) => assert.ok(row[key] >= 0 && row[key] <= 1, `${scenario.id}.${row.id}.${key}`));
      assert.ok(row.B_eff < 0.999 && row.T_eff < 0.999 && row.M_eff < 0.999, `${scenario.id}.${row.id} saturated`);
    });
  });
});

test('coordinated growth outperforms pressure-only policy on depth and retention', () => {
  const state = defaults();
  const growth = Model.getScenarioOutcome(state.scenarios.find((scenario) => scenario.id === 'growth'), state.companies);
  const pressure = Model.getScenarioOutcome(state.scenarios.find((scenario) => scenario.id === 'pressure'), state.companies);
  assert.ok(growth.depth > pressure.depth);
  assert.ok(growth.retention > pressure.retention);
  assert.ok(growth.balance > pressure.balance);
});

test('default scenarios use distinct evidence-based parameter and technology portfolios', () => {
  const state = defaults();
  assert.equal(state.selectedScenarioId, 'volatile');
  assert.equal(state.scenarios.length, 7);

  state.scenarios.forEach((scenario) => {
    assert.ok(scenario.role.en && scenario.role.bg, `${scenario.id}.role`);
    assert.ok(scenario.basis.en && scenario.basis.bg, `${scenario.id}.basis`);
    assert.ok(scenario.focus.length >= 3, `${scenario.id}.focus`);
    assert.ok(scenario.evidence.length >= 1, `${scenario.id}.evidence`);
    scenario.evidence.forEach((item) => assert.match(item.url, /^https:\/\//));
    assert.ok(scenario.values.carbon_pressure >= 0.75, `${scenario.id}.carbon_pressure`);
  });

  const scenarioSignatures = new Set(state.scenarios.map((scenario) => JSON.stringify({
    technologies: scenario.technologies,
    transitionDynamics: scenario.transitionDynamics || null,
  })));
  assert.equal(scenarioSignatures.size, state.scenarios.length);

  let minimumDistance = Infinity;
  state.scenarios.forEach((scenario, index) => {
    state.scenarios.slice(index + 1).forEach((other) => {
      const squaredDistance = Data.SCENARIO_PARAMETER_KEYS.reduce((sum, key) => {
        const difference = Model.toScore20(scenario.values[key]) - Model.toScore20(other.values[key]);
        return sum + difference ** 2;
      }, 0);
      minimumDistance = Math.min(minimumDistance, Math.sqrt(squaredDistance / Data.SCENARIO_PARAMETER_KEYS.length));
    });
  });
  assert.ok(minimumDistance >= 3.2, `minimum scenario distance was ${minimumDistance.toFixed(2)} / 20`);

  const trajectories = Object.fromEntries(state.scenarios.map((scenario) => [
    scenario.id,
    Model.buildTransitionTrajectory(scenario, state.companies).aggregate.target2050,
  ]));
  assert.ok(trajectories.pressure < trajectories.volatile);
  assert.ok(trajectories.volatile < trajectories.defensive);
  assert.ok(trajectories.defensive < trajectories.growth);
  assert.ok(trajectories.growth < trajectories.cluster);
  assert.ok(trajectories.cluster - trajectories.pressure > 0.25);
});

test('front-loaded scenario delivers an early jump and then stays on a low plateau', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'stalled');
  const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);
  const point = (year) => trajectory.aggregate.points.find((entry) => entry.year === year);

  assert.equal(Model.getScenarioTransitionDynamics(scenario).type, 'front_loaded_plateau');
  assert.ok(point(2027).reduction > 0.19);
  assert.ok(point(2030).reduction > 0.27);
  assert.ok(trajectory.aggregate.target2050 > 0.33 && trajectory.aggregate.target2050 < 0.36);
  assert.ok(trajectory.aggregate.target2050 - point(2030).reduction < 0.07);
  assert.equal(trajectory.aggregate.closureDrivenReduction2050, 0);
  assert.equal(trajectory.aggregate.industrialActivity2050, 1);
});

test('deindustrialisation reaches zero territorial emissions with zero industry', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'shutdown');
  const outcome = Model.getScenarioOutcome(scenario, state.companies);
  const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);

  assert.equal(Model.getScenarioTransitionDynamics(scenario).type, 'deindustrialisation');
  assert.equal(trajectory.aggregate.target2050, 1);
  assert.equal(trajectory.aggregate.residualEmissions2050Kt, 0);
  assert.equal(trajectory.aggregate.industrialActivity2050, 0);
  assert.ok(trajectory.aggregate.technicalReduction2050 < 0.25);
  assert.ok(trajectory.aggregate.closureDrivenReduction2050 > 0.75);
  assert.ok(Math.abs(
    trajectory.aggregate.technicalReduction2050 + trajectory.aggregate.closureDrivenReduction2050 - 1
  ) < 1e-12);
  assert.equal(outcome.retention, 0);
  assert.equal(outcome.continuity, 0);
  assert.equal(outcome.balance, 0);
});

test('technology portfolio gates infrastructure values and nuclear capacity', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  assert.deepEqual(base.technologies, {
    greenHydrogen: true,
    electrolyzers: true,
    electrolyzerUnits: 10,
    ammoniaStorage: true,
    hydrogenToAmmoniaShare: 50,
    ccs: true,
    nuclearReactors: 0,
  });

  const disabled = {
    ...base,
    technologies: {
      ...base.technologies,
      greenHydrogen: false,
      electrolyzers: false,
      electrolyzerUnits: 0,
      ammoniaStorage: false,
      ccs: false,
      nuclearReactors: 0,
    },
  };
  assert.equal(Model.getEffectiveScenarioValue(disabled, 'hydrogen'), 0);
  assert.equal(Model.getEffectiveScenarioValue(disabled, 'co2_infra'), 0);

  const nuclear = { ...base, technologies: { ...base.technologies, nuclearReactors: 1 } };
  assert.ok(Model.getEffectiveScenarioValue(nuclear, 'power_access') > Model.getScenarioValue(base, 'power_access'));
  const trajectory = Model.buildTransitionTrajectory(nuclear, state.companies);
  const withoutNuclear = Model.buildTransitionTrajectory(base, state.companies);
  assert.equal(trajectory.nuclearCapacityMW, 1000);
  assert.equal(trajectory.nuclearGenerationTWh, 7.884);
  assert.equal(
    trajectory.aggregate.points.find((point) => point.year === 2035).reduction,
    withoutNuclear.aggregate.points.find((point) => point.year === 2035).reduction
  );
});

test('electrolyzer units add exactly 20 MW and produce scenario-gated hydrogen', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const active = {
    ...base,
    technologies: { ...base.technologies, electrolyzers: true, electrolyzerUnits: 1 },
  };
  assert.equal(Model.getElectrolyzerNameplateMW(active), 20);
  assert.equal(Model.getElectrolyzerCapacityMW(active), 20);
  assert.ok(Math.abs(Model.getElectrolyzerElectricityTWh(active) - 0.12264) < 1e-10);
  assert.ok(Math.abs(Model.getElectrolyzerHydrogenOutputKt(active) - 2.2298181818) < 1e-8);
  assert.ok(Math.abs(Model.getSolarOnlyHydrogenOutputKt(active) - 0.5733818182) < 1e-8);
  assert.ok(Math.abs(Model.getSolarPVRequiredMW(active) - 77.7777777778) < 1e-8);

  const switchedOff = { ...active, technologies: { ...active.technologies, electrolyzers: false } };
  assert.equal(Model.getElectrolyzerNameplateMW(switchedOff), 20);
  assert.equal(Model.getElectrolyzerCapacityMW(switchedOff), 0);
  assert.equal(Model.getElectrolyzerHydrogenOutputKt(switchedOff), 0);
});

test('green market assessment anchors Neochim to ammonia and separates hydrogen fuel use', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const active = {
    ...base,
    technologies: {
      ...base.technologies,
      electrolyzers: true,
      electrolyzerUnits: 10,
      ammoniaStorage: true,
      hydrogenToAmmoniaShare: 70,
    },
  };
  const assessment = Model.getGreenMarketAssessment(active, state.companies);
  const inactive = Model.getGreenMarketAssessment({
    ...base,
    technologies: {
      ...base.technologies,
      electrolyzers: false,
      electrolyzerUnits: 0,
      ammoniaStorage: false,
    },
  }, state.companies);
  assert.ok(Math.abs(assessment.hydrogenNeededForCurrentAmmoniaKt - 36.9095294118) < 1e-8);
  assert.equal(assessment.unitsForCurrentAmmoniaAtFullAllocation, 17);
  assert.equal(assessment.unitsForCurrentAllocation, 24);
  assert.ok(Math.abs(assessment.solarPVForCurrentAmmoniaMW - 1287.4334168) < 0.001);
  assert.ok(Math.abs(assessment.solarPVForFullAllocationPortfolioMW - 1322.2222222) < 1e-6);
  assert.ok(Math.abs(assessment.solarPVForCurrentAllocationPortfolioMW - 1866.6666667) < 1e-6);
  assert.ok(assessment.greenAmmoniaKt > 88 && assessment.greenAmmoniaKt < 89);
  assert.ok(assessment.greenAmmoniaShare > 0.42 && assessment.greenAmmoniaShare < 0.43);
  assert.ok(assessment.fertilizerProcessReadiness > 0 && assessment.fertilizerProcessReadiness < 1);
  assert.ok(assessment.marketableGreenShare > 0 && assessment.marketableGreenShare < assessment.greenAmmoniaShare);
  assert.ok(
    assessment.marketableGreenFertilizerKt
      < assessment.greenAmmoniaShare * assessment.fertilizerSalesKt * assessment.marketReadiness
  );
  assert.ok(assessment.neochimAnchorScore > inactive.neochimAnchorScore);
  assert.ok(assessment.hydrogenFuelShare > 0 && assessment.hydrogenFuelShare < 1);
  assert.ok(assessment.displacedCombustionEmissionsKt > 0);
  assert.equal(assessment.fuelRecipients[0].id, 'solvay');

  const neochimProfile = Model.getCompanyTransitionProfile('neochim');
  const solvayProfile = Model.getCompanyTransitionProfile('solvay');
  assert.equal(neochimProfile.ammoniaValueChainFit, 1);
  assert.equal(neochimProfile.hydrogenFeedstockFit, 1);
  assert.equal(solvayProfile.hydrogenFuelFit, 0.85);
  assert.equal(solvayProfile.ammoniaValueChainFit, 0);
});

test('hydrogen allocation trades green ammonia against high-temperature fuel', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const scenarioFor = (share) => ({
    ...base,
    technologies: {
      ...base.technologies,
      electrolyzers: true,
      electrolyzerUnits: 10,
      ammoniaStorage: true,
      hydrogenToAmmoniaShare: share,
    },
  });
  const allFuel = Model.getGreenMarketAssessment(scenarioFor(0), state.companies);
  const balanced = Model.getGreenMarketAssessment(scenarioFor(70), state.companies);
  const allAmmonia = Model.getGreenMarketAssessment(scenarioFor(100), state.companies);
  assert.equal(allFuel.greenAmmoniaKt, 0);
  assert.ok(balanced.greenAmmoniaKt > allFuel.greenAmmoniaKt);
  assert.ok(allAmmonia.greenAmmoniaKt > balanced.greenAmmoniaKt);
  assert.ok(allFuel.hydrogenFuelShare > balanced.hydrogenFuelShare);
  assert.ok(balanced.hydrogenFuelShare > allAmmonia.hydrogenFuelShare);
});

test('market readiness changes marketable output without changing physical hydrogen output', () => {
  const state = defaults();
  const withTechnology = (scenario) => ({
    ...scenario,
    technologies: {
      ...scenario.technologies,
      greenHydrogen: true,
      electrolyzers: true,
      electrolyzerUnits: 10,
      ammoniaStorage: true,
      hydrogenToAmmoniaShare: 70,
    },
  });
  const pressure = Model.getGreenMarketAssessment(
    withTechnology(state.scenarios.find((scenario) => scenario.id === 'pressure')),
    state.companies
  );
  const growth = Model.getGreenMarketAssessment(
    withTechnology(state.scenarios.find((scenario) => scenario.id === 'growth')),
    state.companies
  );
  assert.equal(growth.hydrogenKt, pressure.hydrogenKt);
  assert.ok(growth.marketReadiness > pressure.marketReadiness);
  assert.ok(growth.marketableGreenFertilizerKt > pressure.marketableGreenFertilizerKt);
  assert.ok(growth.electrolyzerScore > pressure.electrolyzerScore);
});

test('NH3 storage requires active electrolysis and follows its own start year', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const noElectrolysis = {
    ...base,
    technologies: {
      ...base.technologies,
      electrolyzers: false,
      electrolyzerUnits: 0,
      ammoniaStorage: true,
    },
  };
  assert.equal(Model.isAmmoniaStorageActive(noElectrolysis), false);
  assert.equal(Model.getCompanyTrajectoryProfile(state.companies[0], noElectrolysis).potentials.ammonia, 0);

  const electrolysis = {
    ...base,
    technologies: { ...base.technologies, electrolyzers: true, electrolyzerUnits: 10, ammoniaStorage: false },
  };
  const withAmmonia = {
    ...electrolysis,
    technologies: { ...electrolysis.technologies, ammoniaStorage: true },
  };
  const electrolysisTrajectory = Model.buildTransitionTrajectory(electrolysis, state.companies);
  const ammoniaTrajectory = Model.buildTransitionTrajectory(withAmmonia, state.companies);
  assert.equal(Model.isAmmoniaStorageActive(withAmmonia), true);
  assert.ok(ammoniaTrajectory.aggregate.contributions2050.ammonia > 0);
  assert.ok(ammoniaTrajectory.aggregate.target2050 > electrolysisTrajectory.aggregate.target2050);
  assert.equal(
    ammoniaTrajectory.aggregate.points.find((point) => point.year === Data.TECHNOLOGY_ASSUMPTIONS.ammoniaFirstOnlineYear).reduction,
    electrolysisTrajectory.aggregate.points.find((point) => point.year === Data.TECHNOLOGY_ASSUMPTIONS.ammoniaFirstOnlineYear).reduction
  );
});

test('electrolyzer contribution starts in 2028 and has diminishing capacity benefit', () => {
  const state = defaults();
  const base = state.scenarios.find((scenario) => scenario.id === 'cluster');
  const inactive = {
    ...base,
    technologies: {
      ...base.technologies,
      electrolyzers: false,
      electrolyzerUnits: 0,
      ammoniaStorage: false,
    },
  };
  const active = {
    ...inactive,
    technologies: { ...inactive.technologies, electrolyzers: true, electrolyzerUnits: 10 },
  };
  const baseTrajectory = Model.buildTransitionTrajectory(inactive, state.companies);
  const activeTrajectory = Model.buildTransitionTrajectory(active, state.companies);
  assert.equal(
    activeTrajectory.aggregate.points.find((point) => point.year === Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerFirstOnlineYear).reduction,
    baseTrajectory.aggregate.points.find((point) => point.year === Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerFirstOnlineYear).reduction
  );
  assert.ok(activeTrajectory.aggregate.target2050 > baseTrajectory.aggregate.target2050);

  const oneUnit = { ...inactive, technologies: { ...inactive.technologies, electrolyzers: true, electrolyzerUnits: 1 } };
  const twoUnits = { ...inactive, technologies: { ...inactive.technologies, electrolyzers: true, electrolyzerUnits: 2 } };
  assert.ok(Model.getElectrolyzerSupplyFactor(twoUnits) > Model.getElectrolyzerSupplyFactor(oneUnit));
  assert.ok(
    Model.getElectrolyzerSupplyFactor(twoUnits) - Model.getElectrolyzerSupplyFactor(oneUnit)
      < Model.getElectrolyzerSupplyFactor(oneUnit)
  );
});

test('transition trajectories are bounded, monotonic, and company-resolved', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);
  assert.equal(trajectory.companies.length, state.companies.length);
  assert.equal(trajectory.aggregate.points.length, 101);
  assert.equal(trajectory.aggregate.points[0].year, 2025);
  assert.equal(trajectory.aggregate.points.at(-1).year, 2050);
  assert.equal(trajectory.aggregate.points[0].reduction, 0);
  assert.ok(trajectory.aggregate.target2050 <= Data.TECHNOLOGY_ASSUMPTIONS.maxReduction);
  trajectory.companies.forEach((company) => {
    company.points.forEach((point, index) => {
      assert.ok(point.reduction >= 0 && point.reduction <= Data.TECHNOLOGY_ASSUMPTIONS.maxReduction);
      if (index) assert.ok(point.reduction >= company.points[index - 1].reduction, `${company.id}.${point.year}`);
    });
  });
});

test('trajectory responds to scenarios, technologies, and company factors', () => {
  const state = defaults();
  const cluster = state.scenarios.find((entry) => entry.id === 'cluster');
  const pressure = state.scenarios.find((entry) => entry.id === 'pressure');
  const growth = state.scenarios.find((entry) => entry.id === 'growth');
  assert.ok(
    Model.buildTransitionTrajectory(growth, state.companies).aggregate.target2050
      > Model.buildTransitionTrajectory(pressure, state.companies).aggregate.target2050
  );

  const noTechnologies = { ...cluster, technologies: { greenHydrogen: false, ccs: false, nuclearReactors: 0 } };
  const hydrogenOnly = { ...cluster, technologies: { greenHydrogen: true, ccs: false, nuclearReactors: 0 } };
  const ccsOnly = { ...cluster, technologies: { greenHydrogen: false, ccs: true, nuclearReactors: 0 } };
  const full = { ...cluster, technologies: { greenHydrogen: true, ccs: true, nuclearReactors: 0 } };
  const oneReactor = { ...cluster, technologies: { greenHydrogen: true, ccs: true, nuclearReactors: 1 } };
  const fourReactors = { ...cluster, technologies: { greenHydrogen: true, ccs: true, nuclearReactors: 4 } };
  const target = (scenario) => Model.buildTransitionTrajectory(scenario, state.companies).aggregate.target2050;
  assert.ok(target(hydrogenOnly) > target(noTechnologies));
  assert.ok(target(ccsOnly) > target(noTechnologies));
  assert.ok(target(full) > target(hydrogenOnly));
  assert.ok(target(oneReactor) > target(full));
  assert.ok(target(fourReactors) > target(oneReactor));
  assert.ok(target(fourReactors) - target(oneReactor) < 3 * (target(oneReactor) - target(full)));

  const company = state.companies.find((entry) => entry.id === 'solvay');
  const lowProcess = Model.setCompanyFactor(company, 'E_i', 'process_emissions_share', 0);
  const highProcess = Model.setCompanyFactor(company, 'E_i', 'process_emissions_share', 1);
  assert.ok(
    Model.getCompanyTrajectoryProfile(highProcess, full).potentials.ccs
      > Model.getCompanyTrajectoryProfile(lowProcess, full).potentials.ccs
  );
});

test('every scenario input changes at least one modeled outcome', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  Data.SCENARIO_PARAMETER_KEYS.forEach((key) => {
    const low = { ...scenario, values: { ...scenario.values, [key]: Math.max(0, scenario.values[key] - 0.1) } };
    const high = { ...scenario, values: { ...scenario.values, [key]: Math.min(1, scenario.values[key] + 0.1) } };
    const lowOutcome = Model.getScenarioOutcome(low, state.companies);
    const highOutcome = Model.getScenarioOutcome(high, state.companies);
    const difference = outcomeVector(highOutcome).reduce((sum, value, index) => sum + Math.abs(value - outcomeVector(lowOutcome)[index]), 0);
    assert.ok(difference > 1e-7, `${key} has no modeled effect`);
  });
});

test('E_i, C_i, K_i, and power-price sensitivity each affect a relevant result', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const baseCompany = state.companies.find((company) => company.id === 'solvay');
  const base = Model.applyScenarioToCompany(baseCompany, scenario);

  const highE = Model.applyScenarioToCompany(Model.setCompanyMetricTarget(baseCompany, 'E_i', 0.2), scenario);
  const highC = Model.applyScenarioToCompany(Model.setCompanyMetricTarget(baseCompany, 'C_i', 0.2), scenario);
  const highK = Model.applyScenarioToCompany(Model.setCompanyMetricTarget(baseCompany, 'K_i', 0.2), scenario);
  const highPower = Model.applyScenarioToCompany(Model.setCompanyMetricTarget(baseCompany, 'power_price_sensitivity', 0.2), scenario);

  assert.notEqual(highE.decarbonisationDepth, base.decarbonisationDepth);
  assert.notEqual(highC.competitivenessRetention, base.competitivenessRetention);
  assert.notEqual(highK.industrialContinuity, base.industrialContinuity);
  assert.notEqual(highPower.bottlenecks.power, base.bottlenecks.power);
});

test('changing an aggregate updates its factors and changing one factor updates the aggregate', () => {
  const company = defaults().companies[0];
  const retargeted = Model.setCompanyMetricTarget(company, 'B_i', 0.5);
  assert.ok(Math.abs(Model.calculateCompanyMetric(retargeted, 'B_i') - 0.5) < 1e-6);
  const changed = Model.setCompanyFactor(retargeted, 'B_i', 'cashflow_resilience', 1);
  assert.notEqual(Model.calculateCompanyMetric(changed, 'B_i'), Model.calculateCompanyMetric(retargeted, 'B_i'));
});

test('network analysis uses edges and returns bounded risk metrics', () => {
  const state = defaults();
  const analysis = Model.analyzeNetwork(state.companies);
  assert.equal(analysis.nodes.length, state.companies.length);
  assert.equal(analysis.edges.length, Data.NETWORK_EDGES.length);
  analysis.nodes.forEach((node) => {
    ['weightedCentrality', 'betweenness', 'failureImpact', 'anchorRisk'].forEach((key) => {
      assert.ok(node[key] >= 0 && node[key] <= 1, `${node.id}.${key}`);
    });
  });
  assert.ok(analysis.nodes[0].anchorRisk >= analysis.nodes.at(-1).anchorRisk);
});

test('shared infrastructure assessment produces ranked, bounded priorities', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const projects = Model.assessSharedInfrastructure(scenario, state.companies);
  assert.equal(projects.length, Data.SHARED_INFRASTRUCTURE_OPPORTUNITIES.length);
  projects.forEach((project) => {
    assert.ok(project.priority >= 0 && project.priority <= 1);
    assert.ok(project.readiness >= 0 && project.readiness <= 1);
    assert.ok(project.memberCompanies.length > 0);
  });
  assert.ok(projects[0].priority >= projects.at(-1).priority);
});

test('decision layer links pathway CAPEX and abatement to companies', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const pathways = [
    { id: 'a', co: 'Solvay Sodi', name: 'Project A', capex_M: 100, co2_kt: 250, starts: 2028 },
    { id: 'b', co: 'Solvay Sodi', name: 'Project B', capex_M: 50, co2_kt: 80, starts: 2027 },
  ];
  const decision = Model.getDecisionLayer(scenario, state.companies, { pathways });
  const solvay = decision.companyPriorities.find((company) => company.id === 'solvay');
  assert.equal(solvay.capexM, 150);
  assert.equal(solvay.abatementKt, 330);
  assert.equal(solvay.firstStartYear, 2027);
  assert.equal(solvay.pathwayCount, 2);
});

test('sensitivity covers every scenario input', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const sensitivity = Model.runSensitivity(scenario, state.companies);
  assert.equal(sensitivity.length, Data.SCENARIO_PARAMETER_KEYS.length);
  assert.deepEqual(new Set(sensitivity.map((row) => row.key)), new Set(Data.SCENARIO_PARAMETER_KEYS));
  assert.ok(sensitivity.some((row) => Math.abs(row.balanceDerivative) > 0.001));
});

test('Monte Carlo analysis is deterministic, bounded, and ordered', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const options = { iterations: 200, uncertainty20: 2, seed: 42 };
  const first = Model.runMonteCarlo(scenario, state.companies, options);
  const second = Model.runMonteCarlo(scenario, state.companies, options);
  assert.deepEqual(first.summary, second.summary);
  const outcomeKeys = ['depth', 'retention', 'continuity', 'balance'];
  outcomeKeys.forEach((key) => {
    const summary = first.summary[key];
    assert.ok(summary.p10 >= 0 && summary.p90 <= 1);
    assert.ok(summary.p10 <= summary.p50 && summary.p50 <= summary.p90);
  });
});

test('Monte Carlo accepts zero uncertainty as a deterministic run', () => {
  const state = defaults();
  const scenario = state.scenarios.find((entry) => entry.id === 'cluster');
  const result = Model.runMonteCarlo(scenario, state.companies, { iterations: 100, uncertainty20: 0, seed: 7 });
  assert.equal(result.uncertainty20, 0);
  Object.values(result.summary).forEach((summary) => {
    assert.equal(summary.min, summary.max);
    assert.equal(summary.p10, summary.p90);
  });
});

test('simulation state supports edit, undo, clone, export, and import', () => {
  Simulation.resetAll();
  assert.equal(Simulation.selectComparisonScenario('growth'), true);
  assert.equal(Simulation.getComparisonScenario().id, 'growth');
  assert.equal(Simulation.selectComparisonScenario('missing-scenario'), false);
  const initial = Model.toScore20(Simulation.getState().scenarios.find((scenario) => scenario.id === 'cluster').values.finance);
  assert.equal(Simulation.updateScenarioValue('cluster', 'finance', 3), true);
  assert.equal(Model.toScore20(Simulation.getState().scenarios.find((scenario) => scenario.id === 'cluster').values.finance), 3);
  assert.equal(Simulation.undo(), true);
  assert.equal(Model.toScore20(Simulation.getState().scenarios.find((scenario) => scenario.id === 'cluster').values.finance), initial);

  const cloned = Simulation.cloneScenario('cluster');
  assert.ok(cloned?.custom);
  assert.ok(Simulation.getState().scenarios.some((scenario) => scenario.id === cloned.id));
  assert.equal(Simulation.deleteScenario(cloned.id), true);

  const exported = Simulation.exportStateJson();
  const imported = Simulation.importStateJson(exported);
  assert.equal(imported.ok, true);
  assert.equal(Simulation.getState().version, Data.VERSION);
});

test('simulation persists scenario-specific technology portfolios', () => {
  Simulation.resetAll();
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'greenHydrogen', false), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'electrolyzers', true), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'electrolyzerUnits', 4), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'ammoniaStorage', true), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'hydrogenToAmmoniaShare', 65), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'ccs', false), true);
  assert.equal(Simulation.updateScenarioTechnology('cluster', 'nuclearReactors', 2), true);
  let scenario = Simulation.getState().scenarios.find((entry) => entry.id === 'cluster');
  assert.deepEqual(scenario.technologies, {
    greenHydrogen: false,
    electrolyzers: true,
    electrolyzerUnits: 4,
    ammoniaStorage: true,
    hydrogenToAmmoniaShare: 65,
    ccs: false,
    nuclearReactors: 2,
  });

  const cloned = Simulation.cloneScenario('cluster');
  assert.deepEqual(cloned.technologies, scenario.technologies);
  assert.equal(Simulation.updateScenarioTechnology(cloned.id, 'electrolyzerUnits', 9999), true);
  assert.equal(Simulation.getSelectedScenario().technologies.electrolyzerUnits, Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits);
  assert.equal(Simulation.updateScenarioTechnology(cloned.id, 'nuclearReactors', 99), true);
  assert.equal(Simulation.getSelectedScenario().technologies.nuclearReactors, Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors);
  assert.equal(Simulation.updateScenarioTechnology(cloned.id, 'hydrogenToAmmoniaShare', 999), true);
  assert.equal(Simulation.getSelectedScenario().technologies.hydrogenToAmmoniaShare, 100);

  const exported = Simulation.exportStateJson();
  Simulation.resetAll();
  assert.equal(Simulation.importStateJson(exported).ok, true);
  scenario = Simulation.getState().scenarios.find((entry) => entry.id === 'cluster');
  assert.deepEqual(scenario.technologies, {
    greenHydrogen: false,
    electrolyzers: true,
    electrolyzerUnits: 4,
    ammoniaStorage: true,
    hydrogenToAmmoniaShare: 65,
    ccs: false,
    nuclearReactors: 2,
  });
});
