/**
 * CapacitorNode.ts
 *
 * A whole capacitor: two plates, the field lines between them, and the dielectric
 * slab.
 *
 * Draw order is what makes the pseudo-3D read correctly — bottom plate, then the
 * field, then the slab, then the top plate in front of everything. Geometry is
 * rebuilt whenever the plates resize or move, since the projection of a box
 * depends on its dimensions rather than just its scale.
 *
 * Ported from `view/CapacitorNode.java`.
 */

import { Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Node } from "scenerystack/scenery";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import type { DielectricChargeViewValue } from "../model/DielectricChargeView.js";
import { CapacitorNodeCalibration } from "./CapacitorNodeCalibration.js";
import { DielectricNode } from "./DielectricNode.js";
import { EFieldNode } from "./EFieldNode.js";
import { createBottomPlateNode, createTopPlateNode, type PlateNode } from "./PlateNode.js";

export type CapacitorNodeOptions = {
  /** False on the Introduction screen, where the gap is air and the slab is never shown. */
  dielectricVisible: boolean;
};

export class CapacitorNode extends Node {
  public readonly dielectricNode: DielectricNode;

  private readonly capacitor: Capacitor;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private readonly topPlateNode: PlateNode;
  private readonly bottomPlateNode: PlateNode;

  public constructor(
    capacitor: Capacitor,
    modelViewTransform: CLModelViewTransform3D,
    plateChargeVisibleProperty: TReadOnlyProperty<boolean>,
    eFieldVisibleProperty: TReadOnlyProperty<boolean>,
    dielectricChargeViewProperty: TReadOnlyProperty<DielectricChargeViewValue>,
    options: CapacitorNodeOptions,
  ) {
    super();

    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;

    const { maxPlateCharge, maxExcessDielectricPlateCharge, maxEffectiveEField, maxDielectricEField } =
      CapacitorNodeCalibration;

    this.topPlateNode = createTopPlateNode(capacitor, modelViewTransform, maxPlateCharge);
    this.bottomPlateNode = createBottomPlateNode(capacitor, modelViewTransform, maxPlateCharge);
    const eFieldNode = new EFieldNode(capacitor, modelViewTransform, maxEffectiveEField);
    this.dielectricNode = new DielectricNode(
      capacitor,
      modelViewTransform,
      dielectricChargeViewProperty,
      maxExcessDielectricPlateCharge,
      maxDielectricEField,
    );

    // Back to front. The top plate goes last so it occludes everything inside.
    this.addChild(this.bottomPlateNode);
    this.addChild(eFieldNode);
    this.addChild(this.dielectricNode);
    this.addChild(this.topPlateNode);

    this.dielectricNode.visible = options.dielectricVisible;

    Multilink.multilink(
      [capacitor.plateSizeProperty, capacitor.plateSeparationProperty, capacitor.dielectricOffsetProperty],
      () => this.updateGeometry(),
    );
    this.updateGeometry();

    plateChargeVisibleProperty.link((visible: boolean) => {
      this.topPlateNode.setChargeVisible(visible);
      this.bottomPlateNode.setChargeVisible(visible);
    });
    eFieldVisibleProperty.link((visible: boolean) => {
      eFieldNode.visible = visible;
    });
  }

  /** Makes the slab see-through, so whatever is behind it stays readable. */
  public setDielectricTransparent(transparent: boolean): void {
    this.dielectricNode.setTransparent(transparent);
  }

  private updateGeometry(): void {
    const plateSize = this.capacitor.plateSizeProperty.value;
    const dielectricSize = this.capacitor.getDielectricSize();

    this.topPlateNode.setBoxSize(plateSize);
    this.bottomPlateNode.setBoxSize(plateSize);
    this.dielectricNode.setBoxSize(dielectricSize);

    const separation = this.capacitor.plateSeparationProperty.value;
    this.topPlateNode.translation = this.modelViewTransform.modelToViewDeltaXYZ(
      0,
      -separation / 2 - this.capacitor.getPlateHeight(),
      0,
    );
    this.bottomPlateNode.translation = this.modelViewTransform.modelToViewDeltaXYZ(0, separation / 2, 0);
    this.dielectricNode.translation = this.modelViewTransform.modelToViewDeltaXYZ(
      this.capacitor.dielectricOffsetProperty.value,
      -dielectricSize.height / 2,
      0,
    );
  }
}
