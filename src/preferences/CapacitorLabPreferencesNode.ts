import { CAPACITOR_LAB_PREFERENCES_NODE_SETTINGS } from "../CapacitorLabConstants.js";
/**
 * CapacitorLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Currently empty —
 * add controls here when the sim gains real preferences.
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import type { Tandem } from "scenerystack/tandem";
import CapacitorLabColors from "../CapacitorLabColors.js";
import CapacitorLabNamespace from "../CapacitorLabNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { CapacitorLabPreferencesModel } from "./CapacitorLabPreferencesModel.js";

/** Preferences dialog content sits on a light background regardless of color profile. */
const PREFERENCES_TEXT_FILL = CapacitorLabColors.controlSurfaceTextColorProperty;

export class CapacitorLabPreferencesNode extends VBox {
  public constructor(_preferencesModel: CapacitorLabPreferencesModel, _tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: CAPACITOR_LAB_PREFERENCES_NODE_SETTINGS.HEADER_FONT_SIZE, weight: "bold" }),
      fill: PREFERENCES_TEXT_FILL,
    });

    super({
      align: "left",
      spacing: CAPACITOR_LAB_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [header],
    });
  }
}

CapacitorLabNamespace.register("CapacitorLabPreferencesNode", CapacitorLabPreferencesNode);
