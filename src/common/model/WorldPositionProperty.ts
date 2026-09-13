/**
 * WorldPositionProperty.ts
 *
 * Position of a draggable object, clamped to the play area.
 *
 * Clamping happens on write rather than in the drag listener, so every writer —
 * pointer drag, keyboard drag, reset — gets it for free, and the property also
 * re-clamps itself when the play area changes size. Used by the voltmeter body
 * and probes, the E-field detector body and probe, and all three bar meters.
 *
 * Ported from `model/WorldLocationProperty.java`.
 */

import { Property } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { WorldBounds } from "./WorldBounds.js";

export class WorldPositionProperty extends Property<Vector3> {
  private readonly worldBounds: WorldBounds;

  public constructor(worldBounds: WorldBounds, position: Vector3) {
    super(position);
    this.worldBounds = worldBounds;

    // A resize can leave an object outside the new play area; re-writing the
    // current value pushes it back in through the clamp below.
    worldBounds.link(() => {
      this.value = this.value;
    });
  }

  public override set(position: Vector3): void {
    super.set(this.worldBounds.getClosest(position));
  }
}
