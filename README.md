# Space Articles

An Angular 22 application for browsing and filtering articles from the
[Spaceflight News API](https://api.spaceflightnewsapi.net/v4/), using Angular Material
and NgRx SignalStore.

## Requirements

- Node.js 24 LTS, version **24.15.0 or newer** within the 24.x release line.
- npm, as bundled with Node.js 24.

The `.nvmrc` file selects Node.js 24 for compatible version managers and CI. Install
the current Node.js 24 LTS release if your local version is older than 24.15.0.

## Install and develop

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. The development server reloads when source files
change. Development and production API URLs are configured in `src/environments/`.

## Build

```bash
npm run build
```

The default production build is written to `dist/space-articles/browser/` and
enforces the bundle and component stylesheet budgets in `angular.json`.

For an unoptimized development build with source maps:

```bash
npm run build -- --configuration development
```

## Tests

Unit and routed component tests run through Angular's Vitest builder with jsdom.
The article API is mocked in tests; no live API or Chrome installation is required.

```bash
npm test
```

For a single test run, including CI:

```bash
npm run test:ci
```

There is no configured end-to-end test runner.

## Deployment

The GitHub Pages workflow runs on pushes to `main` or a manual workflow dispatch.
It selects Node.js from `.nvmrc`, caches npm downloads, installs the lockfile with
`npm ci`, and runs tests before building and deploying. The production build uses
the repository name as its base path.

## Code review

See [CODE_REVIEW.md](CODE_REVIEW.md) for prioritized findings, suggested follow-up
changes, and upgrade validation results.
