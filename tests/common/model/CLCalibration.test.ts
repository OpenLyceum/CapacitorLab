/**
 * The calibration extremes the whole view scales against. Pinned to values
 * derived by hand from the equations in doc/model.txt at the Java sim's extreme
 * settings — if the model drifts, charge density and field-line spacing drift
 * with it, and these are what catch that.
 */

import { describe, expect, it } from "vitest";
import {
  EFIELD_REFERENCE_MAGNITUDE,
  MAX_DIELECTRIC_EFIELD,
  MAX_EFFECTIVE_EFIELD,
  MAX_EXCESS_DIELECTRIC_PLATE_CHARGE,
  MAX_PLATE_CHARGE,
} from "../../../src/common/model/CLCalibration.js";

describe("CLCalibration", () => {
  it("maxes plate charge with the biggest plates, closest together, at full voltage", () => {
    // C = 5·ε₀·(0.02²)/0.005 = 3.5416e-12 F, then Q = C·1.5
    expect(MAX_PLATE_CHARGE).toBeCloseTo(5.3124e-12, 18);
  });

  it("maxes excess dielectric charge at ((ε_r−1)/ε_r)·C·V", () => {
    expect(MAX_EXCESS_DIELECTRIC_PLATE_CHARGE).toBeCloseTo(0.8 * 3.5416e-12 * 1.5, 18);
  });

  it("maxes the net field with the smallest plates holding the largest charge", () => {
    // Smallest plates and ε_r = 1 give C = 1.7708e-13 F, so V = Q/C = 30 V
    // across a 0.005 m gap.
    expect(MAX_EFFECTIVE_EFIELD).toBeCloseTo(6000, 6);
  });

  it("maxes the polarization field as (ε_r − 1)·V/d", () => {
    // ε_r = 5 gives C = 8.854e-13 F, so V = 6 V: 5·6/0.005 − 6/0.005 = 4800 V/m.
    expect(MAX_DIELECTRIC_EFIELD).toBeCloseTo(4800, 6);
  });

  it("uses the default geometry at full voltage as the field reference", () => {
    expect(EFIELD_REFERENCE_MAGNITUDE).toBeCloseTo(150, 9);
  });

  it("keeps every extreme above the values ordinary interaction can reach", () => {
    expect(MAX_PLATE_CHARGE).toBeGreaterThan(MAX_EXCESS_DIELECTRIC_PLATE_CHARGE);
    expect(MAX_EFFECTIVE_EFIELD).toBeGreaterThan(EFIELD_REFERENCE_MAGNITUDE);
    expect(MAX_EFFECTIVE_EFIELD).toBeGreaterThan(MAX_DIELECTRIC_EFIELD);
  });
});
