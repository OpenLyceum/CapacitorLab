/**
 * CapacitorLabModel.ts
 *
 * What every screen's model has: the play-area bounds that draggable meters are
 * confined to, and the meters themselves.
 *
 * The bounds start empty and the ScreenView fills them in once it knows its own
 * visible bounds; every draggable position is a WorldPositionProperty, which
 * re-clamps itself when that happens and on every later resize.
 *
 * Ported from `model/CLModel.java` and the meter wiring the three Java module
 * models each repeated.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import type { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import type { Circuit } from "./circuit/Circuit.js";
import {
  BarMeter,
  CAPACITANCE_DERIVATION,
  PLATE_CHARGE_DERIVATION,
  STORED_ENERGY_DERIVATION,
} from "./meter/BarMeter.js";
import { EFieldDetector, type EFieldDetectorOptions } from "./meter/EFieldDetector.js";
import { Voltmeter } from "./meter/Voltmeter.js";
import { WorldBounds } from "./WorldBounds.js";

/** Where each meter starts, in model coordinates, and whether it starts visible. */
export type MeterLayout = {
  capacitanceMeterPosition: Vector3;
  plateChargeMeterPosition: Vector3;
  storedEnergyMeterPosition: Vector3;
  eFieldDetectorBodyPosition: Vector3;
  eFieldDetectorProbePosition: Vector3;
  voltmeterBodyPosition: Vector3;
  voltmeterPositiveProbePosition: Vector3;
  voltmeterNegativeProbePosition: Vector3;
  eFieldDetector: EFieldDetectorOptions;
};

export abstract class CapacitorLabModel implements TModel {
  /** The rectangle draggable objects are kept inside; filled in by the ScreenView. */
  public readonly worldBounds = new WorldBounds();

  public readonly modelViewTransform: CLModelViewTransform3D;

  /** The circuit currently being measured. Constant except on Multiple Capacitors. */
  public readonly circuitProperty: TReadOnlyProperty<Circuit>;

  public readonly capacitanceMeter: BarMeter;
  public readonly plateChargeMeter: BarMeter;
  public readonly storedEnergyMeter: BarMeter;
  public readonly voltmeter: Voltmeter;
  public readonly eFieldDetector: EFieldDetector;

  protected constructor(
    modelViewTransform: CLModelViewTransform3D,
    circuitProperty: TReadOnlyProperty<Circuit>,
    layout: MeterLayout,
  ) {
    this.modelViewTransform = modelViewTransform;
    this.circuitProperty = circuitProperty;

    // Every meter starts hidden in the toolbox; the Meters panel brings them out.
    this.capacitanceMeter = new BarMeter(
      circuitProperty,
      this.worldBounds,
      layout.capacitanceMeterPosition,
      false,
      CAPACITANCE_DERIVATION,
    );
    this.plateChargeMeter = new BarMeter(
      circuitProperty,
      this.worldBounds,
      layout.plateChargeMeterPosition,
      false,
      PLATE_CHARGE_DERIVATION,
    );
    this.storedEnergyMeter = new BarMeter(
      circuitProperty,
      this.worldBounds,
      layout.storedEnergyMeterPosition,
      false,
      STORED_ENERGY_DERIVATION,
    );

    this.voltmeter = new Voltmeter(
      circuitProperty,
      this.worldBounds,
      modelViewTransform,
      layout.voltmeterBodyPosition,
      layout.voltmeterPositiveProbePosition,
      layout.voltmeterNegativeProbePosition,
      false,
    );

    this.eFieldDetector = new EFieldDetector(
      circuitProperty,
      this.worldBounds,
      modelViewTransform,
      layout.eFieldDetectorBodyPosition,
      layout.eFieldDetectorProbePosition,
      layout.eFieldDetector,
    );
  }

  public step(dt: number): void {
    this.circuitProperty.value.step(dt);
  }

  public reset(): void {
    this.capacitanceMeter.reset();
    this.plateChargeMeter.reset();
    this.storedEnergyMeter.reset();
    this.voltmeter.reset();
    this.eFieldDetector.reset();
  }
}
