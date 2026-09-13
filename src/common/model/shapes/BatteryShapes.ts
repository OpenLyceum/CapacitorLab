/**
 * batteryShapes.ts
 *
 * 2D projections of the battery's body and top terminal, in view coordinates.
 *
 * The top terminal's shape depends on polarity: a positive terminal is the raised
 * cylinder (two ellipses plus the wall between them), a negative one the recessed
 * ellipse. The voltmeter probes this shape, so it has to change with the voltage
 * sign the way the drawing does.
 *
 * Ported from `shapes/BatteryShapeCreator.java`.
 */

import { Shape } from "scenerystack/kite";
import type { Battery } from "../Battery.js";
import {
  BODY_SIZE,
  NEGATIVE_TERMINAL_ELLIPSE_SIZE,
  POSITIVE_TERMINAL_CYLINDER_HEIGHT,
  POSITIVE_TERMINAL_ELLIPSE_SIZE,
} from "../Battery.js";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import { Polarity } from "../Polarity.js";

export class BatteryShapes {
  private readonly battery: Battery;
  private readonly modelViewTransform: CLModelViewTransform3D;

  public constructor(battery: Battery, modelViewTransform: CLModelViewTransform3D) {
    this.battery = battery;
    this.modelViewTransform = modelViewTransform;
  }

  public createBodyShape(): Shape {
    const { position } = this.battery;
    const shape = Shape.rectangle(
      position.x - BODY_SIZE.width / 2,
      position.y - BODY_SIZE.height / 2,
      BODY_SIZE.width,
      BODY_SIZE.height,
    );
    return this.modelViewTransform.modelToViewShape(shape);
  }

  /** The terminal the wires attach to and the voltmeter probes. */
  public createTopTerminalShape(): Shape {
    return this.battery.polarityProperty.value === Polarity.POSITIVE
      ? this.createPositiveTerminalShape()
      : this.createNegativeTerminalShape();
  }

  /**
   * A raised cylinder, drawn as one closed silhouette: the top half of the cap
   * ellipse, down the right side, the bottom half of the base ellipse, and back.
   *
   * Built as a single path rather than by unioning a rectangle with two ellipses.
   * The rectangle's sides would be exactly tangent to both ellipses, and kite's
   * constructive-area geometry does not survive that degeneracy — it asserts
   * rather than returning a slightly wrong shape.
   */
  private createPositiveTerminalShape(): Shape {
    const { position } = this.battery;
    const { width, height } = POSITIVE_TERMINAL_ELLIPSE_SIZE;
    const radiusX = width / 2;
    const radiusY = height / 2;
    const x = position.x;
    const topY = position.y + this.battery.getTopTerminalYOffset();
    const bottomY = topY + POSITIVE_TERMINAL_CYLINDER_HEIGHT;

    // Angles run clockwise on screen because +y is down: π…2π traces the top half.
    const shape = new Shape()
      .moveTo(x - radiusX, topY)
      .ellipticalArc(x, topY, radiusX, radiusY, 0, Math.PI, 2 * Math.PI, false)
      .lineTo(x + radiusX, bottomY)
      .ellipticalArc(x, bottomY, radiusX, radiusY, 0, 0, Math.PI, false)
      .close();

    return this.modelViewTransform.modelToViewShape(shape);
  }

  /** A recessed dimple: one ellipse. */
  private createNegativeTerminalShape(): Shape {
    const { position } = this.battery;
    const { width, height } = NEGATIVE_TERMINAL_ELLIPSE_SIZE;
    const shape = Shape.ellipse(
      position.x,
      position.y + this.battery.getTopTerminalYOffset(),
      width / 2,
      height / 2,
      0,
    );
    return this.modelViewTransform.modelToViewShape(shape);
  }
}
