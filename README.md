# Net-Zero Lab

A bilingual (EN/BG) dashboard tracking the decarbonization of Bulgaria's chemical and industrial sector toward net-zero by 2050. Built by the [Net-Zero Lab](https://netzerolab-feba.bg/) research unit at FEBA, Sofia University, for policymakers, industry analysts, EU funding bodies, and investors following Bulgaria's industrial transition.

It combines official inventory data (UNFCCC CRF national GHG inventory, EU ETS registry) with sourced, company-level detail on chemical/industrial companies including Agropolychim, Neochim, Solvay Sodi Bulgaria, Holcim Bulgaria, Heidelberg Materials, LUKOIL Neftohim Burgas, Biovet/Huvepharma, Orgachim, and Agria, plus scenario modeling for cluster-level decarbonization pathways.

## What's in the dashboard

- **Overview** - headline KPIs, emissions trend, EU ETS progress, roadmap to 2050
- **Companies** - the same active roster as Cluster Analysis: installation and company profiles, with existing detailed profiles retained and additional profiles built from the sourced cluster dataset. Missing data and unassessed maturity are labelled explicitly.
- **Pathways** - green hydrogen, CCUS, electrification, biomass, circular economy, N₂O abatement
- **Emissions** - IPPU history through 2024, with the supplied correction of the 2023 total to 3,925.62 kt CO₂eq and the final supplied 2024 total of 4,096.25 kt CO₂eq. All eight 2024 categories are retained; `NO` and `IE,NA` remain reporting notations rather than numerical zeros. The historical 2023 category breakdown has not been reallocated to force agreement with its corrected total; the 69.97 kt difference is disclosed. Detailed industrial sub-sectors and fuel data retain their original 2023 coverage. The embedded inventory and `db_data.json` are synchronized.
- **Dataset** - tabular views of the underlying source data
- **Infographics** - 14 bilingual vector posters covering national and process emissions, historical trends, the six planning regions, participants, technology pathways, hydrogen/ammonia, CCUS, CBAM, carbon prices, investment scale, Bulgaria’s 2012–2025 installation-allowance auction revenues (aviation excluded) and unordered scenarios. The regional choropleth maps the 20 verified 2024 ETS installations onto the six planning regions, with quantities and shares of that dataset's total; it does not represent all Bulgarian emissions. Posters read the dashboard datasets and default scenario model directly, label estimates and assumptions, and offer an accessible large view, SVG/PNG downloads and print/PDF. Changing the gallery language updates an open poster too. Exports use the current language; scenario posters use default settings rather than saved custom scenarios.

The regional infographic bundles Eurostat/GISCO NUTS 2021 boundaries at 1:10 million in `bulgaria-regions.js` (EPSG:4326, coordinates rounded to six decimal places). © EuroGeographics for the administrative boundaries. This third-party geography is excluded from the code's MIT licence and is subject to the [GISCO statistical-unit terms](https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units), including attribution and non-commercial use.

The auction-revenue poster combines the 14 reported annual revenues for 2012–2025 with a full table of the supplied weighted prices and total auction quantities, including the interim snapshot at 16 November 2026. Price and quantity inputs cover all allowances, including aviation; historical revenue excludes aviation. The historical total remains €6,442,877,969 and excludes the 2026 forecast. The 2013 cash-receipt value includes €388,700 from the exceptional sale of remaining 2012 allowances in 2013; this reconciliation is stated in the poster. All 14 report links are available in the detail view and embedded in the SVG metadata.

The separately hatched 2026 column is a conditional full-year estimate of approximately €720.4M, not a reported installation-revenue figure: €79.47 × 8,014,500 allowances × 365/320 calendar days × (829,233,344 / 836,182,380). It assumes constant price and daily auction volume, ignores seasonality, and uses the 2025 non-aviation revenue share because no separate 2026 figure is supplied. The 2026 snapshot is user-provided, not independently verified against a current report. `estimateAuctionRevenue()` exposes the calculation and assumptions. Shareable BG/EN SVGs are 1200×1680; PNGs are 2400×3360 in `assets/infographics/`. The gallery contains the tall preview, PNG exports retain its full height, and print/PDF uses a portrait page.
- **Policy & Regulation** - the EU/Bulgarian regulatory framework (ETS, CBAM, IED, NECP)
- **ROI Analysis** - avoided ETS cost vs. decarbonization investment, by pathway and company
- **Investments** - a technology-portfolio CAPEX/abatement screening model (hydrogen, CCS, nuclear)
- **CBAM & ETS Cost Calculator** - carbon-cost exposure estimator by company and product
- **Cluster Analysis** *(preview)* - a scenario/Monte Carlo simulation engine for cluster-level pathways
- **Industrial Geography** *(preview)* - a map of Bulgaria's industrial ETS Top 20 and shared infrastructure

The two sections marked *preview* are still being developed. All sections, simulation controls, and scenario editing are available directly, without access codes. Scenario edits are saved locally in the browser.

## Running it locally

This is a static site - no build step, no server required.

```
git clone https://github.com/mihailtg/Net-zero-LAB.git
cd Net-zero-LAB
```

Then open `index.html` directly in a browser, or serve the folder with anything that serves static files (e.g. `npx serve .`) if you'd rather not use `file://` URLs.

**Requirements:** `vendor/plotly-2.35.2.min.js` must be present (it's checked into the repo - see `vendor/README.md`). Chart.js and its annotation plugin load from `cdn.jsdelivr.net`; if that CDN is blocked, chart-heavy sections will show a banner explaining that charts couldn't load.

## Development

Temporarily inactive companies are controlled by `HIDDEN_COMPANY_IDS` in `cluster-data.js`. Svilosa is currently hidden from profiles, narrative examples, calculators, project charts, exports, and cluster scenarios. Its source records are retained: remove `svilosa` from that list to restore it. Historical national inventory series remain intact and use sector labels rather than the hidden company's name.

```
npm run check   # node --check syntax validation across all JS files
npm test        # the test suite (node's built-in test runner, no dependencies)
```

`npm test` runs `tests/*.test.js`, which cover the Cluster Analysis simulation model, the Cluster/Industrial-Geography browser wiring, and the Industrial Geography/Infrastructure/Investment modules - scenario math, Monte Carlo bounds, i18n key parity, CAPEX/emissions reconciliation, and more.

## Data sources

The shared company directory is produced by `ClusterData.createCompanyRoster()` from the existing company profiles and `company-registry-2025.js`. It contains 56 visible entries: 52 records from the supplied 2025 operator table and four retained profiles without supplied 2025 figures. Svilosa remains in the source but is hidden by the existing visibility setting. BA Glass's two records refer to Plovdiv (104,645 t / 76,129 EUA) and Sofia (53,901 t / 49,128 EUA).

2025 verified emissions and free allowances are transcribed from the project owner's table, separately from the 2024 installation values. Empty emissions are `null`; reported zeros remain zero. Operator names and installation aliases are separate. Geography uses approximate settlement/industrial-zone locations with source links, and offers year and main-activity filters plus grouping by activity. The infrastructure and scenario models retain their assessed 2024 baseline; new directory entries receive no invented model scores.

- **UNFCCC CRF national GHG inventory** (Bulgaria) - the Emissions and Dataset tabs
- **EU ETS registry** - installation-level emissions and allowances
- **European Commission** and **Bulgaria's Ministry of Environment and Water (MoEW)** - policy and regulatory content
- **CEFIC** (European Chemical Industry Council) - sector structural statistics
- **EBRD** and **EIB** (2025 survey) - financing and investment context
- Individual **company disclosures and technical documents** - cited inline wherever used (look for "Source:" notes on cards and tables)

Numbers that come from company documents or modeling assumptions rather than an official inventory are flagged as such where they appear. Where a figure could not be fully reconciled against the official inventory, an inline note says so rather than presenting it as settled.

## Known limitations

- The CBAM Exposure tab (under Emissions) is an intentional placeholder while that analysis is rebuilt.
- The EN/BG switch covers static dashboard content, company profiles, calculators, chart labels and tooltips. Original source titles, brands, technical acronyms, and formula identifiers may retain their original spelling. Legacy content translations are maintained in `core-i18n-bg.js`; `core-i18n.js` restores the original English text when switching back and translates newly rendered content without replacing form controls.
- This is a static, client-side app: all data ships in the page source, and there is no backend.

## License

Code: MIT - see [LICENSE](LICENSE). Third-party data is not owned by this project - see Data sources above and the individual citations throughout the app.
