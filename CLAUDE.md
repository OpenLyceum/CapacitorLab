# CLAUDE.md — Capacitor Lab

Sim-specific context for AI assistants. General SceneryStack guidance lives in the OpenLyceum `.github`
repository.

## Project

Capacitor Lab is a faithful SceneryStack/TypeScript reimplementation of PhET's retired three-screen
Java simulation: Introduction, Dielectric, and Multiple Capacitors. SI units are used throughout the
model. The project is AGPL-3.0-or-later and is not an official PhET product.

## Architecture map

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

## Reference implementations

The authoritative source is the Java sim under the OpenLyceum baseline checkout:
`Baseline/PhET/trunk/simulations-java/simulations/capacitor-lab/`.

Secondary references are:

- `https://github.com/veillette/simulations/tree/main/capacitor-lab` for the earlier Backbone/PixiJS web port.
- `https://github.com/phetsims/capacitor-lab-basics` for modern PhET pseudo-3D and interaction conventions.

Capacitor Lab: Basics has no dielectric feature, so never simplify this port's dielectric physics to
match it. Preserve the air/dielectric split in charge and electric-field quantities.

## Physics quirks

- Air deliberately uses relative permittivity 1.0, not the physical 1.0005896.
- The partially inserted slab is modeled as air-filled and dielectric-filled capacitors in parallel.
- With the battery connected, voltage is fixed and charge follows `Q = CV`; disconnected, plate charge
  is fixed and voltage follows `V = Q/C`.
- Probe readings are geometric. Do not replace model-shape intersection with view-coordinate guesses.
- Multiple-capacitor controls change plate separation to realize a requested capacitance; each capacitor
  is independently adjustable, while battery voltage is synchronized across circuits.

## Working conventions

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
