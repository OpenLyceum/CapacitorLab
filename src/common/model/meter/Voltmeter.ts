/**
 * Voltmeter.ts
 *
 * A draggable voltmeter with two probes. Its reading is the potential difference
 * between whatever the probes are touching, or blank when either probe is in mid
 * air.
 *
 * Measurement is by shape intersection rather than node hit-testing: the probe
 * tip shapes are intersected against the circuit's terminals, wires and plates.
 * Touching the two probes together reads zero, as a real voltmeter would.
 *
 * Ported from `model/meter/Voltmeter.java`.
 */

import { BooleanProperty, Multilink, Property, type TReadOnlyProperty } from "scenerystack/axon";
import type { Vector3 } from "scenerystack/dot";
import type { Shape } from "scenerystack/kite";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import type { Circuit } from "../circuit/Circuit.js";
import { shapeIntersects } from "../shapes/shapeIntersects.js";
import { createProbeTipShape } from "../shapes/VoltmeterShapes.js";
import type { WorldBounds } from "../WorldBounds.js";
import { WorldPositionProperty } from "../WorldPositionProperty.js";

export class Voltmeter {
  public readonly visibleProperty: BooleanProperty;
  public readonly bodyPositionProperty: WorldPositionProperty;
  public readonly positiveProbePositionProperty: WorldPositionProperty;
  public readonly negativeProbePositionProperty: WorldPositionProperty;

  /**
   * Reading in Volts, or NaN when a probe is touching nothing in the circuit —
   * which the view shows as "?" rather than as a number. A plain Property rather
   * than a NumberProperty, because NumberProperty rejects NaN.
   */
  public readonly valueProperty: Property<number>;

  private readonly circuitProperty: TReadOnlyProperty<Circuit>;
  private readonly modelViewTransform: CLModelViewTransform3D;

  /** Watches the current circuit; replaced when the user picks a different one. */
  private circuitMultilink: { dispose: () => void } | null = null;

  public constructor(
    circuitProperty: TReadOnlyProperty<Circuit>,
    worldBounds: WorldBounds,
    modelViewTransform: CLModelViewTransform3D,
    bodyPosition: Vector3,
    positiveProbePosition: Vector3,
    negativeProbePosition: Vector3,
    visible: boolean,
  ) {
    this.circuitProperty = circuitProperty;
    this.modelViewTransform = modelViewTransform;

    this.visibleProperty = new BooleanProperty(visible);
    this.bodyPositionProperty = new WorldPositionProperty(worldBounds, bodyPosition);
    this.positiveProbePositionProperty = new WorldPositionProperty(worldBounds, positiveProbePosition);
    this.negativeProbePositionProperty = new WorldPositionProperty(worldBounds, negativeProbePosition);
    this.valueProperty = new Property<number>(Number.NaN);

    Multilink.multilink([this.positiveProbePositionProperty, this.negativeProbePositionProperty], () =>
      this.updateValue(),
    );

    // The reading also has to follow the circuit's own state, and which
    // properties those are changes with the circuit, so the link is rebuilt.
    circuitProperty.link((circuit: Circuit) => {
      this.circuitMultilink?.dispose();
      this.circuitMultilink = Multilink.multilinkAny(circuit.changeProperties, () => this.updateValue());
      this.updateValue();
    });
  }

  public getPositiveProbeTipShape(): Shape {
    return createProbeTipShape(this.positiveProbePositionProperty.value, this.modelViewTransform);
  }

  public getNegativeProbeTipShape(): Shape {
    return createProbeTipShape(this.negativeProbePositionProperty.value, this.modelViewTransform);
  }

  private updateValue(): void {
    const positiveTip = this.getPositiveProbeTipShape();
    const negativeTip = this.getNegativeProbeTipShape();

    // Probes held against each other short the meter out.
    this.valueProperty.value = shapeIntersects(positiveTip, negativeTip)
      ? 0
      : this.circuitProperty.value.getVoltageBetween(positiveTip, negativeTip);
  }

  public reset(): void {
    this.visibleProperty.reset();
    this.bodyPositionProperty.reset();
    this.positiveProbePositionProperty.reset();
    this.negativeProbePositionProperty.reset();
  }
}
