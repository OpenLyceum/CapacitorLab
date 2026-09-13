/**
 * EFieldNode.ts
 *
 * The grid of field lines drawn in the gap between the plates.
 *
 * Line *density* carries the field strength — a stronger field draws more lines
 * over the same plate, which is the convention the field-line picture rests on.
 * The arrows point down for a positive field and up for a negative one.
 *
 * Lines are placed in the four quadrants around the plate's centre at once, so
 * the pattern stays symmetric as the plate grows and shrinks. Spacing is computed
 * against the *smallest* plate so density is comparable across plate sizes, and
 * across all three screens (see CLCalibration).
 *
 * Ported from `view/EFieldNode.java`.
 */

import { Multilink } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import { NUMBER_OF_EFIELD_LINES, PLATE_WIDTH_RANGE } from "../../CapacitorLabConstants.js";
import type { Capacitor } from "../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";

/** Arrowhead size in view pixels. */
const ARROW_WIDTH = 10;
const ARROW_HEIGHT = 15;
const LINE_WIDTH = 2;

/** How many lines a given field strength earns, at least one row's worth if non-zero. */
export function getNumberOfLines(effectiveEField: number, maxEffectiveEField: number): number {
  const absoluteField = Math.abs(effectiveEField);
  const count = Math.trunc((NUMBER_OF_EFIELD_LINES.max * absoluteField) / maxEffectiveEField);
  if (absoluteField > 0 && count < NUMBER_OF_EFIELD_LINES.min) {
    return NUMBER_OF_EFIELD_LINES.min;
  }
  return count;
}

/**
 * Spacing between lines, metres. Zero means "draw nothing" — there is no field.
 * Derived from the smallest plate, and assumes plates are square.
 */
export function getLineSpacing(effectiveEField: number, maxEffectiveEField: number): number {
  if (effectiveEField === 0) {
    return 0;
  }
  return PLATE_WIDTH_RANGE.min / Math.sqrt(getNumberOfLines(effectiveEField, maxEffectiveEField));
}

/** One field line: a stem with an arrowhead at its centre. */
function createFieldLine(length: number, pointsDown: boolean): Node {
  const fill = CapacitorLabColors.eFieldColorProperty;
  const line = new Path(Shape.lineSegment(0, -length / 2, 0, length / 2), {
    stroke: fill,
    lineWidth: LINE_WIDTH,
  });

  const arrowShape = new Shape()
    .moveTo(0, -ARROW_HEIGHT / 2)
    .lineTo(ARROW_WIDTH / 2, ARROW_HEIGHT / 2)
    .lineTo(-ARROW_WIDTH / 2, ARROW_HEIGHT / 2)
    .close();
  const arrow = new Path(arrowShape, { fill: fill });
  if (pointsDown) {
    arrow.rotation = Math.PI;
  }

  return new Node({ children: [line, arrow] });
}

export class EFieldNode extends Node {
  private readonly capacitor: Capacitor;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private readonly maxEffectiveEField: number;
  private readonly lineParent = new Node();

  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D, maxEffectiveEField: number) {
    super();

    this.capacitor = capacitor;
    this.modelViewTransform = modelViewTransform;
    this.maxEffectiveEField = maxEffectiveEField;

    this.addChild(this.lineParent);

    Multilink.multilink(
      [capacitor.plateSizeProperty, capacitor.plateSeparationProperty, capacitor.plateVoltageProperty],
      () => this.update(),
    );
    this.update();
  }

  private update(): void {
    this.lineParent.removeAllChildren();

    const effectiveEField = this.capacitor.effectiveEFieldProperty.value;
    const lineSpacing = getLineSpacing(effectiveEField, this.maxEffectiveEField);
    if (lineSpacing <= 0) {
      return;
    }

    const plateWidth = this.capacitor.getPlateWidth();
    const plateDepth = plateWidth;
    const length = this.modelViewTransform.modelToViewDeltaXYZ(0, this.capacitor.plateSeparationProperty.value, 0).y;
    const pointsDown = effectiveEField >= 0;

    // Walk one quadrant and mirror into the other three, so the grid is always
    // symmetric about the plate's centre.
    for (let x = lineSpacing / 2; x <= plateWidth / 2; x += lineSpacing) {
      for (let z = lineSpacing / 2; z <= plateDepth / 2; z += lineSpacing) {
        for (const [signX, signZ] of [
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ] as const) {
          const line = createFieldLine(length, pointsDown);
          line.center = this.modelViewTransform.modelToViewXYZ(signX * x, 0, signZ * z);
          this.lineParent.addChild(line);
        }
      }
    }
  }
}
