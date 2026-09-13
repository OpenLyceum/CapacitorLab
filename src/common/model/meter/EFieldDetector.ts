/**
 * EFieldDetector.ts
 *
 * A draggable detector that reads the electric field at its probe tip and breaks
 * it into three vectors: the field the plates produce, the opposing field from
 * polarization of whatever fills the gap, and their sum.
 *
 * On the Introduction screen only the sum is shown and the extra controls are
 * hidden, because there is no dielectric there for the other two to differ over.
 *
 * Ported from `model/meter/EFieldDetector.java`.
 */

import { BooleanProperty, Multilink, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import type { Capacitor } from "../Capacitor.js";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import type { Circuit } from "../circuit/Circuit.js";
import type { WorldBounds } from "../WorldBounds.js";
import { WorldPositionProperty } from "../WorldPositionProperty.js";

export type EFieldDetectorOptions = {
  visible: boolean;
  plateVectorVisible: boolean;
  dielectricVectorVisible: boolean;
  sumVectorVisible: boolean;
  valuesVisible: boolean;
};

export class EFieldDetector {
  public readonly visibleProperty: BooleanProperty;
  public readonly bodyPositionProperty: WorldPositionProperty;
  public readonly probePositionProperty: WorldPositionProperty;

  public readonly plateVectorVisibleProperty: BooleanProperty;
  public readonly dielectricVectorVisibleProperty: BooleanProperty;
  public readonly sumVectorVisibleProperty: BooleanProperty;
  public readonly valuesVisibleProperty: BooleanProperty;

  /** Field due to the plates at the probe, V/m. */
  public readonly plateVectorProperty: NumberProperty;

  /** Field due to polarization at the probe, V/m. */
  public readonly dielectricVectorProperty: NumberProperty;

  /** Net field at the probe, V/m. */
  public readonly sumVectorProperty: NumberProperty;

  private readonly circuitProperty: TReadOnlyProperty<Circuit>;
  private readonly modelViewTransform: CLModelViewTransform3D;
  private circuitMultilink: { dispose: () => void } | null = null;

  /** Whether the detector has ever been shown — see the visibility link below. */
  private hasBeenVisible: boolean;

  public constructor(
    circuitProperty: TReadOnlyProperty<Circuit>,
    worldBounds: WorldBounds,
    modelViewTransform: CLModelViewTransform3D,
    bodyPosition: Vector3,
    probePosition: Vector3,
    options: EFieldDetectorOptions,
  ) {
    this.circuitProperty = circuitProperty;
    this.modelViewTransform = modelViewTransform;

    this.visibleProperty = new BooleanProperty(options.visible);
    this.bodyPositionProperty = new WorldPositionProperty(worldBounds, bodyPosition);
    this.probePositionProperty = new WorldPositionProperty(worldBounds, probePosition);

    this.plateVectorVisibleProperty = new BooleanProperty(options.plateVectorVisible);
    this.dielectricVectorVisibleProperty = new BooleanProperty(options.dielectricVectorVisible);
    this.sumVectorVisibleProperty = new BooleanProperty(options.sumVectorVisible);
    this.valuesVisibleProperty = new BooleanProperty(options.valuesVisible);

    this.plateVectorProperty = new NumberProperty(0);
    this.dielectricVectorProperty = new NumberProperty(0);
    this.sumVectorProperty = new NumberProperty(0);

    this.probePositionProperty.link(() => this.updateVectors());

    circuitProperty.link((circuit: Circuit) => {
      this.circuitMultilink?.dispose();
      this.circuitMultilink = Multilink.multilinkAny(circuit.changeProperties, () => this.updateVectors());
      this.updateVectors();
    });

    // The detector starts in the toolbox reading zero. The first time the user
    // brings it out, drop the probe into a capacitor so it reads something —
    // otherwise the meter appears broken.
    this.hasBeenVisible = options.visible;
    this.visibleProperty.lazyLink(() => {
      if (!this.hasBeenVisible) {
        this.hasBeenVisible = true;
        const firstCapacitor = this.circuitProperty.value.capacitors[0];
        if (firstCapacitor !== undefined) {
          this.moveProbeInto(firstCapacitor);
        }
      }
    });
  }

  /**
   * Puts the probe at the capacitor's centre, or just below the top plate if the
   * centre would leave it hidden behind that plate.
   */
  private moveProbeInto(capacitor: Capacitor): void {
    this.probePositionProperty.value = capacitor.position;
    if (this.probeIntersectsTopPlate(capacitor)) {
      this.probePositionProperty.value = new Vector3(
        capacitor.position.x,
        capacitor.position.y + capacitor.plateSeparationProperty.value / 2,
        capacitor.position.z,
      );
    }
  }

  private probeIntersectsTopPlate(capacitor: Capacitor): boolean {
    const viewPoint = this.modelViewTransform.modelToViewPosition(this.probePositionProperty.value);
    return capacitor.shapes.createTopPlateShapeOccluded().containsPoint(viewPoint);
  }

  private updateVectors(): void {
    const circuit = this.circuitProperty.value;
    const probe = this.probePositionProperty.value;
    this.plateVectorProperty.value = circuit.getPlatesDielectricEFieldAt(probe);
    this.dielectricVectorProperty.value = circuit.getDielectricEFieldAt(probe);
    this.sumVectorProperty.value = circuit.getEffectiveEFieldAt(probe);
  }

  public reset(): void {
    this.visibleProperty.reset();
    this.hasBeenVisible = this.visibleProperty.value;
    this.bodyPositionProperty.reset();
    this.probePositionProperty.reset();
    this.plateVectorVisibleProperty.reset();
    this.dielectricVectorVisibleProperty.reset();
    this.sumVectorVisibleProperty.reset();
    this.valuesVisibleProperty.reset();
  }
}
