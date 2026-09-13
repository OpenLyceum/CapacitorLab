#!/usr/bin/env tsx
/** Independent command-line checks against the Java model's reference equations. */

export {};

// Supply the small browser surface SceneryStack initializes against. Physics
// still runs in Node; happy-dom only provides globals read during module setup.
const { Window } = await import("happy-dom");
const browserWindow = new Window({ url: "http://localhost/" });
const taskGlobal = globalThis as Record<string, unknown>;
const phetGlobal: Record<string, unknown> = {};
taskGlobal["self"] = browserWindow;
taskGlobal["window"] = browserWindow;
taskGlobal["document"] = browserWindow.document;
taskGlobal["location"] = browserWindow.location;
taskGlobal["phet"] = phetGlobal;
taskGlobal["HTMLCanvasElement"] = browserWindow.HTMLCanvasElement;
taskGlobal["Image"] = browserWindow.Image;
for (const name of [
  "Event",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
  "HTMLElement",
  "Element",
  "Node",
  "DOMParser",
]) {
  taskGlobal[name] = (browserWindow as unknown as Record<string, unknown>)[name];
}
(browserWindow as unknown as Record<string, unknown>)["phet"] = phetGlobal;
await import("../tests/setup.js");
(browserWindow as unknown as Record<string, unknown>)["AudioContext"] = taskGlobal["AudioContext"];
(browserWindow as unknown as Record<string, unknown>)["webkitAudioContext"] = taskGlobal["webkitAudioContext"];

const { Vector3 } = await import("scenerystack/dot");
const { EPSILON_0 } = await import("../src/CapacitorLabConstants.js");
const { Capacitor } = await import("../src/common/model/Capacitor.js");
const { CLModelViewTransform3D } = await import("../src/common/model/CLModelViewTransform3D.js");
const { createAir, createGlass } = await import("../src/common/model/DielectricMaterial.js");
const { MultipleCapacitorsModel } = await import("../src/multiple-capacitors/model/MultipleCapacitorsModel.js");

let failures = 0;

function check(name: string, actual: number, expected: number, relativeTolerance = 1e-10): void {
  const scale = Math.max(Math.abs(actual), Math.abs(expected), Number.MIN_VALUE);
  if (Math.abs(actual - expected) / scale <= relativeTolerance) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}: expected ${expected}, got ${actual}`);
  }
}

const width = 0.01;
const separation = 0.01;
const voltage = 1.5;
const transform = new CLModelViewTransform3D();
const position = new Vector3(0, 0, 0);

const air = new Capacitor(position, width, separation, createAir(), 0, transform);
air.plateVoltageProperty.value = voltage;
const expectedAirCapacitance = (EPSILON_0 * width * width) / separation;
check("air capacitance", air.totalCapacitanceProperty.value, expectedAirCapacitance);
check("air plate charge", air.totalPlateChargeProperty.value, expectedAirCapacitance * voltage);
check(
  "air stored energy",
  0.5 * air.totalCapacitanceProperty.value * voltage * voltage,
  0.5 * expectedAirCapacitance * voltage * voltage,
);
check("effective field", air.effectiveEFieldProperty.value, voltage / separation);

const glass = new Capacitor(position, width, separation, createGlass(), 0, transform);
glass.plateVoltageProperty.value = voltage;
check("glass capacitance", glass.totalCapacitanceProperty.value, 4.7 * expectedAirCapacitance);
check("glass plate field", glass.platesDielectricEFieldProperty.value, (4.7 * voltage) / separation);
check("glass polarization field", glass.dielectricEFieldProperty.value, ((4.7 - 1) * voltage) / separation);
check(
  "glass excess charge",
  glass.excessDielectricPlateChargeProperty.value,
  ((4.7 - 1) / 4.7) * glass.totalCapacitanceProperty.value * voltage,
);

glass.dielectricOffsetProperty.value = width / 2;
check(
  "half-inserted dielectric capacitance",
  glass.totalCapacitanceProperty.value,
  0.5 * (4.7 + 1) * expectedAirCapacitance,
);

const multiple = new MultipleCapacitorsModel();
const circuitAt = (index: number) => {
  const circuit = multiple.circuits[index];
  if (circuit === undefined) {
    throw new Error(`missing circuit topology at index ${index}`);
  }
  return circuit;
};
const single = circuitAt(0);
const twoSeries = circuitAt(1);
const threeSeries = circuitAt(2);
const twoParallel = circuitAt(3);
const threeParallel = circuitAt(4);
const combination1 = circuitAt(5);
const combination2 = circuitAt(6);
const c = single.totalCapacitanceProperty.value;
check("two in series", twoSeries.totalCapacitanceProperty.value, c / 2);
check("three in series", threeSeries.totalCapacitanceProperty.value, c / 3);
check("two in parallel", twoParallel.totalCapacitanceProperty.value, 2 * c);
check("three in parallel", threeParallel.totalCapacitanceProperty.value, 3 * c);
check("combination 1", combination1.totalCapacitanceProperty.value, 1.5 * c);
check("combination 2", combination2.totalCapacitanceProperty.value, (2 / 3) * c);

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log("All Java-reference physics checks passed.");
}

browserWindow.close();
process.exit(process.exitCode ?? 0);
