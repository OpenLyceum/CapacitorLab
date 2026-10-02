/**
 * BatteryNode.ts
 *
 * The battery, with the slider that sets its voltage mounted on its body.
 *
 * The artwork flips when the voltage goes negative, so the terminals visibly swap
 * ends rather than the sign changing only in the numbers. The slider snaps to
 * zero near the middle, which makes "no voltage" reachable by dragging instead of
 * something the user has to creep up on.
 *
 * Ported from `view/BatteryNode.java` and `control/VoltageSliderNode.java`. The
 * Java sim hand-built its slider; this uses `VSlider`, which brings keyboard
 * support the original did not have.
 */

import { PatternStringProperty } from "scenerystack/axon";
import { Dimension2, toFixed } from "scenerystack/dot";
import { StringUtils } from "scenerystack/phetcommon";
import { Image, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { VSlider } from "scenerystack/sun";
import { CapacitorLabImages } from "../../assets/images.js";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import { BATTERY_VOLTAGE_RANGE, BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD } from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { Battery } from "../model/Battery.js";
import { Polarity, type PolarityValue } from "../model/Polarity.js";

/**
 * Track length in view pixels. A fixed number rather than a fraction of the
 * battery image: the artwork is an SVG whose intrinsic size is not known until it
 * loads, and a track built from a zero height fails immediately.
 */
const TRACK_LENGTH = 80;
const TRACK_THICKNESS = 4;

/** How far the thumb's touch and mouse areas extend past its drawn edge. */
const THUMB_TOUCH_DILATION = 10;
const THUMB_MOUSE_DILATION = 4;

const TICK_LABEL_FONT = new PhetFont(14);

export class BatteryNode extends Node {
  public constructor(battery: Battery) {
    super();

    const imageNode = new Image(CapacitorLabImages.batteryUp);
    this.addChild(imageNode);

    const strings = StringManager.getInstance();
    const unitStrings = strings.getUnitStrings();
    const valueUnitsPattern = strings.getPatternStrings().valueUnitsStringProperty;

    const slider = new VSlider(battery.voltageProperty, BATTERY_VOLTAGE_RANGE, {
      // VSlider takes its track size as (thickness, length) and rotates it.
      trackSize: new Dimension2(TRACK_THICKNESS, TRACK_LENGTH),
      thumbTouchAreaXDilation: THUMB_TOUCH_DILATION,
      thumbTouchAreaYDilation: THUMB_TOUCH_DILATION,
      thumbMouseAreaXDilation: THUMB_MOUSE_DILATION,
      thumbMouseAreaYDilation: THUMB_MOUSE_DILATION,
      accessibleName: strings.getCommonA11yStrings().batteryVoltageStringProperty,
      pdomCreateAriaValueText: (value: number | null) =>
        StringUtils.fillIn(valueUnitsPattern.value, {
          value: toFixed(value ?? 0, 2),
          units: unitStrings.voltsStringProperty.value,
        }),
      pdomDependencies: [valueUnitsPattern, unitStrings.voltsStringProperty],
      thumbFill: CapacitorLabColors.dragHandleColorProperty,
      thumbFillHighlighted: CapacitorLabColors.dragHandleHighlightColorProperty,
      // A dead zone around zero: without it, landing exactly on zero by dragging
      // is a matter of luck, and zero is the value users most want to hit.
      constrainValue: (value: number) => (Math.abs(value) < BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD ? 0 : value),
    });

    // Built as a Property rather than a string so the unit follows a locale change.
    const createTickLabel = (value: number): Node =>
      new Text(
        new PatternStringProperty(valueUnitsPattern, {
          value: value === 0 ? toFixed(value, 0) : toFixed(value, 1),
          units: unitStrings.voltsStringProperty,
        }),
        { font: TICK_LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
      );

    slider.addMajorTick(BATTERY_VOLTAGE_RANGE.max, createTickLabel(BATTERY_VOLTAGE_RANGE.max));
    slider.addMajorTick(0, createTickLabel(0));
    slider.addMajorTick(BATTERY_VOLTAGE_RANGE.min, createTickLabel(BATTERY_VOLTAGE_RANGE.min));

    this.addChild(slider);

    // The model puts the battery's origin at its centre, and the artwork's size
    // is only known once the SVG has loaded — so recentre whenever it changes.
    imageNode.boundsProperty.link(() => {
      imageNode.centerX = 0;
      imageNode.centerY = 0;
      slider.centerX = 0;
      slider.centerY = 0;
    });

    battery.polarityProperty.link((polarity: PolarityValue) => {
      imageNode.image = polarity === Polarity.POSITIVE ? CapacitorLabImages.batteryUp : CapacitorLabImages.batteryDown;
    });
  }
}
