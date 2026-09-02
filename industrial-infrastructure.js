(function initIndustrialInfrastructure(root, factory) {
  const api = factory(root, root.ClusterData, root.ClusterI18n);
  root.IndustrialInfrastructure = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createIndustrialInfrastructure(root, Data, I18n) {
  'use strict';

  const PHASES = ['2030', '2040'];
  const CCS_INTERVALS = [5, 10];
  const DEMAND_WEIGHTS = Object.freeze({
    Chemicals: 1,
    Metals: 0.9,
    'Mineral Materials': 0.55,
    'Other Manufacturing': 0.35,
  });
  const DEFAULT_LAYERS = Object.freeze({ ets: true, valleys: true, ccs: true, ammonia: true });
  const MAP_BOUNDS = Object.freeze({ xMin: 22.1, xMax: 28.85, yMin: 41, yMax: 44.45 });
  const MAP_Y_SCALE_RATIO = 1.35;

  let planningPhase = '2030';
  let ccsIntervalYears = 5;
  let selectedValleyId = 'devnya-varna';
  let visibleLayers = { ...DEFAULT_LAYERS };
  let lastRenderOptions = null;
  let mapResizeObserver = null;
  let observedMapNode = null;
  let observedMapWidth = 0;
  let resizeFrame = null;

  function t(key, variables = {}) {
    return I18n?.t ? I18n.t(key, variables) : key;
  }

  function localize(value) {
    return I18n?.localize ? I18n.localize(value) : String(value?.en || value || '');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function cssVar(name, fallback) {
    try {
      return root.getComputedStyle(root.document.documentElement).getPropertyValue(name).trim() || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getTheme() {
    return {
      text: cssVar('--text', '#231720'),
      muted: cssVar('--text-muted', '#675767'),
      faint: cssVar('--text-faint', '#918391'),
      surface: cssVar('--surface', '#fffef8'),
      surface2: cssVar('--surface-2', '#f8f5e9'),
      border: cssVar('--border', '#ded4c7'),
      divider: cssVar('--divider', '#e8dece'),
      mapFill: cssVar('--surface-offset', '#f1ecde'),
      hydrogen: cssVar('--infra-hydrogen', '#0f766e'),
      hydrogenFill: cssVar('--infra-hydrogen-fill', 'rgba(15, 118, 110, 0.10)'),
      ammonia: cssVar('--infra-ammonia', '#b45309'),
      ammoniaFill: cssVar('--infra-ammonia-fill', '#f2d39b'),
      ccs: cssVar('--infra-ccs', '#475569'),
      sectors: {
        Chemicals: cssVar('--chart-chemical', '#15803d'),
        'Mineral Materials': cssVar('--chart-mineral', '#2563eb'),
        Metals: cssVar('--chart-metal', '#dc2626'),
        'Other Manufacturing': cssVar('--chart-nonenergy', '#d97706'),
      },
    };
  }

  function numberFormat(value, options = {}) {
    const language = I18n?.getLanguage?.() === 'bg' ? 'bg-BG' : 'en-GB';
    return new Intl.NumberFormat(language, options).format(Number(value) || 0);
  }

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function haversineDistanceKm(latitudeA, longitudeA, latitudeB, longitudeB) {
    const radians = Math.PI / 180;
    const latitudeDelta = (Number(latitudeB) - Number(latitudeA)) * radians;
    const longitudeDelta = (Number(longitudeB) - Number(longitudeA)) * radians;
    const value = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(Number(latitudeA) * radians)
      * Math.cos(Number(latitudeB) * radians)
      * Math.sin(longitudeDelta / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, value))));
  }

  function getHydrogenOutputKt(capacityMW) {
    const assumptions = Data?.TECHNOLOGY_ASSUMPTIONS || {};
    const capacityFactor = Number(assumptions.electrolyzerCapacityFactor || 0.7);
    const systemKWhPerKg = Number(assumptions.electrolyzerSystemKWhPerKg || 55);
    return Number(capacityMW || 0) * capacityFactor * 8760 / (systemKWhPerKg * 1000);
  }

  function evaluateValleys(companiesInput, phase = planningPhase) {
    const companies = Array.isArray(companiesInput) ? companiesInput : [];
    const candidates = Array.isArray(Data?.ELECTROLYZER_VALLEY_CANDIDATES)
      ? Data.ELECTROLYZER_VALLEY_CANDIDATES
      : [];
    const unitMW = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerUnitMW || 20);
    const ammoniaHydrogenShare = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.ammoniaHydrogenMassFraction || 0.1764705882);
    const normalizedPhase = PHASES.includes(String(phase)) ? String(phase) : '2030';
    const companyById = new Map(companies.map((company) => [company.id, company]));

    const demandRows = candidates.map((candidate) => {
      const nearbyCompanies = companies.filter((company) => company.geography && haversineDistanceKm(
        candidate.latitude,
        candidate.longitude,
        company.geography.latitude,
        company.geography.longitude
      ) <= Number(candidate.demandRadiusKm || 60));
      const weightedDemandKt = nearbyCompanies.reduce((sum, company) => (
        sum + Number(company.emissions2024Kt || 0) * Number(DEMAND_WEIGHTS[company.clusterSector] || 0.25)
      ), 0);
      return { candidate, nearbyCompanies, weightedDemandKt };
    });
    const maxWeightedDemand = Math.max(1, ...demandRows.map((row) => row.weightedDemandKt));

    return demandRows.map((row) => {
      const { candidate, nearbyCompanies, weightedDemandKt } = row;
      const demand = weightedDemandKt > 0 ? 1 + 3 * Math.sqrt(weightedDemandKt / maxWeightedDemand) : 0;
      const dimensions = {
        demand: Math.min(4, demand),
        power: Number(candidate.evidenceScores4.power || 0),
        logistics: Number(candidate.evidenceScores4.logistics || 0),
        anchor: Number(candidate.evidenceScores4.anchor || 0),
        maturity: Number(candidate.evidenceScores4.maturity || 0),
      };
      const units = Number(candidate.phaseUnits[normalizedPhase] || 0);
      const capacityMW = units * unitMW;
      const hydrogenOutputKt = getHydrogenOutputKt(capacityMW);
      return {
        ...candidate,
        phase: normalizedPhase,
        units,
        capacityMW,
        hydrogenOutputKt,
        electricityTWh: capacityMW * Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerCapacityFactor || 0.7) * 8760 / 1000000,
        ammoniaEquivalentKt: ammoniaHydrogenShare > 0 ? hydrogenOutputKt / ammoniaHydrogenShare : 0,
        dimensions,
        score20: Object.values(dimensions).reduce((sum, value) => sum + value, 0),
        weightedDemandKt,
        nearbyEmissionsKt: nearbyCompanies.reduce((sum, company) => sum + Number(company.emissions2024Kt || 0), 0),
        nearbyCompanies,
        anchorCompanies: candidate.anchorCompanyIds.map((id) => companyById.get(id)).filter(Boolean),
      };
    }).sort((a, b) => b.score20 - a.score20).map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  }

  function getCoverageAtYear(pathway, year) {
    const points = Object.entries(pathway || {})
      .map(([pointYear, coverage]) => ({ year: Number(pointYear), coverage: Number(coverage) || 0 }))
      .filter((point) => Number.isFinite(point.year))
      .sort((a, b) => a.year - b.year);
    if (!points.length) return 0;
    const targetYear = Number(year);
    if (targetYear <= points[0].year) return points[0].coverage;
    if (targetYear >= points.at(-1).year) return points.at(-1).coverage;
    const upperIndex = points.findIndex((point) => point.year >= targetYear);
    const lower = points[upperIndex - 1];
    const upper = points[upperIndex];
    const progress = (targetYear - lower.year) / Math.max(1, upper.year - lower.year);
    return lower.coverage + (upper.coverage - lower.coverage) * progress;
  }

  function getCumulativeStoredMt(processEmissionsKt, pathway, assumptions) {
    const startYear = Number(assumptions.startYear || 2025);
    const targetYear = Number(assumptions.targetYear || 2050);
    const captureRate = Number(assumptions.effectiveCaptureRate || 0.95);
    let cumulativeKt = 0;
    for (let year = startYear; year < targetYear; year += 1) {
      const averageCoverage = (getCoverageAtYear(pathway, year) + getCoverageAtYear(pathway, year + 1)) / 200;
      cumulativeKt += Number(processEmissionsKt || 0) * averageCoverage * captureRate;
    }
    return cumulativeKt / 1000;
  }

  function getCementCcsNetwork(companiesInput, intervalYears = ccsIntervalYears) {
    const companies = Array.isArray(companiesInput) ? companiesInput : [];
    const assumptions = Data?.CEMENT_CCS_ASSUMPTIONS || {
      baselineYear: 2024,
      processEmissionShare: 0.65,
      effectiveCaptureRate: 0.95,
      startYear: 2025,
      targetYear: 2050,
    };
    const interval = CCS_INTERVALS.includes(Number(intervalYears)) ? Number(intervalYears) : 5;
    const milestoneYears = interval === 10
      ? [2030, 2040, 2050]
      : [2025, 2030, 2035, 2040, 2045, 2050];
    const companyById = new Map(companies.map((company) => [company.id, company]));
    const storageSites = Array.isArray(Data?.CEMENT_CCS_STORAGE_SITES) ? Data.CEMENT_CCS_STORAGE_SITES : [];
    const storageById = new Map(storageSites.map((site) => [site.id, site]));
    const pathways = Data?.CEMENT_CCS_COVERAGE_PATHWAY || {};
    const connections = Array.isArray(Data?.CEMENT_CCS_CONNECTIONS) ? Data.CEMENT_CCS_CONNECTIONS : [];
    const processShare = Number(assumptions.processEmissionShare || 0.65);
    const captureRate = Number(assumptions.effectiveCaptureRate || 0.95);

    const plants = connections.map((connection) => {
      const company = companyById.get(connection.plantId);
      const pathway = pathways[connection.plantId] || {};
      const baselineEmissionsKt = Number(company?.emissions2024Kt || 0);
      const processEmissionsKt = baselineEmissionsKt * processShare;
      const primaryStorage = storageById.get(connection.primaryStorageId);
      const alternativeStorage = connection.alternativeStorageIds
        .map((id) => storageById.get(id))
        .filter(Boolean);
      const routeDistanceKm = company?.geography && primaryStorage
        ? haversineDistanceKm(
          company.geography.latitude,
          company.geography.longitude,
          primaryStorage.latitude,
          primaryStorage.longitude
        )
        : 0;
      return {
        ...connection,
        company,
        pathway,
        baselineEmissionsKt,
        processEmissionsKt,
        primaryStorage,
        alternativeStorage,
        routeDistanceKm,
        milestones: milestoneYears.map((year) => {
          const systemCoverage = getCoverageAtYear(pathway, year);
          const coveredProcessKt = processEmissionsKt * systemCoverage / 100;
          return {
            year,
            systemCoverage,
            coveredProcessKt,
            permanentlyStoredKt: coveredProcessKt * captureRate,
          };
        }),
        cumulativeStoredMt2050: getCumulativeStoredMt(processEmissionsKt, pathway, assumptions),
      };
    }).filter((plant) => plant.company && plant.primaryStorage);

    const processEmissionsKt = plants.reduce((sum, plant) => sum + plant.processEmissionsKt, 0);
    const milestones = milestoneYears.map((year) => {
      const coveredProcessKt = plants.reduce((sum, plant) => (
        sum + plant.processEmissionsKt * getCoverageAtYear(plant.pathway, year) / 100
      ), 0);
      return {
        year,
        systemCoverage: processEmissionsKt > 0 ? coveredProcessKt / processEmissionsKt * 100 : 0,
        coveredProcessKt,
        permanentlyStoredKt: coveredProcessKt * captureRate,
      };
    });
    return {
      assumptions,
      intervalYears: interval,
      milestoneYears,
      plants,
      storageSites,
      processEmissionsKt,
      totalBaselineKt: plants.reduce((sum, plant) => sum + plant.baselineEmissionsKt, 0),
      effectiveStoredKt2050: processEmissionsKt * captureRate,
      cumulativeStoredMt2050: plants.reduce((sum, plant) => sum + plant.cumulativeStoredMt2050, 0),
      systemCoverage2050: processEmissionsKt > 0
        ? plants.reduce((sum, plant) => sum + plant.processEmissionsKt * getCoverageAtYear(plant.pathway, 2050) / 100, 0) / processEmissionsKt * 100
        : 0,
      milestones,
    };
  }

  function getCcsAssessment(companiesInput, intervalYears = ccsIntervalYears) {
    const hub = Data?.CENTRAL_CCS_HUB || {};
    const companies = Array.isArray(companiesInput) ? companiesInput : [];
    const sourceCompanies = companies.filter((company) => hub.sourceCompanyIds?.includes(company.id));
    return {
      ...hub,
      sourceCompanies,
      sourceBaselineKt: sourceCompanies.reduce((sum, company) => sum + Number(company.emissions2024Kt || 0), 0),
      cementNetwork: getCementCcsNetwork(companies, intervalYears),
    };
  }

  function getAmmoniaNetwork() {
    const nodes = Array.isArray(Data?.AMMONIA_LOGISTICS_NODES) ? Data.AMMONIA_LOGISTICS_NODES : [];
    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const routes = (Array.isArray(Data?.AMMONIA_LOGISTICS_ROUTES) ? Data.AMMONIA_LOGISTICS_ROUTES : []).map((route) => ({
      ...route,
      nodes: route.nodeIds.map((id) => nodeById.get(id)).filter(Boolean),
    }));
    return { nodes, routes };
  }

  function getPlacementMap(companies, contextInstallations, viewport) {
    const items = [
      ...companies.map((company) => ({
        id: company.id,
        longitude: company.geography.longitude,
        latitude: company.geography.latitude,
        markerSize: 8,
        priority: Number(company.etsRank2024 || 50),
      })),
      ...contextInstallations.map((installation, index) => ({
        id: installation.id,
        longitude: installation.longitude,
        latitude: installation.latitude,
        markerSize: 6,
        priority: 100 + index,
      })),
    ];
    return root.IndustrialGeography?.resolveMapMarkerCollisions
      ? root.IndustrialGeography.resolveMapMarkerCollisions(items, viewport)
      : new Map(items.map((item) => [item.id, {
        x: item.longitude,
        y: item.latitude,
        originalX: item.longitude,
        originalY: item.latitude,
        displaced: false,
      }]));
  }

  function getCcsPlacementMap(network, viewport) {
    const items = [
      ...network.plants.map((plant, index) => ({
        id: `ccs-plant:${plant.company.id}`,
        longitude: plant.company.geography.longitude,
        latitude: plant.company.geography.latitude,
        markerSize: 14,
        priority: index + 1,
      })),
      ...network.storageSites.map((site, index) => ({
        id: `ccs-storage:${site.id}`,
        longitude: site.longitude,
        latitude: site.latitude,
        markerSize: 16,
        priority: 10 + index,
      })),
    ];
    return root.IndustrialGeography?.resolveMapMarkerCollisions
      ? root.IndustrialGeography.resolveMapMarkerCollisions(items, viewport)
      : new Map(items.map((item) => [item.id, {
        x: item.longitude,
        y: item.latitude,
        originalX: item.longitude,
        originalY: item.latitude,
        displaced: false,
      }]));
  }

  function buildPlanningMapModel(options = {}) {
    const evaluatedValleys = options.evaluatedValleys || [];
    const companies = options.companies || [];
    const contextInstallations = options.contextInstallations || [];
    const layers = { ...DEFAULT_LAYERS, ...(options.layers || {}) };
    const theme = options.theme || getTheme();
    const viewport = options.viewport || { width: 900, height: 540 };
    const outline = root.IndustrialGeography?.BULGARIA_OUTLINE || [];
    const ccs = options.ccs || getCcsAssessment(companies);
    const ammonia = options.ammonia || getAmmoniaNetwork();
    const placements = getPlacementMap(companies, contextInstallations, viewport);
    const traces = [{
      type: 'scatter', mode: 'lines',
      x: outline.map((point) => point[0]), y: outline.map((point) => point[1]),
      fill: 'toself', fillcolor: theme.mapFill,
      line: { color: theme.border, width: 1.5 }, hoverinfo: 'skip', showlegend: false,
      meta: { layer: 'base' },
    }];
    const shapes = [];
    const annotations = [];

    if (layers.ets) {
      const displaced = [...companies, ...contextInstallations].filter((item) => placements.get(item.id)?.displaced);
      traces.push({
        type: 'scatter', mode: 'lines',
        x: displaced.flatMap((item) => [placements.get(item.id).originalX, placements.get(item.id).x, null]),
        y: displaced.flatMap((item) => [placements.get(item.id).originalY, placements.get(item.id).y, null]),
        line: { color: theme.faint, width: 0.7, dash: 'dot' }, opacity: 0.35,
        hoverinfo: 'skip', showlegend: false, meta: { layer: 'ets-guides' },
      });
      traces.push({
        type: 'scatter', mode: 'markers',
        x: contextInstallations.map((item) => placements.get(item.id).x),
        y: contextInstallations.map((item) => placements.get(item.id).y),
        marker: {
          size: 6,
          symbol: contextInstallations.map((item) => item.category === 'district_heating' ? 'diamond' : 'square'),
          color: theme.faint,
          opacity: 0.32,
          line: { color: theme.surface, width: 0.7 },
        },
        customdata: contextInstallations.map((item) => [localize(item.name), t('infra.contextPoint')]),
        hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<extra></extra>',
        showlegend: false, meta: { layer: 'ets-context' },
      });
      traces.push({
        type: 'scatter', mode: 'markers',
        x: companies.map((company) => placements.get(company.id).x),
        y: companies.map((company) => placements.get(company.id).y),
        marker: {
          size: 8,
          color: companies.map((company) => theme.sectors[company.clusterSector]),
          opacity: 0.58,
          line: { color: theme.surface, width: 1 },
        },
        customdata: companies.map((company) => [company.company, company.specificSector, round(company.emissions2024Kt, 3)]),
        hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{customdata[2]} kt CO2e<extra></extra>',
        showlegend: false, meta: { layer: 'ets-analysis' },
      });
    }

    if (layers.ammonia) {
      ammonia.routes.forEach((route) => {
        traces.push({
          type: 'scatter', mode: 'lines',
          x: route.nodes.map((node) => node.longitude), y: route.nodes.map((node) => node.latitude),
          line: { color: theme.ammonia, width: route.phase <= Number(planningPhase) ? 2.4 : 1.4, dash: route.phase <= Number(planningPhase) ? 'solid' : 'dot' },
          opacity: route.phase <= Number(planningPhase) ? 0.8 : 0.4,
          customdata: route.nodes.map(() => [localize(route.name), t(`infra.mode.${route.mode}`), route.phase]),
          hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]} · %{customdata[2]}<extra></extra>',
          showlegend: false, meta: { layer: 'ammonia-route', routeId: route.id },
        });
      });
      traces.push({
        type: 'scatter', mode: 'markers',
        x: ammonia.nodes.map((node) => node.longitude), y: ammonia.nodes.map((node) => node.latitude),
        marker: {
          size: ammonia.nodes.map((node) => node.type.includes('supply') || node.type.includes('port') ? 13 : 10),
          symbol: ammonia.nodes.map((node) => node.type.includes('supply') || node.type.includes('port') ? 'diamond' : 'diamond-open'),
          color: theme.ammoniaFill,
          line: { color: theme.ammonia, width: 1.6 },
        },
        customdata: ammonia.nodes.map((node) => [localize(node.name), node.applications.map((key) => t(`infra.application.${key}`)).join(', ')]),
        hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<extra></extra>',
        showlegend: false, meta: { layer: 'ammonia-node' },
      });
    }

    if (layers.ccs && ccs.cementNetwork?.plants?.length) {
      const network = ccs.cementNetwork;
      const ccsPlacements = getCcsPlacementMap(network, viewport);
      const storageLabelKeys = {
        'devnya-onshore': 'infra.storageShort.devnya',
        'beli-net-zero': 'infra.storageShort.beli',
        'pleven-zone': 'infra.storageShort.pleven',
        galata: 'infra.storageShort.galata',
      };
      const storageSymbols = {
        advanced_development: 'hexagon',
        field_appraisal: 'hexagon-open',
        screening_resource: 'x',
        legacy_alternative: 'triangle-up-open',
      };

      network.plants.forEach((plant) => {
        const plantPlacement = ccsPlacements.get(`ccs-plant:${plant.company.id}`);
        const storagePlacement = ccsPlacements.get(`ccs-storage:${plant.primaryStorage.id}`);
        traces.push({
          type: 'scatter', mode: 'lines',
          x: [plantPlacement.x, storagePlacement.x], y: [plantPlacement.y, storagePlacement.y],
          line: { color: theme.ccs, width: 2.8, dash: 'solid' }, opacity: 0.86,
          customdata: [
            [plant.company.company, localize(plant.primaryStorage.name), t(`infra.transport.${plant.transportMode}`)],
            [plant.company.company, localize(plant.primaryStorage.name), t(`infra.transport.${plant.transportMode}`)],
          ],
          hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{customdata[2]}<extra></extra>',
          showlegend: false, meta: { layer: 'ccs-route', routeRole: 'primary', plantId: plant.company.id },
        });
        plant.alternativeStorage.forEach((site) => {
          const alternativePlacement = ccsPlacements.get(`ccs-storage:${site.id}`);
          traces.push({
            type: 'scatter', mode: 'lines',
            x: [plantPlacement.x, alternativePlacement.x], y: [plantPlacement.y, alternativePlacement.y],
            line: { color: theme.ccs, width: 1.25, dash: 'dot' }, opacity: 0.34,
            customdata: [
              [plant.company.company, localize(site.name), t('infra.conditionalAlternative')],
              [plant.company.company, localize(site.name), t('infra.conditionalAlternative')],
            ],
            hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<br>%{customdata[2]}<extra></extra>',
            showlegend: false, meta: { layer: 'ccs-route', routeRole: 'alternative', plantId: plant.company.id },
          });
        });
      });

      const ccsItems = [
        ...network.plants.map((plant) => ({
          id: `ccs-plant:${plant.company.id}`,
          name: plant.company.company,
          detail: `${numberFormat(plant.processEmissionsKt, { maximumFractionDigits: 0 })} kt CO2/${t('infra.yearShort')} · ${t('infra.estimatedProcess')}`,
          size: 14,
          symbol: 'circle',
          text: '',
        })),
        ...network.storageSites.map((site) => ({
          id: `ccs-storage:${site.id}`,
          name: localize(site.name),
          detail: t(`infra.maturity.${site.maturity}`),
          size: site.maturity === 'advanced_development' ? 17 : 14,
          symbol: storageSymbols[site.maturity] || 'x',
          text: t(storageLabelKeys[site.id]),
        })),
      ];
      const displacedCcsItems = ccsItems.filter((item) => ccsPlacements.get(item.id)?.displaced);
      if (displacedCcsItems.length) {
        traces.push({
          type: 'scatter', mode: 'lines',
          x: displacedCcsItems.flatMap((item) => [ccsPlacements.get(item.id).originalX, ccsPlacements.get(item.id).x, null]),
          y: displacedCcsItems.flatMap((item) => [ccsPlacements.get(item.id).originalY, ccsPlacements.get(item.id).y, null]),
          line: { color: theme.ccs, width: 0.8, dash: 'dot' }, opacity: 0.42,
          hoverinfo: 'skip', showlegend: false, meta: { layer: 'ccs-guides' },
        });
      }
      traces.push({
        type: 'scatter', mode: 'markers+text',
        x: ccsItems.map((item) => ccsPlacements.get(item.id).x),
        y: ccsItems.map((item) => ccsPlacements.get(item.id).y),
        text: ccsItems.map((item) => item.text),
        textposition: ccsItems.map((item) => item.id.endsWith(':galata') ? 'bottom center' : 'top center'),
        textfont: { color: theme.ccs, size: 9, family: 'DM Sans, sans-serif' },
        marker: {
          size: ccsItems.map((item) => item.size),
          symbol: ccsItems.map((item) => item.symbol),
          color: ccsItems.map(() => theme.ccs),
          line: { color: theme.surface, width: 1.5 },
        },
        customdata: ccsItems.map((item) => [item.name, item.detail]),
        hovertemplate: '<b>%{customdata[0]}</b><br>%{customdata[1]}<extra></extra>',
        showlegend: false, meta: { layer: 'ccs-node' },
      });
    }

    if (layers.valleys) {
      const maxCapacity = Math.max(1, ...evaluatedValleys.map((valley) => valley.capacityMW));
      evaluatedValleys.forEach((valley) => {
        const latitudeRadius = valley.mapRadiusKm / 111.32;
        const longitudeRadius = valley.mapRadiusKm / (111.32 * Math.cos(valley.latitude * Math.PI / 180));
        shapes.push({
          type: 'circle', xref: 'x', yref: 'y',
          x0: valley.longitude - longitudeRadius, x1: valley.longitude + longitudeRadius,
          y0: valley.latitude - latitudeRadius, y1: valley.latitude + latitudeRadius,
          fillcolor: theme.hydrogenFill,
          line: { color: theme.hydrogen, width: selectedValleyId === valley.id ? 2.4 : 1.2, dash: selectedValleyId === valley.id ? 'solid' : 'dot' },
          layer: 'above',
        });
      });
      traces.push({
        type: 'scatter', mode: 'markers+text',
        x: evaluatedValleys.map((valley) => valley.longitude), y: evaluatedValleys.map((valley) => valley.latitude),
        text: evaluatedValleys.map((valley) => String(valley.rank)), textposition: 'middle center',
        textfont: { color: '#ffffff', size: 11, family: 'DM Sans, sans-serif' },
        marker: {
          size: evaluatedValleys.map((valley) => 23 + 17 * Math.sqrt(valley.capacityMW / maxCapacity)),
          color: theme.hydrogen, opacity: 0.92,
          line: { color: theme.surface, width: 2 },
        },
        customdata: evaluatedValleys.map((valley) => [
          localize(valley.name), round(valley.score20), valley.units, valley.capacityMW,
          round(valley.hydrogenOutputKt), round(valley.nearbyEmissionsKt),
        ]),
        hovertemplate: `<b>#%{text} %{customdata[0]}</b><br>${t('infra.score')}: %{customdata[1]}/20<br>${t('infra.modules')}: %{customdata[2]} · %{customdata[3]} MW<br>${t('infra.h2Output')}: %{customdata[4]} kt/${t('infra.yearShort')}<br>${t('infra.nearbyBaseline')}: %{customdata[5]} kt CO2e<extra></extra>`,
        showlegend: false, meta: { layer: 'valleys' },
      });
    }

    return { traces, shapes, annotations };
  }

  function scoreBar(value, maximum = 20, label = '') {
    const percent = Math.max(0, Math.min(100, Number(value || 0) / maximum * 100));
    return `<div class="infra-score-bar" aria-label="${escapeHtml(label)} ${numberFormat(value, { maximumFractionDigits: 1 })} / ${maximum}"><i><b style="width:${percent}%"></b></i><span>${numberFormat(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span></div>`;
  }

  function dimensionCell(value, key) {
    return `<td>${scoreBar(value, 4, t(`infra.dimension.${key}`))}</td>`;
  }

  function phaseControlsHtml() {
    return `
      <div class="infra-phase-control" role="group" aria-label="${escapeHtml(t('infra.phase'))}">
        <span>${escapeHtml(t('infra.phase'))}</span>
        <div>${PHASES.map((phase) => `<button type="button" data-infra-phase="${phase}" class="${planningPhase === phase ? 'active' : ''}" aria-pressed="${planningPhase === phase}">${escapeHtml(t(`infra.phase${phase}`))}</button>`).join('')}</div>
      </div>
    `;
  }

  function layerControlsHtml() {
    return `<div class="infra-layer-controls" aria-label="${escapeHtml(t('infra.layers'))}">${Object.keys(DEFAULT_LAYERS).map((layer) => `
      <label><input type="checkbox" data-infra-layer="${layer}" ${visibleLayers[layer] ? 'checked' : ''}><span>${escapeHtml(t(`infra.layer.${layer}`))}</span></label>
    `).join('')}</div>`;
  }

  function rankingTableHtml(valleys) {
    return `
      <div class="infra-table-wrap">
        <table class="infra-ranking-table">
          <thead><tr>
            <th>${escapeHtml(t('infra.zone'))}</th>
            <th>${escapeHtml(t('infra.dimension.demand'))}</th>
            <th>${escapeHtml(t('infra.dimension.power'))}</th>
            <th>${escapeHtml(t('infra.dimension.logistics'))}</th>
            <th>${escapeHtml(t('infra.dimension.anchor'))}</th>
            <th>${escapeHtml(t('infra.dimension.maturity'))}</th>
            <th>${escapeHtml(t('infra.score'))}</th>
            <th>${escapeHtml(t('infra.capacity'))}</th>
            <th>${escapeHtml(t('infra.h2Output'))}</th>
          </tr></thead>
          <tbody>${valleys.map((valley) => `
            <tr class="${selectedValleyId === valley.id ? 'selected' : ''}">
              <th scope="row"><button type="button" data-infra-valley="${escapeHtml(valley.id)}"><b>${valley.rank}</b><span><strong>${escapeHtml(localize(valley.name))}</strong><small>${escapeHtml(localize(valley.role))}</small></span></button></th>
              ${dimensionCell(valley.dimensions.demand, 'demand')}
              ${dimensionCell(valley.dimensions.power, 'power')}
              ${dimensionCell(valley.dimensions.logistics, 'logistics')}
              ${dimensionCell(valley.dimensions.anchor, 'anchor')}
              ${dimensionCell(valley.dimensions.maturity, 'maturity')}
              <td class="infra-total-score">${scoreBar(valley.score20, 20, t('infra.score'))}</td>
              <td><strong>${numberFormat(valley.capacityMW)}</strong><small>${valley.units} × 20 MW</small></td>
              <td><strong>${numberFormat(valley.hydrogenOutputKt, { maximumFractionDigits: 1 })}</strong><small>kt H2/${escapeHtml(t('infra.yearShort'))}</small></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    `;
  }

  function selectedValleyHtml(valley) {
    if (!valley) return '';
    return `
      <div class="infra-selected-zone">
        <div class="infra-selected-zone-head">
          <div><span>${escapeHtml(t('infra.selectedZone'))} #${valley.rank}</span><h3>${escapeHtml(localize(valley.name))}</h3><p>${escapeHtml(localize(valley.role))}</p></div>
          <strong>${numberFormat(valley.score20, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<small>/20</small></strong>
        </div>
        <div class="infra-selected-metrics">
          <div><span>${escapeHtml(t('infra.modules'))}</span><strong>${valley.units}</strong><small>${numberFormat(valley.capacityMW)} MW</small></div>
          <div><span>${escapeHtml(t('infra.h2Output'))}</span><strong>${numberFormat(valley.hydrogenOutputKt, { maximumFractionDigits: 1 })}</strong><small>kt/${escapeHtml(t('infra.yearShort'))}</small></div>
          <div><span>${escapeHtml(t('infra.nh3Equivalent'))}</span><strong>${numberFormat(valley.ammoniaEquivalentKt, { maximumFractionDigits: 0 })}</strong><small>kt NH3/${escapeHtml(t('infra.yearShort'))}</small></div>
          <div><span>${escapeHtml(t('infra.nearbyBaseline'))}</span><strong>${numberFormat(valley.nearbyEmissionsKt, { maximumFractionDigits: 0 })}</strong><small>kt CO2e</small></div>
        </div>
        <div class="infra-selected-copy">
          <div><strong>${escapeHtml(t('infra.investmentCase'))}</strong><p>${escapeHtml(localize(valley.rationale))}</p></div>
          <div><strong>${escapeHtml(t('infra.criticalGate'))}</strong><p>${escapeHtml(localize(valley.constraint))}</p></div>
        </div>
        <p class="infra-anchor-line"><strong>${escapeHtml(t('infra.anchorConsumers'))}:</strong> ${escapeHtml(valley.anchorCompanies.map((company) => company.company).join(', ') || t('general.notAvailable'))}</p>
      </div>
    `;
  }

  function storageCapacityLabel(site) {
    if (!Number.isFinite(Number(site.capacityMtMax))) return t('infra.capacityPending');
    const minimum = numberFormat(site.capacityMtMin, { maximumFractionDigits: 0 });
    const maximum = numberFormat(site.capacityMtMax, { maximumFractionDigits: 0 });
    return `${minimum}-${maximum} Mt CO2`;
  }

  function coverageCellHtml(milestone) {
    const coverage = round(milestone.systemCoverage, 0);
    return `
      <td class="infra-coverage-cell">
        <strong>${numberFormat(coverage, { maximumFractionDigits: 0 })}%</strong>
        <span aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, coverage))}%"></i></span>
        <small>${numberFormat(milestone.permanentlyStoredKt, { maximumFractionDigits: 0 })} kt</small>
      </td>
    `;
  }

  function ccsHtml(ccs) {
    const network = ccs.cementNetwork;
    const assumptions = network.assumptions;
    return `
      <section class="infra-decision-band infra-cement-ccs" aria-labelledby="infraCcsTitle">
        <div class="infra-band-head"><div><span>${escapeHtml(t('infra.nationalCcsKicker'))}</span><h2 id="infraCcsTitle">${escapeHtml(t('infra.cementCcsTitle'))}</h2><p>${escapeHtml(t('infra.cementCcsDesc'))}</p></div><strong class="infra-tech-badge ccs">CCS</strong></div>

        <div class="infra-ccs-metrics infra-ccs-national-metrics">
          <div><span>${escapeHtml(t('infra.processBaseline'))}</span><strong>${numberFormat(network.processEmissionsKt, { maximumFractionDigits: 0 })}</strong><small>kt CO2/${escapeHtml(t('infra.yearShort'))}</small></div>
          <div><span>${escapeHtml(t('infra.systemCoverage2050'))}</span><strong>${numberFormat(network.systemCoverage2050, { maximumFractionDigits: 0 })}%</strong><small>${network.plants.length}/${network.plants.length} ${escapeHtml(t('infra.clinkerPlants'))}</small></div>
          <div><span>${escapeHtml(t('infra.effectiveStored2050'))}</span><strong>${numberFormat(network.effectiveStoredKt2050, { maximumFractionDigits: 0 })}</strong><small>kt CO2/${escapeHtml(t('infra.yearShort'))} @ ${numberFormat(Number(assumptions.effectiveCaptureRate) * 100, { maximumFractionDigits: 0 })}%</small></div>
          <div><span>${escapeHtml(t('infra.cumulativeStored2050'))}</span><strong>${numberFormat(network.cumulativeStoredMt2050, { maximumFractionDigits: 1 })}</strong><small>Mt CO2</small></div>
        </div>

        <div class="infra-ccs-timeline-head">
          <div><h3>${escapeHtml(t('infra.rolloutTitle'))}</h3><p>${escapeHtml(t('infra.rolloutDesc'))}</p></div>
          <div class="infra-ccs-interval" role="group" aria-label="${escapeHtml(t('infra.interval'))}">
            <span>${escapeHtml(t('infra.interval'))}</span>
            <div>
              ${CCS_INTERVALS.map((interval) => `<button type="button" class="${network.intervalYears === interval ? 'active' : ''}" data-ccs-interval="${interval}" aria-pressed="${network.intervalYears === interval}">${interval} ${escapeHtml(t('infra.yearsShort'))}</button>`).join('')}
            </div>
          </div>
        </div>

        <div class="infra-national-coverage" aria-label="${escapeHtml(t('infra.nationalCoverage'))}">
          ${network.milestones.map((milestone) => `
            <div>
              <span>${milestone.year}</span>
              <strong>${numberFormat(milestone.systemCoverage, { maximumFractionDigits: 0 })}%</strong>
              <b aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, milestone.systemCoverage))}%"></i></b>
              <small>${numberFormat(milestone.permanentlyStoredKt, { maximumFractionDigits: 0 })} kt CO2/${escapeHtml(t('infra.yearShort'))}</small>
            </div>
          `).join('')}
        </div>

        <div class="infra-ccs-table-wrap">
          <table class="infra-ccs-table">
            <thead><tr><th>${escapeHtml(t('infra.cementPlant'))}</th><th>${escapeHtml(t('infra.processEstimate'))}</th>${network.milestoneYears.map((year) => `<th>${year}</th>`).join('')}<th>${escapeHtml(t('infra.storageConnection'))}</th></tr></thead>
            <tbody>${network.plants.map((plant) => `
              <tr>
                <th><strong>${escapeHtml(plant.company.company)}</strong><small>${escapeHtml(t(`infra.transport.${plant.transportMode}`))}</small></th>
                <td class="infra-process-cell"><strong>${numberFormat(plant.processEmissionsKt, { maximumFractionDigits: 0 })}</strong><small>kt CO2/${escapeHtml(t('infra.yearShort'))}</small></td>
                ${plant.milestones.map(coverageCellHtml).join('')}
                <td class="infra-storage-cell"><strong>${escapeHtml(localize(plant.primaryStorage.name))}</strong><small>${escapeHtml(t('infra.alternative'))}: ${escapeHtml(plant.alternativeStorage.map((site) => localize(site.name)).join(', '))}</small></td>
              </tr>
            `).join('')}</tbody>
          </table>
        </div>
        <p class="infra-table-note">${escapeHtml(t('infra.coverageVsEfficiency'))}</p>

        <div class="infra-storage-head"><h3>${escapeHtml(t('infra.storagePortfolio'))}</h3><p>${escapeHtml(t('infra.storagePortfolioDesc'))}</p></div>
        <div class="infra-storage-grid">
          ${network.storageSites.map((site) => `
            <article class="infra-storage-site ${escapeHtml(site.maturity)}">
              <div><span>${escapeHtml(t(`infra.maturity.${site.maturity}`))}</span><b>${site.onshore ? escapeHtml(t('infra.onshore')) : escapeHtml(t('infra.offshore'))}</b></div>
              <h4>${escapeHtml(localize(site.name))}</h4>
              <strong>${escapeHtml(storageCapacityLabel(site))}</strong>
              ${site.injectionTargetKtPerYear ? `<small>${numberFormat(site.injectionTargetKtPerYear)} kt CO2/${escapeHtml(t('infra.yearShort'))} ${escapeHtml(t('infra.injectionTarget'))}</small>` : ''}
              <p>${escapeHtml(localize(site.status))}</p>
              <a href="${escapeHtml(site.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('general.source'))}</a>
            </article>
          `).join('')}
        </div>

        <div class="infra-ccs-correction"><strong>${escapeHtml(t('infra.galataCorrectionTitle'))}</strong><p>${escapeHtml(t('infra.galataCorrectionDesc'))}</p></div>
        <p class="infra-scope-note"><strong>${escapeHtml(t('infra.processAssumption'))}:</strong> ${escapeHtml(localize(assumptions.note))}</p>
      </section>
    `;
  }

  function ammoniaHtml(network) {
    return `
      <section class="infra-decision-band" aria-labelledby="infraAmmoniaTitle">
        <div class="infra-band-head"><div><span>${escapeHtml(t('infra.logisticsConcept'))}</span><h2 id="infraAmmoniaTitle">${escapeHtml(t('infra.ammoniaTitle'))}</h2><p>${escapeHtml(t('infra.ammoniaDesc'))}</p></div><strong class="infra-tech-badge ammonia">NH3</strong></div>
        <div class="infra-ammonia-chain">
          <div><b>1</b><strong>${escapeHtml(t('infra.chainSupply'))}</strong><span>${escapeHtml(t('infra.chainSupplyDesc'))}</span></div>
          <div><b>2</b><strong>${escapeHtml(t('infra.chainTransport'))}</strong><span>${escapeHtml(t('infra.chainTransportDesc'))}</span></div>
          <div><b>3</b><strong>${escapeHtml(t('infra.chainUse'))}</strong><span>${escapeHtml(t('infra.chainUseDesc'))}</span></div>
        </div>
        <div class="infra-route-table-wrap">
          <table class="infra-route-table"><thead><tr><th>${escapeHtml(t('infra.route'))}</th><th>${escapeHtml(t('infra.nodes'))}</th><th>${escapeHtml(t('infra.mode'))}</th><th>${escapeHtml(t('infra.firstPhase'))}</th></tr></thead>
          <tbody>${network.routes.map((route) => `<tr><th>${escapeHtml(localize(route.name))}</th><td>${escapeHtml(route.nodes.map((node) => localize(node.name)).join(' → '))}</td><td>${escapeHtml(t(`infra.mode.${route.mode}`))}</td><td>${route.phase}</td></tr>`).join('')}</tbody></table>
        </div>
        <div class="infra-ammonia-options">
          <div><strong>${escapeHtml(t('infra.application.feedstock'))}</strong><span>${escapeHtml(t('infra.feedstockDesc'))}</span></div>
          <div><strong>${escapeHtml(t('infra.application.direct_fuel'))}</strong><span>${escapeHtml(t('infra.directFuelDesc'))}</span></div>
          <div><strong>${escapeHtml(t('infra.application.cracking'))}</strong><span>${escapeHtml(t('infra.crackingDesc'))}</span></div>
        </div>
        <p class="infra-scope-note warning"><strong>${escapeHtml(t('infra.technologyCorrection'))}:</strong> ${escapeHtml(t('infra.technologyCorrectionDesc'))}</p>
      </section>
    `;
  }

  function sourcesHtml() {
    const sources = Array.isArray(Data?.INFRASTRUCTURE_SITING_SOURCES) ? Data.INFRASTRUCTURE_SITING_SOURCES : [];
    return `<div class="infra-sources"><span>${escapeHtml(t('general.source'))}:</span>${sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`).join('')}</div>`;
  }

  function plotConfig() {
    return { responsive: true, displaylogo: false, scrollZoom: false, modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'] };
  }

  function renderPlanningMap(options, evaluatedValleys, ccs, ammonia, theme) {
    const node = root.document?.getElementById('industrialInfrastructureMap');
    if (!node) return;
    if (!root.Plotly?.react) {
      node.innerHTML = `<div class="industrial-geo-empty">${escapeHtml(t('chart.plotlyMissing'))}</div>`;
      return;
    }
    const width = Math.max(320, Number(node.clientWidth) || 900);
    const height = Math.max(470, Number(node.clientHeight) || 540);
    const model = buildPlanningMapModel({
      evaluatedValleys,
      companies: options.companies,
      contextInstallations: options.contextInstallations,
      ccs,
      ammonia,
      layers: visibleLayers,
      theme,
      viewport: { width, height },
    });
    root.Plotly.react(node, model.traces, {
      autosize: true, height,
      margin: { l: 12, r: 12, t: 8, b: 8 },
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      hoverlabel: { bgcolor: theme.surface, bordercolor: theme.border, font: { color: theme.text, family: 'DM Sans, sans-serif', size: 12 } },
      xaxis: { range: [MAP_BOUNDS.xMin, MAP_BOUNDS.xMax], visible: false, fixedrange: true, zeroline: false },
      yaxis: { range: [MAP_BOUNDS.yMin, MAP_BOUNDS.yMax], visible: false, fixedrange: true, zeroline: false, scaleanchor: 'x', scaleratio: MAP_Y_SCALE_RATIO },
      shapes: model.shapes, annotations: model.annotations, showlegend: false,
    }, plotConfig());
    observeMapSize(node);
  }

  function observeMapSize(node) {
    if (typeof root.ResizeObserver !== 'function') return;
    if (!mapResizeObserver) {
      mapResizeObserver = new root.ResizeObserver((entries) => {
        const entry = entries.find((item) => item.target === observedMapNode);
        const width = Math.round(Number(entry?.contentRect?.width || observedMapNode?.clientWidth || 0));
        if (width < 100 || Math.abs(width - observedMapWidth) < 4) return;
        observedMapWidth = width;
        if (resizeFrame != null && typeof root.cancelAnimationFrame === 'function') root.cancelAnimationFrame(resizeFrame);
        const rerender = () => {
          resizeFrame = null;
          if (lastRenderOptions) render(lastRenderOptions);
        };
        resizeFrame = typeof root.requestAnimationFrame === 'function'
          ? root.requestAnimationFrame(rerender)
          : root.setTimeout?.(rerender, 0);
      });
    }
    if (observedMapNode !== node) {
      mapResizeObserver.disconnect();
      observedMapNode = node;
      observedMapWidth = Math.round(Number(node.clientWidth || 0));
      mapResizeObserver.observe(node);
    }
  }

  function purge() {
    const node = root.document?.getElementById('industrialInfrastructureMap');
    if (node && root.Plotly?.purge) root.Plotly.purge(node);
  }

  function render(options = {}) {
    const normalizedOptions = {
      containerId: options.containerId || 'industrialInfrastructurePlanning',
      companies: Array.isArray(options.companies) ? options.companies : Data?.createDefaultCompanies?.().filter((company) => company.geography && Number.isFinite(Number(company.etsRank2024))) || [],
      contextInstallations: Array.isArray(options.contextInstallations) ? options.contextInstallations : Data?.GEOGRAPHY_CONTEXT_INSTALLATIONS || [],
      theme: options.theme || getTheme(),
    };
    const container = root.document?.getElementById(normalizedOptions.containerId);
    if (!container) return;
    lastRenderOptions = normalizedOptions;
    purge();

    const valleys = evaluateValleys(normalizedOptions.companies, planningPhase);
    const ccs = getCcsAssessment(normalizedOptions.companies);
    const ammonia = getAmmoniaNetwork();
    if (!valleys.some((valley) => valley.id === selectedValleyId)) selectedValleyId = valleys[0]?.id || '';
    const selected = valleys.find((valley) => valley.id === selectedValleyId) || valleys[0];
    const totalCapacityMW = valleys.reduce((sum, valley) => sum + valley.capacityMW, 0);
    const totalHydrogenKt = valleys.reduce((sum, valley) => sum + valley.hydrogenOutputKt, 0);

    container.innerHTML = `
      <section class="industrial-infra-section" aria-labelledby="industrialInfraTitle">
        <header class="industrial-infra-header">
          <div><span>${escapeHtml(t('infra.kicker'))}</span><h2 id="industrialInfraTitle">${escapeHtml(t('infra.title'))}</h2><p>${escapeHtml(t('infra.desc'))}</p></div>
          <strong>${escapeHtml(t('infra.screeningBadge'))}</strong>
        </header>

        <div class="infra-kpi-strip">
          <div><span>${escapeHtml(t('infra.candidateValleys'))}</span><strong>${valleys.length}</strong></div>
          <div><span>${escapeHtml(t('infra.portfolioCapacity'))}</span><strong>${numberFormat(totalCapacityMW)}</strong><small>MW</small></div>
          <div><span>${escapeHtml(t('infra.portfolioHydrogen'))}</span><strong>${numberFormat(totalHydrogenKt, { maximumFractionDigits: 1 })}</strong><small>kt H2/${escapeHtml(t('infra.yearShort'))}</small></div>
          <div><span>${escapeHtml(t('infra.ccsHub'))}</span><strong>${numberFormat(ccs.phaseOneCaptureKtPerYear)}</strong><small>kt CO2/${escapeHtml(t('infra.yearShort'))}</small></div>
        </div>
        <p class="infra-ccs-hub-note">${escapeHtml(localize(ccs.architectureNote))} ${escapeHtml(t('infra.ccsHubSources', {
          companies: ccs.sourceCompanies.map((company) => localize(company.name)).join(', '),
          baseline: numberFormat(ccs.sourceBaselineKt),
        }))}</p>

        <div class="infra-controls-band">${phaseControlsHtml()}${layerControlsHtml()}</div>

        <section class="infra-map-panel" aria-labelledby="industrialInfraMapTitle">
          <div class="infra-panel-head"><div><h3 id="industrialInfraMapTitle">${escapeHtml(t('infra.mapTitle'))}</h3><p>${escapeHtml(t('infra.mapDesc'))}</p></div><span>${escapeHtml(t('infra.mapScale'))}</span></div>
          <div class="industrial-infra-map" id="industrialInfrastructureMap" role="img" aria-label="${escapeHtml(t('infra.mapAria'))}"></div>
          <div class="infra-map-legend"><span class="hydrogen">${escapeHtml(t('infra.legendValley'))}</span><span class="ccs">${escapeHtml(t('infra.legendCcs'))}</span><span class="ammonia">${escapeHtml(t('infra.legendAmmonia'))}</span><span class="ets">${escapeHtml(t('infra.legendEts'))}</span></div>
          <p class="infra-map-note">${escapeHtml(t('infra.mapNote'))}</p>
        </section>

        <section class="infra-ranking-section" aria-labelledby="infraRankingTitle">
          <div class="infra-panel-head"><div><h3 id="infraRankingTitle">${escapeHtml(t('infra.rankingTitle'))}</h3><p>${escapeHtml(t('infra.rankingDesc'))}</p></div><span>${escapeHtml(t('infra.scale20'))}</span></div>
          ${rankingTableHtml(valleys)}
          ${selectedValleyHtml(selected)}
        </section>

        ${ccsHtml(ccs)}
        ${ammoniaHtml(ammonia)}

        <p class="infra-method-note"><strong>${escapeHtml(t('infra.methodology'))}:</strong> ${escapeHtml(t('infra.methodNote'))}</p>
        ${sourcesHtml()}
      </section>
    `;

    container.querySelectorAll?.('[data-infra-phase]').forEach((button) => {
      button.addEventListener('click', () => setPhase(button.dataset.infraPhase));
    });
    container.querySelectorAll?.('[data-infra-layer]').forEach((input) => {
      input.addEventListener('change', () => setLayer(input.dataset.infraLayer, input.checked));
    });
    container.querySelectorAll?.('[data-infra-valley]').forEach((button) => {
      button.addEventListener('click', () => selectValley(button.dataset.infraValley));
    });
    container.querySelectorAll?.('[data-ccs-interval]').forEach((button) => {
      button.addEventListener('click', () => setCcsInterval(button.dataset.ccsInterval));
    });

    renderPlanningMap(normalizedOptions, valleys, ccs, ammonia, normalizedOptions.theme);
  }

  function setPhase(phase) {
    planningPhase = PHASES.includes(String(phase)) ? String(phase) : '2030';
    if (lastRenderOptions) render(lastRenderOptions);
  }

  function setLayer(layer, value) {
    if (!(layer in DEFAULT_LAYERS)) return;
    visibleLayers[layer] = value === true;
    if (lastRenderOptions) render(lastRenderOptions);
  }

  function selectValley(id) {
    selectedValleyId = String(id || '');
    if (lastRenderOptions) render(lastRenderOptions);
  }

  function setCcsInterval(intervalYears) {
    ccsIntervalYears = CCS_INTERVALS.includes(Number(intervalYears)) ? Number(intervalYears) : 5;
    if (lastRenderOptions) render(lastRenderOptions);
  }

  function getState() {
    return { phase: planningPhase, selectedValleyId, ccsIntervalYears, layers: { ...visibleLayers } };
  }

  return Object.freeze({
    render,
    purge,
    setPhase,
    setLayer,
    selectValley,
    setCcsInterval,
    getState,
    evaluateValleys,
    getCcsAssessment,
    getCementCcsNetwork,
    getAmmoniaNetwork,
    buildPlanningMapModel,
    haversineDistanceKm,
    getHydrogenOutputKt,
    getCoverageAtYear,
  });
});
