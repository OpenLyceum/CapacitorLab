/**
 * shapeIntersects.ts
 *
 * Do two shapes overlap by more than a line?
 *
 * The sim's meters measure by intersecting a probe-tip shape with a component's
 * shape rather than by hit-testing view nodes — see `doc/implementation-notes.md`
 * for why. That makes this the innermost call of every probe drag, so the cheap
 * bounds test comes first and the constructive-area-geometry work only runs when
 * an overlap is actually possible.
 *
 * Replaces phetcommon's `ShapeUtils.intersects`.
 */

import type { Shape } from "scenerystack/kite";

export function shapeIntersects(a: Shape, b: Shape): boolean {
  return a.bounds.intersectsBounds(b.bounds) && a.shapeIntersection(b).getArea() > 0;
}
