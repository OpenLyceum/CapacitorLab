/**
 * Capacitor.ts
 *
 * A parallel-plate capacitor with a movable dielectric slab between its plates.
 *
 * The general case — a dielectric partly withdrawn — is modelled as two
 * capacitors in parallel: one whose plates face the dielectric, one whose plates
 * face air. Every derived quantity follows from that split, which is why the
 * class exposes air/dielectric variants of capacitance, plate charge and E-field
 * rather than only their totals.
 *
 * Model units are SI (metres, Farads, Coulombs, Volts) to match the sim's design
 * document, so the numbers are small: a plate is 0.01 m across and a plate charge
 * is on the order of 1e-13 C.
 *
 * Ported from `model/Capacitor.java`. The Java version fired one coarse
 * "something changed" callback; here each quantity is its own DerivedProperty, so
 * the view can link only to what it draws.
 */

import { DerivedProperty, DynamicProperty, NumberProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension3, type Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { EPSILON_0, EPSILON_AIR, EPSILON_VACUUM, PLATE_HEIGHT } from "../../CapacitorLabConstants.js";
import type { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import type { DielectricMaterial } from "./DielectricMaterial.js";
import { CapacitorShapes } from "./shapes/CapacitorShapes.js";
import { shapeIntersects } from "./shapes/shapeIntersects.js";

/** C = ε_r · ε₀ · A / d, the general parallel-plate formula. */
function capacitanceOf(dielectricConstant: number, area: number, plateSeparation: number): number {
  return (dielectricConstant * EPSILON_0 * area) / plateSeparation;
}

/** E = ε_r · V / d — the field the plates alone would produce in that material. */
function platesEFieldOf(dielectricConstant: number, plateVoltage: number, plateSeparation: number): number {
  return (dielectricConstant * plateVoltage) / plateSeparation;
}

/** Q_excess = ((ε_r − ε_vacuum) / ε_r) · C · V, the charge bound by polarization. */
function excessChargeOf(dielectricConstant: number, capacitance: number, plateVoltage: number): number {
  return ((dielectricConstant - EPSILON_VACUUM) / dielectricConstant) * capacitance * plateVoltage;
}

export class Capacitor {
  /** Centre of the capacitor in the 3D model frame, metres. Fixed for the sim's lifetime. */
  public readonly position: Vector3;

  /** Plate width × height × depth, metres. Plates are square, so depth tracks width. */
  public readonly plateSizeProperty: Property<Dimension3>;

  /** Distance between the facing plate surfaces, metres. Design-doc symbol `d`. */
  public readonly plateSeparationProperty: NumberProperty;

  /** The insulator between the plates. */
  public readonly dielectricMaterialProperty: Property<DielectricMaterial>;

  /** How far the dielectric is withdrawn, metres. Zero when fully inserted. */
  public readonly dielectricOffsetProperty: NumberProperty;

  /** Voltage across the plates, Volts. Zero until a circuit connects the capacitor. */
  public readonly plateVoltageProperty: NumberProperty;

  /**
   * ε_r of whichever material is currently between the plates. Follows both a
   * change of material and a change to the custom material's own slider.
   */
  public readonly dielectricConstantProperty: TReadOnlyProperty<number>;

  /** Area of one plate face, m². Design-doc symbol `A`. */
  public readonly plateAreaProperty: TReadOnlyProperty<number>;

  /** Plate area facing the dielectric, m². Design-doc symbol `A_dielectric`. */
  public readonly dielectricContactAreaProperty: TReadOnlyProperty<number>;

  /** Plate area facing air, m². Design-doc symbol `A_air`. */
  public readonly airContactAreaProperty: TReadOnlyProperty<number>;

  /** Capacitance of the air-facing portion, Farads. */
  public readonly airCapacitanceProperty: TReadOnlyProperty<number>;

  /** Capacitance of the dielectric-facing portion, Farads. */
  public readonly dielectricCapacitanceProperty: TReadOnlyProperty<number>;

  /** Total capacitance — the two portions in parallel, Farads. */
  public readonly totalCapacitanceProperty: TReadOnlyProperty<number>;

  /** Charge on the air-facing portion of the top plate, Coulombs. */
  public readonly airPlateChargeProperty: TReadOnlyProperty<number>;

  /** Charge on the dielectric-facing portion of the top plate, Coulombs. */
  public readonly dielectricPlateChargeProperty: TReadOnlyProperty<number>;

  /** Total charge on the top plate, Coulombs. Design-doc symbol `Q_total`. */
  public readonly totalPlateChargeProperty: TReadOnlyProperty<number>;

  /** Excess charge bound by polarization of the air, Coulombs. Zero while ε_air = 1. */
  public readonly excessAirPlateChargeProperty: TReadOnlyProperty<number>;

  /** Excess charge bound by polarization of the dielectric, Coulombs. */
  public readonly excessDielectricPlateChargeProperty: TReadOnlyProperty<number>;

  /** Net field between the plates, V/m. Uniform everywhere in the gap. */
  public readonly effectiveEFieldProperty: TReadOnlyProperty<number>;

  /** Field the plates alone produce in the air-filled volume, V/m. */
  public readonly platesAirEFieldProperty: TReadOnlyProperty<number>;

  /** Field the plates alone produce in the dielectric-filled volume, V/m. */
  public readonly platesDielectricEFieldProperty: TReadOnlyProperty<number>;

  /** Field from air polarization, V/m — the plates' field less the net field. */
  public readonly airEFieldProperty: TReadOnlyProperty<number>;

  /** Field from dielectric polarization, V/m. */
  public readonly dielectricEFieldProperty: TReadOnlyProperty<number>;

  /**
   * 2D projections of the capacitor's parts. These live in the model because the
   * meters measure by intersecting shapes, and the model is what knows the
   * geometry — see `doc/implementation-notes.md`.
   */
  public readonly shapes: CapacitorShapes;

  private readonly modelViewTransform: CLModelViewTransform3D;

  public constructor(
    position: Vector3,
    plateWidth: number,
    plateSeparation: number,
    dielectricMaterial: DielectricMaterial,
    dielectricOffset: number,
    modelViewTransform: CLModelViewTransform3D,
  ) {
    this.position = position;
    this.modelViewTransform = modelViewTransform;
    this.shapes = new CapacitorShapes(this, modelViewTransform);

    this.plateSizeProperty = new Property(new Dimension3(plateWidth, PLATE_HEIGHT, plateWidth));
    this.plateSeparationProperty = new NumberProperty(plateSeparation);
    this.dielectricMaterialProperty = new Property(dielectricMaterial);
    this.dielectricOffsetProperty = new NumberProperty(dielectricOffset);
    this.plateVoltageProperty = new NumberProperty(0);

    this.dielectricConstantProperty = new DynamicProperty<number, number, DielectricMaterial>(
      this.dielectricMaterialProperty,
      { derive: (material: DielectricMaterial) => material.dielectricConstantProperty },
    );

    // Every quantity below depends on some subset of these five; deriving them all
    // from the same list mirrors the Java sim, which recomputed everything on any
    // change. The cost is a few redundant multiplications per interaction.
    const inputs = [
      this.plateSizeProperty,
      this.plateSeparationProperty,
      this.dielectricOffsetProperty,
      this.dielectricConstantProperty,
      this.plateVoltageProperty,
    ];

    this.plateAreaProperty = DerivedProperty.deriveAny(inputs, () => this.getPlateWidth() * this.getPlateDepth());

    this.dielectricContactAreaProperty = DerivedProperty.deriveAny(inputs, () => {
      // Withdrawing the slab shrinks the overlap linearly; past a full plate width
      // there is no overlap left, and the area must not go negative.
      const overlap = (this.getPlateWidth() - Math.abs(this.dielectricOffsetProperty.value)) * this.getPlateDepth();
      return Math.max(overlap, 0);
    });

    this.airContactAreaProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.plateAreaProperty.value - this.dielectricContactAreaProperty.value,
    );

    this.airCapacitanceProperty = DerivedProperty.deriveAny(inputs, () =>
      capacitanceOf(EPSILON_AIR, this.airContactAreaProperty.value, this.plateSeparationProperty.value),
    );

    this.dielectricCapacitanceProperty = DerivedProperty.deriveAny(inputs, () =>
      capacitanceOf(
        this.dielectricConstantProperty.value,
        this.dielectricContactAreaProperty.value,
        this.plateSeparationProperty.value,
      ),
    );

    this.totalCapacitanceProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.airCapacitanceProperty.value + this.dielectricCapacitanceProperty.value,
    );

    this.airPlateChargeProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.airCapacitanceProperty.value * this.plateVoltageProperty.value,
    );

    this.dielectricPlateChargeProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.dielectricCapacitanceProperty.value * this.plateVoltageProperty.value,
    );

    this.totalPlateChargeProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.airPlateChargeProperty.value + this.dielectricPlateChargeProperty.value,
    );

    this.excessAirPlateChargeProperty = DerivedProperty.deriveAny(inputs, () =>
      excessChargeOf(EPSILON_AIR, this.airCapacitanceProperty.value, this.plateVoltageProperty.value),
    );

    this.excessDielectricPlateChargeProperty = DerivedProperty.deriveAny(inputs, () =>
      excessChargeOf(
        this.dielectricConstantProperty.value,
        this.dielectricCapacitanceProperty.value,
        this.plateVoltageProperty.value,
      ),
    );

    this.effectiveEFieldProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.plateVoltageProperty.value / this.plateSeparationProperty.value,
    );

    this.platesAirEFieldProperty = DerivedProperty.deriveAny(inputs, () =>
      platesEFieldOf(EPSILON_AIR, this.plateVoltageProperty.value, this.plateSeparationProperty.value),
    );

    this.platesDielectricEFieldProperty = DerivedProperty.deriveAny(inputs, () =>
      platesEFieldOf(
        this.dielectricConstantProperty.value,
        this.plateVoltageProperty.value,
        this.plateSeparationProperty.value,
      ),
    );

    this.airEFieldProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.platesAirEFieldProperty.value - this.effectiveEFieldProperty.value,
    );

    this.dielectricEFieldProperty = DerivedProperty.deriveAny(
      inputs,
      () => this.platesDielectricEFieldProperty.value - this.effectiveEFieldProperty.value,
    );
  }

  // ── Geometry ────────────────────────────────────────────────────────────────

  /** Side length of a plate, metres. Design-doc symbol `L`. */
  public getPlateWidth(): number {
    return this.plateSizeProperty.value.width;
  }

  /** Thickness of a plate, metres. Constant. */
  public getPlateHeight(): number {
    return this.plateSizeProperty.value.height;
  }

  /** Depth of a plate, metres. Equal to the width, since plates are square. */
  public getPlateDepth(): number {
    return this.plateSizeProperty.value.depth;
  }

  /**
   * Sets the plate side length. Only the width is settable: plates are square, so
   * the depth follows, and the thickness is fixed.
   */
  public setPlateWidth(plateWidth: number): void {
    // Guarded because a zero or negative width divides by zero downstream (area
    // feeds capacitance, which feeds charge and field) and the failure would show
    // up far from its cause.
    if (plateWidth <= 0) {
      throw new Error(`plateWidth must be > 0: ${plateWidth}`);
    }
    this.plateSizeProperty.value = new Dimension3(plateWidth, this.getPlateHeight(), plateWidth);
  }

  /** The dielectric fills the gap, so it is as wide and deep as a plate and as tall as the gap. */
  public getDielectricSize(): Dimension3 {
    return new Dimension3(this.getPlateWidth(), this.plateSeparationProperty.value, this.getPlateDepth());
  }

  /** Outside centre of the top plate — where the top wire attaches. */
  public getTopPlateCenter(): Vector3 {
    return this.position.plusXYZ(0, -this.plateSeparationProperty.value / 2 - this.getPlateHeight(), 0);
  }

  /** Outside centre of the bottom plate — where the bottom wire attaches. */
  public getBottomPlateCenter(): Vector3 {
    return this.position.plusXYZ(0, this.plateSeparationProperty.value / 2 + this.getPlateHeight(), 0);
  }

  // ── Capacitance ─────────────────────────────────────────────────────────────

  /**
   * Sets total capacitance by moving the plates. The Multiple Capacitors screen
   * gives the user capacitance directly and no control over geometry, so plate
   * width stays fixed and separation absorbs the change.
   */
  public setTotalCapacitance(capacitance: number): void {
    this.plateSeparationProperty.value = Capacitor.getPlateSeparation(
      this.dielectricConstantProperty.value,
      this.getPlateWidth(),
      capacitance,
    );
  }

  /** Inverts C = ε_r·ε₀·A/d for d. */
  public static getPlateSeparation(dielectricConstant: number, plateWidth: number, capacitance: number): number {
    return (dielectricConstant * EPSILON_0 * plateWidth * plateWidth) / capacitance;
  }

  // ── Probe hit-testing ───────────────────────────────────────────────────────

  /** Does a shape touch the top plate? Used by the voltmeter's probes. */
  public intersectsTopPlate(shape: Shape): boolean {
    return shapeIntersects(shape, this.shapes.createTopPlateShapeOccluded());
  }

  /** Does a shape touch the visible part of the bottom plate? */
  public intersectsBottomPlate(shape: Shape): boolean {
    return shapeIntersects(shape, this.shapes.createBottomPlateShapeOccluded());
  }

  /** Is a model-frame point anywhere in the gap between the plates? */
  public isBetweenPlates(point: Vector3): boolean {
    return this.isInsideDielectricBetweenPlates(point) || this.isInsideAirBetweenPlates(point);
  }

  /** Is a model-frame point in the part of the gap the dielectric fills? */
  public isInsideDielectricBetweenPlates(point: Vector3): boolean {
    return this.shapes
      .createDielectricBetweenPlatesShapeOccluded()
      .containsPoint(this.modelViewTransform.modelToViewPosition(point));
  }

  /** Is a model-frame point in the part of the gap the dielectric has vacated? */
  public isInsideAirBetweenPlates(point: Vector3): boolean {
    return this.shapes
      .createAirBetweenPlatesShapeOccluded()
      .containsPoint(this.modelViewTransform.modelToViewPosition(point));
  }

  public reset(): void {
    this.plateSizeProperty.reset();
    this.plateSeparationProperty.reset();
    this.dielectricMaterialProperty.reset();
    this.dielectricOffsetProperty.reset();
    this.plateVoltageProperty.reset();
  }
}
