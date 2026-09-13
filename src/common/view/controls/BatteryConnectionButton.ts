/**
 * BatteryConnectionButton.ts
 *
 * Connects or disconnects the battery on the Introduction and Dielectric screens.
 *
 * Disconnecting is what lets the plate charge be held fixed while the geometry
 * changes — the inverse of the connected case, where the voltage is fixed and the
 * charge follows. The button's label reads as the action it performs, so it says
 * "Disconnect Battery" while the battery is connected.
 *
 * Ported from `control/BatteryConnectionButtonNode.java`.
 */

import { DerivedProperty } from "scenerystack/axon";
import { PhetFont } from "scenerystack/scenery-phet";
import { TextPushButton } from "scenerystack/sun";
import { StringManager } from "../../../i18n/StringManager.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../CapacitorLabButtonOptions.js";
import type { SingleCircuit } from "../../model/circuit/SingleCircuit.js";

export class BatteryConnectionButton extends TextPushButton {
  public constructor(circuit: SingleCircuit) {
    const strings = StringManager.getInstance().getBatteryStrings();
    const labelProperty = new DerivedProperty(
      [circuit.batteryConnectedProperty, strings.connectStringProperty, strings.disconnectStringProperty],
      (connected: boolean, connect: string, disconnect: string) => (connected ? disconnect : connect),
    );

    super(labelProperty, {
      ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
      font: new PhetFont(20),
      textFill: LIGHT_SURFACE_TEXT_FILL,
      listener: () => {
        circuit.batteryConnectedProperty.value = !circuit.batteryConnectedProperty.value;
      },
    });
  }
}
