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
import CapacitorLabNamespace from "./CapacitorLabNamespace.ts";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Length of the double-headed arrow on each drag handle. */
export const DRAG_HANDLE_ARROW_LENGTH = 35;

/**
 * The play area's design size, in view pixels, before it is scaled to fit the
 * screen. Every model position is laid out against this box — it is the Java
 * sim's canvas size, and the circuit's coordinates assume it.
 */
export const PLAY_AREA_DESIGN_SIZE = { width: 1024, height: 864 };

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

/** Settings for common/CapacitorLabPanel.ts. */
export const CAPACITOR_LAB_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/CapacitorLabScreenIcons.ts. */
export const CAPACITOR_LAB_SCREEN_ICONS_SETTINGS = {
  BATTERY_WIDTH_SEGMENT_2: 23, // px
  BATTERY_HEIGHT_SEGMENT_2: 14, // px
  CREATE_MULTIPLE_CAPACITORS_ICON_WIDTH: 80, // px

  /** Battery width (px). */
  BATTERY_WIDTH: 65,
  /** Battery height (px). */
  BATTERY_HEIGHT: 145,
  /** Battery line width (px). */
  BATTERY_LINE_WIDTH: 8,
  /** Battery corner radius (px). */
  BATTERY_CORNER_RADIUS: 12,
  /** Default width (px). */
  DEFAULT_WIDTH: 150,
  /** Plates height (px). */
  PLATES_HEIGHT: 22,
  /** Plates line width (px). */
  PLATES_LINE_WIDTH: 4,
  /** Wire line width (px). */
  WIRE_LINE_WIDTH: 8,
  /** Create dielectric icon x (px). */
  CREATE_DIELECTRIC_ICON_X: 340,
  /** Create dielectric icon y (px). */
  CREATE_DIELECTRIC_ICON_Y: 113,
  /** Create dielectric icon width (px). */
  CREATE_DIELECTRIC_ICON_WIDTH: 150,
  /** Create dielectric icon height (px). */
  CREATE_DIELECTRIC_ICON_HEIGHT: 80,
  /** Create dielectric icon line width (px). */
  CREATE_DIELECTRIC_ICON_LINE_WIDTH: 4,
} as const;

/** Settings for common/model/BatteryGeometry.ts. */
export const BATTERY_GEOMETRY_SETTINGS = {
  /** Positive terminal cylinder height (m). */
  POSITIVE_TERMINAL_CYLINDER_HEIGHT: 0.0009,
} as const;

/** Settings for common/model/SingleCapacitorModel.ts. */
export const SINGLE_CAPACITOR_MODEL_SETTINGS = {
  /** Capacitor x spacing (m). */
  CAPACITOR_X_SPACING: 0.025,
  /** Wire extent (m). */
  WIRE_EXTENT: 0.016,
} as const;

/** Settings for common/model/UnitsUtils.ts. */
export const UNITS_UTILS_SETTINGS = {
  /** Millimeters per meter (mm/m). */
  MILLIMETERS_PER_METER: 1000,
} as const;

/** Settings for common/view/BatteryNode.ts. */
export const BATTERY_NODE_SETTINGS = {
  /** Track length in view pixels. A fixed number rather than a fraction of the battery image: the artwork is an SVG whose intrinsic size is not known until it loads, and a track built from a zero height fails immediately. */
  TRACK_LENGTH: 80,
  /** Track thickness (px). */
  TRACK_THICKNESS: 4,
  /** How far the thumb's touch and mouse areas extend past its drawn edge. */
  THUMB_TOUCH_DILATION: 10,
  /** Thumb mouse dilation (px). */
  THUMB_MOUSE_DILATION: 4,
  /** Tick label font size (px). */
  TICK_LABEL_FONT_SIZE: 14,
} as const;

/** Settings for common/view/CapacitorLabScreenView.ts. */
export const CAPACITOR_LAB_SCREEN_VIEW_SETTINGS = {
  /** Control panel width (px). */
  CONTROL_PANEL_WIDTH: 260,
} as const;

/** Settings for common/view/CurrentIndicatorNode.ts. */
export const CURRENT_INDICATOR_NODE_SETTINGS = {
  /** Arrow length (px). */
  ARROW_LENGTH: 175,
  /** Arrow head width (px). */
  ARROW_HEAD_WIDTH: 60,
  /** Arrow head height (px). */
  ARROW_HEAD_HEIGHT: 50,
  /** The indicator is never fully opaque, so it does not fight the circuit behind it. */
  VISIBLE_OPACITY: 0.75,
  /** Seconds the arrow takes to fade once the current stops. */
  FADE_OUT_DURATION: 0.5,
} as const;

/** Settings for common/view/DielectricTotalChargeNode.ts. */
export const DIELECTRIC_TOTAL_CHARGE_NODE_SETTINGS = {
  /** Lattice pitch, view pixels. */
  SPACING_BETWEEN_PAIRS: 45,
} as const;

/** Settings for common/view/EFieldNode.ts. */
export const E_FIELD_NODE_SETTINGS = {
  /** Arrowhead size in view pixels. */
  ARROW_WIDTH: 10,
  /** Arrow height (px). */
  ARROW_HEIGHT: 15,
  /** Line width (px). */
  LINE_WIDTH: 2,
} as const;

/** Settings for common/view/PlateNode.ts. */
export const PLATE_NODE_SETTINGS = {
  /** How faint the bottom plate's dielectric-facing charges are. */
  OCCLUDED_CHARGE_OPACITY: 0.25,
} as const;

/** Settings for common/view/SingleCapacitorScreenView.ts. */
export const SINGLE_CAPACITOR_SCREEN_VIEW_SETTINGS = {
  /** Panels spacing (px). */
  PANELS_SPACING: 10,
} as const;

/** Settings for common/view/TransparentBoxNode.ts. */
export const TRANSPARENT_BOX_NODE_SETTINGS = {
  /** How much of the slab shows through when something behind it matters. */
  TRANSPARENT_OPACITY: 0.5,
} as const;

/** Settings for common/view/controls/BatteryConnectionButton.ts. */
export const BATTERY_CONNECTION_BUTTON_SETTINGS = {
  /** Constructor font size (px). */
  CONSTRUCTOR_FONT_SIZE: 20,
} as const;

/** Settings for common/view/controls/CapacitanceControlNode.ts. */
export const CAPACITANCE_CONTROL_NODE_SETTINGS = {
  /** Track length (px). */
  TRACK_LENGTH: 60,
  /** Track thickness (px). */
  TRACK_THICKNESS: 4,
  /** Thumb touch dilation (px). */
  THUMB_TOUCH_DILATION: 10,
  /** Thumb mouse dilation (px). */
  THUMB_MOUSE_DILATION: 4,
  /** Readout max width (px). */
  READOUT_MAX_WIDTH: 90,
  /** Decimal places (digits). */
  DECIMAL_PLACES: 2,
  /** Slider keyboard step (control/model units). */
  SLIDER_KEYBOARD_STEP: 0.1,
  /** Slider shift keyboard step (control/model units). */
  SLIDER_SHIFT_KEYBOARD_STEP: 0.01,
  /** Slider page keyboard step (control/model units). */
  SLIDER_PAGE_KEYBOARD_STEP: 0.5,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 4,
} as const;

/** Settings for common/view/controls/CircuitChoiceControl.ts. */
export const CIRCUIT_CHOICE_CONTROL_SETTINGS = {
  /** Buttons spacing (px). */
  BUTTONS_SPACING: 4,
  /** Buttons radius (px). */
  BUTTONS_RADIUS: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 8,
} as const;

/** Settings for common/view/controls/DielectricPropertiesControlPanel.ts. */
export const DIELECTRIC_PROPERTIES_CONTROL_PANEL_SETTINGS = {
  /** Constant control delta (control/model units). */
  CONSTANT_CONTROL_DELTA: 0.1,
  /** Charge view buttons spacing (px). */
  CHARGE_VIEW_BUTTONS_SPACING: 4,
  /** Charge view buttons radius (px). */
  CHARGE_VIEW_BUTTONS_RADIUS: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 8,
} as const;

/** Settings for common/view/controls/MetersControlPanel.ts. */
export const METERS_CONTROL_PANEL_SETTINGS = {
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for common/view/controls/PlateChargeControlNode.ts. */
export const PLATE_CHARGE_CONTROL_NODE_SETTINGS = {
  /** Tick label font size (px). */
  TICK_LABEL_FONT_SIZE: 14,
  /** Track size width (px). */
  TRACK_SIZE_WIDTH: 6,
  /** Track size height (px). */
  TRACK_SIZE_HEIGHT: 200,
} as const;

/** Settings for common/view/controls/ViewControlPanel.ts. */
export const VIEW_CONTROL_PANEL_SETTINGS = {
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 6,
} as const;

/** Settings for common/view/controls/controlFonts.ts. */
export const CONTROL_FONTS_SETTINGS = {
  /** Control title font size (px). */
  CONTROL_TITLE_FONT_SIZE: 16,
  /** Control label font size (px). */
  CONTROL_LABEL_FONT_SIZE: 14,
  /** Create labeled checkbox box width (px). */
  CREATE_LABELED_CHECKBOX_BOX_WIDTH: 16,
} as const;

/** Settings for common/view/drag/DielectricOffsetDragHandleNode.ts. */
export const DIELECTRIC_OFFSET_DRAG_HANDLE_NODE_SETTINGS = {
  /** Line length (px). */
  LINE_LENGTH: 60,
} as const;

/** Settings for common/view/drag/DragHandleNode.ts. */
export const DRAG_HANDLE_NODE_SETTINGS = {
  ARROW_HEAD_HEIGHT_FACTOR: 4, // dimensionless
  ARROW_TAIL_WIDTH_FACTOR: 6, // dimensionless
  CREATE_DRAG_HANDLE_LINE_LINE_DASH_DASH: 3, // px

  /** Label font size (px). */
  LABEL_FONT_SIZE: 18,
  /** Value font size (px). */
  VALUE_FONT_SIZE: 16,
  /** How far an arrow's touch and mouse areas extend past its drawn edge. */
  ARROW_TOUCH_DILATION: 10,
  /** Arrow mouse dilation (px). */
  ARROW_MOUSE_DILATION: 4,
  /** Create drag handle line line width (px). */
  CREATE_DRAG_HANDLE_LINE_LINE_WIDTH: 3,
} as const;

/** Settings for common/view/drag/PlateAreaDragHandleNode.ts. */
export const PLATE_AREA_DRAG_HANDLE_NODE_SETTINGS = {
  /** Line length (px). */
  LINE_LENGTH: 22,
} as const;

/** Settings for common/view/drag/PlateSeparationDragHandleNode.ts. */
export const PLATE_SEPARATION_DRAG_HANDLE_NODE_SETTINGS = {
  /** Line length (px). */
  LINE_LENGTH: 60,
} as const;

/** Settings for common/view/meters/BarMeterNode.ts. */
export const BAR_METER_NODE_SETTINGS = {
  CONSTRUCTOR_RIGHT_OFFSET: 4, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CONSTRUCTOR_LEFT_OFFSET: 6, // px

  /** Track size width (px). */
  TRACK_SIZE_WIDTH: 50,
  /** Track size height (px). */
  TRACK_SIZE_HEIGHT: 200,
  /** Number of tick marks along the bar meter track (count). */
  NUMBER_OF_TICKS: 10,
  /** Title font size (px). */
  TITLE_FONT_SIZE: 16,
  /** Value font size (px). */
  VALUE_FONT_SIZE: 16,
  /** Range label font size (px). */
  RANGE_LABEL_FONT_SIZE: 14,
  /** Overload arrow height (px). */
  OVERLOAD_ARROW_HEIGHT: 15,
} as const;

/** Settings for common/view/meters/EFieldDetectorNode.ts. */
export const E_FIELD_DETECTOR_NODE_SETTINGS = {
  CONSTRUCTOR_BOTTOM_OFFSET: 4, // px
  TITLE_MAX_WIDTH_OFFSET: 16, // px
  CONSTRUCTOR_CENTER_X_FACTOR: 4, // dimensionless
  CONSTRUCTOR_CENTER_Y_FACTOR: 0.55, // dimensionless

  /** Body size x (px). */
  BODY_SIZE_X: 240,
  /** Body size y (px). */
  BODY_SIZE_Y: 230,
  /** Title font size (px). */
  TITLE_FONT_SIZE: 14,
  /** Label font size (px). */
  LABEL_FONT_SIZE: 13,
  /** Probe radius (px). */
  PROBE_RADIUS: 16,
  /** View pixels an arrow gets for a field of EFIELD_REFERENCE_MAGNITUDE. */
  REFERENCE_ARROW_LENGTH: 70,
  /** Body wire normal y (px). */
  BODY_WIRE_NORMAL_Y: 80,
  /** Probe wire normal y (px). */
  PROBE_WIRE_NORMAL_Y: -80,
  /** Arrow head width (px). */
  ARROW_HEAD_WIDTH: 14,
  /** Arrow head height (px). */
  ARROW_HEAD_HEIGHT: 12,
  /** Arrow tail width (px). */
  ARROW_TAIL_WIDTH: 5,
  /** Top inset for the detector title (px). */
  TITLE_TOP: 6,
  /** Create checkbox box width (px). */
  CREATE_CHECKBOX_BOX_WIDTH: 14,
  /** Controls spacing (px). */
  CONTROLS_SPACING: 3,
  /** Left inset for the vector-visibility controls (px). */
  CONTROLS_LEFT: 10,
  /** Constructor line width (px). */
  CONSTRUCTOR_LINE_WIDTH: 3,
} as const;

/** Settings for common/view/meters/VoltmeterNode.ts. */
export const VOLTMETER_NODE_SETTINGS = {
  CONSTRUCTOR_TOP_OFFSET: 6, // px

  /** Body size x (px). */
  BODY_SIZE_X: 150,
  /** Body size y (px). */
  BODY_SIZE_Y: 80,
  /** Title font size (px). */
  TITLE_FONT_SIZE: 14,
  /** Value font size (px). */
  VALUE_FONT_SIZE: 18,
  /** Probe radius (px). */
  PROBE_RADIUS: 18,
  /** Body wire normal y (px). */
  BODY_WIRE_NORMAL_Y: 60,
  /** Probe wire normal y (px). */
  PROBE_WIRE_NORMAL_Y: -80,
  /** Top inset for the voltmeter title (px). */
  TITLE_TOP: 6,
  /** Wire options line width (px). */
  WIRE_OPTIONS_LINE_WIDTH: 3,
} as const;

/** Settings for multiple-capacitors/model/MultipleCapacitorsModel.ts. */
export const MULTIPLE_CAPACITORS_MODEL_SETTINGS = {
  /** Capacitor x spacing (m). */
  CAPACITOR_X_SPACING: 0.018,
  /** Capacitor y spacing (m). */
  CAPACITOR_Y_SPACING: 0.016,
  /** Wire extent (m). */
  WIRE_EXTENT: 0.01,
  /** Plates are fixed and small on this screen — there are up to four capacitors to fit on one canvas — and the separation carries the capacitance the user dials in. */
  PLATE_WIDTH: 0.0075,
} as const;

/** Settings for multiple-capacitors/view/MultipleCapacitorsCircuitNode.ts. */
export const MULTIPLE_CAPACITORS_CIRCUIT_NODE_SETTINGS = {
  /** Label font size (px). */
  LABEL_FONT_SIZE: 24,
  /** Gap between a capacitor and its label or capacitance control. */
  LABEL_SPACING: 6,
} as const;

/** Settings for multiple-capacitors/view/MultipleCapacitorsScreenView.ts. */
export const MULTIPLE_CAPACITORS_SCREEN_VIEW_SETTINGS = {
  /** Panels spacing (px). */
  PANELS_SPACING: 10,
} as const;

/** Settings for preferences/CapacitorLabPreferencesNode.ts. */
export const CAPACITOR_LAB_PREFERENCES_NODE_SETTINGS = {
  /** Header font size (px). */
  HEADER_FONT_SIZE: 18,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Layout lengths in px; precision values count digits; factors are dimensionless. */
export const SINGLE_CAPACITOR_CIRCUIT_NODE_SETTINGS = {
  CONSTRUCTOR_BOTTOM_OFFSET: 10, // px
} as const;

/** Initial positions and dimensions for common/model/BatteryGeometry.ts (m). */
export const BATTERY_GEOMETRY_COORDINATES = {
  BODY_SIZE_WIDTH: 0.0065, // m
  BODY_SIZE_HEIGHT: 0.01425, // m
  POSITIVE_TERMINAL_ELLIPSE_SIZE_WIDTH: 0.0025, // m
  POSITIVE_TERMINAL_ELLIPSE_SIZE_HEIGHT: 0.0005, // m
  NEGATIVE_TERMINAL_ELLIPSE_SIZE_WIDTH: 0.0035, // m
  NEGATIVE_TERMINAL_ELLIPSE_SIZE_HEIGHT: 0.0009, // m
} as const;

/** Initial positions and dimensions for common/model/SingleCapacitorModel.ts (m). */
export const SINGLE_CAPACITOR_MODEL_COORDINATES = {
  BATTERY_POSITION_X: 0.005, // m
  BATTERY_POSITION_Y: 0.034, // m
  CAPACITANCE_METER_POSITION_X: 0.038, // m
  CAPACITANCE_METER_POSITION_Y: 0.0017, // m
  PLATE_CHARGE_METER_POSITION_X: 0.049, // m
  PLATE_CHARGE_METER_POSITION_Y: 0.0017, // m
  STORED_ENERGY_METER_POSITION_X: 0.06, // m
  STORED_ENERGY_METER_POSITION_Y: 0.0017, // m
  E_FIELD_DETECTOR_BODY_POSITION_X: 0.043, // m
  E_FIELD_DETECTOR_BODY_POSITION_Y: 0.041, // m
  VOLTMETER_BODY_POSITION_X: 0.057, // m
  VOLTMETER_BODY_POSITION_Y: 0.023, // m
} as const;

/** Initial positions and dimensions for common/model/shapes/VoltmeterShapes.ts (m). */
export const VOLTMETER_SHAPES_COORDINATES = {
  PROBE_TIP_SIZE_WIDTH: 0.0005, // m
  PROBE_TIP_SIZE_HEIGHT: 0.0015, // m
} as const;

/** Initial positions and dimensions for multiple-capacitors/model/MultipleCapacitorsModel.ts (m). */
export const MULTIPLE_CAPACITORS_MODEL_COORDINATES = {
  BATTERY_POSITION_X: 0.005, // m
  BATTERY_POSITION_Y: 0.03, // m
  CAPACITANCE_METER_POSITION_X: 0.033, // m
  CAPACITANCE_METER_POSITION_Y: 0.0017, // m
  PLATE_CHARGE_METER_POSITION_X: 0.046, // m
  PLATE_CHARGE_METER_POSITION_Y: 0.0017, // m
  STORED_ENERGY_METER_POSITION_X: 0.059, // m
  STORED_ENERGY_METER_POSITION_Y: 0.0017, // m
  E_FIELD_DETECTOR_BODY_POSITION_X: 0.05, // m
  E_FIELD_DETECTOR_BODY_POSITION_Y: 0.041, // m
  VOLTMETER_BODY_POSITION_X: 0.04, // m
  VOLTMETER_BODY_POSITION_Y: 0.041, // m
  VOLTMETER_POSITIVE_PROBE_POSITION_X: 0.035, // m
  VOLTMETER_POSITIVE_PROBE_POSITION_Y: 0.042, // m
  VOLTMETER_NEGATIVE_PROBE_POSITION_X: 0.038, // m
  VOLTMETER_NEGATIVE_PROBE_POSITION_Y: 0.042, // m
} as const;

/** Settings for common/model/Battery.ts; units are documented per value. */
export const BATTERY_SETTINGS = {
  /** Positive terminal offset below the top of the battery (m). */
  POSITIVE_TERMINAL_TOP_OFFSET: 0.000505,
  /** Negative terminal offset below the top of the battery (m). */
  NEGATIVE_TERMINAL_TOP_OFFSET: 0.00105,
} as const;

CapacitorLabNamespace.register("CapacitorLabConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  DRAG_HANDLE_ARROW_LENGTH,
  PLAY_AREA_DESIGN_SIZE,
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
