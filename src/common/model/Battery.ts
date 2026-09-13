/**
 * Battery.ts
 *
 * The battery that drives the circuit. Its voltage is set by a slider on its
 * body and may be negative, which flips its polarity — the sim draws the battery
 * the other way up and the plate charges swap sign.
 *
 * The terminal geometry lives here rather than in the view because the voltmeter
 * measures by intersecting its probe with the terminal shape, and the shape
 * depends on the polarity. Ported from `model/Battery.java`.
 */

import { DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, type Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import type { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import { Polarity, type PolarityValue } from "./Polarity.js";
import { BatteryShapes } from "./shapes/BatteryShapes.js";
import { shapeIntersects } from "./shapes/shapeIntersects.js";

/** Bounding box of the battery image, metres. */
export const BODY_SIZE = new Dimension2(0.0065, 0.01425);

/** Ellipse that caps the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(0.0025, 0.0005);

/** Height of the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_CYLINDER_HEIGHT = 0.0009;

/** Ellipse that forms the (recessed) negative terminal, metres. */
export const NEGATIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(0.0035, 0.0009);

const POSITIVE_TERMINAL_Y_OFFSET = -(BODY_SIZE.height / 2) + 0.000505;
const NEGATIVE_TERMINAL_Y_OFFSET = -(BODY_SIZE.height / 2) + 0.00105;

export class Battery {
  /** Centre of the battery in the 3D model frame, metres. Fixed. */
  public readonly position: Vector3;

  /** Terminal-to-terminal voltage, Volts. Negative values flip the polarity. */
  public readonly voltageProperty: NumberProperty;

  /** Polarity of the *top* terminal, which is what the wires and probes care about. */
  public readonly polarityProperty: TReadOnlyProperty<PolarityValue>;

  /** 2D projections of the body and top terminal, for drawing and for probing. */
  public readonly shapes: BatteryShapes;

  public constructor(position: Vector3, voltage: number, modelViewTransform: CLModelViewTransform3D) {
    this.position = position;
    this.voltageProperty = new NumberProperty(voltage);
    this.polarityProperty = new DerivedProperty([this.voltageProperty], (v: number) =>
      v >= 0 ? Polarity.POSITIVE : Polarity.NEGATIVE,
    );
    this.shapes = new BatteryShapes(this, modelViewTransform);
  }

  /** Does a shape touch the top terminal? Used by the voltmeter's probes. */
  public intersectsTopTerminal(shape: Shape): boolean {
    return shapeIntersects(this.shapes.createTopTerminalShape(), shape);
  }

  /**
   * The bottom terminal is never drawn — the battery image hides it — so nothing
   * can touch it. Kept as a named method so circuit code reads symmetrically.
   */
  public intersectsBottomTerminal(_shape: Shape): boolean {
    return false;
  }

  /**
   * Vertical offset of the top terminal's centre from the battery's centre,
   * metres. The two terminals sit at different heights, so flipping polarity
   * moves the attachment point as well as its sign.
   */
  public getTopTerminalYOffset(): number {
    return this.polarityProperty.value === Polarity.POSITIVE ? POSITIVE_TERMINAL_Y_OFFSET : NEGATIVE_TERMINAL_Y_OFFSET;
  }

  /** Vertical offset of the bottom terminal, metres. Never drawn or probed. */
  public getBottomTerminalYOffset(): number {
    return BODY_SIZE.height / 2;
  }

  public reset(): void {
    this.voltageProperty.reset();
  }
}
