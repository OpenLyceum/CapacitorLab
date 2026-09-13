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

import { DerivedProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { Image, Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { VSlider } from "scenerystack/sun";
import { CapacitorLabImages } from "../../assets/images.js";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import { BATTERY_VOLTAGE_RANGE, BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD } from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { Battery } from "../model/Battery.js";
import { Polarity, type PolarityValue } from "../model/Polarity.js";

/** Slider track height as a fraction of the battery image's height. */
const TRACK_LENGTH_FRACTION = 0.6;

const TICK_LABEL_FONT = new PhetFont(14);

export class BatteryNode extends Node {
  public constructor(battery: Battery) {
    super();

    const imageNode = new Image(CapacitorLabImages.batteryUp);
    this.addChild(imageNode);
    // Origin at the battery's centre, which is where the model places it.
    imageNode.centerX = 0;
    imageNode.centerY = 0;

    const unitStrings = StringManager.getInstance().getUnitStrings();

    const slider = new VSlider(battery.voltageProperty, BATTERY_VOLTAGE_RANGE, {
      trackSize: new Dimension2(2, TRACK_LENGTH_FRACTION * imageNode.height),
      thumbFill: CapacitorLabColors.dragHandleColorProperty,
      thumbFillHighlighted: CapacitorLabColors.dragHandleHighlightColorProperty,
      // A dead zone around zero: without it, landing exactly on zero by dragging
      // is a matter of luck, and zero is the value users most want to hit.
      constrainValue: (value: number) => (Math.abs(value) < BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD ? 0 : value),
    });

    // Built as a Property rather than a string so the unit follows a locale change.
    const createTickLabel = (value: number): Node =>
      new Text(
        new DerivedProperty(
          [unitStrings.voltsStringProperty],
          (volts: string) => `${value === 0 ? "0" : value.toFixed(1)} ${volts}`,
        ),
        { font: TICK_LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
      );

    slider.addMajorTick(BATTERY_VOLTAGE_RANGE.max, createTickLabel(BATTERY_VOLTAGE_RANGE.max));
    slider.addMajorTick(0, createTickLabel(0));
    slider.addMajorTick(BATTERY_VOLTAGE_RANGE.min, createTickLabel(BATTERY_VOLTAGE_RANGE.min));

    this.addChild(slider);
    slider.centerX = imageNode.centerX;
    slider.centerY = imageNode.centerY;

    battery.polarityProperty.link((polarity: PolarityValue) => {
      imageNode.image = polarity === Polarity.POSITIVE ? CapacitorLabImages.batteryUp : CapacitorLabImages.batteryDown;
    });
  }
}
