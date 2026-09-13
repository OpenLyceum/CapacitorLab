/**
 * CapacitanceControlNode.ts
 *
 * A capacitance slider for one capacitor on the Multiple Capacitors screen.
 *
 * That screen gives the user capacitance directly rather than plate geometry,
 * because the point there is how capacitors *combine*, not what makes a single
 * capacitor's capacitance. Each capacitor gets its own slider, so a network can
 * be built from unequal parts and the combination rules actually have something
 * to say.
 *
 * The slider works in units of 1e-13 F rather than Farads: the raw values are
 * around 0.0000000000001, which no readout can show usefully.
 *
 * Ported from `control/CapacitanceControlNode.java`.
 */

import { DerivedProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import { NumberControl } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { CAPACITANCE_CONTROL_EXPONENT, CAPACITANCE_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { Capacitor } from "../../model/Capacitor.js";
import { CONTROL_LABEL_FONT } from "./controlFonts.js";

const SCALE = 10 ** CAPACITANCE_CONTROL_EXPONENT;

export class CapacitanceControlNode extends Node {
  public constructor(capacitor: Capacitor) {
    super();

    const strings = StringManager.getInstance();

    // The slider's own value, in units of 1e-13 F. Writing it moves the plates,
    // which is how the capacitor realizes the capacitance the user asked for.
    const range = new Range(CAPACITANCE_RANGE.min / SCALE, CAPACITANCE_RANGE.max / SCALE);
    const mantissaProperty = new NumberProperty(capacitor.totalCapacitanceProperty.value / SCALE, { range: range });
    mantissaProperty.link((mantissa: number) => {
      capacitor.setTotalCapacitance(mantissa * SCALE);
    });

    const valuePatternProperty = new DerivedProperty(
      [strings.getUnitStrings().faradsStringProperty],
      (farads: string) => `{{value}} × 10^${CAPACITANCE_CONTROL_EXPONENT} ${farads}`,
    );

    this.addChild(
      new NumberControl(strings.getMeterStrings().capacitanceStringProperty, mantissaProperty, range, {
        titleNodeOptions: { font: CONTROL_LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
        numberDisplayOptions: {
          textOptions: { font: CONTROL_LABEL_FONT },
          decimalPlaces: 2,
          valuePattern: valuePatternProperty,
        },
        sliderOptions: { thumbFill: CapacitorLabColors.dragHandleColorProperty },
        delta: 0.1,
      }),
    );
  }
}
