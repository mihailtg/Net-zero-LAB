(function initIndustrialInvestment(root, factory) {
  const api = factory(root, root.ClusterData, root.ClusterI18n);
  root.IndustrialInvestment = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createIndustrialInvestment(root, Data, I18n) {
  'use strict';

  const PHASES = ['2030', '2040'];
  const BREAKDOWNS = ['technology', 'sector', 'region'];
  const MILESTONE_YEARS = [2026, 2030, 2035, 2040, 2045, 2050];
  const REGION_ORDER = ['BG31', 'BG32', 'BG33', 'BG41', 'BG42', 'BG34'];
  const SECTOR_ORDER = ['Chemicals', 'Mineral Materials', 'Metals', 'Other Manufacturing', 'System enablers'];
  const SCOPE_ORDER = ['direct', 'shared', 'system'];

  const COPY = {
    en: {
      title: 'Investment and technology readiness outlook',
      desc: 'Bottom-up screening of the capital required to decarbonise the 20 analysed ETS installations and the shared infrastructure that makes the plant investments possible.',
      badge: 'Screening model · 2025 EUR',
      range: 'Portfolio CAPEX range',
      central: 'central estimate',
      direct: 'Direct plant CAPEX',
      shared: 'Shared infrastructure',
      system: 'Power-system enablers',
      by2030: 'Investment mobilised by 2030',
      abatement: 'Modelled 2050 reduction',
      residual: 'residual',
      phase: 'Hydrogen build-out',
      phase2030: '2030 · 1.1 GW',
      phase2040: '2040 · 2.7 GW',
      reactors: 'New 1,000 MW reactors',
      reactorsNote: 'Each step adds one 1,000 MW unit. Nuclear CAPEX has its own "Power-system enablers" KPI card above, but is included in the combined portfolio total.',
      breakdown: 'CAPEX breakdown',
      technology: 'Technology',
      sector: 'Sector',
      region: 'Region',
      chartDesc: 'Central estimate with the low-to-high screening range.',
      emissionsTitle: 'Availability-to-emissions pathway',
      emissionsDesc: 'Residual 2024 ETS baseline after enabled technologies become available and deployment ramps up.',
      baseline: '2024 baseline',
      modeledResidual: 'Modelled residual emissions',
      timelineTitle: 'Earliest bankable deployment in Bulgaria',
      timelineDesc: 'The year is a modelled earliest deployment window, not a project commitment or probability forecast.',
      now: 'Available now',
      near: '2027-2030',
      medium: '2031-2035',
      later: '2036+',
      portfolioTitle: 'Technology portfolio',
      portfolioDesc: 'Switching a technology off recalculates CAPEX and emissions. Enabling assets do not receive an automatic direct-emissions benefit.',
      reset: 'Reset portfolio',
      scope: 'Scope',
      readiness: 'Readiness',
      earliest: 'Earliest BG deployment',
      build: 'Build and integration',
      capex: 'CAPEX range',
      impact: 'Annual emissions effect',
      confidence: 'Confidence',
      years: 'years',
      year: 'year',
      perYear: 'per year',
      perUnit: 'per 1,000 MW unit',
      directImpact: 'up to {value} kt CO2e/year',
      enablingImpact: 'enables up to {value} kt CO2e/year',
      noDirectImpact: 'enabling asset; no automatic direct reduction',
      conditional: 'conditional',
      methodTitle: 'How to read the estimate',
      method: 'Class 4/5 screening range in constant 2025 EUR. It includes equipment, installation and a broad project contingency, but excludes OPEX, energy purchases, financing costs, VAT, land and decommissioning. Shared assets are counted once. Technology contributions are capped against each broad sector baseline and dependencies prevent double counting of hydrogen and CCS infrastructure.',
      electricityNote: 'At {capacity} MW and 70% utilisation, electrolysis uses about {electricity} TWh/year and produces {hydrogen} kt H2/year. A solar-only equivalent at an 18% capacity factor is {solar} MW before storage and grid constraints.',
      nuclearNote: 'New nuclear is treated as a power-system enabler. It can support electrification and hydrogen, but the model does not claim that every MWh automatically removes industrial ETS emissions.',
      source: 'Official calibration sources',
      lowHigh: 'low-high',
      chartMissing: 'The chart library is unavailable.',
      status_ready: 'Commercial now',
      status_scaling: 'Commercial · scaling',
      status_conditional: 'Early commercial · conditional',
      status_emerging: 'Demonstration / emerging',
      status_system: 'Mature system technology',
      scope_direct: 'Plant investment',
      scope_shared: 'Shared infrastructure',
      scope_system: 'Power system',
      Chemicals: 'Chemicals',
      'Mineral Materials': 'Mineral materials',
      Metals: 'Metals',
      'Other Manufacturing': 'Other manufacturing',
      'System enablers': 'System enablers',
    },
    bg: {
      title: 'Инвестиционна рамка и технологична готовност',
      desc: 'Оценка отдолу нагоре на капитала за декарбонизация на 20-те анализирани ETS инсталации и на споделената инфраструктура, която прави фирмените инвестиции възможни.',
      badge: 'Скринингов модел · евро 2025',
      range: 'Диапазон на CAPEX',
      central: 'централна оценка',
      direct: 'Директен CAPEX в заводите',
      shared: 'Споделена инфраструктура',
      system: 'Енергийни предпоставки',
      by2030: 'Мобилизирани до 2030 г.',
      abatement: 'Моделирано намаление през 2050 г.',
      residual: 'остатъчни',
      phase: 'Развитие на водорода',
      phase2030: '2030 · 1,1 GW',
      phase2040: '2040 · 2,7 GW',
      reactors: 'Нови реактори по 1 000 MW',
      reactorsNote: 'Всяка стъпка добавя един блок от 1 000 MW. Ядреният CAPEX има собствена карта "Енергийни предпоставки" по-горе, но е включен в общия сбор на портфолиото.',
      breakdown: 'Разпределение на CAPEX',
      technology: 'Технология',
      sector: 'Сектор',
      region: 'Регион',
      chartDesc: 'Централна оценка с нисък и висок скринингов диапазон.',
      emissionsTitle: 'От технологична наличност към емисии',
      emissionsDesc: 'Остатък от ETS базата за 2024 г., след като включените технологии станат достъпни и внедряването им нарасне.',
      baseline: 'База 2024',
      modeledResidual: 'Моделирани остатъчни емисии',
      timelineTitle: 'Най-ранно банково приложимо внедряване в България',
      timelineDesc: 'Годината е моделиран най-ранен прозорец, а не проектен ангажимент или вероятностна прогноза.',
      now: 'Налични сега',
      near: '2027-2030',
      medium: '2031-2035',
      later: '2036+',
      portfolioTitle: 'Технологичен портфейл',
      portfolioDesc: 'Изключването на технология преизчислява CAPEX и емисиите. Подпомагащите активи не получават автоматично директно намаление.',
      reset: 'Възстанови портфейла',
      scope: 'Обхват',
      readiness: 'Готовност',
      earliest: 'Най-рано в България',
      build: 'Строителство и интеграция',
      capex: 'Диапазон на CAPEX',
      impact: 'Годишен ефект върху емисиите',
      confidence: 'Надеждност',
      years: 'години',
      year: 'година',
      perYear: 'годишно',
      perUnit: 'за блок от 1 000 MW',
      directImpact: 'до {value} kt CO2e/год.',
      enablingImpact: 'отключва до {value} kt CO2e/год.',
      noDirectImpact: 'подпомагащ актив; без автоматична директна редукция',
      conditional: 'условно',
      methodTitle: 'Как да се чете оценката',
      method: 'Скринингов диапазон клас 4/5 в постоянни евро за 2025 г. Включва оборудване, монтаж и общ резерв за проекта, но изключва OPEX, покупки на енергия, финансови разходи, ДДС, земя и извеждане от експлоатация. Споделените активи се броят веднъж. Приносът на технологиите е ограничен спрямо базата на всеки широк сектор, а зависимостите предотвратяват двойно броене при водорода и CCS.',
      electricityNote: 'При {capacity} MW и 70% използваемост електролизата потребява около {electricity} TWh/год. и произвежда {hydrogen} kt H2/год. Соларният еквивалент при 18% капацитетен фактор е {solar} MW преди ограниченията от съхранение и мрежа.',
      nuclearNote: 'Новата ядрена мощност се отчита като енергийна предпоставка. Тя може да подпомага електрификацията и водорода, но моделът не приема, че всеки MWh автоматично премахва индустриални ETS емисии.',
      source: 'Официални източници за калибриране',
      lowHigh: 'нисък-висок',
      chartMissing: 'Библиотеката за графики не е достъпна.',
      status_ready: 'Търговска сега',
      status_scaling: 'Търговска · мащабиране',
      status_conditional: 'Ранно търговска · условна',
      status_emerging: 'Демонстрационна / развиваща се',
      status_system: 'Зряла системна технология',
      scope_direct: 'Инвестиция в завод',
      scope_shared: 'Споделена инфраструктура',
      scope_system: 'Енергийна система',
      Chemicals: 'Химическа промишленост',
      'Mineral Materials': 'Минерални материали',
      Metals: 'Метали',
      'Other Manufacturing': 'Друга промишленост',
      'System enablers': 'Системни предпоставки',
    },
  };

  const TECHNOLOGY_COPY = {
    efficiency: {
      name: { en: 'Efficiency, controls and waste-heat recovery', bg: 'Ефективност, управление и оползотворяване на отпадна топлина' },
      note: { en: 'Plant-wide optimisation, insulation, heat integration, ORC and digital energy management.', bg: 'Оптимизация на ниво завод, изолация, топлинна интеграция, ORC и дигитално енергийно управление.' },
    },
    n2o: {
      name: { en: 'Catalytic N2O abatement', bg: 'Каталитично намаляване на N2O' },
      note: { en: 'Primary, secondary or tail-gas catalyst systems at nitric-acid production.', bg: 'Първични, вторични или крайни каталитични системи при производството на азотна киселина.' },
    },
    circular: {
      name: { en: 'Circular feedstocks and lower-carbon materials', bg: 'Кръгови суровини и нисковъглеродни материали' },
      note: { en: 'Clinker substitution, cullet, scrap quality, alternative binders and circular raw materials.', bg: 'Замяна на клинкер, стъклен трошляк, качество на скрапа, алтернативни свързващи вещества и кръгови суровини.' },
    },
    lowHeat: {
      name: { en: 'Industrial heat pumps and electric boilers', bg: 'Индустриални термопомпи и електрически котли' },
      note: { en: 'Commercial electrification of low- and medium-temperature heat and steam.', bg: 'Търговски решения за електрификация на ниско- и среднотемпературна топлина и пара.' },
    },
    highHeat: {
      name: { en: 'High-temperature electric and hybrid furnaces', bg: 'Високотемпературни електрически и хибридни пещи' },
      note: { en: 'Large glass, lime, soda-ash and ceramic furnace conversions with grid reinforcement.', bg: 'Преустройство на големи пещи за стъкло, вар, калцинирана сода и керамика с мрежово усилване.' },
    },
    eSolvay: {
      name: { en: 'Electrochemical soda-ash process redesign', bg: 'Електрохимично преобразуване на производството на сода' },
      note: { en: 'Emerging process redesign represented by the e.Solvay pathway; commercial performance remains to be demonstrated.', bg: 'Развиващо се процесно преобразуване, представено от пътя e.Solvay; търговската ефективност все още трябва да се докаже.' },
    },
    h2Use: {
      name: { en: 'Hydrogen process and fuel integration', bg: 'Интегриране на водород като суровина и гориво' },
      note: { en: 'Plant conversion for refining, ammonia synthesis and selected high-temperature fuel uses.', bg: 'Преустройство за рафиниране, синтез на амоняк и избрани високотемпературни горивни приложения.' },
    },
    electrolyzers: {
      name: { en: 'Electrolyser valleys in 20 MW modules', bg: 'Долини от електролизьори в модули по 20 MW' },
      note: { en: 'Alkaline/PEM systems across the five screened valleys; cost includes installed balance of plant and contingency.', bg: 'Алкални/PEM системи в петте оценени долини; цената включва инсталирания balance of plant и резерв.' },
    },
    renewables: {
      name: { en: 'Dedicated renewable electricity supply', bg: 'Специализирано ВЕИ електроснабдяване' },
      note: { en: 'Solar-only equivalent used as a transparent upper-bound capacity case; a real portfolio would mix solar, wind, contracts and storage.', bg: 'Соларният еквивалент е прозрачен случай за необходимата мощност; реалният портфейл би комбинирал слънце, вятър, договори и съхранение.' },
    },
    gridStorage: {
      name: { en: 'Grid reinforcement, BESS and firming', bg: 'Мрежово усилване, BESS и балансиране' },
      note: { en: 'Four-hour battery proxy plus industrial connection and balancing upgrades.', bg: 'Прокси за четиричасова батерия плюс усилване на индустриалните връзки и балансирането.' },
    },
    ammonia: {
      name: { en: 'NH3 storage, distribution and cracking', bg: 'Съхранение, разпределение и крекинг на NH3' },
      note: { en: 'Mature storage and transport combined with emerging cracking and direct-fuel applications.', bg: 'Зряло съхранение и транспорт, комбинирани с развиващи се приложения за крекинг и директно гориво.' },
    },
    cementCapture: {
      name: { en: 'Capture at all three cement plants', bg: 'Улавяне във всички три циментови завода' },
      note: { en: 'Capture trains sized for the full 2024 process-emissions baseline and phased to 2050.', bg: 'Улавящи линии, оразмерени за цялата база от процесни емисии за 2024 г. и поетапно внедрени до 2050 г.' },
    },
    co2Network: {
      name: { en: 'CO2 transport, appraisal and storage network', bg: 'Мрежа за транспорт, проучване и съхранение на CO2' },
      note: { en: 'Devnya and north-west corridors, storage appraisal, compression, metering and injection assets.', bg: 'Коридори Девня и Северозапад, проучване на хранилища, компресиране, измерване и нагнетяване.' },
    },
    residualCapture: {
      name: { en: 'Residual capture in refining, soda ash and lime', bg: 'Улавяне на остатъчни емисии при рафиниране, сода и вар' },
      note: { en: 'Later capture trains for concentrated residual sources after efficiency, electrification and hydrogen.', bg: 'По-късни улавящи линии за концентрирани остатъчни източници след ефективност, електрификация и водород.' },
    },
    nuclear: {
      name: { en: 'New large nuclear reactor', bg: 'Нов голям ядрен реактор' },
      note: { en: 'One user-selected unit equals 1,000 MW; financing risk and interest during construction are excluded.', bg: 'Една избрана бройка е 1 000 MW; финансовият риск и лихвите по време на строителството са изключени.' },
    },
  };

  const SOURCES = [
    { id: 'iea-hydrogen-2025', label: 'IEA - Global Hydrogen Review 2025', url: 'https://www.iea.org/reports/global-hydrogen-review-2025/executive-summary' },
    { id: 'iea-hydrogen-emissions', label: 'IEA - GHG emissions of hydrogen and derivatives', url: 'https://www.iea.org/reports/global-hydrogen-review-2024/ghg-emissions-of-hydrogen-and-its-derivatives' },
    { id: 'irena-costs', label: 'IRENA - Renewable Power Generation Costs in 2024', url: 'https://www.irena.org/Digital-Report/Renewable-Power-Generation-Costs-in-2024' },
    { id: 'iea-industrial-heat', label: 'IEA - Renewables for Industry', url: 'https://www.iea.org/reports/renewables-for-industry/executive-summary' },
    { id: 'jrc-ccus', label: 'JRC - CCUS supply chains and costs', url: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC139285' },
    { id: 'jrc-incite', label: 'JRC INCITE - Technical Report on Innovative Techniques 2026', url: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC146559' },
    { id: 'jrc-rfnbo', label: 'JRC - RFNBO Technology Status 2025', url: 'https://publications.jrc.ec.europa.eu/repository/handle/JRC144471' },
    { id: 'ec-n2o', label: 'European Commission - nitric acid N2O benchmark', url: 'https://climate.ec.europa.eu/system/files/2016-11/bm_study-chemicals_en.pdf' },
    { id: 'devnya-2026', label: 'Heidelberg Materials - Devnya CCS update 2026', url: 'https://www.heidelbergmaterials.bg/bg/node/524160' },
    { id: 'eastern-lights', label: 'European Commission CORDIS - Eastern Lights', url: 'https://cordis.europa.eu/project/id/101136122' },
    { id: 'iaea-nuclear', label: 'IAEA - Climate Change and Nuclear Power 2024', url: 'https://www-pub.iaea.org/MTCD/Publications/PDF/PUB9048_web.pdf' },
    { id: 'ec-pinc', label: 'European Commission - Nuclear Illustrative Programme 2025', url: 'https://energy.ec.europa.eu/publications/communication-nuclear-illustrative-programme-under-article-40-euratom-treaty_en' },
  ];

  let breakdown = 'technology';
  let hydrogenPhase = '2040';
  let reactorCount = 0;
  let disabledTechnologyIds = new Set();
  let lastRenderOptions = null;

  function language() {
    return I18n?.getLanguage?.() === 'bg' ? 'bg' : 'en';
  }

  function tr(key, variables = {}) {
    let value = COPY[language()]?.[key] || COPY.en[key] || key;
    Object.entries(variables).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  }

  function localize(value) {
    return value?.[language()] || value?.en || String(value || '');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function numberFormat(value, options = {}) {
    return new Intl.NumberFormat(language() === 'bg' ? 'bg-BG' : 'en-GB', options).format(Number(value) || 0);
  }

  function round(value, digits = 1) {
    const factor = 10 ** digits;
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, Number(value) || 0));
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
      faint: cssVar('--text-faint', '#6b5d6b'),
      surface: cssVar('--surface', '#fffef8'),
      surface2: cssVar('--surface-2', '#f8f5e9'),
      border: cssVar('--border', '#ded4c7'),
      // Same theme-aware tokens the KPI/scope/status badges use (see
      // --investment-* in industrial-investment.css) so charts and badges
      // always show matching colors for the same category, in both themes.
      direct: cssVar('--investment-direct', '#7a005e'),
      shared: cssVar('--investment-shared', '#3d8664'),
      system: cssVar('--investment-system', '#a8508f'),
      emerging: cssVar('--investment-emerging', '#6fb08f'),
      // Reference/threshold line color, not a scope category - already theme-aware.
      baseline: cssVar('--danger', '#dc2626'),
    };
  }

  function analysedCompanies(companiesInput) {
    const source = Array.isArray(companiesInput) ? companiesInput : Data?.createDefaultCompanies?.() || [];
    return source
      .filter((company) => Number.isFinite(Number(company.etsRank2024)) && company.geography)
      .map((company) => ({ ...company, broadSector: company.broadSector || company.clusterSector }))
      .sort((a, b) => Number(a.etsRank2024) - Number(b.etsRank2024));
  }

  function phaseScale(phaseInput = hydrogenPhase) {
    const phase = PHASES.includes(String(phaseInput)) ? String(phaseInput) : '2040';
    const unitMW = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerUnitMW || 20);
    const units = (Data?.ELECTROLYZER_VALLEY_CANDIDATES || [])
      .reduce((sum, candidate) => sum + Number(candidate.phaseUnits?.[phase] || 0), 0);
    const capacityMW = units * unitMW;
    const capacityFactor = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerCapacityFactor || 0.7);
    const solarFactor = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerSolarOnlyCapacityFactor || 0.18);
    const systemKWhPerKg = Number(Data?.TECHNOLOGY_ASSUMPTIONS?.electrolyzerSystemKWhPerKg || 55);
    const electricityTWh = capacityMW * capacityFactor * 8760 / 1000000;
    const hydrogenKt = capacityMW * capacityFactor * 8760 / (systemKWhPerKg * 1000);
    const solarEquivalentMW = solarFactor > 0 ? capacityMW * capacityFactor / solarFactor : 0;
    return { phase, units, capacityMW, capacityFactor, electricityTWh, hydrogenKt, solarEquivalentMW };
  }

  function valleyRegionShares(phaseInput) {
    const phase = PHASES.includes(String(phaseInput)) ? String(phaseInput) : '2040';
    const regionByValley = {
      'devnya-varna': 'BG33',
      'stara-zagora-dimitrovgrad': 'BG42',
      'burgas-industrial-port': 'BG34',
      'sofia-pernik': 'BG41',
      'plovdiv-pazardzhik': 'BG42',
    };
    const capacities = {};
    (Data?.ELECTROLYZER_VALLEY_CANDIDATES || []).forEach((candidate) => {
      const regionId = regionByValley[candidate.id];
      if (!regionId) return;
      capacities[regionId] = (capacities[regionId] || 0) + Number(candidate.phaseUnits?.[phase] || 0);
    });
    const total = Object.values(capacities).reduce((sum, value) => sum + value, 0) || 1;
    return Object.fromEntries(Object.entries(capacities).map(([id, value]) => [id, value / total]));
  }

  function costRange(low, central, high) {
    return { low: round(low, 3), central: round(central, 3), high: round(high, 3) };
  }

  function createTechnologyPortfolio(options = {}) {
    const phase = PHASES.includes(String(options.phase)) ? String(options.phase) : hydrogenPhase;
    const reactors = Math.max(0, Math.min(12, Math.round(Number(options.reactors ?? reactorCount) || 0)));
    const scale = phaseScale(phase);
    const processBaselineKt = analysedCompanies(options.companies)
      .filter((company) => ['heidelberg', 'holcim', 'zlatna-panega'].includes(company.id))
      .reduce((sum, company) => sum + Number(company.emissionsKt || 0), 0)
      * Number(Data?.CEMENT_CCS_ASSUMPTIONS?.processEmissionShare || 0.65);
    const cementStoredKt = processBaselineKt * Number(Data?.CEMENT_CCS_ASSUMPTIONS?.effectiveCaptureRate || 0.95);
    const h2AvoidanceKt = Math.min(1600, scale.hydrogenKt * 10.5);
    const valleyShares = valleyRegionShares(phase);
    const firstPhaseMW = Math.min(1100, scale.capacityMW);
    const laterPhaseMW = Math.max(0, scale.capacityMW - firstPhaseMW);
    const electrolyzerCost = costRange(
      firstPhaseMW * 1.60 + laterPhaseMW * 1.10,
      firstPhaseMW * 2.10 + laterPhaseMW * 1.55,
      firstPhaseMW * 2.55 + laterPhaseMW * 2.20
    );
    const renewableCost = costRange(
      scale.solarEquivalentMW * 0.45,
      scale.solarEquivalentMW * 0.75,
      scale.solarEquivalentMW * 1.45
    );
    const storageMWh = scale.capacityMW * 4;
    const gridStorageCost = costRange(
      storageMWh * 0.13 + scale.capacityMW * 0.15,
      storageMWh * 0.18 + scale.capacityMW * 0.25,
      storageMWh * 0.28 + scale.capacityMW * 0.45
    );

    const technologies = [
      {
        id: 'efficiency', copy: 'efficiency', scope: 'direct', status: 'ready', trl: 'TRL 9', availableYear: 2026,
        investmentStartYear: 2026, fullYear: 2032, buildYears: [1, 3], cost: costRange(320, 600, 1000), impactKt: 420,
        confidence20: 15, sourceIds: ['iea-industrial-heat'],
      },
      {
        id: 'n2o-abatement', copy: 'n2o', scope: 'direct', status: 'ready', trl: 'TRL 9', availableYear: 2026,
        investmentStartYear: 2026, fullYear: 2029, buildYears: [1, 2], cost: costRange(6, 12, 20), impactKt: 300,
        eligibleIds: ['neochim', 'agropolychim'], confidence20: 16, sourceIds: ['ec-n2o'],
      },
      {
        id: 'circular-materials', copy: 'circular', scope: 'direct', status: 'ready', trl: 'TRL 8-9', availableYear: 2026,
        investmentStartYear: 2026, fullYear: 2035, buildYears: [2, 5], cost: costRange(240, 480, 850), impactKt: 320,
        eligiblePathwayIds: ['cement', 'glass', 'lime', 'steel', 'non-ferrous', 'ceramics'], confidence20: 12, sourceIds: ['jrc-incite'],
      },
      {
        id: 'low-medium-heat', copy: 'lowHeat', scope: 'direct', status: 'ready', trl: 'TRL 9', availableYear: 2026,
        investmentStartYear: 2026, fullYear: 2035, buildYears: [2, 4], cost: costRange(400, 750, 1200), impactKt: 300,
        eligiblePathwayIds: ['refining', 'soda-ash', 'fertilisers', 'glass', 'starch', 'non-ferrous'], confidence20: 13, sourceIds: ['iea-industrial-heat'],
      },
      {
        id: 'high-temperature-electric', copy: 'highHeat', scope: 'direct', status: 'scaling', trl: 'TRL 6-8', availableYear: 2030,
        investmentStartYear: 2027, fullYear: 2042, buildYears: [4, 7], cost: costRange(900, 1700, 2800), impactKt: 680,
        eligiblePathwayIds: ['soda-ash', 'cement', 'glass', 'lime', 'steel', 'ceramics'], confidence20: 9, sourceIds: ['jrc-incite', 'iea-industrial-heat'],
      },
      {
        id: 'electrochemical-soda', copy: 'eSolvay', scope: 'direct', status: 'emerging', trl: 'TRL 6-7', availableYear: 2033,
        investmentStartYear: 2028, fullYear: 2040, buildYears: [5, 8], cost: costRange(300, 500, 800), impactKt: 700,
        eligibleIds: ['solvay'], confidence20: 7, sourceIds: ['jrc-incite'],
      },
      {
        id: 'hydrogen-integration', copy: 'h2Use', scope: 'direct', status: 'scaling', trl: 'TRL 7-9', availableYear: 2028,
        investmentStartYear: 2026, fullYear: Number(phase), buildYears: [2, 5], cost: costRange(300, 600, 1000), impactKt: h2AvoidanceKt,
        eligiblePathwayIds: ['refining', 'fertilisers', 'glass', 'lime', 'steel', 'cement'],
        requires: ['electrolyzer-valleys', 'renewable-supply'], confidence20: 9, sourceIds: ['iea-hydrogen-emissions', 'jrc-rfnbo'],
      },
      {
        id: 'electrolyzer-valleys', copy: 'electrolyzers', scope: 'shared', status: 'scaling', trl: 'TRL 9 ALK/PEM', availableYear: 2028,
        investmentStartYear: 2026, fullYear: Number(phase), buildYears: [2, 5], cost: electrolyzerCost, impactKt: 0, enabledImpactKt: h2AvoidanceKt,
        sectorShares: { Chemicals: 0.70, 'Mineral Materials': 0.20, Metals: 0.07, 'Other Manufacturing': 0.03 },
        regionShares: valleyShares, confidence20: 13, sourceIds: ['iea-hydrogen-2025'], quantityLabel: `${numberFormat(scale.capacityMW)} MW`,
      },
      {
        id: 'renewable-supply', copy: 'renewables', scope: 'shared', status: 'ready', trl: 'TRL 9', availableYear: 2027,
        investmentStartYear: 2026, fullYear: Number(phase), buildYears: [2, 6], cost: renewableCost, impactKt: 0, enabledImpactKt: h2AvoidanceKt,
        sectorShares: { Chemicals: 0.70, 'Mineral Materials': 0.20, Metals: 0.07, 'Other Manufacturing': 0.03 },
        regionShares: valleyShares, confidence20: 11, sourceIds: ['irena-costs'], quantityLabel: `${numberFormat(scale.solarEquivalentMW, { maximumFractionDigits: 0 })} MW`,
      },
      {
        id: 'grid-bess-firming', copy: 'gridStorage', scope: 'shared', status: 'ready', trl: 'TRL 9', availableYear: 2027,
        investmentStartYear: 2026, fullYear: Number(phase), buildYears: [3, 7], cost: gridStorageCost, impactKt: 0, enabledImpactKt: h2AvoidanceKt,
        sectorShares: { Chemicals: 0.65, 'Mineral Materials': 0.23, Metals: 0.08, 'Other Manufacturing': 0.04 },
        regionShares: valleyShares, confidence20: 8, sourceIds: ['irena-costs'], quantityLabel: `${numberFormat(storageMWh)} MWh BESS`,
      },
      {
        id: 'ammonia-logistics', copy: 'ammonia', scope: 'shared', status: 'conditional', trl: 'TRL 6-9', availableYear: 2030,
        investmentStartYear: 2026, fullYear: 2038, buildYears: [2, 5], cost: costRange(180, 350, 650), impactKt: 0, enabledImpactKt: Math.min(350, h2AvoidanceKt),
        sectorShares: { Chemicals: 0.65, 'Mineral Materials': 0.25, Metals: 0.07, 'Other Manufacturing': 0.03 },
        regionShares: { BG31: 0.05, BG32: 0.10, BG33: 0.28, BG41: 0.15, BG42: 0.24, BG34: 0.18 },
        confidence20: 8, sourceIds: ['jrc-rfnbo'],
      },
      {
        id: 'cement-capture', copy: 'cementCapture', scope: 'direct', status: 'conditional', trl: 'TRL 7-9', availableYear: 2029,
        investmentStartYear: 2026, fullYear: 2050, buildYears: [4, 7], cost: costRange(processBaselineKt * 0.60, processBaselineKt * 0.90, processBaselineKt * 1.40), impactKt: cementStoredKt,
        eligibleIds: ['heidelberg', 'holcim', 'zlatna-panega'], requiresEnabled: ['co2-network'], adoptionProfile: 'cement',
        confidence20: 10, sourceIds: ['jrc-ccus', 'devnya-2026'],
      },
      {
        id: 'co2-network', copy: 'co2Network', scope: 'shared', status: 'conditional', trl: 'TRL 8-9', availableYear: 2029,
        investmentStartYear: 2026, fullYear: 2045, buildYears: [6, 10], cost: costRange(450, 750, 1200), impactKt: 0, enabledImpactKt: cementStoredKt + 1000,
        sectorShares: { 'Mineral Materials': 0.85, Chemicals: 0.15 },
        // Only BG31 (Holcim/Beli Net Zero, Zlatna Panega, Pleven storage) and BG33
        // (Heidelberg/Devnya) host cement CCS connections or storage sites - see
        // CEMENT_CCS_CONNECTIONS/CEMENT_CCS_STORAGE_SITES in cluster-data.js. No BG32 branch is planned.
        regionShares: { BG31: 0.44, BG33: 0.56 }, confidence20: 8,
        sourceIds: ['jrc-ccus', 'devnya-2026', 'eastern-lights'],
      },
      {
        id: 'residual-capture', copy: 'residualCapture', scope: 'direct', status: 'emerging', trl: 'TRL 6-9', availableYear: 2035,
        investmentStartYear: 2030, fullYear: 2050, buildYears: [5, 8], cost: costRange(1200, 2300, 4000), impactKt: 1000,
        eligibleIds: ['lukoil', 'solvay', 'znhv-puklina', 'calcit', 'ognyanovo-k'], requires: ['co2-network'],
        confidence20: 6, sourceIds: ['jrc-ccus', 'jrc-incite'],
      },
      {
        id: 'new-nuclear', copy: 'nuclear', scope: 'system', status: 'system', trl: 'TRL 9', availableYear: 2038,
        investmentStartYear: 2026, fullYear: 2045, buildYears: [10, 15], cost: costRange(reactors * 7500, reactors * 9000, reactors * 11000), impactKt: 0,
        enabledImpactKt: reactors * 1592, unitEnabledImpactKt: 1592, unitCost: costRange(7500, 9000, 11000),
        sectorShares: { 'System enablers': 1 }, regionShares: { BG31: 1 }, confidence20: 8,
        sourceIds: ['iaea-nuclear', 'ec-pinc'], quantityLabel: `${reactors} × 1,000 MW`,
      },
    ];

    return technologies.map((technology) => ({
      ...technology,
      name: TECHNOLOGY_COPY[technology.copy].name,
      note: TECHNOLOGY_COPY[technology.copy].note,
      enabled: !disabledTechnologyIds.has(technology.id) && (technology.id !== 'new-nuclear' || reactors > 0),
    }));
  }

  function eligibleCompanies(technology, companies) {
    if (technology.eligibleIds) return companies.filter((company) => technology.eligibleIds.includes(company.id));
    if (technology.eligiblePathwayIds) return companies.filter((company) => technology.eligiblePathwayIds.includes(company.sectorPathwayId));
    return companies;
  }

  function weightedCompanyShares(technology, companies) {
    const eligible = eligibleCompanies(technology, companies);
    const total = eligible.reduce((sum, company) => sum + Math.max(0, Number(company.emissionsKt || 0)), 0) || eligible.length || 1;
    return eligible.map((company) => ({
      company,
      share: total === eligible.length
        ? 1 / total
        : Math.max(0, Number(company.emissionsKt || 0)) / total,
    }));
  }

  function distributionFor(technology, dimension, companies) {
    if (dimension === 'sector' && technology.sectorShares) return technology.sectorShares;
    if (dimension === 'region' && technology.regionShares) return technology.regionShares;
    const output = {};
    weightedCompanyShares(technology, companies).forEach(({ company, share }) => {
      const key = dimension === 'region' ? company.geography?.regionId : company.broadSector;
      if (key) output[key] = (output[key] || 0) + share;
    });
    return output;
  }

  function aggregateCapex(technologiesInput, dimension, companiesInput) {
    const technologies = (technologiesInput || []).filter((technology) => technology.enabled && technology.cost.central > 0);
    const companies = analysedCompanies(companiesInput);
    if (dimension === 'technology') {
      return technologies.map((technology) => ({
        id: technology.id,
        label: localize(technology.name),
        low: technology.cost.low,
        central: technology.cost.central,
        high: technology.cost.high,
        scope: technology.scope,
        scopes: { [technology.scope]: technology.cost.central },
      })).sort((a, b) => b.central - a.central);
    }

    const rows = new Map();
    technologies.forEach((technology) => {
      Object.entries(distributionFor(technology, dimension, companies)).forEach(([id, share]) => {
        if (!rows.has(id)) rows.set(id, { id, low: 0, central: 0, high: 0, scopes: { direct: 0, shared: 0, system: 0 } });
        const row = rows.get(id);
        row.low += technology.cost.low * share;
        row.central += technology.cost.central * share;
        row.high += technology.cost.high * share;
        row.scopes[technology.scope] += technology.cost.central * share;
      });
    });

    const regionNames = new Map((Data?.STATISTICAL_REGIONS || []).map((region) => [region.id, localize(region.name)]));
    const order = dimension === 'region' ? REGION_ORDER : SECTOR_ORDER;
    return [...rows.values()]
      .map((row) => ({
        ...row,
        label: dimension === 'region' ? (regionNames.get(row.id) || row.id) : tr(row.id),
        low: round(row.low, 3), central: round(row.central, 3), high: round(row.high, 3),
      }))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }

  function interpolateMilestones(pathway, year) {
    const points = Object.entries(pathway || {})
      .map(([pointYear, value]) => ({ year: Number(pointYear), value: Number(value) / 100 }))
      .sort((a, b) => a.year - b.year);
    if (!points.length || year < points[0].year) return 0;
    if (year >= points.at(-1).year) return points.at(-1).value;
    const upperIndex = points.findIndex((point) => point.year >= year);
    const upper = points[upperIndex];
    if (upper.year === year) return upper.value;
    const lower = points[upperIndex - 1];
    return lower.value + (upper.value - lower.value) * (year - lower.year) / (upper.year - lower.year);
  }

  function cementAdoption(year, companies) {
    const cementIds = ['heidelberg', 'holcim', 'zlatna-panega'];
    const processShare = Number(Data?.CEMENT_CCS_ASSUMPTIONS?.processEmissionShare || 0.65);
    const weighted = cementIds.map((id) => {
      const company = companies.find((entry) => entry.id === id);
      const baseline = Number(company?.emissionsKt || 0) * processShare;
      const pathway = Data?.CEMENT_CCS_COVERAGE_PATHWAY?.[id] || {};
      return { baseline, coverage: interpolateMilestones(pathway, year) };
    });
    const total = weighted.reduce((sum, row) => sum + row.baseline, 0) || 1;
    return weighted.reduce((sum, row) => sum + row.baseline * row.coverage, 0) / total;
  }

  function baseAdoption(technology, year, companies) {
    if (technology.adoptionProfile === 'cement') return cementAdoption(year, companies);
    if (year < technology.availableYear) return 0;
    if (technology.fullYear <= technology.availableYear) return 1;
    return clamp01((year - technology.availableYear + 1) / (technology.fullYear - technology.availableYear + 1));
  }

  function effectiveAdoption(technology, year, technologies, companies) {
    if (!technology.enabled) return 0;
    const enabledById = new Map(technologies.map((entry) => [entry.id, entry]));
    if ((technology.requiresEnabled || []).some((id) => !enabledById.get(id)?.enabled)) return 0;
    let adoption = baseAdoption(technology, year, companies);
    (technology.requires || []).forEach((id) => {
      const dependency = enabledById.get(id);
      adoption = dependency?.enabled ? Math.min(adoption, baseAdoption(dependency, year, companies)) : 0;
    });
    return adoption;
  }

  function buildEmissionsTrajectory(companiesInput, technologiesInput, startYear = 2026, endYear = 2050) {
    const companies = analysedCompanies(companiesInput);
    const technologies = technologiesInput || [];
    const baselines = Object.fromEntries(SECTOR_ORDER.slice(0, 4).map((sector) => [
      sector,
      companies.filter((company) => company.broadSector === sector).reduce((sum, company) => sum + Number(company.emissionsKt || 0), 0),
    ]));
    const baselineKt = Object.values(baselines).reduce((sum, value) => sum + value, 0);
    const directTechnologies = technologies
      .filter((technology) => technology.impactKt > 0)
      .sort((a, b) => a.availableYear - b.availableYear);
    const points = [];

    for (let year = startYear; year <= endYear; year += 1) {
      const reducedBySector = Object.fromEntries(Object.keys(baselines).map((sector) => [sector, 0]));
      const contributions = {};
      directTechnologies.forEach((technology) => {
        const adoption = effectiveAdoption(technology, year, technologies, companies);
        const gross = technology.impactKt * adoption;
        let appliedTotal = 0;
        Object.entries(distributionFor(technology, 'sector', companies)).forEach(([sector, share]) => {
          if (!(sector in baselines)) return;
          const maximum = baselines[sector] * 0.98;
          const available = Math.max(0, maximum - reducedBySector[sector]);
          const applied = Math.min(available, gross * share);
          reducedBySector[sector] += applied;
          appliedTotal += applied;
        });
        contributions[technology.id] = appliedTotal;
      });
      const abatementKt = Object.values(reducedBySector).reduce((sum, value) => sum + value, 0);
      points.push({ year, baselineKt, abatementKt, residualKt: Math.max(0, baselineKt - abatementKt), contributions });
    }
    return { baselineKt, sectorBaselines: baselines, points };
  }

  function spendingShareByYear(technology, year) {
    if (year < technology.investmentStartYear) return 0;
    if (year >= technology.fullYear) return 1;
    return clamp01((year - technology.investmentStartYear + 1) / (technology.fullYear - technology.investmentStartYear + 1));
  }

  function calculateInvestmentAssessment(companiesInput, options = {}) {
    const companies = analysedCompanies(companiesInput);
    const phase = PHASES.includes(String(options.phase)) ? String(options.phase) : hydrogenPhase;
    const reactors = Math.max(0, Math.min(12, Math.round(Number(options.reactors ?? reactorCount) || 0)));
    const technologies = createTechnologyPortfolio({ phase, reactors, companies });
    if (options.disabledIds) {
      const disabled = new Set(options.disabledIds);
      technologies.forEach((technology) => {
        technology.enabled = !disabled.has(technology.id) && (technology.id !== 'new-nuclear' || reactors > 0);
      });
    }
    const enabled = technologies.filter((technology) => technology.enabled && technology.cost.central > 0);
    const totals = enabled.reduce((sum, technology) => ({
      low: sum.low + technology.cost.low,
      central: sum.central + technology.cost.central,
      high: sum.high + technology.cost.high,
    }), { low: 0, central: 0, high: 0 });
    const byScope = Object.fromEntries(SCOPE_ORDER.map((scope) => [scope, enabled
      .filter((technology) => technology.scope === scope)
      .reduce((sum, technology) => sum + technology.cost.central, 0)]));
    const by2030M = enabled.reduce((sum, technology) => sum + technology.cost.central * spendingShareByYear(technology, 2030), 0);
    const trajectory = buildEmissionsTrajectory(companies, technologies);
    const finalPoint = trajectory.points.at(-1);
    return {
      phase,
      reactors,
      scale: phaseScale(phase),
      companies,
      technologies,
      totals,
      byScope,
      by2030M,
      trajectory,
      reduction2050: trajectory.baselineKt > 0 ? finalPoint.abatementKt / trajectory.baselineKt : 0,
      residual2050Kt: finalPoint.residualKt,
      breakdowns: {
        technology: aggregateCapex(technologies, 'technology', companies),
        sector: aggregateCapex(technologies, 'sector', companies),
        region: aggregateCapex(technologies, 'region', companies),
      },
    };
  }

  function formatMoney(valueM, digits = 1) {
    const value = Number(valueM) || 0;
    if (value >= 1000) return `€${numberFormat(value / 1000, { minimumFractionDigits: digits, maximumFractionDigits: digits })}bn`;
    return `€${numberFormat(value, { maximumFractionDigits: 0 })}m`;
  }

  function formatRange(cost) {
    return `${formatMoney(cost.low)}-${formatMoney(cost.high)}`;
  }

  function formatBuildYears(range) {
    return range[0] === range[1] ? `${range[0]} ${tr(range[0] === 1 ? 'year' : 'years')}` : `${range[0]}-${range[1]} ${tr('years')}`;
  }

  function impactText(technology) {
    if (technology.impactKt > 0) return tr('directImpact', { value: numberFormat(technology.impactKt, { maximumFractionDigits: 0 }) });
    const enabled = technology.enabledImpactKt || technology.unitEnabledImpactKt || 0;
    if (enabled > 0) return tr('enablingImpact', { value: numberFormat(enabled, { maximumFractionDigits: 0 }) });
    return tr('noDirectImpact');
  }

  function timelineGroups(technologies) {
    const groups = [
      { id: 'now', match: (year) => year <= 2026 },
      { id: 'near', match: (year) => year >= 2027 && year <= 2030 },
      { id: 'medium', match: (year) => year >= 2031 && year <= 2035 },
      { id: 'later', match: (year) => year >= 2036 },
    ];
    return groups.map((group) => ({
      id: group.id,
      technologies: technologies.filter((technology) => group.match(technology.availableYear)),
    }));
  }

  function buildCapexChartModel(assessment, dimension = breakdown, themeInput) {
    const theme = themeInput || getTheme();
    const rows = assessment.breakdowns[dimension] || [];
    const ordered = dimension === 'technology' ? [...rows].reverse() : [...rows].reverse();
    return {
      traces: [{
        type: 'bar', orientation: 'h',
        x: ordered.map((row) => row.central / 1000),
        y: ordered.map((row) => row.label),
        customdata: ordered.map((row) => [row.low / 1000, row.high / 1000, row.scopes.direct || 0, row.scopes.shared || 0, row.scopes.system || 0]),
        error_x: {
          type: 'data', symmetric: false,
          array: ordered.map((row) => (row.high - row.central) / 1000),
          arrayminus: ordered.map((row) => (row.central - row.low) / 1000),
          color: theme.faint, thickness: 1.2, width: 4,
        },
        marker: {
          color: ordered.map((row) => theme[row.scope] || (row.scopes.system > row.scopes.shared ? theme.system : row.scopes.shared > row.scopes.direct ? theme.shared : theme.direct)),
          line: { color: theme.surface, width: 0.7 },
        },
        hovertemplate: `<b>%{y}</b><br>${tr('central')}: €%{x:.2f}bn<br>${tr('lowHigh')}: €%{customdata[0]:.2f}-€%{customdata[1]:.2f}bn<extra></extra>`,
      }],
      layout: {
        autosize: true,
        height: Math.max(360, ordered.length * 42 + 80),
        margin: { l: dimension === 'technology' ? 245 : 155, r: 34, t: 12, b: 54 },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'DM Sans, sans-serif', color: theme.text, size: 12 },
        xaxis: { title: 'CAPEX (€bn, 2025)', gridcolor: theme.border, zeroline: false, rangemode: 'tozero', fixedrange: true },
        yaxis: { automargin: true, fixedrange: true },
        showlegend: false,
      },
    };
  }

  function buildEmissionsChartModel(assessment, themeInput) {
    const theme = themeInput || getTheme();
    const points = assessment.trajectory.points;
    return {
      traces: [
        {
          type: 'scatter', mode: 'lines', name: tr('baseline'),
          x: points.map((point) => point.year), y: points.map((point) => point.baselineKt / 1000),
          line: { color: theme.baseline, width: 1.5, dash: 'dot' }, hovertemplate: `${tr('baseline')}: %{y:.2f} Mt<extra></extra>`,
        },
        {
          type: 'scatter', mode: 'lines+markers', name: tr('modeledResidual'),
          x: points.map((point) => point.year), y: points.map((point) => point.residualKt / 1000),
          line: { color: theme.direct, width: 3 }, marker: { size: points.map((point) => MILESTONE_YEARS.includes(point.year) ? 7 : 0), color: theme.direct },
          fill: 'tonexty', fillcolor: 'rgba(21,128,61,0.08)', hovertemplate: '%{x}: %{y:.2f} Mt CO2e<extra></extra>',
        },
      ],
      layout: {
        autosize: true, height: 385, margin: { l: 58, r: 24, t: 12, b: 48 },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'DM Sans, sans-serif', color: theme.text, size: 12 },
        xaxis: { range: [2026, 2050], tickvals: MILESTONE_YEARS, gridcolor: theme.border, fixedrange: true },
        yaxis: { title: 'Mt CO2e/year', rangemode: 'tozero', gridcolor: theme.border, fixedrange: true },
        legend: { orientation: 'h', x: 0, y: 1.10, font: { size: 11 } },
        hovermode: 'x unified',
      },
    };
  }

  function chartConfig() {
    return { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'] };
  }

  function renderCharts(assessment, theme) {
    const capexNode = root.document?.getElementById('investmentCapexChart');
    const emissionsNode = root.document?.getElementById('investmentEmissionsChart');
    if (!root.Plotly?.react) {
      [capexNode, emissionsNode].filter(Boolean).forEach((node) => { node.innerHTML = `<p class="investment-empty">${escapeHtml(tr('chartMissing'))}</p>`; });
      return;
    }
    if (capexNode) {
      const model = buildCapexChartModel(assessment, breakdown, theme);
      root.Plotly.react(capexNode, root.CoreI18n?.plotTraces(model.traces) || model.traces, model.layout, chartConfig());
    }
    if (emissionsNode) {
      const model = buildEmissionsChartModel(assessment, theme);
      root.Plotly.react(emissionsNode, root.CoreI18n?.plotTraces(model.traces) || model.traces, model.layout, chartConfig());
    }
  }

  function purge() {
    ['investmentCapexChart', 'investmentEmissionsChart'].forEach((id) => {
      const node = root.document?.getElementById(id);
      if (node && root.Plotly?.purge) root.Plotly.purge(node);
    });
  }

  function breakdownControlsHtml() {
    return `<div class="investment-segments" role="group" aria-label="${escapeHtml(tr('breakdown'))}">
      ${BREAKDOWNS.map((id) => `<button type="button" class="${id === breakdown ? 'active' : ''}" data-investment-breakdown="${id}" aria-pressed="${id === breakdown}">${escapeHtml(tr(id))}</button>`).join('')}
    </div>`;
  }

  function phaseControlsHtml() {
    return `<div class="investment-phase-control"><span>${escapeHtml(tr('phase'))}</span><div class="investment-segments" role="group">
      ${PHASES.map((phase) => `<button type="button" class="${phase === hydrogenPhase ? 'active' : ''}" data-investment-phase="${phase}" aria-pressed="${phase === hydrogenPhase}">${escapeHtml(tr(`phase${phase}`))}</button>`).join('')}
    </div></div>`;
  }

  function timelineHtml(technologies) {
    return timelineGroups(technologies).map((group) => `<div class="investment-time-column ${group.id}">
      <strong>${escapeHtml(tr(group.id))}</strong>
      ${group.technologies.map((technology) => `<span class="${technology.enabled ? '' : 'disabled'}"><i class="${technology.scope}"></i>${escapeHtml(localize(technology.name))}<b>${technology.availableYear}</b></span>`).join('')}
    </div>`).join('');
  }

  function technologyCostHtml(technology) {
    if (technology.id === 'new-nuclear' && reactorCount === 0) {
      return `<strong>${escapeHtml(formatRange(technology.unitCost))}</strong><small>${escapeHtml(tr('perUnit'))}</small>`;
    }
    return `<strong>${escapeHtml(formatRange(technology.cost))}</strong>${technology.quantityLabel ? `<small>${escapeHtml(technology.quantityLabel)}</small>` : ''}`;
  }

  function technologyRowsHtml(technologies) {
    return technologies.map((technology) => `<tr class="${technology.enabled ? '' : 'disabled'}">
      <td class="investment-tech-name">
        <label><input type="checkbox" data-investment-tech="${escapeHtml(technology.id)}" ${technology.id === 'new-nuclear' ? 'disabled' : ''} ${technology.enabled ? 'checked' : ''}><span><strong>${escapeHtml(localize(technology.name))}</strong><small>${escapeHtml(localize(technology.note))}</small></span></label>
      </td>
      <td><span class="investment-scope ${technology.scope}">${escapeHtml(tr(`scope_${technology.scope}`))}</span></td>
      <td><span class="investment-status ${technology.status}">${escapeHtml(tr(`status_${technology.status}`))}</span><small class="investment-trl">${escapeHtml(technology.trl)}</small></td>
      <td><strong>${technology.availableYear}</strong>${technology.status === 'conditional' ? `<small>${escapeHtml(tr('conditional'))}</small>` : ''}</td>
      <td><strong>${escapeHtml(formatBuildYears(technology.buildYears))}</strong><small>${technology.investmentStartYear}-${technology.fullYear}</small></td>
      <td class="investment-cost-cell">${technologyCostHtml(technology)}</td>
      <td><strong>${escapeHtml(impactText(technology))}</strong></td>
      <td><span class="investment-confidence"><b style="width:${technology.confidence20 / 20 * 100}%"></b></span><small>${technology.confidence20}/20</small></td>
    </tr>`).join('');
  }

  function sourcesHtml() {
    return `<div class="investment-sources"><span>${escapeHtml(tr('source'))}:</span>${SOURCES.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`).join('')}</div>`;
  }

  function render(options = {}) {
    const containerId = options.containerId || 'section-investments';
    const container = root.document?.getElementById(containerId);
    if (!container) return null;
    lastRenderOptions = { ...options, containerId };
    purge();
    const assessment = calculateInvestmentAssessment(options.companies, { phase: hydrogenPhase, reactors: reactorCount });
    const theme = options.theme || getTheme();
    const scale = assessment.scale;

    container.innerHTML = `
      <div class="section-head investment-section-head">
        <div><h1 class="section-title">${escapeHtml(tr('title'))}</h1><p class="section-desc">${escapeHtml(tr('desc'))}</p></div>
        <div class="pill pill-amber">${escapeHtml(tr('badge'))}</div>
      </div>

      <div class="investment-outlook-shell">
        <div class="investment-kpi-strip">
          <div class="primary"><span>${escapeHtml(tr('range'))}</span><strong>${escapeHtml(formatRange(assessment.totals))}</strong><small>${escapeHtml(formatMoney(assessment.totals.central))} ${escapeHtml(tr('central'))}</small></div>
          <div><span>${escapeHtml(tr('direct'))}</span><strong>${escapeHtml(formatMoney(assessment.byScope.direct))}</strong><small>${escapeHtml(tr('central'))}</small></div>
          <div><span>${escapeHtml(tr('shared'))}</span><strong>${escapeHtml(formatMoney(assessment.byScope.shared))}</strong><small>${escapeHtml(tr('central'))}</small></div>
          <div><span>${escapeHtml(tr('system'))}</span><strong>${escapeHtml(formatMoney(assessment.byScope.system))}</strong><small>${escapeHtml(tr('central'))}</small></div>
          <div><span>${escapeHtml(tr('by2030'))}</span><strong>${escapeHtml(formatMoney(assessment.by2030M))}</strong><small>${escapeHtml(tr('central'))}</small></div>
          <div><span>${escapeHtml(tr('abatement'))}</span><strong>${numberFormat(assessment.reduction2050 * 100, { maximumFractionDigits: 0 })}%</strong><small>${numberFormat(assessment.residual2050Kt / 1000, { maximumFractionDigits: 2 })} Mt ${escapeHtml(tr('residual'))}</small></div>
        </div>

        <div class="investment-control-band">
          ${phaseControlsHtml()}
          <label class="investment-reactor-control"><span>${escapeHtml(tr('reactors'))}</span><input type="number" min="0" max="12" step="1" value="${reactorCount}" data-investment-reactors><small>${escapeHtml(tr('reactorsNote'))}</small></label>
        </div>

        <div class="investment-analysis-grid">
          <section class="investment-chart-panel" aria-labelledby="investmentBreakdownTitle">
            <header><div><h2 id="investmentBreakdownTitle">${escapeHtml(tr('breakdown'))}</h2><p>${escapeHtml(tr('chartDesc'))}</p></div>${breakdownControlsHtml()}</header>
            <div id="investmentCapexChart" class="investment-chart" role="img" aria-labelledby="investmentBreakdownTitle"></div>
          </section>
          <section class="investment-chart-panel" aria-labelledby="investmentEmissionsTitle">
            <header><div><h2 id="investmentEmissionsTitle">${escapeHtml(tr('emissionsTitle'))}</h2><p>${escapeHtml(tr('emissionsDesc'))}</p></div></header>
            <div id="investmentEmissionsChart" class="investment-chart emissions" role="img" aria-labelledby="investmentEmissionsTitle"></div>
          </section>
        </div>

        <section class="investment-timeline-band" aria-labelledby="investmentTimelineTitle">
          <header><h2 id="investmentTimelineTitle">${escapeHtml(tr('timelineTitle'))}</h2><p>${escapeHtml(tr('timelineDesc'))}</p></header>
          <div class="investment-timeline-grid">${timelineHtml(assessment.technologies)}</div>
        </section>

        <section class="investment-portfolio-band" aria-labelledby="investmentPortfolioTitle">
          <header><div><h2 id="investmentPortfolioTitle">${escapeHtml(tr('portfolioTitle'))}</h2><p>${escapeHtml(tr('portfolioDesc'))}</p></div><button type="button" class="investment-reset" data-investment-reset>${escapeHtml(tr('reset'))}</button></header>
          <div class="investment-table-wrap"><table class="investment-table">
            <thead><tr><th>${escapeHtml(tr('technology'))}</th><th>${escapeHtml(tr('scope'))}</th><th>${escapeHtml(tr('readiness'))}</th><th>${escapeHtml(tr('earliest'))}</th><th>${escapeHtml(tr('build'))}</th><th>${escapeHtml(tr('capex'))}</th><th>${escapeHtml(tr('impact'))}</th><th>${escapeHtml(tr('confidence'))}</th></tr></thead>
            <tbody>${technologyRowsHtml(assessment.technologies)}</tbody>
          </table></div>
        </section>

        <div class="investment-assumption-band">
          <div><strong>${escapeHtml(tr('methodTitle'))}</strong><p>${escapeHtml(tr('method'))}</p></div>
          <p>${escapeHtml(tr('electricityNote', {
            capacity: numberFormat(scale.capacityMW),
            electricity: numberFormat(scale.electricityTWh, { maximumFractionDigits: 1 }),
            hydrogen: numberFormat(scale.hydrogenKt, { maximumFractionDigits: 1 }),
            solar: numberFormat(scale.solarEquivalentMW, { maximumFractionDigits: 0 }),
          }))}</p>
          <p>${escapeHtml(tr('nuclearNote'))}</p>
        </div>
        ${sourcesHtml()}
      </div>
    `;

    container.querySelectorAll?.('[data-investment-breakdown]').forEach((button) => {
      button.addEventListener('click', () => setBreakdown(button.dataset.investmentBreakdown));
    });
    container.querySelectorAll?.('[data-investment-phase]').forEach((button) => {
      button.addEventListener('click', () => setHydrogenPhase(button.dataset.investmentPhase));
    });
    container.querySelector?.('[data-investment-reactors]')?.addEventListener('change', (event) => setReactorCount(event.currentTarget.value));
    container.querySelectorAll?.('[data-investment-tech]').forEach((input) => {
      input.addEventListener('change', () => setTechnologyEnabled(input.dataset.investmentTech, input.checked));
    });
    container.querySelector?.('[data-investment-reset]')?.addEventListener('click', resetPortfolio);

    renderCharts(assessment, theme);
    return assessment;
  }

  function rerender() {
    return lastRenderOptions ? render(lastRenderOptions) : null;
  }

  function setBreakdown(value) {
    breakdown = BREAKDOWNS.includes(String(value)) ? String(value) : 'technology';
    rerender();
  }

  function setHydrogenPhase(value) {
    hydrogenPhase = PHASES.includes(String(value)) ? String(value) : '2040';
    rerender();
  }

  function setReactorCount(value) {
    reactorCount = Math.max(0, Math.min(12, Math.round(Number(value) || 0)));
    rerender();
  }

  function setTechnologyEnabled(id, enabled) {
    const normalizedId = String(id || '');
    if (enabled) disabledTechnologyIds.delete(normalizedId);
    else disabledTechnologyIds.add(normalizedId);
    rerender();
  }

  function resetPortfolio() {
    disabledTechnologyIds = new Set();
    hydrogenPhase = '2040';
    reactorCount = 0;
    rerender();
  }

  function getState() {
    return { breakdown, hydrogenPhase, reactorCount, disabledTechnologyIds: [...disabledTechnologyIds] };
  }

  return Object.freeze({
    SOURCES,
    createTechnologyPortfolio,
    calculateInvestmentAssessment,
    aggregateCapex,
    buildEmissionsTrajectory,
    buildCapexChartModel,
    buildEmissionsChartModel,
    phaseScale,
    render,
    purge,
    setBreakdown,
    setHydrogenPhase,
    setReactorCount,
    setTechnologyEnabled,
    resetPortfolio,
    getState,
  });
});
