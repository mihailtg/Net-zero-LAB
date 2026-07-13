/* ═══════════════════════════════════════════════
   OFFICIAL BULGARIAN GHG INVENTORY DATABASE
   Source: Database_01.xlsx — National Inventory
   Sheet2: IPPU & sub-sector historical 2010–2023
   Sheet4: Fuel combustion breakdown 2023
═══════════════════════════════════════════════ */

const DB = {
  "nat_2023": {
    "energy": 32853.46,
    "ippu": 3855.65,
    "agri": 5941.62,
    "waste": 2714.19,
    "lulucf": -8601.07
  },
  "ippu_2023": {
    "2.A Mineral Industry": 1967.87,
    "2.B Chemical Industry": 1033.67,
    "2.C Metal Industry": 158.11,
    "2.D Non-energy Products": 12.83,
    "2.F ODS Substitutes": 631.39,
    "2.G Other": 51.78
  },
  "ippu_hist": [
    {
      "year": 2010,
      "total": 4076.82,
      "mineral": 1811.79,
      "chemical": 1473.37,
      "metal": 288.66,
      "nonenergy": 28.5,
      "ods": 414.31,
      "other": 60.19
    },
    {
      "year": 2011,
      "total": 4619.91,
      "mineral": 1953.77,
      "chemical": 1801.33,
      "metal": 315.88,
      "nonenergy": 27.27,
      "ods": 467.86,
      "other": 53.8
    },
    {
      "year": 2012,
      "total": 4338.48,
      "mineral": 2056.84,
      "chemical": 1430.9,
      "metal": 290.17,
      "nonenergy": 23.83,
      "ods": 483.01,
      "other": 53.73
    },
    {
      "year": 2013,
      "total": 4225.19,
      "mineral": 1941.35,
      "chemical": 1459.71,
      "metal": 221.79,
      "nonenergy": 18.62,
      "ods": 539.34,
      "other": 44.37
    },
    {
      "year": 2014,
      "total": 4518.7,
      "mineral": 2005.29,
      "chemical": 1590.85,
      "metal": 249.29,
      "nonenergy": 20.35,
      "ods": 609.02,
      "other": 43.91
    },
    {
      "year": 2015,
      "total": 5132.26,
      "mineral": 2385.67,
      "chemical": 1776.4,
      "metal": 224.06,
      "nonenergy": 14.24,
      "ods": 681.82,
      "other": 50.08
    },
    {
      "year": 2016,
      "total": 5338.84,
      "mineral": 2508.21,
      "chemical": 1825.33,
      "metal": 223.42,
      "nonenergy": 18.92,
      "ods": 713.26,
      "other": 49.69
    },
    {
      "year": 2017,
      "total": 5218.85,
      "mineral": 2521.48,
      "chemical": 1735.87,
      "metal": 183.08,
      "nonenergy": 17.18,
      "ods": 713.76,
      "other": 47.48
    },
    {
      "year": 2018,
      "total": 4890.06,
      "mineral": 2478.52,
      "chemical": 1442.77,
      "metal": 186.11,
      "nonenergy": 15.4,
      "ods": 718.95,
      "other": 48.31
    },
    {
      "year": 2019,
      "total": 4561.88,
      "mineral": 2357.68,
      "chemical": 1196.52,
      "metal": 160.65,
      "nonenergy": 16.44,
      "ods": 781.08,
      "other": 49.51
    },
    {
      "year": 2020,
      "total": 4280.68,
      "mineral": 2280.77,
      "chemical": 1018.29,
      "metal": 148.93,
      "nonenergy": 16.08,
      "ods": 767.48,
      "other": 49.13
    },
    {
      "year": 2021,
      "total": 4562.2,
      "mineral": 2348.9,
      "chemical": 1247.4,
      "metal": 132.65,
      "nonenergy": 16.28,
      "ods": 763.45,
      "other": 53.53
    },
    {
      "year": 2022,
      "total": 4554.75,
      "mineral": 2650.52,
      "chemical": 1003.5,
      "metal": 151.22,
      "nonenergy": 14.73,
      "ods": 676.46,
      "other": 58.32
    },
    {
      "year": 2023,
      "total": 3855.65,
      "mineral": 1967.87,
      "chemical": 1033.67,
      "metal": 158.11,
      "nonenergy": 12.83,
      "ods": 631.39,
      "other": 51.78
    }
  ],
  "chemical_industry_emissions_trend": [
    { "year": 2005, "value": 7504.16 },
    { "year": 2006, "value": 7318.85 },
    { "year": 2007, "value": 7770.17 },
    { "year": 2008, "value": 6846.43 },
    { "year": 2009, "value": 3818.37 },
    { "year": 2010, "value": 4076.82 },
    { "year": 2011, "value": 4619.91 },
    { "year": 2012, "value": 4338.48 },
    { "year": 2013, "value": 4225.19 },
    { "year": 2014, "value": 4518.7 },
    { "year": 2015, "value": 5132.26 },
    { "year": 2016, "value": 5338.84 },
    { "year": 2017, "value": 5218.85 },
    { "year": 2018, "value": 4890.06 },
    { "year": 2019, "value": 4561.88 },
    { "year": 2020, "value": 4280.67 },
    { "year": 2021, "value": 4562.2 },
    { "year": 2022, "value": 4554.75 },
    { "year": 2023, "value": 3855.65 }
  ],
  "subsec_hist": [
    {
      "year": 2010,
      "petroleum_refining_1a1b": 715.99,
      "chemicals_1a2c": 215.9,
      "pulp_paper_1a2d": 112.02,
      "lime_2a2": 225.13,
      "clinker_2a1": 807.29,
      "soda_ash_process_2a4b": 105.64,
      "carbonate_desox_2a4d": 556.68,
      "ammonia_2b1": 726.11,
      "soda_ash_2b7": 504.88,
      "nitric_acid_2b2": 227.9
    },
    {
      "year": 2011,
      "petroleum_refining_1a1b": 597.73,
      "chemicals_1a2c": 223.95,
      "pulp_paper_1a2d": 123.86,
      "lime_2a2": 243.8,
      "clinker_2a1": 787.3,
      "soda_ash_process_2a4b": 87.91,
      "carbonate_desox_2a4d": 708.16,
      "ammonia_2b1": 1035.75,
      "soda_ash_2b7": 548.82,
      "nitric_acid_2b2": 201.4
    },
    {
      "year": 2012,
      "petroleum_refining_1a1b": 705.84,
      "chemicals_1a2c": 226.13,
      "pulp_paper_1a2d": 118.94,
      "lime_2a2": 194.26,
      "clinker_2a1": 981.29,
      "soda_ash_process_2a4b": 67.18,
      "carbonate_desox_2a4d": 690.11,
      "ammonia_2b1": 757.51,
      "soda_ash_2b7": 550.17,
      "nitric_acid_2b2": 111.3
    },
    {
      "year": 2013,
      "petroleum_refining_1a1b": 647.63,
      "chemicals_1a2c": 248.73,
      "pulp_paper_1a2d": 136.3,
      "lime_2a2": 213.45,
      "clinker_2a1": 89163.0,
      "soda_ash_process_2a4b": 94.4,
      "carbonate_desox_2a4d": 610.83,
      "ammonia_2b1": 802.18,
      "soda_ash_2b7": 538.76,
      "nitric_acid_2b2": 108.64999999999999
    },
    {
      "year": 2014,
      "petroleum_refining_1a1b": 650.4,
      "chemicals_1a2c": 224.22,
      "pulp_paper_1a2d": 123.95,
      "lime_2a2": 203.55,
      "clinker_2a1": 911.12,
      "soda_ash_process_2a4b": 90.49,
      "carbonate_desox_2a4d": 667.83,
      "ammonia_2b1": 872.52,
      "soda_ash_2b7": 599.18,
      "nitric_acid_2b2": 111.3
    },
    {
      "year": 2015,
      "petroleum_refining_1a1b": 815.95,
      "chemicals_1a2c": 346.27,
      "pulp_paper_1a2d": 124.31,
      "lime_2a2": 204.06,
      "clinker_2a1": 1105.43,
      "soda_ash_process_2a4b": 100.68,
      "carbonate_desox_2a4d": 825.29,
      "ammonia_2b1": 1084.79,
      "soda_ash_2b7": 574.38,
      "nitric_acid_2b2": 111.3
    },
    {
      "year": 2016,
      "petroleum_refining_1a1b": 833.65,
      "chemicals_1a2c": 379.19,
      "pulp_paper_1a2d": 129.68,
      "lime_2a2": 216.61,
      "clinker_2a1": 1194.11,
      "soda_ash_process_2a4b": 219.25,
      "carbonate_desox_2a4d": 724.01,
      "ammonia_2b1": 1137.62,
      "soda_ash_2b7": 579.24,
      "nitric_acid_2b2": 100.7
    },
    {
      "year": 2017,
      "petroleum_refining_1a1b": 863.13,
      "chemicals_1a2c": 1024.32,
      "pulp_paper_1a2d": 116.88,
      "lime_2a2": 223.53,
      "clinker_2a1": 1239.3,
      "soda_ash_process_2a4b": 110.01,
      "carbonate_desox_2a4d": 785.25,
      "ammonia_2b1": 1086.48,
      "soda_ash_2b7": 561.8,
      "nitric_acid_2b2": 82.15
    },
    {
      "year": 2018,
      "petroleum_refining_1a1b": 821.55,
      "chemicals_1a2c": 1543.73,
      "pulp_paper_1a2d": 116.34,
      "lime_2a2": 251.72,
      "clinker_2a1": 1223.5,
      "soda_ash_process_2a4b": 99.91,
      "carbonate_desox_2a4d": 748.22,
      "ammonia_2b1": 784.0,
      "soda_ash_2b7": 550.78,
      "nitric_acid_2b2": 103.35000000000001
    },
    {
      "year": 2019,
      "petroleum_refining_1a1b": 992.43,
      "chemicals_1a2c": 1432.4,
      "pulp_paper_1a2d": 112.52,
      "lime_2a2": 248.63,
      "clinker_2a1": 1137.77,
      "soda_ash_process_2a4b": 72.39,
      "carbonate_desox_2a4d": 750.95,
      "ammonia_2b1": 600.79,
      "soda_ash_2b7": 512.15,
      "nitric_acid_2b2": 76.85
    },
    {
      "year": 2020,
      "petroleum_refining_1a1b": 803.84,
      "chemicals_1a2c": 1332.22,
      "pulp_paper_1a2d": 103.99,
      "lime_2a2": 201.24,
      "clinker_2a1": 1065.9,
      "soda_ash_process_2a4b": 197.26,
      "carbonate_desox_2a4d": 572.19,
      "ammonia_2b1": 592.92,
      "soda_ash_2b7": 442.62,
      "nitric_acid_2b2": 71.55000000000001
    },
    {
      "year": 2021,
      "petroleum_refining_1a1b": 729.43,
      "chemicals_1a2c": 1562.08,
      "pulp_paper_1a2d": 118.19,
      "lime_2a2": 255.85,
      "clinker_2a1": 1060.39,
      "soda_ash_process_2a4b": 144.17,
      "carbonate_desox_2a4d": 717.05,
      "ammonia_2b1": 594.52,
      "soda_ash_2b7": 569.43,
      "nitric_acid_2b2": 74.2
    },
    {
      "year": 2022,
      "petroleum_refining_1a1b": 1032.46,
      "chemicals_1a2c": 1438.31,
      "pulp_paper_1a2d": 98.17,
      "lime_2a2": 324.61,
      "clinker_2a1": 1039.99,
      "soda_ash_process_2a4b": 217.07,
      "carbonate_desox_2a4d": 890.44,
      "ammonia_2b1": 485.63,
      "soda_ash_2b7": 450.68,
      "nitric_acid_2b2": 66.25
    },
    {
      "year": 2023,
      "petroleum_refining_1a1b": 955.79,
      "chemicals_1a2c": 1090.29,
      "pulp_paper_1a2d": 64.53,
      "lime_2a2": 235.8,
      "clinker_2a1": 1045.91,
      "soda_ash_process_2a4b": 80.6,
      "carbonate_desox_2a4d": 483.58,
      "ammonia_2b1": 492.94,
      "soda_ash_2b7": 460.03,
      "nitric_acid_2b2": 75.19
    }
  ],
  "company_sectors": {
    "Agropolychim": {
      "energy": "1.A.2.c",
      "process": "2.B.1"
    },
    "Neochim": {
      "energy": "1.A.2.c",
      "process": "2.B.1"
    },
    "Solvay Sodi": {
      "energy": "1.A.2.c",
      "process": "2.B.7"
    },
    "LUKOIL Neftohim Burgas": {
      "energy": "1.A.1.b",
      "process": null
    },
    "Svilosa": {
      "energy": "1.A.2.d",
      "process": null
    },
    "Orgachim": {
      "energy": "1.A.2.c",
      "process": "2.D.3"
    },
    "Agria": {
      "energy": "1.A.2.c",
      "process": null
    },
    "Biovet": {
      "energy": "1.A.2.c",
      "process": "2.D.3"
    },
    "Holcim": {
      "energy": null,
      "process": "2.A.1+2.A.2"
    }
  },
  "fuel_combustion_2023": [
    {
      "code": "1.A.1.a",
      "name": "Electricity & Heat Production",
      "group": "Energy",
      "total": 14807.21,
      "liquid": 54.63,
      "solid": 12978.39,
      "gas": 1736.86,
      "waste": 0.0,
      "biomass": 37.32
    },
    {
      "code": "1.A.1.b",
      "name": "Petroleum Refining",
      "group": "Energy",
      "total": 955.79,
      "liquid": 914.76,
      "solid": 0.0,
      "gas": 41.03,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.1.c",
      "name": "Solid Fuel Manufacture",
      "group": "Energy",
      "total": 4.58,
      "liquid": 3.12,
      "solid": 0.05,
      "gas": 1.41,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.2.a",
      "name": "Iron & Steel",
      "group": "Manufacturing",
      "total": 111.8,
      "liquid": 0.63,
      "solid": 0.0,
      "gas": 111.17,
      "waste": 0.0,
      "biomass": 0.0004
    },
    {
      "code": "1.A.2.b",
      "name": "Non-Ferrous Metals",
      "group": "Manufacturing",
      "total": 240.76,
      "liquid": 50.47,
      "solid": 94.82,
      "gas": 95.46,
      "waste": 0.0,
      "biomass": 0.0003
    },
    {
      "code": "1.A.2.c",
      "name": "Chemical Industry",
      "group": "Manufacturing",
      "total": 1090.29,
      "liquid": 632.03,
      "solid": 356.02,
      "gas": 101.22,
      "waste": 0.0,
      "biomass": 1.02
    },
    {
      "code": "1.A.2.d",
      "name": "Pulp, Paper & Print",
      "group": "Manufacturing",
      "total": 64.53,
      "liquid": 1.16,
      "solid": 4.19,
      "gas": 52.45,
      "waste": 0.0,
      "biomass": 6.74
    },
    {
      "code": "1.A.2.e",
      "name": "Food & Beverage",
      "group": "Manufacturing",
      "total": 290.92,
      "liquid": 30.74,
      "solid": 4.18,
      "gas": 253.7,
      "waste": 0.0,
      "biomass": 2.3
    },
    {
      "code": "1.A.2.f",
      "name": "Non-Metallic Minerals (incl. Cement)",
      "group": "Manufacturing",
      "total": 947.07,
      "liquid": 288.44,
      "solid": 107.58,
      "gas": 546.56,
      "waste": 0.0,
      "biomass": 4.48
    },
    {
      "code": "1.A.2.g",
      "name": "Other Industries",
      "group": "Manufacturing",
      "total": 1082.76,
      "liquid": 396.96,
      "solid": 65.14,
      "gas": 281.4,
      "waste": 332.62,
      "biomass": 6.64
    },
    {
      "code": "1.A.4.a",
      "name": "Commercial/Institutional Services",
      "group": "Other",
      "total": 357.38,
      "liquid": 113.93,
      "solid": 7.2,
      "gas": 199.01,
      "waste": 0.0,
      "biomass": 37.25
    },
    {
      "code": "1.A.4.b",
      "name": "Residential Households",
      "group": "Other",
      "total": 489.1,
      "liquid": 34.36,
      "solid": 58.08,
      "gas": 165.39,
      "waste": 0.0,
      "biomass": 231.26
    },
    {
      "code": "1.A.4.c",
      "name": "Agriculture, Forestry & Fishing",
      "group": "Other",
      "total": 502.39,
      "liquid": 445.78,
      "solid": 32.51,
      "gas": 22.35,
      "waste": 0.0,
      "biomass": 1.76
    },
    {
      "code": "1.A.3.a",
      "name": "Civil Aviation",
      "group": "Transport",
      "total": 17.6,
      "liquid": 17.6,
      "solid": 0.0,
      "gas": 0.0,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.3.b",
      "name": "Road Transport",
      "group": "Transport",
      "total": 10437.11,
      "liquid": 0,
      "solid": 0,
      "gas": 0,
      "waste": 0,
      "biomass": 0
    },
    {
      "code": "1.A.3.c",
      "name": "Railways",
      "group": "Transport",
      "total": 29.59,
      "liquid": 29.59,
      "solid": 0.0,
      "gas": 0.0,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.3.d",
      "name": "Navigation",
      "group": "Transport",
      "total": 5.8,
      "liquid": 5.8,
      "solid": 0.0,
      "gas": 0.0,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.3.e",
      "name": "Pipelines",
      "group": "Transport",
      "total": 219.9,
      "liquid": 0.0,
      "solid": 0.0,
      "gas": 219.9,
      "waste": 0.0,
      "biomass": 0.0
    },
    {
      "code": "1.A.5.b",
      "name": "Other Mobile Sources",
      "group": "Transport",
      "total": 31.29,
      "liquid": 31.29,
      "solid": 0.0,
      "gas": 0.0,
      "waste": 0.0,
      "biomass": 0.0
    }
  ]
};

/* ═══════════════════════════════════════════════
   NET-ZERO LAB — Core App Logic & Data
═══════════════════════════════════════════════ */

// ── LANGUAGE SWITCH ─────────────────────────
const I18N = {
  en: {
    'page.title': 'Net-Zero Lab - Bulgarian Chemical Industry Decarbonization',
    'brand.subtitle': 'BG Chemical Industry',
    'nav.overview': 'Overview',
    'nav.companies': 'Companies',
    'nav.pathways': 'Pathways',
    'nav.emissions': 'Emissions',
    'nav.dataset': 'Dataset',
    'nav.policy': 'Policy & Regulation',
    'nav.roi': 'ROI Analysis',
    'nav.investments': 'Investments',
    'nav.cbam': 'CBAM & ETS Cost Calculator',
    'nav.netzerolab': 'Net-Zero Lab',
    'nav.cluster': 'Cluster Analysis',
    'controls.text': 'Text',
    'sidebar.sources': 'Data sources: European Commission · Bulgaria MREW · CEFIC · EBRD',
    'theme.light': 'Light mode',
    'theme.dark': 'Dark mode',
    'section.dashboard.title': 'Overview Dashboard',
    'section.dashboard.desc': 'Bulgarian chemical industry decarbonization - key indicators and progress',
    'section.dashboard.pill': 'Latest available data · 2026',
    'section.companies.title': 'Company Profiles',
    'section.companies.desc': 'Key chemical industry players and their decarbonization status',
    'section.pathways.title': 'Decarbonization Pathways',
    'section.pathways.desc': 'Technology levers and transition routes toward net-zero',
    'section.emissions.title': 'Emissions Data',
    'section.emissions.desc': 'Official Bulgarian National GHG Inventory · UNFCCC CRF · 2010–2023',
    'section.emissions.pill': 'Official · 2023',
    'section.dataset.title': 'Structured Dataset',
    'section.dataset.desc': "Tabular views of the dashboard's source data, history series, and company registry",
    'section.dataset.pill': '6 generated tables',
    'section.policy.title': 'Policy & Regulation',
    'section.policy.desc': "The regulatory framework shaping Bulgaria's industrial decarbonization",
    'section.netzerolab.title': 'Net-Zero Lab',
    'section.netzerolab.desc': 'Research unit at FEBA, Sofia University, translating climate-neutrality targets into evidence-based transformation',
    'section.roi.title': 'ROI Analysis',
    'section.roi.desc': 'How avoided ETS compliance costs compensate decarbonization investments - payback periods and cumulative cashflows 2026–2040',
    'section.roi.pill': '9 companies · Official data',
    'section.investments.title': 'Technology Investment Needs',
    'section.investments.desc': 'Required CAPEX per company and decarbonization pathway toward net-zero by 2050',
    'section.investments.pill': 'Estimates · 2026',
    'section.cbam.title': 'CBAM & ETS Cost Calculator',
    'section.cbam.desc': 'Estimate 2026–2034 carbon cost exposure from CBAM-linked free allocation phaseout and EU ETS assumptions, by company and product',
    'section.cbam.pill': 'Live Formula · Apr 2026',
    'section.cluster.title': 'Cluster Analysis',
    'section.cluster.desc': 'Scenario matrix showing how each policy scenario changes the model inputs.',
    'section.cluster.pill': '5 scenarios · apply_scenario()',
    'section.cluster.cardTitle': 'Cluster analysis module',
    'section.cluster.kicker': 'Module in progress',
    'section.cluster.placeholderTitle': 'Cluster analysis is coming soon.',
    'section.cluster.placeholderDesc': 'This section is reserved for the next phase of the dashboard, where you will add cluster mapping, inter-company linkages, shared infrastructure, and industrial ecosystem insights.'
  },
  bg: {
    'page.title': 'Net-Zero Lab - декарбонизация на българската химическа индустрия',
    'brand.subtitle': 'Химическа индустрия BG',
    'nav.overview': 'Обзор',
    'nav.companies': 'Компании',
    'nav.pathways': 'Пътища',
    'nav.emissions': 'Емисии',
    'nav.policy': 'Политики',
    'nav.roi': 'ROI анализ',
    'nav.investments': 'Инвестиции',
    'nav.cbam': 'CBAM & ETS',
    'nav.netzerolab': 'Net-Zero Lab',
    'nav.cluster': 'Клъстерен анализ',
    'controls.text': 'Текст',
    'sidebar.sources': 'Източници: Европейска комисия · МОСВ · CEFIC · ЕБВР',
    'theme.light': 'Светъл режим',
    'theme.dark': 'Тъмен режим',
    'section.dashboard.title': 'Обзорно табло',
    'section.dashboard.desc': 'Декарбонизация на българската химическа индустрия - ключови показатели и напредък',
    'section.dashboard.pill': 'Последни налични данни · 2026',
    'section.companies.title': 'Профили на компании',
    'section.companies.desc': 'Ключови предприятия в химическата индустрия и техният статус на декарбонизация',
    'section.pathways.title': 'Пътища за декарбонизация',
    'section.pathways.desc': 'Технологични лостове и преходни маршрути към нетни нулеви емисии',
    'section.emissions.title': 'Данни за емисиите',
    'section.emissions.desc': 'Официален национален инвентар на ПГ на България · UNFCCC CRF · 2010-2023',
    'section.emissions.pill': 'Официални · 2023',
    'section.policy.title': 'Политики и регулации',
    'section.policy.desc': 'Регулаторната рамка, която оформя индустриалната декарбонизация в България',
    'section.netzerolab.title': 'Net-Zero Lab',
    'section.netzerolab.desc': 'Изследователско звено към СУ, Стопански факултет, което превежда целите за климатична неутралност в решения, основани на данни',
    'section.roi.title': 'ROI анализ',
    'section.roi.desc': 'Как избегнатите ETS разходи компенсират инвестициите в декарбонизация - срокове на изплащане и кумулативен паричен поток 2026-2040',
    'section.roi.pill': '9 компании · Официални данни',
    'section.investments.title': 'Необходими технологични инвестиции',
    'section.investments.desc': 'Необходим CAPEX по компании и пътища за декарбонизация към нетна нула до 2050 г.',
    'section.investments.pill': 'Оценки · 2026',
    'section.cbam.title': 'CBAM & ETS калкулатор',
    'section.cbam.desc': 'Оценка на въглеродната експозиция 2026-2034 от CBAM-свързаното намаляване на безплатните квоти и ETS допускания, по компания и продукт',
    'section.cbam.pill': 'Жива формула · апр 2026',
    'section.cluster.title': 'Клъстерен анализ',
    'section.cluster.desc': 'Матрица със сценарии, показваща как всеки политически сценарий променя входовете на модела.',
    'section.cluster.pill': '5 сценария · apply_scenario()',
    'section.cluster.cardTitle': 'Модул за клъстерен анализ',
    'section.cluster.kicker': 'Модулът се подготвя',
    'section.cluster.placeholderTitle': 'Клъстерният анализ ще бъде добавен скоро.',
    'section.cluster.placeholderDesc': 'Тази секция е запазена за следващата фаза на таблото, където ще добавиш картиране на клъстери, връзки между компаниите, споделена инфраструктура и изводи за индустриалната екосистема.'
  }
};

function getLanguage() {
  return document.documentElement.getAttribute('data-lang') || 'en';
}

function translate(key) {
  const lang = getLanguage();
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

function setLanguage(lang) {
  const next = lang === 'bg' ? 'bg' : 'en';
  document.documentElement.setAttribute('data-lang', next);
  document.documentElement.lang = next;
  document.title = translate('page.title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = translate(key);
  });

  document.querySelectorAll('.language-btn[data-lang]').forEach(btn => {
    const active = btn.dataset.lang === next;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  try {
    localStorage.setItem('nzlLanguage', next);
  } catch (error) {
    // Language persistence is optional; the switch still works when storage is blocked.
  }

  renderClusterAnalysis();
  renderDatasetTables();
  updateThemeIcons(document.documentElement.getAttribute('data-theme') || 'light');
}

function initLanguageControl() {
  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('nzlLanguage') || 'en';
  } catch (error) {
    savedLanguage = 'en';
  }

  setLanguage(savedLanguage);
  document.querySelectorAll('.language-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
}

// ── THEME ────────────────────────────────────
(function() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  updateThemeIcons(prefersDark ? 'dark' : 'light');
})();

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  updateThemeIcons(next);
  refreshChartsForTheme();
}

function updateThemeIcons(theme) {
  const sunSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
  const moonSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const label = theme === 'dark' ? translate('theme.light') : translate('theme.dark');
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  if (themeLabel) themeLabel.textContent = label;
  if (themeToggle) {
    const iconEl = themeToggle.querySelector('svg');
    if (iconEl) iconEl.outerHTML = theme === 'dark' ? sunSVG : moonSVG;
  }
  const mobileIcon = document.getElementById('themeIconMobile');
  if (mobileIcon) mobileIcon.outerHTML = theme === 'dark' ? sunSVG : moonSVG;
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

// ── FONT SIZE CONTROL ────────────────────────
const FONT_SCALE_MIN = 80;
const FONT_SCALE_MAX = 150;
const FONT_SCALE_STEP = 5;
const FONT_SCALE_DEFAULT = 100;

function clampFontScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return FONT_SCALE_DEFAULT;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, numeric));
}

function applyFontScale(value) {
  const scale = clampFontScale(value);
  document.documentElement.style.fontSize = `${scale}%`;
  document.documentElement.style.setProperty('--font-scale', String(scale / 100));
  const slider = document.getElementById('fontSizeSlider');
  const display = document.getElementById('fontSizeValue');
  if (slider) slider.value = String(scale);
  if (display) display.textContent = `${scale}%`;
  if (window.Chart && Chart.instances) {
    Object.values(Chart.instances).forEach(chart => chart?.resize?.());
  }
}

function adjustFontScale(delta) {
  const slider = document.getElementById('fontSizeSlider');
  const current = slider ? Number(slider.value) : FONT_SCALE_DEFAULT;
  applyFontScale(current + delta);
}

function initFontSizeControl() {
  applyFontScale(FONT_SCALE_DEFAULT);
  document.getElementById('fontSizeSlider')?.addEventListener('input', e => applyFontScale(e.target.value));
  document.getElementById('fontSizeDecrease')?.addEventListener('click', () => adjustFontScale(-FONT_SCALE_STEP));
  document.getElementById('fontSizeIncrease')?.addEventListener('click', () => adjustFontScale(FONT_SCALE_STEP));
}

// ── NAVIGATION ───────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const section = document.getElementById('section-' + id);
  if (section) section.classList.add('active');
  const navItem = document.querySelector(`[data-section="${id}"]`);
  if (navItem) navItem.classList.add('active');
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Lazy-init section charts
  if (id === 'emissions') { setTimeout(() => { buildIppuCharts(); updateDashboardWithDbData(); }, 50); }
  if (id === 'dataset') { setTimeout(renderDatasetTables, 50); }
  if (id === 'cbam')      { if (cbamChartInstance) { cbamChartInstance.destroy(); cbamChartInstance = null; } setTimeout(() => { renderPriceChips(); calcCBAM(); }, 50); }
  if (id === 'investments') { if (invRangeChartInstance) { invRangeChartInstance.destroy(); invRangeChartInstance = null; } setTimeout(buildInvRangeChart, 50); }
  if (id === 'roi') {
    if (paybackChartInst) { paybackChartInst.destroy(); paybackChartInst = null; }
    if (cashflowChartInst) { cashflowChartInst.destroy(); cashflowChartInst = null; }
    if (roiScenarioSnapshotChartInst) { roiScenarioSnapshotChartInst.destroy(); roiScenarioSnapshotChartInst = null; }
    if (roiEtsChartInst) { roiEtsChartInst.destroy(); roiEtsChartInst = null; }
    setTimeout(initRoi, 50);
  }
}

function refreshChartsForTheme() {
  Object.values(charts).forEach(chart => chart?.destroy?.());
  charts = {};

  if (cbamChartInstance) { cbamChartInstance.destroy(); cbamChartInstance = null; }
  if (invRangeChartInstance) { invRangeChartInstance.destroy(); invRangeChartInstance = null; }
  if (paybackChartInst) { paybackChartInst.destroy(); paybackChartInst = null; }
  if (cashflowChartInst) { cashflowChartInst.destroy(); cashflowChartInst = null; }
  if (roiScenarioSnapshotChartInst) { roiScenarioSnapshotChartInst.destroy(); roiScenarioSnapshotChartInst = null; }
  if (roiEtsChartInst) { roiEtsChartInst.destroy(); roiEtsChartInst = null; }
  if (macChartInst) { macChartInst.destroy(); macChartInst = null; }
  if (ippuTotalChartInst) { ippuTotalChartInst.destroy(); ippuTotalChartInst = null; }
  if (ippu2023PieInst) { ippu2023PieInst.destroy(); ippu2023PieInst = null; }
  if (ippuStackedInst) { ippuStackedInst.destroy(); ippuStackedInst = null; }
  if (energySubsecInst) { energySubsecInst.destroy(); energySubsecInst = null; }
  if (processEmsInst) { processEmsInst.destroy(); processEmsInst = null; }
  if (companyEmsDbInst) { companyEmsDbInst.destroy(); companyEmsDbInst = null; }
  if (fuelGroupInst) { fuelGroupInst.destroy(); fuelGroupInst = null; }
  if (mfgFuelInst) { mfgFuelInst.destroy(); mfgFuelInst = null; }

  setTimeout(() => {
    buildCharts();
    updateDashboardWithDbData();

    const activeSection = document.querySelector('.section.active')?.id;
    if (activeSection === 'section-cbam') {
      renderPriceChips();
      calcCBAM();
    }
    if (activeSection === 'section-investments') buildInvRangeChart();
    if (activeSection === 'section-roi') initRoi();
    if (activeSection === 'section-emissions') {
      if (document.getElementById('emsp-ippu')?.classList.contains('active')) buildIppuCharts();
      if (document.getElementById('emsp-subsector')?.classList.contains('active')) buildSubsectorCharts();
      if (document.getElementById('emsp-fuel2023')?.classList.contains('active')) buildFuel2023Charts();
    }
  }, 50);
}

function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('overlay').classList.toggle('active');
}
function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  document.getElementById('overlay')?.classList.remove('active');
}

// ── KPI COUNTER ANIMATION ────────────────────
function animateKPIs() {
  document.querySelectorAll('.kpi-val[data-target]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isFloat = target % 1 !== 0;
    const duration = 1400;
    const startTime = performance.now();
    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = isFloat ? (eased * target).toFixed(2) : Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ── CHART.JS CONFIG ──────────────────────────
function getCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function withChartAlpha(color, alphaHex = 'cc') {
  if (!color) return color;
  if (color.startsWith('#') && color.length === 7) return color + alphaHex;
  if (color.startsWith('rgb(')) {
    const alpha = parseInt(alphaHex, 16) / 255;
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha.toFixed(3)})`);
  }
  return color;
}

function getChartColors() {
  const semantic = {
    total:      getCssVar('--chart-total', '#1d4ed8'),
    chemical:  getCssVar('--chart-chemical', '#15803d'),
    mineral:   getCssVar('--chart-mineral', '#2563eb'),
    metal:     getCssVar('--chart-metal', '#dc2626'),
    ods:       getCssVar('--chart-ods', '#7c3aed'),
    nonEnergy: getCssVar('--chart-nonenergy', '#d97706'),
    other:     getCssVar('--chart-other', '#475569'),
    reference: getCssVar('--chart-reference', '#475569'),
    investment:getCssVar('--chart-investment', '#dc2626'),
    savings:   getCssVar('--chart-savings', '#15803d'),
    cbam:      getCssVar('--chart-cbam', '#d97706'),
    net:       getCssVar('--chart-net', '#2563eb'),
  };

  const companies = {
    agropolychim: getCssVar('--chart-company-agropolychim', '#15803d'),
    neochim:      getCssVar('--chart-company-neochim', '#7c3aed'),
    solvay:       getCssVar('--chart-company-solvay', '#0891b2'),
    lukoil:       getCssVar('--chart-company-lukoil', '#dc2626'),
    svilosa:      getCssVar('--chart-company-svilosa', '#d97706'),
    heidelberg:   getCssVar('--chart-company-heidelberg', '#2563eb'),
    holcim:       getCssVar('--chart-company-holcim', '#475569'),
    biovet:       getCssVar('--chart-company-biovet', '#be123c'),
    orgachim:     getCssVar('--chart-company-orgachim', '#0f766e'),
  };

  return {
    text:      getCssVar('--text', '#231720'),
    textMuted: getCssVar('--chart-axis-text', '#5f5361'),
    grid:      getCssVar('--chart-grid', 'rgba(103, 87, 103, 0.18)'),
    surface:   getCssVar('--chart-tooltip-bg', '#fffef8'),
    border:    getCssVar('--chart-tooltip-border', '#ded4c7'),
    segmentBorder: getCssVar('--chart-segment-border', '#fffef8'),
    palette: [
      getCssVar('--chart-1', '#2563eb'),
      getCssVar('--chart-2', '#dc2626'),
      getCssVar('--chart-3', '#15803d'),
      getCssVar('--chart-4', '#d97706'),
      getCssVar('--chart-5', '#7c3aed'),
      getCssVar('--chart-6', '#0891b2'),
    ],
    semantic,
    companies,
    primary: semantic.total,
    blue: semantic.mineral,
    amber: semantic.nonEnergy,
    teal: semantic.other,
    red: semantic.metal,
    purple: semantic.ods,
    slate: semantic.other,
    success: semantic.chemical,
  };
}

function getCompanyChartColors(keys) {
  const c = getChartColors();
  return keys.map((key, index) => c.companies[key] || c.palette[index % c.palette.length]);
}

function getIppuColorForLabel(label) {
  const c = getChartColors();
  const key = String(label).toLowerCase();
  if (key.includes('mineral')) return c.semantic.mineral;
  if (key.includes('chemical')) return c.semantic.chemical;
  if (key.includes('metal')) return c.semantic.metal;
  if (key.includes('ods')) return c.semantic.ods;
  if (key.includes('non-energy')) return c.semantic.nonEnergy;
  return c.semantic.other;
}

function normalizeRoiCompanyKey(name = '') {
  return String(name).toLowerCase()
    .replace(/\s/g, '')
    .replace('solvaysodi', 'solvay')
    .replace('lukoilneftochimburgasad', 'lukoil')
    .replace('lukoilneftochimburgas', 'lukoil')
    .replace('lukoilneftohimburgasad', 'lukoil')
    .replace('lukoilneftohimburgas', 'lukoil')
    .replace('lukoilneftochim', 'lukoil')
    .replace('lukoilneftohim', 'lukoil')
    .replace('heidelbergmaterials', 'heidelberg')
    .replace('holcimbulgaria', 'holcim')
    .replace('biovet/huvepharma', 'biovet');
}

const chartDefaults = () => {
  const c = getChartColors();
  return {
    plugins: {
      legend: { labels: { color: c.textMuted, font: { family: 'DM Sans, sans-serif', size: 12 }, padding: 16, usePointStyle: true } },
      tooltip: {
        backgroundColor: c.surface,
        titleColor: c.text, bodyColor: c.textMuted,
        borderColor: c.border, borderWidth: 1, padding: 10,
        titleFont: { family: 'DM Sans', weight: '600' }, bodyFont: { family: 'DM Sans', size: 12 },
      }
    },
    scales: {
      x: { ticks: { color: c.textMuted, font: { family: 'DM Mono, monospace', size: 11 } }, grid: { color: c.grid } },
      y: { ticks: { color: c.textMuted, font: { family: 'DM Mono, monospace', size: 11 } }, grid: { color: c.grid } }
    }
  };
};

// ── DASHBOARD CHARTS ─────────────────────────
let charts = {};

function buildCharts() {
  const c = getChartColors();

  // Emissions Trend — updated by updateDashboardWithDbData() after init
  const etCtx = document.getElementById('emissionsTrendChart');
  if (etCtx && !charts.emissionsTrend) {
    const trend = DB.chemical_industry_emissions_trend;
    charts.emissionsTrend = new Chart(etCtx, {
      type: 'line',
      data: {
        labels: trend.map(d => String(d.year)),
        datasets: [{
          label: 'Chemical Industry Emissions (Kt CO₂eq)',
          data: trend.map(d => d.value),
          borderColor: c.semantic.chemical,
          backgroundColor: withChartAlpha(c.semantic.chemical, '18'),
          fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5 }]
      },
      options: {
        ...chartDefaults(), responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults().plugins, legend: { display: false } },
        scales: { ...chartDefaults().scales, y: { ...chartDefaults().scales.y, beginAtZero: false,
          title: { display: true, text: 'Kt CO₂eq', color: c.textMuted, font: { size: 11, family: 'DM Sans' } } } }
      }
    });
  }

  // IPPU Breakdown Pie (dashboard) — updated by updateDashboardWithDbData()
  const ipuCtx = document.getElementById('ipuPieChart');
  if (ipuCtx && !charts.ipuPie) {
    const labels = ['2.A Mineral Industry','2.B Chemical Industry','2.F ODS Substitutes','2.C Metal Industry','2.D Non-energy Products','2.G Other'];
    charts.ipuPie = new Chart(ipuCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: [1967.87, 1033.67, 631.39, 158.11, 12.83, 51.78],
          backgroundColor: labels.map(getIppuColorForLabel),
          borderColor: c.segmentBorder, borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults().plugins,
          legend: { ...chartDefaults().plugins.legend, position: 'right' },
          tooltip: { ...chartDefaults().plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(2)} Kt (${(ctx.parsed/3855.65*100).toFixed(1)}%)` } } } }
    });
  }

  // Emissions page history charts — built lazily in buildSubsectorCharts()
  // Full Emissions Chart (Emissions page — IPPU total historical) — built in buildIppuCharts()
  // Company Emissions Chart — built in buildSubsectorCharts()
}

// ── COMPANY DATA ─────────────────────────────
const companies = [
  {
    id:'agropolychim', name:'Agropolychim AD', location:'Devnya (Varna region)',
    sector:'Nitrogen & phosphate fertilizers', maturity:'advanced',
    color:'var(--success)', colorBg:'var(--success-light)', initials:'AP',
    description:'Leading producer of nitrogen and phosphorus fertilizers in the region. The company has eliminated local ammonia production, reducing natural gas consumption by 98% and shifting entirely to imported ammonia via its own terminal. Scope 1 emissions now arise mainly from combustion processes and N₂O from nitric acid production.',
    emissions:'Scope 1: combustion + N₂O from HNO₃ · Natural gas –98% · Major Scope 3 exposure via imported ammonia',
    employees:'501–1,000', turnover:'EUR 380 million',
    crf: '1.A.2.c (energy) + 2.B.2 (nitric acid N₂O)',
    initiatives:[
      '€250M investment programme — new nitric acid plant (1.5 Mt/yr capacity, Devnya, 2029) with negligible N₂O emissions',
      'New calcium nitrate installation (50,000 t/yr, 2027) operating on blue ammonia and renewable energy — 50 new jobs',
      'Third large ammonia storage tank (12,500 t → total 36,500 t) + 100 specialized transport trucks for blue/green ammonia logistics',
      'Integration of blue ammonia (2026) and green ammonia (2030) — >50% Scope 3 carbon footprint reduction targeted',
      'First low-carbon ammonia delivery expected to save 5,450 tonnes CO₂'
    ],
    pathways:['N₂O abatement (new plant)','Blue ammonia (2026)','Green ammonia (2030)','Biomass + waste heat'],
    ets:'Full ETS coverage. Fertilizer sector has direct CBAM exposure — significant for export competitiveness. Shift to imported ammonia transfers burden to Scope 3.',
    tags:['ETS-covered','CBAM-exposed','1.A.2.c','2.B.2','€250M programme'],
    netZeroLab:'Active Net-Zero Lab participant. Decarbonization survey completed.',
    challenge:'CBAM exposes imported ammonia to carbon border costs. Dependent on global low-carbon ammonia supply chains and infrastructure development timelines.'
  },
  {
    id:'solvaysodi', name:'Solvay Sodi Bulgaria AD', location:'Devnya (Varna region)',
    sector:'Soda ash (synthetic) & sodium bicarbonate', maturity:'advanced',
    color:'var(--info)', colorBg:'var(--info-light)', initials:'SS',
    description:'Largest soda ash and sodium bicarbonate producer in Europe. Located in Devnya industrial cluster. Total direct emissions approximately 2 million tonnes CO₂/year. Currently scaling biomass co-firing from 30% to 50% in CFB steam generators. Testing revolutionary e.Solvay electrochemical process that cuts CO₂ by 50%.',
    emissions:'~2 Mt CO₂/yr total direct (Scope 1) · Official process 2.B.7: 460 Kt CO₂eq · Biomass co-firing already at 30%',
    employees:'1,000+', turnover:'EUR 260 million (2024)',
    crf: '1.A.2.c (energy) + 2.B.7 (soda ash process)',
    initiatives:[
      'Biomass scale-up from 30% to 50% in CFB steam generators No. 7 and No. 8 (delayed 5 months due to administrative procedure)',
      'Electrification of lime kilns — transition from anthracite/metallurgical coke to electric heating → 500,000–600,000 t CO₂/yr saved',
      'e.Solvay electrochemical process: revolutionary technology reducing carbon emissions by 50% and saving water, salt, and limestone',
      'Bio-coke testing — partial replacement of metallurgical coke with bio-coke (wood charcoal) in lime kilns',
      'Bottom ash valorization — ~50% currently to cement industry; fly ash alternatives being explored',
      'Target: 30% Scope 1+2 reduction by 2030 vs. 2021 baseline'
    ],
    pathways:['Biomass co-firing (30%→50%)','Lime kiln electrification','e.Solvay electrochemical','Bio-coke substitution','CCUS (Devnya cluster)'],
    ets:'Full ETS coverage. Benefits from proximity to ANRAV CO₂ pipeline (Heidelberg Materials). Total direct emissions ~2 Mt CO₂/yr.',
    tags:['ETS-covered','Solvay Group','1.A.2.c','2.B.7','Lime kilns','e.Solvay'],
    netZeroLab:'Survey completed. Active Net-Zero Lab participant.',
    challenge:'Lime kiln electrification requires large capital and grid upgrades. e.Solvay process still in testing phase. Administrative delays affecting biomass scale-up.'
  },
  {
    id:'lukoil', name:'LUKOIL Neftohim Burgas', location:'Burgas',
    sector:'Petroleum refining & petrochemicals', maturity:'progressing',
    color:'var(--danger)', colorBg:'var(--danger-light)', initials:'LN',
    description:'Largest integrated petrochemical complex in the Balkans. Refining capacity 9.5 million tonnes crude oil/year. Covers over 50% of Bulgaria\u2019s domestic fuel consumption. Investment decisions for 2026–2031 still pending. Group target: 20% reduction in controlled Scope 1+2 emissions by 2030 vs. 2017.',
    emissions:'955.79 Kt CO₂eq official (1.A.1.b) · ~9.5 Mt/yr crude processing · Covers >50% of Bulgaria domestic fuel needs',
    employees:'3,500+', turnover:'EUR 4.7B (2024)',
    crf: '1.A.1.b — Petroleum Refining',
    initiatives:[
      'LIVE WATEROIL — ORC (Organic Rankine Cycle) turbines generating electricity from low-potential waste heat',
      'Continuous equipment modernization: power plant and distillation units with digital energy management systems',
      'Green/low-carbon hydrogen production for hydrotreating (highest-emission processes) — investment decision 2026–2031',
      'Own PV and wind capacity construction to minimize Scope 2 — investment decision 2026–2031',
      'Group target: 20% Scope 1+2 reduction by 2030 vs. 2017 baseline; national strategy still under development'
    ],
    pathways:['Waste heat recovery (ORC)','Low-carbon H₂ (HTU)','Own RES (PV/wind)','Equipment modernization','CCUS (post-2035)'],
    ets:'Full ETS coverage. Largest single ETS installation in Bulgaria. Free allocation decreasing. Key investment decisions for 2026–2031 still pending.',
    tags:['ETS-covered','1.A.1.b','Refining','Hard-to-abate','Decisions pending'],
    netZeroLab:'Survey completed. Engaged in Net-Zero Lab research programme.',
    challenge:'Investment decisions for the 2026–2031 period not yet finalized. Business model tied to fossil fuel processing. Governance complexity (Russian ownership).'
  },
  {
    id:'heidelberg', name:'Heidelberg Materials Bulgaria', location:'Devnya (Devnya Cement) + Zlatna Panega (Vulkan Cement)',
    sector:'Cement & cementitious materials', maturity:'advanced',
    color:'var(--primary)', colorBg:'var(--primary-light)', initials:'HM',
    description:'Operates two cement plants: Devnya Cement (site of ANRAV CCUS project) and Vulkan Cement. Specific net emissions 2024: 527 kg CO₂/t cementitious material. Target: 400 kg CO₂/t by 2030 (24% reduction vs. 2020). ANRAV is the first full CCUS chain in Eastern Europe.',
    emissions:'Specific: 527 kg CO₂/t (2024) → target 400 kg CO₂/t (2030) · ANRAV: 800,000 t CO₂/yr captured from 2028',
    employees:'500–800', turnover:'Not explicitly detailed in available 2024 annual reports',
    crf: '2.A.1 (clinker) + 1.A.2.f (non-metallic minerals combustion)',
    initiatives:[
      'ANRAV — assumed €600M CCUS CAPEX split into €190M EU Innovation Fund support (incl. €38M for storage) and €410M remaining project financing: full CCUS chain at Devnya; 800,000 t CO₂/yr captured; operational 2028; first in Eastern Europe',
      'ANRAV.beta — pilot installation validating hybrid OxyCal + post-combustion technology before full-scale deployment',
      'Kiln Line No. 7 modernization: new shredder 480 t/24h for direct RDF and tire feeding to main burner; RDF acceptance capacity increase',
      'Green initiatives and RES studies at Vulkan Cement (solar/wind park feasibility)',
      'Target: 10 million tonnes cumulative CO₂ captured via CCUS; >50% revenues from low-carbon products by 2030'
    ],
    pathways:['CCUS (ANRAV, EU-funded)','Alternative fuels (RDF/tyres)','Own RES at Vulkan Cement','Clinker ratio reduction'],
    ets:'Full ETS coverage. ANRAV project will dramatically reduce verified emissions from 2028.',
    tags:['ETS-covered','2.A.1','CCUS-ANRAV','CCUS CAPEX €600M','EU grant €190M','Cement'],
    netZeroLab:'Key stakeholder in Devnya industrial cluster decarbonization.',
    challenge:'CCUS technology risk and commissioning timeline. CO₂ transport and storage infrastructure needed. Administrative permitting for geological storage.'
  },
  {
    id:'holcim', name:'Holcim Bulgaria AD', location:'Beli Izvor (Vratsa region)',
    sector:'Cement', maturity:'advanced',
    color:'#a0608f', colorBg:'rgba(160, 96, 143, 0.13)', initials:'HC',
    description:'Beli Izvor cement plant, capacity 1.1 million tonnes/year. Net specific emissions 2023: 443 kg CO₂/t cement — lowest in the entire global Holcim Group. Close to 90% fossil fuel substitution with alternative fuels in clinker burning. Target: below 420 kg CO₂/t by 2030.',
    emissions:'443 kg CO₂/t cement (2023) — lowest in global Holcim Group · ~90% alternative fuel substitution achieved',
    employees:'300–500', turnover:'EUR 102.8 million (2024)',
    crf: '2.A.1 (clinker) + 1.A.2.f (combustion)',
    initiatives:[
      'Beli Net Zero — full CCUS chain project (assumed €600M CAPEX; EU STEP Seal certified) — long-term project',
      'Eastern Lights — CO₂ storage research in onshore saline aquifers in NW Bulgaria (€24.2M+ research investment)',
      'WHR (Waste Heat Recovery) system up to 4 MWh → saves 9,600 t CO₂/year',
      'Own photovoltaic plant 3–9 MWp for own consumption',
      'Post-privatization modernization: ~€147M total; kiln reconstruction in 2006 (€26.5M) enabling dry production method'
    ],
    pathways:['Alternative fuels (90% subst.)','Waste heat recovery','Own PV','CCUS (Beli Net Zero)','CO₂ storage research'],
    ets:'Full ETS coverage. Already at best-in-class specific emissions globally within Holcim Group.',
    tags:['ETS-covered','2.A.1','Best-in-class','~90% alt fuels','CCUS research'],
    netZeroLab:'Engaged in Bulgarian industrial decarbonization context.',
    challenge:'Already near technical optimum for alternative fuels. Next step (CCUS) is capital-intensive. CO₂ geological storage in Bulgaria needs further research.'
  },
  {
    id:'svilosa', name:'Sviloza AD', location:'Svishtov (Central Bulgaria)',
    sector:'Bleached sulphate cellulose (pulp)', maturity:'advanced',
    color:'var(--teal)', colorBg:'var(--teal-light)', initials:'SV',
    description:'Only producer of bleached sulfate cellulose in Bulgaria. Decarbonization integrated as a core strategy pillar for over two decades. Pioneer: Sviloza Biomass project registered under Kyoto Protocol (Gold Standard GS3379). Target: 62% reduction in EU ETS sectors by 2030 vs. 2005.',
    emissions:'64.53 Kt CO₂eq · 2023 · Official (1.A.2.d)',
    employees:'800+', turnover:'EUR 66.0 million (2024)',
    crf: '1.A.2.d — Pulp, Paper & Print',
    initiatives:[
      'MCC Production Installation (microcrystalline cellulose): >€13.1M by 2030 — high-value product from biomass; reduces specific emissions',
      'PV park on existing infrastructure: 850 polycrystalline panels — reduces Scope 2 emissions',
      'HERB (High-Efficiency Recovery Boilers): future investment — black liquor combustion modernization for potential BECCS',
      'Pioneer Kyoto Protocol Gold Standard project (GS3379) — Sviloza Biomass since 2002'
    ],
    pathways:['MCC high-value production','PV on-site','HERB boiler modernization','Biomass circular economy'],
    ets:'ETS-covered. Low-emission profile. Biomass fraction excluded from CO₂ accounting per IPCC.',
    tags:['ETS-covered','1.A.2.d','MCC production','Kyoto Protocol Gold Standard'],
    netZeroLab:'Engaged in Net-Zero Lab research programme.',
    challenge:'Limited scope for further emissions reduction given already efficient biomass-based process. HERB represents significant capex. PV limited by roof area.'
  },
  {
    id:'biovet', name:'Biovet AD (Huvepharma)', location:'Peshtera, Razgrad, Botevgrad',
    sector:'Veterinary pharmaceuticals & active ingredients', maturity:'advanced',
    color:'#52a582', colorBg:'rgba(82, 165, 130, 0.13)', initials:'BV',
    description:'Part of Huvepharma group. Plants in Peshtera, Razgrad, and Botevgrad. Achieved 30% absolute carbon emissions reduction and 44% carbon intensity reduction in 2020–2023. Largest private BESS installation in the EU (13.416 MW / 26.832 MWh) at Razgrad. Total ~€300M decarbonization programme by 2030. Target: full carbon neutrality (Scope 1+2) by 2030.',
    emissions:'30% absolute CO₂ reduction achieved 2020–2023 · Target: carbon neutral Scope 1+2 by 2030',
    employees:'2,000+', turnover:'~€394 million',
    crf: '1.A.2.c (energy combustion)',
    initiatives:[
      '~300 MW photovoltaic capacity by 2030 (multi-site: Peshtera, Razgrad, Botevgrad) — ~100 MW already operational end-2024',
      'BESS — largest private battery storage in EU: 13.416 MW / 26.832 MWh at Razgrad (partially EU Recovery & Resilience funded)',
      'Greenburn® biomass thermal treatment installations (Peshtera + Razgrad) — carbon-neutral steam from residual mycelium biomass',
      'Biogas from wastewater: anaerobic treatment of fermentation waters for cogeneration fuel',
      'Total decarbonization programme: ~€300M by 2030 for full carbon neutrality in direct operations'
    ],
    pathways:['Large-scale PV (300 MW)','BESS EU-largest private','Greenburn® biomass','Biogas from fermentation waste','Energy autonomy'],
    ets:'Pharmaceutical sector. ETS-covered for direct combustion emissions.',
    tags:['1.A.2.c','~€300M programme','BESS EU-largest','300 MW PV','Carbon neutral 2030'],
    netZeroLab:'Invited to join Net-Zero Lab programme.',
    challenge:'Pharma supply chain Scope 3 complexity. Grid constraints for large PV + BESS integration. Permitting for multi-site RES installations.'
  },
  {
    id:'neochim', name:'Neochim AD', location:'Dimitrovgrad (South-Central Bulgaria)',
    sector:'Ammonia & nitric acid', maturity:'early',
    color:'var(--primary)', colorBg:'var(--primary-light)', initials:'NC',
    description:'Producer of ammonia, nitric acid, and nitrogen-based compounds at Dimitrovgrad. Faced significant economic stress during the 2022–2023 European gas price crisis with production halts.',
    emissions:'~150 Kt est. · 2.B.1+2.B.2 share from official sector totals',
    employees:'300–500', turnover:'EUR 137.4 million',
    crf: '1.A.2.c (energy) + 2.B.1 (ammonia) + 2.B.2 (nitric acid)',
    initiatives:[
      'N₂O catalytic abatement on HNO₃ units — immediate priority, highest-impact per euro spent',
      'Energy efficiency upgrades — heat recovery, steam turbine optimization',
      'Evaluating blue/green ammonia transition pathways — long-term'
    ],
    pathways:['N₂O abatement (immediate)','Energy efficiency','Blue ammonia (long-term)','Green ammonia (2030+)'],
    ets:'Full ETS coverage. High sensitivity to gas price and ETS cost interaction.',
    tags:['ETS-covered','1.A.2.c','2.B.1','2.B.2','Gas-dependent','Under stress'],
    netZeroLab:'Engaged in Net-Zero Lab research programme.',
    challenge:'Repeated production outages 2022–2024. Conventional ammonia business model under existential pressure without decarbonization investment.'
  },
  {
    id:'orgachim', name:'Orgachim AD', location:'Ruse (North Bulgaria)',
    sector:'Paints, varnishes, resins & specialty chemicals', maturity:'progressing',
    color:'var(--danger)', colorBg:'var(--danger-light)', initials:'OC',
    description:'Over 120 years of history. Part of Polycolor-Orgachim Group. Based in Ruse. Products: paints, varnishes, synthetic resins, phthalic and maleic anhydrides. Process temperatures up to 260°C (resins) and 380°C–400°C (anhydrides). New €7M factory in Bucharest (2019).',
    emissions:'Estimated <50 Kt · 1.A.2.c share · 2.D.3 (non-energy products)',
    employees:'300–500', turnover:'EUR 71 million',
    crf: '1.A.2.c (energy) + 2.D.3 (non-energy products)',
    initiatives:[
      'Heating decentralization: replaced steam network with local gas boilers (co-financed with Resalta) — eliminates thermal losses along pipelines',
      'Rooftop PV + BESS installation for energy independence (planned)',
      'Orgachim Resins reconstruction — Class A investment certificate 2024 for modern sustainable production facility',
      '€3M modern equipment investment by 2025 (automated tinting lines, robotic palletizing)',
      'Sustainable low-VOC paints product development; sunflower oil resin bio-based products'
    ],
    pathways:['Heating decentralization','Rooftop PV + BESS','Bio-based products (low-VOC)','Process modernization'],
    ets:'ETS-covered for combustion. Some non-energy product use (2.D.3).',
    tags:['1.A.2.c','2.D.3','Low-VOC products','Heating decentralized','Class A investment'],
    netZeroLab:'Engaged in Net-Zero Lab research programme.',
    challenge:'High-temperature processes (up to 400°C for anhydrides) difficult to electrify. VOC management and Scope 3 supply chain are key issues.'
  },
  {
    id:'agria', name:'Agria AD', location:'Plovdiv (Central Bulgaria)',
    sector:'Plant protection products & agrochemicals', maturity:'early',
    color:'var(--success)', colorBg:'var(--success-light)', initials:'AG',
    description:'Only Bulgarian producer of plant protection products (herbicides, fungicides, biocides). Located in Plovdiv. Member of Responsible Care global initiative. Targeting EU Fit for 55 compliance.',
    emissions:'Not separately disclosed · 1.A.2.c share',
    employees:'100–300', turnover:'€334.4 million',
    crf: '1.A.2.c — Chemical Industry (energy)',
    initiatives:[
      'Photovoltaic plant (announced September 2024) for own energy consumption — decarbonizes Scope 2 emissions',
      'New settling basin for dithiocarbamate synthesis (2025) — improved environmental performance',
      'Extension of suspension concentrate workshop (2025) — optimized production zones for lower energy losses',
      'Target: full EU Fit for 55 compliance (net emissions –55% vs. 1990 by 2030)'
    ],
    pathways:['On-site PV','Process efficiency','Sustainable formulations'],
    ets:'May be outside ETS scope depending on installation size.',
    tags:['1.A.2.c','Agrochemicals','Responsible Care','Fit for 55'],
    netZeroLab:'Official invitation sent for Net-Zero Lab participation (March 2026).',
    challenge:'Small scale limits investment capacity. Pesticide chemistry has inherent VOC and hazardous material challenges.'
  }
];


function filterCompanies(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCompanyGrid(filter);
}

function renderCompanyGrid(filter = 'all') {
  const grid = document.getElementById('companyGrid');
  if (!grid) return;
  const filtered = filter === 'all' ? companies : companies.filter(c => c.maturity === filter);
  grid.innerHTML = filtered.map(co => `
    <div class="company-card" onclick="openCompanyModal('${co.id}')">
      <div class="co-header">
        <div class="co-logo" style="background:${co.colorBg};color:${co.color}">${co.initials}</div>
        <div class="co-maturity mat-${co.maturity}">${
          co.maturity === 'advanced' ? 'Advanced' :
          co.maturity === 'progressing' ? 'Progressing' : 'Early Stage'
        }</div>
      </div>
      <div class="co-name">${co.name}</div>
      <div class="co-location">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${co.location}
      </div>
      <div class="co-sector">${co.sector}</div>
      <div class="co-tags">${co.tags.slice(0,3).map(t=>`<span class="co-tag">${t}</span>`).join('')}</div>
      <div class="co-emissions">
        <div class="co-ems-label">Annual CO₂ emissions</div>
        <div class="co-ems-val">${co.emissions}</div>
      </div>
    </div>
  `).join('');
}

function openCompanyModal(id) {
  const co = companies.find(c => c.id === id);
  if (!co) return;
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div class="modal-co-header">
      <div class="modal-co-logo" style="background:${co.colorBg};color:${co.color}">${co.initials}</div>
      <div class="modal-co-main">
        <div class="modal-co-name">${co.name}</div>
        <div class="modal-co-meta">${co.location} · ${co.sector}</div>
      </div>
      <div class="modal-employee-pill"><span>Employees</span><strong>${co.employees}</strong></div>
    </div>
    <div class="modal-section"><div class="modal-section-title">Overview</div><p class="modal-text">${co.description}</p></div>
    <div class="modal-kpi-row">
      <div class="modal-kpi modal-kpi-wide"><div class="modal-kpi-val">${co.emissions}</div><div class="modal-kpi-label">Annual CO₂ emissions</div></div>
      <div class="modal-kpi"><div class="modal-kpi-val">${co.turnover}</div><div class="modal-kpi-label">Turnover</div></div>
      <div class="modal-kpi"><div class="modal-kpi-val">${co.crf}</div><div class="modal-kpi-label">CRF Sector Code</div></div>
    </div>
    <div class="modal-section" style="margin-top:1rem"><div class="modal-section-title">Decarbonization Initiatives</div><ul class="modal-initiatives">${co.initiatives.map(i=>`<li>${i}</li>`).join('')}</ul></div>
    <div class="modal-section"><div class="modal-section-title">Key Pathways</div><div style="display:flex;gap:0.375rem;flex-wrap:wrap">${co.pathways.map(p=>`<span class="co-tag" style="background:var(--primary-light);color:var(--primary)">${p}</span>`).join('')}</div></div>
    <div class="modal-section"><div class="modal-section-title">EU ETS Status</div><p class="modal-text">${co.ets}</p></div>
    <div class="modal-section"><div class="modal-section-title">Net-Zero Lab</div><p class="modal-text">${co.netZeroLab}</p></div>
    <div class="modal-section"><div class="modal-section-title">Key Challenges</div><p class="modal-text">${co.challenge}</p></div>
  `;
  document.getElementById('companyModal').classList.add('open');
}

function closeCompanyModal(event) {
  if (!event || event.target === document.getElementById('companyModal')) {
    document.getElementById('companyModal').classList.remove('open');
  }
}

// ── PATHWAYS TAB ─────────────────────────────
function showPathway(id, btn) {
  document.querySelectorAll('.pw-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pw-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('pw-' + id)?.classList.add('active');
  btn.classList.add('active');
}

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
  { key: 'carbon_pressure', usage: ['B_eff', 'decarbonisation_depth'] },
  { key: 'power_access', usage: ['T_eff', 'decarbonisation_depth'] },
  { key: 'grid_readiness', usage: ['infra_push', 'T_eff', 'M_eff', 'bottleneck_infrastructure'] },
  { key: 'hydrogen', usage: ['infra_push', 'T_eff', 'M_eff', 'bottleneck_infrastructure'] },
  { key: 'co2_infra', usage: ['infra_push', 'T_eff', 'M_eff', 'bottleneck_infrastructure'] },
  { key: 'permitting', usage: ['T_eff', 'M_eff', 'bottleneck_permitting'] },
  { key: 'finance', usage: ['B_eff', 'T_eff', 'M_eff', 'competitiveness_retention', 'bottleneck_finance'] },
  { key: 'market_pull', usage: ['B_eff', 'competitiveness_retention', 'bottleneck_market'] },
  { key: 'stability', usage: ['B_eff', 'M_eff', 'competitiveness_retention'] },
  { key: 'infra_push', usage: ['T_eff', 'M_eff', 'bottleneck_infrastructure'] },
];

const CLUSTER_FUNCTION_BLOCKS = [
  {
    title: 'infra_push',
    summary: {
      en: 'Derived infrastructure readiness proxy',
      bg: 'Производен proxy за инфраструктурна готовност',
    },
    formula: '(grid_readiness + hydrogen + co2_infra) / 3',
    drivers: ['grid_readiness', 'hydrogen', 'co2_infra'],
    wide: true,
  },
  {
    title: 'B_eff',
    summary: {
      en: 'Business environment effect',
      bg: 'Ефект върху бизнес средата',
    },
    formula: 'clamp(B_i + 0.8·market_pull + 0.6·stability + 0.5·finance − 0.9·carbon_pressure·(carbon_sensitivity / 5))',
    drivers: ['market_pull', 'stability', 'finance', 'carbon_pressure'],
  },
  {
    title: 'T_eff',
    summary: {
      en: 'Technology readiness effect',
      bg: 'Ефект върху технологичната готовност',
    },
    formula: 'clamp(T_i + 0.8·power_access + 0.7·infra_push·(infra_dependency / 5) + 0.4·finance + 0.3·permitting)',
    drivers: ['power_access', 'infra_push', 'finance', 'permitting'],
  },
  {
    title: 'M_eff',
    summary: {
      en: 'Mobility / moveability effect',
      bg: 'Ефект върху мобилността / способността за преместване',
    },
    formula: 'clamp(M_i + 0.9·finance + 0.9·permitting + 0.7·infra_push + 0.5·stability − 0.4·(1 − stability))',
    drivers: ['finance', 'permitting', 'infra_push', 'stability'],
  },
  {
    title: 'decarbonisation_depth',
    summary: {
      en: 'Average decarbonisation depth',
      bg: 'Средна дълбочина на декарбонизация',
    },
    formula: 'clamp(0.35·T_eff + 0.35·M_eff + 0.25·carbon_pressure + 0.05·power_access)',
    drivers: ['T_eff', 'M_eff', 'carbon_pressure', 'power_access'],
  },
  {
    title: 'competitiveness_retention',
    summary: {
      en: 'Competitiveness retention',
      bg: 'Запазване на конкурентоспособността',
    },
    formula: 'clamp(0.45·B_eff + 0.20·market_pull + 0.20·stability + 0.15·finance)',
    drivers: ['B_eff', 'market_pull', 'stability', 'finance'],
  },
];

const CLUSTER_COPY = {
  en: {
    sourceKicker: 'Scenario overview',
    sourceTitle: 'Scenario inputs',
    sourceText: 'The matrix below shows how each Scenario field changes across the policy scenarios.',
    sourceNote: 'Derived helper inside the function: infra_push = (grid_readiness + hydrogen + co2_infra) / 3. Values stay on the original 0-1 scale.',
    functionTitle: 'How apply_scenario() uses the inputs',
    functionDesc: 'Each block shows the output term and the parameter family behind it.',
    matrixTitle: 'Scenario profiles',
    matrixDesc: 'Five policy scenarios presented as compact profiles on a 0-1 scale.',
    matrixNote: 'Higher values mean stronger enabling conditions. Carbon pressure indicates the intensity of cost pressure.',
    scenarioMeta: 'policy scenario',
    supportLabel: 'Enablement score',
    scaleLabel: '0-1 scale',
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
    sourceKicker: 'Преглед на сценариите',
    sourceTitle: 'Сценарийни входове',
    sourceText: 'Матрицата по-долу показва как се променя всяко поле от Scenario между отделните политически сценарии.',
    sourceNote: 'Производен helper вътре във функцията: infra_push = (grid_readiness + hydrogen + co2_infra) / 3. Стойностите са запазени в оригиналната скала 0-1.',
    functionTitle: 'Как apply_scenario() използва входовете',
    functionDesc: 'Всеки блок показва изходния термин и семейството параметри зад него.',
    matrixTitle: 'Профили на сценариите',
    matrixDesc: 'Пет политически сценария, подредени като компактни профили в скала от 0 до 1.',
    matrixNote: 'По-високите стойности означават по-силни улесняващи условия. Въглеродният натиск показва силата на ценовия натиск.',
    scenarioMeta: 'политически сценарий',
    supportLabel: 'Индекс на подкрепата',
    scaleLabel: 'Скала 0-1',
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

function getClusterCopy() {
  return CLUSTER_COPY[getLanguage()] || CLUSTER_COPY.en;
}

function getClusterScenarioValue(scenario, key) {
  if (key === 'infra_push') {
    return (scenario.grid_readiness + scenario.hydrogen + scenario.co2_infra) / 3;
  }
  return scenario[key];
}

function getClusterScoreTone(value) {
  if (value >= 0.75) return 'cluster-score-high';
  if (value >= 0.55) return 'cluster-score-mid';
  if (value >= 0.35) return 'cluster-score-low';
  return 'cluster-score-weak';
}

function getClusterScenarioAverage(scenario) {
  const keys = ['power_access', 'grid_readiness', 'hydrogen', 'co2_infra', 'permitting', 'finance', 'market_pull', 'stability'];
  const total = keys.reduce((sum, key) => sum + scenario[key], 0);
  return total / keys.length;
}

function getClusterScenarioName(scenario) {
  const lang = getLanguage();
  if (scenario.name && typeof scenario.name === 'object') {
    return scenario.name[lang] || scenario.name.en || '';
  }
  return scenario.name || '';
}

function renderClusterAnalysis() {
  const scenarioGrid = document.getElementById('clusterScenarioGrid');
  if (!scenarioGrid) return;

  const copy = getClusterCopy();
  const matrixTitle = document.getElementById('clusterMatrixTitle');
  const matrixDesc = document.getElementById('clusterMatrixDesc');
  const matrixNote = document.getElementById('clusterScenarioNote');
  if (matrixTitle) matrixTitle.textContent = copy.matrixTitle;
  if (matrixDesc) matrixDesc.textContent = copy.matrixDesc;
  if (matrixNote) matrixNote.textContent = copy.matrixNote;

  scenarioGrid.innerHTML = CLUSTER_SCENARIOS.map(scenario => {
    const supportScore = getClusterScenarioAverage(scenario);
    return `
      <article class="cluster-scenario-card theme-${escapeHtml(scenario.theme || 'cluster')}">
        <div class="cluster-scenario-card-head">
          <div>
            <div class="cluster-scenario-meta">${escapeHtml(copy.scenarioMeta)}</div>
            <h3>${escapeHtml(getClusterScenarioName(scenario))}</h3>
          </div>
          <div class="cluster-scenario-score">
            <span>${escapeHtml(copy.supportLabel)}</span>
            <strong>${supportScore.toFixed(2)}</strong>
          </div>
        </div>
        <div class="cluster-scenario-metrics">
          ${CLUSTER_SCENARIO_FOCUS_KEYS.map(key => {
            const value = getClusterScenarioValue(scenario, key);
            const width = Math.max(10, Math.round(value * 100));
            const tone = getClusterScoreTone(value);
            return `
              <div class="cluster-scenario-metric">
                <div class="cluster-scenario-metric-top">
                  <span>${escapeHtml(copy.labels[key] || key)}</span>
                  <strong>${value.toFixed(2)}</strong>
                </div>
                <div class="cluster-score-track ${tone}">
                  <div class="cluster-score-fill" style="width:${width}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="cluster-scenario-scale">${escapeHtml(copy.scaleLabel)}</div>
      </article>
    `;
  }).join('');
}

// ── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanguageControl();
  initFontSizeControl();
  renderCompanyGrid();
  renderDatasetTables();
  animateKPIs();
  setTimeout(buildCharts, 100);
  setTimeout(updateDashboardWithDbData, 250);
});

/* ═══════════════════════════════════════════════
   CBAM CALCULATOR LOGIC
═══════════════════════════════════════════════ */

// ── CBAM DATA ─────────────────────────────────

const YEARS = [2026,2027,2028,2029,2030,2031,2032,2033,2034];

// Official EU CBAM phase-in factors (% of emissions requiring CBAM certificates)
// Source: EC Regulation, climat.be
const CBAM_FACTORS = [0.025, 0.05, 0.10, 0.225, 0.485, 0.61, 0.735, 0.86, 1.00];

// ETS-only free allocation phaseout schedule (non-CBAM sectors: refining, chemicals, pulp)
// Approximate — carbon-leakage sectors still get ~80% in 2026, declining to 0 by 2034
const ETS_FA_PHASEOUT = [0.025, 0.05, 0.10, 0.225, 0.45, 0.57, 0.68, 0.84, 1.00];

// Carbon price scenarios (€/tCO₂) — 2026 to 2034
// Source: Reuters analyst consensus Jan 2026, GMK Centre, Enerdata
const ETS_PRICES = {
  low:  [60, 65, 70, 78, 85, 90, 93, 96, 98],
  base: [85, 95, 105, 115, 126, 130, 135, 140, 145],
  high: [105, 120, 135, 150, 165, 175, 182, 188, 195]
};

// Products: { id, emFactor (tCO₂/t), cbamCovered, volId }
const PRODUCTS = [
  // Agropolychim
  { co:'agropolychim', name:'AN/CAN', ef:1.18, cbam:true,  volId:'vol-agropolychim-an'   },
  { co:'agropolychim', name:'UAN',    ef:0.85, cbam:true,  volId:'vol-agropolychim-uan'  },
  { co:'agropolychim', name:'HNO₃',  ef:0.23, cbam:true,  volId:'vol-agropolychim-hno3' },
  // Neochim
  { co:'neochim',      name:'NH₃',   ef:1.57, cbam:true,  volId:'vol-neochim-nh3'   },
  { co:'neochim',      name:'HNO₃',  ef:0.23, cbam:true,  volId:'vol-neochim-hno3'  },
  // Solvay Sodi
  { co:'solvay',       name:'Soda',  ef:0.90, cbam:false, volId:'vol-solvay-soda'   },
  // LUKOIL Neftohim Burgas
  { co:'lukoil',       name:'Petro', ef:0.42, cbam:false, volId:'vol-lukoil-petro'  },
  // Svilosa
  { co:'svilosa',      name:'Pulp',  ef:0.22, cbam:false, volId:'vol-svilosa-pulp'  },
  // Heidelberg Materials
  { co:'heidelberg',   name:'Cement clinker', ef:0.72, cbam:true,  volId:'vol-heidelberg-clinker' },
  // Holcim
  { co:'holcim',       name:'Cement clinker', ef:0.62, cbam:true,  volId:'vol-holcim-clinker' },
  // Biovet / Huvepharma
  { co:'biovet',       name:'Pharmaceutical products', ef:0.18, cbam:false, volId:'vol-biovet-pharma' },
  // Orgachim
  { co:'orgachim',     name:'Paints & resins', ef:0.35, cbam:false, volId:'vol-orgachim-resins' },
];

// CBAM calculator company keys (9-company model)
const CO_KEYS = ['agropolychim','neochim','solvay','lukoil','svilosa','heidelberg','holcim','biovet','orgachim'];
const CBAM_CO_LABELS = ['Agropolychim','Neochim','Solvay Sodi','LUKOIL Neftohim Burgas','Svilosa','Heidelberg','Holcim','Biovet','Orgachim'];

let currentScenario = 'base';
let cbamChartInstance = null;
let lastCalcResult = null; // for CSV export

// ── SCENARIO SWITCHER ─────────────────────────
function setScenario(scenario, btn) {
  currentScenario = scenario;
  document.querySelectorAll('.sc-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderPriceChips();
  calcCBAM();
  const sub = document.getElementById('chartSubtitle');
  const labels = {low:'Low carbon price scenario',base:'Base scenario (Reuters consensus)',high:'High carbon price scenario'};
  if (sub) sub.textContent = `CBAM-linked and EU ETS cost exposure · ${labels[scenario]}`;
}

function renderPriceChips() {
  const row = document.getElementById('pricePreviewRow');
  if (!row) return;
  const prices = ETS_PRICES[currentScenario];
  row.innerHTML = YEARS.map((y,i) => {
    const highlight = y === 2026 || y === 2030 || y === 2034;
    return `<div class="pp-chip${highlight?' pp-highlight':''}">${y}: €${prices[i]}</div>`;
  }).join('');
}

// ── TOGGLE COMPANY CARDS ──────────────────────
function toggleCoCard(coId) {
  const prods = document.getElementById('prods-' + coId);
  const toggle = document.getElementById('toggle-' + coId);
  const btn = toggle?.closest('.cic-toggle');
  if (!prods) return;
  const isCollapsed = prods.classList.contains('collapsed');
  if (isCollapsed) {
    prods.classList.remove('collapsed');
    btn?.classList.remove('open');
  } else {
    prods.classList.add('collapsed');
    btn?.classList.add('open');
  }
}

// ── MAIN CALCULATION ──────────────────────────
function calcCBAM() {
  const prices = ETS_PRICES[currentScenario];

  // Per company, per year costs in M€
  const results = {};
  CO_KEYS.forEach(co => { results[co] = new Array(9).fill(0); });

  PRODUCTS.forEach(p => {
    const input = document.getElementById(p.volId);
    if (!input) return;
    const volKt = parseFloat(input.value) || 0;
    const volT = volKt * 1000;
    const phaseout = p.cbam ? CBAM_FACTORS : ETS_FA_PHASEOUT;

    YEARS.forEach((_, i) => {
      const cost = volT * p.ef * phaseout[i] * prices[i]; // €
      results[p.co][i] += cost / 1e6; // M€
    });
  });

  lastCalcResult = results;

  // KPIs
  const totals = YEARS.map((_, i) => CO_KEYS.reduce((s, co) => s + results[co][i], 0));
  const tot2026 = totals[0];
  const tot2030 = totals[4];
  const cumul   = totals.reduce((a, b) => a + b, 0);

  const fmtM = v => v >= 1 ? `€${v.toFixed(1)}M` : `€${(v*1000).toFixed(0)}k`;
  const fmtB = v => v >= 1000 ? `€${(v/1000).toFixed(2)}B` : `€${v.toFixed(0)}M`;

  document.getElementById('ck-2026').textContent = fmtM(tot2026);
  document.getElementById('ck-2026-sub').textContent = `CBAM factor 2.5% · €${prices[0]}/t CO₂`;
  document.getElementById('ck-2030').textContent = fmtM(tot2030);
  document.getElementById('ck-2030-sub').textContent = `CBAM factor 48.5% · €${prices[4]}/t CO₂`;
  document.getElementById('ck-cumul').textContent = fmtB(cumul);

  // Update chart
  updateCbamChart(results, totals);

  // Update table
  updateCbamTable(results, totals);
}

function updateCbamChart(results, totals) {
  const c = getChartColors();
  const colors = getCompanyChartColors(CO_KEYS);

  const datasets = CO_KEYS.map((co, i) => ({
    label: CBAM_CO_LABELS[i],
    data: results[co],
    backgroundColor: withChartAlpha(colors[i], 'cc'),
    borderColor: colors[i],
    borderWidth: 1,
    borderRadius: 3,
    stack: 'a',
  }));

  const ctx = document.getElementById('cbamChart');
  if (!ctx) return;

  if (cbamChartInstance) {
    cbamChartInstance.data.datasets = datasets;
    cbamChartInstance.options.plugins.tooltip.backgroundColor = getChartColors().surface;
    cbamChartInstance.update();
  } else {
    cbamChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels: YEARS, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...chartDefaults().plugins,
          legend: {
            ...chartDefaults().plugins.legend,
            position: 'bottom',
          },
          tooltip: {
            ...chartDefaults().plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: €${ctx.parsed.y.toFixed(2)}M`,
              footer: items => {
                const total = items.reduce((s, i) => s + i.parsed.y, 0);
                return `Total: €${total.toFixed(2)}M`;
              }
            }
          }
        },
        scales: {
          ...chartDefaults().scales,
          x: {
            ...chartDefaults().scales.x,
            stacked: true,
          },
          y: {
            ...chartDefaults().scales.y,
            stacked: true,
            title: { display: true, text: 'M€', color: c.textMuted, font: { size: 11, family: 'DM Sans' } }
          }
        }
      }
    });
  }
}

function updateCbamTable(results, totals) {
  const tbody = document.getElementById('cbamTableBody');
  const tfoot = document.getElementById('cbamTableFoot');
  const prices = ETS_PRICES[currentScenario];
  if (!tbody) return;

  const fmt = v => v >= 0.01 ? v.toFixed(2) : '—';

  tbody.innerHTML = YEARS.map((yr, i) => {
    const rowTotal = totals[i];
    const intensity = Math.min(rowTotal / (totals[totals.length-1] || 1), 1);
    const alpha = Math.round(intensity * 40).toString(16).padStart(2,'0');
    return `<tr>
      <td><strong>${yr}</strong></td>
      <td>${(CBAM_FACTORS[i]*100).toFixed(1)}%</td>
      <td>€${prices[i]}/t</td>
      ${CO_KEYS.map(co => `<td>${fmt(results[co][i])}</td>`).join('')}
      <td class="col-total" style="font-weight:700">${fmt(rowTotal)}</td>
    </tr>`;
  }).join('');

  const cumCo = CO_KEYS.map(co => results[co].reduce((a,b)=>a+b,0));
  const grandTotal = cumCo.reduce((a,b)=>a+b,0);
  tfoot.innerHTML = `<tr>
    <td colspan="3"><strong>TOTAL 2026–2034</strong></td>
    ${cumCo.map(v => `<td>${v.toFixed(1)}</td>`).join('')}
    <td class="col-total">${grandTotal.toFixed(1)}</td>
  </tr>`;
}

// ── CSV EXPORT ─────────────────────────────────
function exportCSV() {
  if (!lastCalcResult) return;
  const prices = ETS_PRICES[currentScenario];
  const header = ['Year','CBAM_factor_%','ETS_price_EUR_t',...CBAM_CO_LABELS.map(label => `${label.replace(/\s+/g,'')}_ME`),'Total_ME'];
  const rows = YEARS.map((yr, i) => {
    const total = CO_KEYS.reduce((s, co) => s + lastCalcResult[co][i], 0);
    return [
      yr,
      (CBAM_FACTORS[i]*100).toFixed(1),
      prices[i],
      ...CO_KEYS.map(co => lastCalcResult[co][i].toFixed(3)),
      total.toFixed(3)
    ].join(',');
  });
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `CBAM_ETS_cost_BG_chemicals_${currentScenario}_scenario.csv`;
  a.click();
}

// ── INIT CBAM SECTION ─────────────────────────
function initCBAM() {
  renderPriceChips();
  calcCBAM();
}





// initCBAM called from showSection('cbam')

/* ═══════════════════════════════════════════════
   INVESTMENT RANGE CHART & VIEW TOGGLE
═══════════════════════════════════════════════ */

let invRangeChartInstance = null;

function buildInvRangeChart() {
  const ctx = document.getElementById('invRangeChart');
  if (!ctx || invRangeChartInstance) return;
  const c = getChartColors();

  // Low and high CAPEX estimates per company (M€)
  const companies = ['Agropolychim','Biovet','Solvay Sodi','LUKOIL Neftohim Burgas','Heidelberg Mat.','Holcim BG','Svilosa','Neochim','Orgachim'];
  const low  = [250, 257, 365, 1000, 600, 15,  39,  4,  3];
  const high = [300, 300, 865, 2130, 625, 615, 79, 165, 11];
  const colors = getCompanyChartColors(ROI_CO_KEYS);

  invRangeChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: companies,
      datasets: [
        {
          label: 'Low estimate (M€)',
          data: low,
          backgroundColor: colors.map(color => withChartAlpha(color, '99')),
          borderColor: colors,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
          stack: 'a',
        },
        {
          label: 'Additional (to high estimate)',
          data: high.map((h, i) => h - low[i]),
          backgroundColor: colors.map(color => withChartAlpha(color, '33')),
          borderColor: colors.map(color => withChartAlpha(color, '66')),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
          stack: 'a',
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartDefaults().plugins,
        legend: {
          ...chartDefaults().plugins.legend,
          labels: {
            ...chartDefaults().plugins.legend.labels,
            filter: (item) => item.datasetIndex === 0
          }
        },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 0) return ` Low: €${low[ctx.dataIndex]}M`;
              return ` High: €${high[ctx.dataIndex]}M`;
            },
            footer: (items) => {
              const i = items[0].dataIndex;
              return `Range: €${low[i]}M – €${high[i]}M`;
            }
          }
        }
      },
      scales: {
        x: {
          ...chartDefaults().scales.x,
          stacked: true,
          title: { display: true, text: 'CAPEX (M€)', color: c.textMuted, font: { size: 11, family: 'DM Sans' } },
          ticks: {
            ...chartDefaults().scales.x.ticks,
            callback: v => v >= 1000 ? `€${(v/1000).toFixed(1)}B` : `€${v}M`
          }
        },
        y: { ...chartDefaults().scales.y, stacked: true }
      }
    }
  });
}

function setInvView(view, btn) {
  document.querySelectorAll('.inv-view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('inv-company-view').style.display = view === 'company' ? 'block' : 'none';
  document.getElementById('inv-pathway-view').style.display = view === 'pathway' ? 'block' : 'none';
}





/* ═══════════════════════════════════════════════
   ROI ANALYSIS — CASHFLOW MODEL & CHARTS
   Updated with real data from company documents
═══════════════════════════════════════════════ */

const ROI_YEARS = [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036,2037,2038,2039,2040];

// ETS price scenarios extended to 2040 (€/tCO₂)
const ROI_ETS = {
  low:  [60,68,75,82,88,92,96,100,104,108,112,115,118,120,122],
  base: [85,95,105,115,126,130,135,140,145,150,155,160,165,170,175],
  high: [105,120,135,150,165,175,182,188,195,202,210,218,225,230,235]
};

const ROI_SCENARIO_SNAPSHOT = [
  { year: 2026, investment: -389, lowEts: -380, lowNet: 9.1, baseEts: -376, baseNet: 13, highEts: -373, highNet: 16 },
  { year: 2027, investment: -772, lowEts: -748, lowNet: 24, baseEts: -738, baseNet: 34, highEts: -729, highNet: 43 },
  { year: 2028, investment: -1200, lowEts: -1100, lowNet: 53, baseEts: -1100, baseNet: 74, highEts: -1100, highNet: 94 },
  { year: 2029, investment: -1500, lowEts: -1400, lowNet: 122, baseEts: -1300, baseNet: 172, highEts: -1300, highNet: 221 },
  { year: 2030, investment: -1900, lowEts: -1700, lowNet: 255, baseEts: -1600, baseNet: 362, highEts: -1500, highNet: 470 },
  { year: 2031, investment: -2400, lowEts: -1900, lowNet: 423, baseEts: -1800, baseNet: 598, highEts: -1600, highNet: 789 },
  { year: 2032, investment: -2700, lowEts: -2100, lowNet: 693, baseEts: -1800, baseNet: 978, highEts: -1400, highNet: 1300 },
  { year: 2033, investment: -2900, lowEts: -1900, lowNet: 1000, baseEts: -1500, baseNet: 1400, highEts: -1000, highNet: 1900 },
  { year: 2034, investment: -3100, lowEts: -1700, lowNet: 1400, baseEts: -1100, baseNet: 1900, highEts: -437, highNet: 2600 },
  { year: 2035, investment: -3200, lowEts: -1500, lowNet: 1800, baseEts: -743, baseNet: 2500, highEts: 104, highNet: 3300 },
  { year: 2036, investment: -3400, lowEts: -1100, lowNet: 2300, baseEts: -156, baseNet: 3300, highEts: 962, highNet: 4400 },
  { year: 2037, investment: -3600, lowEts: -644, lowNet: 2900, baseEts: 515, baseNet: 4100, highEts: 1900, highNet: 5500 },
  { year: 2038, investment: -3700, lowEts: -117, lowNet: 3600, baseEts: 1300, baseNet: 5000, highEts: 3000, highNet: 6700 },
  { year: 2039, investment: -3700, lowEts: 533, lowNet: 4300, baseEts: 2200, baseNet: 6000, highEts: 4300, highNet: 8100 },
  { year: 2040, investment: -3800, lowEts: 1300, lowNet: 5000, baseEts: 3300, baseNet: 7100, highEts: 5800, highNet: 9600 }
];

// ─────────────────────────────────────────────────────────────────
// ALL PATHWAYS — from company documents (real capex & CO₂ figures)
// capex_M: total CAPEX in M€
// co2_kt:  kt CO₂eq/yr saved once commissioned
// starts:  commissioning year (savings begin)
// capex_yr: fraction of capex deployed per year
// ─────────────────────────────────────────────────────────────────
const ROI_PATHWAYS = [

  // ── AGROPOLYCHIM (€250M programme from document) ──────────────
  { id:'ap-hno3', co:'Agropolychim', name:'New HNO₃ Plant + N₂O Abatement (€250M programme)',
    capex_M:250, co2_kt:295, starts:2027,
    capex_yr:{2024:0.1,2025:0.25,2026:0.30,2027:0.25,2028:0.10},
    note:'1.5 Mt/yr fertilizer capacity; negligible N₂O by design (document confirmed)'
  },
  { id:'ap-nh3', co:'Agropolychim', name:'Blue/Green Ammonia Supply Chain (Scope 3)',
    capex_M:50, co2_kt:0, starts:9999,
    capex_yr:{2024:0.3,2025:0.4,2026:0.3},
    note:'3rd ammonia tank (12,500 t) + 100 trucks; ETS benefit via Scope 3 CBAM only'
  },
  // ── NEOCHIM ───────────────────────────────────────────────────
  { id:'nc-n2o', co:'Neochim', name:'N₂O Catalytic Abatement (HNO₃)',
    capex_M:4.5, co2_kt:277, starts:2026,
    capex_yr:{2025:1.0},
    note:'Highest ROI in sector — immediate, lowest capex. SEI benchmark €0.1–4/tCO₂eq'
  },
  { id:'nc-eff', co:'Neochim', name:'Energy Efficiency Upgrades',
    capex_M:11.5, co2_kt:22.5, starts:2026,
    capex_yr:{2025:0.25,2026:0.25,2027:0.25,2028:0.25},
    note:'Heat recovery, steam turbine optimization'
  },
  { id:'nc-blue', co:'Neochim', name:'Blue Ammonia + CCS (medium-term)',
    capex_M:150, co2_kt:126, starts:2030,
    capex_yr:{2028:0.33,2029:0.34,2030:0.33},
    note:'SMR retrofit + CO₂ capture. Requires CO₂ pipeline to Black Sea'
  },

  // ── SOLVAY SODI (major update from document — ~2 Mt CO₂/yr) ──
  { id:'ss-bio50', co:'Solvay Sodi', name:'Biomass Scale-Up 30%→50% (CFB boilers)',
    capex_M:45, co2_kt:130, starts:2026,
    capex_yr:{2025:0.5,2026:0.5},
    note:'CFB SG No.7 & No.8. Delayed 5 months (admin. procedure). Confirmed investment.'
  },
  { id:'ss-kilns', co:'Solvay Sodi', name:'Lime Kilns Electrification (500–600 kt CO₂/yr)',
    capex_M:320, co2_kt:550, starts:2029,
    capex_yr:{2026:0.10,2027:0.20,2028:0.30,2029:0.25,2030:0.15},
    note:'Transition from anthracite/coke to electric heating. Largest single Solvay decarbonization investment.'
  },
  { id:'ss-esolvay', co:'Solvay Sodi', name:'e.Solvay Electrochemical Process (50% CO₂ reduction)',
    capex_M:500, co2_kt:1000, starts:2032,
    capex_yr:{2028:0.10,2029:0.15,2030:0.25,2031:0.30,2032:0.20},
    note:'Revolutionary electrochemical process tested by Solvay Group; reduces CO₂ by 50%, saves water/salt/limestone'
  },

  // ── LUKOIL (investment decisions 2026-2031 still pending) ─────
  { id:'lk-orc', co:'LUKOIL Neftohim Burgas', name:'ORC Turbines — LIVE WATEROIL Project',
    capex_M:30, co2_kt:50, starts:2026,
    capex_yr:{2024:0.3,2025:0.4,2026:0.3},
    note:'Organic Rankine Cycle; waste heat → electricity. Already in progress.'
  },
  { id:'lk-h2', co:'LUKOIL Neftohim Burgas', name:'Low-Carbon H₂ for Hydrotreating (pending)',
    capex_M:225, co2_kt:355, starts:2030,
    capex_yr:{2027:0.143,2028:0.143,2029:0.143,2030:0.143,2031:0.143,2032:0.143,2033:0.142},
    note:'Investment decision 2026–2031. Replaces grey H₂ in highest-emission processes.'
  },
  { id:'lk-res', co:'LUKOIL Neftohim Burgas', name:'Own RES — PV + Wind (pending)',
    capex_M:100, co2_kt:150, starts:2029,
    capex_yr:{2027:0.25,2028:0.35,2029:0.25,2030:0.15},
    note:'Minimize Scope 2. Investment decision 2026–2031.'
  },
  { id:'lk-modern', co:'LUKOIL Neftohim Burgas', name:'Equipment Modernization + Digital Energy Management',
    capex_M:35, co2_kt:107, starts:2026,
    capex_yr:{2024:0.25,2025:0.35,2026:0.25,2027:0.15},
    note:'Power plant and distillation unit modernization with digital energy management. Complements LIVE WATEROIL efficiency gains.'
  },
  { id:'lk-ccus', co:'LUKOIL Neftohim Burgas', name:'Refinery CCUS for Residual Process Emissions',
    capex_M:1100, co2_kt:1470, starts:2036,
    capex_yr:{2032:0.10,2033:0.12,2034:0.14,2035:0.16,2036:0.16,2037:0.14,2038:0.10,2039:0.05,2040:0.03},
    note:'Long-term refinery CCUS option for residual emissions. Uses midpoint of €700M–1.5B pathway range.'
  },

  // ── SVILOZA (updated with MCC from document) ──────────────────
  { id:'sv-bio', co:'Svilosa', name:'BioTEC Biomass CHP (done)',
    capex_M:21, co2_kt:33, starts:2024,
    capex_yr:{2021:0.33,2022:0.34,2023:0.33},
    note:'COMPLETED. Gold Standard GS3379 registered under Kyoto Protocol.'
  },
  { id:'sv-mcc', co:'Svilosa', name:'MCC Production Installation (€13.1M)',
    capex_M:13.1, co2_kt:25, starts:2027,
    capex_yr:{2025:0.3,2026:0.4,2027:0.3},
    note:'Microcrystalline cellulose from biomass. >€13.1M confirmed investment.'
  },
  { id:'sv-pv', co:'Svilosa', name:'On-site PV Park (850 panels)',
    capex_M:5, co2_kt:8, starts:2027,
    capex_yr:{2026:0.5,2027:0.5},
    note:'Reduces Scope 2. 850 polycrystalline panels on existing infrastructure.'
  },
  { id:'sv-herb', co:'Svilosa', name:'HERB Recovery Boilers (future)',
    capex_M:40, co2_kt:50, starts:2031,
    capex_yr:{2029:0.25,2030:0.35,2031:0.40},
    note:'High-efficiency black liquor combustion. Enables potential BECCS future.'
  },

  // ── HEIDELBERG MATERIALS (NEW — ANRAV CCUS) ───────────────────
  { id:'hm-anrav', co:'Heidelberg', name:'ANRAV CCUS — First in Eastern Europe',
    capex_M:600, co2_kt:800, starts:2028,
    capex_yr:{2023:0.05,2024:0.10,2025:0.20,2026:0.25,2027:0.25,2028:0.15},
    note:'Assumed €600M CCUS CAPEX split into €190M EU Innovation Fund support (incl. €38M storage) and €410M remaining project financing. Hybrid OxyCal + post-combustion. 800,000 t CO₂/yr.'
  },
  { id:'hm-rdf', co:'Heidelberg', name:'Kiln RDF/Tyre Upgrade (Line No.7)',
    capex_M:15, co2_kt:60, starts:2025,
    capex_yr:{2023:0.4,2024:0.4,2025:0.2},
    note:'480 t/24h shredder for direct RDF and tyre feeding. Completed.'
  },
  { id:'hm-pv', co:'Heidelberg', name:'Own RES at Vulkan Cement',
    capex_M:10, co2_kt:20, starts:2027,
    capex_yr:{2026:0.5,2027:0.5},
    note:'Feasibility studies ongoing for solar/wind at Vulkan Cement.'
  },

  // ── HOLCIM BULGARIA (NEW) ────────────────────────────────────
  { id:'hc-whr', co:'Holcim', name:'WHR System (4 MWh → 9,600 t CO₂/yr)',
    capex_M:8, co2_kt:9.6, starts:2027,
    capex_yr:{2026:0.5,2027:0.5},
    note:'Waste heat recovery. 9,600 t CO₂/yr saving confirmed in document.'
  },
  { id:'hc-pv', co:'Holcim', name:'Own PV Plant (3–9 MWp)',
    capex_M:7, co2_kt:12, starts:2027,
    capex_yr:{2026:0.5,2027:0.5},
    note:'Own consumption. Reduces Scope 2.'
  },
  { id:'hc-ccus', co:'Holcim', name:'Beli Net Zero — Full CCUS Chain',
    capex_M:600, co2_kt:400, starts:2032,
    capex_yr:{2029:0.15,2030:0.25,2031:0.35,2032:0.25},
    note:'Assumed €600M CCUS CAPEX. EU STEP Seal certified. Eastern Lights storage research (€24.2M+) ongoing.'
  },

  // ── BIOVET / HUVEPHARMA (NEW — ~€300M programme) ─────────────
  { id:'bv-pv', co:'Biovet', name:'300 MW PV Multi-site (Peshtera, Razgrad, Botevgrad)',
    capex_M:200, co2_kt:280, starts:2025,
    capex_yr:{2022:0.05,2023:0.10,2024:0.25,2025:0.30,2026:0.20,2027:0.10},
    note:'~100 MW operational end-2024. Target 300 MW by 2030. Part of ~€300M programme.'
  },
  { id:'bv-bess', co:'Biovet', name:'BESS — Largest Private in EU (13.4 MW / 26.8 MWh)',
    capex_M:22, co2_kt:40, starts:2026,
    capex_yr:{2025:0.5,2026:0.5},
    note:'EU Recovery & Resilience co-financed. Enables PV balancing + grid stability.'
  },
  { id:'bv-bio', co:'Biovet', name:'Greenburn® Biomass + Biogas from Fermentation Waste',
    capex_M:35, co2_kt:65, starts:2024,
    capex_yr:{2022:0.2,2023:0.3,2024:0.3,2025:0.2},
    note:'Carbon-neutral steam from residual mycelium + anaerobic wastewater biogas.'
  },

  // ── ORGAKHIM ──────────────────────────────────────────────────
  { id:'oc-heat', co:'Orgachim', name:'Heating Decentralization (Resalta co-financing)',
    capex_M:3, co2_kt:5, starts:2025,
    capex_yr:{2023:0.5,2024:0.5},
    note:'Steam network → local gas boilers. Eliminates thermal losses along pipelines.'
  },
  { id:'oc-pv', co:'Orgachim', name:'Rooftop PV + BESS',
    capex_M:5, co2_kt:8, starts:2027,
    capex_yr:{2026:0.5,2027:0.5},
    note:'Energy independence. Combined PV + battery storage.'
  },
];

// Company keys, display names, colors
const ROI_CO_KEYS = ['agropolychim','neochim','solvay','lukoil','svilosa','heidelberg','holcim','biovet','orgachim'];
const ROI_CO_NAMES = {
  agropolychim:'Agropolychim', neochim:'Neochim', solvay:'Solvay Sodi',
  lukoil:'LUKOIL Neftohim Burgas', svilosa:'Svilosa', heidelberg:'Heidelberg Materials',
  holcim:'Holcim Bulgaria', biovet:'Biovet / Huvepharma', orgachim:'Orgachim'
};

const ROI_COMPANY_PATHWAYS = {
  agropolychim: ['ap-hno3','ap-nh3'],
  neochim:      ['nc-n2o','nc-eff','nc-blue'],
  solvay:       ['ss-bio50','ss-kilns','ss-esolvay'],
  lukoil:       ['lk-orc','lk-modern','lk-h2','lk-res','lk-ccus'],
  svilosa:      ['sv-bio','sv-mcc','sv-pv','sv-herb'],
  heidelberg:   ['hm-anrav','hm-rdf','hm-pv'],
  holcim:       ['hc-whr','hc-pv','hc-ccus'],
  biovet:       ['bv-pv','bv-bess','bv-bio'],
  orgachim:     ['oc-heat','oc-pv'],
};

let currentRoiScenario = 'base';
let paybackChartInst = null;
let cashflowChartInst = null;
let roiScenarioSnapshotChartInst = null;
let roiEtsChartInst = null;
let cashflowUseLogScale = false;
let cashflowIncludeCbamAdjustment = false;

// Official CBAM-sector free allocation phase-out paid share.
// Applies only to sectors affected by the CBAM-linked reduction of free ETS allocation.
const ROI_CBAM_PAID_SHARE = {
  2026:0.025, 2027:0.05, 2028:0.10, 2029:0.225, 2030:0.485,
  2031:0.61, 2032:0.735, 2033:0.86, 2034:1.0
};

// Non-CBAM sectors do not automatically follow the CBAM phase-out.
// This separate schedule is a configurable modelling assumption for residual ETS free allocation.
const ROI_NON_CBAM_PAID_SHARE = {
  2026:0.20, 2027:0.25, 2028:0.30, 2029:0.35, 2030:0.40,
  2031:0.45, 2032:0.50, 2033:0.55, 2034:0.60, 2035:0.65,
  2036:0.70, 2037:0.75, 2038:0.80, 2039:0.90, 2040:1.0
};

const ROI_CBAM_COMPANIES = new Set(['Agropolychim','Neochim','Heidelberg','Holcim Bulgaria','LUKOIL Neftohim Burgas']);
const CBAM_CERTIFICATE_PRICE_2026_Q1 = 75.36;

const CASHFLOW_TECH_LABELS = {
  hydrogen: 'Green H₂ / ammonia',
  ccus: 'CCUS',
  electrification: 'Electrification / efficiency',
  biomass: 'Biomass / circularity',
  n2o: 'N₂O abatement',
};

const ROI_PATHWAY_TECH = {
  'ap-hno3':['n2o'],
  'ap-nh3':['hydrogen'],
  'nc-n2o':['n2o'],
  'nc-eff':['electrification'],
  'nc-blue':['hydrogen','ccus'],
  'ss-bio50':['biomass'],
  'ss-kilns':['electrification'],
  'ss-esolvay':['electrification'],
  'lk-orc':['electrification'],
  'lk-modern':['electrification'],
  'lk-h2':['hydrogen'],
  'lk-res':['electrification'],
  'lk-ccus':['ccus'],
  'sv-bio':['biomass'],
  'sv-mcc':['biomass'],
  'sv-pv':['electrification'],
  'sv-herb':['biomass'],
  'hm-anrav':['ccus'],
  'hm-rdf':['biomass'],
  'hm-pv':['electrification'],
  'hc-whr':['electrification'],
  'hc-pv':['electrification'],
  'hc-ccus':['ccus'],
  'bv-pv':['electrification'],
  'bv-bess':['electrification'],
  'bv-bio':['biomass'],
  'oc-heat':['electrification'],
  'oc-pv':['electrification'],
};

let cashflowPathwayState = {
  hydrogen:true,
  ccus:true,
  electrification:true,
  biomass:true,
  n2o:true,
};

function isCashflowPathEnabled(pathId) {
  const tags = ROI_PATHWAY_TECH[pathId] || [];
  if (!tags.length) return true;
  return tags.every(tag => cashflowPathwayState[tag] !== false);
}

function getCashflowPathIds(pathIds = []) {
  return pathIds.filter(isCashflowPathEnabled);
}

function syncCashflowPathwayButtons() {
  document.querySelectorAll('.ctc-pill[data-tech]').forEach(btn => {
    const techId = btn.dataset.tech;
    btn.classList.toggle('active', cashflowPathwayState[techId] !== false);
  });
}

function updateCashflowFilterNote() {
  const el = document.getElementById('cashflowFilterNote');
  if (!el) return;
  const active = Object.entries(cashflowPathwayState)
    .filter(([, enabled]) => enabled)
    .map(([techId]) => CASHFLOW_TECH_LABELS[techId]);

  if (active.length === 0) {
    el.textContent = 'All pathway groups are off. The chart shows a no-investment baseline.';
    return;
  }
  if (active.length === Object.keys(cashflowPathwayState).length) {
    el.textContent = 'All pathway groups enabled.';
    return;
  }
  el.textContent = `Active pathway groups: ${active.join(' · ')}`;
}

function toggleCashflowPathway(techId, btn) {
  if (!(techId in cashflowPathwayState)) return;
  cashflowPathwayState[techId] = !cashflowPathwayState[techId];
  if (btn) btn.classList.toggle('active', cashflowPathwayState[techId]);
  updateCashflowFilterNote();
  updateCashflowChart();
}

function resetCashflowPathways() {
  Object.keys(cashflowPathwayState).forEach(key => { cashflowPathwayState[key] = true; });
  syncCashflowPathwayButtons();
  updateCashflowFilterNote();
  updateCashflowChart();
}

function symlogCashflow(value) {
  if (!Number.isFinite(value) || value === 0) return 0;
  return Math.sign(value) * Math.log10(1 + Math.abs(value));
}

function inverseSymlogCashflow(value) {
  if (!Number.isFinite(value) || value === 0) return 0;
  return Math.sign(value) * (Math.pow(10, Math.abs(value)) - 1);
}

function formatCashflowAxisValue(value) {
  const abs = Math.abs(value);
  const prefix = value < 0 ? '-' : '';
  if (abs >= 1000) return `${prefix}€${(abs / 1000).toFixed(1)}B`;
  if (abs >= 100) return `${prefix}€${abs.toFixed(0)}M`;
  if (abs >= 10) return `${prefix}€${abs.toFixed(0)}M`;
  if (abs >= 1) return `${prefix}€${abs.toFixed(1)}M`;
  return `${prefix}€${abs.toFixed(2)}M`;
}

function syncCashflowLogButton() {
  const btn = document.getElementById('cashflowLogToggle');
  if (!btn) return;
  btn.classList.toggle('active', cashflowUseLogScale);
  btn.textContent = cashflowUseLogScale ? 'Linear y-axis' : 'Log y-axis';
  btn.setAttribute('aria-pressed', cashflowUseLogScale ? 'true' : 'false');
}

function toggleCashflowLogScale(btn) {
  cashflowUseLogScale = !cashflowUseLogScale;
  if (btn) {
    btn.classList.toggle('active', cashflowUseLogScale);
    btn.textContent = cashflowUseLogScale ? 'Linear y-axis' : 'Log y-axis';
    btn.setAttribute('aria-pressed', cashflowUseLogScale ? 'true' : 'false');
  } else {
    syncCashflowLogButton();
  }
  updateCashflowChart();
}

function getRoiPaidShare(pathway, year) {
  if (ROI_CBAM_COMPANIES.has(pathway.co)) {
    return ROI_CBAM_PAID_SHARE[Math.min(year, 2034)] ?? 1.0;
  }
  return ROI_NON_CBAM_PAID_SHARE[year] ?? 1.0;
}

function getCbamPassThroughShare() {
  const input = document.getElementById('cbamPassThroughShare');
  return Math.max(0, Math.min(1, parseFloat(input?.value) || 0));
}

function getCbamProxyCertificatePrice(year, scenario, yearIndex) {
  if (year === 2026) return CBAM_CERTIFICATE_PRICE_2026_Q1;
  return ROI_ETS[scenario][yearIndex];
}

function syncCashflowCbamControls() {
  const btn = document.getElementById('cashflowCbamToggle');
  const input = document.getElementById('cbamPassThroughShare');
  if (btn) {
    btn.classList.toggle('active', cashflowIncludeCbamAdjustment);
    btn.setAttribute('aria-pressed', cashflowIncludeCbamAdjustment ? 'true' : 'false');
  }
  if (input) input.disabled = !cashflowIncludeCbamAdjustment;
}

function toggleCashflowCbamAdjustment(btn) {
  cashflowIncludeCbamAdjustment = !cashflowIncludeCbamAdjustment;
  if (btn) {
    btn.classList.toggle('active', cashflowIncludeCbamAdjustment);
    btn.setAttribute('aria-pressed', cashflowIncludeCbamAdjustment ? 'true' : 'false');
  }
  syncCashflowCbamControls();
  updateCashflowChart();
}

function updateCashflowSubtitle() {
  const subtitle = document.getElementById('cashflowSubtitle');
  if (subtitle) {
    subtitle.textContent = cashflowIncludeCbamAdjustment
      ? 'ETS & CBAM-adjusted costs compensate decarbonization investments'
      : 'ETS costs compensate decarbonization investments';
  }
  const cbamLegend = document.getElementById('cfCbamLegend');
  if (cbamLegend) cbamLegend.style.display = cashflowIncludeCbamAdjustment ? 'flex' : 'none';
}


// Compute annual capex outflow and savings inflow for a set of pathway IDs
function computeCompanyCashflow(pathwayIds, scenario) {
  const prices = ROI_ETS[scenario];
  const investment = new Array(15).fill(0);  // indexed by ROI_YEARS
  const etsSavings = new Array(15).fill(0);

  pathwayIds.forEach(pid => {
    const p = ROI_PATHWAYS.find(x => x.id === pid);
    if (!p) return;
    // Capex
    Object.entries(p.capex_yr).forEach(([yr, frac]) => {
      const yi = ROI_YEARS.indexOf(parseInt(yr));
      if (yi >= 0) investment[yi] += p.capex_M * frac;
    });
    // ETS compliance savings use avoided paid allowances, not the full theoretical ETS price.
    // Formula: avoided_co2_kt * ets_price_eur_per_t * ets_paid_share / 1000 = M€.
    ROI_YEARS.forEach((yr, i) => {
      if (yr >= p.starts && p.co2_kt > 0) {
        etsSavings[i] += p.co2_kt * prices[i] * getRoiPaidShare(p, yr) / 1000;
      }
    });
  });
  const cbamProxy = computeCompanyCbamProxy(pathwayIds, scenario);
  const totalBenefit = etsSavings.map((v, i) => v + (cashflowIncludeCbamAdjustment ? cbamProxy[i] : 0));
  // Cumulative net
  const net = investment.map((inv, i) => totalBenefit[i] - inv);
  let cumulative = 0;
  const cumulNet = net.map(n => { cumulative += n; return cumulative; });
  const cumulInv = investment.reduce((acc, v) => { acc.push((acc.length > 0 ? acc[acc.length-1] : 0) + v); return acc; }, []);
  const cumulSav = etsSavings.reduce((acc, v) => { acc.push((acc.length > 0 ? acc[acc.length-1] : 0) + v); return acc; }, []);
  const cumulCbam = cbamProxy.reduce((acc, v) => { acc.push((acc.length > 0 ? acc[acc.length-1] : 0) + v); return acc; }, []);

  return { investment, etsSavings, cbamProxy, cumulNet, cumulInv, cumulSav, cumulCbam };
}

function computeCompanyCbamProxy(pathwayIds, scenario) {
  const annual = new Array(15).fill(0);
  if (!cashflowIncludeCbamAdjustment) return annual;

  const companies = new Set(pathwayIds
    .map(pid => ROI_PATHWAYS.find(p => p.id === pid)?.co)
    .filter(Boolean));
  const companyKeys = new Set();
  Object.entries(ROI_COMPANY_PATHWAYS).forEach(([key, ids]) => {
    if (ids.some(id => pathwayIds.includes(id))) companyKeys.add(key);
  });
  const passThrough = getCbamPassThroughShare();

  // CBAM proxy adjustment represents possible market-price pressure from CBAM-covered imports.
  // It is intentionally separate from ETS savings and is not a direct legal CBAM cost for EU producers.
  PRODUCTS.filter(p => p.cbam).forEach(product => {
    const coName = ROI_CO_NAMES[product.co];
    if (!companies.has(coName) && !companyKeys.has(product.co)) return;
    const input = document.getElementById(product.volId);
    const volumeTonnes = (parseFloat(input?.value) || 0) * 1000;

    ROI_YEARS.forEach((yr, i) => {
      const paidShare = ROI_CBAM_PAID_SHARE[Math.min(yr, 2034)] ?? 1.0;
      const certificatePrice = getCbamProxyCertificatePrice(yr, scenario, i);
      annual[i] += volumeTonnes * product.ef * certificatePrice * paidShare * passThrough / 1e6;
    });
  });

  return annual;
}

// Payback period for a single pathway
function calcPayback(pathway, scenario) {
  if (!pathway.co2_kt || pathway.co2_kt === 0 || pathway.starts === 9999) return null;
  const yi = ROI_YEARS.indexOf(pathway.starts);
  if (yi < 0) {
    // starts before 2026 — use 2026 price
    const p = ROI_ETS[scenario][0];
    const annualSaving = pathway.co2_kt * p / 1000;
    return pathway.capex_M / annualSaving;
  }
  const p = ROI_ETS[scenario][yi];
  const annualSaving = pathway.co2_kt * p / 1000;
  return pathway.capex_M / annualSaving;
}

// Net by 2040 for a pathway (M€)
function calcNet2040(pathway, scenario) {
  const prices = ROI_ETS[scenario];
  let totalSavings = 0;
  ROI_YEARS.forEach((yr, i) => {
    if (yr >= pathway.starts && pathway.co2_kt > 0) totalSavings += pathway.co2_kt * prices[i] / 1000;
  });
  return totalSavings - pathway.capex_M;
}

function irrSignal(payback) {
  if (payback === null) return '<span class="irr-neg">N/A (enabler)</span>';
  if (payback < 7) return '<span class="irr-high">&gt;10% IRR</span>';
  if (payback < 14) return '<span class="irr-med">5–10% IRR</span>';
  if (payback < 20) return '<span class="irr-low">&lt;5% IRR</span>';
  return '<span class="irr-neg">Very long-term</span>';
}

function buildRoiEtsChart() {
  const ctx = document.getElementById('roiEtsPriceChart');
  if (!ctx) return;
  if (roiEtsChartInst) { roiEtsChartInst.destroy(); roiEtsChartInst = null; }

  const c = getChartColors();
  const scenarioMeta = {
    low:  { label: 'Low ROI_ETS',  color: c.amber,   name: 'Low' },
    base: { label: 'Base ROI_ETS', color: c.blue,    name: 'Base' },
    high: { label: 'High ROI_ETS', color: c.success, name: 'High' },
  };

  roiEtsChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ROI_YEARS,
      datasets: Object.entries(scenarioMeta).map(([key, meta]) => {
        const active = key === currentRoiScenario;
        return {
          label: meta.label,
          data: ROI_ETS[key],
          borderColor: active ? meta.color : withChartAlpha(meta.color, '99'),
          backgroundColor: withChartAlpha(meta.color, active ? '22' : '0f'),
          borderWidth: active ? 3 : 1.8,
          pointRadius: active ? 3.4 : 2.4,
          pointHoverRadius: 5,
          tension: 0.25,
          fill: false,
        };
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartDefaults().plugins,
        legend: { ...chartDefaults().plugins.legend, position: 'bottom' },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: €${ctx.parsed.y}/tCO₂`
          }
        }
      },
      scales: {
        x: { ...chartDefaults().scales.x },
        y: {
          ...chartDefaults().scales.y,
          beginAtZero: false,
          title: { display: true, text: '€/tCO₂', color: c.textMuted, font: { size: 11, family: 'DM Sans' } },
          ticks: { ...chartDefaults().scales.y.ticks, callback: value => `€${value}` }
        }
      }
    }
  });

  const activeMeta = scenarioMeta[currentRoiScenario];
  const activePrices = ROI_ETS[currentRoiScenario];
  const pill = document.getElementById('roiEtsActivePill');
  if (pill) pill.textContent = `${activeMeta.name} selected`;
  const summary = document.getElementById('roiEtsPriceSummary');
  if (summary) {
    summary.textContent = `${activeMeta.name} ROI_ETS values used now: 2026 €${activePrices[0]}/t, 2030 €${activePrices[4]}/t, 2035 €${activePrices[9]}/t, 2040 €${activePrices[14]}/t. Hover over the chart for exact annual values.`;
  }
}

// ── PAYBACK CHART ─────────────────────────────
let currentPaybackFilter = 'all';

function filterPayback(coId, btn) {
  currentPaybackFilter = coId;
  document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (paybackChartInst) { paybackChartInst.destroy(); paybackChartInst = null; }
  buildPaybackChart();
}

function buildPaybackChart() {
  const ctx = document.getElementById('paybackChart');
  if (!ctx) return;

  const scenario = currentRoiScenario;
  const c = getChartColors();

  // Compute payback — apply company filter
  const items = ROI_PATHWAYS
    .filter(p => p.co2_kt > 0 && p.starts !== 9999 &&
      (currentPaybackFilter === 'all' || normalizeRoiCompanyKey(p.co) === currentPaybackFilter))
    .map(p => ({
      label: `${p.name.replace(' (done)','')} (${p.co.split(' ')[0]})`,
      payback: calcPayback(p, scenario),
      co: p.co,
    }))
    .sort((a, b) => a.payback - b.payback);

  const roiCoColors = getCompanyChartColors(ROI_CO_KEYS);
  const itemColors = items.map(it => {
    const idx = ROI_CO_KEYS.indexOf(normalizeRoiCompanyKey(it.co));
    return withChartAlpha(idx >= 0 ? roiCoColors[idx] : c.semantic.other, 'cc');
  });

  if (paybackChartInst) { paybackChartInst.destroy(); paybackChartInst = null; }

  // Adjust height based on number of rows
  const wrapEl = document.getElementById('paybackChartWrap');
  if (wrapEl) wrapEl.style.height = Math.max(200, items.length * 28 + 40) + 'px';

  paybackChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.map(it => it.label),
      datasets: [{
        label: 'Payback (yrs from commissioning)',
        data: items.map(it => Math.min(it.payback, 10)),
        backgroundColor: itemColors,
        borderRadius: 3,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartDefaults().plugins,
        legend: { display: false },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => {
              const raw = items[ctx.dataIndex].payback;
              return raw > 25 ? ` ${raw.toFixed(0)} yrs (long-term)` : ` ${raw.toFixed(1)} yrs`;
            }
          }
        }
      },
      scales: {
        x: {
          ...chartDefaults().scales.x,
          title: { display: true, text: 'Payback (years from commissioning)', color: c.textMuted, font: { size: 11, family: 'DM Sans' } },
          max: 10,
        },
        y: {
          ...chartDefaults().scales.y,
          ticks: { ...chartDefaults().scales.y.ticks, font: { size: 10, family: 'DM Sans' } }
        }
      }
    }
  });
}

// ── CASHFLOW CHART ────────────────────────────
function buildRoiScenarioSnapshotChart() {
  const ctx = document.getElementById('roiScenarioSnapshotChart');
  if (!ctx) return;
  if (roiScenarioSnapshotChartInst) { roiScenarioSnapshotChartInst.destroy(); roiScenarioSnapshotChartInst = null; }

  const c = getChartColors();
  const lowColor = c.amber;
  const baseColor = c.blue;
  const highColor = c.success;

  roiScenarioSnapshotChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ROI_SCENARIO_SNAPSHOT.map(row => row.year),
      datasets: [
        {
          type: 'bar',
          label: 'Investment',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.investment),
          backgroundColor: withChartAlpha(c.semantic.investment, '66'),
          borderColor: withChartAlpha(c.semantic.investment, 'cc'),
          borderWidth: 1,
          borderRadius: 3,
          order: 10
        },
        {
          type: 'line',
          label: 'Low - ETS',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.lowEts),
          borderColor: lowColor,
          backgroundColor: withChartAlpha(lowColor, '10'),
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          tension: 0.28
        },
        {
          type: 'line',
          label: 'Low - Net',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.lowNet),
          borderColor: lowColor,
          backgroundColor: withChartAlpha(lowColor, '18'),
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 4,
          tension: 0.28
        },
        {
          type: 'line',
          label: 'Base - ETS',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.baseEts),
          borderColor: baseColor,
          backgroundColor: withChartAlpha(baseColor, '10'),
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          tension: 0.28
        },
        {
          type: 'line',
          label: 'Base - Net',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.baseNet),
          borderColor: baseColor,
          backgroundColor: withChartAlpha(baseColor, '18'),
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 4,
          tension: 0.28
        },
        {
          type: 'line',
          label: 'High - ETS',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.highEts),
          borderColor: highColor,
          backgroundColor: withChartAlpha(highColor, '10'),
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          tension: 0.28
        },
        {
          type: 'line',
          label: 'High - Net',
          data: ROI_SCENARIO_SNAPSHOT.map(row => row.highNet),
          borderColor: highColor,
          backgroundColor: withChartAlpha(highColor, '18'),
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 4,
          tension: 0.28
        }
      ]
    },
    options: {
      ...chartDefaults(),
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        ...chartDefaults().plugins,
        legend: { ...chartDefaults().plugins.legend, position: 'bottom' },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${formatCashflowAxisValue(ctx.parsed.y)}`
          }
        },
        annotation: {
          annotations: {
            zeroLine: {
              type: 'line',
              yMin: 0,
              yMax: 0,
              borderColor: c.grid,
              borderWidth: 1.5,
              borderDash: [3, 3]
            }
          }
        }
      },
      scales: {
        x: { ...chartDefaults().scales.x },
        y: {
          ...chartDefaults().scales.y,
          title: { display: true, text: 'M€', color: c.textMuted, font: { size: 11, family: 'DM Sans' } },
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: value => formatCashflowAxisValue(Number(value))
          }
        }
      }
    }
  });
}

function updateCashflowChart() {
  const ctx = document.getElementById('cashflowChart');
  if (!ctx) return;
  const coId = document.getElementById('roiCompanySelect')?.value || 'all';
  const coName = coId === 'all' ? 'All Companies Combined' : (ROI_CO_NAMES[coId] || coId);
  const scenario = currentRoiScenario;

  let cumulInv, cumulSav, cumulCbam, cumulNet;

  if (coId === 'all') {
    // Sum across all 9 companies
    const zeros = new Array(15).fill(0);
    let totalInv = [...zeros], totalSav = [...zeros], totalCbam = [...zeros];
    ROI_CO_KEYS.forEach(key => {
      const pathIds = getCashflowPathIds(ROI_COMPANY_PATHWAYS[key]);
      if (!pathIds.length) return;
      const cf = computeCompanyCashflow(pathIds, scenario);
      cf.investment.forEach((v, i) => totalInv[i] += v);
      cf.etsSavings.forEach((v, i) => totalSav[i] += v);
      cf.cbamProxy.forEach((v, i)  => totalCbam[i] += v);
    });
    let cumI = 0, cumS = 0, cumC = 0, cumN = 0;
    cumulInv = totalInv.map(v => { cumI += v; return cumI; });
    cumulSav = totalSav.map(v => { cumS += v; return cumS; });
    cumulCbam = totalCbam.map(v => { cumC += v; return cumC; });
    const net = totalSav.map((s, i) => s + totalCbam[i] - totalInv[i]);
    let runNet = 0;
    cumulNet = net.map(v => { runNet += v; return runNet; });
  } else {
    const pathIds = getCashflowPathIds(ROI_COMPANY_PATHWAYS[coId] || []);
    const cf = computeCompanyCashflow(pathIds, scenario);
    cumulInv = cf.cumulInv; cumulSav = cf.cumulSav; cumulCbam = cf.cumulCbam; cumulNet = cf.cumulNet;
  }
  const c = getChartColors();
  const useLogScale = cashflowUseLogScale;
  const chartCumulInv = useLogScale ? cumulInv.map(v => symlogCashflow(-v)) : cumulInv.map(v => -v);
  const chartCumulSav = useLogScale ? cumulSav.map(v => symlogCashflow(v)) : cumulSav;
  const chartCumulCbam = useLogScale ? cumulCbam.map(v => symlogCashflow(v)) : cumulCbam;
  const chartCumulNet = useLogScale ? cumulNet.map(v => symlogCashflow(v)) : cumulNet;
  const cashflowRawSeries = cashflowIncludeCbamAdjustment
    ? [cumulInv.map(v => -v), cumulSav, cumulCbam, cumulNet]
    : [cumulInv.map(v => -v), cumulSav, cumulNet];
  syncCashflowLogButton();
  syncCashflowCbamControls();
  updateCashflowSubtitle();

  if (cashflowChartInst) { cashflowChartInst.destroy(); cashflowChartInst = null; }

  cashflowChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ROI_YEARS,
      datasets: [
        {
          label: `Cumul. Investment — ${coName} (M€)`,
          data: chartCumulInv,
          borderColor: c.semantic.investment,
          backgroundColor: withChartAlpha(c.semantic.investment, '18'),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
        {
          label: 'Cumul. ETS avoided compliance cost (M€)',
          data: chartCumulSav,
          borderColor: c.semantic.savings,
          backgroundColor: withChartAlpha(c.semantic.savings, '18'),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        },
        ...(cashflowIncludeCbamAdjustment ? [{
          label: 'Cumul. CBAM proxy adjustment (M€)',
          data: chartCumulCbam,
          borderColor: c.semantic.cbam,
          backgroundColor: withChartAlpha(c.semantic.cbam, '10'),
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
        }] : []),
        {
          label: cashflowIncludeCbamAdjustment ? 'Net Position incl. CBAM proxy (M€)' : 'Net Position (M€)',
          data: chartCumulNet,
          borderColor: c.semantic.net,
          borderWidth: 2.5,
          borderDash: [5, 3],
          pointRadius: 3,
          fill: false,
          tension: 0.3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartDefaults().plugins,
        legend: { display: false },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: {
            label: ctx => {
              const rawValue = useLogScale
                ? cashflowRawSeries[ctx.datasetIndex][ctx.dataIndex]
                : ctx.parsed.y;
              return ` ${ctx.dataset.label}: ${formatCashflowAxisValue(rawValue)}`;
            }
          }
        },
        annotation: {
          annotations: { zeroLine: {
            type: 'line', yMin: 0, yMax: 0,
            borderColor: c.grid, borderWidth: 1.5, borderDash: [3, 3],
          }}
        }
      },
      scales: {
        x: { ...chartDefaults().scales.x },
        y: {
          ...chartDefaults().scales.y,
          title: { display: true, text: useLogScale ? 'Signed log scale (M€)' : 'M€', color: c.textMuted, font: { size: 11, family: 'DM Sans' } },
          ticks: {
            ...chartDefaults().scales.y.ticks,
            callback: value => useLogScale
              ? formatCashflowAxisValue(inverseSymlogCashflow(value))
              : formatCashflowAxisValue(value)
          },
        }
      }
    }
  });
}

// ── MAC CHART (Break-even Carbon Price) ─────
let macChartInst = null;
function buildMacChart() {
  const ctx = document.getElementById('macChart');
  if (!ctx) return;
  if (macChartInst) { macChartInst.destroy(); macChartInst = null; }
  const c = getChartColors();
  // Break-even carbon price = CAPEX (€) / annual CO2 saved (t) = €/tCO2 for 1-yr payback
  const macItems = [
    { name: 'N₂O (Neochim)',     bep: 4.5e6/277e3,    color:c.companies.neochim },
    { name: 'N₂O (Agropol.)',    bep: 6.5e6/292e3,    color:c.companies.agropolychim },
    { name: 'LUKOIL Neftohim Burgas Eff.',       bep: 35e6/157e3,     color:c.companies.lukoil },
    { name: 'Solvay Coal',       bep: 75e6/165e3,     color:c.companies.solvay },
    { name: 'Neochim Eff.',      bep: 11.5e6/22.5e3,  color:c.companies.neochim },
    { name: 'Svilosa BioTEC',    bep: 21e6/33e3,      color:c.companies.svilosa },
    { name: 'Agropol. Eff.',     bep: 45e6/65e3,      color:c.companies.agropolychim },
    { name: 'Agropol. Plant',    bep: 115e6/130e3,    color:c.companies.agropolychim },
    { name: 'Svilosa Renew.',    bep: 22.5e6/19e3,    color:c.companies.svilosa },
    { name: 'LUKOIL Neftohim Burgas Low-C H₂',  bep: 225e6/355e3,    color:c.companies.lukoil },
    { name: 'Solvay Electrif.',  bep: 90e6/88e3,      color:c.companies.solvay },
    { name: 'Neochim Blue NH₃', bep: 150e6/126e3,    color:c.companies.neochim },
    { name: 'LUKOIL Neftohim Burgas Electrif.', bep: 175e6/210e3,    color:c.companies.lukoil },
    { name: 'Solvay CCUS',      bep: 120e6/200e3,    color:c.companies.solvay },
    { name: 'LUKOIL Neftohim Burgas CCUS',      bep: 1100e6/1470e3,  color:c.companies.lukoil },
    { name: 'Green NH₃ (AP)',   bep: 1100e6/416e3,   color:c.companies.agropolychim },
    { name: 'Green NH₃ (NC)',   bep: 625e6/162e3,    color:c.companies.neochim },
  ].sort((a,b) => a.bep - b.bep);
  const etsPrices = ROI_ETS[currentRoiScenario];
  const ets2026 = etsPrices[0];
  const ets2030 = etsPrices[4];
  macChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: macItems.map(x => x.name),
      datasets: [{
        label: 'Break-even carbon price (€/tCO₂)',
        data: macItems.map(x => Math.min(x.bep, 3200)),
        backgroundColor: macItems.map(x => withChartAlpha(x.color, 'cc')),
        borderRadius: 3, borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...chartDefaults().plugins,
        legend: { display: false },
        annotation: {
          annotations: {
            ets26: { type:'line', yMin:ets2026, yMax:ets2026, borderColor:c.semantic.reference, borderWidth:2, borderDash:[5,3],
              label:{ content:`ETS ${ROI_YEARS[0]}: €${ets2026}/t`, display:true, position:'start', color:c.semantic.reference, font:{size:10,weight:'700'}, backgroundColor:'transparent', padding:2 }},
            ets30: { type:'line', yMin:ets2030, yMax:ets2030, borderColor:c.semantic.net, borderWidth:2, borderDash:[5,3],
              label:{ content:`ETS 2030: €${ets2030}/t`, display:true, position:'start', color:c.semantic.net, font:{size:10,weight:'700'}, backgroundColor:'transparent', padding:2 }}
          }
        },
        tooltip: {
          ...chartDefaults().plugins.tooltip,
          callbacks: { label: ctx => ` €${macItems[ctx.dataIndex].bep.toFixed(0)}/tCO₂ (break-even)` }
        }
      },
      scales: {
        x: { ...chartDefaults().scales.x, ticks: { ...chartDefaults().scales.x.ticks, font:{size:9,family:'DM Sans'}, maxRotation:40 }},
        y: { ...chartDefaults().scales.y, title:{display:true,text:'€/tCO₂',color:c.textMuted,font:{size:11,family:'DM Sans'}},
          ticks:{...chartDefaults().scales.y.ticks,callback:v=>v>=1000?`€${(v/1000).toFixed(1)}k`:`€${v}`} }
      }
    }
  });
}

// ── ROI TABLE ────────────────────────────────
function buildRoiTable() {
  const tbody = document.getElementById('roiTableBody');
  if (!tbody) return;
  const scenario = currentRoiScenario;
  const prices = ROI_ETS[scenario];

  const rows = ROI_PATHWAYS
    .filter(p => p.co2_kt > 0)
    .map(p => {
      const payback = calcPayback(p, scenario);
      const saving2026 = p.starts <= 2026 ? (p.co2_kt * prices[0] / 1000).toFixed(2) : '—';
      const saving2030 = p.starts <= 2030 ? (p.co2_kt * prices[4] / 1000).toFixed(2) : '—';
      const net2040 = calcNet2040(p, scenario);
      const pbStr = payback === null ? 'Enabler' : payback > 99 ? '>99 yr' : payback.toFixed(1) + ' yr';
      const netStr = net2040 > 0 ? `+€${net2040.toFixed(0)}M` : `−€${Math.abs(net2040).toFixed(0)}M`;
      const netColor = net2040 > 0 ? 'color:var(--primary);font-weight:600' : 'color:var(--red)';
      return `<tr>
        <td title="${p.note || ''}">${p.name}</td>
        <td><span class="co-tag">${p.co}</span></td>
        <td style="font-family:var(--font-mono)">€${p.capex_M}M</td>
        <td style="font-family:var(--font-mono)">${p.co2_kt} kt</td>
        <td style="font-family:var(--font-mono)">${saving2026 !== '—' ? '€'+saving2026+'M' : '—'}</td>
        <td style="font-family:var(--font-mono)">${saving2030 !== '—' ? '€'+saving2030+'M' : '—'}</td>
        <td style="font-family:var(--font-mono);font-weight:600">${pbStr}</td>
        <td style="font-family:var(--font-mono);${netColor}">${netStr}</td>
        <td>${irrSignal(payback)}</td>
      </tr>`;
    });
  tbody.innerHTML = rows.join('');
}

// ── SCENARIO SWITCH ───────────────────────────
function setRoiScenario(sc, btn) {
  currentRoiScenario = sc;
  document.querySelectorAll('.rsb-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const labels = {low:'Low scenario',base:'Base scenario (Reuters)',high:'High scenario (BNEF)'};
  document.getElementById('paybackScenLabel').textContent = labels[sc];
  document.getElementById('roiTableScenLabel').textContent = labels[sc];
  // Update KPIs
  const p4 = ROI_ETS[sc][4]; // 2030 price
  const allSaving2030 = ROI_PATHWAYS
    .filter(x => x.co2_kt > 0 && x.starts <= 2030)
    .reduce((s, x) => s + x.co2_kt * p4 / 1000, 0);
  document.getElementById('rk-savings-2030').textContent = `€${allSaving2030.toFixed(0)}M`;
  // Rebuild charts
  buildRoiEtsChart();
  buildPaybackChart();
  updateCashflowChart();
  buildRoiTable();
  buildMacChart();
}

// ── INIT ROI ──────────────────────────────────
function initRoi() {
  syncCashflowPathwayButtons();
  updateCashflowFilterNote();
  buildRoiEtsChart();
  buildPaybackChart();
  buildRoiScenarioSnapshotChart();
  updateCashflowChart();
  buildRoiTable();
  buildMacChart();
}







/* ═══════════════════════════════════════════════
   DATABASE-DRIVEN CHARTS & TABLES
   Source: Database_01.xlsx (Sheet2 + Sheet4)
═══════════════════════════════════════════════ */

// ── EMISSIONS TAB NAVIGATION ──────────────────
function showEmsTab(id, btn) {
  document.querySelectorAll('.ems-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.ems-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('emsp-' + id);
  if (panel) panel.classList.add('active');
  if (btn) btn.classList.add('active');
  // Build charts lazily on first open
  if (id === 'ippu') buildIppuCharts();
  if (id === 'subsector') buildSubsectorCharts();
  if (id === 'fuel2023') buildFuel2023Charts();
}

// ── IPPU CHARTS (Sheet2 historical) ──────────

let ippuTotalChartInst = null, ippu2023PieInst = null, ippuStackedInst = null;

function buildIppuCharts() {
  const c = getChartColors();
  const hist = DB.ippu_hist;
  const years = hist.map(d => d.year);

  // 1. IPPU Total line chart
  const ctxTotal = document.getElementById('ippuTotalChart');
  if (ctxTotal && !ippuTotalChartInst) {
    ippuTotalChartInst = new Chart(ctxTotal, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'IPPU Total (Kt CO₂eq)',
          data: hist.map(d => d.total),
          borderColor: c.semantic.total,
          backgroundColor: withChartAlpha(c.semantic.total, '20'),
          fill: true, tension: 0.35, pointRadius: 4, borderWidth: 2.5,
        }]
      },
      options: {
        ...chartDefaults(), responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults().plugins, legend: { display: false },
          tooltip: { ...chartDefaults().plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(2)} Kt CO₂eq` } } },
        scales: { ...chartDefaults().scales,
          y: { ...chartDefaults().scales.y, beginAtZero: false,
            title: { display: true, text: 'Kt CO₂eq', color: c.textMuted, font: { size: 11, family: 'DM Sans' } } } }
      }
    });
  }

  // 2. IPPU 2023 Pie
  const ctxPie = document.getElementById('ippu2023PieChart');
  if (ctxPie && !ippu2023PieInst) {
    const labels = Object.keys(DB.ippu_2023);
    const data   = Object.values(DB.ippu_2023);
    const colors = labels.map(getIppuColorForLabel);
    ippu2023PieInst = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors,
          borderColor: c.segmentBorder, borderWidth: 2 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults().plugins,
          legend: { ...chartDefaults().plugins.legend, position: 'right' },
          tooltip: { ...chartDefaults().plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(2)} Kt (${(ctx.parsed / 3855.65 * 100).toFixed(1)}%)` } } }
      }
    });
  }

  // 3. IPPU Stacked bar
  const ctxStack = document.getElementById('ippuStackedChart');
  if (ctxStack && !ippuStackedInst) {
    const ds = [
      { label: '2.A Mineral Industry', key: 'mineral', color: c.semantic.mineral },
      { label: '2.B Chemical Industry', key: 'chemical', color: c.semantic.chemical },
      { label: '2.C Metal Industry',   key: 'metal',    color: c.semantic.metal },
      { label: '2.F ODS Substitutes',  key: 'ods',      color: c.semantic.ods },
      { label: '2.G Other',            key: 'other',    color: c.semantic.other },
    ];
    ippuStackedInst = new Chart(ctxStack, {
      type: 'bar',
      data: {
        labels: years,
        datasets: ds.map(d => ({
          label: d.label,
          data: hist.map(h => h[d.key] || 0),
          backgroundColor: withChartAlpha(d.color, 'cc'),
          borderColor: d.color,
          borderWidth: 1, borderRadius: 2, stack: 'a',
        }))
      },
      options: {
        ...chartDefaults(), responsive: true, maintainAspectRatio: false,
        plugins: { ...chartDefaults().plugins,
          legend: { ...chartDefaults().plugins.legend, position: 'bottom' } },
        scales: {
          x: { ...chartDefaults().scales.x, stacked: true },
          y: { ...chartDefaults().scales.y, stacked: true,
            title: { display: true, text: 'Kt CO₂eq', color: c.textMuted, font: { size: 11, family: 'DM Sans' } } }
        }
      }
    });
  }

  // 4. IPPU data table
  buildIppuDataTable();
}

function buildIppuDataTable() {
  const tbl = document.getElementById('ippuDataTable');
  if (!tbl || tbl.innerHTML) return;
  const cols = ['Year','Total','2.A Mineral','2.B Chemical','2.C Metal','2.F ODS','2.G Other'];
  const head = `<thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>`;
  const body = '<tbody>' + DB.ippu_hist.map(d =>
    `<tr><td><strong>${d.year}</strong></td><td style="font-family:var(--font-mono)">${d.total.toFixed(2)}</td>
    <td style="font-family:var(--font-mono)">${(d.mineral||0).toFixed(2)}</td>
    <td style="font-family:var(--font-mono)">${(d.chemical||0).toFixed(2)}</td>
    <td style="font-family:var(--font-mono)">${(d.metal||0).toFixed(2)}</td>
    <td style="font-family:var(--font-mono)">${(d.ods||0).toFixed(2)}</td>
    <td style="font-family:var(--font-mono)">${(d.other||0).toFixed(2)}</td></tr>`
  ).join('') + '</tbody>';
  tbl.innerHTML = head + body;
}

// ── SUBSECTOR CHARTS ──────────────────────────

let energySubsecInst = null, processEmsInst = null, companyEmsDbInst = null;

function buildSubsectorCharts() {
  const c = getChartColors();
  const sh = DB.subsec_hist;
  const years = sh.map(d => d.year);

  // Energy combustion by key sub-sectors
  const ctxE = document.getElementById('energySubsecChart');
  if (ctxE && !energySubsecInst) {
    energySubsecInst = new Chart(ctxE, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          { label: '1.A.1.b Petroleum Refining (LUKOIL Neftohim Burgas)', data: sh.map(d => d.petroleum_refining_1a1b),
            borderColor: c.companies.lukoil, backgroundColor: 'transparent', borderWidth:2.5, tension:0.3, pointRadius:3 },
          { label: '1.A.2.c Chemical Industry', data: sh.map(d => d.chemicals_1a2c),
            borderColor: c.semantic.chemical, backgroundColor: 'transparent', borderWidth:2.5, tension:0.3, pointRadius:3 },
          { label: '1.A.2.d Pulp & Paper (Svilosa)', data: sh.map(d => d.pulp_paper_1a2d),
            borderColor: c.companies.svilosa, backgroundColor: 'transparent', borderWidth:2, tension:0.3, pointRadius:3, borderDash:[4,2] },
        ]
      },
      options: {
        ...chartDefaults(), responsive:true, maintainAspectRatio:false,
        plugins: { ...chartDefaults().plugins,
          legend: { ...chartDefaults().plugins.legend, position:'bottom' },
          tooltip:{ ...chartDefaults().plugins.tooltip, callbacks:{ label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} Kt CO₂eq` } } },
        scales: { ...chartDefaults().scales,
          y: { ...chartDefaults().scales.y, title:{ display:true, text:'Kt CO₂eq', color:c.textMuted, font:{size:11,family:'DM Sans'} } } }
      }
    });
  }

  // Chemical process emissions
  const ctxP = document.getElementById('processEmissionsChart');
  if (ctxP && !processEmsInst) {
    processEmsInst = new Chart(ctxP, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: '2.B.1 Ammonia production', data: sh.map(d => d.ammonia_2b1),
            backgroundColor: withChartAlpha(c.semantic.chemical, 'cc'), borderRadius:3, stack:'a' },
          { label: '2.B.7 Soda ash production', data: sh.map(d => d.soda_ash_2b7),
            backgroundColor: withChartAlpha(c.semantic.mineral, 'cc'), borderRadius:3, stack:'a' },
          { label: '2.B.2 Nitric acid production', data: sh.map(d => d.nitric_acid_2b2),
            backgroundColor: withChartAlpha(c.semantic.ods, 'cc'), borderRadius:3, stack:'a' },
        ]
      },
      options: {
        ...chartDefaults(), responsive:true, maintainAspectRatio:false,
        plugins: { ...chartDefaults().plugins, legend: { ...chartDefaults().plugins.legend, position:'bottom' } },
        scales: {
          x: { ...chartDefaults().scales.x, stacked:true },
          y: { ...chartDefaults().scales.y, stacked:true, title:{ display:true, text:'Kt CO₂eq', color:c.textMuted, font:{size:11,family:'DM Sans'} } }
        }
      }
    });
  }

  // Company-level 2023 attribution chart (official where available)
  const ctxCo = document.getElementById('companyEmissionsChart');
  if (ctxCo && !companyEmsDbInst) {
    const last = DB.subsec_hist[DB.subsec_hist.length - 1]; // 2023
    companyEmsDbInst = new Chart(ctxCo, {
      type: 'bar',
      data: {
        labels: [
          'LUKOIL Neftohim Burgas\n(1.A.1.b)', 'Soda ash\n(2.B.7)', 'Ammonia\n(2.B.1)',
          'Chemical\nIndustry\n(1.A.2.c)', 'Nitric acid\n(2.B.2)', 'Pulp/Paper\n(1.A.2.d)'
        ],
        datasets: [{
          label: 'Kt CO₂eq (2023, official)',
          data: [
            last.petroleum_refining_1a1b,
            last.soda_ash_2b7,
            last.ammonia_2b1,
            last.chemicals_1a2c,
            last.nitric_acid_2b2,
            last.pulp_paper_1a2d,
          ],
          backgroundColor: [
            withChartAlpha(c.companies.lukoil, 'cc'),
            withChartAlpha(c.companies.solvay, 'cc'),
            withChartAlpha(c.companies.agropolychim, 'cc'),
            withChartAlpha(c.semantic.chemical, 'cc'),
            withChartAlpha(c.companies.neochim, 'cc'),
            withChartAlpha(c.companies.svilosa, '99')
          ],
          borderRadius:4, borderSkipped:false,
        }]
      },
      options: {
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins: { ...chartDefaults().plugins, legend:{ display:false },
          tooltip:{ ...chartDefaults().plugins.tooltip, callbacks:{ label: ctx => ` ${ctx.parsed.x.toFixed(2)} Kt CO₂eq (official 2023)` } } },
        scales: { x: { ...chartDefaults().scales.x, title:{ display:true, text:'Kt CO₂eq', color:getChartColors().textMuted, font:{size:11,family:'DM Sans'} } },
          y: { ...chartDefaults().scales.y } }
      }
    });
  }
}

// ── FUEL COMBUSTION CHARTS (Sheet4) ──────────

let fuelGroupInst = null, mfgFuelInst = null;

function buildFuel2023Charts() {
  const c = getChartColors();
  const fc = DB.fuel_combustion_2023;

  // Group totals
  const groups = ['Energy','Manufacturing','Transport','Other'];
  const groupColors = [c.semantic.metal, c.semantic.chemical, c.semantic.nonEnergy, c.semantic.other];
  const groupTotals = groups.map(g => {
    const rows = fc.filter(r => r.group === g && r.total !== null);
    return rows.reduce((s, r) => s + (r.total || 0), 0);
  });

  const ctxG = document.getElementById('fuelGroupChart');
  if (ctxG && !fuelGroupInst) {
    fuelGroupInst = new Chart(ctxG, {
      type: 'doughnut',
      data: {
        labels: ['Energy Industries','Manufacturing','Transport','Other Sectors'],
        datasets: [{ data: groupTotals, backgroundColor: groupColors,
          borderColor: c.segmentBorder, borderWidth:2 }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins: { ...chartDefaults().plugins,
          legend: { ...chartDefaults().plugins.legend, position:'right' },
          tooltip: { ...chartDefaults().plugins.tooltip,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)} Kt (${(ctx.parsed/groupTotals.reduce((a,b)=>a+b,0)*100).toFixed(1)}%)` } } }
      }
    });
  }

  // Manufacturing fuel mix stacked bar
  const mfgRows = fc.filter(r => r.group === 'Manufacturing');
  const ctxM = document.getElementById('mfgFuelChart');
  if (ctxM && !mfgFuelInst) {
    mfgFuelInst = new Chart(ctxM, {
      type: 'bar',
      data: {
        labels: mfgRows.map(r => r.name.replace('Non-Metallic Minerals (incl. Cement)','Non-Met. Minerals').replace('Commercial/Institutional Services','Services')),
        datasets: [
          { label: 'Liquid fuels', data: mfgRows.map(r => r.liquid),
            backgroundColor:withChartAlpha(c.semantic.metal, 'cc'), stack:'a', borderRadius:2 },
          { label: 'Solid fuels', data: mfgRows.map(r => r.solid),
            backgroundColor:withChartAlpha(c.semantic.nonEnergy, 'cc'), stack:'a', borderRadius:2 },
          { label: 'Gas fuels', data: mfgRows.map(r => r.gas),
            backgroundColor:withChartAlpha(c.semantic.mineral, 'cc'), stack:'a', borderRadius:2 },
          { label: 'Biomass', data: mfgRows.map(r => r.biomass),
            backgroundColor:withChartAlpha(c.semantic.chemical, 'cc'), stack:'a', borderRadius:2 },
        ]
      },
      options: {
        ...chartDefaults(), responsive:true, maintainAspectRatio:false,
        plugins: { ...chartDefaults().plugins, legend:{ ...chartDefaults().plugins.legend, position:'bottom' } },
        scales: {
          x: { ...chartDefaults().scales.x, stacked:true, ticks:{ ...chartDefaults().scales.x.ticks, maxRotation:40, font:{size:9} } },
          y: { ...chartDefaults().scales.y, stacked:true, title:{ display:true, text:'Kt CO₂eq', color:c.textMuted, font:{size:11} } }
        }
      }
    });
  }

  // Full fuel combustion table
  buildFuelCombustionTable();
}

function buildFuelCombustionTable() {
  const tbl = document.getElementById('fuelCombustionTable');
  if (!tbl || tbl.innerHTML) return;
  const fc = DB.fuel_combustion_2023;
  const cols = ['CRF Code','Sub-sector','Total','Liquid','Solid','Gas','Other (waste)','Biomass*'];
  const head = `<thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>`;
  let curGroup = '';
  const bodyRows = fc.map(r => {
    let groupRow = '';
    if (r.group !== curGroup) {
      curGroup = r.group;
      const groupLabels = {Energy:'1.A.1 Energy Industries',Manufacturing:'1.A.2 Manufacturing Industry',Transport:'1.A.3 Transport',Other:'1.A.4 Other Sectors'};
      groupRow = `<tr class="tbl-group-row"><td colspan="8"><strong>${groupLabels[r.group]||r.group}</strong></td></tr>`;
    }
    const fmtV = v => (v === null || v === 0) ? '<span style="color:var(--text-faint)">—</span>' : typeof v === 'number' ? v.toFixed(2) : String(v);
    const isChemical = r.code === '1.A.2.c';
    const isRefinery = r.code === '1.A.1.b';
    const rowClass = isChemical ? ' class="tbl-highlight-green"' : isRefinery ? ' class="tbl-highlight-red"' : '';
    return groupRow + `<tr${rowClass}>
      <td><span class="badge badge-slate">${r.code}</span></td>
      <td style="font-size:0.8125rem">${r.name}</td>
      <td style="font-family:var(--font-mono);font-weight:600">${fmtV(r.total)}</td>
      <td style="font-family:var(--font-mono)">${fmtV(r.liquid)}</td>
      <td style="font-family:var(--font-mono)">${fmtV(r.solid)}</td>
      <td style="font-family:var(--font-mono)">${fmtV(r.gas)}</td>
      <td style="font-family:var(--font-mono)">${fmtV(r.waste)}</td>
      <td style="font-family:var(--font-mono)">${fmtV(r.biomass)}</td>
    </tr>`;
  }).join('');
  tbl.innerHTML = head + '<tbody>' + bodyRows + '</tbody>';
}

// ── UPDATE DASHBOARD CHARTS WITH OFFICIAL DATA ──
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDatasetNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  const locale = getLanguage() === 'bg' ? 'bg-BG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function formatDatasetPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  return `${formatDatasetNumber(value, digits)}%`;
}

function buildDatasetTable(headers, rows, className = '') {
  const classes = ['data-table'];
  if (className) classes.push(className);
  const head = `<thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>`;
  const body = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table class="${classes.join(' ')}">${head}<tbody>${body}</tbody></table></div>`;
}

function getDatasetCopy() {
  if (getLanguage() === 'bg') {
    return {
      stats: {
        tables: 'Таблици',
        coverage: 'Обхват',
        companies: 'Компании',
        fuelRows: 'Горивни редове'
      },
      snapshot: {
        kicker: 'Снимка на данните',
        title: 'Текущи стойности за 2023',
        desc: 'Национален и IPPU срез на данните, използвани в таблото.',
        nationalTitle: 'Национален инвентар 2023',
        nationalSub: 'Основни категории емисии и дял от брутните положителни емисии.',
        ippuTitle: 'IPPU разбивка 2023',
        ippuSub: 'Сектор 2 Industrial Processes and Product Use.',
        headers: ['Категория', 'Стойност (Kt CO2eq)', 'Дял']
      },
      historical: {
        kicker: 'Исторически редове',
        title: 'Времеви серии 2010-2023',
        desc: 'Пълни таблични серии за индустриалните емисии и под-секторите.',
        ippuTitle: 'IPPU история',
        ippuSub: 'Годишни тотали и под-сектори от националния инвентар.',
        subsecTitle: 'Индустриални под-сектори',
        subsecSub: 'Енергийни и процесни емисии по ключови производства.'
      },
      operational: {
        kicker: 'Оперативни данни',
        title: 'Фирми и горивни профили',
        desc: 'Структурирана справка за компаниите в приложението и горивното разбиване за 2023.',
        companyTitle: 'Фирмен регистър',
        companySub: 'Локация, сектор, зрялост и CRF привързване.',
        fuelTitle: 'Горивно горене 2023',
        fuelSub: 'Редовете от Сектор 1.A с разбивка по вид гориво.',
        companyHeaders: ['Компания', 'Локация', 'Сектор', 'Зрялост', 'Служители', 'CRF'],
        fuelHeaders: ['Код', 'Под-сектор', 'Група', 'Общо', 'Течни', 'Твърди', 'Газ', 'Отпадък', 'Биомаса']
      },
      labels: {
        energy: 'Енергетика',
        ippu: 'IPPU',
        agri: 'Земеделие',
        waste: 'Отпадъци',
        lulucf: 'LULUCF',
        mineral: 'Минерална индустрия',
        chemical: 'Химическа индустрия',
        metal: 'Метална индустрия',
        nonenergy: 'Неенергийни продукти',
        ods: 'ODS заместители',
        other: 'Други',
        year: 'Година',
        total: 'Общо',
        petroleum: 'Нефтопреработване 1.A.1.b',
        chemicals: 'Химическа индустрия 1.A.2.c',
        pulp: 'Целулоза и хартия 1.A.2.d',
        lime: 'Вар 2.A.2',
        clinker: 'Клинкер 2.A.1',
        sodaAshProcess: 'Сода аш процес 2.A.4.b',
        carbonate: 'Карбонати 2.A.4.d',
        ammonia: 'Амоняк 2.B.1',
        sodaAsh: 'Сода аш 2.B.7',
        nitric: 'Азотна киселина 2.B.2',
        advanced: 'Напреднал',
        progressing: 'Напредващ',
        early: 'Начален',
        manufacturing: 'Производство',
        transport: 'Транспорт',
        otherGroup: 'Други',
        shareIppu: 'Дял от IPPU',
        sourceNote: 'Всички таблици се генерират директно от in-app dataset и фирмения регистър в app.js.'
      }
    };
  }

  return {
    stats: {
      tables: 'Tables',
      coverage: 'Coverage',
      companies: 'Companies',
      fuelRows: 'Fuel rows'
    },
    snapshot: {
      kicker: 'Dataset snapshot',
      title: 'Current values for 2023',
      desc: 'National and IPPU cuts of the data already used throughout the dashboard.',
      nationalTitle: 'National inventory 2023',
      nationalSub: 'Core emission categories and share of gross positive emissions.',
      ippuTitle: 'IPPU breakdown 2023',
      ippuSub: 'Sector 2 Industrial Processes and Product Use.',
      headers: ['Category', 'Value (Kt CO2eq)', 'Share']
    },
    historical: {
      kicker: 'Historical series',
      title: 'Time series 2010-2023',
      desc: 'Full tabular series for industrial emissions and key sub-sectors.',
      ippuTitle: 'IPPU history',
      ippuSub: 'Annual totals and sub-sectors from the national inventory.',
      subsecTitle: 'Industrial sub-sectors',
      subsecSub: 'Energy and process emissions by major production lines.'
    },
    operational: {
      kicker: 'Operational reference',
      title: 'Companies and fuel profiles',
      desc: 'Structured reference for the companies in the app and the 2023 fuel-combustion breakdown.',
      companyTitle: 'Company registry',
      companySub: 'Location, sector, maturity, and CRF mapping.',
      fuelTitle: 'Fuel combustion 2023',
      fuelSub: 'Sector 1.A rows with fuel-type breakdown.',
      companyHeaders: ['Company', 'Location', 'Sector', 'Maturity', 'Employees', 'CRF'],
      fuelHeaders: ['Code', 'Sub-sector', 'Group', 'Total', 'Liquid', 'Solid', 'Gas', 'Waste', 'Biomass']
    },
    labels: {
      energy: 'Energy',
      ippu: 'IPPU',
      agri: 'Agriculture',
      waste: 'Waste',
      lulucf: 'LULUCF',
      mineral: 'Mineral industry',
      chemical: 'Chemical industry',
      metal: 'Metal industry',
      nonenergy: 'Non-energy products',
      ods: 'ODS substitutes',
      other: 'Other',
      year: 'Year',
      total: 'Total',
      petroleum: 'Petroleum refining 1.A.1.b',
      chemicals: 'Chemical industry 1.A.2.c',
      pulp: 'Pulp and paper 1.A.2.d',
      lime: 'Lime 2.A.2',
      clinker: 'Clinker 2.A.1',
      sodaAshProcess: 'Soda ash process 2.A.4.b',
      carbonate: 'Carbonate use 2.A.4.d',
      ammonia: 'Ammonia 2.B.1',
      sodaAsh: 'Soda ash 2.B.7',
      nitric: 'Nitric acid 2.B.2',
      advanced: 'Advanced',
      progressing: 'Progressing',
      early: 'Early',
      manufacturing: 'Manufacturing',
      transport: 'Transport',
      otherGroup: 'Other',
      shareIppu: 'Share of IPPU',
      sourceNote: 'All tables are generated directly from the in-app dataset and company registry in app.js.'
    }
  };
}

function renderDatasetTables() {
  const statsEl = document.getElementById('datasetStats');
  const contentEl = document.getElementById('datasetContent');
  if (!statsEl || !contentEl) return;

  const copy = getDatasetCopy();
  const grossPositive = Object.values(DB.nat_2023).reduce((sum, value) => sum + (value > 0 ? value : 0), 0);
  const ippuTotal = Object.values(DB.ippu_2023).reduce((sum, value) => sum + value, 0);
  const firstYear = DB.ippu_hist[0]?.year;
  const lastYear = DB.ippu_hist[DB.ippu_hist.length - 1]?.year;
  const maturityLabels = {
    advanced: copy.labels.advanced,
    progressing: copy.labels.progressing,
    early: copy.labels.early
  };
  const groupLabels = {
    Energy: copy.labels.energy,
    Manufacturing: copy.labels.manufacturing,
    Transport: copy.labels.transport,
    Other: copy.labels.otherGroup
  };

  statsEl.innerHTML = [
    { value: '6', label: copy.stats.tables },
    { value: `${firstYear}-${lastYear}`, label: copy.stats.coverage },
    { value: String(companies.length), label: copy.stats.companies },
    { value: String(DB.fuel_combustion_2023.length), label: copy.stats.fuelRows }
  ].map(item => `
    <div class="dataset-stat">
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join('');

  const nationalRows = [
    [copy.labels.energy, formatDatasetNumber(DB.nat_2023.energy), formatDatasetPercent((DB.nat_2023.energy / grossPositive) * 100)],
    [copy.labels.ippu, formatDatasetNumber(DB.nat_2023.ippu), formatDatasetPercent((DB.nat_2023.ippu / grossPositive) * 100)],
    [copy.labels.agri, formatDatasetNumber(DB.nat_2023.agri), formatDatasetPercent((DB.nat_2023.agri / grossPositive) * 100)],
    [copy.labels.waste, formatDatasetNumber(DB.nat_2023.waste), formatDatasetPercent((DB.nat_2023.waste / grossPositive) * 100)],
    [copy.labels.lulucf, formatDatasetNumber(DB.nat_2023.lulucf), formatDatasetPercent((DB.nat_2023.lulucf / grossPositive) * 100)]
  ].map(row => row.map(cell => escapeHtml(cell)));

  const ippuSnapshotRows = [
    ['2.A', copy.labels.mineral, formatDatasetNumber(DB.ippu_2023['2.A Mineral Industry']), formatDatasetPercent((DB.ippu_2023['2.A Mineral Industry'] / ippuTotal) * 100)],
    ['2.B', copy.labels.chemical, formatDatasetNumber(DB.ippu_2023['2.B Chemical Industry']), formatDatasetPercent((DB.ippu_2023['2.B Chemical Industry'] / ippuTotal) * 100)],
    ['2.C', copy.labels.metal, formatDatasetNumber(DB.ippu_2023['2.C Metal Industry']), formatDatasetPercent((DB.ippu_2023['2.C Metal Industry'] / ippuTotal) * 100)],
    ['2.D', copy.labels.nonenergy, formatDatasetNumber(DB.ippu_2023['2.D Non-energy Products']), formatDatasetPercent((DB.ippu_2023['2.D Non-energy Products'] / ippuTotal) * 100)],
    ['2.F', copy.labels.ods, formatDatasetNumber(DB.ippu_2023['2.F ODS Substitutes']), formatDatasetPercent((DB.ippu_2023['2.F ODS Substitutes'] / ippuTotal) * 100)],
    ['2.G', copy.labels.other, formatDatasetNumber(DB.ippu_2023['2.G Other']), formatDatasetPercent((DB.ippu_2023['2.G Other'] / ippuTotal) * 100)]
  ].map(row => row.map(cell => escapeHtml(cell)));

  const ippuHistoryHeaders = [
    copy.labels.year,
    copy.labels.total,
    copy.labels.mineral,
    copy.labels.chemical,
    copy.labels.metal,
    copy.labels.nonenergy,
    copy.labels.ods,
    copy.labels.other
  ];
  const ippuHistoryRows = DB.ippu_hist.map(row => [
    escapeHtml(String(row.year)),
    escapeHtml(formatDatasetNumber(row.total)),
    escapeHtml(formatDatasetNumber(row.mineral)),
    escapeHtml(formatDatasetNumber(row.chemical)),
    escapeHtml(formatDatasetNumber(row.metal)),
    escapeHtml(formatDatasetNumber(row.nonenergy)),
    escapeHtml(formatDatasetNumber(row.ods)),
    escapeHtml(formatDatasetNumber(row.other))
  ]);

  const subsectorHeaders = [
    copy.labels.year,
    copy.labels.petroleum,
    copy.labels.chemicals,
    copy.labels.pulp,
    copy.labels.lime,
    copy.labels.clinker,
    copy.labels.sodaAshProcess,
    copy.labels.carbonate,
    copy.labels.ammonia,
    copy.labels.sodaAsh,
    copy.labels.nitric
  ];
  const subsectorRows = DB.subsec_hist.map(row => [
    escapeHtml(String(row.year)),
    escapeHtml(formatDatasetNumber(row.petroleum_refining_1a1b)),
    escapeHtml(formatDatasetNumber(row.chemicals_1a2c)),
    escapeHtml(formatDatasetNumber(row.pulp_paper_1a2d)),
    escapeHtml(formatDatasetNumber(row.lime_2a2)),
    escapeHtml(formatDatasetNumber(row.clinker_2a1)),
    escapeHtml(formatDatasetNumber(row.soda_ash_process_2a4b)),
    escapeHtml(formatDatasetNumber(row.carbonate_desox_2a4d)),
    escapeHtml(formatDatasetNumber(row.ammonia_2b1)),
    escapeHtml(formatDatasetNumber(row.soda_ash_2b7)),
    escapeHtml(formatDatasetNumber(row.nitric_acid_2b2))
  ]);

  const companyRows = companies.map(company => [
    escapeHtml(company.name),
    escapeHtml(company.location),
    escapeHtml(company.sector),
    escapeHtml(maturityLabels[company.maturity] || company.maturity),
    escapeHtml(company.employees),
    escapeHtml(company.crf)
  ]);

  const fuelRows = DB.fuel_combustion_2023.map(row => [
    escapeHtml(row.code),
    escapeHtml(row.name),
    escapeHtml(groupLabels[row.group] || row.group),
    escapeHtml(formatDatasetNumber(row.total)),
    escapeHtml(formatDatasetNumber(row.liquid)),
    escapeHtml(formatDatasetNumber(row.solid)),
    escapeHtml(formatDatasetNumber(row.gas)),
    escapeHtml(formatDatasetNumber(row.waste)),
    escapeHtml(formatDatasetNumber(row.biomass))
  ]);

  contentEl.innerHTML = `
    <div class="card dataset-block">
      <div class="card-head">
        <div>
          <div class="dataset-kicker">${escapeHtml(copy.snapshot.kicker)}</div>
          <div class="card-title">${escapeHtml(copy.snapshot.title)}</div>
          <div class="card-sub">${escapeHtml(copy.snapshot.desc)}</div>
        </div>
      </div>
      <div class="dataset-grid-2">
        <div class="dataset-panel">
          <div class="dataset-panel-title">${escapeHtml(copy.snapshot.nationalTitle)}</div>
          <div class="dataset-panel-sub">${escapeHtml(copy.snapshot.nationalSub)}</div>
          ${buildDatasetTable(copy.snapshot.headers, nationalRows, 'dataset-table-compact')}
        </div>
        <div class="dataset-panel">
          <div class="dataset-panel-title">${escapeHtml(copy.snapshot.ippuTitle)}</div>
          <div class="dataset-panel-sub">${escapeHtml(copy.snapshot.ippuSub)}</div>
          ${buildDatasetTable(['Code', copy.snapshot.headers[0], copy.snapshot.headers[1], copy.labels.shareIppu], ippuSnapshotRows, 'dataset-table-compact')}
        </div>
      </div>
    </div>

    <div class="card dataset-block">
      <div class="card-head">
        <div>
          <div class="dataset-kicker">${escapeHtml(copy.historical.kicker)}</div>
          <div class="card-title">${escapeHtml(copy.historical.title)}</div>
          <div class="card-sub">${escapeHtml(copy.historical.desc)}</div>
        </div>
      </div>
      <div class="dataset-panel">
        <div class="dataset-panel-title">${escapeHtml(copy.historical.ippuTitle)}</div>
        <div class="dataset-panel-sub">${escapeHtml(copy.historical.ippuSub)}</div>
        ${buildDatasetTable(ippuHistoryHeaders, ippuHistoryRows, 'dataset-table-wide')}
      </div>
      <div class="dataset-panel mt-4">
        <div class="dataset-panel-title">${escapeHtml(copy.historical.subsecTitle)}</div>
        <div class="dataset-panel-sub">${escapeHtml(copy.historical.subsecSub)}</div>
        ${buildDatasetTable(subsectorHeaders, subsectorRows, 'dataset-table-xwide')}
      </div>
    </div>

    <div class="card dataset-block">
      <div class="card-head">
        <div>
          <div class="dataset-kicker">${escapeHtml(copy.operational.kicker)}</div>
          <div class="card-title">${escapeHtml(copy.operational.title)}</div>
          <div class="card-sub">${escapeHtml(copy.operational.desc)}</div>
        </div>
      </div>
      <div class="dataset-panel">
        <div class="dataset-panel-title">${escapeHtml(copy.operational.companyTitle)}</div>
        <div class="dataset-panel-sub">${escapeHtml(copy.operational.companySub)}</div>
        ${buildDatasetTable(copy.operational.companyHeaders, companyRows, 'dataset-table-wide')}
      </div>
      <div class="dataset-panel mt-4">
        <div class="dataset-panel-title">${escapeHtml(copy.operational.fuelTitle)}</div>
        <div class="dataset-panel-sub">${escapeHtml(copy.operational.fuelSub)}</div>
        ${buildDatasetTable(copy.operational.fuelHeaders, fuelRows, 'dataset-table-wide')}
      </div>
      <div class="dataset-note">${escapeHtml(copy.labels.sourceNote)}</div>
    </div>
  `;
}

function updateDashboardWithDbData() {
  const c = getChartColors();

  // Update IPPU pie on dashboard with official 2023 data
  if (charts.ipuPie) {
    const labels = Object.keys(DB.ippu_2023);
    charts.ipuPie.data.labels = labels;
    charts.ipuPie.data.datasets[0].data = Object.values(DB.ippu_2023);
    charts.ipuPie.data.datasets[0].backgroundColor = labels.map(getIppuColorForLabel);
    charts.ipuPie.data.datasets[0].borderColor = c.segmentBorder;
    charts.ipuPie.update();
  }

  // Update emissions trend chart with official 1.a.2.c data (chemical industry energy)
  if (charts.emissionsTrend) {
    const trend = DB.chemical_industry_emissions_trend;
    charts.emissionsTrend.data.labels = trend.map(d => String(d.year));
    charts.emissionsTrend.data.datasets[0].data = trend.map(d => d.value);
    charts.emissionsTrend.data.datasets[0].label = 'Chemical Industry Emissions (Kt CO₂eq)';
    charts.emissionsTrend.data.datasets[0].borderColor = c.semantic.chemical;
    charts.emissionsTrend.data.datasets[0].backgroundColor = withChartAlpha(c.semantic.chemical, '18');
    charts.emissionsTrend.options.plugins.title = { display:false };
    charts.emissionsTrend.update();
  }
}



// updateDashboardWithDbData called from core DOMContentLoaded





