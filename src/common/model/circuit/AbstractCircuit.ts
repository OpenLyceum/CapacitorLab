/**
 * AbstractCircuit.ts
 *
 * Shared machinery for every circuit: it builds the battery, the capacitors and
 * the wires from a {@link CircuitConfig}, keeps the capacitors' plate voltages in
 * step with whatever the user changes, and tracks current as dQ/dt.
 *
 * ── Two-phase construction ───────────────────────────────────────────────────
 * Plate voltages depend on subclass state (which capacitors are in series, whether
 * the battery is connected), so the base class cannot link them until the subclass
 * constructor has finished. Every concrete circuit therefore ends its constructor
 * with `this.finishConstruction()`. The Java version had the same requirement and
 * met it with null checks inside `updatePlateVoltages`; making it an explicit call
 * is the same order with the reason written down.
 *
 * Ported from `model/circuit/AbstractCircuit.java`.
 */

import { BooleanProperty, DerivedProperty, Multilink, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { BATTERY_VOLTAGE_RANGE } from "../../../CapacitorLabConstants.js";
import { Battery } from "../Battery.js";
import type { Capacitor } from "../Capacitor.js";
import type { CircuitConfig } from "../CircuitConfig.js";
import type { Wire } from "../wire/Wire.js";
import type { Circuit } from "./Circuit.js";

export type CreateCapacitors = (config: CircuitConfig, numberOfCapacitors: number) => Capacitor[];
export type CreateWires = (config: CircuitConfig, battery: Battery, capacitors: readonly Capacitor[]) => Wire[];

export abstract class AbstractCircuit implements Circuit {
  public readonly displayNameProperty: TReadOnlyProperty<string>;
  public readonly battery: Battery;
  public readonly capacitors: readonly Capacitor[];
  public readonly wires: readonly Wire[];

  /**
   * Whether the battery is wired in. Only the single-capacitor circuit ever sets
   * this to false; every other topology leaves it true for its whole life.
   */
  public readonly batteryConnectedProperty: BooleanProperty = new BooleanProperty(true);

  public readonly currentAmplitudeProperty: NumberProperty = new NumberProperty(0);

  // Assigned by finishConstruction(), which every concrete constructor must call.
  public totalCapacitanceProperty!: TReadOnlyProperty<number>;
  public totalVoltageProperty!: TReadOnlyProperty<number>;
  public totalChargeProperty!: TReadOnlyProperty<number>;
  public storedEnergyProperty!: TReadOnlyProperty<number>;

  /**
   * Everything that changes the circuit's electrical state *except* plate voltage
   * — which is an output, and would make the update cycle back on itself.
   * Subclasses append their own state here before calling finishConstruction.
   */
  protected readonly changeInputs: TReadOnlyProperty<unknown>[];

  /** Total charge at the previous step, for dQ/dt. Null until the first step. */
  private previousTotalCharge: number | null = null;

  protected constructor(
    config: CircuitConfig,
    displayNameProperty: TReadOnlyProperty<string>,
    numberOfCapacitors: number,
    createCapacitors: CreateCapacitors,
    createWires: CreateWires,
  ) {
    this.displayNameProperty = displayNameProperty;
    this.battery = new Battery(config.batteryPosition, BATTERY_VOLTAGE_RANGE.defaultValue, config.modelViewTransform);
    this.capacitors = createCapacitors(config, numberOfCapacitors);
    this.wires = createWires(config, this.battery, this.capacitors);

    this.changeInputs = [
      this.battery.voltageProperty,
      ...this.capacitors.flatMap((capacitor) => [
        capacitor.plateSizeProperty,
        capacitor.plateSeparationProperty,
        capacitor.dielectricOffsetProperty,
        capacitor.dielectricConstantProperty,
        capacitor.dielectricMaterialProperty,
      ]),
    ];
  }

  /**
   * Links the derived electrical state. Call at the very end of every concrete
   * constructor — see the note in the class doc.
   */
  protected finishConstruction(): void {
    this.totalCapacitanceProperty = DerivedProperty.deriveAny(this.changeInputs, () => this.computeTotalCapacitance());
    this.totalVoltageProperty = DerivedProperty.deriveAny(this.changeInputs, () => this.computeTotalVoltage());
    this.totalChargeProperty = DerivedProperty.deriveAny(this.changeInputs, () => this.computeTotalCharge());
    this.storedEnergyProperty = DerivedProperty.deriveAny(this.changeInputs, () => {
      const capacitance = this.computeTotalCapacitance();
      const voltage = this.computeTotalVoltage();
      return 0.5 * capacitance * voltage * voltage;
    });

    Multilink.multilinkAny(this.changeInputs, () => this.updatePlateVoltages());
    this.updatePlateVoltages();
  }

  /** Distributes the circuit's voltage across its capacitors. */
  protected abstract updatePlateVoltages(): void;

  /** C_total for this topology. */
  protected abstract computeTotalCapacitance(): number;

  /** Normally the battery voltage; overridden when the battery can be disconnected. */
  protected computeTotalVoltage(): number {
    return this.battery.voltageProperty.value;
  }

  protected computeTotalCharge(): number {
    return this.computeTotalVoltage() * this.computeTotalCapacitance();
  }

  /**
   * Everything a meter has to watch: the circuit's inputs plus the plate voltages
   * they produce. Meters re-link to this when the user switches circuits.
   */
  public get changeProperties(): TReadOnlyProperty<unknown>[] {
    return [...this.changeInputs, ...this.capacitors.map((capacitor) => capacitor.plateVoltageProperty)];
  }

  public get topWire(): Wire {
    const wire = this.wires[0];
    if (wire === undefined) {
      throw new Error("a circuit needs at least two wires");
    }
    return wire;
  }

  public get bottomWire(): Wire {
    const wire = this.wires[this.wires.length - 1];
    if (wire === undefined) {
      throw new Error("a circuit needs at least two wires");
    }
    return wire;
  }

  public abstract getVoltageAt(shape: Shape): number;

  public getVoltageBetween(positiveShape: Shape, negativeShape: Shape): number {
    return this.getVoltageAt(positiveShape) - this.getVoltageAt(negativeShape);
  }

  // ── E-field probing ─────────────────────────────────────────────────────────
  // Each returns the value for the first capacitor whose gap contains the point,
  // and zero outside every gap.

  public getEffectiveEFieldAt(point: Vector3): number {
    for (const capacitor of this.capacitors) {
      if (capacitor.isBetweenPlates(point)) {
        return capacitor.effectiveEFieldProperty.value;
      }
    }
    return 0;
  }

  public getPlatesDielectricEFieldAt(point: Vector3): number {
    for (const capacitor of this.capacitors) {
      if (capacitor.isInsideDielectricBetweenPlates(point)) {
        return capacitor.platesDielectricEFieldProperty.value;
      }
      if (capacitor.isInsideAirBetweenPlates(point)) {
        return capacitor.platesAirEFieldProperty.value;
      }
    }
    return 0;
  }

  public getDielectricEFieldAt(point: Vector3): number {
    for (const capacitor of this.capacitors) {
      if (capacitor.isInsideDielectricBetweenPlates(point)) {
        return capacitor.dielectricEFieldProperty.value;
      }
      if (capacitor.isInsideAirBetweenPlates(point)) {
        return capacitor.airEFieldProperty.value;
      }
    }
    return 0;
  }

  /**
   * Current is dQ/dt. The first step only records a baseline — without it the
   * sim would show a current spike at startup, when charge jumps from nothing to
   * its initial value.
   */
  public step(dt: number): void {
    const charge = this.totalChargeProperty.value;
    if (this.previousTotalCharge !== null && dt > 0) {
      this.currentAmplitudeProperty.value = (charge - this.previousTotalCharge) / dt;
    }
    this.previousTotalCharge = charge;
  }

  public reset(): void {
    this.battery.reset();
    for (const capacitor of this.capacitors) {
      capacitor.reset();
    }
    this.currentAmplitudeProperty.reset();
    this.previousTotalCharge = null;
  }
}
