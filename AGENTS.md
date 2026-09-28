# AGENTS.md — Capacitor Lab

Sim-specific context for AI assistants. General SceneryStack guidance lives in the OpenLyceum `.github`
repository.

## Project

Capacitor Lab is a faithful SceneryStack/TypeScript reimplementation of PhET's retired three-screen
Java simulation: Introduction, Dielectric, and Multiple Capacitors. SI units are used throughout the
model. The project is AGPL-3.0-or-later and is not an official PhET product.

## Key files

### Architecture map

- `src/common/model/Capacitor.ts` — dielectric-aware capacitance, charge, energy, and field equations.
- `src/common/model/circuit/` — single, series, parallel, and two combination topologies.
- `src/common/model/wire/` and `shapes/` — circuit geometry used by both rendering and probes.
- `src/common/model/meter/` — bar meters, voltmeter, and electric-field detector.
- `src/common/view/` — pseudo-3D battery, wires, capacitor, plates, charges, fields, and shared screens.
- `src/common/view/controls/`, `drag/`, `meters/` — all interactive controls and instruments.
- `src/introduction/` and `src/dielectric/` — two configurations of the shared single-capacitor model/view.
- `src/multiple-capacitors/` — seven selectable networks with independent capacitor controls.
- `src/i18n/` — English, Spanish, and French strings with compile-time shape parity.
- `doc/model.md` — equations and modeling assumptions.
- `doc/implementation-notes.md` — projection, shapes-in-model rationale, and screen differences.
- `tests/common/model/` — physics and circuit regression suite.

### Reference implementations

The authoritative source is the Java sim under the OpenLyceum baseline checkout:
`Baseline/PhET/trunk/simulations-java/simulations/capacitor-lab/`.

Secondary references are:

- `https://github.com/veillette/simulations/tree/main/capacitor-lab` for the earlier Backbone/PixiJS web port.
- `https://github.com/phetsims/capacitor-lab-basics` for modern PhET pseudo-3D and interaction conventions.

Capacitor Lab: Basics has no dielectric feature, so never simplify this port's dielectric physics to
match it. Preserve the air/dielectric split in charge and electric-field quantities.

## Model

Physics and behavior: `doc/model.md`.

## Accessibility

Follows the shared [OpenLyceum accessibility convention](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md).
A11y strings live under the `a11y` key of each locale JSON, read through `StringManager`.

- Screen summaries: `src/dielectric/view/DielectricScreenSummaryContent.ts`, `src/introduction/view/IntroductionScreenSummaryContent.ts`, `src/multiple-capacitors/view/MultipleCapacitorsScreenSummaryContent.ts`
- Keyboard Shortcuts dialog: `src/dielectric/view/DielectricKeyboardHelpContent.ts`, `src/introduction/view/IntroductionKeyboardHelpContent.ts`, `src/multiple-capacitors/view/MultipleCapacitorsKeyboardHelpContent.ts`
- Keyboard-draggable objects: `src/common/view/drag/DielectricOffsetDragHandleNode.ts`, `src/common/view/drag/PlateAreaDragHandleNode.ts`, `src/common/view/drag/PlateSeparationDragHandleNode.ts`, `src/common/view/drag/worldPositionDragListener.ts`

## Compliance carve-outs

None — the sim follows [Baton/CONVENTIONS.md](https://github.com/OpenLyceum/Baton/blob/main/CONVENTIONS.md) and matches the template-owned files (`Baton/scripts/check-template-drift.sh`).

## Testing

Vitest on `happy-dom` with the template `tests/setup.ts`; tests live only under `tests/`.

| Path | Covers |
|---|---|
| `tests/common/model/CLCalibration.test.ts` | unit tests |
| `tests/common/model/Capacitor.test.ts` | unit tests |
| `tests/common/model/circuit/circuits.test.ts` | unit tests |
| `tests/common/model/screenModels.test.ts` | unit tests |
| `tests/memory-leak.test.ts` | `describeDisposalLeaks` over the sim's disposables (shared harness `tests/helpers/memoryLeak.ts`) |
| `tests/fuzz/fuzz.spec.ts` | template fuzz smoke (pointer + keyboard, `?ea`) — `npm run test:fuzz` |

## Commands

```bash
npm run lint && npm run check && npm test && npm run build && npm run test:fuzz:quick
```

The standard scripts are listed in the README. `npm run release` runs `npm test` before the version bump, and `src/init.ts` reads `version` from `package.json`.

Sim-specific scripts: `npm run test:physics`.

## Development notes

### Physics quirks

- Air deliberately uses relative permittivity 1.0, not the physical 1.0005896.
- The partially inserted slab is modeled as air-filled and dielectric-filled capacitors in parallel.
- With the battery connected, voltage is fixed and charge follows `Q = CV`; disconnected, plate charge
  is fixed and voltage follows `V = Q/C`.
- Probe readings are geometric. Do not replace model-shape intersection with view-coordinate guesses.
- Multiple-capacitor controls change plate separation to realize a requested capacitance; each capacitor
  is independently adjustable, while battery voltage is synchronized across circuits.

### Working conventions

Use `ProfileColorProperty` values from `CapacitorLabColors.ts`, localized properties from
`StringManager`, and flat control options from `src/common/CapacitorLabButtonOptions.ts`. Keep physics
out of scenery nodes. Interactive nodes need keyboard operation and localized accessible content.

Run all gates before handing off:

```bash
npm run check
npm run lint
npm test
npm run build
npm run test:fuzz:quick
```
