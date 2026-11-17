(function initIndustrialGeography(root, factory) {
  const api = factory(root, root.ClusterData, root.ClusterI18n);
  root.IndustrialGeography = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createIndustrialGeography(root, Data, I18n) {
  'use strict';

  const SECTOR_ORDER = ['Chemicals', 'Mineral Materials', 'Metals', 'Other Manufacturing'];
  const CONTEXT_ORDER = ['power_heat', 'district_heating'];
  const MAP_BOUNDS = Object.freeze({ xMin: 22.1, xMax: 28.85, yMin: 41, yMax: 44.45 });
  const MAP_Y_SCALE_RATIO = 1.35;
  const MAP_MARKER_GAP_PX = 3;
  const SECTOR_KEYS = Object.freeze({
    Chemicals: 'chemicals',
    'Mineral Materials': 'mineralMaterials',
    Metals: 'metals',
    'Other Manufacturing': 'otherManufacturing',
  });

  const BULGARIA_OUTLINE = Object.freeze([
    [22.65715, 44.234923], [22.944832, 43.823785], [23.332302, 43.897011],
    [24.100679, 43.741051], [25.569272, 43.688445], [26.065159, 43.943494],
    [27.2424, 44.175986], [27.970107, 43.812468], [28.558081, 43.707462],
    [28.039095, 43.293172], [27.673898, 42.577892], [27.99672, 42.007359],
    [27.135739, 42.141485], [26.117042, 41.826905], [26.106138, 41.328899],
    [25.197201, 41.234486], [24.492645, 41.583896], [23.692074, 41.309081],
    [22.952377, 41.337994], [22.881374, 41.999297], [22.380526, 42.32026],
    [22.545012, 42.461362], [22.436595, 42.580321], [22.604801, 42.898519],
    [22.986019, 43.211161], [22.500157, 43.642814], [22.410446, 44.008063],
    [22.65715, 44.234923],
  ]);

  const SECTOR_LAYOUT = Object.freeze({
    Chemicals: { x: 22, y: 70, radius: 20, labelY: 94 },
    'Mineral Materials': { x: 69, y: 59, radius: 27, labelY: 94 },
    Metals: { x: 24, y: 22, radius: 17, labelY: 43 },
    'Other Manufacturing': { x: 73, y: 18, radius: 12, labelY: 36 },
  });

  const SECTOR_CONTEXT_LAYOUT = Object.freeze({
    Chemicals: { x: 17, y: 72, radius: 14, labelY: 94 },
    'Mineral Materials': { x: 50, y: 72, radius: 16, labelY: 94 },
    Metals: { x: 83, y: 72, radius: 13, labelY: 94 },
    'Other Manufacturing': { x: 17, y: 24, radius: 11, labelY: 45 },
    'context:power_heat': { x: 50, y: 24, radius: 14, labelY: 45 },
    'context:district_heating': { x: 83, y: 24, radius: 16, labelY: 45 },
  });

  const REGION_VISUAL_ORDER = Object.freeze(['BG31', 'BG32', 'BG33', 'BG41', 'BG42', 'BG34']);

  const REGION_LAYOUT = Object.freeze({
    BG31: { x: 17, y: 72, radius: 13, labelY: 93 },
    BG32: { x: 50, y: 72, radius: 13, labelY: 93 },
    BG33: { x: 83, y: 72, radius: 15, labelY: 93 },
    BG41: { x: 17, y: 24, radius: 14, labelY: 45 },
    BG42: { x: 50, y: 24, radius: 14, labelY: 45 },
    BG34: { x: 83, y: 24, radius: 13, labelY: 45 },
  });

  let clusterMode = 'sector';
  let displayYear = 2025;
  let activityFilter = 'all';
  const copy = (en, bg) => I18n?.getLanguage?.() === 'bg' ? bg : en;
  let includeContextInClusters = false;
  let contextVisible = true;
  let mapResizeObserver = null;
  let observedMapNode = null;
  let observedMapWidth = 0;
  let observedMapHeight = 0;
  let mapResizeFrame = null;
  const pendingPlots = new WeakMap();

  function t(key, variables = {}) {
    if (displayYear === 2025) {
      const labels = {
        'geo.installations': copy('mapped operators', 'оператори на картата'),
        'geo.mtEmissions2024': copy('Mt CO₂e · 2025 · mapped records', 'млн. t CO₂e · 2025 · записи на картата'),
        'geo.mapDesc': copy('Operators from the expanded register. Circle sizes use available 2025 emissions; energy context remains dated 2024.', 'Оператори от разширения регистър. Размерът на кръговете използва наличните емисии за 2025 г.; енергийният контекст остава за 2024 г.'),
        'geo.mapAria': copy('Map of industrial operators in Bulgaria', 'Карта на индустриалните оператори в България'),
        'geo.legendTitle': copy('Main sector groups', 'Основни секторни групи'),
        'geo.sectors': copy('main sector groups', 'основни секторни групи'),
        'geo.contextLayerDesc': copy(`The ${variables.count || 28} pale markers show the 2024 energy context only. They are excluded from operator emission totals, KPIs and scenario calculations. By default they are excluded from emission clusters and can be shown for visual comparison.`, `Тези ${variables.count || 28} светли маркера показват само енергийния контекст за 2024 г. Те са изключени от емисионните сборове на операторите, KPI и сценарийните изчисления. По подразбиране са изключени от емисионните клъстери и могат да се покажат само за визуално сравнение.`),
        'geo.verifiedEmissions': copy('2025 verified emissions', 'Верифицирани емисии за 2025 г.'),
        'geo.approximateNote': copy('Approximate settlement or industrial-zone locations, not cadastral boundaries. Numbering identifies records, not a ranking. Small open circles indicate missing emissions; zero emissions remain zero.', 'Приблизителни местоположения на населени места или промишлени зони, а не кадастрални граници. Номерата обозначават записи, а не класация. Малки празни кръгове означават липса на данни за емисии; нулевите емисии са запазени като 0.'),
        'geo.bubbleDesc': copy('Bubbles use available 2025 emissions. Filter by main activity or group the operators by activity, sector or region.', 'Кръговете използват наличните емисии за 2025 г. Филтрирайте по основна дейност или групирайте операторите по дейност, сектор или регион.'),
        'geo.bubbleAria': copy('Operator clusters using 2025 emissions', 'Клъстери на операторите с емисии за 2025 г.'),
        'geo.sizeKey': copy('Size reflects available 2025 emissions; minimum size for zero or missing values', 'Размер според наличните емисии за 2025 г.; минимален размер при нула или липса на данни'),
        'geo.regionalDistributionDesc': copy('Available 2025 emissions of mapped operators in the current filter.', 'Налични емисии за 2025 г. на операторите на картата според текущия филтър.'),
        'geo.nuts2024': 'NUTS 2 · 2025',
      };
      if (labels[key]) return labels[key];
    }
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

  // Picks black or white marker-rank text from the marker's ACTUAL resolved color
  // (not a hardcoded per-sector guess), so it stays legible if the palette changes,
  // e.g. dark mode's lighter/pastel chart colors (see --chart-* in style.css).
  function readableTextColor(hexColor) {
    const hex = String(hexColor || '').replace('#', '');
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    if (!/^[0-9a-f]{6}$/i.test(full)) return '#ffffff';
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
    const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    // Contrast against white (luminance 1) vs black (luminance 0) per WCAG's formula;
    // pick whichever clears the higher ratio.
    const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);
    const contrastWithBlack = (luminance + 0.05) / 0.05;
    return contrastWithBlack >= contrastWithWhite ? '#231720' : '#ffffff';
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
      sectors: {
        Chemicals: cssVar('--chart-chemical', '#15803d'),
        'Mineral Materials': cssVar('--chart-mineral', '#2563eb'),
        Metals: cssVar('--chart-metal', '#dc2626'),
        'Other Manufacturing': cssVar('--chart-nonenergy', '#d97706'),
      },
      context: {
        power_heat: {
          fill: cssVar('--geo-context-power-fill', '#f2dca5'),
          line: cssVar('--geo-context-power-line', '#9a6700'),
          symbol: 'square',
        },
        district_heating: {
          fill: cssVar('--geo-context-heat-fill', '#bfe3df'),
          line: cssVar('--geo-context-heat-line', '#0f766e'),
          symbol: 'diamond',
        },
      },
    };
  }

  function getCompanies(year = 2024) {
    if (!Data?.createDefaultCompanies) return [];
    if (Number(year) === 2025 && Data.createCompanyRoster) {
      return Data.createCompanyRoster().filter(company => company.geography).map((company, index) => ({
        ...company, displayYear: 2025, displayOrder: index + 1,
        displayEmissionsKt: company.verifiedEmissions2025T == null ? null : company.verifiedEmissions2025T / 1000,
      }));
    }
    return Data.createDefaultCompanies()
      .filter((company) => Number.isFinite(Number(company.etsRank2024)) && company.geography)
      .sort((a, b) => Number(a.etsRank2024) - Number(b.etsRank2024));
  }

  function getRegions() {
    const regions = Array.isArray(Data?.STATISTICAL_REGIONS) ? Data.STATISTICAL_REGIONS : [];
    const regionsById = new Map(regions.map((region) => [region.id, region]));
    return REGION_VISUAL_ORDER.map((id) => regionsById.get(id)).filter(Boolean);
  }

  function getContextInstallations() {
    return Array.isArray(Data?.GEOGRAPHY_CONTEXT_INSTALLATIONS)
      ? Data.GEOGRAPHY_CONTEXT_INSTALLATIONS.slice()
      : [];
  }

  function getRegionName(regionId) {
    const region = getRegions().find((item) => item.id === regionId);
    return region ? localize(region.name) : regionId;
  }

  function getSectorName(sector) {
    const suffix = SECTOR_KEYS[sector];
    return suffix ? t(`geo.sector.${suffix}`) : sector;
  }

  function getContextCategoryName(category) {
    return category === 'district_heating' ? t('geo.districtHeating') : t('geo.powerHeat');
  }

  function numberFormat(value, options = {}) {
    const language = I18n?.getLanguage?.() === 'bg' ? 'bg-BG' : 'en-GB';
    return new Intl.NumberFormat(language, options).format(Number(value) || 0);
  }

  function formatKt(value, digits = 0) {
    return numberFormat(value, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  function formatMt(value) {
    return numberFormat((Number(value) || 0) / 1000, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function sumEmissions(companies) {
    return companies.reduce((sum, company) => sum + emissionsValue(company), 0);
  }

  function emissionsValue(company) {
    return company.displayYear === 2025 ? Number(company.displayEmissionsKt || 0) : Number(company.emissions2024Kt || company.emissionsKt || 0);
  }
  function emissionsLabel(company) {
    return company.displayYear === 2025 && company.displayEmissionsKt == null ? copy('Not available', 'Няма данни') : formatKt(emissionsValue(company), 3);
  }
  function emissionsSummary(companies) {
    const missing = companies.filter(company => company.displayYear === 2025 && company.displayEmissionsKt == null).length;
    if (missing && missing === companies.length) return copy('Not available', 'Няма данни');
    return `${formatKt(sumEmissions(companies))} kt${missing ? copy(` · ${missing} missing`, ` · ${missing} без данни`) : ''}`;
  }
  function operatorName(company) {
    return I18n?.getLanguage?.() === 'bg' && company.companyBg ? company.companyBg : company.installationName || company.company;
  }
  function recordNumber(company) { return company.displayYear === 2025 ? company.displayOrder : company.etsRank2024; }

  function sectorSummary(companies) {
    return SECTOR_ORDER.map((sector) => {
      const members = companies.filter((company) => company.clusterSector === sector);
      return { sector, count: members.length, emissionsKt: sumEmissions(members) };
    }).filter((item) => item.count > 0);
  }

  function regionSummary(companies) {
    return getRegions().map((region) => {
      const members = companies.filter((company) => company.geography.regionId === region.id);
      return { region, count: members.length, emissionsKt: sumEmissions(members) };
    });
  }

  function contextSummary(installations = getContextInstallations()) {
    return CONTEXT_ORDER.map((category) => ({
      category,
      count: installations.filter((installation) => installation.category === category).length,
    }));
  }

  function contextEmissionsLabel(installation) {
    if (installation.verifiedEmissions2024T != null && Number.isFinite(Number(installation.verifiedEmissions2024T))) {
      return `${formatKt(Number(installation.verifiedEmissions2024T) / 1000, 3)} kt CO2e`;
    }
    if (installation.estimatedEmissions2024T != null && Number.isFinite(Number(installation.estimatedEmissions2024T))) {
      return `${formatKt(Number(installation.estimatedEmissions2024T) / 1000, 3)} kt CO2e (${t('geo.estimated')})`;
    }
    return t('general.notAvailable');
  }

  function contextEmissionsKt(installation) {
    const tonnes = installation.verifiedEmissions2024T != null
      ? Number(installation.verifiedEmissions2024T)
      : Number(installation.estimatedEmissions2024T);
    return Number.isFinite(tonnes) ? tonnes / 1000 : 0;
  }

  function contextGroupKey(category) {
    return `context:${category}`;
  }

  function createContextBubbleItems(installations) {
    return installations.map((installation) => ({
      id: installation.id,
      contextOnly: true,
      analysisIncluded: false,
      category: installation.category,
      company: localize(installation.name),
      installationName: localize(installation.name),
      clusterSector: contextGroupKey(installation.category),
      specificSector: getContextCategoryName(installation.category),
      emissions2024Kt: contextEmissionsKt(installation),
      emissionsLabel: contextEmissionsLabel(installation),
      geography: {
        locality: localize(installation.locality),
        district: installation.district,
        regionId: installation.regionId,
      },
    }));
  }

  function markerSize(company, maxEmissions, min = 17, range = 11) {
    const emissions = emissionsValue(company);
    return min + range * Math.sqrt(emissions / Math.max(maxEmissions, 1));
  }

  function mapPixelMetrics(viewport = {}) {
    const viewportWidth = Math.max(320, Number(viewport.width) || 900);
    const viewportHeight = Math.max(360, Number(viewport.height) || 500);
    const plotWidth = Math.max(280, viewportWidth - 24);
    const plotHeight = Math.max(320, viewportHeight - 16);
    const xSpan = MAP_BOUNDS.xMax - MAP_BOUNDS.xMin;
    const ySpan = MAP_BOUNDS.yMax - MAP_BOUNDS.yMin;
    const xPixelsPerDegree = Math.min(
      plotWidth / xSpan,
      plotHeight / (ySpan * MAP_Y_SCALE_RATIO)
    );
    const yPixelsPerDegree = xPixelsPerDegree * MAP_Y_SCALE_RATIO;
    const mapWidth = xSpan * xPixelsPerDegree;
    const mapHeight = ySpan * yPixelsPerDegree;
    const offsetX = (plotWidth - mapWidth) / 2;
    const offsetY = (plotHeight - mapHeight) / 2;

    return {
      plotWidth,
      plotHeight,
      xPixelsPerDegree,
      yPixelsPerDegree,
      offsetX,
      offsetY,
      mapWidth,
      mapHeight,
    };
  }

  function resolveMapMarkerCollisions(items, viewport = {}) {
    const metrics = mapPixelMetrics(viewport);
    const placements = new Map();
    const placed = [];
    const goldenAngle = 2.399963229728653;
    const orderedItems = items
      .map((item, sourceIndex) => ({ ...item, sourceIndex }))
      .sort((a, b) => Number(a.priority || 999) - Number(b.priority || 999)
        || Number(b.markerSize || 0) - Number(a.markerSize || 0)
        || String(a.id).localeCompare(String(b.id)));

    const toPixels = (longitude, latitude) => ({
      x: metrics.offsetX + (Number(longitude) - MAP_BOUNDS.xMin) * metrics.xPixelsPerDegree,
      y: metrics.offsetY + (Number(latitude) - MAP_BOUNDS.yMin) * metrics.yPixelsPerDegree,
    });
    const toCoordinates = (x, y) => ({
      x: MAP_BOUNDS.xMin + (x - metrics.offsetX) / metrics.xPixelsPerDegree,
      y: MAP_BOUNDS.yMin + (y - metrics.offsetY) / metrics.yPixelsPerDegree,
    });
    const isInsideMapFrame = (candidate, radius) => (
      candidate.x - radius >= metrics.offsetX
      && candidate.x + radius <= metrics.offsetX + metrics.mapWidth
      && candidate.y - radius >= metrics.offsetY
      && candidate.y + radius <= metrics.offsetY + metrics.mapHeight
    );
    const isFree = (candidate, radius) => placed.every((other) => (
      Math.hypot(candidate.x - other.pixelX, candidate.y - other.pixelY)
        >= radius + other.radius + MAP_MARKER_GAP_PX
    ));

    orderedItems.forEach((item, orderedIndex) => {
      const anchor = toPixels(item.longitude, item.latitude);
      const radius = Math.max(5, Number(item.markerSize || 10) / 2);
      const maxCandidates = Math.max(900, orderedItems.length * 40);
      let selected = null;

      for (let attempt = 0; attempt < maxCandidates; attempt += 1) {
        const distance = attempt === 0 ? 0 : 3 + Math.sqrt(attempt) * 4.2;
        const angle = attempt * goldenAngle + orderedIndex * 0.37;
        const candidate = {
          x: anchor.x + Math.cos(angle) * distance,
          y: anchor.y + Math.sin(angle) * distance,
        };
        if (isInsideMapFrame(candidate, radius) && isFree(candidate, radius)) {
          selected = candidate;
          break;
        }
      }

      if (!selected) {
        let fallbackDistance = Infinity;
        const step = Math.max(8, radius);
        for (let y = metrics.offsetY + radius; y <= metrics.offsetY + metrics.mapHeight - radius; y += step) {
          for (let x = metrics.offsetX + radius; x <= metrics.offsetX + metrics.mapWidth - radius; x += step) {
            const candidate = { x, y };
            const distance = Math.hypot(candidate.x - anchor.x, candidate.y - anchor.y);
            if (distance < fallbackDistance && isFree(candidate, radius)) {
              selected = candidate;
              fallbackDistance = distance;
            }
          }
        }
      }

      selected ||= anchor;
      const coordinates = toCoordinates(selected.x, selected.y);
      const displacementPx = Math.hypot(selected.x - anchor.x, selected.y - anchor.y);
      const placement = {
        x: coordinates.x,
        y: coordinates.y,
        originalX: Number(item.longitude),
        originalY: Number(item.latitude),
        pixelX: selected.x,
        pixelY: selected.y,
        radius,
        displacementPx,
        displaced: displacementPx > 0.75,
      };
      placements.set(item.id, placement);
      placed.push(placement);
    });

    return placements;
  }

  function mapTraces(companies, theme = getTheme(), contextInstallations = getContextInstallations(), viewport = {}) {
    const maxEmissions = Math.max(...companies.map((company) => emissionsValue(company)), 1);
    const analysisMapItems = companies.map((company) => ({
      id: company.id,
      longitude: company.geography.longitude,
      latitude: company.geography.latitude,
      markerSize: markerSize(company, maxEmissions),
      priority: Number(company.etsRank2024 || 50),
    }));
    const contextMapItems = contextInstallations.map((installation, index) => ({
      id: installation.id,
      longitude: installation.longitude,
      latitude: installation.latitude,
      markerSize: installation.category === 'power_heat' ? 12 : 10,
      priority: 100 + index,
    }));
    const mapItems = analysisMapItems.concat(contextMapItems);
    const placements = resolveMapMarkerCollisions(mapItems, viewport);
    const traces = [{
      type: 'scatter',
      mode: 'lines',
      x: BULGARIA_OUTLINE.map((point) => point[0]),
      y: BULGARIA_OUTLINE.map((point) => point[1]),
      fill: 'toself',
      fillcolor: theme.mapFill,
      line: { color: theme.border, width: 1.5 },
      hoverinfo: 'skip',
      showlegend: false,
      name: t('geo.bulgaria'),
      meta: { layer: 'base' },
    }];

    const displacedItems = mapItems.filter((item) => placements.get(item.id)?.displaced);
    traces.push({
      type: 'scatter',
      mode: 'lines',
      x: displacedItems.flatMap((item) => {
        const placement = placements.get(item.id);
        return [placement.originalX, placement.x, null];
      }),
      y: displacedItems.flatMap((item) => {
        const placement = placements.get(item.id);
        return [placement.originalY, placement.y, null];
      }),
      line: { color: theme.faint, width: 1, dash: 'dot' },
      opacity: 0.48,
      hoverinfo: 'skip',
      showlegend: false,
      name: t('geo.displacementGuides'),
      meta: { layer: 'collision-guides', analysisIncluded: false },
    });

    CONTEXT_ORDER.forEach((category) => {
      const members = contextInstallations.filter((installation) => installation.category === category);
      if (!members.length) return;
      const styling = theme.context[category];
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: members.map((installation) => placements.get(installation.id).x),
        y: members.map((installation) => placements.get(installation.id).y),
        marker: {
          size: category === 'power_heat' ? 12 : 10,
          symbol: styling.symbol,
          color: styling.fill,
          opacity: 0.82,
          line: { color: styling.line, width: 1.5 },
        },
        customdata: members.map((installation) => [
          localize(installation.name),
          localize(installation.locality),
          installation.district,
          getRegionName(installation.regionId),
          getContextCategoryName(category),
          contextEmissionsLabel(installation),
          t('geo.contextHoverNote'),
        ]),
        hovertemplate: `<b>%{customdata[0]}</b><br>${t('geo.location')}: %{customdata[1]}, %{customdata[2]}<br>${t('geo.region')}: %{customdata[3]}<br>${t('geo.contextCategory')}: %{customdata[4]}<br>${I18n.t('geo.verifiedEmissions')}: %{customdata[5]}<br><b>%{customdata[6]}</b><extra></extra>`,
        name: getContextCategoryName(category),
        showlegend: false,
        meta: { layer: 'context', contextOnly: true, analysisIncluded: false, category },
      });
    });

    sectorSummary(companies).forEach(({ sector }) => {
      const members = companies.filter((company) => company.clusterSector === sector);
      traces.push({
        type: 'scatter',
        mode: 'markers+text',
        x: members.map((company) => placements.get(company.id).x),
        y: members.map((company) => placements.get(company.id).y),
        text: members.map((company) => String(recordNumber(company))),
        textposition: 'middle center',
        textfont: { color: readableTextColor(theme.sectors[sector]), size: 9, family: 'DM Sans, sans-serif' },
        marker: {
          size: members.map((company) => markerSize(company, maxEmissions)),
          symbol: members.map(company => company.displayYear === 2025 && company.displayEmissionsKt == null ? 'circle-open' : 'circle'),
          color: theme.sectors[sector],
          opacity: 0.94,
          line: { color: theme.surface, width: 2 },
        },
        customdata: members.map((company) => [
          recordNumber(company),
          operatorName(company),
          company.geography.locality,
          company.geography.district,
          getRegionName(company.geography.regionId),
          company.specificSector,
          emissionsLabel(company),
        ]),
        hovertemplate: `<b>#%{customdata[0]} %{customdata[1]}</b><br>${t('geo.location')}: %{customdata[2]}, %{customdata[3]}<br>${t('geo.region')}: %{customdata[4]}<br>${t('geo.specificSector')}: %{customdata[5]}<br>${t('geo.verifiedEmissions')}: %{customdata[6]} kt CO2e<extra></extra>`,
        name: getSectorName(sector),
        showlegend: false,
        meta: { layer: 'analysis', analysisIncluded: true, sector },
      });
    });

    return traces;
  }

  function clusterDefinition(mode, key, withContext = false) {
    if (mode === 'region') return REGION_LAYOUT[key];
    return withContext ? SECTOR_CONTEXT_LAYOUT[key] : SECTOR_LAYOUT[key];
  }

  function clusteredPosition(index, count, definition) {
    if (index === 0) return { x: definition.x, y: definition.y };
    const angle = index * 2.399963229728653 + count * 0.17;
    const radialShare = Math.min(0.78, 0.25 + Math.sqrt(index / Math.max(count - 1, 1)) * 0.53);
    const radius = definition.radius * radialShare;
    return {
      x: definition.x + Math.cos(angle) * radius,
      y: definition.y + Math.sin(angle) * radius,
    };
  }

  function bubbleDiameter(item, maxEmissions) {
    const emissions = emissionsValue(item);
    if (emissions <= 0) return 12;
    return 18 + 66 * Math.sqrt(emissions / Math.max(maxEmissions, 1));
  }

  function bubbleModel(companies, mode = clusterMode, theme = getTheme(), options = {}) {
    const analyticalCompanies = Array.isArray(companies) ? companies : [];
    const contextItems = options.includeContext === true
      ? createContextBubbleItems(options.contextInstallations || getContextInstallations())
      : [];
    const allItems = analyticalCompanies.concat(contextItems);
    const withContext = contextItems.length > 0;
    const activityColumns = Number(root.innerWidth) > 0 && Number(root.innerWidth) < 700 ? 2 : 3;
    const groupKey = item => mode === 'region' ? item.geography.regionId : mode === 'activity' ? (item.mainActivityId || item.clusterSector) : item.clusterSector;
    const groupKeys = mode === 'activity' ? [...new Set(allItems.map(groupKey))] : mode === 'region'
      ? getRegions().map((region) => region.id)
      : SECTOR_ORDER.filter((sector) => analyticalCompanies.some((company) => company.clusterSector === sector))
        .concat(CONTEXT_ORDER
          .filter((category) => contextItems.some((item) => item.category === category))
          .map(contextGroupKey));
    const positions = new Map();
    const definitionFor = key => {
      if (mode !== 'activity') return clusterDefinition(mode, key, withContext);
      const index = groupKeys.indexOf(key);
      const rows = Math.ceil(groupKeys.length / activityColumns);
      const step = 94 / rows;
      const labelY = 94 - step * Math.floor(index / activityColumns);
      return { x: (index % activityColumns + .5) * 100 / activityColumns, y: labelY - step * .4, radius: Math.min(7, step * .28), labelY };
    };

    groupKeys.forEach((key) => {
      const members = allItems
        .filter((item) => groupKey(item) === key)
        .sort((a, b) => emissionsValue(b) - emissionsValue(a) || String(a.id).localeCompare(String(b.id)));
      const definition = definitionFor(key);
      members.forEach((item, index) => positions.set(item.id, clusteredPosition(index, members.length, definition)));
    });

    const maxEmissions = Math.max(...allItems.map((item) => emissionsValue(item)), 1);
    const analysisTraces = sectorSummary(analyticalCompanies).map(({ sector }) => {
      const members = analyticalCompanies.filter((company) => company.clusterSector === sector);
      return {
        type: 'scatter',
        mode: 'markers+text',
        x: members.map((company) => positions.get(company.id).x),
        y: members.map((company) => positions.get(company.id).y),
        text: members.map((company) => String(recordNumber(company))),
        textposition: 'middle center',
        textfont: { color: readableTextColor(theme.sectors[sector]), size: 10, family: 'DM Sans, sans-serif' },
        marker: {
          sizemode: 'diameter',
          size: members.map((company) => bubbleDiameter(company, maxEmissions) * (mode === 'activity' ? .72 : 1)),
          symbol: members.map(company => company.displayYear === 2025 && company.displayEmissionsKt == null ? 'circle-open' : 'circle'),
          color: theme.sectors[sector],
          opacity: 0.88,
          line: { color: theme.surface, width: 2 },
        },
        customdata: members.map((company) => [
          recordNumber(company),
          operatorName(company),
          getSectorName(company.clusterSector),
          getRegionName(company.geography.regionId),
          company.geography.locality,
          emissionsLabel(company),
          numberFormat(company.displayYear === 2025 ? emissionsValue(company) / Math.max(sumEmissions(analyticalCompanies), 1) * 100 : Number(company.industrialShare2024 || 0), { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        ]),
        hovertemplate: `<b>#%{customdata[0]} %{customdata[1]}</b><br>${t('general.sector')}: %{customdata[2]}<br>${t('geo.region')}: %{customdata[3]}<br>${t('geo.location')}: %{customdata[4]}<br>${t('geo.verifiedEmissions')}: %{customdata[5]} kt CO2e<br>${t('geo.industryShare')}: %{customdata[6]}%<extra></extra>`,
        name: getSectorName(sector),
        showlegend: false,
        meta: { layer: 'analysis', analysisIncluded: true, sector },
      };
    });

    const contextTraces = CONTEXT_ORDER.map((category) => {
      const members = contextItems.filter((item) => item.category === category);
      if (!members.length) return null;
      const styling = theme.context[category];
      return {
        type: 'scatter',
        mode: 'markers',
        x: members.map((item) => positions.get(item.id).x),
        y: members.map((item) => positions.get(item.id).y),
        marker: {
          sizemode: 'diameter',
          size: members.map((item) => bubbleDiameter(item, maxEmissions)),
          symbol: styling.symbol,
          color: styling.fill,
          opacity: 0.78,
          line: { color: styling.line, width: 1.5 },
        },
        customdata: members.map((item) => [
          item.installationName,
          getContextCategoryName(category),
          getRegionName(item.geography.regionId),
          item.geography.locality,
          item.emissionsLabel,
          t('geo.contextHoverNote'),
        ]),
        hovertemplate: `<b>%{customdata[0]}</b><br>${t('geo.contextCategory')}: %{customdata[1]}<br>${t('geo.region')}: %{customdata[2]}<br>${t('geo.location')}: %{customdata[3]}<br>${I18n.t('geo.verifiedEmissions')}: %{customdata[4]}<br><b>%{customdata[5]}</b><extra></extra>`,
        name: getContextCategoryName(category),
        showlegend: false,
        meta: { layer: 'context', contextOnly: true, analysisIncluded: false, category },
      };
    }).filter(Boolean);

    const traces = analysisTraces.concat(contextTraces);

    const groups = groupKeys.map((key) => {
      const members = allItems.filter((item) => groupKey(item) === key);
      const definition = definitionFor(key);
      const contextOnly = members.length > 0 && members.every((item) => item.contextOnly === true);
      const year = contextOnly ? 2024 : analyticalCompanies.some(company => company.displayYear === 2025) ? 2025 : 2024;
      const emissionsMembers = year === 2025 ? members.filter(item => !item.contextOnly) : members;
      return {
        key,
        definition,
        count: members.length,
        emissionsKt: sumEmissions(emissionsMembers),
        emissionsText: emissionsSummary(emissionsMembers),
        year,
        contextCount: members.filter((item) => item.contextOnly === true).length,
        contextOnly,
        name: mode === 'activity' && !contextOnly ? localize(members[0]?.mainActivity || members[0]?.sector || key) : mode === 'region'
          ? getRegionName(key)
          : contextOnly
            ? getContextCategoryName(key.slice('context:'.length))
            : getSectorName(key),
      };
    });

    const shapes = groups.map((group) => ({
      type: 'circle',
      xref: 'x',
      yref: 'y',
      x0: group.definition.x - group.definition.radius,
      x1: group.definition.x + group.definition.radius,
      y0: group.definition.y - group.definition.radius,
      y1: group.definition.y + group.definition.radius,
      fillcolor: 'rgba(148, 163, 184, 0.035)',
      line: { color: theme.divider, width: 1, dash: 'dot' },
      layer: 'below',
    }));

    const annotations = groups.map((group) => {
      const contextNote = group.contextOnly
        ? `<br><span style="font-size:9px">${escapeHtml(t('geo.contextNotAnalysed'))}</span>`
        : '';
      return {
        x: group.definition.x,
        y: group.definition.labelY,
        xref: 'x',
        yref: 'y',
        xanchor: 'center',
        yanchor: mode === 'activity' ? 'bottom' : 'middle',
        showarrow: false,
        align: 'center',
        text: `<b>${mode === 'activity' ? escapeHtml(group.name).replace(/((?:\S+\s+){2}\S+)\s/g, '$1<br>') : escapeHtml(group.name)}</b><br><span style="font-size:10px">${group.count} ${escapeHtml(t('geo.installationsShort'))} · ${escapeHtml(group.emissionsText)} · ${group.year}</span>${group.year === 2025 && group.contextCount ? `<br>${group.contextCount} ${escapeHtml(copy('context sites · 2024', 'контекстни площадки · 2024'))}` : ''}${contextNote}`,
        font: { color: theme.muted, size: mode === 'activity' ? 10 : 12, family: 'DM Sans, sans-serif' },
      };
    });

    return { traces, shapes, annotations, groups, positions };
  }

  function plotConfig() {
    // Both axes are fixedrange and scrollZoom is off, so zoom/pan buttons would be
    // dead UI - only the export-to-image button is left in the modebar.
    return {
      responsive: true,
      displaylogo: false,
      scrollZoom: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
    };
  }

  function observeMapSize(node) {
    if (typeof root.ResizeObserver !== 'function') return;
    if (!mapResizeObserver) {
      mapResizeObserver = new root.ResizeObserver((entries) => {
        const entry = entries.find((item) => item.target === observedMapNode);
        const width = Math.round(Number(entry?.contentRect?.width || observedMapNode?.clientWidth || 0));
        const height = Math.round(Number(entry?.contentRect?.height || observedMapNode?.clientHeight || 0));
        if (width < 100 || height < 100) return;
        if (Math.abs(width - observedMapWidth) < 4 && Math.abs(height - observedMapHeight) < 4) return;
        observedMapWidth = width;
        observedMapHeight = height;
        if (mapResizeFrame != null && typeof root.cancelAnimationFrame === 'function') {
          root.cancelAnimationFrame(mapResizeFrame);
        }
        const rerender = () => {
          mapResizeFrame = null;
          renderMap(getCompanies(displayYear).filter(company => activityFilter === 'all' || company.mainActivityId === activityFilter));
        };
        mapResizeFrame = typeof root.requestAnimationFrame === 'function'
          ? root.requestAnimationFrame(rerender)
          : root.setTimeout?.(rerender, 0);
      });
    }
    if (observedMapNode !== node) {
      mapResizeObserver.disconnect();
      observedMapNode = node;
      observedMapWidth = Math.round(Number(node.clientWidth || 0));
      observedMapHeight = Math.round(Number(node.clientHeight || 0));
      mapResizeObserver.observe(node);
    }
  }

  function renderMap(companies) {
    const node = root.document?.getElementById('industrialGeoMap');
    if (!node) return;
    if (!root.Plotly?.react) {
      node.innerHTML = `<div class="industrial-geo-empty">${escapeHtml(t('chart.plotlyMissing'))}</div>`;
      return;
    }
    const theme = getTheme();
    const plotHeight = Math.max(430, Number(node.clientHeight) || 500);
    const plotWidth = Math.max(320, Number(node.clientWidth) || 900);
    const traces = mapTraces(companies, theme, contextVisible ? getContextInstallations() : [], {
      width: plotWidth,
      height: plotHeight,
    });
    const drawing = root.Plotly.react(node, root.CoreI18n?.plotTraces(traces) || traces, {
      autosize: true,
      height: plotHeight,
      margin: { l: 12, r: 12, t: 8, b: 8 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      hoverlabel: { bgcolor: theme.surface, bordercolor: theme.border, font: { color: theme.text, family: 'DM Sans, sans-serif', size: 12 } },
      xaxis: { range: [MAP_BOUNDS.xMin, MAP_BOUNDS.xMax], visible: false, fixedrange: true, zeroline: false },
      yaxis: { range: [MAP_BOUNDS.yMin, MAP_BOUNDS.yMax], visible: false, fixedrange: true, zeroline: false, scaleanchor: 'x', scaleratio: MAP_Y_SCALE_RATIO },
      showlegend: false,
    }, plotConfig());
    if (drawing?.then) pendingPlots.set(node, drawing);
    observeMapSize(node);
  }

  function renderBubbles(companies) {
    const node = root.document?.getElementById('industrialGeoBubbles');
    if (!node) return;
    if (!root.Plotly?.react) {
      node.innerHTML = `<div class="industrial-geo-empty">${escapeHtml(t('chart.plotlyMissing'))}</div>`;
      return;
    }
    const theme = getTheme();
    const model = bubbleModel(companies, clusterMode, theme, {
      includeContext: contextVisible && includeContextInClusters,
      contextInstallations: getContextInstallations(),
    });
    const drawing = root.Plotly.react(node, root.CoreI18n?.plotTraces(model.traces) || model.traces, {
      autosize: true,
      height: clusterMode === 'activity' ? Math.max(720, Math.ceil(model.groups.length / (Number(root.innerWidth) < 700 ? 2 : 3)) * 220) : Math.max(500, Number(node.clientHeight) || 560),
      margin: { l: 8, r: 8, t: 14, b: 8 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      hoverlabel: { bgcolor: theme.surface, bordercolor: theme.border, font: { color: theme.text, family: 'DM Sans, sans-serif', size: 12 } },
      xaxis: { range: [0, 100], visible: false, fixedrange: true, zeroline: false },
      yaxis: { range: [0, 100], visible: false, fixedrange: true, zeroline: false },
      shapes: model.shapes,
      annotations: model.annotations,
      showlegend: false,
    }, plotConfig());
    if (drawing?.then) pendingPlots.set(node, drawing);
  }

  function legendHtml(companies, theme) {
    return sectorSummary(companies).map((item) => `
      <div class="industrial-geo-legend-item">
        <i style="--geo-sector-color:${escapeHtml(theme.sectors[item.sector])}"></i>
        <span>${escapeHtml(getSectorName(item.sector))}</span>
        <strong>${item.count}</strong>
        <small>${formatKt(item.emissionsKt)} kt</small>
      </div>
    `).join('');
  }

  function contextLegendHtml(installations, theme) {
    return contextSummary(installations).map((item) => {
      const styling = theme.context[item.category];
      const symbolClass = item.category === 'district_heating' ? 'diamond' : 'square';
      return `
        <div class="industrial-geo-context-legend-item">
          <i class="${symbolClass}" style="--geo-context-fill:${escapeHtml(styling.fill)};--geo-context-line:${escapeHtml(styling.line)}"></i>
          <span>${escapeHtml(getContextCategoryName(item.category))}</span>
          <strong>${item.count}</strong>
          <small>${escapeHtml(t('geo.contextNotAnalysed'))}</small>
        </div>
      `;
    }).join('');
  }

  function regionSummaryHtml(companies, totalEmissions) {
    return regionSummary(companies).map((item) => {
      const share = totalEmissions > 0 ? item.emissionsKt / totalEmissions * 100 : 0;
      return `
        <article class="industrial-geo-region-item">
          <div class="industrial-geo-region-code">${escapeHtml(item.region.id)}</div>
          <h3>${escapeHtml(localize(item.region.name))}</h3>
          <strong>${formatKt(item.emissionsKt)} <span>kt CO2e</span></strong>
          <div>${item.count} ${escapeHtml(t('geo.installationsShort'))} · ${numberFormat(share, { maximumFractionDigits: 1 })}%</div>
        </article>
      `;
    }).join('');
  }

  function purgePlots() {
    if (!root.Plotly?.purge || !root.document) return;
    ['industrialGeoMap', 'industrialGeoBubbles'].forEach((id) => {
      const node = root.document.getElementById(id);
      if (!node) return;
      const drawing = pendingPlots.get(node);
      // A replaced plot may still be calculating margins. Dispose after it settles.
      if (drawing) {
        pendingPlots.delete(node);
        drawing.then(() => root.Plotly?.purge?.(node), () => root.Plotly?.purge?.(node));
      } else root.Plotly.purge(node);
    });
    root.IndustrialInfrastructure?.purge?.();
  }

  function render() {
    const container = root.document?.getElementById('industrialGeographyGrid');
    if (!container) return;
    const roster = (Data.createCompanyRoster || Data.createDefaultCompanies)();
    const activities = [...new Map(roster.map(company => [company.mainActivityId, company.mainActivity || company.sector])).entries()];
    const companies = getCompanies(displayYear).map(company => ({ ...roster.find(entry => entry.id === company.id), ...company }))
      .filter(company => activityFilter === 'all' || company.mainActivityId === activityFilter);
    const directory = roster.filter(company => activityFilter === 'all' || company.mainActivityId === activityFilter);
    const contextInstallations = getContextInstallations();
    const contextCounts = Object.fromEntries(contextSummary(contextInstallations).map((item) => [item.category, item.count]));
    const totalEmissions = sumEmissions(companies);
    const largest = companies.reduce((best, company) => emissionsValue(company) > (best ? emissionsValue(best) : -1) ? company : best, null);
    const theme = getTheme();
    purgePlots();

    container.innerHTML = `
      <div class="company-registry-filters">
        <label>${escapeHtml(copy('Reporting year', 'Отчетна година'))}<select data-geo-year><option value="2025" ${displayYear === 2025 ? 'selected' : ''}>2025</option><option value="2024" ${displayYear === 2024 ? 'selected' : ''}>2024 · Top 20</option></select></label>
        <label>${escapeHtml(copy('Main activity', 'Основна дейност'))}<select data-geo-activity><option value="all">${escapeHtml(copy('All activities', 'Всички дейности'))}</option>${activities.map(([id, label]) => `<option value="${escapeHtml(id)}" ${activityFilter === id ? 'selected' : ''}>${escapeHtml(localize(label))}</option>`).join('')}</select></label>
      </div>
      <p class="industrial-geo-note">${escapeHtml(copy('2025 emissions and free allowances', 'Емисии и безплатни квоти за 2025 г.'))}: <a href="${Data.ETS_REGISTRY_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(copy('European Commission · EU ETS Union Registry', 'Европейска комисия · Регистър на Съюза по EU ETS'))}</a>. ${escapeHtml(copy('Missing values are excluded from emission totals. Profiles retain the available 2024 data.', 'Липсващите стойности не участват в сумите на емисиите. Профилите запазват наличните данни за 2024 г.'))}</p>
      <div class="industrial-geo-kpis" aria-label="${escapeHtml(t('geo.summary'))}">
        <div><strong>${companies.length}</strong><span>${escapeHtml(t('geo.installations'))}</span></div>
        <div><strong>${formatMt(totalEmissions)}</strong><span>${escapeHtml(t('geo.mtEmissions2024'))}</span></div>
        <div><strong>${sectorSummary(companies).length}</strong><span>${escapeHtml(t('geo.sectors'))}</span></div>
        <div><strong>${getRegions().length}</strong><span>${escapeHtml(t('geo.regions'))}</span></div>
      </div>

      <div class="industrial-geo-context-notice" role="note">
        <div class="industrial-geo-context-icon" aria-hidden="true">i</div>
        <div>
          <div class="industrial-geo-context-notice-head">
            <strong>${escapeHtml(t('geo.contextLayerTitle'))}</strong>
            <span>${escapeHtml(t('geo.contextBadge'))}</span>
          </div>
          <p>${escapeHtml(t('geo.contextLayerDesc', { count: contextInstallations.length, power: contextCounts.power_heat || 0, heat: contextCounts.district_heating || 0 }))}</p>
          <label class="industrial-geo-context-visibility">
            <input type="checkbox" data-geo-context-visible ${contextVisible ? 'checked' : ''}>
            <span><strong>${escapeHtml(t('geo.showContext'))}</strong><small>${escapeHtml(t('geo.showContextDesc'))}</small></span>
          </label>
        </div>
      </div>

      <section class="industrial-geo-panel" aria-labelledby="industrialGeoMapTitle">
        <header class="industrial-geo-panel-head">
          <div>
            <h2 id="industrialGeoMapTitle">${escapeHtml(t('geo.mapTitle'))}</h2>
            <p>${escapeHtml(t('geo.mapDesc'))}</p>
          </div>
          <div class="industrial-geo-panel-stat">
            <span>${escapeHtml(t('geo.largestEmitter'))}</span>
            <strong>${escapeHtml(largest ? operatorName(largest) : '—')}</strong>
          </div>
        </header>
        <div class="industrial-geo-plot industrial-geo-map" id="industrialGeoMap" role="img" aria-label="${escapeHtml(t('geo.mapAria'))}"></div>
        <div class="industrial-geo-legend" aria-label="${escapeHtml(t('geo.legendTitle'))}">
          <div class="industrial-geo-legend-title">${escapeHtml(t('geo.legendTitle'))}</div>
          ${legendHtml(companies, theme)}
        </div>
        ${contextVisible ? `<div class="industrial-geo-context-legend" aria-label="${escapeHtml(t('geo.contextLegendTitle'))}">
          <div class="industrial-geo-context-legend-title">
            <strong>${escapeHtml(t('geo.contextLegendTitle'))}</strong>
            <span>${escapeHtml(t('geo.contextNotAnalysedLong'))}</span>
          </div>
          ${contextLegendHtml(contextInstallations, theme)}
        </div>` : ''}
        <p class="industrial-geo-note">${escapeHtml(t('geo.approximateNote'))}</p>
      </section>

      <section class="industrial-geo-panel" aria-labelledby="industrialGeoBubbleTitle">
        <header class="industrial-geo-panel-head industrial-geo-bubble-head">
          <div>
            <h2 id="industrialGeoBubbleTitle">${escapeHtml(t('geo.bubbleTitle'))}</h2>
            <p>${escapeHtml(t('geo.bubbleDesc'))}</p>
          </div>
          <div class="industrial-geo-bubble-controls">
            <div class="industrial-geo-mode-control" role="group" aria-label="${escapeHtml(t('geo.clusterBy'))}">
              <span>${escapeHtml(t('geo.clusterBy'))}</span>
              <div>
                <button type="button" data-geo-cluster-mode="sector" class="${clusterMode === 'sector' ? 'active' : ''}" aria-pressed="${clusterMode === 'sector'}">${escapeHtml(t('geo.bySector'))}</button>
                <button type="button" data-geo-cluster-mode="region" class="${clusterMode === 'region' ? 'active' : ''}" aria-pressed="${clusterMode === 'region'}">${escapeHtml(t('geo.byRegion'))}</button>
                <button type="button" data-geo-cluster-mode="activity" class="${clusterMode === 'activity' ? 'active' : ''}" aria-pressed="${clusterMode === 'activity'}">${escapeHtml(copy('Main activity', 'Основна дейност'))}</button>
              </div>
            </div>
            <label class="industrial-geo-cluster-context-toggle">
              <input type="checkbox" data-geo-context-clusters ${includeContextInClusters ? 'checked' : ''} ${contextVisible ? '' : 'disabled'}>
              <span>
                <strong>${escapeHtml(t('geo.includeContextClusters'))}</strong>
                <small>${escapeHtml(t('geo.includeContextClustersDesc'))}</small>
              </span>
            </label>
          </div>
        </header>
        <div class="industrial-geo-plot industrial-geo-bubbles" id="industrialGeoBubbles" style="${clusterMode === 'activity' ? 'height:auto;min-height:800px' : ''}" role="img" aria-label="${escapeHtml(t('geo.bubbleAria'))}"></div>
        <div class="industrial-geo-size-key"><i></i><i></i><i></i><span>${escapeHtml(t('geo.sizeKey'))}</span></div>
      </section>

      <section class="industrial-geo-region-band" aria-labelledby="industrialGeoRegionsTitle">
        <div class="industrial-geo-region-head">
          <div>
            <h2 id="industrialGeoRegionsTitle">${escapeHtml(t('geo.regionalDistribution'))}</h2>
            <p>${escapeHtml(t('geo.regionalDistributionDesc'))}</p>
          </div>
          <span>${escapeHtml(t('geo.nuts2024'))}</span>
        </div>
        <div class="industrial-geo-region-grid">${regionSummaryHtml(companies, totalEmissions)}</div>
      </section>

      <section class="industrial-geo-panel"><header class="industrial-geo-panel-head"><div><h2>${escapeHtml(copy('Operator directory', 'Регистър на операторите'))} · ${directory.length}</h2><p>${escapeHtml(copy('All profiles, including operators whose site is not uniquely identified. Use the company name to open its profile.', 'Всички профили, включително операторите с неуточнена площадка. Отворете профил чрез името на компанията.'))}</p></div></header>
        <div class="company-registry-scroll"><table class="company-registry-table"><thead><tr><th>${escapeHtml(copy('Operator', 'Оператор'))}</th><th>${escapeHtml(copy('Main activity', 'Основна дейност'))}</th><th>${escapeHtml(copy('Location', 'Местоположение'))}</th><th>2025 · t CO₂e</th><th>2025 · EUA</th></tr></thead><tbody>${directory.map(company => `<tr><th><button class="cluster-table-link" type="button" data-geo-profile="${escapeHtml(company.id)}">${escapeHtml(operatorName(company))}</button></th><td>${escapeHtml(localize(company.mainActivity))}</td><td>${escapeHtml(company.geography ? localize(I18n?.getLanguage?.() === 'bg' ? company.geography.localityBg || company.geography.locality : company.geography.locality) : copy('Site to be confirmed', 'Площадка за уточняване'))}</td><td>${company.verifiedEmissions2025T == null ? escapeHtml(copy('Not available', 'Няма данни')) : numberFormat(company.verifiedEmissions2025T)}</td><td>${company.freeAllowances2025Eua == null ? escapeHtml(copy('Not available', 'Няма данни')) : numberFormat(company.freeAllowances2025Eua)}</td></tr>`).join('')}</tbody></table></div>
      </section>
      <p class="industrial-geo-note">${escapeHtml(copy('Infrastructure planning below retains its assessed 2024 baseline.', 'Инфраструктурното планиране по-долу запазва оценената си база за 2024 г.'))}</p>
      <div id="industrialInfrastructurePlanning"></div>

      <div class="industrial-geo-sources">
        <span>${escapeHtml(t('general.source'))}:</span>
        <a href="https://www.nsi.bg/nrnm/special/ekatte/areas-level-two" target="_blank" rel="noopener noreferrer">${escapeHtml(t('geo.sourceNsi'))}</a>
        <a href="${Data.ETS_REGISTRY_URL}" target="_blank" rel="noopener noreferrer">EU ETS · Union Registry</a>
        <a href="https://eea.government.bg/verificirani-godishni-dokladi-2024-1" target="_blank" rel="noopener noreferrer">${escapeHtml(t('geo.sourceIaos'))}</a>
        <a href="https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/" target="_blank" rel="noopener noreferrer">${escapeHtml(t('geo.sourceGeometry'))}</a>
        <span>${escapeHtml(t('geo.nutsNote'))}</span>
      </div>
    `;

    container.querySelectorAll('[data-geo-cluster-mode]').forEach((button) => {
      button.addEventListener('click', () => setClusterMode(button.dataset.geoClusterMode));
    });
    container.querySelector?.('[data-geo-context-clusters]')?.addEventListener('change', (event) => {
      setIncludeContextInClusters(event.currentTarget.checked);
    });
    container.querySelector?.('[data-geo-context-visible]')?.addEventListener('change', (event) => {
      setContextVisible(event.currentTarget.checked);
    });
    container.querySelector?.('[data-geo-year]')?.addEventListener('change', event => { displayYear = Number(event.target.value) === 2024 ? 2024 : 2025; render(); });
    container.querySelector?.('[data-geo-activity]')?.addEventListener('change', event => { activityFilter = event.target.value; render(); });
    container.querySelectorAll('[data-geo-profile]').forEach(button => button.addEventListener('click', () => root.openCompanyModal?.(button.dataset.geoProfile)));
    renderMap(companies);
    renderBubbles(companies);
    root.IndustrialInfrastructure?.render?.({
      containerId: 'industrialInfrastructurePlanning',
      companies: getCompanies(2024),
      contextInstallations: contextVisible ? contextInstallations : [],
      theme,
    });
  }

  function setClusterMode(mode) {
    clusterMode = ['region', 'activity'].includes(mode) ? mode : 'sector';
    render();
  }

  function getClusterMode() {
    return clusterMode;
  }

  function setIncludeContextInClusters(value) {
    includeContextInClusters = value === true;
    render();
  }

  function getIncludeContextInClusters() {
    return includeContextInClusters;
  }

  function setContextVisible(value) {
    contextVisible = value === true;
    render();
  }

  function getContextVisible() {
    return contextVisible;
  }

  return Object.freeze({
    render,
    setClusterMode,
    getClusterMode,
    setIncludeContextInClusters,
    getIncludeContextInClusters,
    setContextVisible,
    getContextVisible,
    getCompanies,
    getContextInstallations,
    mapTraces,
    bubbleModel,
    sumEmissions,
    sectorSummary,
    regionSummary,
    contextSummary,
    resolveMapMarkerCollisions,
    BULGARIA_OUTLINE,
  });
});
