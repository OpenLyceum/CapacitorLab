/**
 * WorldBounds.ts
 *
 * The rectangle, in model coordinates, that draggable objects are confined to.
 *
 * The bounds start empty and are filled in by the ScreenView once it knows its
 * visible bounds — until then `getClosest` constrains nothing. That is the same
 * bootstrapping order the Java sim used, and it is why every draggable position
 * is a {@link WorldPositionProperty}, which re-clamps itself whenever the bounds
 * change (on a window resize, say).
 *
 * Ported from `model/WorldBounds.java`.
 */

import { Property } from "scenerystack/axon";
import { Bounds2, Vector3 } from "scenerystack/dot";
import { WORLD_DRAG_MARGIN } from "../../CapacitorLabConstants.js";

export class WorldBounds extends Property<Bounds2> {
  public constructor() {
    super(Bounds2.NOTHING);
  }

  /** True before the ScreenView has reported its visible bounds. */
  public isEmpty(): boolean {
    return this.value.width === 0 || this.value.height === 0;
  }

  public containsPoint(point: Vector3): boolean {
    return this.value.containsCoordinates(point.x, point.y);
  }

  /**
   * The point inside the bounds nearest to `point`, keeping at least `margin`
   * clear of every edge so a dragged object never sits flush against one. z is
   * passed through: the bounds are a 2D projection and say nothing about depth.
   */
  public getClosest(point: Vector3, margin: number = WORLD_DRAG_MARGIN): Vector3 {
    if (this.isEmpty()) {
      return point;
    }
    const bounds = this.value;
    const x = Math.min(Math.max(point.x, bounds.minX + margin), bounds.maxX - margin);
    const y = Math.min(Math.max(point.y, bounds.minY + margin), bounds.maxY - margin);
    return new Vector3(x, y, point.z);
  }
}
