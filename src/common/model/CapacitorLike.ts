/**
 * CapacitorLike.ts
 *
 * Structural surface used by CapacitorShapes (avoids Capacitor↔CapacitorShapes cycle).
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Dimension3, Vector3 } from "scenerystack/dot";

export type CapacitorLike = {
  readonly position: Vector3;
  readonly plateSeparationProperty: TReadOnlyProperty<number>;
  readonly plateSizeProperty: TReadOnlyProperty<Dimension3>;
  readonly dielectricOffsetProperty: TReadOnlyProperty<number>;
  getDielectricSize(): Dimension3;
  getPlateWidth(): number;
  getTopPlateCenter(): Vector3;
};
