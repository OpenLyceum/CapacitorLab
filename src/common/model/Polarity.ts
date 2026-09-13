/**
 * Polarity.ts
 *
 * Polarity of an object, conventionally that of its *top* — the top terminal of
 * the battery, the top plate of a capacitor.
 *
 * Ported from `model/Polarity.java`, which was a Java enum; the fleet forbids
 * `enum`, so this is a frozen const object plus a union type.
 */

export const Polarity = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
} as const;

export type PolarityValue = (typeof Polarity)[keyof typeof Polarity];
