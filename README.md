# Daily Insights Dashboard

A lightweight, config-driven, open-source dashboard engine that turns daily file-based
data feeds (CSV, TSV, JSON) into interactive dashboards — with zero build tooling,
zero server-side processing, and near-zero hosting cost.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<!-- TODO: add a screenshot or GIF here once the project has branding applied -->
<!-- ![Dashboard screenshot](assets/screenshot.png) -->

## Why this project?

- **File-based insights in, dashboards out.** Drop a CSV, TSV or JSON file into the
  `data/` folder, write one small config file, and you have a dashboard with cards,
  charts, filters and drill-downs.
- **No build step.** Plain HTML/CSS/ES modules. No npm install, no bundler, no
  framework lock-in. Clone it, serve it, done.
- **No backend.** All parsing, aggregation and rendering happens in the browser.
  Host it anywhere static files can live: GitHub Pages, Netlify, Azure Storage —
  for free (or pennies).
- **Dashboards are config, not code.** Each dashboard is a single self-contained
  JavaScript file declaring its data source, filters, cards and charts. Adding a
  chart means adding one object to an array.

## Features

- 📊 **Cards, bar charts, line charts, doughnut/pie charts** (via Chart.js)
- 🔍 **Free-text search** across all (or selected) columns, with debounced live filtering
- 🎛 **Dropdown filters** — auto-populated from the data, or pinned to known values
- 🖱 **Drill-down navigation** — click a bar/segment to jump to a detail dashboard
  with that value pre-applied (shareable URLs, working back button)
- 🎨 **Theming** — light/dark themes, colour palette, logo, app name, currency and
  locale from a single config file; live theme switching
- 🧩 **Multi-format feeds** — CSV and TSV (with header rows) and JSON (nested
  attributes are flattened to dot-paths like `geo.country`)
- 🔢 **Aggregations** — sum, average, min, max, count; Top-N with automatic
  "Other" bucketing; chronological sorting for date labels
- 📱 **Responsive** — usable on desktop and mobile browsers

## Quick start

**Prerequisites:** any modern browser, and any way to serve static files over HTTP
(opening `index.html` via `file://` will **not** work — ES modules and `fetch`
require an HTTP origin).

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>

# Option A: Python (pre-installed on macOS/Linux)
python3 -m http.server 8080

# Option B: Node.js
npx serve .
```

Then open <http://localhost:8080>. You'll see four sample dashboards powered by the
sample feeds in `data/`.

## Project structure

```
├── index.html                  App shell (loads the two CDN libraries + the engine)
├── netlify.toml                One-line Netlify config (publish root, no build)
├── assets/logo.svg             Placeholder logo — replace with your brand
├── css/styles.css              Themeable styles (CSS variables set from config)
├── config/theme.config.js      ✏️ Branding, themes, currency, locale
├── data/                       ✏️ Your daily data feeds live here
│   ├── insights.csv            (sample)
│   ├── metrics.tsv             (sample)
│   └── devices.json            (sample)
├── dashboards/                 ✏️ One self-contained file per dashboard
│   ├── index.js                ✏️ Dashboard registry (nav entries)
│   ├── overview.js             (sample: CSV feed + drill-down source)
│   ├── region-detail.js        (sample: drill-down target)
│   ├── channel-metrics.js      (sample: TSV feed)
│   └── device-usage.js         (sample: JSON feed with nested attributes)
└── js/                         The engine — you rarely need to touch these
    ├── main.js                 Hash router + render pipeline
    ├── dataLoader.js           CSV/TSV/JSON loading (Papa Parse + JSON flattening)
    ├── aggregator.js           Filtering, grouping, aggregation, formatting
    ├── filters.js              Search box, dropdowns, drill-down chips
    ├── chartFactory.js         Chart.js tile rendering + drill-down clicks
    ├── theme.js                Theme/branding application
    └── util.js                 Tiny DOM helpers
```

✏️ = the files you'll actually edit day-to-day.

## Adding a data feed

1. Drop the file into `data/` (or reference an external URL — see *External feeds* below).
2. Reference it from a dashboard definition.

**Feed requirements:**

| Format | Rules |
|---|---|
| `.csv` | First row must be column headers. Numbers are auto-detected. |
| `.tsv` | Tab-separated, first row must be column headers. |
| `.json` | An array of objects (or a single object). Nested objects are flattened to dot-path keys — `{"geo": {"country": "UK"}}` becomes a `geo.country` column you can group/filter on. Arrays of primitives are joined with `" \| "`. |

**Dates:** use ISO format (`YYYY-MM-DD`) in your feeds. Line charts sort date-like
labels chronologically; non-ISO formats such as `DD/MM/YYYY` are interpreted as US
`MM/DD` and will mis-sort.

**Freshness:** data files are fetched with a cache-busting query parameter, so a
daily upload is visible to every visitor immediately — no redeploy, no stale cache.

**Scale:** comfortably handles ~10,000 rows per file (parse ~100–200ms, cached per
session; charts only ever render aggregated categories, never raw rows). For much
larger files, pre-aggregate upstream in your daily pipeline.

**External feeds:** `source` can also be a full URL, e.g. a file in a public GitHub
repo (`https://raw.githubusercontent.com/<org>/<repo>/main/data/feed.csv`) — as long
as the host sends CORS headers (`raw.githubusercontent.com` does).

## Creating a dashboard

1. Create `dashboards/my-dashboard.js` (see schema below).
2. Register it in `dashboards/index.js`:

```js
export default [
  { id: 'overview', title: 'Overview' },
  { id: 'my-dashboard', title: 'My Dashboard' },              // appears in the nav
  { id: 'region-detail', title: 'Region Detail', nav: false } // drill-down only
];
```

### Dashboard definition schema

```js
export default {
  id: 'my-dashboard',                 // must match the filename (without .js)
  title: 'My Dashboard',
  source: 'data/my-feed.csv',         // .csv / .tsv / .json, or a full URL

  filters: [
    // Free-text search. 'columns' (optional) restricts which columns are searched.
    { type: 'search', placeholder: 'Search…', columns: ['Product', 'Region'] },
    // Dropdown. Values auto-derived from the data, or pin them with 'values'.
    { type: 'dropdown', column: 'Region', label: 'Region', values: ['EMEA', 'APAC'] }
  ],

  cards: [
    { label: 'Total Revenue', agg: 'sum', column: 'Revenue', format: 'currency' },
    { label: 'Records', agg: 'count' }   // 'count' needs no column
  ],

  charts: [
    {
      type: 'bar',                    // 'bar' | 'line' | 'doughnut' | 'pie'
      title: 'Revenue by Region',
      groupBy: 'Region',              // column (or JSON dot-path) to aggregate on
      agg: 'sum',                     // 'sum' | 'avg' | 'min' | 'max' | 'count'
      column: 'Revenue',              // numeric column (not needed for 'count')
      format: 'currency',             // 'number' | 'currency' | 'percent'
      topN: 10,                       // optional: cap categories, rest merged into "Other"
      sort: 'value',                  // 'value' (default) | 'label' (chronological for dates)
      drilldown: 'region-detail'      // optional: click an item → that dashboard,
                                      // with ?Region=<clicked value> pre-applied
    }
  ]
};
```

Notes:
- Doughnut/pie charts auto-cap at 12 segments (remainder merged into **Other**)
  unless you set `topN` yourself. Set `topN` on bar charts for high-cardinality columns.
- Drill-downs use hash URLs (`#/region-detail?Region=EMEA`), so they're shareable
  and the browser back button works. The applied value appears as a removable chip.
- Line charts default to label sorting (chronological for ISO dates); everything
  else defaults to descending value.

## Theming & branding

Everything visual lives in **`config/theme.config.js`**:

```js
export default {
  appName: 'Daily Insights',   // header + browser tab title
  logo: 'assets/logo.svg',     // local path or URL
  currency: 'AUD',             // used by format: 'currency'
  locale: 'en-AU',             // number/currency formatting ('' = visitor's browser)
  defaultTheme: 'light',
  themes: {
    light: { bg: '…', surface: '…', text: '…', muted: '…', border: '…',
             primary: '…', palette: ['#…', '#…', /* chart colours */] },
    dark:  { /* same keys */ }
  }
};
```

Add more themes by adding more keys to `themes` — they appear in the header's theme
switcher automatically. The visitor's choice is remembered (localStorage).

## Deployment

Everything is static — pick any of these (all free or near-free):

### GitHub Pages (free)
```bash
git push origin main
```
Then: repo **Settings → Pages → Deploy from a branch → `main` / `(root)`**.
Every push (code or data) redeploys automatically.

### Netlify (free tier)
Connect the Git repo in Netlify. `netlify.toml` already sets: no build command,
publish directory = root. Auto-deploys on every push.

### Azure Storage static website (pennies/month)
```bash
# One-time: enable the static website feature (creates the $web container)
az storage blob service-properties update \
  --account-name <account> --static-website --index-document index.html

# Deploy the app (run from the repo root)
azcopy login   # or append a SAS token to the destination URL
azcopy copy './*' 'https://<account>.blob.core.windows.net/$web' \
  --recursive --cache-control 'no-cache'

# Daily data push (only the feed folder)
azcopy copy './data/*' 'https://<account>.blob.core.windows.net/$web/data' \
  --overwrite=true --cache-control 'no-cache'
# or: azcopy sync './data' 'https://<account>.blob.core.windows.net/$web/data'
```
Notes: dashboard and data are same-origin, so no CORS setup is needed; hash routing
means no rewrite rules are needed; the static website endpoint is **publicly
readable** — don't publish sensitive data.

## External dependencies

This project has **no build-time dependencies** (no `package.json`, no `npm install`).
Two open-source libraries are loaded at **runtime** from the jsDelivr CDN, pinned to
exact versions in `index.html`:

| Library | Version | License | Purpose | Links |
|---|---|---|---|---|
| [Chart.js](https://www.chartjs.org) | 4.5.1 | [MIT](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md) | All charts (bar, line, doughnut/pie) | [GitHub](https://github.com/chartjs/Chart.js) |
| [Papa Parse](https://www.papaparse.com) | 5.7.0 | [MIT](https://github.com/mholt/PapaParse/blob/master/LICENSE) | CSV/TSV parsing | [GitHub](https://github.com/mholt/PapaParse) |

Current CDN references (in `index.html`):
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.7.0/papaparse.min.js"></script>
```

**Vendoring (optional):** if you'd rather not depend on a CDN, download both files
into a `vendor/` folder, update the two `<script>` tags, and include each library's
LICENSE file alongside (both are MIT, so this is the only requirement).

## Browser support

All evergreen browsers: Chrome, Edge, Firefox, Safari (desktop and mobile).
IE11 is not supported (nor is it by Chart.js 4).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Blank page, CORS/`fetch` errors | You opened `index.html` via `file://`. Serve over HTTP (see Quick start). |
| "No dashboard definition found" | `id` in the definition doesn't match the filename, or it's missing from `dashboards/index.js`. |
| Chart shows nothing / zeros | Column names in the definition must match data headers **exactly** (case-sensitive). |
| Line chart dates out of order | Feed dates aren't ISO (`YYYY-MM-DD`). |
| Data looks stale after an upload | The app cache-busts automatically — check the file itself actually updated at its URL. |

## Roadmap

Ideas being considered (contributions welcome):

- Date-range filter (last 7/30 days, custom range)
- "Data as of…" badge from a feed timestamp
- Raw-data table view (click a chart → see underlying rows)
- Nested JSON arrays-of-objects exploded into child rows
- Multi-dataset / stacked charts
- Optional [Apache ECharts](https://echarts.apache.org) (Apache-2.0) renderer for
  richer visualisations — **not currently a dependency**
- Vendored libraries + SRI hashes; automated tests for the aggregator/loader

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). In short: keep
dashboards config-driven, keep the engine dependency-free and build-free.

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).
You are free to use, copy, modify, merge, publish, distribute, sublicense and/or
sell copies of this software, with attribution.

Third-party libraries remain under their own licenses (both MIT) — see
[External dependencies](#external-dependencies).
