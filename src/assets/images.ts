/**
 * images.ts
 *
 * Central map from image keys to bundled asset URLs.
 *
 * The battery artwork is PhET's, taken from the Java sim's vector originals
 * (`assets/battery_3D_*.svg`) rather than its exported PNGs, so it stays sharp at
 * any zoom. Credited in CREDITS.md.
 */

import batteryDownUrl from "./images/battery-down.svg";
import batteryUpUrl from "./images/battery-up.svg";

export const CapacitorLabImages = {
  /** Battery drawn with its positive terminal up — the state at positive voltage. */
  batteryUp: batteryUpUrl,

  /** Battery drawn upside down, for negative voltage. */
  batteryDown: batteryDownUrl,
} as const;

export type CapacitorLabImageKey = keyof typeof CapacitorLabImages;
