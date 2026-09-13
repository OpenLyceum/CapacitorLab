/**
 * PlateNode.ts
 *
 * One capacitor plate: a metal box with charge symbols on the face that looks
 * into the gap.
 *
 * Two charge nodes, not one: the part of the plate facing the dielectric and the
 * part facing air hold different charges, and the boundary between them moves as
 * the slab slides. On the bottom plate the dielectric-facing charges are drawn
 * faintly, since they sit behind the slab.
 *
 * Ported from `view/PlateNode.java`.
 */

import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { Polarity, type PolarityValue } from "../model/Polarity.js";
import { BoxNode } from "./BoxNode.js";
import { AIR_REGION, DIELECTRIC_REGION, PlateChargeNode } from "./PlateChargeNode.js";

/** How faint the bottom plate's dielectric-facing charges are. */
const OCCLUDED_CHARGE_OPACITY = 0.25;

export class PlateNode extends BoxNode {
  private readonly dielectricPlateChargeNode: PlateChargeNode;
  private readonly airPlateChargeNode: PlateChargeNode;

  public constructor(
    capacitor: Capacitor,
    modelViewTransform: CLModelViewTransform3D,
    polarity: PolarityValue,
    maxPlateCharge: number,
    dielectricChargeOpacity: number,
  ) {
    super(modelViewTransform, CapacitorLabColors.plateColorProperty, capacitor.plateSizeProperty.value);

    this.dielectricPlateChargeNode = new PlateChargeNode(
      capacitor,
      modelViewTransform,
      polarity,
      maxPlateCharge,
      DIELECTRIC_REGION,
      { chargeOpacity: dielectricChargeOpacity },
    );
    this.airPlateChargeNode = new PlateChargeNode(capacitor, modelViewTransform, polarity, maxPlateCharge, AIR_REGION);

    this.addChild(this.dielectricPlateChargeNode);
    this.addChild(this.airPlateChargeNode);
  }

  public setChargeVisible(visible: boolean): void {
    this.dielectricPlateChargeNode.visible = visible;
    this.airPlateChargeNode.visible = visible;
  }
}

/** The upper plate, positive when the battery is the right way up. */
export function createTopPlateNode(
  capacitor: Capacitor,
  modelViewTransform: CLModelViewTransform3D,
  maxPlateCharge: number,
): PlateNode {
  return new PlateNode(capacitor, modelViewTransform, Polarity.POSITIVE, maxPlateCharge, 1);
}

/** The lower plate. Its dielectric-facing charges show through the slab, so they are dimmed. */
export function createBottomPlateNode(
  capacitor: Capacitor,
  modelViewTransform: CLModelViewTransform3D,
  maxPlateCharge: number,
): PlateNode {
  return new PlateNode(capacitor, modelViewTransform, Polarity.NEGATIVE, maxPlateCharge, OCCLUDED_CHARGE_OPACITY);
}
