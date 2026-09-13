/**
 * DielectricTotalChargeNode.ts
 *
 * All the charge in the dielectric, drawn as a lattice of +/− pairs.
 *
 * With no field the two symbols of each pair sit on top of one another: the
 * material is unpolarized and shows no net charge anywhere. As the field grows,
 * the negative symbol slides away from the positive one, and the pairs *inside*
 * the plates separate while those outside stay neutral — which is the picture
 * that explains why the dielectric increases capacitance.
 *
 * The separation goes as the fourth root of the field, not linearly: the visible
 * effect otherwise saturates almost immediately at usable field strengths.
 *
 * Ported from `view/DielectricTotalChargeNode.java`.
 */

import { Multilink } from "scenerystack/axon";
import { Node } from "scenerystack/scenery";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { Polarity, type PolarityValue } from "../model/Polarity.js";
import { createNegativeChargeNode, createPositiveChargeNode } from "./chargeNodes.js";

/** Lattice pitch, view pixels. */
const SPACING_BETWEEN_PAIRS = 45;

/** How far apart a pair can be pulled, view pixels. */
const MAX_NEGATIVE_CHARGE_OFFSET = SPACING_BETWEEN_PAIRS / 2;

/** Compresses the field range so the separation is visible well before saturation. */
const SPACING_EXPONENT = 1 / 4;

/** A + and a − at the same place, until a field pulls them apart. */
class ChargePairNode extends Node {
  private readonly negativeNode: Node;

  public constructor() {
    super();
    this.addChild(createPositiveChargeNode());
    // Negative on top, so an unseparated pair still reads as a pair.
    this.negativeNode = createNegativeChargeNode();
    this.addChild(this.negativeNode);
  }

  public setNegativeChargeOffset(offset: number, polarity: PolarityValue): void {
    this.negativeNode.y = polarity === Polarity.POSITIVE ? offset : -offset;
  }
}

export class DielectricTotalChargeNode extends Node {
  private readonly capacitor: Capacitor;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private readonly maxDielectricEField: number;
  private readonly chargeParent = new Node();

  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D, maxDielectricEField: number) {
    super();

    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;
    this.maxDielectricEField = maxDielectricEField;
    this.addChild(this.chargeParent);

    Multilink.multilink(
      [
        capacitor.plateSizeProperty,
        capacitor.plateSeparationProperty,
        capacitor.dielectricOffsetProperty,
        capacitor.dielectricConstantProperty,
        capacitor.plateVoltageProperty,
      ],
      () => this.update(),
    );
    this.update();
  }

  private getNegativeChargeOffset(eField: number): number {
    const fraction = (Math.abs(eField) / this.maxDielectricEField) ** SPACING_EXPONENT;
    return fraction * MAX_NEGATIVE_CHARGE_OFFSET;
  }

  private update(): void {
    this.chargeParent.removeAllChildren();

    const eField = this.capacitor.dielectricEFieldProperty.value;
    const separatedOffset = this.getNegativeChargeOffset(eField);
    const spacing = this.modelViewTransform.viewToModelDeltaXY(SPACING_BETWEEN_PAIRS, 0).x;

    const size = this.capacitor.getDielectricSize();
    const rows = Math.trunc(size.height / spacing);
    const columns = Math.trunc(size.width / spacing);
    const xMargin = (size.width - columns * spacing) / 2;
    const yMargin = (size.height - rows * spacing) / 2;
    const zMargin = xMargin;
    const offset = spacing / 2;

    const polarity = eField >= 0 ? Polarity.NEGATIVE : Polarity.POSITIVE;

    // Pairs left of this x are between the plates; the rest have slid out.
    const xPlateEdge = -(size.width / 2) + (size.width - this.capacitor.dielectricOffsetProperty.value);

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const y = yMargin + offset + row * spacing;

        // Front face of the slab.
        const frontPair = new ChargePairNode();
        const frontX = -(size.width / 2) + offset + xMargin + column * spacing;
        frontPair.center = this.modelViewTransform.modelToViewXYZ(frontX, y, -size.depth / 2);
        frontPair.setNegativeChargeOffset(frontX <= xPlateEdge ? separatedOffset : 0, polarity);
        this.chargeParent.addChild(frontPair);

        // Right face. It is only ever between the plates when the slab is fully
        // inserted, so it polarizes all at once rather than column by column.
        const sidePair = new ChargePairNode();
        const sideZ = -size.depth / 2 + offset + zMargin + column * spacing;
        sidePair.center = this.modelViewTransform.modelToViewXYZ(size.width / 2, y, sideZ);
        sidePair.setNegativeChargeOffset(
          this.capacitor.dielectricOffsetProperty.value === 0 ? separatedOffset : 0,
          polarity,
        );
        this.chargeParent.addChild(sidePair);
      }
    }
  }
}
