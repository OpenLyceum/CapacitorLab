/**
 * BarMeter.ts
 *
 * A draggable bar meter reading one scalar off the circuit — capacitance, plate
 * charge or stored energy.
 *
 * The reading follows the circuit through a DynamicProperty, so switching
 * circuits on the Multiple Capacitors screen re-points the meter without any
 * listener bookkeeping. The Java version swapped listeners by hand in
 * `setCircuit`.
 *
 * Ported from `model/meter/BarMeter.java`.
 */

import { BooleanProperty, DynamicProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { Circuit } from "../circuit/Circuit.js";
import type { WorldBounds } from "../WorldBounds.js";
import { WorldPositionProperty } from "../WorldPositionProperty.js";

/** Picks the circuit quantity a given meter reads. */
export type BarMeterDerivation = (circuit: Circuit) => TReadOnlyProperty<number>;

export class BarMeter {
  /** Where the meter sits, clamped to the play area. */
  public readonly positionProperty: WorldPositionProperty;

  public readonly visibleProperty: BooleanProperty;

  /** The quantity being read, in its SI unit. */
  public readonly valueProperty: TReadOnlyProperty<number>;

  public constructor(
    circuitProperty: TReadOnlyProperty<Circuit>,
    worldBounds: WorldBounds,
    position: Vector3,
    visible: boolean,
    derivation: BarMeterDerivation,
  ) {
    this.positionProperty = new WorldPositionProperty(worldBounds, position);
    this.visibleProperty = new BooleanProperty(visible);
    this.valueProperty = new DynamicProperty<number, number, Circuit>(circuitProperty, { derive: derivation });
  }

  public reset(): void {
    this.positionProperty.reset();
    this.visibleProperty.reset();
  }
}

/** Reads C_total, Farads. */
export const CAPACITANCE_DERIVATION: BarMeterDerivation = (circuit) => circuit.totalCapacitanceProperty;

/** Reads Q_total, Coulombs. */
export const PLATE_CHARGE_DERIVATION: BarMeterDerivation = (circuit) => circuit.totalChargeProperty;

/** Reads U, Joules. */
export const STORED_ENERGY_DERIVATION: BarMeterDerivation = (circuit) => circuit.storedEnergyProperty;
