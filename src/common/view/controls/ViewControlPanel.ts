/**
 * ViewControlPanel.ts
 *
 * "View": which of the two field representations are drawn on the capacitor.
 *
 * Ported from `control/ViewControlPanel.java`.
 */

import type { Property } from "scenerystack/axon";
import { VBox } from "scenerystack/scenery";
import { StringManager } from "../../../i18n/StringManager.js";
import { CapacitorLabPanel } from "../../CapacitorLabPanel.js";
import { createControlTitle, createLabeledCheckbox } from "./controlFonts.js";

export class ViewControlPanel extends CapacitorLabPanel {
  public constructor(plateChargesVisibleProperty: Property<boolean>, eFieldVisibleProperty: Property<boolean>) {
    const strings = StringManager.getInstance().getViewStrings();

    super(
      new VBox({
        align: "left",
        spacing: 6,
        children: [
          createControlTitle(strings.titleStringProperty),
          createLabeledCheckbox(strings.plateChargesStringProperty, plateChargesVisibleProperty),
          createLabeledCheckbox(strings.electricFieldLinesStringProperty, eFieldVisibleProperty),
        ],
      }),
    );
  }
}
