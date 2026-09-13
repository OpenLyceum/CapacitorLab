/**
 * WireSegment.ts
 *
 * One straight run of wire, defined by its two endpoints in the model's xy plane
 * (wires have no depth — they are drawn flat at z = 0).
 *
 * Most segments are fixed, but the ones that touch a component have to follow it:
 * a segment leaving the battery moves when the polarity flips, because the two
 * terminals sit at different heights, and a segment leaving a capacitor moves when
 * the plates separate. The factory functions below wire up those links.
 *
 * Ported from `model/wire/WireSegment.java`, whose subclasses are replaced here by
 * factories — the only thing that varied was which property to listen to.
 */

import { Property } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import type { Battery } from "../Battery.js";
import type { Capacitor } from "../Capacitor.js";

export class WireSegment {
  public readonly startPointProperty: Property<Vector2>;
  public readonly endPointProperty: Property<Vector2>;

  public constructor(startPoint: Vector2, endPoint: Vector2) {
    this.startPointProperty = new Property(startPoint);
    this.endPointProperty = new Property(endPoint);
  }
}

/**
 * A segment from the battery's top terminal. `startYOffset` pulls the wire back
 * inside the terminal so the two do not visibly overlap; the sign differs between
 * the raised positive terminal and the recessed negative one.
 */
export function createBatteryTopWireSegment(battery: Battery, startYOffset: number, endPoint: Vector2): WireSegment {
  const segment = new WireSegment(
    new Vector2(battery.position.x, battery.position.y + battery.getTopTerminalYOffset()),
    endPoint,
  );
  battery.polarityProperty.link(() => {
    segment.startPointProperty.value = new Vector2(
      battery.position.x,
      battery.position.y + battery.getTopTerminalYOffset() - startYOffset,
    );
  });
  return segment;
}

/** A segment from the battery's bottom terminal, which never moves. */
export function createBatteryBottomWireSegment(battery: Battery, startYOffset: number, endPoint: Vector2): WireSegment {
  return new WireSegment(
    new Vector2(battery.position.x, battery.position.y + battery.getBottomTerminalYOffset() + startYOffset),
    endPoint,
  );
}

/** A segment from a capacitor's top plate, which rises and falls with the separation. */
export function createCapacitorTopWireSegment(capacitor: Capacitor, endPoint: Vector2): WireSegment {
  const topCenter = capacitor.getTopPlateCenter();
  const segment = new WireSegment(new Vector2(topCenter.x, topCenter.y), endPoint);
  capacitor.plateSeparationProperty.link(() => {
    const center = capacitor.getTopPlateCenter();
    segment.startPointProperty.value = new Vector2(center.x, center.y);
  });
  return segment;
}

/** A segment from a capacitor's bottom plate. */
export function createCapacitorBottomWireSegment(capacitor: Capacitor, endPoint: Vector2): WireSegment {
  const bottomCenter = capacitor.getBottomPlateCenter();
  const segment = new WireSegment(new Vector2(bottomCenter.x, bottomCenter.y), endPoint);
  capacitor.plateSeparationProperty.link(() => {
    const center = capacitor.getBottomPlateCenter();
    segment.startPointProperty.value = new Vector2(center.x, center.y);
  });
  return segment;
}

/** The segment joining a stacked pair of capacitors, following both of them. */
export function createCapacitorToCapacitorWireSegment(
  topCapacitor: Capacitor,
  bottomCapacitor: Capacitor,
): WireSegment {
  const start = topCapacitor.getBottomPlateCenter();
  const end = bottomCapacitor.getTopPlateCenter();
  const segment = new WireSegment(new Vector2(start.x, start.y), new Vector2(end.x, end.y));

  const update = (): void => {
    const newStart = topCapacitor.getBottomPlateCenter();
    const newEnd = bottomCapacitor.getTopPlateCenter();
    segment.startPointProperty.value = new Vector2(newStart.x, newStart.y);
    segment.endPointProperty.value = new Vector2(newEnd.x, newEnd.y);
  };
  topCapacitor.plateSeparationProperty.link(update);
  bottomCapacitor.plateSeparationProperty.link(update);
  return segment;
}
