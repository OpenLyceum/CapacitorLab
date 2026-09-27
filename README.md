# Capacitor Lab

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

A SceneryStack/TypeScript reimplementation of PhET's retired Java Capacitor Lab. It restores the full
three-screen experience—including the Dielectric screen—in a modern installable web simulation.

## Features

- Introduction: vary voltage, plate area, and plate separation; inspect charge, field, capacitance,
  voltage, and stored energy.
- Dielectric: insert glass, paper, teflon, or a custom material and compare free, bound, and excess
  charge with the plate, dielectric, and net electric fields.
- Multiple Capacitors: build seven series, parallel, and combination networks with independently
  adjustable capacitor values.
- English, Spanish, and French localization; keyboard operation and live screen-reader summaries.
- Default/projector color profiles and offline PWA support.

## Quick Start

Requires Node 24 or newer.

```bash
npm install
npm run dev
```

## Scripts

| Command | Purpose |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |
| `npm run test:physics` | Check Java-reference physics values |

See [the model guide](doc/model.md) for the physics and
[implementation notes](doc/implementation-notes.md) for architecture and reference sources.

## Tech Stack

- SceneryStack 3
- TypeScript 7 and Vite 8
- Vitest 5 and Playwright
- Biome 2

## License

GNU AGPL-3.0-or-later. This is an independent OpenLyceum reimplementation, not an official PhET
product. See [CREDITS.md](CREDITS.md) for source and artwork attribution.

## Contributing

See the [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md)
and report defects through this repository's GitHub Issues page.
