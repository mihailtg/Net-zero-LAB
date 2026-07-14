(function initClusterAnalysisModule() {
  const root = window;

  const CLUSTER_SCENARIOS = [
    {
      name: {
        en: 'Carbon pressure without enablement',
        bg: 'Въглероден натиск без подкрепящи условия',
      },
      theme: 'pressure',
      carbon_pressure: 0.95,
      power_access: 0.35,
      grid_readiness: 0.30,
      hydrogen: 0.25,
      co2_infra: 0.20,
      permitting: 0.25,
      finance: 0.30,
      market_pull: 0.25,
      stability: 0.35,
    },
    {
      name: {
        en: 'Coordinated green industrial policy',
        bg: 'Координирана зелена индустриална политика',
      },
      theme: 'growth',
      carbon_pressure: 0.85,
      power_access: 0.80,
      grid_readiness: 0.80,
      hydrogen: 0.70,
      co2_infra: 0.70,
      permitting: 0.75,
      finance: 0.80,
      market_pull: 0.75,
      stability: 0.80,
    },
    {
      name: {
        en: 'Defensive industrial continuity',
        bg: 'Защитна индустриална непрекъснатост',
      },
      theme: 'defensive',
      carbon_pressure: 0.40,
      power_access: 0.45,
      grid_readiness: 0.45,
      hydrogen: 0.20,
      co2_infra: 0.20,
      permitting: 0.45,
      finance: 0.40,
      market_pull: 0.30,
      stability: 0.55,
    },
    {
      name: {
        en: 'Volatile stop-go policy',
        bg: 'Непоследователна stop-go политика',
      },
      theme: 'volatile',
      carbon_pressure: 0.70,
      power_access: 0.45,
      grid_readiness: 0.40,
      hydrogen: 0.25,
      co2_infra: 0.25,
      permitting: 0.25,
      finance: 0.45,
      market_pull: 0.35,
      stability: 0.20,
    },
    {
      name: {
        en: 'Cluster covenant strategy',
        bg: 'Стратегия за клъстерен пакт',
      },
      theme: 'cluster',
      carbon_pressure: 0.80,
      power_access: 0.70,
      grid_readiness: 0.75,
      hydrogen: 0.55,
      co2_infra: 0.75,
      permitting: 0.80,
      finance: 0.75,
      market_pull: 0.65,
      stability: 0.75,
    },
  ];

  const CLUSTER_SCENARIO_FOCUS_KEYS = [
    'carbon_pressure',
    'power_access',
    'infra_push',
    'finance',
    'stability',
  ];

  const CLUSTER_PARAMETER_ROWS = [
    { key: 'carbon_pressure' },
    { key: 'power_access' },
    { key: 'grid_readiness' },
    { key: 'hydrogen' },
    { key: 'co2_infra' },
    { key: 'permitting' },
    { key: 'finance' },
    { key: 'market_pull' },
    { key: 'stability' },
    { key: 'infra_push' },
  ];

  const EXPLORER_TABS = ['phaseMap', 'scenarioFrontier', 'morphologyNetwork', 'bottleneckHeatmap', 'dataTable'];

  const EXPLORER_COMPANIES = [
    { company: 'Agropolychim AD', cluster: 'Devnya', sector: 'Fertilizers', B_i: 4.0, T_i: 3.8, M_i: 3.5, E_i: 4.5, C_i: 3.5, K_i: 4.2, industrial_weight: 4.3, infra_dependency: 4.2, carbon_sensitivity: 4.3 },
    { company: 'Neochim AD', cluster: 'Dimitrovgrad', sector: 'Ammonia & nitric acid', B_i: 3.0, T_i: 2.8, M_i: 2.7, E_i: 4.7, C_i: 4.3, K_i: 4.0, industrial_weight: 4.1, infra_dependency: 4.0, carbon_sensitivity: 4.6 },
    { company: 'Solvay Sodi Bulgaria AD', cluster: 'Devnya', sector: 'Soda ash', B_i: 4.2, T_i: 3.2, M_i: 3.0, E_i: 5.0, C_i: 3.8, K_i: 4.5, industrial_weight: 4.8, infra_dependency: 4.8, carbon_sensitivity: 4.7 },
    { company: 'Heidelberg Materials Bulgaria', cluster: 'Devnya', sector: 'Cement', B_i: 4.3, T_i: 4.0, M_i: 3.7, E_i: 4.8, C_i: 3.4, K_i: 4.1, industrial_weight: 4.6, infra_dependency: 4.6, carbon_sensitivity: 4.5 },
    { company: 'Holcim Bulgaria AD', cluster: 'Vratsa', sector: 'Cement', B_i: 4.1, T_i: 3.9, M_i: 3.8, E_i: 4.4, C_i: 3.2, K_i: 3.8, industrial_weight: 3.9, infra_dependency: 4.0, carbon_sensitivity: 4.2 },
    { company: 'Lukoil Neftochim Burgas AD', cluster: 'Burgas', sector: 'Refining', B_i: 3.5, T_i: 2.3, M_i: 2.2, E_i: 5.0, C_i: 4.5, K_i: 4.7, industrial_weight: 5.0, infra_dependency: 4.9, carbon_sensitivity: 4.9 },
    { company: 'Orgachim AD', cluster: 'Ruse', sector: 'Coatings', B_i: 3.1, T_i: 3.4, M_i: 3.1, E_i: 2.7, C_i: 3.7, K_i: 2.8, industrial_weight: 2.8, infra_dependency: 2.9, carbon_sensitivity: 2.8 },
    { company: 'Biovet AD', cluster: 'Razgrad/Peshtera', sector: 'Vet pharma', B_i: 4.0, T_i: 4.1, M_i: 3.9, E_i: 2.8, C_i: 3.0, K_i: 3.6, industrial_weight: 3.6, infra_dependency: 3.8, carbon_sensitivity: 2.6 },
    { company: 'Svilosa AD', cluster: 'Svishtov', sector: 'Pulp', B_i: 3.6, T_i: 4.0, M_i: 3.4, E_i: 2.5, C_i: 3.1, K_i: 3.5, industrial_weight: 3.3, infra_dependency: 2.7, carbon_sensitivity: 2.4 },
    { company: 'Agria AD', cluster: 'Plovdiv', sector: 'Agrochemicals', B_i: 2.8, T_i: 3.2, M_i: 2.9, E_i: 2.2, C_i: 3.4, K_i: 2.6, industrial_weight: 2.2, infra_dependency: 2.3, carbon_sensitivity: 2.1 },
  ];

  const EXPLORER_EDGES = [
    { source: 'Agropolychim AD', target: 'Solvay Sodi Bulgaria AD', weight: 3, edge_type: 'cluster' },
    { source: 'Agropolychim AD', target: 'Heidelberg Materials Bulgaria', weight: 2, edge_type: 'cluster' },
    { source: 'Solvay Sodi Bulgaria AD', target: 'Heidelberg Materials Bulgaria', weight: 3, edge_type: 'cluster' },
    { source: 'Heidelberg Materials Bulgaria', target: 'Holcim Bulgaria AD', weight: 1, edge_type: 'sector' },
    { source: 'Neochim AD', target: 'Agropolychim AD', weight: 2, edge_type: 'sector' },
    { source: 'Orgachim AD', target: 'Agria AD', weight: 2, edge_type: 'formulation' },
    { source: 'Biovet AD', target: 'Orgachim AD', weight: 1, edge_type: 'utilities' },
    { source: 'Svilosa AD', target: 'Holcim Bulgaria AD', weight: 1, edge_type: 'industry' },
    { source: 'Lukoil Neftochim Burgas AD', target: 'Agropolychim AD', weight: 1, edge_type: 'national' },
  ];

  const CLUSTER_COPY = {
    en: {
      matrixTitle: 'Scenario squad',
      matrixDesc: 'Select a scenario from the roster to inspect its profile and how its attributes differ from the scenario average.',
      matrixNote: 'FM-style scores are shown on a 0-20 scale, while the raw model values stay on the original 0-1 scale.',
      scenarioMeta: 'policy scenario',
      supportLabel: 'Support',
      compareLabel: 'vs avg',
      rawLabel: 'raw',
      scoreScaleLabel: 'FM score',
      rosterTitle: 'Scenario roster',
      rosterDesc: 'Ordered like a squad list, with the strongest combined enablement at the top.',
      explorerTitle: 'Net-Zero Lab Scenario Explorer',
      explorerMissing: 'Streamlit phase map not found in this workspace.',
      detailKicker: 'Selected scenario',
      detailDesc: 'Key conditions and full input attributes used inside apply_scenario().',
      focusTitle: 'Key match attributes',
      fullTitle: 'Full attribute report',
      attributeLabel: 'Attribute',
      attributeHelpTitle: 'Model meaning',
      avgNote: 'Difference versus scenario average',
      headers: {
        scenario: 'Scenario',
        role: 'Role',
        support: 'SUP',
        infra: 'INF',
        finance: 'FIN',
        stability: 'STA',
      },
      themes: {
        pressure: 'Pressure',
        growth: 'Growth',
        defensive: 'Defence',
        volatile: 'Volatile',
        cluster: 'Cluster',
      },
      summaries: {
        pressure: 'High carbon-cost pressure with weak infrastructure and financing support.',
        growth: 'Strongly coordinated industrial policy with broad access to finance and infrastructure.',
        defensive: 'Industrial continuity first, but with limited transition acceleration.',
        volatile: 'Stop-go policymaking that keeps companies cautious and infrastructure delayed.',
        cluster: 'Shared infrastructure and coordinated delivery built around an industrial cluster model.',
      },
      labels: {
        carbon_pressure: 'Carbon pressure',
        power_access: 'Power access',
        grid_readiness: 'Grid readiness',
        hydrogen: 'Hydrogen availability',
        co2_infra: 'CO2 infrastructure',
        permitting: 'Permitting quality',
        finance: 'Finance support',
        market_pull: 'Market pull',
        stability: 'Policy stability',
        infra_push: 'Infrastructure push',
      },
      help: {
        carbon_pressure: 'Strength of carbon-cost pressure in the scenario.',
        power_access: 'Availability and quality of power access for electrification.',
        grid_readiness: 'Readiness of grid infrastructure for industrial transition.',
        hydrogen: 'Availability of hydrogen supply and related systems.',
        co2_infra: 'Readiness of CO2 transport, storage, or shared capture infrastructure.',
        permitting: 'Quality and speed of the permitting environment.',
        finance: 'Access to public or private transition finance.',
        market_pull: 'Demand-side support for low-carbon products.',
        stability: 'Consistency and predictability of policy signals.',
        infra_push: 'Derived in apply_scenario() from grid, hydrogen, and CO2 infrastructure readiness.',
      },
    },
    bg: {
      matrixTitle: 'Сценарен състав',
      matrixDesc: 'Избери сценарий от списъка, за да видиш профила му и как се различават показателите му спрямо средното за всички сценарии.',
      matrixNote: 'FM-стил оценките са показани по скала 0-20, а суровите стойности остават в оригиналната скала 0-1.',
      scenarioMeta: 'политически сценарий',
      supportLabel: 'Подкрепа',
      compareLabel: 'спрямо ср.',
      rawLabel: 'сурово',
      scoreScaleLabel: 'FM оценка',
      rosterTitle: 'Списък със сценарии',
      rosterDesc: 'Подредени са като състав, с най-силните общи условия за преход най-отгоре.',
      explorerTitle: 'Net-Zero Lab Scenario Explorer',
      explorerMissing: 'В този workspace не е намерен Streamlit phase map файл.',
      detailKicker: 'Избран сценарий',
      detailDesc: 'Ключовите условия и пълните входни атрибути, които се използват в apply_scenario().',
      focusTitle: 'Ключови атрибути',
      fullTitle: 'Пълен атрибутен отчет',
      attributeLabel: 'Показател',
      attributeHelpTitle: 'Значение в модела',
      avgNote: 'Разлика спрямо средното за сценариите',
      headers: {
        scenario: 'Сценарий',
        role: 'Роля',
        support: 'SUP',
        infra: 'INF',
        finance: 'FIN',
        stability: 'STA',
      },
      themes: {
        pressure: 'Натиск',
        growth: 'Растеж',
        defensive: 'Защита',
        volatile: 'Волатилен',
        cluster: 'Клъстер',
      },
      summaries: {
        pressure: 'Силен въглероден натиск, но слаба инфраструктурна и финансова подкрепа.',
        growth: 'Силно координирана индустриална политика с широк достъп до финансиране и инфраструктура.',
        defensive: 'Приоритет е индустриалната непрекъснатост, но ускорението на прехода е ограничено.',
        volatile: 'Непоследователна политика тип stop-go, която задържа компаниите и инфраструктурата.',
        cluster: 'Споделена инфраструктура и координирана реализация, изградени около индустриален клъстер.',
      },
      labels: {
        carbon_pressure: 'Въглероден натиск',
        power_access: 'Достъп до електроенергия',
        grid_readiness: 'Готовност на мрежата',
        hydrogen: 'Наличност на водород',
        co2_infra: 'CO2 инфраструктура',
        permitting: 'Качество на разрешителния режим',
        finance: 'Финансова подкрепа',
        market_pull: 'Пазарно търсене',
        stability: 'Стабилност на политиката',
        infra_push: 'Инфраструктурен импулс',
      },
      help: {
        carbon_pressure: 'Силата на въглеродния ценови натиск в сценария.',
        power_access: 'Наличност и качество на електрозахранването за електрификация.',
        grid_readiness: 'Готовност на мрежовата инфраструктура за индустриалния преход.',
        hydrogen: 'Наличност на водород и свързаните системи.',
        co2_infra: 'Готовност на CO2 транспорт, съхранение или споделена capture инфраструктура.',
        permitting: 'Качество и скорост на разрешителната среда.',
        finance: 'Достъп до публично или частно финансиране за прехода.',
        market_pull: 'Подкрепа от страна на търсенето за нисковъглеродни продукти.',
        stability: 'Последователност и предвидимост на policy сигналите.',
        infra_push: 'Производен термин в apply_scenario(), изчислен от готовността на мрежата, водорода и CO2 инфраструктурата.',
      },
    },
  };

  let activeClusterScenarioIndex = Math.max(
    0,
    CLUSTER_SCENARIOS.findIndex((scenario) => scenario.theme === 'cluster')
  );
  let activeClusterVizTab = 'phaseMap';

  Object.assign(CLUSTER_COPY.en, {
    explorerSubtitle: 'Business field vs. technology field sandbox from the Streamlit explorer.',
    plotlyMissing: 'Plotly is not loaded, so the explorer charts cannot be rendered.',
    tabs: {
      phaseMap: 'Phase Map',
      scenarioFrontier: 'Scenario Frontier',
      morphologyNetwork: 'Morphology Network',
      bottleneckHeatmap: 'Bottleneck Heatmap',
      dataTable: 'Data Table',
    },
    dataHeaders: {
      company: 'Company',
      cluster: 'Cluster',
      sector: 'Sector',
      business: 'B_eff',
      technology: 'T_eff',
      mobility: 'M_eff',
      phi: 'phi',
      depth: 'Depth',
      retention: 'Retention',
    },
  });

  Object.assign(CLUSTER_COPY.bg, {
    explorerSubtitle: 'Sandbox за business field vs. technology field, пренесен от Streamlit explorer-a.',
    plotlyMissing: 'Plotly не е зареден, затова explorer графиките не могат да се визуализират.',
    tabs: {
      phaseMap: 'Phase Map',
      scenarioFrontier: 'Scenario Frontier',
      morphologyNetwork: 'Morphology Network',
      bottleneckHeatmap: 'Bottleneck Heatmap',
      dataTable: 'Data Table',
    },
    dataHeaders: {
      company: 'Компания',
      cluster: 'Клъстер',
      sector: 'Сектор',
      business: 'B_eff',
      technology: 'T_eff',
      mobility: 'M_eff',
      phi: 'phi',
      depth: 'Дълбочина',
      retention: 'Задържане',
    },
  });

  function ensureClusterStyles() {
    if (document.getElementById('cluster-analysis-styles')) return;

    const style = document.createElement('style');
    style.id = 'cluster-analysis-styles';
    style.textContent = `
      .cluster-scenario-grid { display: block; }
      .cluster-fm-shell {
        --fm-line: rgba(119, 196, 220, 0.22);
        --fm-text: #e8f3f7;
        --fm-muted: #89a9ba;
        --fm-accent: #7ad8f7;
        display: grid;
        grid-template-columns: minmax(320px, 0.95fr) minmax(0, 1.45fr);
        gap: 1rem;
        align-items: start;
        color: var(--fm-text);
      }
      .cluster-fm-main {
        display: grid;
        align-content: start;
        gap: 1rem;
      }
      .cluster-fm-roster,
      .cluster-fm-detail {
        position: relative;
        overflow: hidden;
        border: 1px solid var(--fm-line);
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(19, 53, 77, 0.98) 0%, rgba(8, 23, 35, 0.98) 100%);
        box-shadow: 0 20px 40px rgba(4, 13, 22, 0.28);
      }
      .cluster-fm-roster::before,
      .cluster-fm-detail::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, transparent, var(--fm-accent), transparent);
      }
      .cluster-fm-detail.theme-pressure { --fm-accent: #ff986b; }
      .cluster-fm-detail.theme-growth { --fm-accent: #7ee3a5; }
      .cluster-fm-detail.theme-defensive { --fm-accent: #c6d0d9; }
      .cluster-fm-detail.theme-volatile { --fm-accent: #f4c563; }
      .cluster-fm-detail.theme-cluster { --fm-accent: #7ad8f7; }
      .cluster-fm-panel-head,
      .cluster-fm-detail-hero,
      .cluster-fm-section-head,
      .cluster-fm-attributes {
        padding-left: 1.1rem;
        padding-right: 1.1rem;
      }
      .cluster-fm-roster-top { display: block; }
      .cluster-fm-panel-head,
      .cluster-fm-detail-hero { padding-top: 1.1rem; }
      .cluster-fm-kicker {
        color: var(--fm-accent);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .cluster-fm-panel-title,
      .cluster-fm-section-title,
      .cluster-fm-detail-copy h3 {
        margin: 0.3rem 0 0;
        color: var(--fm-text);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-weight: 800;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .cluster-fm-panel-title { font-size: 0.78rem; line-height: 1.15; }
      .cluster-fm-explorer {
        display: grid;
        align-content: start;
        gap: 0.4rem;
        padding: 1rem 1.1rem 1.15rem;
        border-bottom: 1px solid rgba(119, 196, 220, 0.14);
      }
      .cluster-fm-explorer-card .cluster-fm-explorer {
        border-bottom: 0;
        min-height: 100%;
        box-sizing: border-box;
      }
      .cluster-fm-explorer-title {
        color: var(--fm-accent);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .cluster-fm-explorer-sub {
        color: var(--fm-muted);
        font-size: 0.5rem;
        line-height: 1.45;
      }
      .cluster-fm-viz-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin-top: 0.2rem;
      }
      .cluster-fm-viz-tab {
        padding: 0.34rem 0.55rem;
        border: 1px solid rgba(122, 216, 247, 0.18);
        border-radius: 999px;
        background: rgba(122, 216, 247, 0.05);
        color: var(--fm-muted);
        font-size: 0.5rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
      }
      .cluster-fm-viz-tab:hover,
      .cluster-fm-viz-tab:focus-visible {
        color: var(--fm-text);
        border-color: rgba(122, 216, 247, 0.32);
        outline: none;
      }
      .cluster-fm-viz-tab.active {
        background: rgba(122, 216, 247, 0.16);
        color: var(--fm-text);
        border-color: rgba(122, 216, 247, 0.36);
      }
      .cluster-fm-viz-canvas {
        min-height: 430px;
        margin-top: 0.2rem;
      }
      .cluster-fm-viz-empty {
        min-height: 430px;
        display: grid;
        place-items: center;
        border: 1px dashed rgba(122, 216, 247, 0.2);
        border-radius: 10px;
        color: var(--fm-muted);
        font-size: 0.54rem;
        line-height: 1.45;
        text-align: center;
        padding: 1rem;
      }
      .cluster-fm-data-table-wrap {
        overflow: auto;
        border: 1px solid rgba(122, 216, 247, 0.14);
        border-radius: 12px;
      }
      .cluster-fm-data-table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
      }
      .cluster-fm-data-table th,
      .cluster-fm-data-table td {
        padding: 0.5rem 0.55rem;
        border-bottom: 1px solid rgba(119, 196, 220, 0.12);
        text-align: left;
        font-size: 0.52rem;
      }
      .cluster-fm-data-table th {
        color: var(--fm-muted);
        font-family: 'DM Mono', monospace;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: rgba(122, 216, 247, 0.05);
      }
      .cluster-fm-data-table td {
        color: var(--fm-text);
      }
      .cluster-fm-data-table tbody tr:hover {
        background: rgba(122, 216, 247, 0.04);
      }
      .cluster-fm-detail-hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }
      .cluster-fm-detail-copy h3 { font-size: 1.16rem; line-height: 1; }
      .cluster-fm-detail-copy p,
      .cluster-fm-section-sub,
      .cluster-fm-attribute-help { color: var(--fm-muted); }
      .cluster-fm-detail-copy p {
        margin: 0.55rem 0 0;
        max-width: 60ch;
        font-size: 0.64rem;
        line-height: 1.5;
      }
      .cluster-fm-overall {
        min-width: 110px;
        padding: 0.9rem 1rem;
        border: 1px solid var(--fm-line);
        border-radius: 16px;
        background: linear-gradient(180deg, rgba(122, 216, 247, 0.12), rgba(10, 28, 41, 0.76));
        text-align: right;
      }
      .cluster-fm-overall span,
      .cluster-fm-overall small,
      .cluster-fm-row-scenario em,
      .cluster-fm-row-role,
      .cluster-fm-table-head,
      .cluster-fm-attribute-head {
        color: var(--fm-muted);
      }
      .cluster-fm-overall span,
      .cluster-fm-overall small,
      .cluster-fm-table-head,
      .cluster-fm-attribute-head {
        font-family: 'DM Mono', monospace;
        font-size: 0.5rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cluster-fm-overall strong {
        display: block;
        margin-top: 0.25rem;
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1.72rem;
        line-height: 0.95;
      }
      .cluster-fm-table { padding: 0.9rem 1.1rem 1.1rem; }
      .cluster-fm-roster-field {
        margin: 0 1.1rem 1.1rem;
        border: 1px solid rgba(122, 216, 247, 0.16);
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(122, 216, 247, 0.04), rgba(7, 18, 28, 0.3));
        overflow: hidden;
      }
      .cluster-fm-table-head,
      .cluster-fm-row {
        display: grid;
        grid-template-columns: 44px minmax(0, 2.3fr) minmax(88px, 0.9fr) repeat(4, 56px);
        align-items: center;
        gap: 0.7rem;
      }
      .cluster-fm-table-head {
        padding: 0 0.9rem 0.7rem;
        border-bottom: 1px solid var(--fm-line);
      }
      .cluster-fm-table-body { display: grid; }
      .cluster-fm-row {
        width: 100%;
        margin: 0;
        padding: 0.44rem 0.9rem;
        border: 0;
        border-bottom: 1px solid rgba(119, 196, 220, 0.12);
        background: transparent;
        color: var(--fm-text);
        text-align: left;
        cursor: pointer;
        transition: background 0.16s ease, box-shadow 0.16s ease;
      }
      .cluster-fm-row:last-child { border-bottom: 0; }
      .cluster-fm-row:hover,
      .cluster-fm-row:focus-visible {
        background: rgba(122, 216, 247, 0.08);
        outline: none;
      }
      .cluster-fm-row.active {
        background: linear-gradient(90deg, rgba(122, 216, 247, 0.16), rgba(122, 216, 247, 0.05));
        box-shadow: inset 3px 0 0 var(--fm-accent);
      }
      .cluster-fm-row-rank,
      .cluster-fm-row-stat,
      .cluster-fm-attribute-score,
      .cluster-fm-attribute-raw { font-family: 'DM Mono', monospace; }
      .cluster-fm-row-rank {
        color: var(--fm-accent);
        font-size: 0.63rem;
        font-weight: 700;
      }
      .cluster-fm-row-scenario strong {
        display: block;
        color: var(--fm-text);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 0.73rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cluster-fm-row-scenario em {
        display: none;
        font-style: normal;
        font-size: 0.5rem;
        letter-spacing: 0.04em;
      }
      .cluster-fm-row-role {
        font-size: 0.55rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cluster-fm-row-stat {
        font-size: 0.62rem;
        font-weight: 700;
        text-align: center;
      }
      .cluster-fm-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
        padding-top: 0.2rem;
      }
      .cluster-fm-section-title {
        position: relative;
        display: inline-block;
        padding-bottom: 0.35rem;
        font-size: 0.7rem;
      }
      .cluster-fm-section-title::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--fm-accent), transparent);
      }
      .cluster-fm-section-sub { margin-top: 0.22rem; font-size: 0.57rem; }
      .cluster-fm-focus-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.8rem;
        padding: 0.9rem 1.1rem 0;
      }
      .cluster-fm-focus-card {
        padding: 0.85rem 0.9rem;
        border: 1px solid var(--fm-line);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(18, 44, 63, 0.94), rgba(9, 24, 36, 0.9));
      }
      .cluster-fm-focus-card.up { border-color: rgba(126, 227, 165, 0.34); }
      .cluster-fm-focus-card.down { border-color: rgba(255, 152, 107, 0.34); }
      .cluster-fm-focus-card.flat { border-color: rgba(198, 208, 217, 0.26); }
      .cluster-fm-focus-head,
      .cluster-fm-focus-sub {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.6rem;
      }
      .cluster-fm-focus-head span {
        color: var(--fm-text);
        font-size: 0.59rem;
        font-weight: 700;
        line-height: 1.35;
      }
      .cluster-fm-focus-head strong {
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1.16rem;
        line-height: 1;
      }
      .cluster-fm-focus-sub {
        margin-top: 0.35rem;
        color: var(--fm-muted);
        font-size: 0.51rem;
      }
      .cluster-fm-delta {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.16rem 0.45rem;
        border-radius: 999px;
        font-family: 'DM Mono', monospace;
        font-size: 0.49rem;
        font-weight: 700;
      }
      .cluster-fm-delta.up { color: #7ee3a5; background: rgba(126, 227, 165, 0.12); }
      .cluster-fm-delta.down { color: #ff986b; background: rgba(255, 152, 107, 0.12); }
      .cluster-fm-delta.flat { color: #c6d0d9; background: rgba(198, 208, 217, 0.12); }
      .cluster-fm-attributes { padding-bottom: 1.1rem; }
      .cluster-fm-attribute-head,
      .cluster-fm-attribute-row {
        display: grid;
        grid-template-columns: minmax(0, 1.9fr) 64px 64px 92px;
        gap: 0.8rem;
        align-items: center;
      }
      .cluster-fm-attribute-head {
        padding: 0 0 0.65rem;
        border-bottom: 1px solid var(--fm-line);
      }
      .cluster-fm-attribute-body { display: grid; }
      .cluster-fm-attribute-row {
        padding: 0.78rem 0;
        border-bottom: 1px solid rgba(119, 196, 220, 0.1);
      }
      .cluster-fm-attribute-row:last-child { border-bottom: 0; }
      .cluster-fm-attribute-main { display: grid; gap: 0.18rem; }
      .cluster-fm-attribute-label-wrap {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        min-width: 0;
      }
      .cluster-fm-attribute-label { color: var(--fm-text); font-size: 0.57rem; font-weight: 700; }
      .cluster-fm-info {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 0.9rem;
        height: 0.9rem;
        border: 1px solid rgba(122, 216, 247, 0.28);
        border-radius: 999px;
        color: var(--fm-accent);
        font-family: 'DM Mono', monospace;
        font-size: 0.47rem;
        font-weight: 700;
        line-height: 1;
        cursor: help;
        background: rgba(122, 216, 247, 0.08);
      }
      .cluster-fm-info-tip {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 0.45rem);
        z-index: 5;
        width: min(220px, 44vw);
        padding: 0.45rem 0.55rem;
        border: 1px solid rgba(122, 216, 247, 0.24);
        border-radius: 10px;
        background: rgba(7, 18, 28, 0.96);
        color: var(--fm-text);
        font-size: 0.5rem;
        line-height: 1.45;
        text-transform: none;
        letter-spacing: normal;
        opacity: 0;
        visibility: hidden;
        transform: translate(-50%, 0.2rem);
        transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease;
        pointer-events: none;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.24);
      }
      .cluster-fm-info:hover .cluster-fm-info-tip,
      .cluster-fm-info:focus-visible .cluster-fm-info-tip {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, 0);
      }
      .cluster-fm-attribute-score,
      .cluster-fm-attribute-raw {
        font-size: 0.57rem;
        font-weight: 700;
        text-align: center;
      }
      .cluster-fm-attribute-delta { display: flex; justify-content: flex-end; }
      .cluster-fm-row-stat.cluster-score-high,
      .cluster-fm-focus-head strong.cluster-score-high,
      .cluster-fm-overall strong.cluster-score-high,
      .cluster-fm-attribute-score.cluster-score-high,
      .cluster-fm-attribute-raw.cluster-score-high { color: #7ee3a5; }
      .cluster-fm-row-stat.cluster-score-mid,
      .cluster-fm-focus-head strong.cluster-score-mid,
      .cluster-fm-overall strong.cluster-score-mid,
      .cluster-fm-attribute-score.cluster-score-mid,
      .cluster-fm-attribute-raw.cluster-score-mid { color: #7ad8f7; }
      .cluster-fm-row-stat.cluster-score-low,
      .cluster-fm-focus-head strong.cluster-score-low,
      .cluster-fm-overall strong.cluster-score-low,
      .cluster-fm-attribute-score.cluster-score-low,
      .cluster-fm-attribute-raw.cluster-score-low { color: #f4c563; }
      .cluster-fm-row-stat.cluster-score-weak,
      .cluster-fm-focus-head strong.cluster-score-weak,
      .cluster-fm-overall strong.cluster-score-weak,
      .cluster-fm-attribute-score.cluster-score-weak,
      .cluster-fm-attribute-raw.cluster-score-weak { color: #ff986b; }
      @media (max-width: 1200px) {
        .cluster-fm-shell { grid-template-columns: 1fr; }
        .cluster-fm-focus-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .cluster-fm-viz-canvas,
        .cluster-fm-viz-empty { min-height: 380px; }
      }
      @media (max-width: 900px) {
        .cluster-fm-detail-hero { flex-direction: column; }
        .cluster-fm-overall { min-width: 0; width: 100%; text-align: left; }
        .cluster-fm-focus-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .cluster-fm-table,
        .cluster-fm-attributes { overflow-x: auto; }
        .cluster-fm-table-head,
        .cluster-fm-row { min-width: 760px; }
        .cluster-fm-attribute-head,
        .cluster-fm-attribute-row { min-width: 640px; }
        .cluster-fm-info-tip { width: min(200px, 56vw); }
      }
      @media (max-width: 560px) {
        .cluster-fm-focus-grid { grid-template-columns: 1fr; }
        .cluster-fm-detail-copy h3 { font-size: 0.97rem; }
        .cluster-fm-info-tip { width: min(180px, 68vw); }
      }
    `;

    document.head.appendChild(style);
  }

  function escape(value) {
    if (typeof root.escapeHtml === 'function') return root.escapeHtml(value);
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getLanguage() {
    if (typeof root.getLanguage === 'function') return root.getLanguage();
    return document.documentElement.getAttribute('data-lang') || 'en';
  }

  function getCopy() {
    return CLUSTER_COPY[getLanguage()] || CLUSTER_COPY.en;
  }

  function getScenarioName(scenario) {
    const lang = getLanguage();
    if (scenario.name && typeof scenario.name === 'object') {
      return scenario.name[lang] || scenario.name.en || '';
    }
    return scenario.name || '';
  }

  function getScenarioValue(scenario, key) {
    if (key === 'infra_push') {
      return (scenario.grid_readiness + scenario.hydrogen + scenario.co2_infra) / 3;
    }
    return scenario[key];
  }

  function getScenarioAverage(scenario) {
    const keys = ['power_access', 'grid_readiness', 'hydrogen', 'co2_infra', 'permitting', 'finance', 'market_pull', 'stability'];
    const total = keys.reduce((sum, key) => sum + scenario[key], 0);
    return total / keys.length;
  }

  function getAverageValue(key) {
    const total = CLUSTER_SCENARIOS.reduce((sum, scenario) => sum + getScenarioValue(scenario, key), 0);
    return total / CLUSTER_SCENARIOS.length;
  }

  function getScore(value) {
    return Math.round(value * 20);
  }

  function getScoreTone(value) {
    if (value >= 0.75) return 'cluster-score-high';
    if (value >= 0.55) return 'cluster-score-mid';
    if (value >= 0.35) return 'cluster-score-low';
    return 'cluster-score-weak';
  }

  function getDeltaTone(delta) {
    if (delta > 0.04) return 'up';
    if (delta < -0.04) return 'down';
    return 'flat';
  }

  function formatDelta(delta) {
    const points = Math.round(delta * 20 * 10) / 10;
    const sign = points > 0 ? '+' : '';
    return `${sign}${points.toFixed(1)}`;
  }

  function clampValue(value, lower = 1, upper = 5) {
    return Math.max(lower, Math.min(upper, value));
  }

  function toPlotLabel(scenario) {
    return getScenarioName(scenario);
  }

  function applyScenarioToCompanies(scenario) {
    const infraPush = (scenario.grid_readiness + scenario.hydrogen + scenario.co2_infra) / 3;

    return EXPLORER_COMPANIES.map((company) => {
      const B_eff = clampValue(
        company.B_i
        + 0.8 * scenario.market_pull
        + 0.6 * scenario.stability
        + 0.5 * scenario.finance
        - 0.9 * scenario.carbon_pressure * (company.carbon_sensitivity / 5)
      );

      const T_eff = clampValue(
        company.T_i
        + 0.8 * scenario.power_access
        + 0.7 * infraPush * (company.infra_dependency / 5)
        + 0.4 * scenario.finance
        + 0.3 * scenario.permitting
      );

      const M_eff = clampValue(
        company.M_i
        + 0.9 * scenario.finance
        + 0.9 * scenario.permitting
        + 0.7 * infraPush
        + 0.5 * scenario.stability
        - 0.4 * (1 - scenario.stability)
      );

      const phi = B_eff - T_eff;
      const decarbonisation_depth = clampValue(
        0.35 * T_eff + 0.35 * M_eff + 0.25 * scenario.carbon_pressure + 0.05 * scenario.power_access
      );
      const competitiveness_retention = clampValue(
        0.45 * B_eff + 0.20 * scenario.market_pull + 0.20 * scenario.stability + 0.15 * scenario.finance
      );

      return {
        ...company,
        B_eff,
        T_eff,
        M_eff,
        phi,
        decarbonisation_depth,
        competitiveness_retention,
        bicontinuous_score: 5 - Math.abs(phi) * 1.3,
        bottleneck_finance: 5 - clampValue(company.M_i + scenario.finance),
        bottleneck_permitting: 5 - clampValue(company.M_i + scenario.permitting),
        bottleneck_infrastructure: 5 - clampValue(company.T_i + infraPush),
        bottleneck_market: 5 - clampValue(company.B_i + scenario.market_pull),
      };
    });
  }

  function buildScenarioFrontierData() {
    return CLUSTER_SCENARIOS.map((scenario) => {
      const rows = applyScenarioToCompanies(scenario);
      const avg = (key) => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
      const weightedRetention = rows.reduce((sum, row) => sum + row.industrial_weight * row.competitiveness_retention, 0)
        / rows.reduce((sum, row) => sum + row.industrial_weight, 0);

      return {
        scenario: toPlotLabel(scenario),
        decarbonisation_depth: avg('decarbonisation_depth'),
        competitiveness_retention: avg('competitiveness_retention'),
        bicontinuous_share: rows.filter((row) => Math.abs(row.phi) <= 0.75).length / rows.length * 100,
        retained_capacity: weightedRetention,
      };
    });
  }

  function getClusterPalette() {
    return {
      Devnya: '#5cc8ff',
      Dimitrovgrad: '#7ee3a5',
      Vratsa: '#f4c563',
      Burgas: '#ff986b',
      Ruse: '#d1b3ff',
      'Razgrad/Peshtera': '#f48fb1',
      Svishtov: '#9be7c4',
      Plovdiv: '#c6d0d9',
    };
  }

  function buildNetworkPositions(rows) {
    const clusters = [...new Set(rows.map((row) => row.cluster))];
    const xByCluster = Object.fromEntries(clusters.map((cluster, index) => [cluster, index * 1.25]));
    const grouped = rows.reduce((acc, row) => {
      (acc[row.cluster] ||= []).push(row);
      return acc;
    }, {});
    const positions = {};

    clusters.forEach((cluster) => {
      const group = grouped[cluster].slice().sort((a, b) => b.industrial_weight - a.industrial_weight);
      const midpoint = (group.length - 1) / 2;
      group.forEach((row, index) => {
        positions[row.company] = {
          x: xByCluster[cluster],
          y: midpoint - index,
        };
      });
    });

    return positions;
  }

  function buildDataTable(copy, rows) {
    const headers = copy.dataHeaders;
    const format = (value) => typeof value === 'number' ? value.toFixed(2) : value;
    return `
      <div class="cluster-fm-data-table-wrap">
        <table class="cluster-fm-data-table">
          <thead>
            <tr>
              <th>${escape(headers.company)}</th>
              <th>${escape(headers.cluster)}</th>
              <th>${escape(headers.sector)}</th>
              <th>${escape(headers.business)}</th>
              <th>${escape(headers.technology)}</th>
              <th>${escape(headers.mobility)}</th>
              <th>${escape(headers.phi)}</th>
              <th>${escape(headers.depth)}</th>
              <th>${escape(headers.retention)}</th>
            </tr>
          </thead>
          <tbody>
            ${rows.slice().sort((a, b) => a.cluster.localeCompare(b.cluster) || a.company.localeCompare(b.company)).map((row) => `
              <tr>
                <td>${escape(row.company)}</td>
                <td>${escape(row.cluster)}</td>
                <td>${escape(row.sector)}</td>
                <td>${format(row.B_eff)}</td>
                <td>${format(row.T_eff)}</td>
                <td>${format(row.M_eff)}</td>
                <td>${format(row.phi)}</td>
                <td>${format(row.decarbonisation_depth)}</td>
                <td>${format(row.competitiveness_retention)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function getScenarioSummary(scenario) {
    const copy = getCopy();
    return copy.summaries?.[scenario.theme] || '';
  }

  function renderExplorerTab(selectedScenario) {
    const copy = getCopy();
    const mount = document.getElementById('clusterExplorerCanvas');
    if (!mount) return;

    const scenarioRows = applyScenarioToCompanies(selectedScenario);
    const frontierRows = buildScenarioFrontierData();

    if (activeClusterVizTab === 'dataTable') {
      mount.innerHTML = buildDataTable(copy, scenarioRows);
      return;
    }

    if (!root.Plotly) {
      mount.innerHTML = `<div class="cluster-fm-viz-empty">${escape(copy.plotlyMissing)}</div>`;
      return;
    }

    const palette = getClusterPalette();
    const config = { displayModeBar: false, responsive: true };
    const commonLayout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(7, 18, 28, 0.34)',
      font: { color: '#e8f3f7', family: 'DM Sans, sans-serif', size: 10 },
      margin: { l: 48, r: 18, t: 46, b: 40 },
      height: 430,
    };
    const axisStyle = {
      gridcolor: 'rgba(137, 169, 186, 0.14)',
      zerolinecolor: 'rgba(137, 169, 186, 0.12)',
      linecolor: 'rgba(137, 169, 186, 0.14)',
      tickfont: { color: '#c8d9e2', size: 10 },
      titlefont: { color: '#e8f3f7', size: 11 },
    };

    if (activeClusterVizTab === 'phaseMap') {
      const phaseTrace = {
        type: 'scatter',
        mode: 'markers+text',
        x: scenarioRows.map((row) => row.T_eff),
        y: scenarioRows.map((row) => row.B_eff),
        text: scenarioRows.map((row) => row.company),
        textposition: 'top center',
        hovertemplate: '%{text}<br>Cluster: %{customdata[0]}<br>Technology: %{x:.2f}<br>Business: %{y:.2f}<extra></extra>',
        customdata: scenarioRows.map((row) => [row.cluster]),
        marker: {
          size: scenarioRows.map((row) => row.industrial_weight * 8),
          color: scenarioRows.map((row) => palette[row.cluster] || '#7ad8f7'),
          line: { color: '#081723', width: 1 },
          opacity: 0.9,
        },
      };

      root.Plotly.newPlot(mount, [phaseTrace], {
        ...commonLayout,
        title: { text: 'Business field vs. technology field (Phase map)', font: { size: 13 } },
        xaxis: { ...axisStyle, title: 'Technology field', range: [1, 5.2] },
        yaxis: { ...axisStyle, title: 'Business field', range: [1, 5.2] },
        shapes: [
          { type: 'line', x0: 3, x1: 3, y0: 1, y1: 5.2, line: { color: '#94a3b8', dash: 'dash', width: 1 } },
          { type: 'line', x0: 1, x1: 5.2, y0: 3, y1: 3, line: { color: '#94a3b8', dash: 'dash', width: 1 } },
        ],
      }, config);
      return;
    }

    if (activeClusterVizTab === 'scenarioFrontier') {
      const frontierTrace = {
        type: 'scatter',
        mode: 'markers+text',
        x: frontierRows.map((row) => row.competitiveness_retention),
        y: frontierRows.map((row) => row.decarbonisation_depth),
        text: frontierRows.map((row) => row.scenario),
        textposition: 'top center',
        marker: {
          size: frontierRows.map((row) => Math.max(16, row.bicontinuous_share * 0.36)),
          color: ['#ff986b', '#7ee3a5', '#c6d0d9', '#f4c563', '#7ad8f7'],
          line: { color: '#081723', width: 1 },
          opacity: 0.92,
        },
        customdata: frontierRows.map((row) => [row.bicontinuous_share, row.retained_capacity]),
        hovertemplate: '%{text}<br>Competitiveness: %{x:.2f}<br>Depth: %{y:.2f}<br>Bicontinuous share: %{customdata[0]:.1f}%<br>Retained capacity: %{customdata[1]:.2f}<extra></extra>',
      };

      root.Plotly.newPlot(mount, [frontierTrace], {
        ...commonLayout,
        title: { text: 'Scenario Frontier', font: { size: 13 } },
        xaxis: { ...axisStyle, title: 'Competitiveness retention', range: [1, 5.2] },
        yaxis: { ...axisStyle, title: 'Decarbonisation depth', range: [1, 5.2] },
      }, config);
      return;
    }

    if (activeClusterVizTab === 'morphologyNetwork') {
      const positions = buildNetworkPositions(scenarioRows);
      const edgeX = [];
      const edgeY = [];

      EXPLORER_EDGES.forEach((edge) => {
        const source = positions[edge.source];
        const target = positions[edge.target];
        if (!source || !target) return;
        edgeX.push(source.x, target.x, null);
        edgeY.push(source.y, target.y, null);
      });

      const edgeTrace = {
        type: 'scatter',
        mode: 'lines',
        x: edgeX,
        y: edgeY,
        hoverinfo: 'none',
        line: { color: '#94a3b8', width: 1 },
        showlegend: false,
      };

      const nodeTrace = {
        type: 'scatter',
        mode: 'markers+text',
        x: scenarioRows.map((row) => positions[row.company].x),
        y: scenarioRows.map((row) => positions[row.company].y),
        text: scenarioRows.map((row) => row.company),
        textposition: 'top center',
        hovertemplate: '%{text}<br>Cluster: %{customdata[0]}<br>phi: %{marker.color:.2f}<extra></extra>',
        customdata: scenarioRows.map((row) => [row.cluster]),
        marker: {
          size: scenarioRows.map((row) => 12 + row.industrial_weight * 4.5),
          color: scenarioRows.map((row) => row.phi),
          colorscale: 'RdBu',
          cmid: 0,
          line: { color: '#081723', width: 1 },
          colorbar: {
            title: 'phi = B - T',
            tickfont: { color: '#c8d9e2' },
            titlefont: { color: '#e8f3f7' },
          },
        },
        showlegend: false,
      };

      root.Plotly.newPlot(mount, [edgeTrace, nodeTrace], {
        ...commonLayout,
        title: { text: 'Morphology Network', font: { size: 13 } },
        xaxis: { visible: false },
        yaxis: { visible: false },
      }, config);
      return;
    }

    if (activeClusterVizTab === 'bottleneckHeatmap') {
      const heatZ = [
        scenarioRows.map((row) => row.bottleneck_finance),
        scenarioRows.map((row) => row.bottleneck_permitting),
        scenarioRows.map((row) => row.bottleneck_infrastructure),
        scenarioRows.map((row) => row.bottleneck_market),
      ];

      root.Plotly.newPlot(mount, [{
        type: 'heatmap',
        z: heatZ,
        x: scenarioRows.map((row) => row.company),
        y: ['Finance', 'Permitting', 'Infrastructure', 'Market'],
        colorscale: 'YlOrRd',
        hovertemplate: '%{x}<br>%{y}: %{z:.2f}<extra></extra>',
        colorbar: {
          title: 'Severity',
          tickfont: { color: '#c8d9e2' },
          titlefont: { color: '#e8f3f7' },
        },
      }], {
        ...commonLayout,
        title: { text: 'Bottleneck Heatmap', font: { size: 13 } },
        xaxis: { ...axisStyle, tickangle: -28 },
        yaxis: { ...axisStyle },
      }, config);
    }
  }

  function setActiveClusterScenario(index) {
    const next = Number(index);
    if (!Number.isInteger(next) || next < 0 || next >= CLUSTER_SCENARIOS.length) return;
    activeClusterScenarioIndex = next;
    renderClusterAnalysis();
  }

  function setActiveClusterVizTab(tabId) {
    if (!EXPLORER_TABS.includes(tabId)) return;
    activeClusterVizTab = tabId;
    renderClusterAnalysis();
  }

  function renderClusterAnalysis() {
    ensureClusterStyles();

    const scenarioGrid = document.getElementById('clusterScenarioGrid');
    if (!scenarioGrid) return;

    const copy = getCopy();
    const matrixTitle = document.getElementById('clusterMatrixTitle');
    const matrixDesc = document.getElementById('clusterMatrixDesc');
    const matrixNote = document.getElementById('clusterScenarioNote');

    if (matrixTitle) matrixTitle.textContent = copy.matrixTitle;
    if (matrixDesc) matrixDesc.textContent = copy.matrixDesc;
    if (matrixNote) matrixNote.textContent = copy.matrixNote;

    if (!CLUSTER_SCENARIOS[activeClusterScenarioIndex]) {
      activeClusterScenarioIndex = 0;
    }

    const selectedScenario = CLUSTER_SCENARIOS[activeClusterScenarioIndex];
    const rankedScenarios = CLUSTER_SCENARIOS
      .map((scenario, index) => ({
        scenario,
        index,
        support: getScenarioAverage(scenario),
        infra: getScenarioValue(scenario, 'infra_push'),
      }))
      .sort((a, b) => b.support - a.support);

    const focusCards = CLUSTER_SCENARIO_FOCUS_KEYS.map((key) => {
      const value = getScenarioValue(selectedScenario, key);
      const avg = getAverageValue(key);
      const delta = value - avg;
      const deltaTone = getDeltaTone(delta);
      const scoreTone = getScoreTone(value);

      return `
        <article class="cluster-fm-focus-card ${deltaTone}">
          <div class="cluster-fm-focus-head">
            <span>${escape(copy.labels[key] || key)}</span>
            <strong class="${scoreTone}">${getScore(value)}</strong>
          </div>
          <div class="cluster-fm-focus-sub">
            <span>${escape(copy.rawLabel)} ${value.toFixed(2)}</span>
            <span class="cluster-fm-delta ${deltaTone}">${escape(copy.compareLabel)} ${formatDelta(delta)}</span>
          </div>
        </article>
      `;
    }).join('');

  const attributeRows = CLUSTER_PARAMETER_ROWS.map(({ key }) => {
    const value = getScenarioValue(selectedScenario, key);
    const delta = value - getAverageValue(key);
    const deltaTone = getDeltaTone(delta);
    const tone = getScoreTone(value);

      return `
      <div class="cluster-fm-attribute-row">
        <div class="cluster-fm-attribute-main">
          <div class="cluster-fm-attribute-label-wrap">
            <div class="cluster-fm-attribute-label">${escape(copy.labels[key] || key)}</div>
            <span class="cluster-fm-info" tabindex="0" aria-label="${escape(copy.help[key] || '')}">
              i
              <span class="cluster-fm-info-tip">${escape(copy.help[key] || '')}</span>
            </span>
          </div>
        </div>
        <div class="cluster-fm-attribute-score ${tone}">${getScore(value)}</div>
        <div class="cluster-fm-attribute-raw ${tone}">${value.toFixed(2)}</div>
        <div class="cluster-fm-attribute-delta">
          <span class="cluster-fm-delta ${deltaTone}">${formatDelta(delta)}</span>
        </div>
        </div>
      `;
    }).join('');

    scenarioGrid.innerHTML = `
      <div class="cluster-fm-shell">
        <div class="cluster-fm-main">
          <section class="cluster-fm-roster">
            <div class="cluster-fm-panel-head">
              <div class="cluster-fm-roster-top">
                <div>
                  <div class="cluster-fm-kicker">${escape(copy.rosterTitle)}</div>
                  <div class="cluster-fm-panel-title">${escape(copy.rosterDesc)}</div>
                </div>
              </div>
            </div>
            <div class="cluster-fm-roster-field">
              <div class="cluster-fm-table">
                <div class="cluster-fm-table-head">
                  <span>#</span>
                  <span>${escape(copy.headers.scenario)}</span>
                  <span>${escape(copy.headers.role)}</span>
                  <span>${escape(copy.headers.support)}</span>
                  <span>${escape(copy.headers.infra)}</span>
                  <span>${escape(copy.headers.finance)}</span>
                  <span>${escape(copy.headers.stability)}</span>
                </div>
                <div class="cluster-fm-table-body">
                  ${rankedScenarios.map((entry, rank) => {
                    const isActive = entry.index === activeClusterScenarioIndex;
                    return `
                      <button type="button" class="cluster-fm-row theme-${escape(entry.scenario.theme || 'cluster')} ${isActive ? 'active' : ''}" onclick="setActiveClusterScenario(${entry.index})">
                        <span class="cluster-fm-row-rank">${String(rank + 1).padStart(2, '0')}</span>
                        <span class="cluster-fm-row-scenario">
                          <strong>${escape(getScenarioName(entry.scenario))}</strong>
                          <em>${escape(copy.scenarioMeta)}</em>
                        </span>
                        <span class="cluster-fm-row-role">${escape(copy.themes?.[entry.scenario.theme] || entry.scenario.theme || '')}</span>
                        <span class="cluster-fm-row-stat ${getScoreTone(entry.support)}">${getScore(entry.support)}</span>
                        <span class="cluster-fm-row-stat ${getScoreTone(entry.infra)}">${getScore(entry.infra)}</span>
                        <span class="cluster-fm-row-stat ${getScoreTone(entry.scenario.finance)}">${getScore(entry.scenario.finance)}</span>
                        <span class="cluster-fm-row-stat ${getScoreTone(entry.scenario.stability)}">${getScore(entry.scenario.stability)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </section>

          <section class="cluster-fm-detail theme-${escape(selectedScenario.theme || 'cluster')}">
            <div class="cluster-fm-detail-hero">
              <div class="cluster-fm-detail-copy">
                <div class="cluster-fm-kicker">${escape(copy.detailKicker)}</div>
                <h3>${escape(getScenarioName(selectedScenario))}</h3>
                <p>${escape(getScenarioSummary(selectedScenario))}</p>
              </div>
            <div class="cluster-fm-overall">
              <span>${escape(copy.supportLabel)}</span>
              <strong class="${getScoreTone(getScenarioAverage(selectedScenario))}">${getScore(getScenarioAverage(selectedScenario))}</strong>
              <small>${escape(copy.scoreScaleLabel)}</small>
            </div>
          </div>

            <div class="cluster-fm-section-head">
              <div>
                <div class="cluster-fm-section-title">${escape(copy.focusTitle)}</div>
                <div class="cluster-fm-section-sub">${escape(copy.avgNote)}</div>
              </div>
            </div>
            <div class="cluster-fm-focus-grid">${focusCards}</div>

            <div class="cluster-fm-section-head">
              <div>
                <div class="cluster-fm-section-title">${escape(copy.fullTitle)}</div>
                <div class="cluster-fm-section-sub">${escape(copy.detailDesc)}</div>
              </div>
            </div>
            <div class="cluster-fm-attributes">
              <div class="cluster-fm-attribute-head">
                <span>${escape(copy.attributeLabel)}</span>
                <span>${escape(copy.scoreScaleLabel)}</span>
                <span>${escape(copy.rawLabel)}</span>
                <span>${escape(copy.compareLabel)}</span>
              </div>
              <div class="cluster-fm-attribute-body">${attributeRows}</div>
            </div>
          </section>
        </div>

        <section class="cluster-fm-detail cluster-fm-explorer-card theme-${escape(selectedScenario.theme || 'cluster')}">
          <div class="cluster-fm-explorer">
            <div class="cluster-fm-explorer-title">${escape(copy.explorerTitle)}</div>
            <div class="cluster-fm-explorer-sub">${escape(copy.explorerSubtitle)}</div>
            <div class="cluster-fm-viz-tabs">
              ${EXPLORER_TABS.map((tabId) => `
                <button type="button" class="cluster-fm-viz-tab ${activeClusterVizTab === tabId ? 'active' : ''}" onclick="setActiveClusterVizTab('${tabId}')">
                  ${escape(copy.tabs?.[tabId] || tabId)}
                </button>
              `).join('')}
            </div>
            <div class="cluster-fm-viz-canvas" id="clusterExplorerCanvas"></div>
          </div>
        </section>
      </div>
    `;

    renderExplorerTab(selectedScenario);
  }

  root.ClusterAnalysis = {
    render: renderClusterAnalysis,
    setActiveScenario: setActiveClusterScenario,
    setActiveTab: setActiveClusterVizTab,
  };
  root.renderClusterAnalysis = renderClusterAnalysis;
  root.setActiveClusterScenario = setActiveClusterScenario;
  root.setActiveClusterVizTab = setActiveClusterVizTab;
})();
