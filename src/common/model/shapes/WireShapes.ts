/**
 * WireShapes.ts
 *
 * A wire's 2D projection, in view coordinates: each segment stroked to the wire's
 * thickness with round caps, then unioned.
 *
 * Both the stroking and the union happen after projecting to view coordinates.
 * Doing them in model coordinates would be more direct — a wire is 0.5 mm thick
 * in the model — but kite's constructive-area geometry is not reliable at that
 * scale, so the thickness is scaled into view units instead.
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
  // The transform scales x and y equally, so one unit of model length is this
  // many view units — which is what the wire's thickness has to become.
  const scale = modelViewTransform.modelToViewDeltaXYZ(1, 0, 0).x;
  const lineStyles = new LineStyles({ lineWidth: thickness * scale, lineCap: "round", lineJoin: "miter" });

  // Collected and unioned in one go. Folding them into an initially empty Shape
  // instead yields an empty result — kite treats a union with nothing as nothing.
  const strokedSegments = segments.map((segment) => {
    const start = segment.startPointProperty.value;
    const end = segment.endPointProperty.value;
    return new Shape()
      .moveToPoint(modelViewTransform.modelToViewXYZ(start.x, start.y, 0))
      .lineToPoint(modelViewTransform.modelToViewXYZ(end.x, end.y, 0))
      .getStrokedShape(lineStyles);
  });
  return strokedSegments.length === 0 ? new Shape() : Shape.union(strokedSegments);
}
