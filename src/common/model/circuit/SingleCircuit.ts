/**
 * SingleCircuit.ts
 *
 * A battery (B) and one capacitor (C1) — the circuit the Introduction and
 * Dielectric screens are built around.
 *
 *     |-----|
 *     |     |
 *     B    C1
 *     |     |
 *     |-----|
 *
 * It is a parallel circuit of one, plus the feature no other circuit has: the
 * battery can be disconnected. With the battery out, the plate charge is whatever
 * the user dials in and the plate voltage follows from it as V = Q/C, so changing
 * the plate geometry now changes the voltage instead of the charge — which is the
 * whole point of the control.
 *
 * Ported from `model/circuit/SingleCircuit.java`.
 */

import { NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Shape } from "scenerystack/kite";
import type { Capacitor } from "../Capacitor.js";
import type { CircuitConfig } from "../CircuitConfig.js";
import { ParallelCircuit } from "./ParallelCircuit.js";

export class SingleCircuit extends ParallelCircuit {
  /** The one capacitor, for readability at the call sites that assume it. */
  public readonly capacitor: Capacitor;

  /**
   * Plate charge the user sets directly while the battery is disconnected,
   * Coulombs. Seeded from the charge the circuit had at the moment of
   * disconnection, so pulling the battery does not make the charge jump.
   */
  public readonly disconnectedPlateChargeProperty: NumberProperty;

  public constructor(config: CircuitConfig, displayNameProperty: TReadOnlyProperty<string>, batteryConnected = true) {
    super(config, displayNameProperty, 1, true /* deferFinish */);

    const capacitor = this.capacitors[0];
    if (capacitor === undefined) {
      throw new Error("SingleCircuit must have exactly one capacitor");
    }
    this.capacitor = capacitor;

    this.batteryConnectedProperty.value = batteryConnected;
    this.disconnectedPlateChargeProperty = new NumberProperty(
      this.battery.voltageProperty.value * capacitor.totalCapacitanceProperty.value,
    );

    // Disconnecting hands the current charge to the manual control, so the
    // picture does not change at the moment the battery is removed.
    this.batteryConnectedProperty.lazyLink((connected: boolean) => {
      if (!connected) {
        this.disconnectedPlateChargeProperty.value = this.capacitor.totalPlateChargeProperty.value;
      }
    });

    this.changeInputs.push(this.batteryConnectedProperty, this.disconnectedPlateChargeProperty);
    this.finishConstruction();
  }

  protected override updatePlateVoltages(): void {
    this.capacitor.plateVoltageProperty.value = this.computeTotalVoltage();
  }

  /** With the battery out, V is no longer the battery's — it is Q/C. */
  protected override computeTotalVoltage(): number {
    if (this.batteryConnectedProperty.value) {
      return this.battery.voltageProperty.value;
    }
    return this.disconnectedPlateChargeProperty.value / this.capacitor.totalCapacitanceProperty.value;
  }

  /** Charge is read off the plate rather than recomputed, so both modes agree. */
  protected override computeTotalCharge(): number {
    return this.capacitor.totalCapacitanceProperty.value * this.computeTotalVoltage();
  }

  /**
   * With the battery disconnected the wires and terminals are no longer at a
   * defined potential, so only the plates themselves read a voltage.
   */
  public override getVoltageAt(shape: Shape): number {
    if (this.batteryConnectedProperty.value) {
      return super.getVoltageAt(shape);
    }
    if (this.intersectsSomeTopPlate(shape)) {
      return this.computeTotalVoltage();
    }
    if (this.intersectsSomeBottomPlate(shape)) {
      return 0;
    }
    return Number.NaN;
  }

  public override reset(): void {
    super.reset();
    this.batteryConnectedProperty.reset();
    this.disconnectedPlateChargeProperty.reset();
  }
}
