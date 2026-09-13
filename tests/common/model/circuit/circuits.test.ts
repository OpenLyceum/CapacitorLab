/**
 * Circuit topology, checked against the series/parallel rules in the Java sim's
 * `doc/model.txt`. Covers all seven circuits the Multiple Capacitors screen
 * offers, plus the disconnected-battery behaviour unique to SingleCircuit.
 */

import { Vector3 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { PLATE_SEPARATION_RANGE, PLATE_WIDTH_RANGE } from "../../../../src/CapacitorLabConstants.js";
import type { CircuitConfig } from "../../../../src/common/model/CircuitConfig.js";
import { CLModelViewTransform3D } from "../../../../src/common/model/CLModelViewTransform3D.js";
import { Combination1Circuit, Combination2Circuit } from "../../../../src/common/model/circuit/CombinationCircuits.js";
import { ParallelCircuit } from "../../../../src/common/model/circuit/ParallelCircuit.js";
import { SeriesCircuit } from "../../../../src/common/model/circuit/SeriesCircuit.js";
import { SingleCircuit } from "../../../../src/common/model/circuit/SingleCircuit.js";
import { createAir } from "../../../../src/common/model/DielectricMaterial.js";
import { StringManager } from "../../../../src/i18n/StringManager.js";

const NAME = StringManager.getInstance().getCircuitStrings().singleStringProperty;

function createConfig(): CircuitConfig {
  return {
    modelViewTransform: new CLModelViewTransform3D(),
    batteryPosition: new Vector3(0.005, 0.03, 0),
    capacitorXSpacing: 0.018,
    capacitorYSpacing: 0.016,
    plateWidth: PLATE_WIDTH_RANGE.defaultValue,
    plateSeparation: PLATE_SEPARATION_RANGE.defaultValue,
    dielectricMaterial: createAir(),
    dielectricOffset: 0,
    wireThickness: 0.0005,
    wireExtent: 0.01,
  };
}

describe("circuits", () => {
  describe("ParallelCircuit", () => {
    it("sums the capacitances", () => {
      const circuit = new ParallelCircuit(createConfig(), NAME, 3);
      const single = circuit.capacitors[0]?.totalCapacitanceProperty.value ?? 0;

      expect(circuit.capacitors).toHaveLength(3);
      expect(circuit.totalCapacitanceProperty.value).toBeCloseTo(3 * single, 20);
    });

    it("puts the full battery voltage across every capacitor", () => {
      const circuit = new ParallelCircuit(createConfig(), NAME, 3);
      circuit.battery.voltageProperty.value = 1.5;

      for (const capacitor of circuit.capacitors) {
        expect(capacitor.plateVoltageProperty.value).toBeCloseTo(1.5, 9);
      }
    });

    it("lays its capacitors out in a row", () => {
      const circuit = new ParallelCircuit(createConfig(), NAME, 3);
      const ys = circuit.capacitors.map((capacitor) => capacitor.position.y);
      const xs = circuit.capacitors.map((capacitor) => capacitor.position.x);

      expect(new Set(ys).size).toBe(1);
      expect(new Set(xs).size).toBe(3);
    });

    it("wires the battery to the capacitors with two wires", () => {
      const circuit = new ParallelCircuit(createConfig(), NAME, 3);
      expect(circuit.wires).toHaveLength(2);
    });
  });

  describe("SeriesCircuit", () => {
    it("combines capacitances reciprocally", () => {
      const circuit = new SeriesCircuit(createConfig(), NAME, 3);
      const single = circuit.capacitors[0]?.totalCapacitanceProperty.value ?? 0;

      expect(circuit.totalCapacitanceProperty.value).toBeCloseTo(single / 3, 20);
    });

    it("puts the same charge on every capacitor and divides the voltage", () => {
      const circuit = new SeriesCircuit(createConfig(), NAME, 3);
      circuit.battery.voltageProperty.value = 1.5;

      const charges = circuit.capacitors.map((capacitor) => capacitor.totalPlateChargeProperty.value);
      const voltages = circuit.capacitors.map((capacitor) => capacitor.plateVoltageProperty.value);

      for (const charge of charges) {
        expect(charge).toBeCloseTo(charges[0] ?? 0, 20);
      }
      expect(voltages.reduce((sum, v) => sum + v, 0)).toBeCloseTo(1.5, 9);
    });

    it("lays its capacitors out in a column", () => {
      const circuit = new SeriesCircuit(createConfig(), NAME, 3);
      const xs = circuit.capacitors.map((capacitor) => capacitor.position.x);

      expect(new Set(xs).size).toBe(1);
      expect(new Set(circuit.capacitors.map((c) => c.position.y)).size).toBe(3);
    });

    it("adds one junction wire per adjacent pair", () => {
      expect(new SeriesCircuit(createConfig(), NAME, 3).wires).toHaveLength(4);
      expect(new SeriesCircuit(createConfig(), NAME, 2).wires).toHaveLength(3);
    });
  });

  describe("Combination1Circuit — C1 and C2 in series, C3 in parallel", () => {
    it("computes 1/(1/C1 + 1/C2) + C3", () => {
      const circuit = new Combination1Circuit(createConfig(), NAME);
      const single = circuit.capacitors[0]?.totalCapacitanceProperty.value ?? 0;

      expect(circuit.totalCapacitanceProperty.value).toBeCloseTo(single / 2 + single, 20);
    });

    it("splits the voltage across the series pair but not across C3", () => {
      const circuit = new Combination1Circuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      const [c1, c2, c3] = circuit.capacitors;

      expect(c1?.plateVoltageProperty.value).toBeCloseTo(0.75, 9);
      expect(c2?.plateVoltageProperty.value).toBeCloseTo(0.75, 9);
      expect(c3?.plateVoltageProperty.value).toBeCloseTo(1.5, 9);
    });
  });

  describe("Combination2Circuit — C2 and C3 in parallel, C1 in series", () => {
    it("computes 1/(1/C1 + 1/(C2 + C3))", () => {
      const circuit = new Combination2Circuit(createConfig(), NAME);
      const single = circuit.capacitors[0]?.totalCapacitanceProperty.value ?? 0;

      expect(circuit.totalCapacitanceProperty.value).toBeCloseTo(1 / (1 / single + 1 / (2 * single)), 20);
    });

    it("gives the parallel pair a third of the voltage, since it has twice the capacitance", () => {
      const circuit = new Combination2Circuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      const [c1, c2, c3] = circuit.capacitors;

      expect(c1?.plateVoltageProperty.value).toBeCloseTo(1, 9);
      expect(c2?.plateVoltageProperty.value).toBeCloseTo(0.5, 9);
      expect(c3?.plateVoltageProperty.value).toBeCloseTo(0.5, 9);
    });
  });

  describe("SingleCircuit", () => {
    it("stores U = ½CV²", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;

      expect(circuit.storedEnergyProperty.value).toBeCloseTo(
        0.5 * circuit.totalCapacitanceProperty.value * 1.5 * 1.5,
        24,
      );
    });

    it("holds the plate charge when the battery is disconnected", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      const chargeWhenConnected = circuit.capacitor.totalPlateChargeProperty.value;

      circuit.batteryConnectedProperty.value = false;

      expect(circuit.capacitor.totalPlateChargeProperty.value).toBeCloseTo(chargeWhenConnected, 20);
    });

    it("ignores the battery once disconnected", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      circuit.batteryConnectedProperty.value = false;

      circuit.battery.voltageProperty.value = -1.5;

      expect(circuit.capacitor.plateVoltageProperty.value).toBeCloseTo(1.5, 9);
    });

    it("trades charge for voltage when the plates move with the battery disconnected", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      circuit.batteryConnectedProperty.value = false;
      const chargeBefore = circuit.capacitor.totalPlateChargeProperty.value;

      // Halving the separation doubles C, so V must halve to conserve Q.
      circuit.capacitor.plateSeparationProperty.value /= 2;

      expect(circuit.capacitor.totalPlateChargeProperty.value).toBeCloseTo(chargeBefore, 20);
      expect(circuit.capacitor.plateVoltageProperty.value).toBeCloseTo(0.75, 9);
    });
  });

  describe("current", () => {
    it("stays at zero on the first step, when there is no previous charge to compare", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;

      circuit.step(1 / 60);

      expect(circuit.currentAmplitudeProperty.value).toBe(0);
    });

    it("reports dQ/dt with the sign of the change", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.step(1 / 60);

      circuit.battery.voltageProperty.value = 1.5;
      circuit.step(1 / 60);
      expect(circuit.currentAmplitudeProperty.value).toBeGreaterThan(0);

      circuit.battery.voltageProperty.value = 0;
      circuit.step(1 / 60);
      expect(circuit.currentAmplitudeProperty.value).toBeLessThan(0);
    });

    it("settles back to zero when nothing is changing", () => {
      const circuit = new SingleCircuit(createConfig(), NAME);
      circuit.battery.voltageProperty.value = 1.5;
      circuit.step(1 / 60);
      circuit.step(1 / 60);

      expect(circuit.currentAmplitudeProperty.value).toBe(0);
    });
  });
});
