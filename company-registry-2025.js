(function initCompanyRegistry(root, factory) {
  const api = factory();
  root.CompanyRegistry2025 = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCompanyRegistry() {
  'use strict';
  // Values supplied by the project owner. Null is an empty report cell, never zero.
  const ACTIVITIES = {
    soda: ['Soda ash and sodium bicarbonate', 'Сода и натриев бикарбонат', 'Chemicals'],
    refining: ['Oil refining', 'Нефтопреработване', 'Chemicals'],
    clinker: ['Cement clinker', 'Циментов клинкер', 'Mineral Materials'],
    ammonia: ['Ammonia', 'Амоняк', 'Chemicals'],
    nonferrous: ['Non-ferrous metals', 'Цветни метали', 'Metals'],
    glass: ['Glass', 'Стъкло', 'Mineral Materials'],
    lime: ['Lime, dolomite or magnesite', 'Вар, доломит или магнезит', 'Mineral Materials'],
    steel: ['Pig iron or steel production', 'Производство на чугун или стомана', 'Metals'],
    nitric: ['Nitric acid', 'Азотна киселина', 'Chemicals'],
    ceramics: ['Ceramics', 'Керамика', 'Mineral Materials'],
    ferrous: ['Ferrous metals', 'Черни метали', 'Metals'],
    gypsum: ['Gypsum or plasterboard', 'Гипс или гипсокартон', 'Mineral Materials'],
    wool: ['Mineral wool', 'Минерална вата', 'Mineral Materials'],
    pulp: ['Pulp', 'Целулоза', 'Other Manufacturing'],
    paper: ['Paper or cardboard', 'Хартия или картон', 'Other Manufacturing'],
  };
  const rows = [
    ['solvay', 'Solvay Sodi JSCo', 'Солвей Соди АД', 'soda', 1853803, 1160502],
    ['lukoil', 'LUKOIL Neftochim Bourgas AD', 'ЛУКОЙЛ Нефтохим Бургас АД', 'refining', 1378817, 1097568],
    ['heidelberg', 'HEIDELBERG MATERIALS DEVNYA JSC', 'Хайделберг Матириълс Девня АД', 'clinker', 690890, 759448],
    ['neochim', 'NEOCHIM PLC', 'Неохим АД', 'ammonia', 440826, 396729],
    ['holcim', 'Holcim Bulgaria S.A', 'Холсим (България) АД', 'clinker', 430994, 421514],
    ['zlatna-panega', 'Zlatna Panega Cement AD', 'Златна Панега Цимент АД', 'clinker', 332218, 377357],
    ['kcm', 'KCM SA Plovdiv', 'КЦМ АД', 'nonferrous', 205552, 177435],
    ['trakya-glass', 'Trakya Glass Bulgaria EAD', 'Тракия Глас България ЕАД', 'glass', 200024, 160219],
    ['ba-glass-plovdiv', 'BA Glass Bulgaria SA', 'Би Ей Глас България АД — Пловдив', 'glass', 104645, 76129],
    ['ba-glass-sofia', 'BA Glass Bulgaria SA', 'Би Ей Глас България АД — София', 'glass', 53901, 49128],
    ['znhv-puklina', 'OGNYANOVO-K AD, ZNHV Puklina', 'Огняново-К АД — ЗНХВ Пуклина', 'lime', 77341, 80086],
    ['ognyanovo-k', 'OGNYANOVO-K AD', 'Огняново-К АД — Огняново', 'lime', 32167, 25531],
    ['stomana', 'Stomana Industry AD', 'Стомана Индъстри АД', 'steel', 84222, 67124],
    ['rubin', 'Rubin Trading EAD', 'Рубин Трейдинг ЕАД', 'glass', 68372, 30970],
    ['pasabahce', 'Pasabahce Bulgaria EAD', 'Пашабахче България ЕАД', 'glass', 53815, 63254],
    ['agropolychim', 'Agropolychim AD', 'Агрополихим АД', 'nitric', 52780, 119015],
    ['calcit', 'Calcit J.S.C', 'Калцит АД', 'lime', 52042, 41817],
    ['han-asparuh', 'Han Asparuh AD', 'Хан Аспарух АД', 'ceramics', 48147, 33777],
    ['aurubis', 'Aurubis Bulgaria AD', 'Аурубис България АД', 'nonferrous', 44322, 279412],
    ['promet-steel', 'PROMET STEEL EAD', 'Промет Стиил ЕАД', 'ferrous', 36556, 29412],
    ['alcomet', 'ALCOMET AD', 'Алкомет АД', 'nonferrous', 31684, 17946],
    ['han-omurtag', 'Han Omurtag AD', 'Хан Омуртаг АД', 'ceramics', 27431, 23819],
    ['knauf', 'Knauf Bulgaria EOOD', 'Кнауф България ЕООД', 'gypsum', 26569, 8434],
    ['wienerberger', 'Wienerberger EOOD', 'Винербергер ЕООД', 'ceramics', 26487, 25189],
    ['sofia-med', 'Sofia Med SA', 'София Мед АД', 'nonferrous', 26272, 17201],
    ['fibran', 'FIBRAN BULGARIA AD', 'Фибран България АД', 'wool', 19807, 5404],
    ['novo-staklo', 'Novo Staklo EAD', 'Ново стъкло ЕАД', 'glass', 18978, 18658],
    ['villeroy-boch', 'Villeroy & Boch Bulgaria AD', 'Вилерой & Бох България АД', 'ceramics', 17215, 12730],
    ['keros', 'KEROS CERAMICA EAD', 'Керос Керамика ЕАД', 'ceramics', 14372, 11278],
    ['keramika-burgas', 'Keramika Burgas LTD', 'Керамика Бургас АД', 'ceramics', 11055, 6557],
    ['roca', 'Roca Bulgaria Jsc', 'Рока България АД', 'ceramics', 7043, 5588],
    ['svilosa', 'Svilosa AD', 'Свилоза АД', 'pulp', 6551, 14518],
    ['insa-oil', 'INSA OIL EOOD', 'Инса Ойл ЕООД', 'refining', 6280, 15182],
    ['claires', 'CLAIRES LTD', 'Клеърс ООД', 'paper', 3843, 0],
    ['bulgarian-petroleum-refinery', 'Balgarska Petrolna Rafineria EOOD', 'Българска петролна рафинерия ЕООД', 'refining', 3464, 6663],
    ['sma-mineral', 'SMA Mineral Burgas Var Ltd', 'СМА Минерал Бургас Вар ЕООД', 'lime', 1795, 2982],
    ['trud', 'TRUD Jsc', 'Труд АД', 'ceramics', 1118, 917],
    ['velpa-91', 'Velpa-91 AD', 'Велпа-91 АД', 'paper', 769, 1057],
    ['progress', 'PROGRESS JSC', 'Прогрес АД', 'steel', 237, 392],
    ['keramat', 'KERAMAT AD, Kaspichan', 'Керамат АД — Каспичан', 'ceramics', 0, 2477],
    ['keramik-gt', 'Keramik – GT JSC', 'Керамик-ГТ АД', 'ceramics', 0, 0],
    ['mondi-stambolijski', 'Mondi Stambolijski EAD', 'Монди Стамболийски ЕАД', 'paper', 0, 33452],
    ['vmv-metal', 'VMV Metal EOOD', 'ВМВ Метал ЕООД', 'steel', 0, 0],
    ['industrial-solutions', 'INDUSTRIAL SOLUTIONS BULGARIA Ltd.', 'Индустриал Сълюшънс България ЕООД', 'gypsum', null, 10108],
    ['polysan', 'Polysan', 'Полисан АД', 'refining', null, 0],
    ['tamara-2009', 'Tamara 2009 OOD', 'Тамара 2009 ООД', 'lime', null, 26915],
    ['belovo-paper', 'Zavod za hartia Belovo AD', 'Завод за хартия Белово АД', 'paper', null, 2323],
    ['keraminzhenering', 'KERAMINGENERING AD', 'Кераминженеринг АД', 'ceramics', 137, 253],
    ['casting-forging', 'CASTING FORGING MASHINERY COMPLEX LTD', 'Леярно Ковашки Машиностроителен Комплекс ЕООД', 'steel', 98, 70],
    ['vos-ceramics', 'VOS Ceramics LTD', 'ВОС Керамикс ЕООД', 'ceramics', 0, 0],
    ['keram-invest', 'KERAM INVEST AD', 'Керам Инвест АД', 'ceramics', null, 1412],
    ['rodna-industria-91', 'Rodna Industria 91', 'Родна индустрия-91 ЕООД', 'ceramics', 0, 252],
    ['nikom-97', 'Nikom 97', 'Ником 97 АД', 'ceramics', null, 157],
  ];
  // Settlement/industrial-zone centres, not surveyed installation coordinates.
  // Ambiguous multi-site operators stay in the directory pending a site identifier.
  const LOCATIONS = {
    'sma-mineral': ['Burgas', 'Бургас', 'Burgas', 'BG34', 42.51, 27.46, 'https://old.eea.government.bg/bg/r-r/r-kpkz/godishni-dokladi-14/dokumenti-2023/GDOS2023_SMAMINERALBURGASVAR_EOOD.pdf'],
    keraminzhenering: ['Bagrentsi', 'Багренци', 'Kyustendil', 'BG41', 42.28, 22.79, 'https://test.eea.government.bg/godishni-dokladi-po-okolna-sreda-na-operatorite'],
    kcm: ['Kuklen / Plovdiv', 'Куклен / Пловдив', 'Plovdiv', 'BG42', 42.07, 24.77, 'https://kcm2000.bg/'],
    knauf: ['Mednikarovo', 'Медникарово', 'Stara Zagora', 'BG34', 42.13, 25.95, 'https://stz.riew.gov.bg/files/File/Kompleksni_proverki/2022/Кнауф%20България%20ЕООД.pdf'],
    alcomet: ['Shumen', 'Шумен', 'Shumen', 'BG33', 43.27, 26.95, 'https://www.alcomet.bg/'],
    'han-omurtag': ['Shumen', 'Шумен', 'Shumen', 'BG33', 43.284, 27.031, 'https://eea.government.bg/bg/obyavi/kpkz-doc-23/HanOmurtag_24082023.pdf'],
    wienerberger: ['Lukovit', 'Луковит', 'Lovech', 'BG31', 43.21, 24.16, 'https://www.wienerberger.bg/za-nas/wienerberger-v-bulgaria.html'],
    'sofia-med': ['Sofia', 'София', 'Sofia (capital)', 'BG41', 42.67, 23.39, 'https://www.sofiamed.com/'],
    fibran: ['Targovishte', 'Търговище', 'Targovishte', 'BG33', 43.25, 26.57, 'https://fibran.bg/за-нас/'],
    'novo-staklo': ['Novi Pazar', 'Нови пазар', 'Shumen', 'BG33', 43.35, 27.20, 'https://test.eea.government.bg/godishni-dokladi-po-okolna-sreda-na-operatorite'],
    'keramika-burgas': ['Sarafovo, Burgas', 'Сарафово, Бургас', 'Burgas', 'BG34', 42.56, 27.51, 'https://keramika.bg/'],
    roca: ['Kaspichan', 'Каспичан', 'Shumen', 'BG33', 43.31, 27.16, 'https://www.roca.bg/'],
    'insa-oil': ['Belozem', 'Белозем', 'Plovdiv', 'BG42', 42.20, 25.03, 'https://insaoil.bg/'],
    'villeroy-boch': ['Sevlievo', 'Севлиево', 'Gabrovo', 'BG32', 43.03, 25.10, 'https://www.vidima.bg/yuridicheska-informatsiya'],
    keros: ['Ruse', 'Русе', 'Ruse', 'BG32', 43.8725, 26.0432, 'https://rcci.bg/members/керос-българия-еад/'],
    claires: ['Cherkovitsa', 'Черковица', 'Pleven', 'BG31', 43.62, 24.75, 'https://old.eea.government.bg/bg/r-r/r-kpkz/GD_doc_24/GDOS_Kleyrs_2023.pdf'],
    'bulgarian-petroleum-refinery': ['Dolni Dabnik / Yasen', 'Долни Дъбник / Ясен', 'Pleven', 'BG31', 43.41, 24.50, 'https://test.eea.government.bg/godishni-dokladi-po-okolna-sreda-na-operatorite'],
    'keramik-gt': ['General Toshevo', 'Генерал Тошево', 'Dobrich', 'BG33', 43.70, 28.04, 'https://generaltoshevo.bg/attachments/download?id=4466'],
    'vmv-metal': ['Ihtiman', 'Ихтиман', 'Sofia', 'BG41', 42.43, 23.82, 'https://sme.government.bg/wp-content/uploads/2014/04/Hannover_Messe.pdf'],
    trud: ['Ruse', 'Русе', 'Ruse', 'BG32', 43.84, 25.97, 'https://trud-bg.com/index1.php?lang=BG'],
    'velpa-91': ['Strazhitsa', 'Стражица', 'Veliko Tarnovo', 'BG32', 43.23, 25.96, 'https://velpa91.com/'],
    progress: ['Stara Zagora', 'Стара Загора', 'Stara Zagora', 'BG34', 42.42, 25.63, 'https://progress-sz.com/page/3/История.html'],
    keramat: ['Kaspichan', 'Каспичан', 'Shumen', 'BG33', 43.31, 27.17, 'https://old.eea.government.bg/bg/r-r/r-kpkz/godishni-dokladi-dokumenti-2023/GDOSKERAMAT_.pdf'],
    'mondi-stambolijski': ['Stamboliyski', 'Стамболийски', 'Plovdiv', 'BG42', 42.13, 24.53, 'https://www.mondigroup.com/'],
    'industrial-solutions': ['Kovachevo, Radnevo', 'Ковачево, Раднево', 'Stara Zagora', 'BG34', 42.24, 25.95, 'https://stz.riew.gov.bg/Kompleksni_proverki-c144'],
    polysan: ['Marten', 'Мартен', 'Ruse', 'BG32', 43.91, 26.08, 'https://marten-bg.eu/news.html'],
    'belovo-paper': ['Belovo', 'Белово', 'Pazardzhik', 'BG42', 42.21, 24.02, 'https://www.bappi.org/bg/member/view/12/'],
    'casting-forging': ['Radomir', 'Радомир', 'Pernik', 'BG41', 42.54, 22.96, 'https://bami.bg/media/docs/godishnik_2016_eng.pdf'],
    'keram-invest': ['Sliven', 'Сливен', 'Sliven', 'BG34', 42.68, 26.33, 'https://stz.riew.gov.bg/files/File/План%20за%20контролна%20дейност%202025%20г.pdf'],
    'nikom-97': ['Gorna Oryahovitsa', 'Горна Оряховица', 'Veliko Tarnovo', 'BG32', 43.13, 25.70, 'https://www.riosvt.org/compleksni/'],
    'tamara-2009': ['Opitsvet', 'Опицвет', 'Sofia', 'BG41', 42.88, 23.11, 'https://www.riew-sofia.org/index.php/8-2014-02-03-02-29-00/359-2014-05-27-08-19-41'],
    'vos-ceramics': ['Straldzha', 'Стралджа', 'Yambol', 'BG34', 42.580740, 26.693045, 'https://vosceramics.com/en/contacts/'],
    'rodna-industria-91': ['Popovo', 'Попово', 'Targovishte', 'BG33', 43.35, 26.23, 'https://riosv-shumen.eu/documents/files/Regionalen_doklad_2020.pdf'],
  };
  const INSTALLATIONS = {
    heidelberg: ['Devnya Cement', 'Девня Цимент'], holcim: ['Holcim Bulgaria — Beli Izvor', 'Холсим България — Бели извор'],
    'znhv-puklina': ['ZNHV Puklina', 'ЗНХВ Пуклина'], 'ognyanovo-k': ['Ognyanovo Plant', 'Завод Огняново'],
    rubin: ['Rubin JSC', 'Рубин АД'], knauf: ['Knauf Maritza plasterboard plant', 'Завод за гипсови плоскости Кнауф Марица'],
    'villeroy-boch': ['Ideal Standard Bulgaria', 'Идеал Стандарт България'],
    'sma-mineral': ['SMA Mineral Burgas Var — Burgas', 'СМА Минерал Бургас Вар — Бургас'],
    'industrial-solutions': ['Technogips JSC', 'Техногипс АД'],
    'tamara-2009': ['Quicklime production installation', 'Инсталация за производство на негасена вар'],
    keraminzhenering: ['KERAMINGENERING — KZ Bagrentsi branch', 'Кераминженеринг — клон КЗ Багренци'],
    'casting-forging': ['RADOMIR METAL INDUSTRIES', 'Радомир Метал Индъстрийз'],
    'keram-invest': ['KERAM INVEST AD — Sliven', 'Керам Инвест АД — Сливен'],
  };
  // Employment is an operator-level figure, separate from installation-level ETS data.
  const DIRECT_EMPLOYEES_2025 = Object.freeze({
    solvay: 412, lukoil: 1176, heidelberg: 287, neochim: 625, holcim: 367,
    'zlatna-panega': 274, kcm: 1324, 'trakya-glass': 597, 'ba-glass': 592,
    'ognyanovo-k': 189, stomana: 1168, rubin: 586, pasabahce: 899,
    agropolychim: 752, calcit: 98, 'han-asparuh': 781, aurubis: 1074,
    'promet-steel': 471, alcomet: 1353, 'han-omurtag': 447, knauf: 251,
    wienerberger: 131, fibran: 179, 'sofia-med': 768, 'novo-staklo': 244,
    'villeroy-boch': 2604, keros: 174, 'keramika-burgas': 93, roca: 322,
    svilosa: 13, 'insa-oil': 218, claires: 59, 'bulgarian-petroleum-refinery': 41,
    'sma-mineral': 46, trud: 67, 'velpa-91': 169, progress: 486, keramat: 13,
    'keramik-gt': 10, 'mondi-stambolijski': 29, 'vmv-metal': 26,
    'industrial-solutions': null, polysan: 1, 'tamara-2009': null,
    'belovo-paper': null, keraminzhenering: null, 'casting-forging': 51,
    'vos-ceramics': 33, 'keram-invest': null, 'rodna-industria-91': 2, 'nikom-97': 4,
  });
  const STAFF_OPERATOR_IDS = Object.freeze({
    'ba-glass-plovdiv': 'ba-glass', 'ba-glass-sofia': 'ba-glass',
    'znhv-puklina': 'ognyanovo-k', 'ognyanovo-k': 'ognyanovo-k',
  });
  const records = rows.map(([id, registryOperatorName, companyBg, mainActivityId, verifiedEmissions2025T, freeAllowances2025Eua]) => {
    const [en, bg, clusterSector] = ACTIVITIES[mainActivityId];
    const location = LOCATIONS[id];
    const suffix = id === 'ba-glass-plovdiv' ? ' — Plovdiv' : id === 'ba-glass-sofia' ? ' — Sofia' : '';
    return Object.freeze({ id, company: registryOperatorName + suffix, companyBg, registryOperatorName,
      mainActivityId, mainActivity: Object.freeze({ en, bg }), clusterSector,
      verifiedEmissions2025T, freeAllowances2025Eua, registry2025Provided: true,
      staffOperatorId: STAFF_OPERATOR_IDS[id] || id,
      directEmployees2025: DIRECT_EMPLOYEES_2025[STAFF_OPERATOR_IDS[id] || id],
      staffSharedAcrossSites: Object.hasOwn(STAFF_OPERATOR_IDS, id),
      registryInstallation: Object.freeze({ en: INSTALLATIONS[id]?.[0] || registryOperatorName + suffix, bg: INSTALLATIONS[id]?.[1] || companyBg }),
      geography: location ? Object.freeze({ locality: location[0], localityBg: location[1], district: location[2], regionId: location[3], latitude: location[4], longitude: location[5], sourceUrl: location[6] }) : undefined,
    });
  });
  const nameTranslations = Object.fromEntries(records.map((row) => [row.company, row.companyBg]));
  Object.values(ACTIVITIES).forEach(([en, bg]) => { nameTranslations[en] = bg; });
  Object.values(LOCATIONS).forEach((location) => { nameTranslations[location[0]] = location[1]; });
  return Object.freeze({ records: Object.freeze(records), directEmployees2025ByOperator: DIRECT_EMPLOYEES_2025, activities: Object.freeze(ACTIVITIES), nameTranslations: Object.freeze(nameTranslations) });
});
