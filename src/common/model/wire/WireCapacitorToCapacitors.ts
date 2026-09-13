/**
 * WireCapacitorToCapacitors.ts
 *
 * The wire joining one capacitor's bottom plate to the top plates of the
 * capacitors stacked below it — the junction inside a series or combination
 * circuit.
 *
 *     C1
 *     |
 *     |-----|
 *     |     |
 *     C2    C3
 *
 * With a single capacitor below, it is one vertical segment. With several, a
 * horizontal run is inserted halfway between the rows and each lower capacitor
 * drops from it. The wire passes behind the upper capacitor's bottom plate, so
 * that plate is cut out of it.
 *
 * Ported from `model/wire/WireCapacitorToCapacitors.java`.
 */

import { Vector2 } from "scenerystack/dot";
import type { Capacitor } from "../Capacitor.js";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import { WIRE_CORNER_OFFSET, Wire } from "./Wire.js";
import { createCapacitorToCapacitorWireSegment, createCapacitorTopWireSegment, WireSegment } from "./WireSegment.js";

export function createWireCapacitorToCapacitors(
  modelViewTransform: CLModelViewTransform3D,
  thickness: number,
  topCapacitor: Capacitor,
  bottomCapacitors: readonly Capacitor[],
): Wire {
  const leftmostBottom = bottomCapacitors[0];
  if (leftmostBottom === undefined) {
    throw new Error("a capacitor-to-capacitors wire needs at least one lower capacitor");
  }

  const segments: WireSegment[] = [createCapacitorToCapacitorWireSegment(topCapacitor, leftmostBottom)];

  if (bottomCapacitors.length > 1) {
    const rightmostBottom = bottomCapacitors[bottomCapacitors.length - 1];
    if (rightmostBottom === undefined) {
      throw new Error("unreachable: length > 1 guarantees a last element");
    }
    const t = WIRE_CORNER_OFFSET;
    const y = topCapacitor.position.y + (leftmostBottom.position.y - topCapacitor.position.y) / 2;

    segments.push(
      new WireSegment(new Vector2(topCapacitor.position.x - t, y), new Vector2(rightmostBottom.position.x + t, y)),
    );
    for (const capacitor of bottomCapacitors.slice(1)) {
      segments.push(createCapacitorTopWireSegment(capacitor, new Vector2(capacitor.position.x, y)));
    }
  }

  return new Wire(modelViewTransform, thickness, segments, {
    occluders: [() => topCapacitor.shapes.createBottomPlateShape()],
    occluderDependencies: [topCapacitor.plateSizeProperty, topCapacitor.plateSeparationProperty],
  });
}
