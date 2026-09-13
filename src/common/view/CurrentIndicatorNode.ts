/**
 * CurrentIndicatorNode.ts
 *
 * The arrow on a wire that shows current flowing, with an electron riding it.
 *
 * It appears while charge is changing and fades out when it stops, which is what
 * tells the user that current in this circuit is a transient — it flows while the
 * capacitor charges and then ceases, rather than running continuously.
 *
 * The arrow points along `positiveOrientation` for positive dQ/dt and the other
 * way for negative, so the two wires can be given opposite orientations and show
 * charge going round the loop.
 *
 * Ported from `view/CurrentIndicatorNode.java`.
 */

import { Dimension2 } from "scenerystack/dot";
import { Circle, Node } from "scenerystack/scenery";
import { ArrowNode, MinusNode } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { Circuit } from "../model/circuit/Circuit.js";

const ARROW_LENGTH = 175;
const ARROW_HEAD_WIDTH = 60;
const ARROW_HEAD_HEIGHT = 50;
const ARROW_TAIL_WIDTH = 0.4 * ARROW_HEAD_WIDTH;

const ELECTRON_DIAMETER = 0.8 * ARROW_TAIL_WIDTH;
const ELECTRON_MINUS_SIZE = new Dimension2(0.6 * ELECTRON_DIAMETER, 0.1 * ELECTRON_DIAMETER);

/** The indicator is never fully opaque, so it does not fight the circuit behind it. */
const VISIBLE_OPACITY = 0.75;

/** Seconds the arrow takes to fade once the current stops. */
const FADE_OUT_DURATION = 0.5;

export class CurrentIndicatorNode extends Node {
  private readonly positiveOrientation: number;

  /** Seconds left in the current fade-out, or zero when not fading. */
  private fadeRemaining = 0;

  public constructor(circuit: Circuit, positiveOrientation: number) {
    super();

    this.positiveOrientation = positiveOrientation;

    const arrowColor = CapacitorLabColors.currentIndicatorColorProperty;

    // Tip at the origin, so rotating the node spins the arrow about its point.
    const arrow = new ArrowNode(ARROW_LENGTH, 0, 0, 0, {
      headWidth: ARROW_HEAD_WIDTH,
      headHeight: ARROW_HEAD_HEIGHT,
      tailWidth: ARROW_TAIL_WIDTH,
      fill: arrowColor,
      stroke: null,
    });
    this.addChild(arrow);

    const electron = new Circle(ELECTRON_DIAMETER / 2, {
      fill: arrowColor,
      stroke: CapacitorLabColors.boxStrokeColorProperty,
      lineWidth: 1,
    });
    this.addChild(electron);

    const minus = new MinusNode({ size: ELECTRON_MINUS_SIZE, fill: CapacitorLabColors.boxStrokeColorProperty });
    this.addChild(minus);

    arrow.centerX = 0;
    // Sit the electron in the arrow's shaft rather than its head.
    electron.center = arrow.center.plusXY(0.6 * (ARROW_LENGTH - ARROW_HEAD_HEIGHT) * 0.5, 0);
    minus.center = electron.center;

    this.opacity = 0;

    circuit.currentAmplitudeProperty.link((amplitude: number) => {
      if (amplitude !== 0) {
        this.fadeRemaining = 0;
        this.opacity = VISIBLE_OPACITY;
        this.rotation = amplitude > 0 ? this.positiveOrientation : this.positiveOrientation + Math.PI;
      } else if (this.opacity > 0) {
        this.fadeRemaining = FADE_OUT_DURATION;
      }
    });
  }

  /** Advances the fade. Called from the screen view's own step. */
  public step(dt: number): void {
    if (this.fadeRemaining <= 0) {
      return;
    }
    this.fadeRemaining = Math.max(0, this.fadeRemaining - dt);
    this.opacity = VISIBLE_OPACITY * (this.fadeRemaining / FADE_OUT_DURATION);
  }
}
