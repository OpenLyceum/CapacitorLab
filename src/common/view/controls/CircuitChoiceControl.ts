/**
 * CircuitChoiceControl.ts
 *
 * "Circuits": the seven arrangements on the Multiple Capacitors screen.
 *
 * Ported from `control/CircuitChoiceControl.java`.
 */

import type { Property } from "scenerystack/axon";
import { Text, VBox } from "scenerystack/scenery";
import { AquaRadioButtonGroup } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { StringManager } from "../../../i18n/StringManager.js";
import { CapacitorLabPanel } from "../../CapacitorLabPanel.js";
import type { Circuit } from "../../model/circuit/Circuit.js";
import { CONTROL_LABEL_FONT, createControlTitle } from "./controlFonts.js";

export class CircuitChoiceControl extends CapacitorLabPanel {
  public constructor(circuits: readonly Circuit[], currentCircuitProperty: Property<Circuit>) {
    const buttons = new AquaRadioButtonGroup<Circuit>(
      currentCircuitProperty,
      circuits.map((circuit) => ({
        value: circuit,
        createNode: () =>
          new Text(circuit.displayNameProperty, {
            font: CONTROL_LABEL_FONT,
            fill: CapacitorLabColors.textColorProperty,
          }),
      })),
      { spacing: 4, radioButtonOptions: { radius: 8 } },
    );

    super(
      new VBox({
        align: "left",
        spacing: 8,
        children: [createControlTitle(StringManager.getInstance().getCircuitStrings().titleStringProperty), buttons],
      }),
    );
  }
}
