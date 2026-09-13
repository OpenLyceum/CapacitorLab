/**
 * Capacitor physics, checked against the equations in the Java sim's
 * `doc/model.txt`. These are the numbers the whole sim is built on, so they are
 * asserted directly rather than through the view.
 */

import { Vector3 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import {
  EPSILON_0,
  EPSILON_AIR,
  PLATE_SEPARATION_RANGE,
  PLATE_WIDTH_RANGE,
} from "../../../src/CapacitorLabConstants.js";
import { Capacitor } from "../../../src/common/model/Capacitor.js";
import { CLModelViewTransform3D } from "../../../src/common/model/CLModelViewTransform3D.js";
import { createAir, createCustom, createGlass } from "../../../src/common/model/DielectricMaterial.js";

const L = PLATE_WIDTH_RANGE.defaultValue; // 0.01 m
const D = PLATE_SEPARATION_RANGE.defaultValue; // 0.01 m
const MVT = new CLModelViewTransform3D();

/** A capacitor with air between the plates and the dielectric fully inserted. */
function airCapacitor(): Capacitor {
  return new Capacitor(new Vector3(0, 0, 0), L, D, createAir(), 0, MVT);
}

describe("Capacitor", () => {
  describe("capacitance", () => {
    it("matches C = ε₀·A/d for an air gap", () => {
      const capacitor = airCapacitor();

      expect(capacitor.plateAreaProperty.value).toBeCloseTo(L * L, 12);
      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo((EPSILON_AIR * EPSILON_0 * L * L) / D, 20);
    });

    it("scales linearly with plate area", () => {
      const capacitor = airCapacitor();
      const before = capacitor.totalCapacitanceProperty.value;

      capacitor.setPlateWidth(2 * L); // area ×4, since plates are square

      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(4 * before, 20);
    });

    it("scales inversely with plate separation", () => {
      const capacitor = airCapacitor();
      const before = capacitor.totalCapacitanceProperty.value;

      capacitor.plateSeparationProperty.value = D / 2;

      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(2 * before, 20);
    });

    it("follows the dielectric constant when the slab is fully inserted", () => {
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, createGlass(), 0, MVT);
      const glassConstant = capacitor.dielectricConstantProperty.value;

      expect(capacitor.airContactAreaProperty.value).toBeCloseTo(0, 12);
      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo((glassConstant * EPSILON_0 * L * L) / D, 20);
    });

    it("treats a partly withdrawn dielectric as two capacitors in parallel", () => {
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, createCustom(5), 0, MVT);

      capacitor.dielectricOffsetProperty.value = L / 2; // half the plate still covered

      const A = L * L;
      const dielectricArea = (L - L / 2) * L;
      const airArea = A - dielectricArea;

      expect(capacitor.dielectricContactAreaProperty.value).toBeCloseTo(dielectricArea, 12);
      expect(capacitor.airContactAreaProperty.value).toBeCloseTo(airArea, 12);
      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(
        (5 * EPSILON_0 * dielectricArea) / D + (EPSILON_AIR * EPSILON_0 * airArea) / D,
        20,
      );
    });

    it("clamps the dielectric contact area at zero once fully withdrawn", () => {
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, createCustom(5), 0, MVT);

      capacitor.dielectricOffsetProperty.value = 2 * L;

      expect(capacitor.dielectricContactAreaProperty.value).toBe(0);
      expect(capacitor.airContactAreaProperty.value).toBeCloseTo(L * L, 12);
    });

    it("inverts to a plate separation when capacitance is set directly", () => {
      const capacitor = airCapacitor();
      const target = 2e-13;

      capacitor.setTotalCapacitance(target);

      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(target, 20);
    });
  });

  describe("charge and energy", () => {
    it("gives Q = C·V on the top plate", () => {
      const capacitor = airCapacitor();
      capacitor.plateVoltageProperty.value = 1.5;

      expect(capacitor.totalPlateChargeProperty.value).toBeCloseTo(capacitor.totalCapacitanceProperty.value * 1.5, 20);
    });

    it("reverses the sign of the plate charge with the voltage", () => {
      const capacitor = airCapacitor();

      capacitor.plateVoltageProperty.value = 1.5;
      const positive = capacitor.totalPlateChargeProperty.value;
      capacitor.plateVoltageProperty.value = -1.5;

      expect(capacitor.totalPlateChargeProperty.value).toBeCloseTo(-positive, 20);
    });

    it("has no excess charge in air, because the sim models ε_air as exactly 1", () => {
      const capacitor = airCapacitor();
      capacitor.plateVoltageProperty.value = 1.5;

      expect(capacitor.excessAirPlateChargeProperty.value).toBeCloseTo(0, 20);
    });

    it("gives Q_excess = ((ε_r − 1)/ε_r)·C·V in the dielectric", () => {
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, createCustom(5), 0, MVT);
      capacitor.plateVoltageProperty.value = 1.5;

      expect(capacitor.excessDielectricPlateChargeProperty.value).toBeCloseTo(
        ((5 - 1) / 5) * capacitor.dielectricCapacitanceProperty.value * 1.5,
        20,
      );
    });
  });

  describe("electric field", () => {
    it("gives the net field as V/d, independent of the dielectric", () => {
      const withAir = airCapacitor();
      const withGlass = new Capacitor(new Vector3(0, 0, 0), L, D, createGlass(), 0, MVT);
      withAir.plateVoltageProperty.value = 1.5;
      withGlass.plateVoltageProperty.value = 1.5;

      expect(withAir.effectiveEFieldProperty.value).toBeCloseTo(1.5 / D, 6);
      expect(withGlass.effectiveEFieldProperty.value).toBeCloseTo(1.5 / D, 6);
    });

    it("splits the plates' field into net plus polarization", () => {
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, createCustom(5), 0, MVT);
      capacitor.plateVoltageProperty.value = 1.5;

      expect(capacitor.platesDielectricEFieldProperty.value).toBeCloseTo((5 * 1.5) / D, 6);
      expect(capacitor.dielectricEFieldProperty.value).toBeCloseTo(
        capacitor.platesDielectricEFieldProperty.value - capacitor.effectiveEFieldProperty.value,
        6,
      );
    });

    it("leaves no polarization field in air", () => {
      const capacitor = airCapacitor();
      capacitor.plateVoltageProperty.value = 1.5;

      expect(capacitor.airEFieldProperty.value).toBeCloseTo(0, 6);
    });
  });

  describe("reactivity", () => {
    it("tracks the custom material's constant while the user drags its slider", () => {
      const custom = createCustom(1);
      const capacitor = new Capacitor(new Vector3(0, 0, 0), L, D, custom, 0, MVT);
      capacitor.plateVoltageProperty.value = 1.5;
      const before = capacitor.totalCapacitanceProperty.value;

      custom.dielectricConstantProperty.value = 5;

      expect(capacitor.totalCapacitanceProperty.value).toBeCloseTo(5 * before, 20);
    });

    it("follows a change of material", () => {
      const capacitor = airCapacitor();
      const glass = createGlass();

      capacitor.dielectricMaterialProperty.value = glass;

      expect(capacitor.dielectricConstantProperty.value).toBe(glass.dielectricConstantProperty.value);
    });
  });

  describe("geometry", () => {
    it("puts the plate centres half a gap plus one thickness from the origin", () => {
      const capacitor = airCapacitor();
      const halfGap = D / 2 + capacitor.getPlateHeight();

      expect(capacitor.getTopPlateCenter().y).toBeCloseTo(-halfGap, 12);
      expect(capacitor.getBottomPlateCenter().y).toBeCloseTo(halfGap, 12);
    });

    it("keeps plates square when the width changes", () => {
      const capacitor = airCapacitor();

      capacitor.setPlateWidth(0.015);

      expect(capacitor.getPlateDepth()).toBe(0.015);
      expect(capacitor.getPlateHeight()).toBe(capacitor.plateSizeProperty.value.height);
    });

    it("rejects a non-positive plate width", () => {
      expect(() => airCapacitor().setPlateWidth(0)).toThrow();
    });
  });
});
