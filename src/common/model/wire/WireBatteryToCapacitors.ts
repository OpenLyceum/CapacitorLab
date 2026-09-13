/**
 * WireBatteryToCapacitors.ts
 *
 * The two wires that connect a battery (B) to a row of capacitors (C1…Cn).
 *
 * Top wire:
 *
 *     |-----|------|--...--|
 *     |     |      |       |
 *     B     C1    C2       Cn
 *
 * Bottom wire:
 *
 *     B     C1    C2       Cn
 *     |     |      |       |
 *     |-----|------|--...--|
 *
 * Each is one horizontal run spanning battery to rightmost capacitor, plus a
 * vertical drop into every component. The bottom wire additionally passes behind
 * the battery body and the bottom plates, so it subtracts them.
 *
 * Ported from `model/wire/WireBatteryToCapacitors.java`.
 */

import { Vector2 } from "scenerystack/dot";
import type { Battery } from "../Battery.js";
import type { Capacitor } from "../Capacitor.js";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import { WIRE_CORNER_OFFSET, Wire, wireEndOffset } from "./Wire.js";
import {
  createBatteryBottomWireSegment,
  createBatteryTopWireSegment,
  createCapacitorBottomWireSegment,
  createCapacitorTopWireSegment,
  WireSegment,
} from "./WireSegment.js";

/**
 * y of the horizontal run: `wireExtent` clear of whichever capacitor sits nearest
 * it, so the wire never crosses a capacitor it is meant to pass above or below.
 */
function getHorizontalY(isTop: boolean, capacitors: readonly Capacitor[], wireExtent: number): number {
  const ys = capacitors.map((capacitor) =>
    isTop ? capacitor.position.y - wireExtent : capacitor.position.y + wireExtent,
  );
  return isTop ? Math.min(...ys) : Math.max(...ys);
}

function createSegments(
  isTop: boolean,
  thickness: number,
  wireExtent: number,
  battery: Battery,
  capacitors: readonly Capacitor[],
): WireSegment[] {
  const horizontalY = getHorizontalY(isTop, capacitors, wireExtent);
  const rightmost = capacitors[capacitors.length - 1];
  if (rightmost === undefined) {
    throw new Error("a circuit needs at least one capacitor");
  }

  const leftCorner = new Vector2(battery.position.x, horizontalY);
  const rightCorner = new Vector2(rightmost.position.x, horizontalY);
  const t = WIRE_CORNER_OFFSET;
  const endOffset = wireEndOffset(thickness);

  const segments: WireSegment[] = [
    isTop
      ? createBatteryTopWireSegment(battery, endOffset, leftCorner)
      : createBatteryBottomWireSegment(battery, endOffset, leftCorner),
    new WireSegment(new Vector2(leftCorner.x - t, leftCorner.y + t), new Vector2(rightCorner.x + t, rightCorner.y + t)),
    isTop
      ? createCapacitorTopWireSegment(rightmost, rightCorner)
      : createCapacitorBottomWireSegment(rightmost, rightCorner),
  ];

  // Drops into every capacitor left of the rightmost one, which the horizontal
  // run passes over on its way to the corner.
  for (const capacitor of capacitors.slice(0, -1)) {
    const dropPoint = new Vector2(capacitor.position.x, horizontalY);
    segments.push(
      isTop
        ? createCapacitorTopWireSegment(capacitor, dropPoint)
        : createCapacitorBottomWireSegment(capacitor, dropPoint),
    );
  }
  return segments;
}

/** Connects the battery's top terminal to the top plate of every capacitor. */
export function createWireBatteryToCapacitorsTop(
  modelViewTransform: CLModelViewTransform3D,
  thickness: number,
  wireExtent: number,
  battery: Battery,
  capacitors: readonly Capacitor[],
): Wire {
  return new Wire(modelViewTransform, thickness, createSegments(true, thickness, wireExtent, battery, capacitors));
}

/**
 * Connects the battery's bottom terminal to the bottom plate of every capacitor.
 * Runs behind the battery and the bottom plates, so those are cut out of it.
 */
export function createWireBatteryToCapacitorsBottom(
  modelViewTransform: CLModelViewTransform3D,
  thickness: number,
  wireExtent: number,
  battery: Battery,
  capacitors: readonly Capacitor[],
): Wire {
  return new Wire(modelViewTransform, thickness, createSegments(false, thickness, wireExtent, battery, capacitors), {
    occluders: [
      () => battery.shapes.createBodyShape(),
      ...capacitors.map((capacitor) => () => capacitor.shapes.createBottomPlateShape()),
    ],
    occluderDependencies: [
      battery.polarityProperty,
      ...capacitors.map((capacitor) => capacitor.plateSizeProperty),
      ...capacitors.map((capacitor) => capacitor.plateSeparationProperty),
    ],
  });
}
