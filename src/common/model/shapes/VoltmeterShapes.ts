/**
 * VoltmeterShapes.ts
 *
 * The two probe tips, as small rectangles in view coordinates.
 *
 * Each tip is rotated by −yaw before projection so that it lies flat against the
 * scene's pseudo-3D perspective — a probe touching a plate should read that plate
 * whichever way the plate is facing.
 *
 * Ported from `shapes/VoltmeterShapeCreator.java`.
 */

import { Dimension2, Matrix3, type Vector3 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";

/** Size of a probe tip, metres. */
export const PROBE_TIP_SIZE = new Dimension2(0.0005, 0.0015);

export function createProbeTipShape(origin: Vector3, modelViewTransform: CLModelViewTransform3D): Shape {
  const { width, height } = PROBE_TIP_SIZE;
  const rectangle = Shape.rectangle(origin.x - width / 2, origin.y, width, height);

  // Rotate about the tip's own origin, so the probe pivots where it touches.
  const rotation = Matrix3.translation(origin.x, origin.y)
    .timesMatrix(Matrix3.rotation2(-modelViewTransform.yaw))
    .timesMatrix(Matrix3.translation(-origin.x, -origin.y));

  return modelViewTransform.modelToViewShape(rectangle.transformed(rotation));
}
