/**
 * Circuit.ts
 *
 * What every circuit in the sim can answer. Units are metres, Farads, Coulombs,
 * Volts and Joules throughout.
 *
 * Wire order matters: the first wire is connected to the battery's top terminal
 * and the last to its bottom terminal. Circuits with internal junctions put those
 * wires in between, top to bottom.
 *
 * Ported from `model/circuit/ICircuit.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import type { Battery } from "../Battery.js";
import type { Capacitor } from "../Capacitor.js";
import type { Wire } from "../wire/Wire.js";

export type Circuit = {
  /** Localized name shown in the circuit picker. */
  readonly displayNameProperty: TReadOnlyProperty<string>;

  readonly battery: Battery;
  readonly capacitors: readonly Capacitor[];
  readonly wires: readonly Wire[];

  /** Whether the battery is wired in. Only the single-capacitor circuit can say no. */
  readonly batteryConnectedProperty: TReadOnlyProperty<boolean>;

  /** C_total, Farads. */
  readonly totalCapacitanceProperty: TReadOnlyProperty<number>;

  /** The voltage the capacitors see, Volts. */
  readonly totalVoltageProperty: TReadOnlyProperty<number>;

  /** Q_total, Coulombs. */
  readonly totalChargeProperty: TReadOnlyProperty<number>;

  /** U = ½CV², Joules. */
  readonly storedEnergyProperty: TReadOnlyProperty<number>;

  /** dQ/dt, Amps. Drives the direction and visibility of the current arrows. */
  readonly currentAmplitudeProperty: TReadOnlyProperty<number>;

  /**
   * Voltage at whatever a probe-tip shape is touching, with respect to ground, or
   * NaN when the shape is touching nothing connected to the circuit.
   */
  getVoltageAt(shape: Shape): number;

  /** Voltage between two probe-tip shapes, or NaN if either is unconnected. */
  getVoltageBetween(positiveShape: Shape, negativeShape: Shape): number;

  /** Net field at a model-frame point: E_effective between plates, zero outside. */
  getEffectiveEFieldAt(point: Vector3): number;

  /** Field due to the plates at a point — the air or dielectric value as appropriate. */
  getPlatesDielectricEFieldAt(point: Vector3): number;

  /** Field due to polarization at a point. */
  getDielectricEFieldAt(point: Vector3): number;

  step(dt: number): void;
  reset(): void;
};
