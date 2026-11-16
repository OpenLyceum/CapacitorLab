import { CONTROL_FONTS_SETTINGS } from "../../../CapacitorLabConstants.js";
/**
 * controlFonts.ts
 *
 * The shared look of the side-panel controls: two fonts and the labelled
 * checkbox every panel is built from, so titles and items stay consistent across
 * the five panels that make up a screen's controls.
 */

import type { Property, TReadOnlyProperty } from "scenerystack/axon";
import { Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";

const CONTROL_TITLE_FONT = new PhetFont({ size: CONTROL_FONTS_SETTINGS.CONTROL_TITLE_FONT_SIZE, weight: "bold" });
export const CONTROL_LABEL_FONT = new PhetFont(CONTROL_FONTS_SETTINGS.CONTROL_LABEL_FONT_SIZE);

/** A panel title. */
export function createControlTitle(textProperty: TReadOnlyProperty<string>): Text {
  return new Text(textProperty, { font: CONTROL_TITLE_FONT, fill: CapacitorLabColors.textColorProperty });
}

/** A checkbox with its label, sized for the control panels. */
export function createLabeledCheckbox(textProperty: TReadOnlyProperty<string>, property: Property<boolean>): Checkbox {
  return new Checkbox(
    property,
    new Text(textProperty, { font: CONTROL_LABEL_FONT, fill: CapacitorLabColors.textColorProperty }),
    { boxWidth: CONTROL_FONTS_SETTINGS.CREATE_LABELED_CHECKBOX_BOX_WIDTH },
  );
}
