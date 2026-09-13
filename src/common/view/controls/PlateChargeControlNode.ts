/**
 * PlateChargeControlNode.ts
 *
 * The slider that sets the plate charge directly, shown only while the battery is
 * disconnected.
 *
 * With the battery out, charge is the independent variable and voltage follows as
 * V = Q/C — so changing the plate geometry now changes the voltage instead of the
 * charge. This control is how the user pins the charge down in the first place.
 *
 * The ticks are labelled in words rather than numbers ("lots (+)", "none") because
 * the values are around 1e-13 C and the point being made is about sign and
 * magnitude, not about reading a figure off a scale.
 *
 * Ported from `control/PlateChargeControlNode.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { VSlider } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { PLATE_CHARGE_CONTROL_SNAP_TO_ZERO_THRESHOLD } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import { MAX_PLATE_CHARGE } from "../../model/CLCalibration.js";
import type { SingleCircuit } from "../../model/circuit/SingleCircuit.js";

const TICK_LABEL_FONT = new PhetFont(14);
const TRACK_SIZE = new Dimension2(6, 200);

export class PlateChargeControlNode extends Node {
  public constructor(circuit: SingleCircuit) {
    super();

    const strings = StringManager.getInstance().getPlateChargeControlStrings();
    const range = new Range(-MAX_PLATE_CHARGE, MAX_PLATE_CHARGE);

    const slider = new VSlider(circuit.disconnectedPlateChargeProperty, range, {
      trackSize: TRACK_SIZE,
      thumbFill: CapacitorLabColors.dragHandleColorProperty,
      thumbFillHighlighted: CapacitorLabColors.dragHandleHighlightColorProperty,
      // Zero charge is a state worth being able to hit exactly.
      constrainValue: (value: number) => (Math.abs(value) < PLATE_CHARGE_CONTROL_SNAP_TO_ZERO_THRESHOLD ? 0 : value),
    });

    const createLabel = (textProperty: TReadOnlyProperty<string>): Node =>
      new Text(textProperty, { font: TICK_LABEL_FONT, fill: CapacitorLabColors.textColorProperty });

    slider.addMajorTick(range.max, createLabel(strings.lotsPositiveStringProperty));
    slider.addMajorTick(0, createLabel(strings.noneStringProperty));
    slider.addMajorTick(range.min, createLabel(strings.lotsNegativeStringProperty));

    this.addChild(slider);

    // Only meaningful while the battery is out; with it connected, charge is not
    // the user's to set.
    circuit.batteryConnectedProperty.link((connected: boolean) => {
      this.visible = !connected;
    });
  }
}
