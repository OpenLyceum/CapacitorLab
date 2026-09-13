/**
 * CapacitorNodeCalibration.ts
 *
 * The extremes {@link CapacitorNode} and its children scale against, gathered in
 * one object so a capacitor drawn on any screen uses the same ones.
 *
 * Keeping these shared is a correctness requirement, not tidiness: charge-symbol
 * count and field-line density are fractions of these maxima, so a screen with
 * its own values would draw the same charge differently.
 */

import {
  MAX_DIELECTRIC_EFIELD,
  MAX_EFFECTIVE_EFIELD,
  MAX_EXCESS_DIELECTRIC_PLATE_CHARGE,
  MAX_PLATE_CHARGE,
} from "../model/CLCalibration.js";

export const CapacitorNodeCalibration = {
  maxPlateCharge: MAX_PLATE_CHARGE,
  maxExcessDielectricPlateCharge: MAX_EXCESS_DIELECTRIC_PLATE_CHARGE,
  maxEffectiveEField: MAX_EFFECTIVE_EFIELD,
  maxDielectricEField: MAX_DIELECTRIC_EFIELD,
} as const;
