/**
 * DragHandleNode.ts
 *
 * The pieces every drag handle is built from: a dashed line marking what is being
 * measured, a double-headed arrow to grab, and a label reading the current value.
 *
 * Ported from `drag/DragHandleArrowNode.java`, `DragHandleLineNode.java` and
 * `DragHandleValueNode.java`.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path, RichText, Text } from "scenerystack/scenery";
import { ArrowNode, PhetFont } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { DRAG_HANDLE_ARROW_LENGTH } from "../../../CapacitorLabConstants.js";

const LABEL_FONT = new PhetFont({ size: 18, weight: "bold" });
const VALUE_FONT = new PhetFont(16);

/**
 * The grabbable arrow. Its head and tail are proportional to its length so the
 * three handles look like one family at their different sizes.
 */
export function createDragHandleArrow(length = DRAG_HANDLE_ARROW_LENGTH): ArrowNode {
  return new ArrowNode(0, 0, length, 0, {
    doubleHead: true,
    headHeight: length / 4,
    headWidth: length / 2,
    tailWidth: length / 6,
    fill: CapacitorLabColors.dragHandleColorProperty,
    stroke: CapacitorLabColors.boxStrokeColorProperty,
    lineWidth: 1,
    cursor: "pointer",
  });
}

/** The dashed line showing the extent the arrow adjusts. */
export function createDragHandleLine(length: number): Path {
  return new Path(Shape.lineSegment(0, 0, length, 0), {
    stroke: CapacitorLabColors.textColorProperty,
    lineWidth: 3,
    lineDash: [3, 3],
  });
}

/**
 * A bold label over the current value and its unit, e.g. "Separation" / "10.0 mm".
 * Both are Properties, so the readout follows the model and the locale.
 */
export class DragHandleValueNode extends Node {
  public constructor(
    labelProperty: TReadOnlyProperty<string>,
    valueProperty: TReadOnlyProperty<number>,
    unitsProperty: TReadOnlyProperty<string>,
  ) {
    super();

    const label = new Text(labelProperty, { font: LABEL_FONT, fill: CapacitorLabColors.textColorProperty });
    const value = new RichText(
      new DerivedProperty([valueProperty, unitsProperty], (v: number, units: string) => `${v.toFixed(1)} ${units}`),
      { font: VALUE_FONT, fill: CapacitorLabColors.textColorProperty },
    );

    this.addChild(label);
    this.addChild(value);
    value.left = label.left;
    value.top = label.bottom + 1;
  }
}
