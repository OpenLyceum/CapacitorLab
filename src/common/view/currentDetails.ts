/** Builds the concise, screen-reader-friendly live physics summary. */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { CapacitorLabModel } from "../model/CapacitorLabModel.js";

function scientific(value: number): string {
  return value === 0 ? "0" : value.toExponential(2).replace("e+", "e");
}

export function createCurrentDetailsProperty(
  model: CapacitorLabModel,
  patternProperty: TReadOnlyProperty<string>,
  circuitNameProperties: readonly TReadOnlyProperty<string>[] = [],
): TReadOnlyProperty<string> {
  return DerivedProperty.deriveAny(
    [
      patternProperty,
      model.circuitProperty,
      model.capacitanceMeter.valueProperty,
      model.plateChargeMeter.valueProperty,
      model.storedEnergyMeter.valueProperty,
      ...circuitNameProperties,
    ],
    () =>
      patternProperty.value
        .replace("{{circuit}}", model.circuitProperty.value.displayNameProperty.value)
        .replace("{{capacitance}}", scientific(model.capacitanceMeter.valueProperty.value))
        .replace("{{charge}}", scientific(model.plateChargeMeter.valueProperty.value))
        .replace("{{energy}}", scientific(model.storedEnergyMeter.valueProperty.value)),
  );
}
