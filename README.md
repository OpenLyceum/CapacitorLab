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
| `npm run dev` | Start the Vite development server |
| `npm run check` | Type-check the app, scripts, and tests |
| `npm run lint` | Run Biome checks |
| `npm test` | Run the Vitest physics and regression suite |
| `npm run test:physics` | Check Java-reference physics values |
| `npm run build` | Build the production PWA |
| `npm run test:fuzz:quick` | Fuzz all screens in Chromium for 10 seconds |

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
