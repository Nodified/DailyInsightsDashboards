# Contributing

Thanks for your interest! This project deliberately stays simple:

- **No build step** — plain HTML/CSS/ES modules. Please don't add bundlers,
  transpilers or frameworks without discussing it in an issue first.
- **Dashboards are config** — new visualisations should be expressible through
  dashboard definition files wherever possible, not bespoke code.
- **Minimal dependencies** — the only runtime libraries are Chart.js and Papa
  Parse (both MIT, loaded via pinned CDN URLs in `index.html`).

## How to contribute

1. Fork the repo and create a branch (`git checkout -b feature/my-idea`).
2. Make your change. Test in at least two browsers (Chrome/Firefox or Safari).
3. Test with a ~10k-row feed if your change touches loading, filtering or aggregation.
4. Open a pull request describing the change and why it's needed.

## Reporting bugs

Open an issue with: browser + version, the dashboard definition, and (a sample of)
the data feed that reproduces the problem. Sanitise any sensitive data first.

## Code of conduct

Be kind, be constructive. That's it for now.
