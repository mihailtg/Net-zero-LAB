# vendor/

Third-party libraries vendored (checked into this repo) instead of loaded from a CDN, so protected/gated dashboard sections don't depend on a third-party host being reachable.

## plotly-2.35.2.min.js

- **Source:** [Plotly.js](https://github.com/plotly/plotly.js), distributed via the `plotly.js-dist-min` npm package.
- **Version:** 2.35.2
- **License:** MIT - see the [upstream LICENSE](https://github.com/plotly/plotly.js/blob/master/LICENSE) file. Plotly.js itself bundles several MIT/BSD-licensed dependencies; see the upstream repository for the full third-party notice.
- **Why vendored:** used by the Cluster Analysis and Industrial Geography modules; `tests/cluster-browser.test.js` asserts it stays local so those charts don't depend on a CDN.

Chart.js and its annotation plugin are, by contrast, still loaded from a CDN (`cdn.jsdelivr.net`) in `index.html` - see the README's "Known limitations" section.

To update: replace this file with a newer `plotly.js-dist-min` build and bump the version in both this note and the `<script src="vendor/plotly-...">` tag in `index.html`.
