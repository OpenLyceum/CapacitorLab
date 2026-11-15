/**
 * BatteryLike.ts
 *
 * Structural surface used by BatteryShapes (avoids Battery↔BatteryShapes cycle).
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { PolarityValue } from "./Polarity.js";

export type BatteryLike = {
  readonly position: Vector3;
  readonly polarityProperty: TReadOnlyProperty<PolarityValue>;
  getTopTerminalYOffset(): number;
};
