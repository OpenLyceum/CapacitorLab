/**
 * TransparentBoxNode.ts
 *
 * A {@link BoxNode} that can be made see-through, with its three hidden faces
 * outlined so the solid still reads as a solid when you can see through it.
 *
 * This is what the dielectric slab is drawn with: it has to go translucent
 * whenever the user turns on something it would otherwise hide — E-field lines,
 * either meter's probe, or the excess-charge view.
 *
 * Ported from `view/TransparentBoxNode.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Dimension3 } from "scenerystack/dot";
import type { Color } from "scenerystack/scenery";
import { Path } from "scenerystack/scenery";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { BoxNode } from "./BoxNode.js";

/** How much of the slab shows through when something behind it matters. */
const TRANSPARENT_OPACITY = 0.5;

export class TransparentBoxNode extends BoxNode {
  private readonly bottomPath: Path;
  private readonly backPath: Path;
  private readonly leftSidePath: Path;

  public constructor(
    modelViewTransform: CLModelViewTransform3D,
    colorProperty: TReadOnlyProperty<Color>,
    size: Dimension3,
  ) {
    super(modelViewTransform, colorProperty, size);

    // Outlines only: filling them would defeat the point of seeing through.
    const backFaceOptions = {
      fill: null,
      stroke: CapacitorLabColors.boxStrokeColorProperty,
      lineWidth: 1,
    };
    this.bottomPath = new Path(this.boxShapes.createBottomFace(size), backFaceOptions);
    this.backPath = new Path(this.boxShapes.createBackFace(size), backFaceOptions);
    this.leftSidePath = new Path(this.boxShapes.createLeftSideFace(size), backFaceOptions);

    // Behind the visible faces, so a solid box looks solid.
    this.insertChild(0, this.bottomPath);
    this.insertChild(0, this.backPath);
    this.insertChild(0, this.leftSidePath);
  }

  protected override updateShapes(): void {
    super.updateShapes();
    // Guarded: the base constructor calls this before these paths exist.
    if (this.bottomPath === undefined) {
      return;
    }
    const size = this.getBoxSize();
    this.bottomPath.shape = this.boxShapes.createBottomFace(size);
    this.backPath.shape = this.boxShapes.createBackFace(size);
    this.leftSidePath.shape = this.boxShapes.createLeftSideFace(size);
  }

  public setTransparent(transparent: boolean): void {
    this.opacity = transparent ? TRANSPARENT_OPACITY : 1;
  }
}
