/**
 * BatteryGeometry.ts
 *
 * Battery body/terminal dimensions in model metres (shared by Battery and BatteryShapes).
 */

import { Dimension2 } from "scenerystack/dot";

export const BODY_SIZE = new Dimension2(0.0065, 0.01425);

/** Ellipse that caps the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(0.0025, 0.0005);

/** Height of the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_CYLINDER_HEIGHT = 0.0009;

/** Ellipse that forms the (recessed) negative terminal, metres. */
export const NEGATIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(0.0035, 0.0009);
