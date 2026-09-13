/**
 * WireShapes.ts
 *
 * A wire's 2D projection, in view coordinates: each segment stroked to the wire's
 * thickness with round caps, then unioned.
 *
 * Stroking in *model* space before projecting is what keeps the wire the same
 * apparent thickness as the rest of the pseudo-3D scene.
 *
 * Ported from `shapes/WireShapeCreator.java`.
 */

import { LineStyles, Shape } from "scenerystack/kite";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import type { WireSegment } from "../wire/WireSegment.js";

export function createWireShape(
  segments: readonly WireSegment[],
  thickness: number,
  modelViewTransform: CLModelViewTransform3D,
): Shape {
  const lineStyles = new LineStyles({ lineWidth: thickness, lineCap: "round", lineJoin: "miter" });

  let shape = new Shape();
  for (const segment of segments) {
    const stroked = new Shape()
      .moveToPoint(segment.startPointProperty.value)
      .lineToPoint(segment.endPointProperty.value)
      .getStrokedShape(lineStyles);
    shape = shape.shapeUnion(stroked);
  }
  return modelViewTransform.modelToViewShape(shape);
}
