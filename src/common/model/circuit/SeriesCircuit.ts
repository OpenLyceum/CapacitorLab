/**
 * SeriesCircuit.ts
 *
 * A battery (B) and N capacitors (C1…Cn) in series — a vertical stack, each
 * carrying the same charge and dividing the battery's voltage between them.
 *
 *     |-----|
 *     |     |
 *     |    C1
 *     |     |
 *     B    C2
 *     |     |
 *     |    C3
 *     |     |
 *     |-----|
 *
 * Ported from `model/circuit/SeriesCircuit.java`.
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
import { createWireCapacitorToCapacitors } from "../wire/WireCapacitorToCapacitors.js";
import { AbstractCircuit } from "./AbstractCircuit.js";

/** A column of capacitors to the right of the battery, centred on the battery's y. */
function createCapacitorsInColumn(config: CircuitConfig, numberOfCapacitors: number): Capacitor[] {
  const x = config.batteryPosition.x + config.capacitorXSpacing;
  let y = config.batteryPosition.y - Math.floor(numberOfCapacitors / 2) * config.capacitorYSpacing;
  if (numberOfCapacitors % 2 === 0) {
    // An even stack has no middle capacitor, so shift it half a slot to keep the
    // column centred on the battery.
    y += 0.5 * config.capacitorYSpacing;
  }

  const capacitors: Capacitor[] = [];
  for (let i = 0; i < numberOfCapacitors; i++) {
    capacitors.push(
      new Capacitor(
        new Vector3(x, y, config.batteryPosition.z),
        config.plateWidth,
        config.plateSeparation,
        config.dielectricMaterial,
        config.dielectricOffset,
        config.modelViewTransform,
      ),
    );
    y += config.capacitorYSpacing;
  }
  return capacitors;
}

export class SeriesCircuit extends AbstractCircuit {
  public constructor(
    config: CircuitConfig,
    displayNameProperty: TReadOnlyProperty<string>,
    numberOfCapacitors: number,
  ) {
    super(config, displayNameProperty, numberOfCapacitors, createCapacitorsInColumn, (cfg, battery, capacitors) => {
      const first = capacitors[0];
      const last = capacitors[capacitors.length - 1];
      if (first === undefined || last === undefined) {
        throw new Error("a series circuit needs at least one capacitor");
      }

      // Ordered top to bottom, so wire i is above capacitor i and wire i+1 below
      // it — which is what getVoltageAt relies on.
      const wires = [
        createWireBatteryToCapacitorsTop(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [first]),
      ];
      for (let i = 0; i < capacitors.length - 1; i++) {
        const above = capacitors[i];
        const below = capacitors[i + 1];
        if (above === undefined || below === undefined) {
          throw new Error("unreachable: index is within bounds");
        }
        wires.push(createWireCapacitorToCapacitors(cfg.modelViewTransform, cfg.wireThickness, above, [below]));
      }
      wires.push(
        createWireBatteryToCapacitorsBottom(cfg.modelViewTransform, cfg.wireThickness, cfg.wireExtent, battery, [last]),
      );
      return wires;
    });
    this.finishConstruction();
  }

  /** Same charge through every capacitor, so Vi = Q_total / Ci. */
  protected override updatePlateVoltages(): void {
    const totalCharge = this.computeTotalCharge();
    for (const capacitor of this.capacitors) {
      capacitor.plateVoltageProperty.value = totalCharge / capacitor.totalCapacitanceProperty.value;
    }
  }

  /** 1/C_total = 1/C1 + 1/C2 + … + 1/Cn */
  protected override computeTotalCapacitance(): number {
    const reciprocalSum = this.capacitors.reduce(
      (sum, capacitor) => sum + 1 / capacitor.totalCapacitanceProperty.value,
      0,
    );
    return 1 / reciprocalSum;
  }

  /**
   * Potential falls step by step down the stack, so the voltage at a point is the
   * sum of the plate voltages below it.
   */
  public override getVoltageAt(shape: Shape): number {
    if (this.battery.intersectsTopTerminal(shape)) {
      return this.computeTotalVoltage();
    }
    if (this.battery.intersectsBottomTerminal(shape)) {
      return 0;
    }
    for (let i = 0; i < this.capacitors.length; i++) {
      const capacitor = this.capacitors[i];
      const topWire = this.wires[i];
      const bottomWire = this.wires[i + 1];
      if (capacitor === undefined || topWire === undefined || bottomWire === undefined) {
        continue;
      }
      if (capacitor.intersectsTopPlate(shape) || topWire.intersects(shape)) {
        return this.sumPlateVoltages(i);
      }
      if (capacitor.intersectsBottomPlate(shape) || bottomWire.intersects(shape)) {
        return this.sumPlateVoltages(i + 1);
      }
    }
    return Number.NaN;
  }

  /** Total drop from the given plate down to ground. */
  private sumPlateVoltages(topPlateIndex: number): number {
    return this.capacitors
      .slice(topPlateIndex)
      .reduce((sum, capacitor) => sum + capacitor.plateVoltageProperty.value, 0);
  }
}
