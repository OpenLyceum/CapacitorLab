/**
 * DielectricNode.ts
 *
 * The slab of insulator between the plates, with its charges drawn on top.
 *
 * It is a {@link TransparentBoxNode} because the things it would otherwise hide —
 * field lines, probes, the plate charges behind it — all have to stay visible
 * when the user asks for them; the screen view decides when to make it
 * see-through.
 *
 * Ported from `view/DielectricNode.java`.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Color } from "scenerystack/scenery";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { DielectricChargeView, type DielectricChargeViewValue } from "../model/DielectricChargeView.js";
import type { DielectricMaterial } from "../model/DielectricMaterial.js";
import { DielectricExcessChargeNode } from "./DielectricExcessChargeNode.js";
import { DielectricTotalChargeNode } from "./DielectricTotalChargeNode.js";
import { TransparentBoxNode } from "./TransparentBoxNode.js";

export class DielectricNode extends TransparentBoxNode {
  public constructor(
    capacitor: Capacitor,
    modelViewTransform: CLModelViewTransform3D,
    dielectricChargeViewProperty: TReadOnlyProperty<DielectricChargeViewValue>,
    maxExcessDielectricPlateCharge: number,
    maxDielectricEField: number,
  ) {
    // Follows the chosen material, so switching from glass to teflon repaints the
    // slab without rebuilding it.
    const colorProperty = new DerivedProperty(
      [capacitor.dielectricMaterialProperty],
      (material: DielectricMaterial) => material.colorProperty.value as Color,
    );

    super(modelViewTransform, colorProperty, capacitor.getDielectricSize());

    const totalChargeNode = new DielectricTotalChargeNode(capacitor, modelViewTransform, maxDielectricEField);
    this.addChild(totalChargeNode);

    const excessChargeNode = new DielectricExcessChargeNode(
      capacitor,
      modelViewTransform,
      maxExcessDielectricPlateCharge,
    );
    // Behind the slab's faces, so that charges away from the edges look like they
    // are embedded in the material rather than painted on it.
    this.insertChild(0, excessChargeNode);

    dielectricChargeViewProperty.link((view: DielectricChargeViewValue) => {
      totalChargeNode.visible = view === DielectricChargeView.TOTAL;
      excessChargeNode.visible = view === DielectricChargeView.EXCESS;
    });
  }
}
