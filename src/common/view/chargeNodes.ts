/**
 * chargeNodes.ts
 *
 * The + and − symbols drawn on the plates and in the dielectric.
 *
 * Both are built from scenery-phet's `PlusNode` / `MinusNode` so the two glyphs
 * share a stroke weight and sit on the same optical baseline. A plus is square at
 * the minus symbol's length, which is what makes a mixed grid read evenly.
 *
 * Ported from `view/PlusNode.java`, `MinusNode.java`, `PositiveChargeNode.java`
 * and `NegativeChargeNode.java`.
 */

import { Dimension2 } from "scenerystack/dot";
import type { Node } from "scenerystack/scenery";
import { MinusNode, PlusNode } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import { NEGATIVE_CHARGE_SIZE } from "../../CapacitorLabConstants.js";

/** A minus sign: a short bar, wider than it is tall. */
export function createNegativeChargeNode(): Node {
  return new MinusNode({
    size: new Dimension2(NEGATIVE_CHARGE_SIZE.width, NEGATIVE_CHARGE_SIZE.height),
    fill: CapacitorLabColors.negativeChargeColorProperty,
  });
}

/** A plus sign, sized so its arms match the minus sign's bar. */
export function createPositiveChargeNode(): Node {
  return new PlusNode({
    size: new Dimension2(NEGATIVE_CHARGE_SIZE.width, NEGATIVE_CHARGE_SIZE.height),
    fill: CapacitorLabColors.positiveChargeColorProperty,
  });
}
