/**
 * CLCalibration.ts
 *
 * The extreme values the view calibrates itself against: the most charge a plate
 * can hold, the strongest field the gap can carry, and so on. Charge-symbol
 * density, E-field line spacing and bar-meter scales are all fractions of these.
 *
 * They are computed once, by building throwaway model objects at their extreme
 * settings — the same trick the Java sim used, and worth keeping: a closed-form
 * rewrite would silently drift the moment the model changed.
 *
 * **All three screens share these values.** The Java `MultipleCapacitorsCanvas`
 * deliberately pulled them from the Dielectric screen's model "so that density of
 * charge and field will be the same across all modules" — without that, a given
 * charge would draw a different number of symbols on different screens.
 *
 * Ported from the static `getMax*` methods of `module/dielectric/DielectricModel.java`.
 */

import { Vector3 } from "scenerystack/dot";
import {
  BATTERY_VOLTAGE_RANGE,
  DIELECTRIC_CONSTANT_RANGE,
  DIELECTRIC_OFFSET_RANGE,
  PLATE_SEPARATION_RANGE,
  PLATE_WIDTH_RANGE,
  WIRE_THICKNESS,
} from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { Capacitor } from "./Capacitor.js";
import type { CircuitConfig } from "./CircuitConfig.js";
import { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import { SingleCircuit } from "./circuit/SingleCircuit.js";
import { createCustom } from "./DielectricMaterial.js";

const ORIGIN = new Vector3(0, 0, 0);

/** Biggest plates, closest together, strongest dielectric, full voltage. */
function createCapacitorWithMaxCharge(): Capacitor {
  const capacitor = new Capacitor(
    ORIGIN,
    PLATE_WIDTH_RANGE.max,
    PLATE_SEPARATION_RANGE.min,
    createCustom(DIELECTRIC_CONSTANT_RANGE.max),
    DIELECTRIC_OFFSET_RANGE.min,
    new CLModelViewTransform3D(),
  );
  capacitor.plateVoltageProperty.value = BATTERY_VOLTAGE_RANGE.max;
  return capacitor;
}

/**
 * The strongest fields come from the *smallest* plates holding the largest
 * charge — hence a disconnected battery, which lets charge and geometry be set
 * independently.
 */
function createCircuitWithMaxCharge(dielectricConstant: number): SingleCircuit {
  const config: CircuitConfig = {
    modelViewTransform: new CLModelViewTransform3D(),
    batteryPosition: ORIGIN,
    capacitorXSpacing: 0.025,
    capacitorYSpacing: 0,
    plateWidth: PLATE_WIDTH_RANGE.min,
    plateSeparation: PLATE_SEPARATION_RANGE.min,
    dielectricMaterial: createCustom(dielectricConstant),
    dielectricOffset: DIELECTRIC_OFFSET_RANGE.min,
    wireThickness: WIRE_THICKNESS,
    wireExtent: 0.016,
  };
  const circuit = new SingleCircuit(
    config,
    StringManager.getInstance().getCircuitStrings().singleStringProperty,
    false /* batteryConnected */,
  );
  circuit.disconnectedPlateChargeProperty.value = MAX_PLATE_CHARGE;
  return circuit;
}

/** Largest total charge one plate can hold, Coulombs. */
export const MAX_PLATE_CHARGE: number = createCapacitorWithMaxCharge().totalPlateChargeProperty.value;

/** Largest excess (polarization-bound) charge in the dielectric, Coulombs. */
export const MAX_EXCESS_DIELECTRIC_PLATE_CHARGE: number =
  createCapacitorWithMaxCharge().excessDielectricPlateChargeProperty.value;

/** Strongest net field between the plates, V/m. Sets the E-field line density. */
export const MAX_EFFECTIVE_EFIELD: number = createCircuitWithMaxCharge(DIELECTRIC_CONSTANT_RANGE.min).capacitor
  .effectiveEFieldProperty.value;

/** Strongest polarization field, V/m. Scales the detector's dielectric vector. */
export const MAX_DIELECTRIC_EFIELD: number = createCircuitWithMaxCharge(DIELECTRIC_CONSTANT_RANGE.max).capacitor
  .dielectricEFieldProperty.value;

/**
 * A typical field, V/m — everything at its default with the battery at full
 * voltage. The E-field detector's initial zoom is set so that this reads as a
 * comfortable arrow length rather than a sliver.
 */
export const EFIELD_REFERENCE_MAGNITUDE: number = (() => {
  const capacitor = new Capacitor(
    ORIGIN,
    PLATE_WIDTH_RANGE.defaultValue,
    PLATE_SEPARATION_RANGE.defaultValue,
    createCustom(DIELECTRIC_CONSTANT_RANGE.defaultValue),
    DIELECTRIC_OFFSET_RANGE.defaultValue,
    new CLModelViewTransform3D(),
  );
  capacitor.plateVoltageProperty.value = BATTERY_VOLTAGE_RANGE.max;
  return capacitor.effectiveEFieldProperty.value;
})();
