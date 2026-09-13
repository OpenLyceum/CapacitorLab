/**
 * MetersControlPanel.ts
 *
 * "Meters": which instruments are out on the play area.
 *
 * The first two labels differ by screen — a single capacitor has a "Capacitance"
 * and a "Plate Charge", a network has a "Total Capacitance" and a "Stored Charge"
 * — so they are passed in rather than fixed here.
 *
 * Ported from `control/MetersControlPanel.java`.
 */

import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { VBox } from "scenerystack/scenery";
import { StringManager } from "../../../i18n/StringManager.js";
import { CapacitorLabPanel } from "../../CapacitorLabPanel.js";
import { createControlTitle, createLabeledCheckbox } from "./controlFonts.js";

export type MetersControlPanelOptions = {
  capacitanceLabelProperty: TReadOnlyProperty<string>;
  plateChargeLabelProperty: TReadOnlyProperty<string>;
  capacitanceVisibleProperty: Property<boolean>;
  plateChargeVisibleProperty: Property<boolean>;
  storedEnergyVisibleProperty: Property<boolean>;
  voltmeterVisibleProperty: Property<boolean>;
  eFieldDetectorVisibleProperty: Property<boolean>;
};

export class MetersControlPanel extends CapacitorLabPanel {
  public constructor(options: MetersControlPanelOptions) {
    const strings = StringManager.getInstance().getMeterStrings();

    super(
      new VBox({
        align: "left",
        spacing: 6,
        children: [
          createControlTitle(strings.titleStringProperty),
          createLabeledCheckbox(options.capacitanceLabelProperty, options.capacitanceVisibleProperty),
          createLabeledCheckbox(options.plateChargeLabelProperty, options.plateChargeVisibleProperty),
          createLabeledCheckbox(strings.storedEnergyStringProperty, options.storedEnergyVisibleProperty),
          createLabeledCheckbox(strings.voltmeterStringProperty, options.voltmeterVisibleProperty),
          createLabeledCheckbox(strings.electricFieldDetectorStringProperty, options.eFieldDetectorVisibleProperty),
        ],
      }),
    );
  }
}
