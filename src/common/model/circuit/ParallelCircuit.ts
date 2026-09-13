/**
 * ParallelCircuit.ts
 *
 * A battery (B) and N capacitors (C1…Cn) in parallel — a row of capacitors, all
 * seeing the battery's full voltage.
 *
 *     |-----|------|------|
 *     |     |      |      |
 *     B     C1     C2     C3
 *     |     |      |      |
 *     |-----|------|------|
 *
 * Ported from `model/circuit/ParallelCircuit.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import { Capacitor } from "../Capacitor.js";
import type { CircuitConfig } from "../CircuitConfig.js";
import {
  createWireBatteryToCapacitorsBottom,
  createWireBatteryToCapacitorsTop,
} from "../wire/WireBatteryToCapacitors.js";
import { AbstractCircuit } from "./AbstractCircuit.js";

/** A row of capacitors to the right of the battery, evenly spaced. */
export function createCapacitorsInRow(config: CircuitConfig, numberOfCapacitors: number): Capacitor[] {
  const capacitors: Capacitor[] = [];
  let x = config.batteryPosition.x + config.capacitorXSpacing;
  for (let i = 0; i < numberOfCapacitors; i++) {
    capacitors.push(
      new Capacitor(
        new Vector3(x, config.batteryPosition.y, config.batteryPosition.z),
        config.plateWidth,
        config.plateSeparation,
        config.dielectricMaterial,
        config.dielectricOffset,
        config.modelViewTransform,
      ),
    );
    x += config.capacitorXSpacing;
  }
  return capacitors;
}

export class ParallelCircuit extends AbstractCircuit {
  /**
   * @param deferFinish - true when a subclass still has state to register in
   *   `changeInputs`; that subclass then calls `finishConstruction()` itself.
   */
  public constructor(
    config: CircuitConfig,
    displayNameProperty: TReadOnlyProperty<string>,
    numberOfCapacitors: number,
    deferFinish = false,
  ) {
    super(config, displayNameProperty, numberOfCapacitors, createCapacitorsInRow, (cfg, battery, capacitors) => [
      createWireBatteryToCapacitorsTop(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, capacitors),
      createWireBatteryToCapacitorsBottom(
        cfg.modelViewTransform,
        cfg.wireThickness,
        cfg.wireExtent,
        battery,
        capacitors,
      ),
    ]);
    if (!deferFinish) {
      this.finishConstruction();
    }
  }

  /** Every capacitor sees the same voltage. */
  protected override updatePlateVoltages(): void {
    const voltage = this.computeTotalVoltage();
    for (const capacitor of this.capacitors) {
      capacitor.plateVoltageProperty.value = voltage;
    }
  }

  /** C_total = C1 + C2 + … + Cn */
  protected override computeTotalCapacitance(): number {
    return this.capacitors.reduce((sum, capacitor) => sum + capacitor.totalCapacitanceProperty.value, 0);
  }

  public override getVoltageAt(shape: Shape): number {
    if (this.connectedToBatteryTop(shape)) {
      return this.computeTotalVoltage();
    }
    if (this.connectedToBatteryBottom(shape)) {
      return 0;
    }
    return Number.NaN;
  }

  /** Is the shape touching anything at the battery's top potential? */
  protected connectedToBatteryTop(shape: Shape): boolean {
    return (
      this.battery.intersectsTopTerminal(shape) || this.topWire.intersects(shape) || this.intersectsSomeTopPlate(shape)
    );
  }

  /** Is the shape touching anything at ground? */
  protected connectedToBatteryBottom(shape: Shape): boolean {
    return (
      this.battery.intersectsBottomTerminal(shape) ||
      this.bottomWire.intersects(shape) ||
      this.intersectsSomeBottomPlate(shape)
    );
  }

  protected intersectsSomeTopPlate(shape: Shape): boolean {
    return this.capacitors.some((capacitor) => capacitor.intersectsTopPlate(shape));
  }

  protected intersectsSomeBottomPlate(shape: Shape): boolean {
    return this.capacitors.some((capacitor) => capacitor.intersectsBottomPlate(shape));
  }
}
