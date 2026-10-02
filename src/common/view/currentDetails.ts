/** Builds the concise, screen-reader-friendly live physics summary. */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { StringManager } from "../../i18n/StringManager.js";
import type { CapacitorLabModel } from "../model/CapacitorLabModel.js";

const scientificPatternProperty = StringManager.getInstance().getCommonA11yStrings().scientificStringProperty;

/** Spoken scientific notation, e.g. "1.00 times 10 to the power -13", rather than "1.00e-13". */
function scientific(value: number): string {
  if (value === 0) {
    return "0";
  }
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  return StringUtils.fillIn(scientificPatternProperty.value, {
    mantissa: toFixed(value / 10 ** exponent, 2),
    exponent: exponent,
  });
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
      scientificPatternProperty,
      ...circuitNameProperties,
    ],
    () =>
      StringUtils.fillIn(patternProperty.value, {
        circuit: model.circuitProperty.value.displayNameProperty.value,
        capacitance: scientific(model.capacitanceMeter.valueProperty.value),
        charge: scientific(model.plateChargeMeter.valueProperty.value),
        energy: scientific(model.storedEnergyMeter.valueProperty.value),
      }),
  );
}
