/**
 * boxShapes.ts
 *
 * Pseudo-3D box faces, projected to 2D view coordinates.
 *
 * A box is drawn as three visible parallelograms — top, front and right side —
 * and its "shape" for hit-testing purposes is their union. The vertex arithmetic
 * is scenery-phet's `BoxShapeCreator`, which is the same projection the Java sim
 * used; this module adds the three hidden faces (bottom, back, left) that the
 * Java `BoxShapeCreator` also offered and that the translucent dielectric slab
 * needs in order to show its far edges.
 *
 * A box's origin sits at the centre of its top face, and +y points down, so a box
 * of height h occupies y through y + h.
 *
 * Ported from `shapes/BoxShapeCreator.java`.
 */

import type { Dimension3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { BoxShapeCreator } from "scenerystack/scenery-phet";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";

export class BoxShapes {
  private readonly creator: BoxShapeCreator;

  public constructor(modelViewTransform: CLModelViewTransform3D) {
    this.creator = new BoxShapeCreator(modelViewTransform.transform);
  }

  /** The whole box: top, front and right faces unioned. */
  public createBoxShape(x: number, y: number, z: number, size: Dimension3): Shape {
    return this.creator.createBoxShape(x, y, z, size.width, size.height, size.depth);
  }

  // ── Visible faces ───────────────────────────────────────────────────────────

  public createTopFace(size: Dimension3): Shape {
    return this.creator.createTopFace(0, 0, 0, size.width, size.height, size.depth);
  }

  public createFrontFace(size: Dimension3): Shape {
    return this.creator.createFrontFace(0, 0, 0, size.width, size.height, size.depth);
  }

  public createRightSideFace(size: Dimension3): Shape {
    return this.creator.createRightSideFace(0, 0, 0, size.width, size.height, size.depth);
  }

  // ── Hidden faces ────────────────────────────────────────────────────────────
  // Each is the opposite visible face translated across the box, exactly as the
  // Java version derived them.

  public createBottomFace(size: Dimension3): Shape {
    return this.creator.createTopFace(0, size.height, 0, size.width, size.height, size.depth);
  }

  public createBackFace(size: Dimension3): Shape {
    return this.creator.createFrontFace(0, 0, size.depth, size.width, size.height, size.depth);
  }

  public createLeftSideFace(size: Dimension3): Shape {
    return this.creator.createRightSideFace(-size.width, 0, 0, size.width, size.height, size.depth);
  }
}
