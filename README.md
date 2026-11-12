# EconLab

Interactive economics graphs: supply and demand, taxes, subsidies, price controls,
monopoly, perfect competition, and more.

> **Status:** being rebuilt. EconLab began in 2024 as Smithenes, an AP Microeconomics
> graphing calculator backed by a Flask API that rendered static matplotlib images
> (archived in [`legacy/backend`](legacy/backend)). The new version runs entirely in
> the browser so graphs update in real time as curves are dragged.

## Development

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev          # start the dev server
npm test             # run unit tests
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # production build to dist/
```

**Windows note:** if every test suite fails with "Vitest failed to find the current
suite", the terminal's working directory probably has a lowercase drive letter
(`c:\...`), which makes Vitest load itself twice. Run `cd C:\path\to\project` with
an uppercase drive letter and try again.
