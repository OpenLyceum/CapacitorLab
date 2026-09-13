/**
 * CLModelViewTransform3D.ts
 *
 * Transforms between the model's 3D coordinate system and the view's 2D one.
 * In both, +x is right, +y is down, +z is away from the viewer; rotation signs
 * follow the right-hand rule.
 *
 *     +y
 *     ^    +z
 *     |   /
 *     |  /
 *     | /
 *     +-------> +x
 *
 * The projection is parallel with no vanishing point — a point's z simply
 * displaces it by `z·sin(pitch)` in the direction `yaw`. That is exactly what
 * scenery-phet's `YawPitchModelViewTransform3` computes, so this class delegates
 * to it rather than re-deriving the arithmetic. It exists to give that untyped
 * module a typed face (its `.d.ts` types `yaw` and `pitch` as `any`) and to keep
 * the sim's own defaults in one place.
 *
 * Ported from `model/CLModelViewTransform3D.java`.
 */

import type { Bounds2, Vector2, Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { YawPitchModelViewTransform3 } from "scenerystack/scenery-phet";
import { MVT_PITCH, MVT_SCALE, MVT_YAW } from "../../CapacitorLabConstants.js";

export type CLModelViewTransform3DOptions = {
  /** Model-to-view scale factor; x and y scale identically. */
  scale?: number;
  /** Rotation about the horizontal (x) axis, radians. */
  pitch?: number;
  /** Rotation about the vertical (y) axis, radians. */
  yaw?: number;
};

export class CLModelViewTransform3D {
  /** Rotation about the vertical axis, radians. Read by shape creators that must un-rotate. */
  public readonly yaw: number;

  /** Rotation about the horizontal axis, radians. */
  public readonly pitch: number;

  /**
   * The scenery-phet transform underneath. Exposed because `BoxShapeCreator`
   * takes one directly; prefer the typed methods on this class everywhere else.
   */
  public readonly transform: YawPitchModelViewTransform3;

  public constructor(options?: CLModelViewTransform3DOptions) {
    const scale = options?.scale ?? MVT_SCALE;
    this.pitch = options?.pitch ?? MVT_PITCH;
    this.yaw = options?.yaw ?? MVT_YAW;
    this.transform = new YawPitchModelViewTransform3({ scale: scale, pitch: this.pitch, yaw: this.yaw });
  }

  // ── Model to view ───────────────────────────────────────────────────────────

  public modelToViewPosition(modelPoint: Vector3): Vector2 {
    return this.transform.modelToViewPosition(modelPoint);
  }

  public modelToViewXYZ(x: number, y: number, z: number): Vector2 {
    return this.transform.modelToViewXYZ(x, y, z);
  }

  public modelToViewDelta(delta: Vector3): Vector2 {
    return this.transform.modelToViewDelta(delta);
  }

  public modelToViewDeltaXYZ(xDelta: number, yDelta: number, zDelta: number): Vector2 {
    return this.transform.modelToViewDeltaXYZ(xDelta, yDelta, zDelta);
  }

  /** Model shapes lie in the 2D xy plane and have no depth. */
  public modelToViewShape(modelShape: Shape): Shape {
    return this.transform.modelToViewShape(modelShape);
  }

  /** Bounds lie in the 2D xy plane and have no depth. */
  public modelToViewBounds(modelBounds: Bounds2): Bounds2 {
    return this.transform.modelToViewBounds(modelBounds);
  }

  // ── View to model ───────────────────────────────────────────────────────────

  /**
   * Maps a 2D view point to 3D model coordinates, with z = 0. This is not the
   * inverse of {@link modelToViewPosition} — that mapping is not injective, since
   * every point on a line of sight projects to the same view point.
   */
  public viewToModelPosition(viewPoint: Vector2): Vector3 {
    return this.transform.viewToModelPosition(viewPoint);
  }

  public viewToModelXY(x: number, y: number): Vector3 {
    return this.transform.viewToModelXY(x, y);
  }

  public viewToModelDelta(delta: Vector2): Vector3 {
    return this.transform.viewToModelDelta(delta);
  }

  public viewToModelDeltaXY(xDelta: number, yDelta: number): Vector3 {
    return this.transform.viewToModelDeltaXY(xDelta, yDelta);
  }

  public viewToModelShape(viewShape: Shape): Shape {
    return this.transform.viewToModelShape(viewShape);
  }

  public viewToModelBounds(viewBounds: Bounds2): Bounds2 {
    return this.transform.viewToModelBounds(viewBounds);
  }
}
