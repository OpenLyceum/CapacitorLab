/**
 * CircuitConfig.ts
 *
 * The geometry and material settings every circuit is built from. Each screen
 * fixes these once and hands the same object to every circuit it creates, which
 * is what makes the seven circuits on the Multiple Capacitors screen line up
 * with each other and with the battery.
 *
 * Ported from `model/CircuitConfig.java`. The Java version also carried the
 * clock; here stepping comes from the screen model instead.
 */

import type { Vector3 } from "scenerystack/dot";
import type { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import type { DielectricMaterial } from "./DielectricMaterial.js";

export type CircuitConfig = {
  readonly modelViewTransform: CLModelViewTransform3D;

  /** Centre of the battery in the 3D model frame, metres. */
  readonly batteryPosition: Vector3;

  /** Horizontal gap between adjacent capacitors, metres. */
  readonly capacitorXSpacing: number;

  /** Vertical gap between stacked capacitors, metres. */
  readonly capacitorYSpacing: number;

  /** Initial plate side length, metres. */
  readonly plateWidth: number;

  /** Initial distance between plates, metres. */
  readonly plateSeparation: number;

  /** Material initially between the plates. */
  readonly dielectricMaterial: DielectricMaterial;

  /** How far the dielectric starts withdrawn, metres. */
  readonly dielectricOffset: number;

  /** Wire thickness, metres. */
  readonly wireThickness: number;

  /** How far a wire runs above or below the topmost capacitor's origin, metres. */
  readonly wireExtent: number;
};
