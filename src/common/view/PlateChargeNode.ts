/**
 * PlateChargeNode.ts
 *
 * The grid of + or − symbols on one region of one plate.
 *
 * A plate can face two different things at once — dielectric on one side of the
 * slab's edge, air on the other — and they hold different amounts of charge. So
 * each plate carries two of these nodes, one per region, and each is told where
 * its region starts and how wide it is.
 *
 * The number of symbols is proportional to the charge, capped at
 * `NUMBER_OF_PLATE_CHARGES.max`, and any non-zero charge shows at least one
 * symbol so that "a little charge" never looks like "no charge".
 *
 * Ported from `view/PlateChargeNode.java`.
 */

import { Multilink } from "scenerystack/axon";
import { Node } from "scenerystack/scenery";
import { NUMBER_OF_PLATE_CHARGES } from "../../CapacitorLabConstants.js";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { Polarity, type PolarityValue } from "../model/Polarity.js";
import { createNegativeChargeNode, createPositiveChargeNode } from "./chargeNodes.js";
import { getGridSize } from "./gridSize.js";

/** Which region of the plate a node draws, and how much charge that region holds. */
export type PlateChargeRegion = {
  /** Charge in this region, Coulombs. Signed. */
  getPlateCharge: (capacitor: Capacitor) => number;

  /** Left edge of the region, in model x relative to the plate's centre. */
  getContactXOrigin: (capacitor: Capacitor) => number;

  /** Width of the region, metres. */
  getContactWidth: (capacitor: Capacitor) => number;
};

/** The part of the plate facing the dielectric slab. */
export const DIELECTRIC_REGION: PlateChargeRegion = {
  getPlateCharge: (capacitor) => capacitor.dielectricPlateChargeProperty.value,
  getContactXOrigin: (capacitor) => -(capacitor.getPlateWidth() / 2) + capacitor.dielectricOffsetProperty.value,
  getContactWidth: (capacitor) => Math.max(0, capacitor.getPlateWidth() - capacitor.dielectricOffsetProperty.value),
};

/**
 * The part of the plate the slab has vacated. Its width is the offset, capped at
 * the plate width — once the slab is fully out, the whole plate faces air.
 */
export const AIR_REGION: PlateChargeRegion = {
  getPlateCharge: (capacitor) => capacitor.airPlateChargeProperty.value,
  getContactXOrigin: (capacitor) => -capacitor.getPlateWidth() / 2,
  getContactWidth: (capacitor) => Math.min(capacitor.dielectricOffsetProperty.value, capacitor.getPlateWidth()),
};

export type PlateChargeNodeOptions = {
  /**
   * Opacity of the symbols. The bottom plate draws its dielectric-facing charges
   * faintly, because they sit behind the slab and would otherwise compete with
   * the ones on top of it.
   */
  chargeOpacity?: number;
};

/**
 * How many symbols to draw for a given charge. Anything non-zero gets at least
 * one, so that a nearly discharged plate still reads as charged.
 */
export function getNumberOfCharges(plateCharge: number, maxPlateCharge: number): number {
  const absoluteCharge = Math.abs(plateCharge);
  const count = Math.trunc((NUMBER_OF_PLATE_CHARGES.max * absoluteCharge) / maxPlateCharge);
  if (absoluteCharge > 0 && count < NUMBER_OF_PLATE_CHARGES.min) {
    return NUMBER_OF_PLATE_CHARGES.min;
  }
  return count;
}

export class PlateChargeNode extends Node {
  private readonly capacitor: Capacitor;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private readonly polarity: PolarityValue;
  private readonly maxPlateCharge: number;
  private readonly region: PlateChargeRegion;
  private readonly chargeOpacity: number;
  private readonly chargeParent = new Node();

  public constructor(
    capacitor: Capacitor,
    modelViewTransform: CLModelViewTransform3D,
    polarity: PolarityValue,
    maxPlateCharge: number,
    region: PlateChargeRegion,
    options?: PlateChargeNodeOptions,
  ) {
    super();

    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;
    this.polarity = polarity;
    this.maxPlateCharge = maxPlateCharge;
    this.region = region;
    this.chargeOpacity = options?.chargeOpacity ?? 1;

    this.addChild(this.chargeParent);

    Multilink.multilink(
      [capacitor.plateSizeProperty, capacitor.dielectricOffsetProperty, capacitor.plateVoltageProperty],
      () => this.update(),
    );
    this.update();
  }

  /**
   * A plate reads positive when its charge and its polarity agree — the top plate
   * with positive charge, or the bottom plate with negative charge. Reversing the
   * battery swaps both, and the symbols follow.
   */
  private isPositivelyCharged(): boolean {
    const charge = this.region.getPlateCharge(this.capacitor);
    return (charge >= 0 && this.polarity === Polarity.POSITIVE) || (charge < 0 && this.polarity === Polarity.NEGATIVE);
  }

  private update(): void {
    this.chargeParent.removeAllChildren();

    const numberOfCharges = getNumberOfCharges(this.region.getPlateCharge(this.capacitor), this.maxPlateCharge);
    if (numberOfCharges === 0) {
      return;
    }

    const createCharge = this.isPositivelyCharged() ? createPositiveChargeNode : createNegativeChargeNode;

    // Inset the grid by one symbol's width so symbols do not overhang the plate's
    // front and back edges.
    const zMargin = this.modelViewTransform.viewToModelDeltaXY(createCharge().width, 0).x;
    const gridWidth = this.region.getContactWidth(this.capacitor);
    const gridDepth = this.capacitor.getPlateDepth() - 2 * zMargin;

    const { columns, rows } = getGridSize(numberOfCharges, gridWidth, gridDepth);
    const dx = gridWidth / columns;
    const dz = gridDepth / rows;

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const charge = createCharge();
        charge.opacity = this.chargeOpacity;

        const x = this.region.getContactXOrigin(this.capacitor) + dx / 2 + column * dx;
        let z = -(gridDepth / 2) + zMargin / 2 + dz / 2 + row * dz;

        // A lone charge sits dead centre, which is exactly where the wire meets
        // the top plate and hides it. Nudge it clear.
        if (numberOfCharges === 1) {
          z -= dz / 6;
        }

        charge.center = this.modelViewTransform.modelToViewXYZ(x, 0, z);
        this.chargeParent.addChild(charge);
      }
    }
  }
}
