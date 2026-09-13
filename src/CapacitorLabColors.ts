/**
 * CapacitorLabColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import CapacitorLabColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import CapacitorLabColors from "../../CapacitorLabColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: CapacitorLabColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the CapacitorLabColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import CapacitorLabNamespace from "./CapacitorLabNamespace.js";

const CapacitorLabColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),

  // ── Circuit ──────────────────────────────────────────────────────────────────
  // Ported from CLPaints.java. Colors that carry physical meaning (charge sign,
  // which bar meter is which) keep the Java hues in both profiles; colors that
  // only had to read against the Java sim's pale-blue canvas are re-tuned for the
  // fleet's dark default background.

  /** Capacitor plate faces. Java CLPaints.PLATE = rgb(245,245,245). */
  plateColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "plate", {
    default: "#f5f5f5",
    projector: "#f5f5f5",
  }),

  /** Outline around every pseudo-3D box face (plates, dielectric, battery body). */
  boxStrokeColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "boxStroke", {
    default: "#404040",
    projector: "#000000",
  }),

  /** Copper wire connecting battery to capacitors. */
  wireColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "wire", {
    default: "#b87333",
    projector: "#b87333",
  }),

  /** The circulating arrow that shows current direction and magnitude. */
  currentIndicatorColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "currentIndicator", {
    default: "#f5c518",
    projector: "#8a6d00",
  }),

  // ── Charges ──────────────────────────────────────────────────────────────────
  // Java CLPaints.POSITIVE_CHARGE = RED, NEGATIVE_CHARGE = BLUE. Charge sign is
  // read off these colors, so they are identical in both profiles.

  /** Plus symbols on a positively charged plate, and positive dielectric charges. */
  positiveChargeColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "positiveCharge", {
    default: "#ff0000",
    projector: "#ff0000",
  }),

  /** Minus symbols on a negatively charged plate, and negative dielectric charges. */
  negativeChargeColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "negativeCharge", {
    default: "#0000ff",
    projector: "#0000ff",
  }),

  // ── Dielectric materials ─────────────────────────────────────────────────────
  // Java CLPaints: CUSTOM pale yellow, GLASS transparent gray, PAPER off-white,
  // TEFLON light blue, AIR red (deliberately wrong — air is never drawn).

  /** Custom dielectric, whose constant the user sets with a slider. */
  customDielectricColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "customDielectric", {
    default: "rgb(255,255,125)",
    projector: "rgb(255,255,125)",
  }),

  /** Glass (ε = 4.7). Transparent so the plate charges stay readable behind it. */
  glassColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "glass", {
    default: "rgba(100,100,100,0.25)",
    projector: "rgba(100,100,100,0.25)",
  }),

  /** Paper (ε = 3.5). */
  paperColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "paper", {
    default: "rgb(255,255,225)",
    projector: "rgb(255,255,225)",
  }),

  /** Teflon (ε = 2.1). */
  teflonColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "teflon", {
    default: "rgb(0,225,255)",
    projector: "rgb(0,225,255)",
  }),

  /**
   * Air (ε = 1). Never drawn — the Java sim picked an obviously wrong color so a
   * regression that renders air is impossible to miss. Kept for the same reason.
   */
  airColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "air", {
    default: "#ff0000",
    projector: "#ff0000",
  }),

  // ── Meters ───────────────────────────────────────────────────────────────────

  /** Capacitance bar meter. Java CLPaints.CAPACITANCE = GREEN. */
  capacitanceColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "capacitance", {
    default: "#00ff00",
    projector: "#008000",
  }),

  /** Stored-energy bar meter. Java CLPaints.STORED_ENERGY = YELLOW. */
  storedEnergyColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "storedEnergy", {
    default: "#ffff00",
    projector: "#c9a800",
  }),

  // ── Electric field ───────────────────────────────────────────────────────────

  /**
   * E-field lines in the gap between the plates. Java drew these black on a pale
   * canvas; the gap shows the screen background through it, so the default profile
   * inverts to stay visible on the dark background.
   */
  eFieldColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "eField", {
    default: "#e8e8e8",
    projector: "#000000",
  }),

  /** "Plate" vector in the E-field detector. Java LIGHT_GRAY. */
  plateEFieldVectorColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "plateEFieldVector", {
    default: "#d3d3d3",
    projector: "#707070",
  }),

  /** "Dielectric" vector in the E-field detector. Java YELLOW. */
  dielectricEFieldVectorColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "dielectricEFieldVector", {
    default: "#ffff00",
    projector: "#c9a800",
  }),

  /** "Sum" vector in the E-field detector. Java GREEN. */
  sumEFieldVectorColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "sumEFieldVector", {
    default: "#00ff00",
    projector: "#008000",
  }),

  // ── Probes and their wires ───────────────────────────────────────────────────

  /** Wire from the E-field detector body to its probe. Java rgb(129,129,129). */
  eFieldDetectorWireColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "eFieldDetectorWire", {
    default: "#818181",
    projector: "#818181",
  }),

  /** Voltmeter positive (red) probe and its wire. */
  voltmeterPositiveWireColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "voltmeterPositiveWire", {
    default: "#ff0000",
    projector: "#ff0000",
  }),

  /** Voltmeter negative (black) probe and its wire. */
  voltmeterNegativeWireColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "voltmeterNegativeWire", {
    default: "#3a3a3a",
    projector: "#000000",
  }),

  // ── Drag handles ─────────────────────────────────────────────────────────────
  // Java CLPaints.DRAGGABLE_NORMAL = GREEN, DRAGGABLE_HIGHLIGHT = YELLOW.

  /** Double-headed drag arrows at rest. */
  dragHandleColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "dragHandle", {
    default: "#00ff00",
    projector: "#008000",
  }),

  /** Drag arrows under the pointer or with keyboard focus. */
  dragHandleHighlightColorProperty: new ProfileColorProperty(CapacitorLabNamespace, "dragHandleHighlight", {
    default: "#ffff00",
    projector: "#c9a800",
  }),
};

export default CapacitorLabColors;
