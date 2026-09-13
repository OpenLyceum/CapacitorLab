/**
 * CapacitorLabConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Ported from the PhET Java sim's `CLConstants.java`; the Java
 * names are noted so the two can be diffed.
 *
 * Conventions
 * ───────────
 *  - Model values are SI — metres, Farads, Coulombs, Volts, Joules. These are
 *    awkwardly small at this scale (a plate is 0.01 m across), but they are the
 *    units the sim's design document uses and the Java sim deliberately kept
 *    them. Converting for display is `UnitsUtils`' job, not the model's.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in CapacitorLabColors.ts, not here.
 */

import { RangeWithValue } from "scenerystack/dot";
import CapacitorLabNamespace from "./CapacitorLabNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Length of the double-headed arrow on each drag handle. */
export const DRAG_HANDLE_ARROW_LENGTH = 35;

// ── Model-view transform ──────────────────────────────────────────────────────
// The sim draws in pseudo-3D: a parallel projection with no vanishing point.
// See CLModelViewTransform3D for the coordinate frame.

/** Model-to-view scale factor. Java CLConstants.MVT_SCALE. */
export const MVT_SCALE = 15000;

/** Rotation about the vertical axis, radians. Right-hand rule sets the sign. */
export const MVT_YAW = -Math.PI / 4;

/** Rotation about the horizontal axis, radians. */
export const MVT_PITCH = Math.PI / 6;

// ── Physics ───────────────────────────────────────────────────────────────────

/** Vacuum permittivity ε₀, Farads/metre. */
export const EPSILON_0 = 8.854e-12;

/**
 * Dielectric constant of air, dimensionless.
 *
 * Physically this is 1.0005896, and the design document specified that the
 * circuit sits in air. Late in development the team realised the circuit should
 * have been modelled in a vacuum, so that the environment contributes no E-field
 * — with real air the detector shows a stray Dielectric vector of up to 4 V/m at
 * maximum plate charge. Rather than rename "air" to "vacuum" throughout the code
 * and the design document, the Java sim simply set the constant to 1.0. Keep it:
 * changing it re-introduces the stray vector.
 */
export const EPSILON_AIR = 1.0;

/** Dielectric constant of a vacuum, dimensionless. */
export const EPSILON_VACUUM = 1;

/** Dielectric constant of glass, dimensionless. */
export const EPSILON_GLASS = 4.7;

/** Dielectric constant of paper, dimensionless. */
export const EPSILON_PAPER = 3.5;

/** Dielectric constant of teflon, dimensionless. */
export const EPSILON_TEFLON = 2.1;

// ── Model ranges (SI) ─────────────────────────────────────────────────────────

/** How close to the play-area edge a dragged object may be pushed, metres. */
export const WORLD_DRAG_MARGIN = 0.001;

/** Battery voltage, Volts. */
export const BATTERY_VOLTAGE_RANGE = new RangeWithValue(-1.5, 1.5, 0);

/** Dragging the voltage slider within this of zero snaps it to zero, Volts. */
export const BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD = 0.1;

/** Side length of a (square) capacitor plate, metres. */
export const PLATE_WIDTH_RANGE = new RangeWithValue(0.01, 0.02, 0.01);

/** Thickness of a capacitor plate, metres. Not user-settable. */
export const PLATE_HEIGHT = 0.0005;

/** Distance between the plates, metres. */
export const PLATE_SEPARATION_RANGE = new RangeWithValue(0.005, 0.01, 0.01);

/** Capacitance set directly by the user on the Multiple Capacitors screen, Farads. */
export const CAPACITANCE_RANGE = new RangeWithValue(1e-13, 3e-13, 1e-13);

/** Dielectric constant of the custom material, dimensionless. */
export const DIELECTRIC_CONSTANT_RANGE = new RangeWithValue(1, 5, 5);

/** How far the dielectric is pulled out from between the plates, metres. */
export const DIELECTRIC_OFFSET_RANGE = new RangeWithValue(0, PLATE_WIDTH_RANGE.max, PLATE_WIDTH_RANGE.defaultValue);

/** Thickness of the wires, metres. */
export const WIRE_THICKNESS = 0.0005;

/** Dragging the plate-charge slider within this of zero snaps it to zero, Coulombs. */
export const PLATE_CHARGE_CONTROL_SNAP_TO_ZERO_THRESHOLD = 1.5e-13;

// ── View calibration ──────────────────────────────────────────────────────────

/** Exponent the capacitance bar meter reads out in (10⁻¹² F = pF). */
export const CAPACITANCE_METER_VALUE_EXPONENT = -12;

/** Exponent the plate-charge bar meter reads out in. */
export const PLATE_CHARGE_METER_VALUE_EXPONENT = -13;

/** Exponent the stored-energy bar meter reads out in. */
export const STORED_ENERGY_METER_VALUE_EXPONENT = -13;

/** Exponent the Multiple Capacitors capacitance slider reads out in. */
export const CAPACITANCE_CONTROL_EXPONENT = -13;

/** How many + or − symbols may appear on one plate, at minimum and maximum charge. */
export const NUMBER_OF_PLATE_CHARGES = new RangeWithValue(1, 625, 1);

/** Size of one − symbol, view pixels. The + symbol is square at this width. */
export const NEGATIVE_CHARGE_SIZE = { width: 7, height: 2 };

/** Plate charges start visible. */
export const PLATE_CHARGES_VISIBLE = true;

/** How many E-field lines cross the smallest plate, at minimum and maximum field. */
export const NUMBER_OF_EFIELD_LINES = new RangeWithValue(4, 900, 4);

/** E-field lines start hidden. */
export const EFIELD_VISIBLE = false;

CapacitorLabNamespace.register("CapacitorLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  DRAG_HANDLE_ARROW_LENGTH,
  MVT_SCALE,
  MVT_YAW,
  MVT_PITCH,
  EPSILON_0,
  EPSILON_AIR,
  EPSILON_VACUUM,
  EPSILON_GLASS,
  EPSILON_PAPER,
  EPSILON_TEFLON,
  WORLD_DRAG_MARGIN,
  BATTERY_VOLTAGE_RANGE,
  BATTERY_VOLTAGE_SNAP_TO_ZERO_THRESHOLD,
  PLATE_WIDTH_RANGE,
  PLATE_HEIGHT,
  PLATE_SEPARATION_RANGE,
  CAPACITANCE_RANGE,
  DIELECTRIC_CONSTANT_RANGE,
  DIELECTRIC_OFFSET_RANGE,
  WIRE_THICKNESS,
  PLATE_CHARGE_CONTROL_SNAP_TO_ZERO_THRESHOLD,
  CAPACITANCE_METER_VALUE_EXPONENT,
  PLATE_CHARGE_METER_VALUE_EXPONENT,
  STORED_ENERGY_METER_VALUE_EXPONENT,
  CAPACITANCE_CONTROL_EXPONENT,
  NUMBER_OF_PLATE_CHARGES,
  NEGATIVE_CHARGE_SIZE,
  PLATE_CHARGES_VISIBLE,
  NUMBER_OF_EFIELD_LINES,
  EFIELD_VISIBLE,
});
