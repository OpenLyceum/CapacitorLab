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
 * The control is a short vertical slider under its readout, narrow enough to sit
 * in the gap beside its capacitor in every circuit layout.
 *
 * Ported from `control/CapacitanceControlNode.java`.
 */

import { DerivedProperty, NumberProperty, PatternStringProperty } from "scenerystack/axon";
import { Dimension2, Range, toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { RichText, VBox } from "scenerystack/scenery";
import { VSlider } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { CAPACITANCE_CONTROL_EXPONENT, CAPACITANCE_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { Capacitor } from "../../model/Capacitor.js";
import { CONTROL_LABEL_FONT } from "./controlFonts.js";

const SCALE = 10 ** CAPACITANCE_CONTROL_EXPONENT;

const TRACK_LENGTH = 60;
const TRACK_THICKNESS = 4;
const THUMB_TOUCH_DILATION = 10;
const THUMB_MOUSE_DILATION = 4;
const READOUT_MAX_WIDTH = 90;
const DECIMAL_PLACES = 2;

export class CapacitanceControlNode extends VBox {
  /**
   * @param capacitor - the capacitor this control sets
   * @param number - the capacitor's number in its circuit (C₁ is 1), for its accessible name
   */
  public constructor(capacitor: Capacitor, number: number) {
    const strings = StringManager.getInstance();
    const a11y = strings.getCommonA11yStrings();

    // The slider's own value, in units of 1e-13 F. Writing it moves the plates,
    // which is how the capacitor realizes the capacitance the user asked for.
    const range = new Range(CAPACITANCE_RANGE.min / SCALE, CAPACITANCE_RANGE.max / SCALE);
    const mantissaProperty = new NumberProperty(capacitor.totalCapacitanceProperty.value / SCALE, { range: range });

    // Two-way: the slider drives the capacitor, and a model change the slider did
    // not make (Reset All, switching circuits) drives the slider back.
    let updating = false;
    mantissaProperty.lazyLink((mantissa: number) => {
      if (!updating) {
        updating = true;
        capacitor.setTotalCapacitance(mantissa * SCALE);
        updating = false;
      }
    });
    capacitor.totalCapacitanceProperty.lazyLink((capacitance: number) => {
      if (!updating) {
        updating = true;
        mantissaProperty.value = range.constrainValue(capacitance / SCALE);
        updating = false;
      }
    });

    const readout = new RichText(
      new DerivedProperty(
        [
          mantissaProperty,
          strings.getPatternStrings().scientificStringProperty,
          strings.getUnitStrings().faradsStringProperty,
        ],
        (mantissa: number, pattern: string, farads: string) =>
          StringUtils.fillIn(pattern, {
            mantissa: toFixed(mantissa, DECIMAL_PLACES),
            exponent: CAPACITANCE_CONTROL_EXPONENT,
            units: farads,
          }),
      ),
      { font: CONTROL_LABEL_FONT, fill: CapacitorLabColors.textColorProperty, maxWidth: READOUT_MAX_WIDTH },
    );

    const slider = new VSlider(mantissaProperty, range, {
      trackSize: new Dimension2(TRACK_THICKNESS, TRACK_LENGTH),
      thumbFill: CapacitorLabColors.dragHandleColorProperty,
      thumbFillHighlighted: CapacitorLabColors.dragHandleHighlightColorProperty,
      thumbTouchAreaXDilation: THUMB_TOUCH_DILATION,
      thumbTouchAreaYDilation: THUMB_TOUCH_DILATION,
      thumbMouseAreaXDilation: THUMB_MOUSE_DILATION,
      thumbMouseAreaYDilation: THUMB_MOUSE_DILATION,
      keyboardStep: 0.1,
      shiftKeyboardStep: 0.01,
      pageKeyboardStep: 0.5,
      // Round for the readout, then clamp: the range ends are not exact in floating point.
      constrainValue: (value: number) => range.constrainValue(Number(toFixed(value, DECIMAL_PLACES))),
      accessibleName: new PatternStringProperty(a11y.capacitorCapacitanceStringProperty, { number: number }),
      pdomCreateAriaValueText: (value: number | null) =>
        StringUtils.fillIn(a11y.scientificStringProperty.value, {
          mantissa: toFixed(value ?? 0, DECIMAL_PLACES),
          exponent: CAPACITANCE_CONTROL_EXPONENT,
        }),
      pdomDependencies: [a11y.scientificStringProperty],
    });

    super({ children: [readout, slider], spacing: 4 });
  }
}
