/**
 * BoxNode.ts
 *
 * A box drawn in the sim's pseudo-3D projection: three parallelograms for the
 * top, front and right faces, each a progressively darker shade of one base
 * colour so the solid reads as lit from above.
 *
 * The base colour is a Property, so the faces re-derive when the user switches to
 * projector mode. That is the reason this is not scenery-phet's `BoxNode`, which
 * hardcodes its stroke and shading.
 *
 * Ported from `view/BoxNode.java`.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Dimension3 } from "scenerystack/dot";
import { Color, Node, Path, type TColor } from "scenerystack/scenery";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import { BoxShapes } from "../model/shapes/BoxShapes.js";

/**
 * One step darker, preserving alpha. Scenery's `darkerColor` already keeps the
 * alpha channel, so this is just the named step the Java sim applied once for the
 * front face and twice for the side.
 */
function darker(color: Color): Color {
  return color.darkerColor();
}

export class BoxNode extends Node {
  protected readonly boxShapes: BoxShapes;

  private readonly topPath: Path;
  private readonly frontPath: Path;
  private readonly rightSidePath: Path;
  private size: Dimension3;

  public constructor(
    modelViewTransform: CLModelViewTransform3D,
    colorProperty: TReadOnlyProperty<Color>,
    size: Dimension3,
  ) {
    super();

    this.boxShapes = new BoxShapes(modelViewTransform);
    this.size = size;

    const stroke = CapacitorLabColors.boxStrokeColorProperty;
    const frontColorProperty = new DerivedProperty([colorProperty], (color: Color) => darker(color));
    const sideColorProperty = new DerivedProperty([colorProperty], (color: Color) => darker(darker(color)));

    this.topPath = new Path(this.boxShapes.createTopFace(size), { fill: colorProperty, stroke: stroke, lineWidth: 1 });
    this.frontPath = new Path(this.boxShapes.createFrontFace(size), {
      fill: frontColorProperty,
      stroke: stroke,
      lineWidth: 1,
    });
    this.rightSidePath = new Path(this.boxShapes.createRightSideFace(size), {
      fill: sideColorProperty,
      stroke: stroke,
      lineWidth: 1,
    });

    this.addChild(this.topPath);
    this.addChild(this.frontPath);
    this.addChild(this.rightSidePath);
  }

  public setBoxSize(size: Dimension3): void {
    if (size.width !== this.size.width || size.height !== this.size.height || size.depth !== this.size.depth) {
      this.size = size;
      this.updateShapes();
    }
  }

  protected getBoxSize(): Dimension3 {
    return this.size;
  }

  protected updateShapes(): void {
    this.topPath.shape = this.boxShapes.createTopFace(this.size);
    this.frontPath.shape = this.boxShapes.createFrontFace(this.size);
    this.rightSidePath.shape = this.boxShapes.createRightSideFace(this.size);
  }

  /** Repaints the three faces from a new base colour, keeping the shading steps. */
  public setBaseColor(color: TColor): void {
    const base = Color.toColor(color);
    this.topPath.fill = base;
    this.frontPath.fill = darker(base);
    this.rightSidePath.fill = darker(darker(base));
  }
}
