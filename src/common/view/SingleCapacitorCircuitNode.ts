/**
 * SingleCapacitorCircuitNode.ts
 *
 * The whole circuit on the Introduction and Dielectric screens: battery, wires,
 * capacitor, the three drag handles, and the controls that ride on the circuit
 * rather than in the side panel.
 *
 * Disconnecting the battery hides the wires and the current arrows and reveals
 * the plate-charge slider in their place — the circuit literally comes apart, so
 * it is clear that the charge is now the user's to set rather than the battery's.
 *
 * Ported from `view/DielectricCircuitNode.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import type { CLModelViewTransform3D } from "../model/CLModelViewTransform3D.js";
import type { SingleCircuit } from "../model/circuit/SingleCircuit.js";
import type { DielectricChargeViewValue } from "../model/DielectricChargeView.js";
import { BatteryNode } from "./BatteryNode.js";
import { CapacitorNode } from "./CapacitorNode.js";
import { CurrentIndicatorNode } from "./CurrentIndicatorNode.js";
import { BatteryConnectionButton } from "./controls/BatteryConnectionButton.js";
import { PlateChargeControlNode } from "./controls/PlateChargeControlNode.js";
import { DielectricOffsetDragHandleNode } from "./drag/DielectricOffsetDragHandleNode.js";
import { PlateAreaDragHandleNode } from "./drag/PlateAreaDragHandleNode.js";
import { PlateSeparationDragHandleNode } from "./drag/PlateSeparationDragHandleNode.js";
import { WireNode } from "./WireNode.js";

export type SingleCapacitorCircuitNodeOptions = {
  /** False on the Introduction screen, which has no dielectric to show or drag. */
  dielectricVisible: boolean;
};

export class SingleCapacitorCircuitNode extends Node {
  public readonly capacitorNode: CapacitorNode;

  private readonly currentIndicators: readonly CurrentIndicatorNode[];

  public constructor(
    circuit: SingleCircuit,
    modelViewTransform: CLModelViewTransform3D,
    plateChargeVisibleProperty: TReadOnlyProperty<boolean>,
    eFieldVisibleProperty: TReadOnlyProperty<boolean>,
    dielectricChargeViewProperty: TReadOnlyProperty<DielectricChargeViewValue>,
    options: SingleCapacitorCircuitNodeOptions,
  ) {
    super();

    const capacitor = circuit.capacitor;

    const batteryNode = new BatteryNode(circuit.battery);
    this.capacitorNode = new CapacitorNode(
      capacitor,
      modelViewTransform,
      plateChargeVisibleProperty,
      eFieldVisibleProperty,
      dielectricChargeViewProperty,
      { dielectricVisible: options.dielectricVisible },
    );

    const topWireNode = new WireNode(circuit.topWire);
    const bottomWireNode = new WireNode(circuit.bottomWire);

    // The two arrows point opposite ways, so together they read as charge going
    // round the loop rather than piling up at one end.
    const topCurrentIndicator = new CurrentIndicatorNode(circuit, 0);
    const bottomCurrentIndicator = new CurrentIndicatorNode(circuit, Math.PI);
    this.currentIndicators = [topCurrentIndicator, bottomCurrentIndicator];

    const batteryConnectionButton = new BatteryConnectionButton(circuit);
    const plateChargeControlNode = new PlateChargeControlNode(circuit);

    // Back to front: the bottom wire passes behind the battery and capacitor.
    this.addChild(bottomWireNode);
    this.addChild(batteryNode);
    this.addChild(this.capacitorNode);
    this.addChild(topWireNode);
    this.addChild(topCurrentIndicator);
    this.addChild(bottomCurrentIndicator);
    if (options.dielectricVisible) {
      this.addChild(new DielectricOffsetDragHandleNode(capacitor, modelViewTransform));
    }
    this.addChild(new PlateSeparationDragHandleNode(capacitor, modelViewTransform));
    this.addChild(new PlateAreaDragHandleNode(capacitor, modelViewTransform));
    this.addChild(batteryConnectionButton);
    this.addChild(plateChargeControlNode);

    batteryNode.translation = modelViewTransform.modelToViewPosition(circuit.battery.position);
    this.capacitorNode.translation = modelViewTransform.modelToViewPosition(capacitor.position);

    // Centre each indicator on its wire's run, offset by half the wire's thickness
    // so the arrow sits on the wire rather than beside it.
    const topThickness = modelViewTransform.modelToViewDeltaXYZ(circuit.topWire.thickness, 0, 0).x;
    topCurrentIndicator.centerX = topWireNode.bounds.centerX;
    topCurrentIndicator.centerY = topWireNode.bounds.minY + topThickness / 2;

    const bottomThickness = modelViewTransform.modelToViewDeltaXYZ(circuit.bottomWire.thickness, 0, 0).x;
    bottomCurrentIndicator.centerX = bottomWireNode.bounds.centerX;
    bottomCurrentIndicator.centerY = bottomWireNode.bounds.maxY - bottomThickness / 2;

    batteryConnectionButton.left = batteryNode.bounds.minX;
    batteryConnectionButton.bottom = topCurrentIndicator.bounds.minY - 10;

    plateChargeControlNode.translation = modelViewTransform.modelToViewPosition(
      new Vector3(capacitor.position.x - 0.004, 0.001, 0),
    );

    circuit.batteryConnectedProperty.link((connected: boolean) => {
      topWireNode.visible = connected;
      bottomWireNode.visible = connected;
      topCurrentIndicator.visible = connected;
      bottomCurrentIndicator.visible = connected;
    });
  }

  /** Fades the current arrows. Driven from the screen view's step. */
  public step(dt: number): void {
    for (const indicator of this.currentIndicators) {
      indicator.step(dt);
    }
  }

  public setDielectricTransparent(transparent: boolean): void {
    this.capacitorNode.setDielectricTransparent(transparent);
  }
}
