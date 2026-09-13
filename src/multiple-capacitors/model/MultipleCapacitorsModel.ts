/**
 * MultipleCapacitorsModel.ts
 *
 * The Multiple Capacitors screen: seven prebuilt circuits the user switches
 * between, with capacitance set directly rather than through the plate geometry.
 *
 * All seven circuits exist at once and persist for the life of the screen; only
 * one is shown. The Java sim did the same, and its reasoning holds here: there is
 * no teardown to get wrong when the selection changes, and the meters just
 * re-point.
 *
 * Ported from `module/multiplecapacitors/MultipleCapacitorsModel.java`.
 */

import { Property } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import { CAPACITANCE_RANGE, WIRE_THICKNESS } from "../../CapacitorLabConstants.js";
import { Capacitor } from "../../common/model/Capacitor.js";
import { CapacitorLabModel, type MeterLayout } from "../../common/model/CapacitorLabModel.js";
import type { CircuitConfig } from "../../common/model/CircuitConfig.js";
import { CLModelViewTransform3D } from "../../common/model/CLModelViewTransform3D.js";
import type { Circuit } from "../../common/model/circuit/Circuit.js";
import { Combination1Circuit, Combination2Circuit } from "../../common/model/circuit/CombinationCircuits.js";
import { ParallelCircuit } from "../../common/model/circuit/ParallelCircuit.js";
import { SeriesCircuit } from "../../common/model/circuit/SeriesCircuit.js";
import { SingleCircuit } from "../../common/model/circuit/SingleCircuit.js";
import { createAir } from "../../common/model/DielectricMaterial.js";
import { StringManager } from "../../i18n/StringManager.js";

// Circuit layout, metres. Values from MultipleCapacitorsModel.java.
const BATTERY_POSITION = new Vector3(0.005, 0.03, 0);
const CAPACITOR_X_SPACING = 0.018;
const CAPACITOR_Y_SPACING = 0.016;
const WIRE_EXTENT = 0.01;

/**
 * Plates are fixed and small on this screen — there are up to four capacitors to
 * fit on one canvas — and the separation carries the capacitance the user dials
 * in.
 */
const PLATE_WIDTH = 0.0075;

/** Where the meters sit when they come out of the toolbox, metres. */
const METER_LAYOUT: Omit<MeterLayout, "eFieldDetector"> = {
  capacitanceMeterPosition: new Vector3(0.033, 0.0017, 0),
  plateChargeMeterPosition: new Vector3(0.046, 0.0017, 0),
  storedEnergyMeterPosition: new Vector3(0.059, 0.0017, 0),
  eFieldDetectorBodyPosition: new Vector3(0.05, 0.041, 0),
  eFieldDetectorProbePosition: BATTERY_POSITION,
  voltmeterBodyPosition: new Vector3(0.04, 0.041, 0),
  voltmeterPositiveProbePosition: new Vector3(0.035, 0.042, 0),
  voltmeterNegativeProbePosition: new Vector3(0.038, 0.042, 0),
};

export class MultipleCapacitorsModel extends CapacitorLabModel {
  /** The seven circuits, in the order the picker lists them. */
  public readonly circuits: readonly Circuit[];

  /** The circuit currently selected, and therefore drawn and measured. */
  public readonly currentCircuitProperty: Property<Circuit>;

  public constructor() {
    const modelViewTransform = new CLModelViewTransform3D();
    const dielectricMaterial = createAir();

    // Start every capacitor at the lowest capacitance in range, by deriving the
    // separation that produces it at the fixed plate width.
    const plateSeparation = Capacitor.getPlateSeparation(
      dielectricMaterial.dielectricConstantProperty.value,
      PLATE_WIDTH,
      CAPACITANCE_RANGE.min,
    );

    const config: CircuitConfig = {
      modelViewTransform: modelViewTransform,
      batteryPosition: BATTERY_POSITION,
      capacitorXSpacing: CAPACITOR_X_SPACING,
      capacitorYSpacing: CAPACITOR_Y_SPACING,
      plateWidth: PLATE_WIDTH,
      plateSeparation: plateSeparation,
      dielectricMaterial: dielectricMaterial,
      dielectricOffset: 0,
      wireThickness: WIRE_THICKNESS,
      wireExtent: WIRE_EXTENT,
    };

    const names = StringManager.getInstance().getCircuitStrings();
    const circuits: Circuit[] = [
      new SingleCircuit(config, names.singleStringProperty),
      new SeriesCircuit(config, names.twoInSeriesStringProperty, 2),
      new SeriesCircuit(config, names.threeInSeriesStringProperty, 3),
      new ParallelCircuit(config, names.twoInParallelStringProperty, 2),
      new ParallelCircuit(config, names.threeInParallelStringProperty, 3),
      new Combination1Circuit(config, names.combination1StringProperty),
      new Combination2Circuit(config, names.combination2StringProperty),
    ];

    const firstCircuit = circuits[0];
    if (firstCircuit === undefined) {
      throw new Error("unreachable: the circuit list is a literal");
    }
    const currentCircuitProperty = new Property<Circuit>(firstCircuit);

    super(modelViewTransform, currentCircuitProperty, {
      ...METER_LAYOUT,
      eFieldDetector: {
        visible: false,
        plateVectorVisible: true,
        dielectricVectorVisible: true,
        sumVectorVisible: true,
        valuesVisible: true,
      },
    });

    this.circuits = circuits;
    this.currentCircuitProperty = currentCircuitProperty;

    // Each capacitor has its own capacitance slider — that is what lets a network
    // be built from unequal parts. The battery, though, is one battery as far as
    // the user is concerned, so the circuits' batteries are kept in step.
    for (const circuit of circuits) {
      circuit.battery.voltageProperty.link((voltage: number) => {
        for (const other of circuits) {
          other.battery.voltageProperty.value = voltage;
        }
      });
    }
  }

  public override reset(): void {
    super.reset();
    for (const circuit of this.circuits) {
      circuit.reset();
    }
    this.currentCircuitProperty.reset();
  }
}
