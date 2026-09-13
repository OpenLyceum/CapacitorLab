/**
 * DielectricExcessChargeNode.ts
 *
 * Only the *net* charge the dielectric shows — a sheet of one sign on the face
 * near the positive plate and the opposite sign near the negative plate.
 *
 * This is the same physics as the total-charge view with the interior pairs
 * cancelled out, which is what makes the two views worth toggling between: the
 * total view shows why the surface charge appears, this one shows what it does.
 *
 * Ported from `view/DielectricExcessChargeNode.java`.
 */

import { Multilink } from "scenerystack/axon";
import { Node } from "scenerystack/scenery";
import { NUMBER_OF_PLATE_CHARGES } from "../../CapacitorLabConstants.js";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { createNegativeChargeNode, createPositiveChargeNode } from "./chargeNodes.js";
import { getGridSize } from "./gridSize.js";

export class DielectricExcessChargeNode extends Node {
  private readonly capacitor: Capacitor;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private readonly maxExcessDielectricPlateCharge: number;
  private readonly chargeParent = new Node();

  public constructor(
    capacitor: Capacitor,
    modelViewTransform: CLModelViewTransform3D,
    maxExcessDielectricPlateCharge: number,
  ) {
    super();

    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;
    this.maxExcessDielectricPlateCharge = maxExcessDielectricPlateCharge;
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

  /**
   * Note the absence of a square root here. Excess charge is around 1e-14 C, and
   * rooting a number that small makes it *larger* — the Java sim carried the same
   * warning.
   */
  private getNumberOfCharges(excessCharge: number): number {
    const absoluteCharge = Math.abs(excessCharge);
    const count = Math.trunc((NUMBER_OF_PLATE_CHARGES.max * absoluteCharge) / this.maxExcessDielectricPlateCharge);
    if (absoluteCharge > 0 && count < NUMBER_OF_PLATE_CHARGES.min) {
      return NUMBER_OF_PLATE_CHARGES.min;
    }
    return count;
  }

  private update(): void {
    this.chargeParent.removeAllChildren();

    const excessCharge = this.capacitor.excessDielectricPlateChargeProperty.value;
    const size = this.capacitor.getDielectricSize();
    const contactWidth = Math.max(0, size.width - this.capacitor.dielectricOffsetProperty.value);
    if (excessCharge === 0 || contactWidth <= 0) {
      return;
    }

    // Positive excess charge means the top face faces a positive plate, so it
    // carries the negative sheet.
    const createTopCharge = excessCharge > 0 ? createNegativeChargeNode : createPositiveChargeNode;
    const createBottomCharge = excessCharge > 0 ? createPositiveChargeNode : createNegativeChargeNode;

    const sampleCharge = createTopCharge();
    const zMargin = this.modelViewTransform.viewToModelDeltaXY(sampleCharge.width, 0).x;
    const yOffset = this.modelViewTransform.viewToModelDeltaXY(0, sampleCharge.height + 1).y;

    const gridWidth = contactWidth;
    const gridDepth = size.depth - 2 * zMargin;
    const { columns, rows } = getGridSize(this.getNumberOfCharges(excessCharge), gridWidth, gridDepth);
    const dx = gridWidth / columns;
    const dz = gridDepth / rows;

    // Bottom face: a full grid, since it is seen from below through the slab.
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const charge = createBottomCharge();
        const x = -size.width / 2 + dx / 2 + column * dx;
        const z = -size.depth / 2 + dz / 2 + row * dz;
        charge.center = this.modelViewTransform.modelToViewXYZ(x, size.height - yOffset, z);
        this.chargeParent.addChild(charge);
      }
    }

    // Top face: only its two visible edges, since the top plate covers the rest.
    let x = 0;
    for (let column = 0; column < columns; column++) {
      const charge = createTopCharge();
      x = -size.width / 2 + dx / 2 + column * dx;
      charge.center = this.modelViewTransform.modelToViewXYZ(x, yOffset, -size.depth / 2);
      this.chargeParent.addChild(charge);
    }
    // Carry on from where the front edge ended, along the right edge.
    x += dx / 2;
    for (let row = 0; row < rows; row++) {
      const charge = createTopCharge();
      const z = -size.depth / 2 + dz / 2 + row * dz;
      charge.center = this.modelViewTransform.modelToViewXYZ(x, yOffset, z);
      this.chargeParent.addChild(charge);
    }
  }
}
