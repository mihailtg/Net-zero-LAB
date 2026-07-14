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
        color: var(--fm-text);
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
        padding: 0.88rem 0.9rem;
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
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .cluster-fm-row-scenario em {
        display: block;
        margin-top: 0.18rem;
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

  function getScenarioSummary(scenario) {
    const copy = getCopy();
    return copy.summaries?.[scenario.theme] || '';
  }

  function setActiveClusterScenario(index) {
    const next = Number(index);
    if (!Number.isInteger(next) || next < 0 || next >= CLUSTER_SCENARIOS.length) return;
    activeClusterScenarioIndex = next;
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
        <section class="cluster-fm-roster">
          <div class="cluster-fm-panel-head">
            <div class="cluster-fm-kicker">${escape(copy.rosterTitle)}</div>
            <div class="cluster-fm-panel-title">${escape(copy.rosterDesc)}</div>
          </div>
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
    `;
  }

  root.ClusterAnalysis = {
    render: renderClusterAnalysis,
    setActiveScenario: setActiveClusterScenario,
  };
  root.renderClusterAnalysis = renderClusterAnalysis;
  root.setActiveClusterScenario = setActiveClusterScenario;
})();
