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

  /** A raised cylinder: cap ellipse, wall, and base ellipse unioned. */
  private createPositiveTerminalShape(): Shape {
    const { position } = this.battery;
    const { width, height } = POSITIVE_TERMINAL_ELLIPSE_SIZE;
    const x = position.x;
    const y = position.y + this.battery.getTopTerminalYOffset();

    const topEllipse = Shape.ellipse(x, y, width / 2, height / 2, 0);
    const bottomEllipse = Shape.ellipse(x, y + POSITIVE_TERMINAL_CYLINDER_HEIGHT, width / 2, height / 2, 0);
    const wall = Shape.rectangle(x - width / 2, y, width, POSITIVE_TERMINAL_CYLINDER_HEIGHT);

    const composite = topEllipse.shapeUnion(wall).shapeUnion(bottomEllipse);
    return this.modelViewTransform.modelToViewShape(composite);
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
