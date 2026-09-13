/**
 * DielectricChargeView.ts
 *
 * How dielectric charges are drawn: not at all, all of them, or only the excess.
 *
 * This lives in the model rather than the view because the model is what knows
 * the difference — `Capacitor` computes total and excess charge separately, and
 * the choice also drives whether the dielectric slab is made translucent. Ported
 * from `model/DielectricChargeView.java`.
 */

export const DielectricChargeView = {
  NONE: "none",
  TOTAL: "total",
  EXCESS: "excess",
} as const;

export type DielectricChargeViewValue = (typeof DielectricChargeView)[keyof typeof DielectricChargeView];
