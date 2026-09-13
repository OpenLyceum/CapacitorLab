# Implementation Notes — Capacitor Lab

This is a TypeScript/SceneryStack port of PhET's retired Java Capacitor Lab. The Java source is the
authority for physics and feature scope. The Backbone/PixiJS port in `veillette/simulations` is a
secondary check for browser behavior, while PhET's Capacitor Lab: Basics supplies modern reusable
pseudo-3D conventions but intentionally has no dielectric model.

## Architecture

`CapacitorLabModel` owns the current circuit, world bounds, and five meters. `SingleCapacitorModel`
specializes it for Introduction and Dielectric; those screens differ by constructor configuration.
`MultipleCapacitorsModel` owns seven persistent circuit models and exposes the selected circuit.

The physics model is entirely in `src/common/model/`. It includes component shapes because the
voltmeter and electric-field probes determine readings by intersecting their model-space shapes with
batteries, wires, plates, and capacitor gaps. Moving that geometry into the view would duplicate the
Java measurement design and make readings depend on rendering details.

The common view is layered as circuit, meters, controls, and popups. `SingleCapacitorScreenView` is
shared by Introduction and Dielectric. All seven multiple-capacitor circuit nodes are built once and
visibility is switched with `currentCircuitProperty`, matching both earlier implementations.

## Pseudo-3D projection

`CLModelViewTransform3D` is a parallel yaw/pitch projection compatible with SceneryStack's
`YawPitchModelViewTransform3`. There is no perspective or vanishing point, so projected component
edges and drag inversions remain linear. `BoxShapes` and `BoxNode` generate and paint the visible
faces; capacitor-specific nodes split plate and dielectric faces where occlusion requires it.

The circuit is laid out in a fixed 1024 × 864 design box and scaled as a group into the space left of
the control column. Model units remain metres throughout.

## Screen differences

- Introduction uses air, keeps the dielectric fully withdrawn and invisible, and simplifies the
  electric-field detector to the sum vector.
- Dielectric exposes glass, paper, teflon, and a custom material, an offset handle, dielectric charge
  choices, and all three field vectors. The slab becomes translucent when field lines, a detector,
  the voltmeter, or excess dielectric charges need to be seen through it.
- Multiple Capacitors offers single, two/three series, two/three parallel, and two three-capacitor
  combination circuits. Each capacitor has an independent capacitance slider. Batteries share one
  synchronized voltage, so switching circuits preserves the user's setting.

## Interaction and accessibility

Pointer and keyboard drag listeners drive the same model properties. Arrow/WASD movement works for
plate, separation, dielectric, meter-body, and probe interactions; Shift provides finer movement.
Keyboard help documents both sliders and movable objects. Each screen summary describes its real
play/control areas and derives a live capacitance, charge, and energy paragraph from meter properties.

## Verification

Vitest covers capacitor equations, calibration extremes, circuit totals, probe geometry, resets, and
screen-model wiring. The memory-leak smoke test constructs and resets each screen model. Playwright
fuzzes all three screens with assertions enabled. Use:

```bash
npm run check
npm run lint
npm test
npm run build
npm run test:fuzz:quick
```
