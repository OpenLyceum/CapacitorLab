/**
 * CombinationCircuits.ts
 *
 * The two mixed series/parallel circuits on the Multiple Capacitors screen.
 *
 * These look like near-duplicates, and the Java sim kept them as two separate
 * classes for a reason worth repeating: what they share is a coincidence of how
 * the capacitors happen to be numbered, not a shared idea. Factoring out a common
 * base would couple two one-off topologies that could each change independently.
 * They share a file here because they are read together, not a base class.
 *
 * Ported from `model/circuit/Combination1Circuit.java` and
 * `model/circuit/Combination2Circuit.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { Capacitor } from "../Capacitor.js";
import type { CircuitConfig } from "../CircuitConfig.js";
import type { Wire } from "../wire/Wire.js";
import {
  createWireBatteryToCapacitorsBottom,
  createWireBatteryToCapacitorsTop,
} from "../wire/WireBatteryToCapacitors.js";
import { createWireCapacitorToCapacitors } from "../wire/WireCapacitorToCapacitors.js";
import { AbstractCircuit } from "./AbstractCircuit.js";

/**
 * Both combinations place C1 above C2 in the left column and C3 alone in the
 * right column, level with C2.
 */
function createCombinationCapacitors(config: CircuitConfig): Capacitor[] {
  const makeCapacitor = (x: number, y: number): Capacitor =>
    new Capacitor(
      new Vector3(x, y, config.batteryPosition.z),
      config.plateWidth,
      config.plateSeparation,
      config.dielectricMaterial,
      config.dielectricOffset,
      config.modelViewTransform,
    );

  const leftX = config.batteryPosition.x + config.capacitorXSpacing;
  const topY = config.batteryPosition.y - 0.5 * config.capacitorYSpacing;
  const bottomY = topY + config.capacitorYSpacing;

  return [
    makeCapacitor(leftX, topY),
    makeCapacitor(leftX, bottomY),
    makeCapacitor(leftX + config.capacitorXSpacing, bottomY),
  ];
}

/** Unpacks the three capacitors, failing loudly rather than silently mis-wiring. */
function asThree(capacitors: readonly Capacitor[]): [Capacitor, Capacitor, Capacitor] {
  const [c1, c2, c3] = capacitors;
  if (c1 === undefined || c2 === undefined || c3 === undefined) {
    throw new Error("a combination circuit needs exactly three capacitors");
  }
  return [c1, c2, c3];
}

/**
 * C1 and C2 in series, with C3 in parallel across the pair.
 *
 *     |-----|------|
 *     |     |      |
 *     |     C1     |
 *     |     |      |
 *     B     |      C3
 *     |     |      |
 *     |     C2     |
 *     |     |      |
 *     |-----|------|
 */
export class Combination1Circuit extends AbstractCircuit {
  private readonly c1: Capacitor;
  private readonly c2: Capacitor;
  private readonly c3: Capacitor;

  public constructor(config: CircuitConfig, displayNameProperty: TReadOnlyProperty<string>) {
    super(config, displayNameProperty, 3, createCombinationCapacitors, (cfg, battery, capacitors): Wire[] => {
      const [c1, c2, c3] = asThree(capacitors);
      return [
        // The top rail feeds both the series pair and C3.
        createWireBatteryToCapacitorsTop(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [c1, c3]),
        createWireCapacitorToCapacitors(cfg.modelViewTransform, cfg.wireThickness, c1, [c2]),
        createWireBatteryToCapacitorsBottom(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [
          c2,
          c3,
        ]),
      ];
    });
    [this.c1, this.c2, this.c3] = asThree(this.capacitors);
    this.finishConstruction();
  }

  protected override updatePlateVoltages(): void {
    const seriesCapacitance =
      1 / (1 / this.c1.totalCapacitanceProperty.value + 1 / this.c2.totalCapacitanceProperty.value);
    const seriesCharge = this.computeTotalVoltage() * seriesCapacitance;

    this.c1.plateVoltageProperty.value = seriesCharge / this.c1.totalCapacitanceProperty.value;
    this.c2.plateVoltageProperty.value = seriesCharge / this.c2.totalCapacitanceProperty.value;
    this.c3.plateVoltageProperty.value = this.computeTotalVoltage();
  }

  /** C_total = (C1 ∥ series with C2) + C3 */
  protected override computeTotalCapacitance(): number {
    const c1 = this.c1.totalCapacitanceProperty.value;
    const c2 = this.c2.totalCapacitanceProperty.value;
    const c3 = this.c3.totalCapacitanceProperty.value;
    return 1 / (1 / c1 + 1 / c2) + c3;
  }

  public override getVoltageAt(shape: Shape): number {
    if (
      this.battery.intersectsTopTerminal(shape) ||
      this.topWire.intersects(shape) ||
      this.c1.intersectsTopPlate(shape) ||
      this.c3.intersectsTopPlate(shape)
    ) {
      return this.computeTotalVoltage();
    }
    if (
      this.battery.intersectsBottomTerminal(shape) ||
      this.bottomWire.intersects(shape) ||
      this.c2.intersectsBottomPlate(shape) ||
      this.c3.intersectsBottomPlate(shape)
    ) {
      return 0;
    }
    // The junction between the series pair floats at C2's plate voltage.
    const middleWire = this.wires[1];
    if (this.c1.intersectsBottomPlate(shape) || this.c2.intersectsTopPlate(shape) || middleWire?.intersects(shape)) {
      return this.c2.plateVoltageProperty.value;
    }
    return Number.NaN;
  }
}

/**
 * C2 and C3 in parallel, with C1 in series above them.
 *
 *     |-----|
 *     |     |
 *     |    C1
 *     |     |
 *     B     |------|
 *     |     |      |
 *     |     C2    C3
 *     |     |      |
 *     |-----|------|
 */
export class Combination2Circuit extends AbstractCircuit {
  private readonly c1: Capacitor;
  private readonly c2: Capacitor;
  private readonly c3: Capacitor;

  public constructor(config: CircuitConfig, displayNameProperty: TReadOnlyProperty<string>) {
    super(config, displayNameProperty, 3, createCombinationCapacitors, (cfg, battery, capacitors): Wire[] => {
      const [c1, c2, c3] = asThree(capacitors);
      return [
        createWireBatteryToCapacitorsTop(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [c1]),
        // One junction fans out from C1 to both parallel capacitors.
        createWireCapacitorToCapacitors(cfg.modelViewTransform, cfg.wireThickness, c1, [c2, c3]),
        createWireBatteryToCapacitorsBottom(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [
          c2,
          c3,
        ]),
      ];
    });
    [this.c1, this.c2, this.c3] = asThree(this.capacitors);
    this.finishConstruction();
  }

  protected override updatePlateVoltages(): void {
    const totalCharge = this.computeTotalCharge();
    this.c1.plateVoltageProperty.value = totalCharge / this.c1.totalCapacitanceProperty.value;

    // The parallel pair shares the remaining voltage.
    const parallelVoltage =
      totalCharge / (this.c2.totalCapacitanceProperty.value + this.c3.totalCapacitanceProperty.value);
    this.c2.plateVoltageProperty.value = parallelVoltage;
    this.c3.plateVoltageProperty.value = parallelVoltage;
  }

  /** C_total = C1 in series with (C2 + C3) */
  protected override computeTotalCapacitance(): number {
    const c1 = this.c1.totalCapacitanceProperty.value;
    const c2 = this.c2.totalCapacitanceProperty.value;
    const c3 = this.c3.totalCapacitanceProperty.value;
    return 1 / (1 / c1 + 1 / (c2 + c3));
  }

  public override getVoltageAt(shape: Shape): number {
    if (
      this.battery.intersectsTopTerminal(shape) ||
      this.topWire.intersects(shape) ||
      this.c1.intersectsTopPlate(shape)
    ) {
      return this.computeTotalVoltage();
    }
    if (
      this.battery.intersectsBottomTerminal(shape) ||
      this.bottomWire.intersects(shape) ||
      this.c2.intersectsBottomPlate(shape) ||
      this.c3.intersectsBottomPlate(shape)
    ) {
      return 0;
    }
    const middleWire = this.wires[1];
    if (
      this.c1.intersectsBottomPlate(shape) ||
      this.c2.intersectsTopPlate(shape) ||
      this.c3.intersectsTopPlate(shape) ||
      middleWire?.intersects(shape)
    ) {
      return this.c2.plateVoltageProperty.value;
    }
    return Number.NaN;
  }
}
