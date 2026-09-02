# Net-Zero Lab

A bilingual (EN/BG) dashboard tracking the decarbonization of Bulgaria's chemical and industrial sector toward net-zero by 2050. Built by the [Net-Zero Lab](https://netzerolab-feba.bg/) research unit at FEBA, Sofia University, for policymakers, industry analysts, EU funding bodies, and investors following Bulgaria's industrial transition.

It combines official inventory data (UNFCCC CRF national GHG inventory, EU ETS registry) with sourced, company-level detail on the nine chemical/industrial companies it tracks - Agropolychim, Neochim, Solvay Sodi Bulgaria, Svilosa, Holcim Bulgaria, Heidelberg Materials, LUKOIL Neftohim Burgas, Biovet/Huvepharma, and Orgachim - plus scenario modeling for cluster-level decarbonization pathways.

## What's in the dashboard

- **Overview** - headline KPIs, emissions trend, EU ETS progress, roadmap to 2050
- **Companies** - profiles and decarbonization status for the nine tracked companies
- **Pathways** - green hydrogen, CCUS, electrification, biomass, circular economy, N₂O abatement
- **Emissions** - the official UNFCCC CRF inventory (2010-2023), by sub-sector and by fuel
- **Dataset** - tabular views of the underlying source data
- **Policy & Regulation** - the EU/Bulgarian regulatory framework (ETS, CBAM, IED, NECP)
- **ROI Analysis** - avoided ETS cost vs. decarbonization investment, by pathway and company
- **Investments** - a technology-portfolio CAPEX/abatement screening model (hydrogen, CCS, nuclear)
- **CBAM & ETS Cost Calculator** - carbon-cost exposure estimator by company and product
- **Cluster Analysis** *(preview)* - a scenario/Monte Carlo simulation engine for cluster-level pathways
- **Industrial Geography** *(preview)* - a map of Bulgaria's industrial ETS Top 20 and shared infrastructure

The two sections marked *preview* sit behind a same-day access code while they're being finished. That code is a soft gate, not a security control - the client-side source is public, as it has to be for a static site. Contact the Net-Zero Lab team for the current code.

## Running it locally

This is a static site - no build step, no server required.

```
git clone https://github.com/mihailtg/Net-zero-LAB.git
cd Net-zero-LAB
```

Then open `index.html` directly in a browser, or serve the folder with anything that serves static files (e.g. `npx serve .`) if you'd rather not use `file://` URLs.

**Requirements:** `vendor/plotly-2.35.2.min.js` must be present (it's checked into the repo - see `vendor/README.md`). Chart.js and its annotation plugin load from `cdn.jsdelivr.net`; if that CDN is blocked, chart-heavy sections will show a banner explaining that charts couldn't load.

## Development

```
npm run check   # node --check syntax validation across all JS files
npm test        # the test suite (node's built-in test runner, no dependencies)
```

`npm test` runs `tests/*.test.js`, which cover the Cluster Analysis simulation model, the Cluster/Industrial-Geography browser wiring, and the Industrial Geography/Infrastructure/Investment modules - scenario math, Monte Carlo bounds, i18n key parity, CAPEX/emissions reconciliation, and more.

## Data sources

- **UNFCCC CRF national GHG inventory** (Bulgaria) - the Emissions and Dataset tabs
- **EU ETS registry** - installation-level emissions and allowances
- **European Commission** and **Bulgaria's Ministry of Environment and Water (MoEW)** - policy and regulatory content
- **CEFIC** (European Chemical Industry Council) - sector structural statistics
- **EBRD** and **EIB** (2025 survey) - financing and investment context
- Individual **company disclosures and technical documents** - cited inline wherever used (look for "Source:" notes on cards and tables)

Numbers that come from company documents or modeling assumptions rather than an official inventory are flagged as such where they appear. Where a figure could not be fully reconciled against the official inventory, an inline note says so rather than presenting it as settled.

## Known limitations

- The CBAM Exposure tab (under Emissions) is an intentional placeholder while that analysis is rebuilt.
- Bilingual coverage is deepest in the Cluster Analysis, Industrial Geography, Industrial Infrastructure, and Investments modules; some of the original dashboard's static content is still English-only.
- This is a static, client-side app: all data ships in the page source, and there is no backend.

## License

Code: MIT - see [LICENSE](LICENSE). Third-party data is not owned by this project - see Data sources above and the individual citations throughout the app.
