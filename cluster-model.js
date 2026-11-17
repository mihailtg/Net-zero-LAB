(function initClusterModel(root, factory) {
  const data = root.ClusterData || (typeof require === 'function' ? require('./cluster-data.js') : null);
  const api = factory(data);
  root.ClusterModel = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createClusterModel(Data) {
  'use strict';

  if (!Data) throw new Error('ClusterData must be loaded before ClusterModel.');

  function clamp01(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(1, numeric));
  }

  function toScore20(value) {
    return clamp01(value) * Data.VISUAL_SCALE_MAX;
  }

  function fromScore20(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return clamp01(numeric / Data.VISUAL_SCALE_MAX);
  }

  function mean(values) {
    const numeric = values.filter((value) => Number.isFinite(Number(value))).map(Number);
    return numeric.length ? numeric.reduce((sum, value) => sum + value, 0) / numeric.length : 0;
  }

  function weightedMean(pairs) {
    const totalWeight = pairs.reduce((sum, pair) => sum + pair[1], 0);
    if (!totalWeight) return 0;
    return pairs.reduce((sum, pair) => sum + Number(pair[0] || 0) * pair[1], 0) / totalWeight;
  }

  function quantile(sortedValues, percentile) {
    if (!sortedValues.length) return 0;
    const index = (sortedValues.length - 1) * percentile;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper || sortedValues[lower] === sortedValues[upper]) return sortedValues[lower];
    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  function getScenarioValue(scenario, key) {
    return clamp01(scenario?.values?.[key] ?? scenario?.[key] ?? 0);
  }

  function getTechnologyPortfolio(scenario) {
    const source = scenario?.technologies || Data.TECHNOLOGY_DEFAULTS;
    const enabled = (key) => source[key] === undefined
      ? Boolean(Data.TECHNOLOGY_DEFAULTS[key])
      : source[key] !== false && source[key] !== 0 && source[key] !== 'false';
    return {
      greenHydrogen: enabled('greenHydrogen'),
      electrolyzers: enabled('electrolyzers'),
      electrolyzerUnits: Math.max(0, Math.min(
        Data.TECHNOLOGY_ASSUMPTIONS.maxElectrolyzerUnits,
        Math.round(Number(source.electrolyzerUnits) || 0)
      )),
      ammoniaStorage: enabled('ammoniaStorage'),
      hydrogenToAmmoniaShare: Math.max(0, Math.min(
        100,
        Math.round(Number(source.hydrogenToAmmoniaShare ?? Data.TECHNOLOGY_DEFAULTS.hydrogenToAmmoniaShare) || 0)
      )),
      ccs: enabled('ccs'),
      nuclearReactors: Math.max(0, Math.min(
        Data.TECHNOLOGY_ASSUMPTIONS.maxNuclearReactors,
        Math.round(Number(source.nuclearReactors) || 0)
      )),
    };
  }

  function getNuclearSupplyFactor(scenario) {
    const reactors = getTechnologyPortfolio(scenario).nuclearReactors;
    return clamp01(1 - Math.exp(-reactors / 2.2));
  }

  function getElectrolyzerNameplateMW(scenario) {
    return getTechnologyPortfolio(scenario).electrolyzerUnits * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW;
  }

  function getElectrolyzerCapacityMW(scenario) {
    const technologies = getTechnologyPortfolio(scenario);
    if (!technologies.greenHydrogen || !technologies.electrolyzers) return 0;
    return technologies.electrolyzerUnits * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW;
  }

  function getElectrolyzerSupplyFactor(scenario) {
    return clamp01(1 - Math.exp(-getElectrolyzerCapacityMW(scenario) / 600));
  }

  function getElectrolyzerElectricityTWh(scenario) {
    return getElectrolyzerElectricityTWhAtCapacityFactor(
      scenario,
      Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor
    );
  }

  function getElectrolyzerHydrogenOutputKt(scenario) {
    return getElectrolyzerHydrogenOutputKtAtCapacityFactor(
      scenario,
      Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor
    );
  }

  function getElectrolyzerElectricityTWhAtCapacityFactor(scenario, capacityFactor) {
    return getElectrolyzerCapacityMW(scenario)
      * clamp01(capacityFactor)
      * 8760
      / 1000000;
  }

  function getElectrolyzerHydrogenOutputKtAtCapacityFactor(scenario, capacityFactor) {
    return getElectrolyzerCapacityMW(scenario)
      * clamp01(capacityFactor)
      * 8760
      / (Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSystemKWhPerKg * 1000);
  }

  function getSolarOnlyHydrogenOutputKt(scenario) {
    return getElectrolyzerHydrogenOutputKtAtCapacityFactor(
      scenario,
      Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor
    );
  }

  function getSolarPVRequiredMW(scenario) {
    const electricityMWh = getElectrolyzerElectricityTWh(scenario) * 1000000;
    const annualMWhPerMW = Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor * 8760;
    return annualMWhPerMW > 0 ? electricityMWh / annualMWhPerMW : 0;
  }

  function getElectrolyzerReadiness(scenario) {
    return weightedMean([
      [getScenarioValue(scenario, 'power_access'), 0.24],
      [getScenarioValue(scenario, 'grid_readiness'), 0.16],
      [getScenarioValue(scenario, 'power_price_visibility'), 0.14],
      [getScenarioValue(scenario, 'engineering_capacity'), 0.16],
      [getScenarioValue(scenario, 'finance'), 0.12],
      [getScenarioValue(scenario, 'permitting'), 0.08],
      [getScenarioValue(scenario, 'hydrogen'), 0.10],
    ]);
  }

  function isAmmoniaStorageActive(scenario) {
    return getTechnologyPortfolio(scenario).ammoniaStorage && getElectrolyzerCapacityMW(scenario) > 0;
  }

  function getAmmoniaReadiness(scenario) {
    return weightedMean([
      [getScenarioValue(scenario, 'cluster_coordination'), 0.22],
      [getScenarioValue(scenario, 'offtake_bankability'), 0.20],
      [getScenarioValue(scenario, 'certification_traceability'), 0.18],
      [getScenarioValue(scenario, 'permitting'), 0.14],
      [getScenarioValue(scenario, 'finance'), 0.14],
      [getScenarioValue(scenario, 'hydrogen'), 0.12],
    ]);
  }

  function getEffectiveScenarioValue(scenario, key) {
    const technologies = getTechnologyPortfolio(scenario);
    const raw = getScenarioValue(scenario, key);
    if (key === 'hydrogen') {
      if (!technologies.greenHydrogen) return 0;
      const electrolyzerBoost = 0.40
        * getElectrolyzerSupplyFactor(scenario)
        * (0.30 + 0.70 * getElectrolyzerReadiness(scenario));
      const afterElectrolysis = clamp01(raw + electrolyzerBoost * (1 - raw));
      if (!isAmmoniaStorageActive(scenario)) return afterElectrolysis;
      const storageBoost = 0.12
        * getElectrolyzerSupplyFactor(scenario)
        * (0.35 + 0.65 * getAmmoniaReadiness(scenario));
      return clamp01(afterElectrolysis + storageBoost * (1 - afterElectrolysis));
    }
    if (key === 'co2_infra') return technologies.ccs ? raw : 0;
    if (key === 'offtake_bankability' && isAmmoniaStorageActive(scenario)) {
      const ammoniaBoost = 0.15
        * getElectrolyzerSupplyFactor(scenario)
        * (0.35 + 0.65 * getAmmoniaReadiness(scenario));
      return clamp01(raw + ammoniaBoost * (1 - raw));
    }
    const nuclearSupply = getNuclearSupplyFactor(scenario);
    if (key === 'power_access') return clamp01(raw + 0.28 * nuclearSupply * (1 - raw));
    if (key === 'grid_readiness') return clamp01(raw + 0.18 * nuclearSupply * (1 - raw));
    if (key === 'power_price_visibility') return clamp01(raw + 0.22 * nuclearSupply * (1 - raw));
    return raw;
  }

  function getScenarioName(scenario, language = 'en') {
    if (scenario?.name && typeof scenario.name === 'object') {
      return scenario.name[language] || scenario.name.en || scenario.name.bg || scenario.id || '';
    }
    return String(scenario?.name || scenario?.id || '');
  }

  function getMetricDefinition(metricKey) {
    return Data.COMPANY_METRIC_DEFINITIONS.find((metric) => metric.key === metricKey) || null;
  }

  function calculateCompanyMetric(company, metricKey) {
    const definition = getMetricDefinition(metricKey);
    if (!definition) return 0;
    const factors = company?.factors?.[metricKey] || {};
    return clamp01(mean(definition.factors.map((factor) => factors[factor.key])));
  }

  function hydrateCompany(company) {
    const hydrated = { ...company, scores: {} };
    Data.COMPANY_METRIC_KEYS.forEach((metricKey) => {
      const value = calculateCompanyMetric(company, metricKey);
      hydrated.scores[metricKey] = value;
      hydrated[metricKey] = value;
    });
    return hydrated;
  }

  function getScenarioGroupScores(scenario) {
    return Object.fromEntries(Data.SCENARIO_GROUPS.map((group) => [
      group.id,
      mean(group.keys.map((key) => getScenarioValue(scenario, key))),
    ]));
  }

  function getScenarioEnablementScore(scenario) {
    const enablementKeys = Data.SCENARIO_PARAMETERS
      .filter((parameter) => parameter.direction === 'enablement')
      .map((parameter) => parameter.key);
    return mean(enablementKeys.map((key) => getScenarioValue(scenario, key)));
  }

  function getScenarioPolicyStrength(scenario) {
    return clamp01(0.20 * getScenarioValue(scenario, 'carbon_pressure') + 0.80 * getScenarioEnablementScore(scenario));
  }

  function getScenarioTransitionDynamics(scenario) {
    const source = scenario?.transitionDynamics || {};
    if (source.type === 'front_loaded_plateau') {
      return {
        type: source.type,
        technicalReduction2050: clamp01(Number(source.technicalReduction2050) || 0.34),
        earlyResponseYear: Number(source.earlyResponseYear) || 2031,
        earlyResponseShare: clamp01(Number(source.earlyResponseShare) || 0.82),
        plateauYear: Number(source.plateauYear) || 2036,
        plateauShare: clamp01(Number(source.plateauShare) || 0.94),
      };
    }
    if (source.type === 'deindustrialisation') {
      return {
        type: source.type,
        technicalReduction2050: clamp01(Number(source.technicalReduction2050) || 0.22),
        closureStartYear: Number(source.closureStartYear) || 2027,
        closureMidpoint: Number(source.closureMidpoint) || 2038,
        closureRate: Math.max(0.01, Number(source.closureRate) || 0.22),
      };
    }
    return { type: 'standard' };
  }

  function applyScenarioToCompany(companyInput, scenario) {
    const company = companyInput.scores ? companyInput : hydrateCompany(companyInput);
    const technologies = getTechnologyPortfolio(scenario);
    const transitionDynamics = getScenarioTransitionDynamics(scenario);
    const nuclearSupplyFactor = getNuclearSupplyFactor(scenario);
    const value = (key) => getEffectiveScenarioValue(scenario, key);
    const infraPush = mean([value('grid_readiness'), value('hydrogen'), value('co2_infra')]);

    const businessEnablement = weightedMean([
      [value('market_pull'), 0.22],
      [value('market_push'), 0.12],
      [value('offtake_bankability'), 0.18],
      [value('certification_traceability'), 0.12],
      [value('stability'), 0.14],
      [value('finance'), 0.12],
      [value('power_price_visibility'), 0.10],
    ]);
    const carbonExposure = clamp01(
      0.50 * company.carbon_sensitivity
      + 0.30 * company.C_i
      + 0.20 * company.power_price_sensitivity * (1 - value('power_price_visibility'))
    );
    const B_eff = clamp01(
      company.B_i
      + 0.34 * businessEnablement * (1 - company.B_i)
      - 0.24 * value('carbon_pressure') * carbonExposure * company.B_i
    );

    const technologyEnablement = weightedMean([
      [value('power_access'), 0.18],
      [value('power_price_visibility'), 0.12],
      [infraPush * (0.45 + 0.55 * company.infra_dependency), 0.20],
      [value('engineering_capacity'), 0.16],
      [value('finance'), 0.12],
      [value('cluster_coordination'), 0.10],
      [value('permitting'), 0.08],
      [value('certification_traceability'), 0.04],
    ]);
    const infrastructureConstraint = company.infra_dependency * (1 - infraPush);
    const T_eff = clamp01(
      company.T_i
      + 0.40 * technologyEnablement * (1 - company.T_i)
      - 0.16 * infrastructureConstraint * company.T_i
    );

    const executionEnablement = weightedMean([
      [value('finance'), 0.20],
      [value('engineering_capacity'), 0.18],
      [value('cluster_coordination'), 0.18],
      [value('permitting'), 0.14],
      [value('stability'), 0.14],
      [value('market_push'), 0.08],
      [infraPush, 0.08],
    ]);
    const executionDrag = (1 - value('stability')) * (0.35 + 0.35 * company.C_i + 0.30 * company.infra_dependency);
    const M_eff = clamp01(
      company.M_i
      + 0.44 * executionEnablement * (1 - company.M_i)
      - 0.18 * executionDrag * company.M_i
    );

    let decarbonisationDepth = clamp01(
      0.20 * T_eff
      + 0.18 * M_eff
      + 0.18 * company.E_i
      + 0.12 * value('carbon_pressure')
      + 0.10 * infraPush
      + 0.08 * value('power_access')
      + 0.06 * value('finance')
      + 0.05 * value('engineering_capacity')
      + 0.03 * value('cluster_coordination')
    );

    const competitivenessResilience = clamp01(
      1 - company.C_i * (
        0.55 * value('carbon_pressure')
        + 0.45 * company.power_price_sensitivity * (1 - value('power_price_visibility'))
      )
    );
    let competitivenessRetention = clamp01(
      0.28 * B_eff
      + 0.12 * T_eff
      + 0.10 * M_eff
      + 0.12 * value('market_pull')
      + 0.09 * value('stability')
      + 0.07 * value('finance')
      + 0.06 * value('offtake_bankability')
      + 0.06 * value('certification_traceability')
      + 0.10 * competitivenessResilience
    );

    let industrialContinuity = clamp01(
      0.38 * competitivenessRetention
      + 0.22 * company.K_i
      + 0.14 * (1 - company.C_i)
      + 0.10 * B_eff
      + 0.08 * value('cluster_coordination')
      + 0.08 * value('stability')
    );
    if (transitionDynamics.type === 'front_loaded_plateau') {
      decarbonisationDepth = Math.min(decarbonisationDepth, transitionDynamics.technicalReduction2050);
    }
    if (transitionDynamics.type === 'deindustrialisation') {
      decarbonisationDepth = Math.min(decarbonisationDepth, transitionDynamics.technicalReduction2050);
      competitivenessRetention = 0;
      industrialContinuity = 0;
    }
    const transitionBalance = Math.sqrt(decarbonisationDepth * competitivenessRetention);
    const phi = B_eff - T_eff;

    const bottlenecks = {
      finance: clamp01(1 - (0.45 * value('finance') + 0.20 * value('offtake_bankability') + 0.20 * M_eff + 0.15 * B_eff)),
      permitting: clamp01(1 - (0.50 * value('permitting') + 0.20 * value('certification_traceability') + 0.20 * M_eff + 0.10 * value('stability'))),
      infrastructure: clamp01(
        0.50 * company.infra_dependency * (1 - infraPush)
        + 0.20 * (1 - value('power_access'))
        + 0.15 * (1 - T_eff)
        + 0.15 * company.power_price_sensitivity * (1 - value('power_price_visibility'))
      ),
      market: clamp01(1 - (
        0.35 * value('market_pull')
        + 0.25 * value('market_push')
        + 0.20 * value('offtake_bankability')
        + 0.10 * value('certification_traceability')
        + 0.10 * B_eff
      )),
      carbon: clamp01(
        value('carbon_pressure')
        * (0.55 * company.carbon_sensitivity + 0.30 * company.C_i + 0.15 * company.E_i)
        * (1 - 0.25 * value('certification_traceability'))
      ),
      power: clamp01(
        company.power_price_sensitivity
        * (0.55 * (1 - value('power_price_visibility'))
          + 0.30 * (1 - value('power_access'))
          + 0.15 * company.infra_dependency * (1 - value('grid_readiness')))
      ),
    };

    return {
      ...company,
      B_eff,
      T_eff,
      M_eff,
      phi,
      infraPush,
      businessEnablement,
      technologyEnablement,
      executionEnablement,
      technologies,
      transitionDynamics,
      nuclearSupplyFactor,
      nuclearCapacityMW: technologies.nuclearReactors * Data.TECHNOLOGY_ASSUMPTIONS.nuclearUnitMW,
      electrolyzerNameplateMW: getElectrolyzerNameplateMW(scenario),
      electrolyzerCapacityMW: getElectrolyzerCapacityMW(scenario),
      electrolyzerHydrogenKt: getElectrolyzerHydrogenOutputKt(scenario),
      decarbonisationDepth,
      competitivenessRetention,
      industrialContinuity,
      transitionBalance,
      bicontinuousScore: clamp01(1 - Math.abs(phi) / 0.35),
      bottlenecks,
    };
  }

  function applyScenarioToCompanies(companies, scenario) {
    return companies.map((company) => applyScenarioToCompany(company, scenario));
  }

  function getScenarioOutcome(scenario, companies) {
    const rows = applyScenarioToCompanies(companies, scenario);
    const weights = rows.map((row) => Math.max(0.05, row.industrial_weight));
    const weighted = (key) => weightedMean(rows.map((row, index) => [row[key], weights[index]]));
    return {
      scenarioId: scenario.id,
      rows,
      depth: weighted('decarbonisationDepth'),
      retention: weighted('competitivenessRetention'),
      continuity: weighted('industrialContinuity'),
      balance: weighted('transitionBalance'),
      bicontinuousShare: rows.filter((row) => Math.abs(row.phi) <= 0.15).length / Math.max(1, rows.length),
      enablement: getScenarioEnablementScore(scenario),
      policyStrength: getScenarioPolicyStrength(scenario),
      technologies: getTechnologyPortfolio(scenario),
    };
  }

  function getCompanyFactor(company, metricKey, factorKey, fallback = 0) {
    const value = Number(company?.factors?.[metricKey]?.[factorKey]);
    return Number.isFinite(value) ? clamp01(value) : clamp01(fallback);
  }

  function getCompanyTransitionProfile(companyInput) {
    const id = typeof companyInput === 'string' ? companyInput : companyInput?.id;
    return Data.COMPANY_TRANSITION_PROFILES?.[id] || {
      ammoniaValueChainFit: 0,
      hydrogenFeedstockFit: 0.10,
      hydrogenFuelFit: 0.20,
      greenProductLeverage: 0.40,
      highTemperatureFuelFit: 0.20,
      combustionEmissionsShare: 0.50,
    };
  }

  function getGreenMarketReadiness(scenario) {
    return weightedMean([
      [getScenarioValue(scenario, 'market_pull'), 0.20],
      [getScenarioValue(scenario, 'market_push'), 0.15],
      [getScenarioValue(scenario, 'offtake_bankability'), 0.20],
      [getScenarioValue(scenario, 'certification_traceability'), 0.20],
      [getScenarioValue(scenario, 'carbon_pressure'), 0.10],
      [getScenarioValue(scenario, 'finance'), 0.10],
      [getScenarioValue(scenario, 'power_price_visibility'), 0.05],
    ]);
  }

  function getGreenMarketAssessment(scenario, companies) {
    const technologies = getTechnologyPortfolio(scenario);
    const hydrogenKt = getElectrolyzerHydrogenOutputKt(scenario);
    const solarOnlyHydrogenKt = getSolarOnlyHydrogenOutputKt(scenario);
    const marketReadiness = getGreenMarketReadiness(scenario);
    const electrolyzerReadiness = getElectrolyzerReadiness(scenario);
    const ammoniaActive = isAmmoniaStorageActive(scenario);
    const ammoniaAllocationShare = ammoniaActive ? technologies.hydrogenToAmmoniaShare / 100 : 0;
    const ammoniaProductionKt = Data.TECHNOLOGY_ASSUMPTIONS.neochimAmmoniaProductionKt2024;
    const ammoniaCapacityKt = Data.TECHNOLOGY_ASSUMPTIONS.neochimAmmoniaCapacityKt;
    const fertilizerSalesKt = Data.TECHNOLOGY_ASSUMPTIONS.neochimFertilizerSalesKt2024;
    const hydrogenMassFraction = Data.TECHNOLOGY_ASSUMPTIONS.ammoniaHydrogenMassFraction;
    const hydrogenNeededForCurrentAmmoniaKt = ammoniaProductionKt * hydrogenMassFraction;
    const plannedHydrogenForAmmoniaKt = hydrogenKt * ammoniaAllocationShare;
    const hydrogenForAmmoniaKt = Math.min(plannedHydrogenForAmmoniaKt, hydrogenNeededForCurrentAmmoniaKt);
    const greenAmmoniaKt = hydrogenMassFraction > 0 ? hydrogenForAmmoniaKt / hydrogenMassFraction : 0;
    const greenAmmoniaShare = ammoniaProductionKt > 0 ? clamp01(greenAmmoniaKt / ammoniaProductionKt) : 0;
    const hydratedCompanies = companies.map((company) => company.scores ? company : hydrateCompany(company));
    const neochim = hydratedCompanies.find((company) => company.id === 'neochim');
    const fertilizerProcessReadiness = neochim ? weightedMean([
      [getCompanyFactor(neochim, 'T_i', 'abatement_potential', neochim.T_i), 0.20],
      [getCompanyFactor(neochim, 'T_i', 'technology_maturity', neochim.T_i), 0.15],
      [getCompanyFactor(neochim, 'M_i', 'execution_capability', neochim.M_i), 0.15],
      [getCompanyFactor(neochim, 'M_i', 'project_readiness', neochim.M_i), 0.10],
      [getScenarioValue(scenario, 'engineering_capacity'), 0.10],
      [getScenarioValue(scenario, 'finance'), 0.10],
      [getScenarioValue(scenario, 'certification_traceability'), 0.10],
      [getScenarioValue(scenario, 'permitting'), 0.10],
    ]) : 0;
    const marketableGreenAmmoniaShare = clamp01(greenAmmoniaShare * marketReadiness);
    const marketableGreenFertilizerShare = clamp01(
      greenAmmoniaShare * marketReadiness * fertilizerProcessReadiness
    );
    const greenFertilizerKt = fertilizerSalesKt * greenAmmoniaShare;
    const marketableGreenFertilizerKt = fertilizerSalesKt * marketableGreenFertilizerShare;
    const euAddressableGreenFertilizerKt = marketableGreenFertilizerKt
      * Data.TECHNOLOGY_ASSUMPTIONS.neochimEUAddressableSalesShare2024;

    const demandFit = weightedMean(hydratedCompanies.map((company) => {
      const profile = getCompanyTransitionProfile(company);
      const fit = Math.max(
        profile.hydrogenFeedstockFit,
        profile.hydrogenFuelFit,
        profile.ammoniaValueChainFit
      );
      return [fit, Math.max(0.05, company.industrial_weight)];
    }));
    const scaleAdequacy = hydrogenNeededForCurrentAmmoniaKt > 0
      ? clamp01(hydrogenKt / hydrogenNeededForCurrentAmmoniaKt)
      : 0;
    const electrolyzerScore = weightedMean([
      [electrolyzerReadiness, 0.30],
      [marketReadiness, 0.20],
      [demandFit, 0.25],
      [scaleAdequacy, 0.25],
    ]);

    const neochimAnchorBase = neochim ? mean([
      getCompanyFactor(neochim, 'K_i', 'supply_chain_criticality', neochim.K_i),
      getCompanyFactor(neochim, 'K_i', 'anchor_role', neochim.K_i),
      getCompanyFactor(neochim, 'industrial_weight', 'supply_chain_role', neochim.industrial_weight),
      getCompanyFactor(neochim, 'industrial_weight', 'network_anchor', neochim.industrial_weight),
    ]) : 0;
    const neochimAnchorScore = weightedMean([
      [neochimAnchorBase, 0.30],
      [greenAmmoniaShare, 0.30],
      [marketReadiness, 0.15],
      [electrolyzerReadiness, 0.15],
      [getScenarioValue(scenario, 'cluster_coordination'), 0.10],
    ]);

    const fuelRecipients = hydratedCompanies.map((company) => {
      const profile = getCompanyTransitionProfile(company);
      const eligibleFuelDemandTWh = Math.max(0, Number(company.emissionsKt) || 0)
        * profile.combustionEmissionsShare
        * profile.highTemperatureFuelFit
        / (Data.TECHNOLOGY_ASSUMPTIONS.naturalGasEmissionFactorTPerMWh * 1000);
      return {
        id: company.id,
        company: company.company,
        sector: company.sector,
        fit: profile.highTemperatureFuelFit,
        eligibleFuelDemandTWh,
      };
    }).filter((company) => company.eligibleFuelDemandTWh > 0);
    const eligibleFuelDemandTWh = fuelRecipients.reduce((sum, company) => sum + company.eligibleFuelDemandTWh, 0);
    const hydrogenForFuelKt = Math.max(0, hydrogenKt - hydrogenForAmmoniaKt);
    const hydrogenFuelEnergyTWh = hydrogenForFuelKt
      * Data.TECHNOLOGY_ASSUMPTIONS.hydrogenLHVKWhPerKg
      / 1000;
    const usefulHydrogenFuelTWh = hydrogenFuelEnergyTWh
      * Data.TECHNOLOGY_ASSUMPTIONS.hydrogenFuelUseEfficiency;
    const hydrogenFuelShare = eligibleFuelDemandTWh > 0
      ? clamp01(usefulHydrogenFuelTWh / eligibleFuelDemandTWh)
      : 0;
    const displacedCombustionEmissionsKt = Math.min(usefulHydrogenFuelTWh, eligibleFuelDemandTWh)
      * Data.TECHNOLOGY_ASSUMPTIONS.naturalGasEmissionFactorTPerMWh
      * 1000;
    fuelRecipients.forEach((company) => {
      company.hydrogenShare = hydrogenFuelShare;
      company.hydrogenEnergyTWh = company.eligibleFuelDemandTWh * hydrogenFuelShare;
    });
    fuelRecipients.sort((a, b) => b.eligibleFuelDemandTWh - a.eligibleFuelDemandTWh);

    const firmedUnitHydrogenKt = Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW
      * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor
      * 8760
      / (Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSystemKWhPerKg * 1000);
    const solarOnlyUnitHydrogenKt = Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW
      * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor
      * 8760
      / (Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSystemKWhPerKg * 1000);
    const unitsForCurrentAmmoniaAtFullAllocation = firmedUnitHydrogenKt > 0
      ? Math.ceil(hydrogenNeededForCurrentAmmoniaKt / firmedUnitHydrogenKt)
      : 0;
    const unitsForCurrentAllocation = firmedUnitHydrogenKt > 0 && ammoniaAllocationShare > 0
      ? Math.ceil(hydrogenNeededForCurrentAmmoniaKt / (firmedUnitHydrogenKt * ammoniaAllocationShare))
      : null;
    const solarPVPerFirmedUnitMW = Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerUnitMW
      * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerCapacityFactor
      / Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor;
    const solarPVForCurrentAmmoniaMW = hydrogenNeededForCurrentAmmoniaKt
      * Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSystemKWhPerKg
      * 1000
      / (Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerSolarOnlyCapacityFactor * 8760);
    const solarPVForFullAllocationPortfolioMW = unitsForCurrentAmmoniaAtFullAllocation * solarPVPerFirmedUnitMW;
    const solarPVForCurrentAllocationPortfolioMW = unitsForCurrentAllocation === null
      ? null
      : unitsForCurrentAllocation * solarPVPerFirmedUnitMW;

    return {
      technologies,
      hydrogenKt,
      solarOnlyHydrogenKt,
      hydrogenElectricityTWh: getElectrolyzerElectricityTWh(scenario),
      solarPVRequiredMW: getSolarPVRequiredMW(scenario),
      marketReadiness,
      demandFit,
      electrolyzerReadiness,
      electrolyzerScore,
      scaleAdequacy,
      ammoniaActive,
      ammoniaAllocationShare,
      ammoniaProductionKt,
      ammoniaCapacityKt,
      hydrogenNeededForCurrentAmmoniaKt,
      hydrogenForAmmoniaKt,
      greenAmmoniaKt,
      greenAmmoniaShare,
      marketableGreenAmmoniaShare,
      fertilizerProcessReadiness,
      marketableGreenFertilizerShare,
      marketableGreenShare: marketableGreenFertilizerShare,
      fertilizerSalesKt,
      greenFertilizerKt,
      marketableGreenFertilizerKt,
      euAddressableGreenFertilizerKt,
      neochimAnchorBase,
      neochimAnchorScore,
      hydrogenForFuelKt,
      hydrogenFuelEnergyTWh,
      usefulHydrogenFuelTWh,
      eligibleFuelDemandTWh,
      hydrogenFuelShare,
      displacedCombustionEmissionsKt,
      fuelRecipients,
      firmedUnitHydrogenKt,
      solarOnlyUnitHydrogenKt,
      unitsForCurrentAmmoniaAtFullAllocation,
      unitsForCurrentAllocation,
      solarPVPerFirmedUnitMW,
      solarPVForCurrentAmmoniaMW,
      solarPVForFullAllocationPortfolioMW,
      solarPVForCurrentAllocationPortfolioMW,
      euAddressableSalesShare: Data.TECHNOLOGY_ASSUMPTIONS.neochimEUAddressableSalesShare2024,
    };
  }

  function normalizedAdoption(year, midpoint, rate, startYear = 2025) {
    const sigmoid = (value) => 1 / (1 + Math.exp(-value));
    if (year <= startYear) return 0;
    const start = sigmoid(rate * (startYear - midpoint));
    const end = sigmoid(rate * (2050 - midpoint));
    const current = sigmoid(rate * (year - midpoint));
    if (Math.abs(end - start) < 0.000001) return year >= 2050 ? 1 : 0;
    return clamp01((current - start) / (end - start));
  }

  function easeOutCubic(value) {
    const bounded = clamp01(value);
    return 1 - (1 - bounded) ** 3;
  }

  function frontLoadedAdoption(year, dynamics) {
    if (year <= 2025) return 0;
    if (year <= dynamics.earlyResponseYear) {
      const progress = (year - 2025) / Math.max(1, dynamics.earlyResponseYear - 2025);
      return dynamics.earlyResponseShare * easeOutCubic(progress);
    }
    if (year <= dynamics.plateauYear) {
      const progress = (year - dynamics.earlyResponseYear) / Math.max(1, dynamics.plateauYear - dynamics.earlyResponseYear);
      return dynamics.earlyResponseShare
        + (dynamics.plateauShare - dynamics.earlyResponseShare) * easeOutCubic(progress);
    }
    const progress = (year - dynamics.plateauYear) / Math.max(1, 2050 - dynamics.plateauYear);
    return dynamics.plateauShare + (1 - dynamics.plateauShare) * clamp01(progress);
  }

  function combineReductions(values) {
    return clamp01(1 - values.reduce((residual, value) => residual * (1 - clamp01(value)), 1));
  }

  function getCompanyTrajectoryProfile(companyInput, scenario) {
    const company = companyInput.scores ? companyInput : hydrateCompany(companyInput);
    const outcome = applyScenarioToCompany(company, scenario);
    const technologies = getTechnologyPortfolio(scenario);
    const portfolioScenario = {
      ...scenario,
      technologies: {
        ...technologies,
        electrolyzers: false,
        electrolyzerUnits: 0,
        ammoniaStorage: false,
        nuclearReactors: 0,
      },
    };
    const baselineScenario = {
      ...scenario,
      technologies: {
        ...Data.TECHNOLOGY_DEFAULTS,
        greenHydrogen: false,
        electrolyzers: false,
        electrolyzerUnits: 0,
        ammoniaStorage: false,
        ccs: false,
        nuclearReactors: 0,
      },
    };
    const portfolioOutcome = applyScenarioToCompany(company, portfolioScenario);
    const baselineOutcome = applyScenarioToCompany(company, baselineScenario);
    const value = (key) => getEffectiveScenarioValue(portfolioScenario, key);
    const electrolyzerSupplyFactor = getElectrolyzerSupplyFactor(scenario);
    const electrolyzerActive = getElectrolyzerCapacityMW(scenario) > 0;
    const ammoniaActive = isAmmoniaStorageActive(scenario);
    const transitionProfile = getCompanyTransitionProfile(company);

    const hydrogenSuitability = weightedMean([
      [transitionProfile.hydrogenFeedstockFit, 0.25],
      [transitionProfile.hydrogenFuelFit, 0.15],
      [getCompanyFactor(company, 'E_i', 'fossil_dependence', company.E_i), 0.14],
      [getCompanyFactor(company, 'T_i', 'site_fit', company.T_i), 0.12],
      [getCompanyFactor(company, 'T_i', 'technology_maturity', company.T_i), 0.08],
      [value('hydrogen'), 0.12],
      [value('offtake_bankability'), 0.08],
      [value('finance'), 0.06],
    ]);
    const ccsSuitability = weightedMean([
      [getCompanyFactor(company, 'E_i', 'process_emissions_share', company.E_i), 0.24],
      [getCompanyFactor(company, 'E_i', 'absolute_emissions', company.E_i), 0.12],
      [getCompanyFactor(company, 'E_i', 'residual_difficulty', company.E_i), 0.10],
      [getCompanyFactor(company, 'T_i', 'site_fit', company.T_i), 0.14],
      [getCompanyFactor(company, 'T_i', 'technology_maturity', company.T_i), 0.08],
      [getCompanyFactor(company, 'infra_dependency', 'co2_network_dependency', company.infra_dependency), 0.12],
      [value('co2_infra'), 0.12],
      [value('permitting'), 0.08],
    ]);
    const electrolyzerSuitability = weightedMean([
      [transitionProfile.hydrogenFeedstockFit, 0.24],
      [transitionProfile.hydrogenFuelFit, 0.14],
      [getCompanyFactor(company, 'E_i', 'fossil_dependence', company.E_i), 0.14],
      [getCompanyFactor(company, 'infra_dependency', 'power_volume_dependency', company.infra_dependency), 0.12],
      [getCompanyFactor(company, 'T_i', 'site_fit', company.T_i), 0.12],
      [getCompanyFactor(company, 'T_i', 'abatement_potential', company.T_i), 0.08],
      [value('power_access'), 0.08],
      [value('hydrogen'), 0.08],
    ]);
    const ammoniaSuitability = weightedMean([
      [transitionProfile.ammoniaValueChainFit, 0.34],
      [transitionProfile.greenProductLeverage, 0.14],
      [transitionProfile.hydrogenFeedstockFit, 0.14],
      [getCompanyFactor(company, 'E_i', 'fossil_dependence', company.E_i), 0.10],
      [getCompanyFactor(company, 'T_i', 'site_fit', company.T_i), 0.08],
      [value('cluster_coordination'), 0.10],
      [value('offtake_bankability'), 0.10],
    ]);
    const nuclearSuitability = weightedMean([
      [getCompanyFactor(company, 'infra_dependency', 'power_volume_dependency', company.infra_dependency), 0.25],
      [company.power_price_sensitivity, 0.18],
      [getCompanyFactor(company, 'E_i', 'fossil_dependence', company.E_i), 0.17],
      [getCompanyFactor(company, 'T_i', 'abatement_potential', company.T_i), 0.12],
      [value('grid_readiness'), 0.12],
      [value('engineering_capacity'), 0.09],
      [value('finance'), 0.07],
    ]);
    const hydrogenReadiness = weightedMean([
      [value('hydrogen'), 0.45],
      [value('power_access'), 0.20],
      [value('engineering_capacity'), 0.15],
      [value('finance'), 0.10],
      [value('offtake_bankability'), 0.10],
    ]);
    const ccsReadiness = weightedMean([
      [value('co2_infra'), 0.40],
      [value('permitting'), 0.20],
      [value('finance'), 0.15],
      [value('engineering_capacity'), 0.15],
      [value('cluster_coordination'), 0.10],
    ]);
    const electrolyzerReadiness = getElectrolyzerReadiness(portfolioScenario);
    const ammoniaReadiness = getAmmoniaReadiness(portfolioScenario);

    const potentials = {
      base: clamp01(0.08 + 0.67 * baselineOutcome.decarbonisationDepth + 0.08 * baselineOutcome.M_eff),
      greenHydrogen: technologies.greenHydrogen
        ? clamp01(0.32 * hydrogenSuitability * (0.20 + 0.80 * hydrogenReadiness))
        : 0,
      electrolyzers: electrolyzerActive
        ? clamp01(0.18 * electrolyzerSupplyFactor * electrolyzerSuitability * (0.25 + 0.75 * electrolyzerReadiness))
        : 0,
      ammonia: ammoniaActive
        ? clamp01(
          0.14
          * (technologies.hydrogenToAmmoniaShare / 100)
          * transitionProfile.ammoniaValueChainFit
          * electrolyzerSupplyFactor
          * ammoniaSuitability
          * (0.25 + 0.75 * ammoniaReadiness)
        )
        : 0,
      ccs: technologies.ccs
        ? clamp01(0.46 * ccsSuitability * (0.20 + 0.80 * ccsReadiness))
        : 0,
      nuclear: clamp01(0.30 * outcome.nuclearSupplyFactor * nuclearSuitability),
    };
    const timing = {
      base: {
        startYear: 2025,
        midpoint: 2037 - 6 * baselineOutcome.M_eff - 2 * value('stability'),
        rate: 0.16 + 0.18 * value('stability'),
      },
      greenHydrogen: {
        midpoint: 2038 - 5 * value('hydrogen') - 2 * portfolioOutcome.M_eff,
        rate: 0.18 + 0.16 * value('engineering_capacity'),
      },
      electrolyzers: {
        startYear: Data.TECHNOLOGY_ASSUMPTIONS.electrolyzerFirstOnlineYear,
        midpoint: 2035 - 3 * electrolyzerReadiness - 1.5 * portfolioOutcome.M_eff,
        rate: 0.20 + 0.14 * value('engineering_capacity'),
      },
      ammonia: {
        startYear: Data.TECHNOLOGY_ASSUMPTIONS.ammoniaFirstOnlineYear,
        midpoint: 2038 - 3 * ammoniaReadiness - portfolioOutcome.M_eff,
        rate: 0.18 + 0.12 * value('cluster_coordination'),
      },
      ccs: {
        midpoint: 2037 - 4 * value('co2_infra') - 2 * value('permitting') - portfolioOutcome.M_eff,
        rate: 0.17 + 0.16 * value('permitting'),
      },
      nuclear: {
        startYear: Data.TECHNOLOGY_ASSUMPTIONS.nuclearFirstOnlineYear,
        midpoint: Data.TECHNOLOGY_ASSUMPTIONS.nuclearFirstOnlineYear + 1.5 - 1.5 * baselineOutcome.M_eff,
        rate: 0.24 + 0.08 * value('engineering_capacity'),
      },
    };
    timing.greenHydrogen.startYear = Math.max(2027, timing.greenHydrogen.midpoint - 5.5);
    timing.ccs.startYear = Math.max(2028, timing.ccs.midpoint - 5);

    let residual = 1;
    const contributions2050 = {};
    ['base', 'greenHydrogen', 'electrolyzers', 'ammonia', 'ccs', 'nuclear'].forEach((key) => {
      contributions2050[key] = residual * potentials[key];
      residual *= 1 - potentials[key];
    });

    return {
      company,
      outcome,
      portfolioOutcome,
      baselineOutcome,
      potentials,
      timing,
      contributions2050,
      target2050: Math.min(Data.TECHNOLOGY_ASSUMPTIONS.maxReduction, 1 - residual),
    };
  }

  function buildTransitionTrajectory(scenario, companies) {
    const years = Array.from({ length: 101 }, (_, index) => 2025 + index * 0.25);
    const profiles = companies.map((company) => getCompanyTrajectoryProfile(company, scenario));
    const transitionDynamics = getScenarioTransitionDynamics(scenario);
    const companyTrajectories = profiles.map((profile) => {
      const baselineEmissionsKt = Math.max(0, Number(profile.company.emissionsKt) || 0);
      const points = years.map((year) => {
        const components = Object.fromEntries(Object.keys(profile.potentials).map((key) => [
          key,
          profile.potentials[key] * normalizedAdoption(
            year,
            profile.timing[key].midpoint,
            profile.timing[key].rate,
            profile.timing[key].startYear
          ),
        ]));
        const modelTechnicalReduction = Math.min(
          Data.TECHNOLOGY_ASSUMPTIONS.maxReduction,
          combineReductions(Object.values(components))
        );
        const companyAdjustment = 0.90 + 0.20 * profile.company.T_i;
        const technicalTarget = transitionDynamics.type === 'standard'
          ? modelTechnicalReduction
          : clamp01(transitionDynamics.technicalReduction2050 * companyAdjustment);
        let technicalReduction = modelTechnicalReduction;
        let industrialActivity = 1;
        if (transitionDynamics.type === 'front_loaded_plateau') {
          technicalReduction = technicalTarget * frontLoadedAdoption(year, transitionDynamics);
        }
        if (transitionDynamics.type === 'deindustrialisation') {
          technicalReduction = Math.min(modelTechnicalReduction, technicalTarget);
          industrialActivity = 1 - normalizedAdoption(
            year,
            transitionDynamics.closureMidpoint,
            transitionDynamics.closureRate,
            transitionDynamics.closureStartYear
          );
        }
        const reduction = transitionDynamics.type === 'deindustrialisation'
          ? clamp01(1 - (1 - technicalReduction) * industrialActivity)
          : Math.min(Data.TECHNOLOGY_ASSUMPTIONS.maxReduction, technicalReduction);
        const closureDrivenReduction = Math.max(0, reduction - technicalReduction);
        return {
          year,
          reduction,
          technicalReduction,
          closureDrivenReduction,
          industrialActivity,
          residualEmissionsKt: baselineEmissionsKt * (1 - reduction),
          avoidedEmissionsKt: baselineEmissionsKt * reduction,
          technicallyAvoidedEmissionsKt: baselineEmissionsKt * technicalReduction,
          closureAvoidedEmissionsKt: baselineEmissionsKt * closureDrivenReduction,
          components,
        };
      });
      return {
        id: profile.company.id,
        company: profile.company.company,
        cluster: profile.company.cluster,
        sector: profile.company.sector,
        baselineEmissionsKt,
        target2050: points.at(-1).reduction,
        technicalReduction2050: points.at(-1).technicalReduction,
        closureDrivenReduction2050: points.at(-1).closureDrivenReduction,
        industrialActivity2050: points.at(-1).industrialActivity,
        residualEmissions2050Kt: points.at(-1).residualEmissionsKt,
        contributions2050: profile.contributions2050,
        potentials: profile.potentials,
        points,
      };
    });

    const baselineEmissionsKt = companyTrajectories.reduce((sum, company) => sum + company.baselineEmissionsKt, 0);
    const weightFor = (company) => baselineEmissionsKt > 0
      ? company.baselineEmissionsKt
      : Math.max(0.05, profiles.find((profile) => profile.company.id === company.id)?.company.industrial_weight || 0.05);
    const aggregatePoints = years.map((year, index) => {
      const reduction = weightedMean(companyTrajectories.map((company) => [company.points[index].reduction, weightFor(company)]));
      const technicalReduction = weightedMean(companyTrajectories.map((company) => [company.points[index].technicalReduction, weightFor(company)]));
      const industrialActivity = weightedMean(companyTrajectories.map((company) => [company.points[index].industrialActivity, weightFor(company)]));
      const closureDrivenReduction = Math.max(0, reduction - technicalReduction);
      return {
        year,
        reduction,
        technicalReduction,
        closureDrivenReduction,
        industrialActivity,
        residualEmissionsKt: baselineEmissionsKt * (1 - reduction),
        avoidedEmissionsKt: baselineEmissionsKt * reduction,
        technicallyAvoidedEmissionsKt: baselineEmissionsKt * technicalReduction,
        closureAvoidedEmissionsKt: baselineEmissionsKt * closureDrivenReduction,
      };
    });
    const technologies = getTechnologyPortfolio(scenario);
    const electrolyzerNameplateMW = getElectrolyzerNameplateMW(scenario);
    const electrolyzerCapacityMW = getElectrolyzerCapacityMW(scenario);
    const electrolyzerElectricityTWh = getElectrolyzerElectricityTWh(scenario);
    const electrolyzerHydrogenKt = getElectrolyzerHydrogenOutputKt(scenario);
    const electrolyzerSolarOnlyHydrogenKt = getSolarOnlyHydrogenOutputKt(scenario);
    const solarPVRequiredMW = getSolarPVRequiredMW(scenario);
    const nuclearCapacityMW = technologies.nuclearReactors * Data.TECHNOLOGY_ASSUMPTIONS.nuclearUnitMW;
    const nuclearGenerationTWh = nuclearCapacityMW * Data.TECHNOLOGY_ASSUMPTIONS.nuclearCapacityFactor * 8760 / 1000000;
    const contributionKeys = ['base', 'greenHydrogen', 'electrolyzers', 'ammonia', 'ccs', 'nuclear'];

    return {
      scenarioId: scenario.id,
      scenario,
      transitionDynamics,
      years,
      companies: companyTrajectories,
      technologies,
      electrolyzerNameplateMW,
      electrolyzerCapacityMW,
      electrolyzerElectricityTWh,
      electrolyzerHydrogenKt,
      electrolyzerSolarOnlyHydrogenKt,
      solarPVRequiredMW,
      nuclearCapacityMW,
      nuclearGenerationTWh,
      aggregate: {
        baselineEmissionsKt,
        target2050: aggregatePoints.at(-1).reduction,
        technicalReduction2050: aggregatePoints.at(-1).technicalReduction,
        closureDrivenReduction2050: aggregatePoints.at(-1).closureDrivenReduction,
        industrialActivity2050: aggregatePoints.at(-1).industrialActivity,
        residualEmissions2050Kt: aggregatePoints.at(-1).residualEmissionsKt,
        avoidedEmissions2050Kt: aggregatePoints.at(-1).avoidedEmissionsKt,
        technicallyAvoidedEmissions2050Kt: aggregatePoints.at(-1).technicallyAvoidedEmissionsKt,
        closureAvoidedEmissions2050Kt: aggregatePoints.at(-1).closureAvoidedEmissionsKt,
        contributions2050: Object.fromEntries(contributionKeys.map((key) => [
          key,
          weightedMean(companyTrajectories.map((company) => [company.contributions2050[key], weightFor(company)])),
        ])),
        points: aggregatePoints,
      },
    };
  }

  function buildScenarioTrajectorySet(scenarios, companies) {
    return scenarios.map((scenario) => buildTransitionTrajectory(scenario, companies));
  }

  function buildSectorAnalysis(scenario, companiesInput) {
    const installations = companiesInput
      .filter((company) => Number.isFinite(Number(company.etsRank2024)))
      .map(hydrateCompany)
      .sort((a, b) => a.etsRank2024 - b.etsRank2024);
    const trajectory = buildTransitionTrajectory(scenario, installations);
    const trajectoryById = Object.fromEntries(trajectory.companies.map((company) => [company.id, company]));
    const pointFor = (companyId, year) => trajectoryById[companyId]?.points.find((point) => point.year === year);
    const emissionsWeight = (company) => Math.max(0.001, Number(company.emissions2024Kt) || 0);

    const installationRows = installations.map((company) => {
      const emissions2023Kt = Math.max(0, Number(company.emissions2023Kt) || 0);
      const emissions2024Kt = Math.max(0, Number(company.emissions2024Kt) || 0);
      return {
        ...company,
        emissions2023Kt,
        emissions2024Kt,
        yoyChange: emissions2023Kt > 0 ? emissions2024Kt / emissions2023Kt - 1 : 0,
        readiness: mean([company.B_i, company.T_i, company.M_i]),
        transitionPressure: mean([company.E_i, company.C_i, company.carbon_sensitivity]),
        confidence: clamp01(Number(company.provenance?.confidence20 || 0) / Data.VISUAL_SCALE_MAX),
        reduction2030: pointFor(company.id, 2030)?.reduction || 0,
        reduction2050: pointFor(company.id, 2050)?.reduction || 0,
      };
    });

    const sectors = Data.SECTOR_PATHWAYS.map((pathway) => {
      const rows = installationRows.filter((company) => company.sectorPathwayId === pathway.id);
      const emissions2023Kt = rows.reduce((sum, company) => sum + company.emissions2023Kt, 0);
      const emissions2024Kt = rows.reduce((sum, company) => sum + company.emissions2024Kt, 0);
      return {
        ...pathway,
        installations: rows,
        installationCount: rows.length,
        emissions2023Kt,
        emissions2024Kt,
        yoyChange: emissions2023Kt > 0 ? emissions2024Kt / emissions2023Kt - 1 : 0,
        nationalShare2024: rows.reduce((sum, company) => sum + Number(company.nationalShare2024 || 0), 0),
        industrialShare2024: rows.reduce((sum, company) => sum + Number(company.industrialShare2024 || 0), 0),
        readiness: weightedMean(rows.map((company) => [company.readiness, emissionsWeight(company)])),
        transitionPressure: weightedMean(rows.map((company) => [company.transitionPressure, emissionsWeight(company)])),
        confidence: weightedMean(rows.map((company) => [company.confidence, emissionsWeight(company)])),
        reduction2030: weightedMean(rows.map((company) => [company.reduction2030, emissionsWeight(company)])),
        reduction2050: weightedMean(rows.map((company) => [company.reduction2050, emissionsWeight(company)])),
      };
    }).filter((sector) => sector.installationCount > 0)
      .sort((a, b) => a.order - b.order);

    const emissions2023Kt = installationRows.reduce((sum, company) => sum + company.emissions2023Kt, 0);
    const emissions2024Kt = installationRows.reduce((sum, company) => sum + company.emissions2024Kt, 0);
    const allWeights = installationRows.map((company) => emissionsWeight(company));
    const weightedAcrossInstallations = (key) => weightedMean(
      installationRows.map((company, index) => [company[key], allWeights[index]])
    );

    return {
      scenarioId: scenario.id,
      trajectory,
      installations: installationRows,
      sectors,
      summary: {
        installationCount: installationRows.length,
        sectorCount: sectors.length,
        emissions2023Kt,
        emissions2024Kt,
        yoyChange: emissions2023Kt > 0 ? emissions2024Kt / emissions2023Kt - 1 : 0,
        nationalShare2023: installationRows.reduce((sum, company) => sum + Number(company.nationalShare2023 || 0), 0),
        nationalShare2024: installationRows.reduce((sum, company) => sum + Number(company.nationalShare2024 || 0), 0),
        industrialShare2023: installationRows.reduce((sum, company) => sum + Number(company.industrialShare2023 || 0), 0),
        industrialShare2024: installationRows.reduce((sum, company) => sum + Number(company.industrialShare2024 || 0), 0),
        readiness: weightedAcrossInstallations('readiness'),
        transitionPressure: weightedAcrossInstallations('transitionPressure'),
        confidence: weightedAcrossInstallations('confidence'),
        reduction2030: weightedAcrossInstallations('reduction2030'),
        reduction2050: weightedAcrossInstallations('reduction2050'),
      },
    };
  }

  function rankScenarios(scenarios, companies) {
    return scenarios
      .map((scenario) => ({ scenario, outcome: getScenarioOutcome(scenario, companies) }))
      .sort((a, b) => b.outcome.balance - a.outcome.balance);
  }

  function buildScenarioFrontier(scenarios, companies, language = 'en') {
    return scenarios.map((scenario) => {
      const outcome = getScenarioOutcome(scenario, companies);
      return {
        scenarioId: scenario.id,
        scenario: getScenarioName(scenario, language),
        depth: outcome.depth,
        retention: outcome.retention,
        continuity: outcome.continuity,
        balance: outcome.balance,
        bicontinuousShare: outcome.bicontinuousShare,
      };
    });
  }

  function buildAdjacency(companies, edges) {
    const adjacency = Object.fromEntries(companies.map((company) => [company.id, []]));
    edges.forEach((edge) => {
      if (!adjacency[edge.source] || !adjacency[edge.target]) return;
      adjacency[edge.source].push({ id: edge.target, weight: Number(edge.weight) || 1, edge });
      adjacency[edge.target].push({ id: edge.source, weight: Number(edge.weight) || 1, edge });
    });
    return adjacency;
  }

  function calculateBetweenness(companies, adjacency) {
    const ids = companies.map((company) => company.id);
    const centrality = Object.fromEntries(ids.map((id) => [id, 0]));

    ids.forEach((source) => {
      const stack = [];
      const predecessors = Object.fromEntries(ids.map((id) => [id, []]));
      const paths = Object.fromEntries(ids.map((id) => [id, 0]));
      const distance = Object.fromEntries(ids.map((id) => [id, -1]));
      paths[source] = 1;
      distance[source] = 0;
      const queue = [source];

      while (queue.length) {
        const vertex = queue.shift();
        stack.push(vertex);
        adjacency[vertex].forEach((neighbor) => {
          if (distance[neighbor.id] < 0) {
            queue.push(neighbor.id);
            distance[neighbor.id] = distance[vertex] + 1;
          }
          if (distance[neighbor.id] === distance[vertex] + 1) {
            paths[neighbor.id] += paths[vertex];
            predecessors[neighbor.id].push(vertex);
          }
        });
      }

      const dependency = Object.fromEntries(ids.map((id) => [id, 0]));
      while (stack.length) {
        const vertex = stack.pop();
        predecessors[vertex].forEach((predecessor) => {
          if (paths[vertex] > 0) {
            dependency[predecessor] += (paths[predecessor] / paths[vertex]) * (1 + dependency[vertex]);
          }
        });
        if (vertex !== source) centrality[vertex] += dependency[vertex];
      }
    });

    const denominator = Math.max(1, (ids.length - 1) * (ids.length - 2));
    ids.forEach((id) => {
      centrality[id] = clamp01(centrality[id] / denominator);
    });
    return centrality;
  }

  function analyzeNetwork(companiesInput, edges = Data.NETWORK_EDGES) {
    const companies = companiesInput.map(hydrateCompany);
    const adjacency = buildAdjacency(companies, edges);
    const betweenness = calculateBetweenness(companies, adjacency);
    const weightedDegrees = Object.fromEntries(companies.map((company) => [
      company.id,
      adjacency[company.id].reduce((sum, neighbor) => sum + neighbor.weight, 0),
    ]));
    const maxWeightedDegree = Math.max(1, ...Object.values(weightedDegrees));

    const nodes = companies.map((company) => {
      const weightedCentrality = weightedDegrees[company.id] / maxWeightedDegree;
      const neighborImpact = adjacency[company.id].reduce((sum, neighbor) => {
        const target = companies.find((entry) => entry.id === neighbor.id);
        return sum + neighbor.weight * (target?.K_i || 0);
      }, 0);
      const maxNeighborImpact = Math.max(1, adjacency[company.id].reduce((sum, neighbor) => sum + neighbor.weight, 0) * 1);
      const failureImpact = clamp01(neighborImpact / maxNeighborImpact);
      const bridgeScore = betweenness[company.id];
      const anchorRisk = clamp01(
        0.27 * weightedCentrality
        + 0.20 * bridgeScore
        + 0.20 * company.K_i
        + 0.13 * company.E_i
        + 0.10 * company.C_i
        + 0.10 * company.infra_dependency
      );
      return {
        ...company,
        degree: adjacency[company.id].length,
        weightedDegree: weightedDegrees[company.id],
        weightedCentrality,
        betweenness: bridgeScore,
        bridgeScore,
        failureImpact,
        anchorRisk,
      };
    }).sort((a, b) => b.anchorRisk - a.anchorRisk);

    return { nodes, edges, adjacency };
  }

  function assessSharedInfrastructure(scenario, companiesInput, opportunities = Data.SHARED_INFRASTRUCTURE_OPPORTUNITIES) {
    const companies = companiesInput.map(hydrateCompany);
    const maxEfficiency = Math.max(1, ...opportunities.map((project) => project.abatementKt / Math.max(1, project.capexM)));
    return opportunities.map((project) => {
      const members = project.members.map((id) => companies.find((company) => company.id === id)).filter(Boolean);
      const readiness = mean(project.dependencies.map((key) => getScenarioValue(scenario, key)));
      const need = mean(members.map((company) => mean([company.E_i, company.K_i, company.infra_dependency])));
      const efficiency = clamp01((project.abatementKt / Math.max(1, project.capexM)) / maxEfficiency);
      const priority = clamp01(0.42 * need + 0.38 * readiness + 0.20 * efficiency);
      return {
        ...project,
        readiness,
        need,
        efficiency,
        priority,
        memberCompanies: members.map((company) => company.company),
      };
    }).sort((a, b) => b.priority - a.priority);
  }

  function normalizeText(value) {
    return String(value || '').toLocaleLowerCase('en').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function findCompanyPathways(company, pathways) {
    const aliases = [company.company, ...(company.pathwayAliases || [])].map(normalizeText);
    return (pathways || []).filter((pathway) => {
      const pathwayCompany = normalizeText(pathway.co);
      return aliases.some((alias) => alias && (pathwayCompany.includes(alias) || alias.includes(pathwayCompany)));
    });
  }

  function getPrimaryBottleneck(row) {
    return Object.entries(row.bottlenecks).sort((a, b) => b[1] - a[1])[0] || ['finance', 0];
  }

  function getDecisionLayer(scenario, companiesInput, options = {}) {
    const pathways = options.pathways || [];
    const outcome = getScenarioOutcome(scenario, companiesInput);
    const network = analyzeNetwork(companiesInput, options.edges || Data.NETWORK_EDGES);
    const networkById = Object.fromEntries(network.nodes.map((node) => [node.id, node]));

    const companyPriorities = outcome.rows.map((row) => {
      const companyPathways = findCompanyPathways(row, pathways);
      const capexM = companyPathways.reduce((sum, pathway) => sum + Number(pathway.capex_M || 0), 0);
      const abatementKt = companyPathways.reduce((sum, pathway) => sum + Number(pathway.co2_kt || 0), 0);
      const startYears = companyPathways.map((pathway) => Number(pathway.starts)).filter((year) => Number.isFinite(year) && year < 9999);
      const [primaryBottleneck, bottleneckSeverity] = getPrimaryBottleneck(row);
      const dataConfidence = clamp01(Number(row.provenance?.confidence20 || 0) / 20);
      const priority = clamp01(
        0.18 * row.E_i
        + 0.17 * row.K_i
        + 0.13 * row.C_i
        + 0.11 * row.infra_dependency
        + 0.11 * (1 - row.decarbonisationDepth)
        + 0.10 * bottleneckSeverity
        + 0.08 * row.carbon_sensitivity
        + 0.07 * (networkById[row.id]?.anchorRisk || 0)
        + 0.05 * (1 - dataConfidence)
      );
      return {
        ...row,
        priority,
        primaryBottleneck,
        bottleneckSeverity,
        capexM,
        abatementKt,
        firstStartYear: startYears.length ? Math.min(...startYears) : null,
        pathwayCount: companyPathways.length,
        pathways: companyPathways,
        dataConfidence,
        networkRisk: networkById[row.id]?.anchorRisk || 0,
      };
    }).sort((a, b) => b.priority - a.priority);

    const sharedProjects = assessSharedInfrastructure(
      scenario,
      companiesInput,
      options.opportunities || Data.SHARED_INFRASTRUCTURE_OPPORTUNITIES
    );
    const pathwayPortfolios = companyPriorities
      .filter((company) => company.pathwayCount > 0)
      .map((company) => ({
        companyId: company.id,
        company: company.company,
        capexM: company.capexM,
        abatementKt: company.abatementKt,
        firstStartYear: company.firstStartYear,
        costPerTonne: company.abatementKt > 0 ? company.capexM * 1000 / company.abatementKt : null,
        pathwayCount: company.pathwayCount,
      }));

    return {
      outcome,
      network,
      companyPriorities,
      sharedProjects,
      pathwayPortfolios,
      summary: {
        totalCapexM: pathwayPortfolios.reduce((sum, portfolio) => sum + portfolio.capexM, 0),
        totalAbatementKt: pathwayPortfolios.reduce((sum, portfolio) => sum + portfolio.abatementKt, 0),
        sharedCapexM: sharedProjects.reduce((sum, project) => sum + project.capexM, 0),
        sharedAbatementKt: sharedProjects.reduce((sum, project) => sum + project.abatementKt, 0),
      },
    };
  }

  function runSensitivity(scenario, companies, step = 0.05) {
    const delta = Math.max(0.005, Math.min(0.25, Number(step) || 0.05));
    const base = getScenarioOutcome(scenario, companies);
    return Data.SCENARIO_PARAMETER_KEYS.map((key) => {
      const current = getScenarioValue(scenario, key);
      const plus = { ...scenario, values: { ...scenario.values, [key]: clamp01(current + delta) } };
      const minus = { ...scenario, values: { ...scenario.values, [key]: clamp01(current - delta) } };
      const plusOutcome = getScenarioOutcome(plus, companies);
      const minusOutcome = getScenarioOutcome(minus, companies);
      const denominator = Math.max(0.001, getScenarioValue(plus, key) - getScenarioValue(minus, key));
      const depthDerivative = (plusOutcome.depth - minusOutcome.depth) / denominator;
      const retentionDerivative = (plusOutcome.retention - minusOutcome.retention) / denominator;
      const balanceDerivative = (plusOutcome.balance - minusOutcome.balance) / denominator;
      return {
        key,
        baseValue: current,
        depthDerivative,
        retentionDerivative,
        balanceDerivative,
        depthImpact20: depthDerivative,
        retentionImpact20: retentionDerivative,
        balanceImpact20: balanceDerivative,
        baseDepth: base.depth,
        baseRetention: base.retention,
      };
    }).sort((a, b) => Math.abs(b.balanceDerivative) - Math.abs(a.balanceDerivative));
  }

  function createSeededRandom(seed) {
    let state = (Number(seed) || 1) >>> 0;
    return function random() {
      state += 0x6D2B79F5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function jitterCompanies(companies, uncertaintyUnit, random) {
    return companies.map((company) => {
      const confidence = clamp01(Number(company.provenance?.confidence20 || 0) / 20);
      const amplitude = uncertaintyUnit * (0.25 + 0.75 * (1 - confidence));
      const factors = {};
      Object.entries(company.factors || {}).forEach(([metricKey, metricFactors]) => {
        factors[metricKey] = Object.fromEntries(Object.entries(metricFactors).map(([factorKey, factorValue]) => [
          factorKey,
          clamp01(Number(factorValue) + (random() + random() - 1) * amplitude),
        ]));
      });
      return { ...company, factors };
    });
  }

  function runMonteCarlo(scenario, companies, options = {}) {
    const iterations = Math.max(100, Math.min(2000, Math.round(Number(options.iterations) || 400)));
    const requestedUncertainty = Number(options.uncertainty20);
    const uncertainty20 = Math.max(0, Math.min(5, Number.isFinite(requestedUncertainty) ? requestedUncertainty : 2));
    const uncertaintyUnit = uncertainty20 / 20;
    const random = createSeededRandom(options.seed || 2025);
    const samples = { depth: [], retention: [], continuity: [], balance: [] };

    for (let index = 0; index < iterations; index += 1) {
      const sampledScenario = {
        ...scenario,
        values: Object.fromEntries(Data.SCENARIO_PARAMETER_KEYS.map((key) => [
          key,
          clamp01(getScenarioValue(scenario, key) + (random() + random() - 1) * uncertaintyUnit),
        ])),
      };
      const sampledCompanies = jitterCompanies(companies, uncertaintyUnit * 0.60, random);
      const outcome = getScenarioOutcome(sampledScenario, sampledCompanies);
      Object.keys(samples).forEach((key) => samples[key].push(outcome[key]));
    }

    const summary = Object.fromEntries(Object.entries(samples).map(([key, values]) => {
      const sorted = values.slice().sort((a, b) => a - b);
      return [key, {
        p10: quantile(sorted, 0.10),
        p50: quantile(sorted, 0.50),
        p90: quantile(sorted, 0.90),
        min: sorted[0],
        max: sorted[sorted.length - 1],
      }];
    }));

    return { iterations, uncertainty20, seed: options.seed || 2025, samples, summary };
  }

  function setCompanyMetricTarget(company, metricKey, targetValue) {
    const definition = getMetricDefinition(metricKey);
    if (!definition) return company;
    const target = clamp01(targetValue);
    const currentFactors = { ...(company.factors?.[metricKey] || {}) };
    const keys = definition.factors.map((factor) => factor.key);
    const current = mean(keys.map((key) => currentFactors[key]));
    const delta = target - current;
    const nextFactors = Object.fromEntries(keys.map((key) => [key, clamp01(Number(currentFactors[key] || 0) + delta)]));

    for (let pass = 0; pass < 6; pass += 1) {
      const residual = target - mean(keys.map((key) => nextFactors[key]));
      if (Math.abs(residual) < 0.000001) break;
      const adjustable = keys.filter((key) => residual > 0 ? nextFactors[key] < 1 : nextFactors[key] > 0);
      if (!adjustable.length) break;
      adjustable.forEach((key) => {
        nextFactors[key] = clamp01(nextFactors[key] + residual * keys.length / adjustable.length);
      });
    }

    return {
      ...company,
      factors: {
        ...company.factors,
        [metricKey]: nextFactors,
      },
    };
  }

  function setCompanyFactor(company, metricKey, factorKey, nextValue) {
    const definition = getMetricDefinition(metricKey);
    if (!definition || !definition.factors.some((factor) => factor.key === factorKey)) return company;
    return {
      ...company,
      factors: {
        ...company.factors,
        [metricKey]: {
          ...company.factors?.[metricKey],
          [factorKey]: clamp01(nextValue),
        },
      },
    };
  }

  return Object.freeze({
    clamp01,
    toScore20,
    fromScore20,
    mean,
    weightedMean,
    quantile,
    getScenarioValue,
    getTechnologyPortfolio,
    getNuclearSupplyFactor,
    getElectrolyzerNameplateMW,
    getElectrolyzerCapacityMW,
    getElectrolyzerSupplyFactor,
    getElectrolyzerElectricityTWh,
    getElectrolyzerHydrogenOutputKt,
    getElectrolyzerElectricityTWhAtCapacityFactor,
    getElectrolyzerHydrogenOutputKtAtCapacityFactor,
    getSolarOnlyHydrogenOutputKt,
    getSolarPVRequiredMW,
    getElectrolyzerReadiness,
    isAmmoniaStorageActive,
    getAmmoniaReadiness,
    getEffectiveScenarioValue,
    getScenarioName,
    getMetricDefinition,
    calculateCompanyMetric,
    hydrateCompany,
    getScenarioGroupScores,
    getScenarioEnablementScore,
    getScenarioPolicyStrength,
    getScenarioTransitionDynamics,
    applyScenarioToCompany,
    applyScenarioToCompanies,
    getScenarioOutcome,
    getCompanyTransitionProfile,
    getGreenMarketReadiness,
    getGreenMarketAssessment,
    getCompanyTrajectoryProfile,
    buildTransitionTrajectory,
    buildScenarioTrajectorySet,
    buildSectorAnalysis,
    rankScenarios,
    buildScenarioFrontier,
    analyzeNetwork,
    assessSharedInfrastructure,
    getDecisionLayer,
    runSensitivity,
    runMonteCarlo,
    setCompanyMetricTarget,
    setCompanyFactor,
  });
});
