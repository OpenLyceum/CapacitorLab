/**
 * CapacitorShapes.ts
 *
 * 2D projections of a capacitor's parts, in view coordinates, used to answer the
 * questions the meters ask: is the voltmeter probe touching the top plate? is the
 * E-field probe inside the dielectric, or in the air beside it?
 *
 * The "occluded" variants subtract the top plate, because the top plate is drawn
 * in front of everything else — a probe over that region is touching the top
 * plate, not what lies behind it.
 *
 * Ported from `shapes/CapacitorShapeCreator.java`.
 */

import { Shape } from "scenerystack/kite";
import type { Capacitor } from "../Capacitor.js";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import { BoxShapes } from "./BoxShapes.js";

/** Stand-in for "no shape at all" — contains nothing and intersects nothing. */
function createEmptyShape(): Shape {
  return new Shape();
}

export class CapacitorShapes {
  private readonly capacitor: Capacitor;
  private readonly boxShapes: BoxShapes;

  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D) {
    this.capacitor = capacitor;
    this.boxShapes = new BoxShapes(modelViewTransform);
  }

  // ── Parts ───────────────────────────────────────────────────────────────────

  public createTopPlateShape(): Shape {
    const { position } = this.capacitor;
    return this.boxShapes.createBoxShape(
      position.x,
      this.capacitor.getTopPlateCenter().y,
      position.z,
      this.capacitor.plateSizeProperty.value,
    );
  }

  public createBottomPlateShape(): Shape {
    const { position } = this.capacitor;
    return this.boxShapes.createBoxShape(
      position.x,
      position.y + this.capacitor.plateSeparationProperty.value / 2,
      position.z,
      this.capacitor.plateSizeProperty.value,
    );
  }

  /** The dielectric slab, wherever it currently sits — possibly mostly outside the plates. */
  public createDielectricShape(): Shape {
    const { position } = this.capacitor;
    const size = this.capacitor.getDielectricSize();
    return this.boxShapes.createBoxShape(
      position.x + this.capacitor.dielectricOffsetProperty.value,
      position.y - size.height / 2,
      position.z,
      size,
    );
  }

  /** The whole volume between the plates, regardless of what fills it. */
  public createBetweenPlatesShape(): Shape {
    const { position } = this.capacitor;
    return this.boxShapes.createBoxShape(
      position.x,
      position.y - this.capacitor.plateSeparationProperty.value / 2,
      position.z,
      this.capacitor.getDielectricSize(),
    );
  }

  /** The part of the gap the dielectric fills. */
  public createDielectricBetweenPlatesShape(): Shape {
    if (this.capacitor.dielectricOffsetProperty.value >= this.capacitor.getPlateWidth()) {
      return createEmptyShape();
    }
    return this.createDielectricShape().shapeIntersection(this.createBetweenPlatesShape());
  }

  /** The part of the gap the dielectric has vacated. */
  public createAirBetweenPlatesShape(): Shape {
    if (this.capacitor.dielectricOffsetProperty.value === 0) {
      return createEmptyShape();
    }
    return this.createBetweenPlatesShape().shapeDifference(this.createDielectricBetweenPlatesShape());
  }

  // ── Occluded variants, for probe hit-testing ────────────────────────────────

  public createTopPlateShapeOccluded(): Shape {
    return this.createTopPlateShape();
  }

  public createBottomPlateShapeOccluded(): Shape {
    return this.createBottomPlateShape().shapeDifference(this.createTopPlateShape());
  }

  public createDielectricBetweenPlatesShapeOccluded(): Shape {
    return this.createDielectricBetweenPlatesShape().shapeDifference(this.createTopPlateShape());
  }

  public createAirBetweenPlatesShapeOccluded(): Shape {
    return this.createAirBetweenPlatesShape().shapeDifference(this.createTopPlateShape());
  }
}
