(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./cluster-data'), require('./cluster-model'), require('./bulgaria-regions'));
  else root.NZLInfographics = factory(root.ClusterData, root.ClusterModel, root.BulgariaRegions);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Data, Model, Geography) {
  'use strict';

  const COLORS = ['#7a005e', '#a8508f', '#cf9dc1', '#52003f', '#93307a', '#bf7aab'];
  // Official Net-Zero Lab mark (assets/net-zero-lab-icon.png), embedded so exported SVG/PNG files stay self-contained.
  const LOGO_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABYCAMAAABGS8AGAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAzUExURf///3oAXnoAXXkAXmMyYD2FZDyGZD2FY2UsYFZPYUZwYz2GZF48YD9/Y05fYkVyY1dLYW8yl8AAAAABdFJOUwBA5thmAAAAAWJLR0QAiAUdSAAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB+oLEgsTLKmp/tEAAANISURBVFjDrZntlqsgDEUJFCLamXvf/2lnqaiQL7A2/ypl93AIFKJzdwPA3+4zAvIhhPCcHbbw7Al8Bxwq/ezJR+EDEXg8CA+9OPSdCs/Pr5gSIqYUnzhxai4/NOU5XbEgPlC8jd0XbKKx3NUdhGjUnuQRlSZ4krAppb4bzZQPc7uTWNKprKwb3I7kM01XtOTvgZnnnN/TGu93zvNPjwzBjMKd80RHkn+XdDsNiBFzltqceyB5E8zUXusnfgieNr1K41C2WYJnWXF/T9IkQ3gdqSahu1xRMcBqYTxTdn7LHt8ll2FitRp+72v2aocavPzjAvw2NFW8PilsAWvT4Qe4VUske4NOZtsjgPENR7go+kYljwwpccWaZrDBZBJQJDtTEQxwGRiVLKp7wgBXAwudnQl2o2Dau1HEyTwX9f9lS1HXCJ7HSZZFFfXBTgU7XTCdXHG5owoGq6e3xtNR7AzFLdm5AXIUwf4DsO5F1ZdfIqDjhHNuGfGC9e8Kpl7Uxwi6SEBuKyNfkJ70UAOrW4IH/mzDkNM6KlYImwLDVlbsmAX7ZC+BPUg/1piKIhltMB8FMHCqjpIVWc7kAxwMcJVgl7yIguQhxVW61Ulw6UsLdZlZ4Z0Nrsn1lStha4ZnWGdb0R5/6qyOiNUjaUu2FTfpRS9z6503Uour9czybWgVNwFiZ3MTGSPLPnL7VbBys7W3XLlxGZEcDMXahnwXLJDlv0T9b0Ps2XPZq2CJbKwD+rugggUv2ErwRrO/AeYrzBut42D7SOm1NmrxMsINVmuxOXbA4jXEviuAKJmCpZ6du0JpRtPjYEhS2/cvWGByRt1vpk1SBCUEL/R5c1JoZE/BUeXKJz4oN2xPZxm0Q4phrBw8f14zt9jIBDV4ilRlvA0MQxfDEfJVKH0FtRzVB0u9SsVYq2F9aPIuegXnJ2CFu5Yv58kAm16skyOZ+N49tgR38gITChXRMnU21/Zi2yXnfNZwc74q54IRACOXoiJZC85ty9e9yVs0Li8PNhX37sob1tuwRt5qiWaINdi7b7JQtcFZJ9aB2E/rJzW/a9AT8A5fz+uY4v+JWOo/dYIGE/hM8RX81SB8VXGdT/AN7iGQPPrSm15/388/GFZAPEwI7RMAAAAASUVORK5CYII=';
  // Installation allowances only: the reports' aviation amounts and combined totals are excluded.
  const AUCTION_REVENUE = Object.freeze([
    { year: 2012, revenueEur: 22137930, report: 'Allowance_auctioning_201228b3a0b01f7058112c41f28a161d21f6.pdf' },
    // 2013 cash receipts include 388,700 EUR from the exceptional auction of 2012 allowances.
    { year: 2013, revenueEur: 52628980 + 388700, report: 'Allowance_auctioning_2013271e6cd294a21e3ca9e4a3c70d499115.pdf' },
    { year: 2014, revenueEur: 36192295, report: 'Allowance_auctioning_2014e27bcf9cfadc39379bc0b78c343c7787.pdf' },
    { year: 2015, revenueEur: 120908480, report: 'Allowance_auctioning_2015bd7cafab680fec9b6a04ebf69fecfb58.pdf' },
    { year: 2016, revenueEur: 85079960, report: 'Allowance_auctioning_2016b76d4243dca5ee2e4d40313d4ad1b454.pdf' },
    { year: 2017, revenueEur: 130150145, report: 'Allowance_auctioning_2017fed62c08638b6e0c4ca2ce7604de337e.pdf' },
    { year: 2018, revenueEur: 367342575, report: 'Allowance_auctioning_20187eca454630b8fa16be574846582576d4.pdf' },
    { year: 2019, revenueEur: 439191170, report: 'Allowance_auctioning_2019e4454c600d6305c79e67069bd2989a52.pdf' },
    { year: 2020, revenueEur: 447545340, report: 'Allowance_auctioning_20205d4e3d849f5fa741f699facdad8146c4.pdf' },
    { year: 2021, revenueEur: 830904805, report: 'Allowance_auctioning_2021f122273b5d7e9ac13c8043645717ac48.pdf' },
    { year: 2022, revenueEur: 1091346540, report: 'Allowance_auctioning_2022aa107560da140ecbe8afb05a096e6d5d.pdf' },
    { year: 2023, revenueEur: 1167622025, report: 'Allowance_auctioning_2023ff015f821dd320199d2d0071ae9a24b1.pdf' },
    { year: 2024, revenueEur: 822205680, report: 'Allowance_auctioning_20247cbc05165ed50a1d867e504d03c5853f.pdf' },
    { year: 2025, revenueEur: 829233344, report: 'Allowance_auctioning_202560fe602ce05ba79512f2d52b502226e9.pdf' },
  ].map(Object.freeze));
  const AUCTION_MARKET_DATA = Object.freeze([
    [2012, 6.76, 3277000], [2013, 4.38, 12110500], [2014, 5.92, 6151500],
    [2015, 7.62, 15990000], [2016, 5.26, 16216000], [2017, 5.76, 22632500],
    [2018, 15.43, 23868500], [2019, 24.61, 17889000], [2020, 24.28, 18474000],
    [2021, 53.01, 15711500], [2022, 79.78, 13716000], [2023, 83.35, 14062500],
    [2024, 64.69, 12774500], [2025, 73.40, 11392500],
  ].map(([year, priceEur, totalAllowances]) => Object.freeze({ year, priceEur, totalAllowances })));
  // User-provided interim snapshot; no separately reported installation revenue is supplied.
  const AUCTION_SNAPSHOT_2026 = Object.freeze({ year: 2026, asOf: '2026-11-16', priceEur: 79.47, totalAllowances: 8014500, reportedRevenueExAviationEur: null });
  const AUCTION_REFERENCE_2025 = Object.freeze({ installationRevenueEur: 829233344, aviationRevenueEur: 6949036 });

  function estimateAuctionRevenue(snapshot = AUCTION_SNAPSHOT_2026, reference = AUCTION_REFERENCE_2025) {
    const [year, month, day] = snapshot.asOf.split('-').map(Number);
    const cutoff = Date.UTC(year, month - 1, day);
    const date = new Date(cutoff);
    if (year !== snapshot.year || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day
      || !Number.isFinite(snapshot.priceEur) || snapshot.priceEur < 0 || !Number.isFinite(snapshot.totalAllowances) || snapshot.totalAllowances < 0
      || !Number.isFinite(reference.installationRevenueEur) || !Number.isFinite(reference.aviationRevenueEur)
      || !(reference.installationRevenueEur > 0) || !(reference.aviationRevenueEur >= 0)) throw new RangeError('Invalid auction forecast inputs');
    const elapsedDays = (cutoff - Date.UTC(year, 0, 1)) / 86400000 + 1;
    const yearDays = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    const installationShare = reference.installationRevenueEur / (reference.installationRevenueEur + reference.aviationRevenueEur);
    const grossProxyYtdEur = snapshot.priceEur * snapshot.totalAllowances;
    return {
      asOf: snapshot.asOf, elapsedDays, yearDays, installationShare,
      grossProxyYtdEur, estimatedInstallationYtdEur: grossProxyYtdEur * installationShare,
      estimatedAnnualAllowances: snapshot.totalAllowances * yearDays / elapsedDays,
      annualInstallationRevenueEur: grossProxyYtdEur * yearDays / elapsedDays * installationShare,
      reportedRevenueExAviationEur: snapshot.reportedRevenueExAviationEur,
      method: 'constant-price-calendar-day-run-rate-with-2025-revenue-share',
      reference: { ...reference },
    };
  }
  const pair = (en, bg) => ({ en, bg });
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const categories = {
    all: pair('All infographics', 'Всички инфографики'),
    emissions: pair('Emissions', 'Емисии'),
    industry: pair('Industry and regions', 'Индустрия и райони'),
    technologies: pair('Technologies', 'Технологии'),
    finance: pair('Investments and carbon costs', 'Инвестиции и въглеродни разходи'),
    scenarios: pair('Different scenarios', 'Различни сценарии'),
  };
  const copy = {
    intro: pair('A visual guide to the whole platform. Each infographic uses the site’s existing data, states its period and scope, and separates reported figures from model assumptions. Open a poster to read its values and sources or download it for reuse.', 'Визуален преглед на цялата платформа. Всяка инфографика използва данните от сайта, посочва периода и обхвата им и разграничава отчетените стойности от моделните допускания. Отворете плакат за преглед на стойностите и източниците или го изтеглете за използване.'),
    observed: pair('Inventory data', 'Данни от инвентаризацията'),
    revenue: pair('Official reported revenue', 'Официално отчетени приходи'),
    revenueForecast: pair('Reported revenue + conditional forecast', 'Отчетени приходи + условна прогноза'),
    verified: pair('Verified ETS extract', 'Извадка с верифицирани ETS емисии'),
    mixed: pair('Reported data + screening estimates', 'Отчетени данни + предварителни оценки'),
    model: pair('Model assumptions', 'Моделни допускания'),
    pathways: pair('Sector transition pathways', 'Секторни пътища за преход'),
    open: pair('Open infographic', 'Отвори инфографиката'),
    close: pair('Close', 'Затвори'),
    print: pair('Print / PDF', 'Печат / PDF'),
    sources: pair('Sources and scope', 'Източници и обхват'),
    values: pair('Values and reading guide', 'Стойности и насоки за прочит'),
    section: pair('Explore this section', 'Към съответната секция'),
    swipe: pair('On a small screen, scroll the poster horizontally. All values also appear as text below.', 'На малък екран превъртете плаката хоризонтално. Всички стойности са достъпни и като текст по-долу.'),
    pngError: pair('PNG export failed. You can download the vector SVG instead.', 'Изтеглянето като PNG не успя. Можете да изтеглите векторния SVG.'),
    pngWorking: pair('Preparing PNG…', 'Подготвяне на PNG…'),
    pngReady: pair('PNG is ready.', 'PNG е готов.'),
    svgReady: pair('SVG is ready.', 'SVG е готов.'),
  };

  function buildSeries(source, language = 'en') {
    const lang = language === 'bg' ? 'bg' : 'en';
    const t = (value) => typeof value === 'object' && value !== null ? value[lang] || value.en : String(value);
    const L = (en, bg) => lang === 'bg' ? bg : en;
    const n = (value, digits = 1) => Number(value).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });
    const pct = (value) => `${n(value, 1)}%`;
    const db = source.inventory;
    const companies = Data.createDefaultCompanies();
    const verified = companies.filter((company) => Number.isFinite(company.etsRank2024) && Number.isFinite(company.emissions2024Kt));
    const extra = companies.filter((company) => !verified.includes(company));
    const inventorySource = { name: L('UNFCCC · Bulgaria national inventory · CRT', 'UNFCCC · Национална инвентаризация на България · CRT'), url: 'https://unfccc.int/documents/656446' };
    const etsSource = { name: L('European Commission · EU ETS Union Registry', 'Европейска комисия · Регистър на Съюза по EU ETS'), url: Data.ETS_REGISTRY_URL };
    const registrySource = etsSource;
    // Model assumptions stay labelled as assumptions, without citing implementation files as data sources.
    const modelSource = null;
    const roiSource = null;
    const extraNames = extra.map((company) => L(company.company, ({ orgachim: 'Оргахим', biovet: 'Биовет', agria: 'Агрия', svilosa: 'Свилоза' })[company.id] || company.company)).join(', ');
    const cards = [];
    const artworks = [];
    function add(id, category, kind, section, title, subtitle, note, body, facts, sources, data, printSources, layout) {
      const officialSources = [...new Map(sources.filter(Boolean).map(source => [source.url, source])).values()];
      const card = { id, category, kind: t(copy[kind]), section, title, subtitle, note, facts, sources: officialSources, data, lang, printSources, layout, height: layout?.height || 960 };
      cards.push(card);
      artworks.push(body);
    }

    const nationalRows = [
      [L('Energy', 'Енергетика'), db.nat_2023.energy],
      [L('Industrial processes and product use', 'Промишлени процеси и употреба на продукти'), db.nat_2023.ippu],
      [L('Agriculture', 'Селско стопанство'), db.nat_2023.agri],
      [L('Waste', 'Отпадъци'), db.nat_2023.waste],
    ];
    const gross = nationalRows.reduce((sum, row) => sum + row[1], 0);
    const nationalFacts = nationalRows.map(([label, value]) => `${label}: ${n(value, 2)} kt CO₂eq · ${pct(value / gross * 100)}`);
    add('national-emissions', 'emissions', 'observed', 'emissions', L('Bulgaria’s emissions in perspective', 'Емисиите на България в перспектива'),
      L(`2023 · ${n(gross / 1000, 2)} Mt CO₂eq before land-use removals`, `2023 г. · ${n(gross / 1000, 2)} Mt CO₂eq преди поглъщанията от земеползването`),
      L(`Land use and forestry (LULUCF): ${n(db.nat_2023.lulucf / 1000, 2)} Mt CO₂eq, shown separately. IPPU excludes industrial fuel combustion, which sits within Energy.`, `Земеползване и горско стопанство (LULUCF): ${n(db.nat_2023.lulucf / 1000, 2)} Mt CO₂eq, отделно. IPPU не включва изгарянето на горива в индустрията, което е в „Енергетика“.`),
      bars(nationalRows.map(([label, value]) => ({ label, value, display: `${n(value / 1000, 2)} Mt · ${pct(value / gross * 100)}` }))),
      [...nationalFacts, `LULUCF: ${n(db.nat_2023.lulucf, 2)} kt CO₂eq`], [inventorySource], { gross, lulucf: db.nat_2023.lulucf });

    const first = db.ippu_hist[0];
    const last = db.ippu_hist.at(-1);
    const change = (last.total / first.total - 1) * 100;
    add('emissions-history', 'emissions', 'observed', 'emissions', L('The industrial emissions timeline', 'Процесните емисии във времето'),
      L(`IPPU · ${first.year}–${last.year} · ${n(change, 1)}% change from the first year`, `IPPU · ${first.year}–${last.year} г. · изменение с ${n(change, 1)}% спрямо първата година`),
      L('Annual national process emissions in kt CO₂eq. Changes in output, activity and product mix can affect this trend; it does not measure technology savings alone.', 'Годишни национални процесни емисии в kt CO₂eq. Обемът на производството, активността и продуктовият състав също влияят на тенденцията; тя не измерва само технологични спестявания.'),
      lineChart([{ name: 'IPPU', values: db.ippu_hist.map((row) => row.total), color: COLORS[0] }], db.ippu_hist.map((row) => row.year), n, 'kt CO₂eq'),
      db.ippu_hist.map((row) => `${row.year}: ${n(row.total, 2)} kt CO₂eq`), [inventorySource], { history: db.ippu_hist.map((row) => ({ year: row.year, total: row.total })), change });

    const regionRows = Data.STATISTICAL_REGIONS.map((region) => {
      const members = verified.filter((company) => company.geography.regionId === region.id);
      const value = members.reduce((sum, company) => sum + company.emissions2024Kt, 0);
      return { id: region.id, label: t(region.name), count: members.length, value, display: `${n(value, 1)} kt · ${members.length} ${L('sites', 'инсталации')}` };
    });
    const regionalTotal = regionRows.reduce((sum, row) => sum + row.value, 0);
    add('six-regions', 'industry', 'verified', 'industrial-geography', L('Industry across six planning regions', 'Индустрията в шестте района за планиране'),
      L(`2024 · 20 installations · ${n(regionalTotal, 3)} kt CO₂`, `2024 г. · 20 инсталации · ${n(regionalTotal, 3)} kt CO₂`),
      L(`Only the ${verified.length} installations with verified ETS values in the site dataset. This is not a complete regional emissions inventory. Supplemental screening participants (${extra.length}) are excluded.`, `Само ${verified.length}-те инсталации с верифицирани ETS стойности в набора от данни. Това не е пълна регионална инвентаризация. Допълнителните участници с предварителни оценки (${extra.length}) са изключени.`),
      bars(regionRows), regionRows.map((row) => `${row.id} · ${row.label}: ${row.display}`), [etsSource, registrySource], { regions: regionRows, total: regionalTotal });

    const mapRows = regionRows.map((region) => ({ ...region, share: region.value / regionalTotal * 100 }));
    const mapScope = L(`2024 · ${verified.length} verified industrial installations · kt CO₂ and share of the displayed total`, `2024 г. · ${verified.length} верифицирани индустриални инсталации · kt CO₂ и дял от показания сбор`);
    const attribution = L('© EuroGeographics for the administrative boundaries.', '© EuroGeographics за административните граници.');
    const mapNote = L(`Shares refer only to the ${verified.length} installations in the site dataset, not all emissions in Bulgaria. Screening estimates, transport, households and other unlisted sources are excluded. Boundaries: Eurostat/GISCO NUTS 2021, 1:10 million. ${attribution}`, `Дяловете обхващат само ${verified.length}-те инсталации в набора от данни, а не всички емисии в България. Предварителните оценки, транспортът, домакинствата и други невключени източници са изключени. Граници: Eurostat/GISCO NUTS 2021, 1:10 млн. ${attribution}`);
    add('regional-emissions-map', 'industry', 'verified', 'industrial-geography', L('Bulgaria: emissions across six regions', 'България: емисии в шестте района'),
      mapScope, mapNote, regionalMap(mapRows, regionalTotal, lang, n, pct),
      [...mapRows.map((region) => `${region.id} · ${region.label}: ${n(region.value, 3)} kt CO₂ · ${pct(region.share)} · ${region.count} ${L('installations', 'инсталации')}`), `${L('Displayed total', 'Показан сбор')}: ${n(regionalTotal, 3)} kt CO₂`, attribution],
      [etsSource, registrySource, { name: 'Eurostat/GISCO · NUTS 2021', url: Geography.source }],
      { regions: mapRows, total: regionalTotal, geometrySource: Geography.source });

    const roster = (Data.createCompanyRoster || Data.createDefaultCompanies)();
    const supplied2025 = roster.filter(company => company.registry2025Provided);
    const sectorLabels = { Chemicals: L('Chemicals', 'Химическа промишленост'), 'Mineral Materials': L('Mineral materials', 'Минерални материали'), Metals: L('Metals', 'Металургия'), 'Other Manufacturing': L('Other manufacturing', 'Други производства') };
    const sectors = Object.entries(sectorLabels).map(([key, heading]) => ({ heading, value: roster.filter(company => (company.clusterSector || 'Chemicals') === key).length }));
    add('company-landscape', 'industry', 'mixed', 'companies', L('The industrial participant landscape', 'Кои са индустриалните участници?'),
      L(`${roster.length} profiles · ${supplied2025.length} operator records for 2025`, `${roster.length} профила · ${supplied2025.length} записа за оператори за 2025 г.`),
      L('Counts refer to entries in this platform. Some entries are separate installations of the same operator. EU ETS source: European Commission Union Registry. Existing 2024 profiles are retained. Missing emissions and reported zeros are distinct.', 'Броят се отнася до записите в платформата. Част от тях са отделни инсталации на един оператор. Източник за EU ETS: Регистър на Съюза на Европейската комисия. Съществуващите профили за 2024 г. са запазени. Липсващите емисии са разграничени от отчетените нули.'),
      tiles(sectors.map((sector) => ({ heading: String(sector.value), text: sector.heading })), 4),
      [...sectors.map((sector) => `${sector.heading}: ${sector.value}`), ...roster.map((company) => `${L(company.company, company.companyBg || company.company)} · ${t(company.mainActivity || company.sector)}`)], [etsSource], { verifiedCount: verified.length, supplementalCount: extra.length, registry2025Count: supplied2025.length, companyIds: roster.map((company) => company.id) });

    const levers = [
      [L('Clean electricity', 'Чиста електроенергия'), L('Electrify suitable processes; improve efficiency and integrate renewable supply.', 'Електрификация на подходящите процеси, ефективност и интегриране на ВЕИ.')],
      [L('Low-carbon hydrogen', 'Нисковъглероден водород'), L('Replace fossil hydrogen and selected fuels where the process allows it.', 'Замяна на изкопаем водород и определени горива, когато процесът го позволява.')],
      [L('CO₂ capture and storage', 'Улавяне и съхранение на CO₂'), L('Connect capture, transport and permanent storage for residual emissions.', 'Свързване на улавяне, транспорт и постоянно съхранение на остатъчни емисии.')],
      [L('Alternative fuels', 'Алтернативни горива'), L('Biomass and suitable waste-derived fuels, subject to sustainable supply.', 'Биомаса и подходящи горива от отпадъци при устойчиво снабдяване.')],
      [L('Circular materials', 'Кръгово използване на материали'), L('Recycling, secondary raw materials and lower-clinker products.', 'Рециклиране, вторични суровини и продукти с по-ниско съдържание на клинкер.')],
      [L('N₂O abatement', 'Ограничаване на N₂O'), L('Catalytic abatement in nitric-acid production; verify the baseline first.', 'Каталитично разграждане при производство на азотна киселина след проверка на базовите емисии.')],
    ];
    add('technology-pathways', 'technologies', 'pathways', 'pathways', L('Six routes to lower industrial emissions', 'Шест подхода за по-ниски индустриални емисии'),
      L('A toolkit adapted to the process and sector', 'Набор от решения според процеса и сектора'),
      L('These are complementary options, not a ranking or a commitment by every company. Applicability depends on the plant, infrastructure, power supply and project readiness.', 'Това са допълващи се възможности, без класиране и без ангажимент от всяка компания. Приложимостта зависи от инсталацията, инфраструктурата, електроснабдяването и готовността на проекта.'),
      tiles(levers.map(([heading, text]) => ({ heading, text })), 3), levers.map(([heading, text]) => `${heading}: ${text}`),
      Data.SECTOR_PATHWAYS.filter((sector) => ['cement', 'fertilisers', 'glass'].includes(sector.id)).map((sector) => ({ name: t(sector.source.name), url: sector.source.url })), {});

    const a = Data.TECHNOLOGY_ASSUMPTIONS;
    const electricityGWh = a.electrolyzerUnitMW * 8760 * a.electrolyzerCapacityFactor / 1000;
    const h2Kt = electricityGWh / a.electrolyzerSystemKWhPerKg;
    const h2Share = Data.TECHNOLOGY_DEFAULTS.hydrogenToAmmoniaShare / 100;
    const nh3Kt = h2Kt * h2Share / a.ammoniaHydrogenMassFraction;
    const hydrogenTiles = [
      { heading: `${a.electrolyzerUnitMW} MW`, text: L('Electrolyzer capacity', 'Мощност на електролизьора') },
      { heading: pct(a.electrolyzerCapacityFactor * 100), text: L('Capacity factor assumed', 'Допуснат коефициент на използване') },
      { heading: `${n(electricityGWh, 2)} GWh`, text: L('Annual electricity input', 'Годишно потребление на електроенергия') },
      { heading: `${n(h2Kt, 2)} kt H₂`, text: L(`Annual hydrogen at ${a.electrolyzerSystemKWhPerKg} kWh/kg`, `Годишен водород при ${a.electrolyzerSystemKWhPerKg} kWh/kg`) },
      { heading: pct(h2Share * 100), text: L('Hydrogen allocated to ammonia', 'Дял от водорода за амоняк') },
      { heading: `${n(nh3Kt, 2)} kt NH₃`, text: L('Theoretical annual ammonia output', 'Теоретичен годишен добив на амоняк') },
    ];
    add('hydrogen-ammonia', 'technologies', 'model', 'cluster', L('From electricity to hydrogen and ammonia', 'От електроенергия до водород и амоняк'),
      L('One 20 MW unit · an illustrative mass-and-energy balance', 'Един модул от 20 MW · примерен материален и енергиен баланс'),
      L('Theoretical full-year output before readiness and ramp-up constraints. NH₃ uses a hydrogen mass fraction of 3/17. Additional synthesis energy, losses and plant constraints are not included in this simple balance.', 'Теоретично производство за пълна година, преди ограниченията от готовност и въвеждане в експлоатация. Масовият дял на H₂ в NH₃ е 3/17. Простият баланс не включва допълнителна енергия за синтез, загуби и заводски ограничения.'),
      tiles(hydrogenTiles, 3), hydrogenTiles.map((item) => `${item.text}: ${item.heading}`), [modelSource], { electricityGWh, h2Kt, h2Share, nh3Kt });

    const cbamRows = source.cbamYears.map((year, index) => ({ label: String(year), value: source.cbamFactors[index] * 100, display: pct(source.cbamFactors[index] * 100) }));
    add('cbam-phase-in', 'finance', 'model', 'cbam', L('How the CBAM cost factor grows', 'Как нараства разходният фактор за CBAM'),
      L('2026–2034 · phase-in factors used by the site calculator', '2026–2034 г. · фактори за поетапно въвеждане в калкулатора'),
      L('Share used in the model for CBAM-covered products, not a percentage tariff on product value. Calculated cost also depends on embedded emissions, the carbon price and the calculator’s other assumptions.', 'Дял в модела за продукти в обхвата на CBAM, а не процентно мито върху стойността на продукта. Разходът зависи и от вложените емисии, въглеродната цена и останалите допускания на калкулатора.'),
      bars(cbamRows, 100), cbamRows.map((row) => `${row.label}: ${row.display}`), [{ name: L('European Commission · CBAM', 'Европейска комисия · CBAM'), url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en' }], { years: source.cbamYears.slice(), factors: source.cbamFactors.slice() });

    const priceNames = [L('Low', 'Ниска'), L('Base', 'Базова'), L('High', 'Висока')];
    const priceLines = ['low', 'base', 'high'].map((key, index) => ({ name: priceNames[index], values: source.etsPrices[key], color: COLORS[index] }));
    add('carbon-price-scenarios', 'finance', 'model', 'roi', L('Three carbon-price assumptions', 'Три допускания за въглеродната цена'),
      L('2026–2040 · €/t CO₂ · inputs to the ROI model', '2026–2040 г. · €/t CO₂ · входни данни за ROI модела'),
      L('These are fixed scenario assumptions in the site, not live market prices or price forecasts. Higher prices can increase avoided carbon costs; CAPEX, operating costs, timing and discounting also determine returns.', 'Това са фиксирани сценарни допускания в сайта, а не текущи пазарни цени или прогнози. По-високата цена увеличава избегнатите въглеродни разходи; възвръщаемостта зависи и от инвестициите, експлоатацията, сроковете и дисконтирането.'),
      lineChart(priceLines, source.etsYears, n, '€/t CO₂'),
      source.etsYears.map((year, index) => `${year}: ${priceLines.map((line) => `${line.name} €${n(line.values[index], 0)}`).join(' · ')}`), [roiSource], { prices: priceLines, years: source.etsYears.slice() });

    const revenueRows = AUCTION_REVENUE.map((row) => ({ ...AUCTION_MARKET_DATA.find((market) => market.year === row.year), year: row.year, value: row.revenueEur, label: String(row.year), display: `${n(row.revenueEur, 0)} €` }));
    const revenueTotal = revenueRows.reduce((sum, row) => sum + row.value, 0);
    const revenueChange = (revenueRows.at(-1).value / revenueRows.at(-2).value - 1) * 100;
    const revenuePeak = revenueRows.reduce((peak, row) => row.value > peak.value ? row : peak);
    const auctionForecast = estimateAuctionRevenue();
    const auctionNotes = [
      L('Price and total allowances include aviation; reported historical revenue excludes aviation.', 'Цената и общият брой квоти включват авиация; историческите приходи са без авиация.'),
      L('2026*: interim data at 16 Nov 2026. Separate installation revenue is not reported.', '2026*: междинни данни към 16.11.2026 г.; отделен приход без авиация не е посочен.'),
      L(`2026 forecast ≈ 79.47 × 8,014,500 × 365/320 × ${n(auctionForecast.installationShare * 100, 3)}% = €${n(auctionForecast.annualInstallationRevenueEur / 1e6, 1)}m.`, `Прогноза 2026 ≈ 79,47 × 8 014 500 × 365/320 × ${n(auctionForecast.installationShare * 100, 3)}% = ${n(auctionForecast.annualInstallationRevenueEur / 1e6, 1)} млн. €.`),
      L('Assumes constant price and daily volume; 320 calendar days elapsed. Seasonality is not modeled.', 'Допускания: постоянна цена и дневен обем; изминали 320 календарни дни. Сезонността не е моделирана.'),
      L('Installation share uses 2025 revenue: 829,233,344 / 836,182,380. Forecast excluded from historical total.', 'Дял без авиация по приходите за 2025 г.: 829 233 344 / 836 182 380. Прогнозата е извън историческия сбор.'),
      L('2013 includes €388,700 from an exceptional auction of remaining 2012 allowances. Source for historical receipts: MoEW.', '2013 г. включва 388 700 € от извънреден търг за остатъчни квоти от 2012 г. Източник за историческите приходи: МОСВ.'),
    ];
    const revenueArchive = { name: L('MoEW · Auction reports, 2012–2025', 'МОСВ · Отчети за търговете, 2012–2025'), url: 'https://www.moew.government.bg/bg/informaciya-za-osustestvenite-trujni-prodajbi-na-kvoti-za-emisii-na-parnikovi-gazove-i-generiranite-ot-tyah-prihodi/' };
    add('bulgaria-auction-revenue', 'finance', 'revenueForecast', 'policy', L('Bulgaria’s allowance auction revenues', 'Приходи за България от търгове на квоти'),
      L('2012–2025 reported revenue · 2026 forecast from data at 16 November', '2012–2025 г.: отчетени приходи · 2026 г.: прогноза по данни до 16 ноември'),
      auctionNotes.join(' '),
      revenueColumns(revenueRows, lang, n, { total: revenueTotal, change: revenueChange, peak: revenuePeak, forecast: auctionForecast }) + auctionMarketTable(revenueRows, AUCTION_SNAPSHOT_2026, revenueTotal, lang, n),
      [...revenueRows.map((row) => `${row.year}: ${L('weighted price', 'среднопретеглена цена')} ${n(row.priceEur, 2)} ${L('€/allowance', '€/квота')}; ${L('total allowances', 'общо квоти')} ${n(row.totalAllowances, 0)}; ${L('revenue excluding aviation', 'приход без авиация')} ${n(row.value, 0)} €`),
        `2026 · ${L('at 16 November', 'към 16 ноември')}: ${n(AUCTION_SNAPSHOT_2026.priceEur, 2)} ${L('€/allowance', '€/квота')}; ${n(AUCTION_SNAPSHOT_2026.totalAllowances, 0)} ${L('total allowances', 'общо квоти')}; ${L('installation revenue not supplied', 'приход без авиация не е посочен')}`,
        `${L('Conditional full-year forecast 2026', 'Условна прогноза за цялата 2026 г.')}: ≈ ${n(auctionForecast.annualInstallationRevenueEur / 1e6, 1)} ${L('€ million', 'млн. евро')}`,
        `${L('Total · 2012–2025 (excludes 2026 forecast)', 'Общо · 2012–2025 г. (без прогнозата за 2026 г.)')}: ${n(revenueTotal, 0)} €`, `${L('Highest annual revenue', 'Най-висок годишен приход')}: ${revenuePeak.year} · ${n(revenuePeak.value, 0)} €`, `${L('2025 compared with 2024', 'Изменение през 2025 г. спрямо 2024 г.')}: +${pct(revenueChange)}`],
      AUCTION_REVENUE.map((row) => ({ name: L(`MoEW · ${row.year} report`, `МОСВ · отчет за ${row.year} г.`), url: `https://www.moew.government.bg/static/media/ups/articles/attachments/${row.report}` })),
      { years: revenueRows.map((row) => row.year), revenuesEur: revenueRows.map((row) => row.value), marketData: AUCTION_MARKET_DATA.map((row) => ({ ...row })), snapshot2026: { ...AUCTION_SNAPSHOT_2026 }, forecast2026: auctionForecast, totalEur: revenueTotal, change2025Percent: revenueChange, peakYear: revenuePeak.year, peakRevenueEur: revenuePeak.value, exceptional2013ReceiptEur: 388700, scope: 'revenue-excludes-aviation-market-inputs-include-aviation', marketInputsSource: 'user-provided table' }, [revenueArchive], { height: 1680, footerY: 1428, noteLines: auctionNotes });

    const state = Data.createDefaultState();
    const scenarioRows = state.scenarios.map((scenario) => {
      const trajectory = Model.buildTransitionTrajectory(scenario, state.companies);
      const final = trajectory.aggregate.points.at(-1);
      return { id: scenario.id, label: t(scenario.name), value: final.reduction * 100, technical: final.technicalReduction * 100, closure: final.closureDrivenReduction * 100, activity: final.industrialActivity * 100, display: pct(final.reduction * 100) };
    });
    const legend = `<rect x="58" y="740" width="16" height="16" fill="${COLORS[1]}"/>${svgText(L('Technology-driven reduction', 'Технологично намаление'), 84, 754, 18)}<rect x="550" y="740" width="16" height="16" fill="${COLORS[3]}"/>${svgText(L('Reduction through closure', 'Намаление чрез закриване'), 576, 754, 18)}`;
    add('different-scenarios', 'scenarios', 'model', 'cluster', L('Different scenarios — different outcomes', 'Различни сценарии — различни резултати'),
      L('2050 emissions reduction relative to the model baseline · default settings', 'Намаление на емисиите до 2050 г. спрямо моделната база · начални настройки'),
      L(`Original scenario order; no ranking. Baseline mixes verified values and screening estimates (${extra.length} participants). Closure can reduce emissions by ending production. These are default model outcomes, not forecasts or saved custom scenarios.`, `Първоначалният ред е запазен, без класиране. Базата включва верифицирани стойности и предварителни оценки (${extra.length} участници). Закриването намалява емисии чрез спиране на производство. Показани са началните сценарии, а не прогнози или запазени потребителски настройки.`),
      bars(scenarioRows, 100, true) + legend,
      scenarioRows.map((row) => `${row.label}: ${L('total', 'общо')} ${pct(row.value)}; ${L('technology', 'технологии')} ${pct(row.technical)}; ${L('closure', 'закриване')} ${pct(row.closure)}; ${L('industrial activity retained', 'запазена индустриална активност')} ${pct(row.activity)}`), [], { scenarios: scenarioRows });
    cards.forEach((card, index) => { card.svg = poster(card, artworks[index], index + 1, cards.length); });
    return cards;
  }

  function wrap(value, limit) {
    const lines = [];
    let line = '';
    for (const word of String(value).split(/\s+/)) {
      if (line && (line + ' ' + word).length > limit) { lines.push(line); line = word; }
      else line += (line ? ' ' : '') + word;
    }
    if (line) lines.push(line);
    return lines;
  }
  function svgText(value, x, y, size = 22, options = {}) {
    const lines = wrap(value, options.wrap || 200);
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${options.fill || '#2b2230'}" font-weight="${options.bold ? 700 : 400}"${options.anchor ? ` text-anchor="${options.anchor}"` : ''}>${lines.map((line, i) => `<tspan x="${x}" dy="${i ? options.lineHeight || size * 1.28 : 0}">${esc(line)}</tspan>`).join('')}</text>`;
  }
  function bars(rows, maximum, stacked = false) {
    const max = maximum || Math.max(...rows.map((row) => row.value));
    const gap = Math.min(109, 438 / rows.length);
    return rows.map((row, index) => {
      const y = 282 + index * gap;
      const barY = y + (gap < 58 ? 10 : 20);
      const width = 1068;
      const amount = width * row.value / max;
      const technical = stacked ? width * row.technical / max : amount;
      const closure = stacked ? width * row.closure / max : 0;
      const labels = `${svgText(row.label, 58, y, gap < 58 ? 20 : 24, { wrap: 72 })}${svgText(row.display, 1130, y, 22, { anchor: 'end', bold: true })}`;
      if (row.value === null) return labels;
      return `${labels}<rect x="58" y="${barY}" width="${width}" height="${gap < 58 ? 9 : 17}" rx="4" fill="#ece0e8"/><rect x="58" y="${barY}" width="${technical}" height="${gap < 58 ? 9 : 17}" rx="4" fill="${stacked ? COLORS[1] : COLORS[index % COLORS.length]}"/>${closure > 0 ? `<rect x="${58 + technical}" y="${barY}" width="${closure}" height="9" fill="${COLORS[3]}"/>` : ''}`;
    }).join('');
  }

  function revenueColumns(rows, lang, n, summary) {
    const L = (en, bg) => lang === 'bg' ? bg : en;
    const last = rows.at(-1);
    let chart = `<rect x="58" y="264" width="420" height="112" rx="12" fill="#efe2ec"/>${svgText(L('Total revenue · 2012–2025', 'Общ приход · 2012–2025 г.'), 78, 290, 17)}${svgText(L(`€${n(summary.total / 1e9, 3)}bn`, `${n(summary.total / 1e9, 3)} млрд. €`), 78, 330, 36, { bold: true })}${svgText(`${n(summary.total, 0)} €`, 78, 356, 18, { fill: '#5d4a58' })}
      <rect x="496" y="264" width="314" height="112" rx="12" fill="#ece4eb"/>${svgText(L(`Peak year · ${summary.peak.year}`, `Най-силна година · ${summary.peak.year}`), 516, 290, 17)}${svgText(`${n(summary.peak.value / 1e6, 1)} ${L('€m', 'млн. €')}`, 516, 330, 29, { bold: true, fill: '#7a005e' })}${svgText(L('Highest annual revenue', 'Най-висок годишен приход'), 516, 356, 16, { fill: '#675767' })}
      <rect x="828" y="264" width="314" height="112" rx="12" fill="#f5e6f0"/>${svgText(L('Full-year forecast · 2026', 'Годишна прогноза · 2026'), 848, 290, 17)}${svgText(`≈ ${n(summary.forecast.annualInstallationRevenueEur / 1e6, 1)} ${L('€m', 'млн. €')}`, 848, 330, 29, { bold: true, fill: '#93307a' })}${svgText(L('Excluding aviation · conditional', 'Без авиация · условна оценка'), 848, 356, 16, { fill: '#6b2a5a' })}`;
    const patternId = `ig-title-bulgaria-auction-revenue-${lang}-forecast-pattern`;
    chart += `<defs><pattern id="${patternId}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f5e6f0"/><path d="M-2 2L2 -2M0 8L8 0M6 10L10 6" stroke="#c58bb4" stroke-width="2"/></pattern></defs>`;
    const plotRows = [...rows, { year: 2026, value: summary.forecast.annualInstallationRevenueEur, forecast: true, display: L('Conditional full-year forecast', 'Условна прогноза за цялата година') }];
    const left = 102, right = 1142, bottom = 698, height = 250;
    const maximum = Math.ceil(Math.max(...plotRows.map((row) => row.value)) / 300000000) * 300000000;
    const y = (value) => bottom - value / maximum * height;
    const width = (right - left) / plotRows.length;
    const barWidth = Math.min(46, width * .64);
    chart += svgText(L('Annual revenue · € million', 'Годишни приходи · млн. евро'), left - 12, 414, 18, { fill: '#5d4a58' });
    for (let value = 0; value <= maximum; value += 300000000) {
      chart += `<path d="M${left} ${y(value)}H${right}" stroke="#e3d3dd" stroke-width="${value === 0 ? 2 : 1}"/>${svgText(n(value / 1000000, 0), left - 18, y(value) + 6, 16, { anchor: 'end', fill: '#5d4a58' })}`;
    }
    plotRows.forEach((row, index) => {
      const center = left + width * (index + .5);
      const highlighted = row.year === summary.peak.year || row.year === last.year || row.forecast;
      const color = row.forecast ? '#93307a' : row.year === summary.peak.year ? '#7a005e' : row.year === last.year ? '#a8508f' : '#cf9dc1';
      const barHeight = bottom - y(row.value);
      const radius = Math.min(4, barHeight / 2);
      chart += `<rect ${row.forecast ? 'data-revenue-forecast-year' : 'data-revenue-year'}="${row.year}" x="${center - barWidth / 2}" y="${y(row.value)}" width="${barWidth}" height="${barHeight}" rx="${radius}" fill="${row.forecast ? `url(#${patternId})` : color}"${row.forecast ? ' stroke="#93307a" stroke-width="2" stroke-dasharray="5 3"' : ''}><title>${esc(`${row.year}: ${row.display}`)}</title></rect>${row.forecast ? '' : `<path d="M${center - barWidth / 2} ${bottom - radius}V${bottom}H${center + barWidth / 2}V${bottom - radius}" fill="${color}"/>`}<rect x="${center - width * .47}" y="${y(row.value) - 29}" width="${width * .94}" height="23" fill="#f8f6ed"/>${svgText(n(row.value / 1e6, 1), center, y(row.value) - 12, 16, { anchor: 'middle', bold: highlighted, fill: highlighted ? color : '#2b2230' })}${svgText(`${row.year}${row.forecast ? L('F', 'П') : ''}`, center, 726, 16, { anchor: 'middle', bold: highlighted, fill: highlighted ? color : '#5d4a58' })}`;
    });
    chart += svgText(L('F = conditional full-year forecast. Hatched column is excluded from the 2012–2025 total.', 'П = условна прогноза за цялата година. Щрихованата колона е извън сбора за 2012–2025 г.'), 102, 761, 16, { fill: '#5d4a58' });
    return chart;
  }

  function auctionMarketTable(rows, snapshot, total, lang, n) {
    const L = (en, bg) => lang === 'bg' ? bg : en;
    let result = svgText(L('Price, auction volume and revenue by year', 'Цена, продадени квоти и приходи по години'), 58, 810, 24, { bold: true });
    result += `<rect x="58" y="830" width="1084" height="50" rx="6" fill="#efe2ec"/>${svgText(L('Year', 'Година'), 78, 860, 18, { bold: true })}${svgText(L('Weighted price', 'Среднопретеглена цена'), 196, 851, 17, { bold: true })}${svgText(L('€/allowance · total market', '€/квота · общо'), 196, 872, 15, { fill: '#5d4a58' })}${svgText(L('Total allowances sold', 'Продадени общо квоти'), 444, 851, 17, { bold: true })}${svgText(L('Including aviation', 'Включително авиация'), 444, 872, 15, { fill: '#5d4a58' })}${svgText(L('Revenue excluding aviation', 'Приход без авиация'), 1122, 851, 17, { bold: true, anchor: 'end' })}${svgText(L('Euros · reported', 'Евро · отчетен'), 1122, 872, 15, { fill: '#5d4a58', anchor: 'end' })}`;
    const tableRows = [...rows, { ...snapshot, value: null }];
    tableRows.forEach((row, index) => {
      const y = 884 + index * 31;
      const color = row.year === 2023 ? '#7a005e' : '#2b2230';
      result += `<g data-auction-table-year="${row.year}"><rect x="58" y="${y}" width="1084" height="31" fill="${row.year === 2026 ? '#f5e6f0' : index % 2 ? '#f1e9ef' : '#f8f6ed'}"/>${svgText(`${row.year}${row.year === 2026 ? '*' : ''}`, 78, y + 22, 18, { bold: row.year >= 2023, fill: color })}${svgText(n(row.priceEur, 2), 396, y + 22, 18, { anchor: 'end' })}${svgText(n(row.totalAllowances, 0), 674, y + 22, 18, { anchor: 'end' })}${svgText(row.value === null ? L('Not separately reported', 'Не е посочен отделно') : n(row.value, 0), 1122, y + 22, row.value === null ? 16 : 18, { anchor: 'end', bold: row.year === 2023, fill: color })}</g>`;
    });
    result += `<rect x="58" y="1358" width="1084" height="46" rx="6" fill="#efe2ec"/>${svgText(L('Total 2012–2025 · excludes 2026 forecast', 'Общо 2012–2025 г. · без прогнозата за 2026 г.'), 78, 1387, 18, { bold: true })}${svgText(`${n(total, 0)} €`, 1122, 1389, 23, { anchor: 'end', bold: true })}`;
    return result;
  }
  function tiles(items, columns) {
    const rows = Math.ceil(items.length / columns);
    const width = (1084 - (columns - 1) * 18) / columns;
    const height = (480 - (rows - 1) * 18) / rows;
    return items.map((item, index) => {
      const x = 58 + index % columns * (width + 18);
      const y = 266 + Math.floor(index / columns) * (height + 18);
      const numeric = /^\d|^€/.test(item.heading);
      const titleSize = numeric ? (columns === 4 ? 35 : 38) : 26;
      return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="#fffef8" stroke="#dccbd6"/><rect x="${x}" y="${y + 18}" width="5" height="32" rx="2" fill="${COLORS[index % COLORS.length]}"/>${svgText(item.heading, x + 20, y + 49, titleSize, { bold: true, wrap: columns === 4 ? 17 : 22 })}${svgText(item.text, x + 20, y + (numeric ? 88 : 120), columns === 4 ? 19 : 21, { wrap: columns === 4 ? 21 : 26 })}`;
    }).join('');
  }
  function lineChart(series, years, n, unit) {
    const left = 115, top = 300, width = 975, height = 370;
    const highest = Math.max(...series.flatMap((line) => line.values));
    const max = Math.ceil(highest / (highest > 1000 ? 1000 : 50)) * (highest > 1000 ? 1000 : 50);
    const x = (index) => left + index / (years.length - 1) * width;
    const y = (value) => top + height * (1 - value / max);
    let result = svgText(unit, left, 276, 20, { bold: true });
    for (let i = 0; i <= 4; i++) {
      const value = max * i / 4;
      result += `<path d="M${left},${y(value)}H${left + width}" stroke="#e3d3dd"/>${svgText(n(value, 0), left - 18, y(value) + 6, 18, { anchor: 'end' })}`;
    }
    years.forEach((year, index) => {
      if (index === 0 || index === years.length - 1 || year % 5 === 0) result += svgText(year, x(index), 706, 20, { anchor: 'middle' });
    });
    series.forEach((line, index) => {
      result += `<polyline points="${line.values.map((value, i) => `${x(i)},${y(value)}`).join(' ')}" fill="none" stroke="${line.color}" stroke-width="5" stroke-linejoin="round"/>`;
      line.values.forEach((value, i) => { result += `<circle cx="${x(i)}" cy="${y(value)}" r="4" fill="${line.color}"/>`; });
      result += `<rect x="${115 + index * 300}" y="739" width="30" height="5" fill="${line.color}"/>${svgText(line.name, 157 + index * 300, 749, 20)}`;
    });
    return result;
  }
  function regionalMap(regions, total, lang, n, pct) {
    const L = (en, bg) => lang === 'bg' ? bg : en;
    const points = Geography.regions.flatMap((region) => region.polygons.flat(2));
    const minX = Math.min(...points.map((point) => point[0]));
    const maxX = Math.max(...points.map((point) => point[0]));
    const maxY = Math.max(...points.map((point) => point[1]));
    // Equirectangular projection with longitude correction at Bulgaria's mid-latitude.
    const scale = 700 / ((maxX - minX) * Math.cos(43 * Math.PI / 180));
    const project = ([longitude, latitude]) => [58 + (longitude - minX) * Math.cos(43 * Math.PI / 180) * scale, 276 + (maxY - latitude) * scale];
    const anchors = { BG31: [23.65, 43.42], BG32: [25.52, 43.37], BG33: [27.25, 43.48], BG34: [26.65, 42.58], BG41: [23.36, 42.16], BG42: [25.02, 42.04] };
    const maximum = Math.max(...regions.map((region) => region.value));
    const color = (value) => {
      const amount = maximum > 0 ? value / maximum : 0;
      return `rgb(${[245, 232, 241].map((start, index) => Math.round(start + ([122, 0, 94][index] - start) * amount)).join(',')})`;
    };
    const paths = Geography.regions.map((shape) => {
      const region = regions.find((item) => item.id === shape.id);
      const d = shape.polygons.map((polygon) => polygon.map((ring) => ring.map((point, index) => `${index ? 'L' : 'M'}${project(point).map((coordinate) => coordinate.toFixed(2)).join(',')}`).join('') + 'Z').join('')).join('');
      return `<path data-map-region="${shape.id}" d="${d}" fill="${color(region.value)}" fill-rule="evenodd" stroke="#fffef8" stroke-width="3" stroke-linejoin="round"><title>${esc(`${region.label}: ${n(region.value, 3)} kt CO₂ · ${pct(region.share)}`)}</title></path>`;
    }).join('');
    const labels = regions.map((region) => {
      const [x, y] = project(anchors[region.id]);
      const fill = region.value / maximum > .6 ? '#fffef8' : '#2e0a25';
      return `${svgText(region.id, x, y - 10, 16, { anchor: 'middle', fill })}${svgText(pct(region.share), x, y + 20, 27, { anchor: 'middle', fill, bold: true })}`;
    }).join('');
    const details = regions.map((region, index) => {
      const y = 292 + index * 63;
      return `<circle cx="816" cy="${y - 7}" r="7" fill="${color(region.value)}" stroke="#7a005e"/>${svgText(region.label, 836, y, 21, { bold: true })}${svgText(`${n(region.value, 1)} kt · ${pct(region.share)}`, 836, y + 27, 21, { fill: '#5d4a58' })}`;
    }).join('');
    const legend = [0, .25, .5, .75, 1].map((amount, index) => `<rect x="${58 + index * 24}" y="746" width="24" height="15" fill="${color(amount * maximum)}"/>`).join('');
    return `${paths}${labels}${details}${legend}${svgText(L('Darker = more emissions', 'По-тъмно = повече емисии'), 194, 759, 17)}
      ${svgText(L('N', 'С'), 744, 260, 15, { anchor: 'middle', bold: true })}<path d="M744 291V270M738 278L744 270L750 278" stroke="#5d4a58" stroke-width="2" fill="none"/>
      <rect x="804" y="682" width="338" height="84" rx="12" fill="#efe2ec"/>${svgText(L('Displayed total · 2024', 'Показан сбор · 2024 г.'), 824, 709, 17)}${svgText(`${n(total, 3)} kt CO₂`, 824, 744, 27, { bold: true })}`;
  }

  function poster(card, body, number, total) {
    const titleId = `ig-title-${card.id}-${card.lang}`;
    const descId = `ig-desc-${card.id}-${card.lang}`;
    const printSources = card.printSources || card.sources;
    const height = card.height || 960;
    const footerY = card.layout?.footerY || 783;
    const notes = card.layout?.noteLines ? card.layout.noteLines.map((line, index) => svgText(line, 58, footerY + 59 + index * 22, 16)).join('') : svgText(card.note, 58, footerY + 59, 18, { wrap: 117, lineHeight: 23 });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-labelledby="${titleId} ${descId}" lang="${card.lang}" xml:lang="${card.lang}">
      <title id="${titleId}">${esc(card.title)}</title><desc id="${descId}">${esc([card.subtitle, ...card.facts, card.note].join('\n'))}</desc>
      ${card.printSources ? `<metadata>${esc(JSON.stringify({ sources: card.sources }))}</metadata>` : ''}
      <rect width="1200" height="${height}" fill="#f8f6ed"/>
      <path d="M0 0H1200V12H0Z" fill="#7a005e"/>
      <g font-family="Arial, Helvetica, sans-serif">
      ${svgText('NET-ZERO LAB', 58, 53, 19, { bold: true, fill: '#7a005e' })}<image href="${LOGO_URI}" x="1098" y="18" width="44" height="44"/>
      ${svgText(card.title, 58, 110, 38, { bold: true, wrap: 49, lineHeight: 44 })}
      ${svgText(card.subtitle, 58, 211, 23, { wrap: 83, fill: '#5d4a58' })}
      ${body}
      <path d="M58 ${footerY}H1142" stroke="#dccbd6"/>
      ${svgText(card.kind, 58, footerY + 31, 17, { bold: true, fill: '#7a005e' })}
      ${notes}
      ${printSources.map((source, index) => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${svgText(`${index + 1}. ${source.name}`, 58 + index * 1084 / Math.max(3, printSources.length), height - 31, 12, { wrap: printSources.length > 3 ? 36 : 48, fill: '#5d4a58' })}</a>`).join('')}
      </g></svg>`;
  }

  let category = 'all';
  let openId = null;
  let currentCards = [];
  let lastTrigger = null;
  const langNow = () => typeof document !== 'undefined' && document.documentElement.getAttribute('data-lang') === 'bg' ? 'bg' : 'en';
  const word = (key) => copy[key][langNow()];
  const previewSvg = (card) => {
    const svg = card.svg.replace(/<a\b[^>]*>/g, '<g>').replace(/<\/a>/g, '</g>');
    return card.height > 1200 ? `<span class="ig-tall-preview">${svg}</span>` : svg;
  };
  const actionButtons = (card) => `<button class="ig-button" data-ig-action="svg" data-ig-id="${card.id}">SVG ↓</button><button class="ig-button" data-ig-action="png" data-ig-id="${card.id}">PNG ↓</button>`;
  function render() {
    const host = document.getElementById('infographicsContent');
    if (!host || typeof window.getInfographicSourceData !== 'function') return;
    currentCards = buildSeries(window.getInfographicSourceData(), langNow());
    host.innerHTML = `<div class="ig-intro"><p>${esc(word('intro'))}</p><span class="ig-count">${currentCards.length}</span></div>
      <div class="ig-filters" role="group" aria-label="${esc(categories.all[langNow()])}">${Object.entries(categories).map(([id, label]) => `<button class="ig-button" data-ig-category="${id}" aria-pressed="${id === category}">${esc(label[langNow()])}</button>`).join('')}</div>
      <div class="ig-grid">${currentCards.filter((card) => category === 'all' || card.category === category).map((card) => `<article class="ig-card"><button class="ig-preview" data-ig-action="open" data-ig-id="${card.id}" aria-label="${esc(word('open') + ': ' + card.title)}">${previewSvg(card)}</button><div class="ig-card-body"><span class="ig-badge">${esc(card.kind)}</span><h2>${esc(card.title)}</h2><p>${esc(card.subtitle)}</p><div class="ig-actions"><button class="ig-button ig-button-primary" data-ig-action="open" data-ig-id="${card.id}">${esc(word('open'))}</button>${actionButtons(card)}</div></div></article>`).join('')}</div><p class="ig-status" role="status" id="igStatus"></p>`;
    host.onclick = handleClick;
    if (openId) showDetail(openId, false);
  }
  function handleClick(event) {
    const filter = event.target.closest('[data-ig-category]');
    if (filter) { category = filter.dataset.igCategory; render(); document.querySelector(`[data-ig-category="${category}"]`)?.focus(); return; }
    const button = event.target.closest('[data-ig-action]');
    if (!button) return;
    const card = currentCards.find((entry) => entry.id === button.dataset.igId);
    if (!card) return;
    if (button.dataset.igAction === 'open') { lastTrigger = button; showDetail(card.id); }
    if (button.dataset.igAction === 'svg') { download(new Blob([card.svg], { type: 'image/svg+xml;charset=utf-8' }), `${card.id}-${card.lang}.svg`); status(word('svgReady')); }
    if (button.dataset.igAction === 'png') exportPNG(card);
    if (button.dataset.igAction === 'print') printCard(card);
    if (button.dataset.igAction === 'section') { closeDetail(); window.showSection(card.section); }
  }
  function showDetail(id, focus = true) {
    const card = currentCards.find((entry) => entry.id === id);
    if (!card) return;
    let dialog = document.getElementById('igDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'igDialog'; dialog.className = 'ig-dialog';
      dialog.setAttribute('data-core-i18n-ignore', '');
      document.body.append(dialog);
      dialog.addEventListener('click', (event) => { if (event.target === dialog || event.target.closest('[data-ig-close]')) closeDetail(); else handleClick(event); });
      dialog.addEventListener('close', () => {
        // A print cycle can reopen the dialog before its queued close event arrives.
        if (dialog.open) return;
        const previousId = dialog.dataset.igId;
        openId = null;
        const trigger = lastTrigger?.isConnected ? lastTrigger : document.querySelector(`[data-ig-action="open"][data-ig-id="${previousId}"]`);
        trigger?.focus();
      });
    }
    openId = id;
    dialog.dataset.igId = id;
    dialog.setAttribute('aria-labelledby', 'igDialogTitle');
    dialog.innerHTML = `<div class="ig-dialog-head"><h2 id="igDialogTitle">${esc(card.title)}</h2><div class="ig-actions">${actionButtons(card)}<button class="ig-button" data-ig-action="print" data-ig-id="${id}">${esc(word('print'))}</button><button class="ig-button" data-ig-close autofocus>${esc(word('close'))}</button></div></div><div class="ig-detail"><p>${esc(word('swipe'))}</p><div class="ig-figure">${card.svg.replaceAll(`ig-title-${card.id}-${card.lang}`, `ig-detail-title-${card.id}`).replaceAll(`ig-desc-${card.id}-${card.lang}`, `ig-detail-desc-${card.id}`)}</div><p class="ig-status" id="igDetailStatus" role="status"></p><h3>${esc(word('values'))}</h3><ul class="ig-values">${card.facts.map((fact) => `<li>${esc(fact)}</li>`).join('')}</ul><h3>${esc(word('sources'))}</h3><p>${esc(card.note)}</p><ul>${card.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.name)}</a></li>`).join('')}</ul><button class="ig-button" data-ig-action="section" data-ig-id="${id}">${esc(word('section'))}</button></div>`;
    if (!dialog.open) dialog.showModal();
    if (focus) dialog.querySelector('[data-ig-close]').focus();
  }
  function closeDetail() { openId = null; document.getElementById('igDialog')?.close(); }
  function status(message) { for (const id of ['igStatus', 'igDetailStatus']) { const node = document.getElementById(id); if (node) node.textContent = message; } }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function exportPNG(card) {
    status(word('pngWorking'));
    const url = URL.createObjectURL(new Blob([card.svg], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = (card.height || 960) * 2;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      download(blob, `${card.id}-${card.lang}.png`); status(word('pngReady'));
    } catch (error) { status(word('pngError')); }
    finally { URL.revokeObjectURL(url); }
  }
  function printCard(card) {
    document.querySelector('.ig-print')?.remove();
    const sheet = document.createElement('div'); sheet.className = (card.height || 960) > 1200 ? 'ig-print ig-print-portrait' : 'ig-print'; sheet.innerHTML = card.svg;
    sheet.setAttribute('data-core-i18n-ignore', '');
    document.body.append(sheet); document.body.classList.add('ig-printing');
    const dialog = document.getElementById('igDialog');
    const wasOpen = dialog?.open;
    // Close the top-layer dialog so only the dedicated print sheet is printed.
    if (wasOpen) dialog.close();
    const cleanup = () => { document.body.classList.remove('ig-printing'); sheet.remove(); if (wasOpen) showDetail(card.id); };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
  }
  return Object.freeze({ buildSeries, render, estimateAuctionRevenue });
});
