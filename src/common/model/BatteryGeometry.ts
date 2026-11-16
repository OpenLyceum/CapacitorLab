import { BATTERY_GEOMETRY_COORDINATES, BATTERY_GEOMETRY_SETTINGS } from "../../CapacitorLabConstants.js";
/**
 * BatteryGeometry.ts
 *
 * Battery body/terminal dimensions in model metres (shared by Battery and BatteryShapes).
 */

import { Dimension2 } from "scenerystack/dot";

export const BODY_SIZE = new Dimension2(
  BATTERY_GEOMETRY_COORDINATES.BODY_SIZE_WIDTH,
  BATTERY_GEOMETRY_COORDINATES.BODY_SIZE_HEIGHT,
);

/** Ellipse that caps the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(
  BATTERY_GEOMETRY_COORDINATES.POSITIVE_TERMINAL_ELLIPSE_SIZE_WIDTH,
  BATTERY_GEOMETRY_COORDINATES.POSITIVE_TERMINAL_ELLIPSE_SIZE_HEIGHT,
);

/** Height of the positive terminal's cylinder, metres. */
export const POSITIVE_TERMINAL_CYLINDER_HEIGHT: number = BATTERY_GEOMETRY_SETTINGS.POSITIVE_TERMINAL_CYLINDER_HEIGHT;

/** Ellipse that forms the (recessed) negative terminal, metres. */
export const NEGATIVE_TERMINAL_ELLIPSE_SIZE = new Dimension2(
  BATTERY_GEOMETRY_COORDINATES.NEGATIVE_TERMINAL_ELLIPSE_SIZE_WIDTH,
  BATTERY_GEOMETRY_COORDINATES.NEGATIVE_TERMINAL_ELLIPSE_SIZE_HEIGHT,
);
