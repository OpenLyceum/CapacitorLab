/**
 * The three screen models: what each screen fixes about the shared machinery,
 * and the cross-circuit synchronization the Multiple Capacitors screen relies on.
 */

import { describe, expect, it } from "vitest";
import { CAPACITANCE_RANGE } from "../../../src/CapacitorLabConstants.js";
import { DielectricModel } from "../../../src/dielectric/model/DielectricModel.js";
import { IntroductionModel } from "../../../src/introduction/model/IntroductionModel.js";
import { MultipleCapacitorsModel } from "../../../src/multiple-capacitors/model/MultipleCapacitorsModel.js";

describe("IntroductionModel", () => {
  it("keeps the dielectric entirely outside the plates", () => {
    const model = new IntroductionModel();

    expect(model.circuit.capacitor.dielectricContactAreaProperty.value).toBe(0);
    expect(model.circuit.capacitor.airContactAreaProperty.value).toBeCloseTo(
      model.circuit.capacitor.plateAreaProperty.value,
      12,
    );
  });

  it("offers no material to choose from, so the gap is always air", () => {
    const model = new IntroductionModel();

    expect(model.materials).toHaveLength(1);
    expect(model.circuit.capacitor.dielectricConstantProperty.value).toBe(1);
  });

  it("shows only the sum vector on its E-field detector", () => {
    const model = new IntroductionModel();

    expect(model.eFieldDetector.sumVectorVisibleProperty.value).toBe(true);
    expect(model.eFieldDetector.plateVectorVisibleProperty.value).toBe(false);
    expect(model.eFieldDetector.dielectricVectorVisibleProperty.value).toBe(false);
  });
});

describe("DielectricModel", () => {
  it("offers the custom material plus teflon, paper and glass", () => {
    const model = new DielectricModel();
    const constants = model.materials.map((material) => material.dielectricConstantProperty.value);

    expect(model.materials).toHaveLength(4);
    expect(constants).toEqual([5, 2.1, 3.5, 4.7]);
  });

  it("starts with the slab withdrawn, since the default offset equals the plate width", () => {
    const model = new DielectricModel();
    const capacitor = model.circuit.capacitor;

    expect(capacitor.dielectricOffsetProperty.value).toBe(capacitor.getPlateWidth());
    expect(capacitor.dielectricContactAreaProperty.value).toBe(0);
  });

  it("splits the plate between air and dielectric as the slab slides in", () => {
    const model = new DielectricModel();
    const capacitor = model.circuit.capacitor;

    capacitor.dielectricOffsetProperty.value = capacitor.getPlateWidth() / 2;

    expect(capacitor.dielectricContactAreaProperty.value).toBeGreaterThan(0);
    expect(capacitor.airContactAreaProperty.value).toBeGreaterThan(0);
  });

  it("shows all three vectors on its E-field detector", () => {
    const model = new DielectricModel();

    expect(model.eFieldDetector.plateVectorVisibleProperty.value).toBe(true);
    expect(model.eFieldDetector.dielectricVectorVisibleProperty.value).toBe(true);
  });
});

describe("MultipleCapacitorsModel", () => {
  it("offers all seven circuits, starting on the single capacitor", () => {
    const model = new MultipleCapacitorsModel();

    expect(model.circuits).toHaveLength(7);
    expect(model.currentCircuitProperty.value).toBe(model.circuits[0]);
  });

  it("applies the capacitance slider to every capacitor in every circuit", () => {
    const model = new MultipleCapacitorsModel();

    model.capacitanceProperty.value = CAPACITANCE_RANGE.max;

    for (const circuit of model.circuits) {
      for (const capacitor of circuit.capacitors) {
        expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(CAPACITANCE_RANGE.max, 20);
      }
    }
  });

  it("keeps one battery voltage across all seven circuits", () => {
    const model = new MultipleCapacitorsModel();
    const [first] = model.circuits;

    first?.battery.voltageProperty.set(1.5);

    for (const circuit of model.circuits) {
      expect(circuit.battery.voltageProperty.value).toBe(1.5);
    }
  });

  it("re-points the bar meters when the circuit changes", () => {
    const model = new MultipleCapacitorsModel();
    model.capacitanceProperty.value = CAPACITANCE_RANGE.max;
    const singleCapacitance = model.capacitanceMeter.valueProperty.value;

    // Three in parallel triples the total capacitance.
    const threeInParallel = model.circuits[4];
    if (threeInParallel === undefined) {
      throw new Error("expected seven circuits");
    }
    model.currentCircuitProperty.value = threeInParallel;

    expect(model.capacitanceMeter.valueProperty.value).toBeCloseTo(3 * singleCapacitance, 20);
  });

  it("steps only the circuit currently on screen", () => {
    const model = new MultipleCapacitorsModel();
    const [first] = model.circuits;
    first?.battery.voltageProperty.set(1.5);

    model.step(1 / 60);
    model.step(1 / 60);

    expect(model.currentCircuitProperty.value.currentAmplitudeProperty.value).toBe(0);
  });
});
