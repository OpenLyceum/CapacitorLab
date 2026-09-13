/**
 * SingleCapacitorModel.ts
 *
 * The model shared by the Introduction and Dielectric screens: one battery, one
 * capacitor, and the five meters.
 *
 * The two screens differ only in what they hand this constructor. Introduction
 * passes air as the only material and starts the slab fully withdrawn, so it is
 * never seen or interacted with; Dielectric passes the four real materials and
 * starts the slab inserted. That is exactly how the Java sim related them —
 * `IntroductionModule` built a `DielectricModel` with the dielectric pushed out
 * of the way rather than defining a model of its own.
 *
 * Ported from `module/dielectric/DielectricModel.java`.
 */

import { Property } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import { PLATE_SEPARATION_RANGE, PLATE_WIDTH_RANGE, WIRE_THICKNESS } from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { CapacitorLabModel, type MeterLayout } from "./CapacitorLabModel.js";
import type { CircuitConfig } from "./CircuitConfig.js";
import { CLModelViewTransform3D } from "./CLModelViewTransform3D.js";
import type { Circuit } from "./circuit/Circuit.js";
import { SingleCircuit } from "./circuit/SingleCircuit.js";
import type { DielectricMaterial } from "./DielectricMaterial.js";

// Circuit layout, metres. Values from DielectricModel.java.
const BATTERY_POSITION = new Vector3(0.005, 0.034, 0);
const CAPACITOR_X_SPACING = 0.025;
const CAPACITOR_Y_SPACING = 0;
const WIRE_EXTENT = 0.016;

/** Where the meters sit when they come out of the toolbox, metres. */
const METER_LAYOUT: Omit<MeterLayout, "eFieldDetector"> = {
  capacitanceMeterPosition: new Vector3(0.038, 0.0017, 0),
  plateChargeMeterPosition: new Vector3(0.049, 0.0017, 0),
  storedEnergyMeterPosition: new Vector3(0.06, 0.0017, 0),
  eFieldDetectorBodyPosition: new Vector3(0.043, 0.041, 0),
  eFieldDetectorProbePosition: BATTERY_POSITION,
  voltmeterBodyPosition: new Vector3(0.057, 0.023, 0),
  voltmeterPositiveProbePosition: new Vector3(BATTERY_POSITION.x + 0.015, BATTERY_POSITION.y, BATTERY_POSITION.z),
  voltmeterNegativeProbePosition: new Vector3(BATTERY_POSITION.x + 0.02, BATTERY_POSITION.y, BATTERY_POSITION.z),
};

export type SingleCapacitorModelOptions = {
  /** Materials the user can choose between. Introduction passes air alone. */
  materials: readonly DielectricMaterial[];

  /**
   * How far the dielectric starts withdrawn, metres. Introduction passes more
   * than a full plate width, putting the slab entirely outside the plates.
   */
  dielectricOffset: number;

  /**
   * True on the Introduction screen, where the detector shows only the sum
   * vector — with air in the gap there is nothing for the other two to differ
   * over, and three coincident arrows would be confusing rather than informative.
   */
  eFieldDetectorSimplified: boolean;
};

export class SingleCapacitorModel extends CapacitorLabModel {
  public readonly circuit: SingleCircuit;

  /** The materials offered in the Dielectric screen's combo box. */
  public readonly materials: readonly DielectricMaterial[];

  public constructor(options: SingleCapacitorModelOptions) {
    const modelViewTransform = new CLModelViewTransform3D();
    const firstMaterial = options.materials[0];
    if (firstMaterial === undefined) {
      throw new Error("at least one dielectric material is required");
    }

    const config: CircuitConfig = {
      modelViewTransform: modelViewTransform,
      batteryPosition: BATTERY_POSITION,
      capacitorXSpacing: CAPACITOR_X_SPACING,
      capacitorYSpacing: CAPACITOR_Y_SPACING,
      plateWidth: PLATE_WIDTH_RANGE.defaultValue,
      plateSeparation: PLATE_SEPARATION_RANGE.defaultValue,
      dielectricMaterial: firstMaterial,
      dielectricOffset: options.dielectricOffset,
      wireThickness: WIRE_THICKNESS,
      wireExtent: WIRE_EXTENT,
    };

    const circuit = new SingleCircuit(config, StringManager.getInstance().getCircuitStrings().singleStringProperty);
    const circuitProperty = new Property<Circuit>(circuit);

    super(modelViewTransform, circuitProperty, {
      ...METER_LAYOUT,
      eFieldDetector: {
        visible: false,
        // The simplified detector shows the sum alone.
        plateVectorVisible: !options.eFieldDetectorSimplified,
        dielectricVectorVisible: !options.eFieldDetectorSimplified,
        sumVectorVisible: true,
        valuesVisible: true,
      },
    });

    this.circuit = circuit;
    this.materials = options.materials;
  }

  public override reset(): void {
    super.reset();
    for (const material of this.materials) {
      material.reset();
    }
    this.circuit.reset();
  }
}
