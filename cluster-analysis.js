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
      stability: 0.35,
      permitting: 0.25,
      power_access: 0.35,
      power_price_visibility: 0.20,
      grid_readiness: 0.30,
      hydrogen: 0.25,
      co2_infra: 0.20,
      finance: 0.30,
      engineering_capacity: 0.30,
      cluster_coordination: 0.25,
      market_pull: 0.25,
      market_push: 0.20,
      offtake_bankability: 0.18,
      certification_traceability: 0.22,
    },
    {
      name: {
        en: 'Coordinated green industrial policy',
        bg: 'Координирана зелена индустриална политика',
      },
      theme: 'growth',
      carbon_pressure: 0.85,
      stability: 0.80,
      permitting: 0.75,
      power_access: 0.80,
      power_price_visibility: 0.78,
      grid_readiness: 0.80,
      hydrogen: 0.70,
      co2_infra: 0.70,
      finance: 0.80,
      engineering_capacity: 0.78,
      cluster_coordination: 0.82,
      market_pull: 0.75,
      market_push: 0.76,
      offtake_bankability: 0.74,
      certification_traceability: 0.72,
    },
    {
      name: {
        en: 'Defensive industrial continuity',
        bg: 'Защитна индустриална непрекъснатост',
      },
      theme: 'defensive',
      carbon_pressure: 0.40,
      stability: 0.55,
      permitting: 0.45,
      power_access: 0.45,
      power_price_visibility: 0.42,
      grid_readiness: 0.45,
      hydrogen: 0.20,
      co2_infra: 0.20,
      finance: 0.40,
      engineering_capacity: 0.48,
      cluster_coordination: 0.38,
      market_pull: 0.30,
      market_push: 0.28,
      offtake_bankability: 0.32,
      certification_traceability: 0.36,
    },
    {
      name: {
        en: 'Volatile stop-go policy',
        bg: 'Непоследователна stop-go политика',
      },
      theme: 'volatile',
      carbon_pressure: 0.70,
      stability: 0.20,
      permitting: 0.25,
      power_access: 0.45,
      power_price_visibility: 0.22,
      grid_readiness: 0.40,
      hydrogen: 0.25,
      co2_infra: 0.25,
      finance: 0.45,
      engineering_capacity: 0.35,
      cluster_coordination: 0.22,
      market_pull: 0.35,
      market_push: 0.26,
      offtake_bankability: 0.24,
      certification_traceability: 0.30,
    },
    {
      name: {
        en: 'Cluster covenant strategy',
        bg: 'Стратегия за клъстерен пакт',
      },
      theme: 'cluster',
      carbon_pressure: 0.80,
      stability: 0.75,
      permitting: 0.80,
      power_access: 0.70,
      power_price_visibility: 0.68,
      grid_readiness: 0.75,
      hydrogen: 0.55,
      co2_infra: 0.75,
      finance: 0.75,
      engineering_capacity: 0.72,
      cluster_coordination: 0.90,
      market_pull: 0.65,
      market_push: 0.70,
      offtake_bankability: 0.68,
      certification_traceability: 0.74,
    },
  ];

  const CLUSTER_PARAMETER_GROUPS = [
    {
      id: 'carbon_regulatory',
      title: 'Carbon and Regulatory Pressure',
      keys: ['carbon_pressure', 'stability', 'permitting'],
    },
    {
      id: 'energy_infrastructure',
      title: 'Energy and Infrastructure',
      keys: ['power_access', 'power_price_visibility', 'grid_readiness', 'hydrogen', 'co2_infra'],
    },
    {
      id: 'finance_execution',
      title: 'Finance and Execution',
      keys: ['finance', 'engineering_capacity', 'cluster_coordination'],
    },
    {
      id: 'market_formation',
      title: 'Market Formation',
      keys: ['market_pull', 'market_push', 'offtake_bankability', 'certification_traceability'],
    },
  ];

  const CLUSTER_PARAMETER_ROWS = CLUSTER_PARAMETER_GROUPS.flatMap((group) =>
    group.keys.map((key) => ({ key, groupId: group.id }))
  );
  const CLUSTER_PARAMETER_KEYS = CLUSTER_PARAMETER_ROWS.map(({ key }) => key);

  const TRAJECTORY_YEAR_START = 2025;
  const TRAJECTORY_YEAR_END = 2050;
  const TRAJECTORY_SCENARIOS = [
    { theme: 'growth', L: 85.0, k: 0.35, t0: 10.0, color: '#2a78d6', dash: 'solid' },
    { theme: 'cluster', L: 70.0, k: 0.30, t0: 11.0, color: '#1baf7a', dash: 'dash' },
    { theme: 'pressure', L: 55.0, k: 0.50, t0: 6.0, color: '#eda100', dash: 'dot' },
    { theme: 'volatile', L: 40.0, k: 0.25, t0: 14.0, color: '#e34948', dash: 'dashdot' },
    { theme: 'defensive', L: 25.0, k: 0.20, t0: 15.0, color: '#4a3aa7', dash: 'longdash' },
  ];

  const SYSTEM_EFFECT_AXES = ['Business', 'Technology', 'Mobility', 'Market', 'Infra', 'Governance'];
  const SYSTEM_EFFECT_MATRIX = {
    carbon_pressure: [3, 1, 1, 1, 0, 1],
    stability: [3, 1, 3, 1, 0, 3],
    permitting: [0, 2, 3, 0, 1, 3],
    power_access: [1, 3, 1, 0, 3, 0],
    power_price_visibility: [2, 2, 1, 1, 2, 1],
    grid_readiness: [0, 3, 2, 0, 3, 1],
    hydrogen: [0, 3, 1, 0, 3, 0],
    co2_infra: [0, 3, 1, 0, 3, 0],
    finance: [2, 2, 3, 1, 1, 1],
    engineering_capacity: [0, 2, 3, 0, 1, 0],
    cluster_coordination: [1, 2, 3, 2, 2, 2],
    market_pull: [3, 0, 1, 3, 0, 0],
    market_push: [2, 2, 1, 3, 0, 0],
    offtake_bankability: [3, 1, 2, 3, 0, 1],
    certification_traceability: [2, 1, 1, 3, 0, 1],
  };

  const STRUCTURE_METRICS = [
    {
      code: 'B_i',
      title: 'Business strength / business sustainability',
      formula: 'B_i = (CF_i + CAP_i + MP_i + GOV_i + CL_i) / 5',
      note: 'Closest to the business-resilience logic already used in the model.',
      factors: [
        'CF_i = cashflow resilience',
        'CAP_i = capex absorptive capacity',
        'MP_i = market power / premium potential',
        'GOV_i = governance / ownership stability',
        'CL_i = cluster leverage',
      ],
    },
    {
      code: 'T_i',
      title: 'Technological adequacy and applicability',
      formula: 'T_i = (SF_i + AB_i + MAT_i + MOD_i + ID_i^(+) + LT_i^(+)) / 6',
      note: 'For 0-20 scoring, use ID_i^(+) = 20 - ID_i and LT_i^(+) = 20 - LT_i.',
      factors: [
        'SF_i = site fit',
        'AB_i = abatement potential',
        'MAT_i = maturity / TRL / commercial maturity',
        'MOD_i = modularity / ease of integration',
        'ID_i = infrastructure dependence',
        'LT_i = lead time to deployment',
      ],
    },
    {
      code: 'M_i',
      title: 'Execution capacity / mobility for transition',
      formula: 'M_i = (EX_i + FIN_i + ENG_i + PRJ_i + PERM_i + COORD_i) / 6',
      note: 'This is the baseline pre-scenario mobility before it changes into M_eff.',
      factors: [
        'EX_i = execution capability',
        'FIN_i = financing access',
        'ENG_i = engineering access',
        'PRJ_i = project development readiness',
        'PERM_i = permitting responsiveness',
        'COORD_i = cluster coordination access',
      ],
    },
    {
      code: 'E_i',
      title: 'Emissions pressure',
      formula: 'E_i = (AE_i + EI_i + PE_i + FE_i + RD_i) / 5',
      note: 'Higher values mean a heavier emissions problem.',
      factors: [
        'AE_i = absolute emissions scale',
        'EI_i = emissions intensity',
        'PE_i = process-emissions share',
        'FE_i = fossil energy / feedstock dependence',
        'RD_i = residual abatement difficulty',
      ],
    },
    {
      code: 'C_i',
      title: 'Competitive vulnerability',
      formula: 'C_i = (TE_i + CPS_i + PPS_i + PT_i^(+) + COM_i) / 5',
      note: 'For 0-20 scoring, use PT_i^(+) = 20 - PT_i so weaker pass-through raises vulnerability.',
      factors: [
        'TE_i = trade exposure',
        'CPS_i = carbon-price sensitivity',
        'PPS_i = power-price sensitivity',
        'PT_i = pass-through ability',
        'COM_i = commodity exposure / commoditization pressure',
      ],
    },
    {
      code: 'K_i',
      title: 'Industrial continuity importance',
      formula: 'K_i = (IW_i + SC_i + CA_i + EMP_i + SUB_i^(+)) / 5',
      note: 'For 0-20 scoring, use SUB_i^(+) = 20 - SUB_i so lower substitutability raises K_i.',
      factors: [
        'IW_i = industrial weight',
        'SC_i = supply-chain criticality',
        'CA_i = cluster anchor role',
        'EMP_i = employment / regional significance',
        'SUB_i = substitutability of output',
      ],
    },
  ];

  const STRUCTURAL_SENSITIVITY_METRICS = [
    {
      key: 'industrial_weight',
      title: 'Системна тежест на компанията',
      compactFormula: '(OUT + SC + ANC + REG + EM) / 5',
      formula: 'industrial_weight_i = (OUT_i + SC_i + ANC_i + REG_i + EM_i) / 5',
      factors: [
        'OUT_i = производствен и пазарен мащаб',
        'SC_i = supply-chain criticality',
        'ANC_i = anchor role в клъстер / индустриална мрежа',
        'REG_i = регионална и трудова значимост',
        'EM_i = значимост в националния емисионен и индустриален профил',
      ],
      interpretation: [
        '1-5 = периферна фирма',
        '6-10 = ограничена системна роля',
        '11-15 = важна фирма',
        '16-20 = системообразуващ anchor',
      ],
    },
    {
      key: 'infra_dependency',
      title: 'Зависимост от външна инфраструктура',
      compactFormula: '(GRID + PWR + H2 + CO2 + UTIL) / 5',
      formula: 'infra_dependency_i = (GRID_i + PWR_i + H2_i + CO2_i + UTIL_i) / 5',
      factors: [
        'GRID_i = зависимост от мрежови присъединявания и усилване',
        'PWR_i = зависимост от големи обеми нисковъглероден ток',
        'H2_i = зависимост от водород',
        'CO2_i = зависимост от CO2 transport/storage',
        'UTIL_i = зависимост от shared utilities / external industrial services',
      ],
      interpretation: [
        '1-5 = може да върви почти самостоятелно',
        '6-10 = умерена външна зависимост',
        '11-15 = висока зависимост',
        '16-20 = без външна инфраструктура преходът не е реалистичен',
      ],
    },
    {
      key: 'carbon_sensitivity',
      title: 'Чувствителност към въглероден натиск',
      compactFormula: '(DIR + PROC + PASS^(+) + TRADE + ALT^(+)) / 5',
      formula: 'carbon_sensitivity_i = (DIR_i + PROC_i + PASS_i^(+) + TRADE_i + ALT_i^(+)) / 5',
      factors: [
        'DIR_i = директна емисионна експозиция',
        'PROC_i = дял на process emissions',
        'PASS_i = ability to pass through carbon cost',
        'TRADE_i = trade / leakage / CBAM exposure',
        'ALT_i = наличие на краткосрочни abatement alternatives',
        'PASS_i^(+) = 21 - PASS_i',
        'ALT_i^(+) = 21 - ALT_i',
      ],
      interpretation: [
        'По-слабо прехвърляне на разхода повишава индекса.',
        'По-малко краткосрочни алтернативи също повишават индекса.',
      ],
    },
    {
      key: 'power_price_sensitivity',
      title: 'Чувствителност към цена и видимост на електроенергията',
      compactFormula: '(COST + ELEC + FLEX^(+) + HEDGE^(+) + VOL) / 5',
      formula: 'power_price_sensitivity_i = (COST_i + ELEC_i + FLEX_i^(+) + HEDGE_i^(+) + VOL_i) / 5',
      factors: [
        'COST_i = дял на електроенергията в cost structure',
        'ELEC_i = зависимост на бъдещия преход от електрификация',
        'FLEX_i = load flexibility',
        'HEDGE_i = достъп до PPA / hedging / long-term electricity contracting',
        'VOL_i = експозиция към ценова волатилност',
        'FLEX_i^(+) = 21 - FLEX_i',
        'HEDGE_i^(+) = 21 - HEDGE_i',
      ],
      interpretation: [
        'Ниска гъвкавост повишава чувствителността.',
        'Слаб достъп до дългосрочно ценово обезпечаване повишава чувствителността.',
        'Висока електроинтензивност води до висока power_price_sensitivity.',
      ],
    },
  ];

  const EXPLORER_TABS = ['phaseMap', 'scenarioFrontier', 'morphologyNetwork', 'bottleneckHeatmap', 'dataTable'];

  const EXPLORER_COMPANIES = [
    { company: 'Agropolychim AD', cluster: 'Devnya', sector: 'Fertilizers', B_i: 4.0, T_i: 3.8, M_i: 3.5, E_i: 4.5, C_i: 3.5, K_i: 4.2, industrial_weight: 4.3, infra_dependency: 4.2, carbon_sensitivity: 4.3, power_price_sensitivity: 4.2 },
    { company: 'Neochim AD', cluster: 'Dimitrovgrad', sector: 'Ammonia & nitric acid', B_i: 3.0, T_i: 2.8, M_i: 2.7, E_i: 4.7, C_i: 4.3, K_i: 4.0, industrial_weight: 4.1, infra_dependency: 4.0, carbon_sensitivity: 4.6, power_price_sensitivity: 4.5 },
    { company: 'Solvay Sodi Bulgaria AD', cluster: 'Devnya', sector: 'Soda ash', B_i: 4.2, T_i: 3.2, M_i: 3.0, E_i: 5.0, C_i: 3.8, K_i: 4.5, industrial_weight: 4.8, infra_dependency: 4.8, carbon_sensitivity: 4.7, power_price_sensitivity: 4.7 },
    { company: 'Heidelberg Materials Bulgaria', cluster: 'Devnya', sector: 'Cement', B_i: 4.3, T_i: 4.0, M_i: 3.7, E_i: 4.8, C_i: 3.4, K_i: 4.1, industrial_weight: 4.6, infra_dependency: 4.6, carbon_sensitivity: 4.5, power_price_sensitivity: 4.2 },
    { company: 'Holcim Bulgaria AD', cluster: 'Vratsa', sector: 'Cement', B_i: 4.1, T_i: 3.9, M_i: 3.8, E_i: 4.4, C_i: 3.2, K_i: 3.8, industrial_weight: 3.9, infra_dependency: 4.0, carbon_sensitivity: 4.2, power_price_sensitivity: 4.0 },
    { company: 'Lukoil Neftochim Burgas AD', cluster: 'Burgas', sector: 'Refining', B_i: 3.5, T_i: 2.3, M_i: 2.2, E_i: 5.0, C_i: 4.5, K_i: 4.7, industrial_weight: 5.0, infra_dependency: 4.9, carbon_sensitivity: 4.9, power_price_sensitivity: 4.8 },
    { company: 'Orgachim AD', cluster: 'Ruse', sector: 'Coatings', B_i: 3.1, T_i: 3.4, M_i: 3.1, E_i: 2.7, C_i: 3.7, K_i: 2.8, industrial_weight: 2.8, infra_dependency: 2.9, carbon_sensitivity: 2.8, power_price_sensitivity: 3.1 },
    { company: 'Biovet AD', cluster: 'Razgrad/Peshtera', sector: 'Vet pharma', B_i: 4.0, T_i: 4.1, M_i: 3.9, E_i: 2.8, C_i: 3.0, K_i: 3.6, industrial_weight: 3.6, infra_dependency: 3.8, carbon_sensitivity: 2.6, power_price_sensitivity: 3.8 },
    { company: 'Svilosa AD', cluster: 'Svishtov', sector: 'Pulp', B_i: 3.6, T_i: 4.0, M_i: 3.4, E_i: 2.5, C_i: 3.1, K_i: 3.5, industrial_weight: 3.3, infra_dependency: 2.7, carbon_sensitivity: 2.4, power_price_sensitivity: 2.9 },
    { company: 'Agria AD', cluster: 'Plovdiv', sector: 'Agrochemicals', B_i: 2.8, T_i: 3.2, M_i: 2.9, E_i: 2.2, C_i: 3.4, K_i: 2.6, industrial_weight: 2.2, infra_dependency: 2.3, carbon_sensitivity: 2.1, power_price_sensitivity: 2.7 },
  ];

  const CLUSTER_SIMULATION_STORAGE_KEY = 'nzlClusterSimulationDataV1';
  const COMPANY_SIMULATION_KEYS = ['B_i', 'T_i', 'M_i', 'E_i', 'C_i', 'K_i', 'industrial_weight', 'infra_dependency', 'carbon_sensitivity', 'power_price_sensitivity'];

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
      matrixTitle: 'Scenarios',
      matrixDesc: 'Select a scenario from the roster to inspect its profile and how its attributes differ from the scenario average.',
      matrixNote: 'NZ scores are shown on a 0-20 scale, while the raw model values stay on the original 0-1 scale.',
      scenarioMeta: 'policy scenario',
      supportLabel: 'NZ score',
      compareLabel: 'vs avg',
      rawLabel: 'raw',
      scoreScaleLabel: 'NZ score',
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
        support: 'NZ',
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
        stability: 'Policy stability',
        permitting: 'Permitting quality',
        power_access: 'Power access',
        power_price_visibility: 'Power price visibility',
        grid_readiness: 'Grid readiness',
        hydrogen: 'Hydrogen availability',
        co2_infra: 'CO2 infrastructure',
        finance: 'Finance support',
        engineering_capacity: 'Engineering capacity',
        cluster_coordination: 'Cluster coordination',
        market_pull: 'Market pull',
        market_push: 'Market push',
        offtake_bankability: 'Offtake bankability',
        certification_traceability: 'Certification traceability',
      },
      help: {
        carbon_pressure: 'Strength of carbon-cost pressure in the scenario.',
        stability: 'Consistency and predictability of policy signals.',
        permitting: 'Quality and speed of the permitting environment.',
        power_access: 'Availability and quality of power access for electrification.',
        power_price_visibility: 'Visibility and predictability of future industrial power prices.',
        grid_readiness: 'Readiness of grid infrastructure for industrial transition.',
        hydrogen: 'Availability of hydrogen supply and related systems.',
        co2_infra: 'Readiness of CO2 transport, storage, or shared capture infrastructure.',
        finance: 'Access to public or private transition finance.',
        engineering_capacity: 'Availability of engineering, EPC, and project delivery capability.',
        cluster_coordination: 'Capacity for joint planning and coordination across the industrial cluster.',
        market_pull: 'Demand-side support for low-carbon products.',
        market_push: 'Supply-side policy push for deployment and scale-up of low-carbon solutions.',
        offtake_bankability: 'Ability to secure bankable offtake contracts for low-carbon output.',
        certification_traceability: 'Maturity of certification, MRV, and product traceability systems.',
      },
    },
    bg: {
      matrixTitle: 'Сценарен състав',
      matrixDesc: 'Избери сценарий от списъка, за да видиш профила му и как се различават показателите му спрямо средното за всички сценарии.',
      matrixNote: 'NZ оценките са показани по скала 0-20, а суровите стойности остават в оригиналната скала 0-1.',
      scenarioMeta: 'политически сценарий',
      supportLabel: 'NZ score',
      compareLabel: 'спрямо ср.',
      rawLabel: 'сурово',
      scoreScaleLabel: 'NZ score',
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
        support: 'NZ',
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
  let activeClusterMainTab = 'scenario-squad';

  Object.assign(CLUSTER_COPY.en, {
    explorerSubtitle: 'Business field vs. technology field sandbox from the Streamlit explorer.',
    plotlyMissing: 'Plotly is not loaded, so the explorer charts cannot be rendered.',
    trajectoryTitle: 'Scenario trajectories',
    trajectorySubtitle: 'Normalised sigmoid curves from a common 2025 starting state S₀.',
    mainTabs: {
      scenarioSquad: 'Scenarios',
      companies: 'Companies',
      tab3: 'Structure',
      tab4: 'Metrics',
      tab5: 'Simulation',
    },
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

  CLUSTER_COPY.bg.trajectoryTitle = 'Scenario trajectories';
  CLUSTER_COPY.bg.trajectorySubtitle = 'Нормализирани sigmoid криви с общо начално състояние S₀ през 2025.';
  CLUSTER_COPY.bg.mainTabs = {
    scenarioSquad: 'Scenarios',
    companies: 'Companies',
    tab3: 'Structure',
    tab4: 'Metrics',
    tab5: 'Simulation',
  };
  CLUSTER_COPY.en.systemMatrixTitle = 'System effect matrix';
  CLUSTER_COPY.en.systemMatrixSubtitle = '3 = strong effect, 2 = medium, 1 = weak, 0 = almost none.';
  CLUSTER_COPY.bg.systemMatrixTitle = 'Матричен изглед по ефект върху системата';
  CLUSTER_COPY.bg.systemMatrixSubtitle = '3 = силен ефект, 2 = среден, 1 = слаб, 0 = почти няма.';

  function ensureClusterStyles() {
    if (document.getElementById('cluster-analysis-styles')) return;

    const style = document.createElement('style');
    style.id = 'cluster-analysis-styles';
    style.textContent = `
      .cluster-scenario-grid { display: block; }
      .cluster-access-shell {
        display: grid;
        gap: 1rem;
      }
      .cluster-access-card {
        padding: 1.4rem 1.5rem;
        border: 1px solid rgba(119, 196, 220, 0.12);
        background:
          radial-gradient(circle at top left, rgba(122, 216, 247, 0.14), transparent 34%),
          linear-gradient(180deg, rgba(12, 28, 40, 0.96), rgba(6, 15, 24, 0.98));
      }
      .cluster-access-kicker {
        color: #7ad8f7;
        font-family: 'DM Mono', monospace;
        font-size: 0.58rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .cluster-access-title {
        margin-top: 0.42rem;
        color: #e8f3f7;
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .cluster-access-desc {
        margin-top: 0.38rem;
        max-width: 48ch;
        color: #9db8c6;
        font-size: 0.82rem;
        line-height: 1.55;
      }
      .cluster-access-form {
        display: flex;
        gap: 0.7rem;
        align-items: center;
        margin-top: 1rem;
      }
      .cluster-access-input {
        flex: 1 1 260px;
        min-width: 0;
        padding: 0.78rem 0.95rem;
        border-radius: 12px;
        border: 1px solid rgba(119, 196, 220, 0.18);
        background: rgba(7, 18, 28, 0.92);
        color: #e8f3f7;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.82rem;
        outline: none;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
      }
      .cluster-access-input::placeholder {
        color: rgba(157, 184, 198, 0.72);
      }
      .cluster-access-input:focus {
        border-color: rgba(122, 216, 247, 0.44);
        box-shadow: 0 0 0 3px rgba(122, 216, 247, 0.12);
      }
      .cluster-access-button {
        flex: 0 0 auto;
        padding: 0.78rem 1.05rem;
        border: 1px solid rgba(122, 216, 247, 0.18);
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(28, 72, 101, 0.98), rgba(14, 37, 54, 0.98));
        color: #e8f3f7;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        cursor: pointer;
      }
      .cluster-access-button:hover,
      .cluster-access-button:focus-visible {
        background: linear-gradient(180deg, rgba(35, 86, 118, 0.98), rgba(17, 44, 63, 0.98));
        outline: none;
      }
      .cluster-access-error {
        margin-top: 0.7rem;
        color: #ff986b;
        font-size: 0.74rem;
        font-weight: 600;
      }
      .cluster-main-tabs {
        display: flex;
        align-items: flex-end;
        gap: 0.18rem;
        margin-top: 0.85rem;
        overflow-x: auto;
        padding-bottom: 0.1rem;
      }
      .cluster-main-tab {
        position: relative;
        flex: 0 0 auto;
        padding: 0.56rem 1rem 0.52rem;
        border: 1px solid rgba(119, 196, 220, 0.18);
        border-bottom: 0;
        border-radius: 12px 12px 0 0;
        background: linear-gradient(180deg, rgba(17, 46, 66, 0.72), rgba(10, 27, 40, 0.9));
        color: #9db8c6;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;
      }
      .cluster-main-tab:hover,
      .cluster-main-tab:focus-visible {
        color: #e8f3f7;
        background: linear-gradient(180deg, rgba(22, 58, 82, 0.82), rgba(12, 31, 46, 0.95));
        outline: none;
      }
      .cluster-main-tab.active {
        color: #e8f3f7;
        background: linear-gradient(180deg, rgba(28, 72, 101, 0.96), rgba(15, 39, 58, 0.98));
        box-shadow: inset 0 2px 0 rgba(122, 216, 247, 0.48);
        transform: translateY(1px);
      }
      .cluster-fm-shell {
        --fm-line: rgba(119, 196, 220, 0.22);
        --fm-text: #e8f3f7;
        --fm-muted: #89a9ba;
        --fm-accent: #7ad8f7;
        display: grid;
        grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.94fr);
        grid-template-areas:
          "roster detail"
          "focus detail"
          "trajectory matrix"
          "explorer explorer";
        gap: 1rem;
        align-items: start;
        color: var(--fm-text);
      }
      .cluster-fm-main {
        display: grid;
        align-content: start;
        gap: 1rem;
      }
      .cluster-fm-roster-card { grid-area: roster; }
      .cluster-fm-trajectory-card { grid-area: trajectory; }
      .cluster-fm-focus-section-card { grid-area: focus; }
      .cluster-fm-scenario-card { grid-area: detail; }
      .cluster-fm-system-matrix-card { grid-area: matrix; }
      .cluster-fm-explorer-card { grid-area: explorer; }
      .cluster-companies-shell {
        display: grid;
        gap: 1rem;
      }
      .cluster-structure-shell {
        display: grid;
        gap: 1rem;
      }
      .cluster-structure-intro {
        padding: 1rem 1.1rem 0;
      }
      .cluster-structure-note {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.6rem;
        border-radius: 999px;
        background: rgba(122, 216, 247, 0.12);
        color: #d7f7ff;
        font-family: 'DM Mono', monospace;
        font-size: 0.5rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .cluster-structure-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.9rem;
        padding: 0 1.1rem 1.1rem;
      }
      .cluster-structure-card {
        padding: 0.9rem 0.95rem;
        border: 1px solid rgba(119, 196, 220, 0.14);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(18, 44, 63, 0.94), rgba(9, 24, 36, 0.9));
      }
      .cluster-structure-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.7rem;
      }
      .cluster-structure-code {
        color: var(--fm-accent);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1rem;
        font-weight: 800;
        letter-spacing: 0.04em;
      }
      .cluster-structure-title {
        margin-top: 0.25rem;
        color: var(--fm-text);
        font-size: 0.62rem;
        font-weight: 700;
        line-height: 1.35;
      }
      .cluster-structure-formula {
        margin-top: 0.65rem;
        padding: 0.55rem 0.65rem;
        border-radius: 10px;
        background: rgba(122, 216, 247, 0.06);
        color: #d8edf4;
        font-family: 'DM Mono', monospace;
        font-size: 0.54rem;
        line-height: 1.45;
        overflow-x: auto;
      }
      .cluster-structure-sub {
        margin-top: 0.55rem;
        color: var(--fm-muted);
        font-size: 0.54rem;
        line-height: 1.45;
      }
      .cluster-structure-list {
        margin: 0.6rem 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.28rem;
      }
      .cluster-structure-list > div {
        color: var(--fm-text);
        font-size: 0.54rem;
        line-height: 1.4;
      }
      .cluster-structure-list > div span {
        color: var(--fm-muted);
      }
      .cluster-sensitivity-note {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.6rem;
        border-radius: 999px;
        background: rgba(244, 197, 99, 0.12);
        color: #f4d28c;
        font-family: 'DM Mono', monospace;
        font-size: 0.5rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .cluster-sensitivity-mini {
        padding: 0 1.1rem 1rem;
      }
      .cluster-sensitivity-mini .cluster-fm-data-table th:first-child,
      .cluster-sensitivity-mini .cluster-fm-data-table td:first-child {
        width: 34%;
      }
      .cluster-sensitivity-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
        gap: 0.9rem;
        padding: 0 1.1rem 1rem;
        align-items: start;
      }
      .cluster-sensitivity-stack {
        display: grid;
        gap: 0.9rem;
      }
      .cluster-sensitivity-side {
        display: grid;
        gap: 0.9rem;
      }
      .cluster-sensitivity-layout .cluster-sensitivity-mini {
        padding: 0;
      }
      .cluster-sim-shell {
        display: grid;
        gap: 1rem;
      }
      .cluster-sim-card {
        padding: 1rem 1.1rem 1.1rem;
        border-top: 1px solid rgba(119, 196, 220, 0.1);
      }
      .cluster-sim-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.85rem;
      }
      .cluster-sim-status {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }
      .cluster-sim-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.55rem;
        border-radius: 999px;
        background: rgba(122, 216, 247, 0.1);
        color: #d7f7ff;
        font-family: 'DM Mono', monospace;
        font-size: 0.52rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .cluster-sim-badge.locked {
        background: rgba(255, 152, 107, 0.12);
        color: #ffd5c1;
      }
      .cluster-sim-grid {
        display: grid;
        gap: 1rem;
      }
      .cluster-sim-table-wrap {
        overflow: auto;
      }
      .cluster-sim-input {
        width: 4.8rem;
        padding: 0.3rem 0.38rem;
        border: 1px solid rgba(119, 196, 220, 0.18);
        border-radius: 8px;
        background: rgba(7, 18, 28, 0.82);
        color: #e8f3f7;
        font: inherit;
        font-size: 0.7rem;
      }
      .cluster-sim-input:disabled {
        opacity: 0.62;
        cursor: not-allowed;
      }
      .cluster-sim-note {
        color: var(--fm-muted);
        font-size: 0.64rem;
        line-height: 1.45;
      }
      .cluster-sim-locked-wrap {
        position: relative;
      }
      .cluster-sim-overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 1.2rem;
        border-radius: 18px;
        background: rgba(5, 13, 20, 0.72);
        backdrop-filter: blur(6px);
        z-index: 3;
      }
      .cluster-sim-overlay-card {
        max-width: 34rem;
        padding: 1rem 1.1rem;
        border: 1px solid rgba(255, 152, 107, 0.18);
        border-radius: 14px;
        background: linear-gradient(180deg, rgba(17, 44, 62, 0.96), rgba(8, 20, 30, 0.98));
        color: #e8f3f7;
        text-align: center;
      }
      .cluster-sim-overlay-card strong {
        display: block;
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1.05rem;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .cluster-sim-overlay-card span {
        display: block;
        margin-top: 0.42rem;
        color: #a8c2cf;
        font-size: 0.72rem;
        line-height: 1.45;
      }
      .cluster-tab-placeholder {
        display: grid;
        place-items: center;
        min-height: 280px;
        padding: 1.6rem;
        text-align: center;
        color: var(--fm-muted);
      }
      .cluster-tab-placeholder strong {
        display: block;
        color: var(--fm-text);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 1.1rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .cluster-tab-placeholder p {
        margin: 0.55rem 0 0;
        max-width: 52ch;
        font-size: 0.68rem;
        line-height: 1.5;
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
      .cluster-fm-trajectory-card .cluster-fm-explorer {
        border-bottom: 0;
        padding-bottom: 1rem;
      }
      .cluster-fm-trajectory-card .cluster-fm-viz-canvas,
      .cluster-fm-trajectory-card .cluster-fm-viz-empty {
        min-height: 320px;
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
      .cluster-fm-table-head {
        color: var(--fm-muted);
      }
      .cluster-fm-overall span,
      .cluster-fm-overall small,
      .cluster-fm-table-head {
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
        grid-template-columns: minmax(230px, 2.15fr) repeat(4, minmax(120px, 1fr));
        align-items: center;
        gap: 0.55rem;
      }
      .cluster-fm-table-head {
        padding: 0 0.9rem 0.7rem;
        border-bottom: 1px solid var(--fm-line);
      }
      .cluster-fm-table-head span {
        white-space: normal;
        line-height: 1.25;
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
        font-size: 0.58rem;
        font-weight: 700;
        text-align: center;
      }
      .cluster-fm-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 0.7rem;
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
        gap: 0.55rem;
        padding: 0.62rem 1.1rem 0;
      }
      .cluster-fm-focus-section-card .cluster-fm-section-head {
        margin-top: 0;
        padding-top: 1.1rem;
      }
      .cluster-fm-focus-section-card .cluster-fm-focus-grid {
        padding-bottom: 0.9rem;
      }
      .cluster-fm-system-matrix-card .cluster-fm-section-head {
        margin-top: 0;
        padding-top: 1.1rem;
      }
      .cluster-fm-focus-card {
        padding: 0.6rem 0.64rem;
        border: 1px solid var(--fm-line);
        border-radius: 12px;
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
        font-size: 0.54rem;
        font-weight: 700;
        line-height: 1.25;
      }
      .cluster-fm-focus-head strong {
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 0.92rem;
        line-height: 1;
      }
      .cluster-fm-focus-sub {
        margin-top: 0.24rem;
        color: var(--fm-muted);
        font-size: 0.46rem;
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
      .cluster-fm-attributes { padding-bottom: 0.78rem; }
      .cluster-fm-attribute-body {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.95rem;
        padding-top: 0.12rem;
      }
      .cluster-fm-attribute-group {
        display: grid;
        align-content: start;
      }
      .cluster-fm-attribute-group-head {
        display: block;
        padding: 0 0 0.34rem;
        margin-bottom: 0.18rem;
        border-bottom: 1px solid rgba(119, 196, 220, 0.18);
      }
      .cluster-fm-attribute-group-title {
        color: var(--fm-accent);
        font-family: 'Barlow Condensed', 'DM Sans', sans-serif;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .cluster-fm-attribute-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0.26rem 0;
        border-bottom: 1px solid rgba(119, 196, 220, 0.1);
      }
      .cluster-fm-attribute-row:last-child { border-bottom: 0; }
      .cluster-fm-attribute-main {
        display: grid;
        gap: 0.18rem;
        min-width: 0;
        flex: 1 1 auto;
      }
      .cluster-fm-attribute-label-wrap {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        min-width: 0;
      }
      .cluster-fm-attribute-label {
        color: var(--fm-text);
        font-size: 0.53rem;
        font-weight: 700;
        line-height: 1.25;
        min-width: 0;
      }
      .cluster-fm-info {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 0.78rem;
        height: 0.78rem;
        border: 1px solid rgba(122, 216, 247, 0.28);
        border-radius: 999px;
        color: var(--fm-accent);
        font-family: 'DM Mono', monospace;
        font-size: 0.42rem;
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
        font-size: 0.52rem;
        font-weight: 700;
        text-align: right;
        flex: 0 0 auto;
      }
      .cluster-fm-attribute-raw,
      .cluster-fm-attribute-delta { display: none; }
      .cluster-fm-system-matrix {
        padding: 0 0.9rem 0.9rem;
      }
      .cluster-fm-system-matrix-wrap {
        overflow-x: auto;
        border: 1px solid rgba(122, 216, 247, 0.16);
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(122, 216, 247, 0.04), rgba(7, 18, 28, 0.3));
      }
      .cluster-fm-system-matrix-table {
        width: 100%;
        min-width: 0;
        table-layout: fixed;
        border-collapse: collapse;
      }
      .cluster-fm-system-matrix-table th,
      .cluster-fm-system-matrix-table td {
        padding: 0.3rem 0.24rem;
        border-bottom: 1px solid rgba(119, 196, 220, 0.1);
        text-align: center;
        vertical-align: middle;
      }
      .cluster-fm-system-matrix-table thead th {
        color: var(--fm-muted);
        font-family: 'DM Mono', monospace;
        font-size: 0.42rem;
        line-height: 1.15;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        background: rgba(122, 216, 247, 0.05);
        white-space: normal;
      }
      .cluster-fm-system-matrix-table thead th:first-child,
      .cluster-fm-system-matrix-table tbody td:first-child {
        text-align: left;
        background: linear-gradient(180deg, rgba(15, 39, 58, 0.98), rgba(8, 23, 35, 0.98));
      }
      .cluster-fm-system-matrix-table thead th:first-child {
        width: 38%;
      }
      .cluster-fm-system-matrix-table tbody td:first-child {
        color: var(--fm-text);
        font-size: 0.46rem;
        font-weight: 700;
        line-height: 1.15;
        white-space: normal;
        word-break: break-word;
      }
      .cluster-fm-system-matrix-table tbody tr:hover td {
        background: rgba(122, 216, 247, 0.03);
      }
      .cluster-fm-system-matrix-table tbody tr:hover td:first-child {
        background: linear-gradient(180deg, rgba(18, 44, 63, 0.98), rgba(10, 28, 41, 0.98));
      }
      .cluster-fm-matrix-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.15rem;
        height: 1.05rem;
        padding: 0 0.1rem;
        border-radius: 999px;
        font-family: 'DM Mono', monospace;
        font-size: 0.47rem;
        font-weight: 700;
      }
      .cluster-fm-matrix-pill.level-0 {
        color: #7f96a4;
        background: rgba(127, 150, 164, 0.12);
      }
      .cluster-fm-matrix-pill.level-1 {
        color: #8eb7c8;
        background: rgba(142, 183, 200, 0.14);
      }
      .cluster-fm-matrix-pill.level-2 {
        color: #73c2da;
        background: rgba(115, 194, 218, 0.16);
      }
      .cluster-fm-matrix-pill.level-3 {
        color: #d7f7ff;
        background: rgba(122, 216, 247, 0.22);
      }
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
        .cluster-fm-shell {
          grid-template-columns: 1fr;
          grid-template-areas:
            "roster"
            "focus"
            "detail"
            "trajectory"
            "matrix"
            "explorer";
        }
        .cluster-fm-focus-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .cluster-fm-attribute-body { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .cluster-structure-grid { grid-template-columns: 1fr; }
        .cluster-sensitivity-layout { grid-template-columns: 1fr; }
        .cluster-access-form { flex-direction: column; align-items: stretch; }
        .cluster-access-button { width: 100%; }
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
        .cluster-fm-info-tip { width: min(200px, 56vw); }
      }
      @media (max-width: 560px) {
        .cluster-fm-focus-grid { grid-template-columns: 1fr; }
        .cluster-fm-attribute-body { grid-template-columns: 1fr; }
        .cluster-fm-detail-copy h3 { font-size: 0.97rem; }
        .cluster-fm-info-tip { width: min(180px, 68vw); }
        .cluster-fm-system-matrix { padding-left: 0.7rem; padding-right: 0.7rem; }
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

  function getGroupAverage(scenario, groupId) {
    const group = CLUSTER_PARAMETER_GROUPS.find((entry) => entry.id === groupId);
    if (!group) return 0;
    const total = group.keys.reduce((sum, key) => sum + getScenarioValue(scenario, key), 0);
    return total / group.keys.length;
  }

  function getScenarioAverage(scenario) {
    const total = CLUSTER_PARAMETER_KEYS.reduce((sum, key) => sum + getScenarioValue(scenario, key), 0);
    return total / CLUSTER_PARAMETER_KEYS.length;
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

  function formatRosterValue(value) {
    return Number(value.toFixed(2)).toString();
  }

  function clampValue(value, lower = 1, upper = 5) {
    return Math.max(lower, Math.min(upper, value));
  }

  function clampScenarioSimulationValue(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(1, numeric));
  }

  function clampCompanySimulationValue(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(5, numeric));
  }

  function persistClusterSimulationData() {
    try {
      root.localStorage.setItem(CLUSTER_SIMULATION_STORAGE_KEY, JSON.stringify({
        scenarios: CLUSTER_SCENARIOS.map((scenario) => ({
          theme: scenario.theme,
          values: Object.fromEntries(CLUSTER_PARAMETER_KEYS.map((key) => [key, scenario[key]])),
        })),
        companies: EXPLORER_COMPANIES.map((company) => ({
          company: company.company,
          values: Object.fromEntries(COMPANY_SIMULATION_KEYS.map((key) => [key, company[key]])),
        })),
      }));
    } catch (error) {
      // Persisting browser-side simulation state is optional.
    }
  }

  function loadClusterSimulationData() {
    try {
      const raw = root.localStorage.getItem(CLUSTER_SIMULATION_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      (parsed?.scenarios || []).forEach((entry) => {
        const target = CLUSTER_SCENARIOS.find((scenario) => scenario.theme === entry.theme);
        if (!target || !entry.values) return;
        CLUSTER_PARAMETER_KEYS.forEach((key) => {
          if (entry.values[key] === undefined) return;
          target[key] = clampScenarioSimulationValue(entry.values[key]);
        });
      });

      (parsed?.companies || []).forEach((entry) => {
        const target = EXPLORER_COMPANIES.find((company) => company.company === entry.company);
        if (!target || !entry.values) return;
        COMPANY_SIMULATION_KEYS.forEach((key) => {
          if (entry.values[key] === undefined) return;
          target[key] = clampCompanySimulationValue(entry.values[key]);
        });
      });
    } catch (error) {
      // Ignore malformed persisted data and continue with defaults.
    }
  }

  function updateClusterScenarioSimulationValue(index, key, nextValue) {
    if (typeof root.isClusterEditorUnlocked === 'function' && !root.isClusterEditorUnlocked()) return;
    if (!CLUSTER_PARAMETER_KEYS.includes(key)) return;
    const scenario = CLUSTER_SCENARIOS[index];
    if (!scenario) return;
    scenario[key] = clampScenarioSimulationValue(nextValue);
    persistClusterSimulationData();
    renderClusterAnalysis();
  }

  function updateClusterCompanySimulationValue(index, key, nextValue) {
    if (typeof root.isClusterEditorUnlocked === 'function' && !root.isClusterEditorUnlocked()) return;
    if (!COMPANY_SIMULATION_KEYS.includes(key)) return;
    const company = EXPLORER_COMPANIES[index];
    if (!company) return;
    company[key] = clampCompanySimulationValue(nextValue);
    persistClusterSimulationData();
    renderClusterAnalysis();
  }

  function toPlotLabel(scenario) {
    return getScenarioName(scenario);
  }

  function applyScenarioToCompanies(scenario) {
    const infraPush = (scenario.grid_readiness + scenario.hydrogen + scenario.co2_infra) / 3;

    return EXPLORER_COMPANIES.map((company) => {
      const B_eff = clampValue(
        company.B_i
        + 0.55 * scenario.market_pull
        + 0.45 * scenario.market_push
        + 0.50 * scenario.offtake_bankability
        + 0.35 * scenario.certification_traceability
        + 0.35 * scenario.stability
        + 0.25 * scenario.finance
        - 0.9 * scenario.carbon_pressure * (company.carbon_sensitivity / 5)
      );

      const T_eff = clampValue(
        company.T_i
        + 0.65 * scenario.power_access
        + 0.50 * scenario.power_price_visibility
        + 0.60 * infraPush * (company.infra_dependency / 5)
        + 0.45 * scenario.engineering_capacity
        + 0.35 * scenario.finance
        + 0.25 * scenario.cluster_coordination
        + 0.20 * scenario.permitting
      );

      const M_eff = clampValue(
        company.M_i
        + 0.65 * scenario.finance
        + 0.60 * scenario.engineering_capacity
        + 0.65 * scenario.cluster_coordination
        + 0.45 * scenario.permitting
        + 0.35 * scenario.stability
        + 0.25 * scenario.market_push
        + 0.25 * infraPush
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
        bottleneck_finance: 5 - clampValue(company.M_i + ((scenario.finance + scenario.offtake_bankability) / 2)),
        bottleneck_permitting: 5 - clampValue(company.M_i + ((scenario.permitting + scenario.certification_traceability) / 2)),
        bottleneck_infrastructure: 5 - clampValue(company.T_i + ((scenario.power_access + scenario.power_price_visibility + infraPush) / 3)),
        bottleneck_market: 5 - clampValue(company.B_i + ((scenario.market_pull + scenario.market_push + scenario.offtake_bankability) / 3)),
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

  function renderTrajectoryChart() {
    const copy = getCopy();
    const mount = document.getElementById('clusterTrajectoryCanvas');
    if (!mount) return;

    if (!root.Plotly) {
      mount.innerHTML = `<div class="cluster-fm-viz-empty">${escape(copy.plotlyMissing)}</div>`;
      return;
    }

    const years = Array.from(
      { length: (TRAJECTORY_YEAR_END - TRAJECTORY_YEAR_START) * 10 + 1 },
      (_, index) => TRAJECTORY_YEAR_START + index / 10
    );
    const sigma = (z) => 1 / (1 + Math.exp(-z));
    const trajectory = (t, L, k, t0) => {
      const s0 = sigma(-k * t0);
      return L * (sigma(k * (t - t0)) - s0) / (1 - s0);
    };
    const stateLabels = ['S<sub>1</sub>', 'S<sub>2</sub>', 'S<sub>3</sub>', 'S<sub>4</sub>', 'S<sub>5</sub>'];

    const traces = TRAJECTORY_SCENARIOS.map((entry, index) => {
      const scenario = CLUSTER_SCENARIOS.find((item) => item.theme === entry.theme);
      const label = scenario ? getScenarioName(scenario) : entry.theme;
      const values = years.map((year) => trajectory(year - TRAJECTORY_YEAR_START, entry.L, entry.k, entry.t0));
      return {
        type: 'scatter',
        mode: 'lines',
        name: label,
        x: years,
        y: values,
        line: {
          color: entry.color,
          width: 2.2,
          dash: entry.dash,
        },
        hovertemplate: '%{y:.1f}%<extra></extra>',
      };
    });

    traces.push({
      type: 'scatter',
      mode: 'markers+text',
      name: 'S<sub>0</sub>',
      x: [TRAJECTORY_YEAR_START],
      y: [0],
      text: ['S<sub>0</sub>'],
      textposition: 'top right',
      marker: {
        size: 8,
        color: '#8b8f97',
        line: { color: '#081723', width: 1 },
      },
      hovertemplate: '0.0%<extra></extra>',
      showlegend: false,
    });

    const trajectoryAnnotations = TRAJECTORY_SCENARIOS.map((entry, index) => ({
      x: TRAJECTORY_YEAR_END,
      y: trajectory(TRAJECTORY_YEAR_END - TRAJECTORY_YEAR_START, entry.L, entry.k, entry.t0),
      text: stateLabels[index],
      xanchor: 'left',
      yanchor: 'middle',
      showarrow: false,
      font: { size: 10, color: entry.color },
      xshift: 8,
    }));

    root.Plotly.newPlot(mount, traces, {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(7, 18, 28, 0.34)',
      font: { color: '#e8f3f7', family: 'DM Sans, sans-serif', size: 10 },
      margin: { l: 52, r: 32, t: 24, b: 42 },
      height: 320,
      xaxis: {
        title: 'Year',
        range: [TRAJECTORY_YEAR_START, TRAJECTORY_YEAR_END + 1],
        gridcolor: 'rgba(137, 169, 186, 0.08)',
        tickfont: { color: '#c8d9e2', size: 10 },
        titlefont: { color: '#e8f3f7', size: 11 },
      },
      yaxis: {
        title: 'Decarbonisation depth (%)',
        range: [0, 100],
        gridcolor: 'rgba(137, 169, 186, 0.14)',
        tickfont: { color: '#c8d9e2', size: 10 },
        titlefont: { color: '#e8f3f7', size: 11 },
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.16,
        font: { size: 9, color: '#dce9ef' },
      },
      showlegend: true,
      hovermode: 'closest',
      annotations: [{
        x: TRAJECTORY_YEAR_START,
        y: 0,
        text: 'S<sub>0</sub>',
        xanchor: 'left',
        yanchor: 'bottom',
        showarrow: false,
        font: { size: 10, color: '#8b8f97' },
        yshift: 8,
        xshift: 10,
      }, ...trajectoryAnnotations],
    }, {
      displayModeBar: false,
      responsive: true,
    });
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

  function setActiveClusterMainTab(tabId) {
    const allowed = ['scenario-squad', 'companies', 'tab-3', 'tab-4', 'tab-5'];
    if (!allowed.includes(tabId)) return;
    activeClusterMainTab = tabId;
    renderClusterAnalysis();
  }

  function ensureClusterMainTabs(copy) {
    const sectionDesc = document.querySelector('#section-cluster .section-desc');
    if (!sectionDesc || !sectionDesc.parentElement) return;

    let tabsHost = document.getElementById('clusterMainTabs');
    if (!tabsHost) {
      tabsHost = document.createElement('div');
      tabsHost.id = 'clusterMainTabs';
      tabsHost.className = 'cluster-main-tabs';
      sectionDesc.insertAdjacentElement('afterend', tabsHost);
    }

    const labels = copy.mainTabs || CLUSTER_COPY.en.mainTabs;
    const tabs = [
      ['scenario-squad', labels.scenarioSquad || 'Scenarios'],
      ['companies', labels.companies || 'Companies'],
      ['tab-3', labels.tab3 || 'tab-3'],
      ['tab-4', labels.tab4 || 'tab-4'],
      ['tab-5', labels.tab5 || 'tab-5'],
    ];

    tabsHost.innerHTML = tabs.map(([id, label]) => `
      <button type="button" class="cluster-main-tab ${activeClusterMainTab === id ? 'active' : ''}" onclick="setActiveClusterMainTab('${id}')">
        ${escape(label)}
      </button>
    `).join('');
  }

  function renderCompaniesClusterTab(copy) {
    const companies = EXPLORER_COMPANIES.slice().sort((a, b) => b.industrial_weight - a.industrial_weight);
    return `
      <div class="cluster-companies-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-fm-section-head">
            <div>
              <div class="cluster-fm-section-title">Companies</div>
              <div class="cluster-fm-section-sub">Industrial actors in the cluster model with baseline business, technology, and mobility fields.</div>
            </div>
          </div>
          <div class="cluster-fm-system-matrix">
            <div class="cluster-fm-data-table-wrap">
              <table class="cluster-fm-data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Cluster</th>
                    <th>Sector</th>
                    <th>Business</th>
                    <th>Technology</th>
                    <th>Mobility</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  ${companies.map((company) => `
                    <tr>
                      <td>${escape(company.company)}</td>
                      <td>${escape(company.cluster)}</td>
                      <td>${escape(company.sector)}</td>
                      <td>${company.B_i.toFixed(1)}</td>
                      <td>${company.T_i.toFixed(1)}</td>
                      <td>${company.M_i.toFixed(1)}</td>
                      <td>${company.industrial_weight.toFixed(1)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderStructureClusterTab() {
    const formatMetricMarkup = (text) => escape(text)
      .replaceAll('_i', '<sub>i</sub>')
      .replaceAll('^(+)', '<sup>(+)</sup>');

    return `
      <div class="cluster-structure-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-structure-intro">
            <div class="cluster-fm-section-head">
              <div>
                <div class="cluster-fm-section-title">Core company parameters</div>
                <div class="cluster-fm-section-sub">Structural indices for business strength, technology fit, transition mobility, emissions pressure, competitive vulnerability, and industrial continuity.</div>
              </div>
            </div>
            <div class="cluster-structure-note">All component scores and final indices are normalized on a 0-20 scale.</div>
          </div>
          <div class="cluster-structure-grid">
            ${STRUCTURE_METRICS.map((metric) => `
              <article class="cluster-structure-card">
                <div class="cluster-structure-head">
                  <div class="cluster-structure-code">${formatMetricMarkup(metric.code)}</div>
                  <div class="cluster-structure-title">${escape(metric.title)}</div>
                </div>
                <div class="cluster-structure-formula">${formatMetricMarkup(metric.formula)}</div>
                <div class="cluster-structure-sub">${escape(metric.note)}</div>
                <div class="cluster-structure-list">
                  ${metric.factors.map((factor) => `<div><span>${formatMetricMarkup(factor)}</span></div>`).join('')}
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderStructuralSensitivityTab() {
    const formatMetricMarkup = (text) => escape(text)
      .replaceAll('_i', '<sub>i</sub>')
      .replaceAll('^(+)', '<sup>(+)</sup>');

    return `
      <div class="cluster-structure-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-structure-intro">
            <div class="cluster-fm-section-head">
              <div>
                <div class="cluster-fm-section-title">Structural and sensitivity parameters</div>
                <div class="cluster-fm-section-sub">Core company exposure fields used to read structural weight, infrastructure dependence, and carbon and power-price sensitivity.</div>
              </div>
            </div>
            <div class="cluster-sensitivity-note">Method definitions below use a 1-20 assessment scale. The company table keeps the current working model inputs.</div>
          </div>
          <div class="cluster-sensitivity-mini">
            <div class="cluster-fm-data-table-wrap">
              <table class="cluster-fm-data-table">
                <thead>
                  <tr>
                    <th>Параметър</th>
                    <th>Формула</th>
                  </tr>
                </thead>
                <tbody>
                  ${STRUCTURAL_SENSITIVITY_METRICS.map((metric) => `
                    <tr>
                      <td>${escape(metric.key)}</td>
                      <td>${formatMetricMarkup(metric.compactFormula)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="cluster-structure-grid">
            ${STRUCTURAL_SENSITIVITY_METRICS.map((metric) => `
              <article class="cluster-structure-card">
                <div class="cluster-structure-head">
                  <div class="cluster-structure-code">${escape(metric.key)}</div>
                  <div class="cluster-structure-title">${escape(metric.title)}</div>
                </div>
                <div class="cluster-structure-formula">${formatMetricMarkup(metric.formula)}</div>
                <div class="cluster-structure-list">
                  ${metric.factors.map((factor) => `<div><span>${formatMetricMarkup(factor)}</span></div>`).join('')}
                </div>
                <div class="cluster-structure-sub">
                  ${metric.interpretation.map((line) => escape(line)).join('<br>')}
                </div>
              </article>
            `).join('')}
          </div>
          <div class="cluster-fm-system-matrix">
            <div class="cluster-fm-data-table-wrap">
              <table class="cluster-fm-data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>industrial_weight</th>
                    <th>infra_dependency</th>
                    <th>carbon_sensitivity</th>
                    <th>power_price_sensitivity</th>
                  </tr>
                </thead>
                <tbody>
                  ${EXPLORER_COMPANIES.map((company) => `
                    <tr>
                      <td>${escape(company.company)}</td>
                      <td>${company.industrial_weight.toFixed(1)}</td>
                      <td>${company.infra_dependency.toFixed(1)}</td>
                      <td>${company.carbon_sensitivity.toFixed(1)}</td>
                      <td>${company.power_price_sensitivity.toFixed(1)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderStructuralSensitivityTabCompact() {
    const formatMetricMarkup = (text) => escape(text)
      .replaceAll('_i', '<sub>i</sub>')
      .replaceAll('^(+)', '<sup>(+)</sup>');
    const sensitivityCardOrder = ['industrial_weight', 'carbon_sensitivity', 'infra_dependency', 'power_price_sensitivity'];
    const orderedMetrics = sensitivityCardOrder
      .map((key) => STRUCTURAL_SENSITIVITY_METRICS.find((metric) => metric.key === key))
      .filter(Boolean);

    return `
      <div class="cluster-structure-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-structure-intro">
            <div class="cluster-fm-section-head">
              <div>
                <div class="cluster-fm-section-title">Structural and sensitivity parameters</div>
                <div class="cluster-fm-section-sub">Core company exposure fields used to read structural weight, infrastructure dependence, and carbon and power-price sensitivity.</div>
              </div>
            </div>
            <div class="cluster-sensitivity-note">Method definitions below use a 1-20 assessment scale. The company table keeps the current working model inputs.</div>
          </div>
          <div class="cluster-sensitivity-layout">
            <div class="cluster-sensitivity-stack">
              ${orderedMetrics.map((metric) => {
                const showInterpretation = metric.key !== 'infra_dependency' && Array.isArray(metric.interpretation) && metric.interpretation.length > 0;
                return `
                  <article class="cluster-structure-card">
                    <div class="cluster-structure-head">
                      <div class="cluster-structure-code">${escape(metric.key)}</div>
                      <div class="cluster-structure-title">${escape(metric.title)}</div>
                    </div>
                    <div class="cluster-structure-formula">${formatMetricMarkup(metric.formula)}</div>
                    <div class="cluster-structure-list">
                      ${metric.factors.map((factor) => `<div><span>${formatMetricMarkup(factor)}</span></div>`).join('')}
                    </div>
                    ${showInterpretation ? `
                      <div class="cluster-structure-sub">
                        ${metric.interpretation.map((line) => escape(line)).join('<br>')}
                      </div>
                    ` : ''}
                  </article>
                `;
              }).join('')}
            </div>
            <div class="cluster-sensitivity-side">
              <div class="cluster-sensitivity-mini">
                <div class="cluster-fm-data-table-wrap">
                  <table class="cluster-fm-data-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${orderedMetrics.map((metric) => `
                        <tr>
                          <td>${escape(metric.key)}</td>
                          <td>${formatMetricMarkup(metric.compactFormula)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="cluster-fm-system-matrix">
            <div class="cluster-fm-data-table-wrap">
              <table class="cluster-fm-data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>industrial_weight</th>
                    <th>infra_dependency</th>
                    <th>carbon_sensitivity</th>
                    <th>power_price_sensitivity</th>
                  </tr>
                </thead>
                <tbody>
                  ${EXPLORER_COMPANIES.map((company) => `
                    <tr>
                      <td>${escape(company.company)}</td>
                      <td>${company.industrial_weight.toFixed(1)}</td>
                      <td>${company.infra_dependency.toFixed(1)}</td>
                      <td>${company.carbon_sensitivity.toFixed(1)}</td>
                      <td>${company.power_price_sensitivity.toFixed(1)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderSimulationClusterTab(copy) {
    const simulationUnlocked = typeof root.isClusterSimulationUnlocked === 'function' && root.isClusterSimulationUnlocked();
    const editorUnlocked = typeof root.isClusterEditorUnlocked === 'function' && root.isClusterEditorUnlocked();
    const disabledAttr = editorUnlocked ? '' : 'disabled';

    const scenarioTable = `
      <div class="cluster-sim-card">
        <div class="cluster-sim-head">
          <div>
            <div class="cluster-fm-section-title">Scenario inputs</div>
            <div class="cluster-fm-section-sub">Editable scenario values on the working 0-1 model scale.</div>
          </div>
        </div>
        <div class="cluster-sim-table-wrap">
          <table class="cluster-fm-data-table">
            <thead>
              <tr>
                <th>Scenario</th>
                ${CLUSTER_PARAMETER_KEYS.map((key) => `<th>${escape(copy.labels[key] || CLUSTER_COPY.en.labels[key] || key)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${CLUSTER_SCENARIOS.map((scenario, index) => `
                <tr>
                  <td>${escape(getScenarioName(scenario))}</td>
                  ${CLUSTER_PARAMETER_KEYS.map((key) => `
                    <td>
                      <input
                        class="cluster-sim-input"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value="${Number(scenario[key]).toFixed(2)}"
                        ${disabledAttr}
                        onchange="updateClusterScenarioSimulationValue(${index}, '${key}', this.value)"
                      >
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const companyTable = `
      <div class="cluster-sim-card">
        <div class="cluster-sim-head">
          <div>
            <div class="cluster-fm-section-title">Company inputs</div>
            <div class="cluster-fm-section-sub">Editable company fields on the working 0-5 model scale.</div>
          </div>
        </div>
        <div class="cluster-sim-table-wrap">
          <table class="cluster-fm-data-table">
            <thead>
              <tr>
                <th>Company</th>
                ${COMPANY_SIMULATION_KEYS.map((key) => `<th>${escape(key)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${EXPLORER_COMPANIES.map((company, index) => `
                <tr>
                  <td>${escape(company.company)}</td>
                  ${COMPANY_SIMULATION_KEYS.map((key) => `
                    <td>
                      <input
                        class="cluster-sim-input"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value="${Number(company[key]).toFixed(1)}"
                        ${disabledAttr}
                        onchange="updateClusterCompanySimulationValue(${index}, '${key}', this.value)"
                      >
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return `
      <div class="cluster-sim-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-structure-intro">
            <div class="cluster-sim-head">
              <div>
                <div class="cluster-fm-section-title">Simulation workspace</div>
                <div class="cluster-fm-section-sub">Use this tab to inspect or edit the working scenario and company inputs used across Cluster Analysis.</div>
              </div>
              <div class="cluster-sim-status">
                <span class="cluster-sim-badge ${simulationUnlocked ? '' : 'locked'}">Simulation ${simulationUnlocked ? 'unlocked' : 'locked'}</span>
                <span class="cluster-sim-badge ${editorUnlocked ? '' : 'locked'}">Editor ${editorUnlocked ? 'enabled' : 'view only'}</span>
              </div>
            </div>
            <div class="cluster-sim-note">
              ${editorUnlocked
                ? 'Changes are saved immediately in this browser and will be reused after reload.'
                : 'Unlock Editor Password to change values. Without editor access, the tables remain read-only.'}
            </div>
          </div>
          <div class="cluster-sim-locked-wrap">
            <div class="cluster-sim-grid">
              ${scenarioTable}
              ${companyTable}
            </div>
            ${simulationUnlocked ? '' : `
              <div class="cluster-sim-overlay">
                <div class="cluster-sim-overlay-card">
                  <strong>Simulation locked</strong>
                  <span>Enter the Simulation password section above to activate this tab. Until then, all controls stay blocked.</span>
                </div>
              </div>
            `}
          </div>
        </section>
      </div>
    `;
  }

  function renderClusterPlaceholderTab(title) {
    return `
      <div class="cluster-companies-shell">
        <section class="cluster-fm-detail theme-cluster">
          <div class="cluster-tab-placeholder">
            <div>
              <strong>${escape(title)}</strong>
              <p>This tab is reserved for the next part of the Cluster Analysis module.</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderClusterAnalysis() {
    ensureClusterStyles();

    const scenarioGrid = document.getElementById('clusterScenarioGrid');
    if (!scenarioGrid) return;

    const copy = getCopy();
    const matrixTitle = document.getElementById('clusterMatrixTitle');
    const matrixDesc = document.getElementById('clusterMatrixDesc');
    const matrixNote = document.getElementById('clusterScenarioNote');
    ensureClusterMainTabs(copy);

    const labels = copy.mainTabs || CLUSTER_COPY.en.mainTabs;
    const tabMeta = {
      'scenario-squad': {
        title: copy.matrixTitle,
        desc: copy.matrixDesc,
        note: copy.matrixNote,
      },
      companies: {
        title: labels.companies || 'Companies',
        desc: 'Company roster and baseline fields for the cluster industrial landscape.',
        note: 'Tab for company-level views inside Cluster Analysis.',
      },
      'tab-3': {
        title: labels.tab3 || 'Structure',
        desc: 'Core company parameters, formulas, and factor definitions for the cluster model.',
        note: 'All scores in this structure layer are normalized on a 0-20 scale.',
      },
      'tab-4': {
        title: labels.tab4 || 'Metrics',
        desc: 'Structural and sensitivity parameters across the core company set.',
        note: 'Company-level structural weight and exposure fields.',
      },
      'tab-5': {
        title: labels.tab5 || 'Simulation',
        desc: 'Simulation workspace for scenario and company inputs.',
        note: 'Simulation access allows viewing. Editor access allows editing and saving browser-side changes.',
      },
    };
    const activeTabMeta = tabMeta[activeClusterMainTab] || tabMeta['scenario-squad'];

    if (matrixTitle) matrixTitle.textContent = activeTabMeta.title;
    if (matrixDesc) matrixDesc.textContent = activeTabMeta.desc;
    if (matrixNote) matrixNote.textContent = activeTabMeta.note;

    if (!CLUSTER_SCENARIOS[activeClusterScenarioIndex]) {
      activeClusterScenarioIndex = 0;
    }

    const selectedScenario = CLUSTER_SCENARIOS[activeClusterScenarioIndex];
    const rankedScenarios = CLUSTER_SCENARIOS
      .map((scenario, index) => ({
        scenario,
        index,
        nzScore: getScenarioAverage(scenario),
        groupScores: Object.fromEntries(
          CLUSTER_PARAMETER_GROUPS.map((group) => [group.id, getGroupAverage(scenario, group.id)])
        ),
      }))
      .sort((a, b) => b.nzScore - a.nzScore);

    const focusCards = CLUSTER_PARAMETER_GROUPS.map((group) => {
      const value = getGroupAverage(selectedScenario, group.id);
      const avg = CLUSTER_SCENARIOS.reduce((sum, scenario) => sum + getGroupAverage(scenario, group.id), 0) / CLUSTER_SCENARIOS.length;
      const delta = value - avg;
      const deltaTone = getDeltaTone(delta);
      const scoreTone = getScoreTone(value);

      return `
        <article class="cluster-fm-focus-card ${deltaTone}">
          <div class="cluster-fm-focus-head">
            <span>${escape(group.title)}</span>
            <strong class="${scoreTone}">${getScore(value)}</strong>
          </div>
          <div class="cluster-fm-focus-sub">
            <span>${escape(copy.rawLabel)} ${value.toFixed(2)}</span>
            <span class="cluster-fm-delta ${deltaTone}">${escape(copy.compareLabel)} ${formatDelta(delta)}</span>
          </div>
        </article>
      `;
    }).join('');

    const attributeRows = CLUSTER_PARAMETER_GROUPS.map((group) => {
      const rows = group.keys.map((key) => {
        const value = getScenarioValue(selectedScenario, key);
        const tone = getScoreTone(value);
        const label = copy.labels[key] || CLUSTER_COPY.en.labels[key] || key;
        const help = copy.help[key] || CLUSTER_COPY.en.help[key] || '';

        return `
          <div class="cluster-fm-attribute-row">
            <div class="cluster-fm-attribute-main">
              <div class="cluster-fm-attribute-label-wrap">
                <div class="cluster-fm-attribute-label">${escape(label)}</div>
                <span class="cluster-fm-info" tabindex="0" aria-label="${escape(help)}">
                  i
                  <span class="cluster-fm-info-tip">${escape(help)}</span>
                </span>
              </div>
            </div>
            <div class="cluster-fm-attribute-score ${tone}">${getScore(value)}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="cluster-fm-attribute-group">
          <div class="cluster-fm-attribute-group-head">
            <span class="cluster-fm-attribute-group-title">${escape(group.title)}</span>
          </div>
          ${rows}
        </div>
      `;
    }).join('');

    const systemMatrixRows = CLUSTER_PARAMETER_KEYS.map((key) => {
      const label = copy.labels[key] || CLUSTER_COPY.en.labels[key] || key;
      const values = SYSTEM_EFFECT_MATRIX[key] || [];
      return `
        <tr>
          <td>${escape(label)}</td>
          ${values.map((value) => `
            <td><span class="cluster-fm-matrix-pill level-${value}">${value}</span></td>
          `).join('')}
        </tr>
      `;
    }).join('');

    const systemMatrix = `
      <div class="cluster-fm-system-matrix">
        <div class="cluster-fm-system-matrix-wrap">
          <table class="cluster-fm-system-matrix-table">
            <thead>
              <tr>
                <th>${escape(copy.attributeLabel)}</th>
                ${SYSTEM_EFFECT_AXES.map((axis) => `<th>${escape(axis)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${systemMatrixRows}</tbody>
          </table>
        </div>
      </div>
    `;

    if (activeClusterMainTab === 'companies') {
      scenarioGrid.innerHTML = renderCompaniesClusterTab(copy);
      return;
    }
    if (activeClusterMainTab === 'tab-3') {
      scenarioGrid.innerHTML = renderStructureClusterTab(copy);
      return;
    }
    if (activeClusterMainTab === 'tab-4') {
      scenarioGrid.innerHTML = renderStructuralSensitivityTabCompact(copy);
      return;
    }
    if (activeClusterMainTab === 'tab-5') {
      scenarioGrid.innerHTML = renderSimulationClusterTab(copy);
      return;
    }

    scenarioGrid.innerHTML = `
      <div class="cluster-fm-shell">
        <section class="cluster-fm-roster cluster-fm-roster-card">
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
                <span>${escape(copy.headers.scenario)}</span>
                ${CLUSTER_PARAMETER_GROUPS.map((group) => `<span>${escape(group.title)}</span>`).join('')}
              </div>
              <div class="cluster-fm-table-body">
                ${rankedScenarios.map((entry) => {
                  const isActive = entry.index === activeClusterScenarioIndex;
                  return `
                    <button type="button" class="cluster-fm-row theme-${escape(entry.scenario.theme || 'cluster')} ${isActive ? 'active' : ''}" onclick="setActiveClusterScenario(${entry.index})">
                      <span class="cluster-fm-row-scenario">
                        <strong>${escape(getScenarioName(entry.scenario))}</strong>
                        <em>${escape(copy.scenarioMeta)}</em>
                      </span>
                      ${CLUSTER_PARAMETER_GROUPS.map((group) => `
                        <span class="cluster-fm-row-stat ${getScoreTone(entry.groupScores[group.id])}">${formatRosterValue(entry.groupScores[group.id])}</span>
                      `).join('')}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </section>

        <section class="cluster-fm-detail cluster-fm-trajectory-card theme-${escape(selectedScenario.theme || 'cluster')}">
          <div class="cluster-fm-explorer">
            <div class="cluster-fm-explorer-title">${escape(copy.trajectoryTitle || 'Scenario trajectories')}</div>
            <div class="cluster-fm-explorer-sub">${escape(copy.trajectorySubtitle || '')}</div>
            <div class="cluster-fm-viz-canvas" id="clusterTrajectoryCanvas"></div>
          </div>
        </section>

        <section class="cluster-fm-detail cluster-fm-focus-section-card theme-${escape(selectedScenario.theme || 'cluster')}">
          <div class="cluster-fm-section-head">
            <div>
              <div class="cluster-fm-section-title">${escape(copy.focusTitle)}</div>
              <div class="cluster-fm-section-sub">${escape(copy.avgNote)}</div>
            </div>
          </div>
          <div class="cluster-fm-focus-grid">${focusCards}</div>
        </section>

        <section class="cluster-fm-detail cluster-fm-scenario-card theme-${escape(selectedScenario.theme || 'cluster')}">
          <div class="cluster-fm-detail-hero">
            <div class="cluster-fm-detail-copy">
              <div class="cluster-fm-kicker">${escape(copy.detailKicker)}</div>
              <h3>${escape(getScenarioName(selectedScenario))}</h3>
              <p>${escape(getScenarioSummary(selectedScenario))}</p>
            </div>
          <div class="cluster-fm-overall">
            <span>${escape(copy.supportLabel)}</span>
            <strong class="${getScoreTone(getScenarioAverage(selectedScenario))}">${getScore(getScenarioAverage(selectedScenario))}</strong>
          </div>
        </div>

          <div class="cluster-fm-section-head">
            <div>
              <div class="cluster-fm-section-title">${escape(copy.fullTitle)}</div>
              <div class="cluster-fm-section-sub">${escape(copy.detailDesc)}</div>
            </div>
          </div>
          <div class="cluster-fm-attributes">
            <div class="cluster-fm-attribute-body">${attributeRows}</div>
          </div>
        </section>

        <section class="cluster-fm-detail cluster-fm-system-matrix-card theme-${escape(selectedScenario.theme || 'cluster')}">
          <div class="cluster-fm-section-head">
            <div>
              <div class="cluster-fm-section-title">${escape(copy.systemMatrixTitle || 'System effect matrix')}</div>
              <div class="cluster-fm-section-sub">${escape(copy.systemMatrixSubtitle || '')}</div>
            </div>
          </div>
          ${systemMatrix}
        </section>

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

    renderTrajectoryChart();
    renderExplorerTab(selectedScenario);
  }

  loadClusterSimulationData();

  root.ClusterAnalysis = {
    render: renderClusterAnalysis,
    setActiveScenario: setActiveClusterScenario,
    setActiveTab: setActiveClusterVizTab,
    setActiveMainTab: setActiveClusterMainTab,
    updateScenarioValue: updateClusterScenarioSimulationValue,
    updateCompanyValue: updateClusterCompanySimulationValue,
  };
  root.renderClusterAnalysis = renderClusterAnalysis;
  root.setActiveClusterScenario = setActiveClusterScenario;
  root.setActiveClusterVizTab = setActiveClusterVizTab;
  root.setActiveClusterMainTab = setActiveClusterMainTab;
  root.updateClusterScenarioSimulationValue = updateClusterScenarioSimulationValue;
  root.updateClusterCompanySimulationValue = updateClusterCompanySimulationValue;
})();
