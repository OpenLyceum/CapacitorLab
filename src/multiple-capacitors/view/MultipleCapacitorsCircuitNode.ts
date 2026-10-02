/**
 * MultipleCapacitorsCircuitNode.ts
 *
 * One of the seven circuits: a battery, its wires, and its capacitors, each
 * labelled C₁…Cₙ with its own capacitance slider.
 *
 * The dielectric is hidden here — every capacitor on this screen has air between
 * its plates, and the screen is about combination rather than materials.
 *
 * Ported from `view/MultipleCapacitorsCircuitNode.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { PatternStringProperty, Property } from "scenerystack/axon";
import { Node, RichText } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { CLModelViewTransform3D } from "../../common/model/CLModelViewTransform3D.js";
import type { Circuit } from "../../common/model/circuit/Circuit.js";
import { DielectricChargeView } from "../../common/model/DielectricChargeView.js";
import { BatteryNode } from "../../common/view/BatteryNode.js";
import { CapacitorNode } from "../../common/view/CapacitorNode.js";
import { CurrentIndicatorNode } from "../../common/view/CurrentIndicatorNode.js";
import { CapacitanceControlNode } from "../../common/view/controls/CapacitanceControlNode.js";
import { WireNode } from "../../common/view/WireNode.js";
import { StringManager } from "../../i18n/StringManager.js";

const LABEL_FONT = new PhetFont(24);

/** Gap between a capacitor and its label or capacitance control. */
const LABEL_SPACING = 6;

/** This screen never draws dielectric charges, so the view is fixed. */
const NO_DIELECTRIC_CHARGES = new Property(DielectricChargeView.NONE);

export class MultipleCapacitorsCircuitNode extends Node {
  private readonly currentIndicators: readonly CurrentIndicatorNode[];

  public constructor(
    circuit: Circuit,
    modelViewTransform: CLModelViewTransform3D,
    plateChargesVisibleProperty: TReadOnlyProperty<boolean>,
    eFieldVisibleProperty: TReadOnlyProperty<boolean>,
  ) {
    super();

    const capacitorPattern = StringManager.getInstance().getPatternStrings().capacitorSubscriptStringProperty;

    // Wires first, so the components sit on top of them.
    for (const wire of circuit.wires) {
      this.addChild(new WireNode(wire));
    }

    const batteryNode = new BatteryNode(circuit.battery);
    batteryNode.translation = modelViewTransform.modelToViewPosition(circuit.battery.position);
    this.addChild(batteryNode);

    circuit.capacitors.forEach((capacitor, index) => {
      const capacitorNode = new CapacitorNode(
        capacitor,
        modelViewTransform,
        plateChargesVisibleProperty,
        eFieldVisibleProperty,
        NO_DIELECTRIC_CHARGES,
        { dielectricVisible: false },
      );
      capacitorNode.translation = modelViewTransform.modelToViewPosition(capacitor.position);
      this.addChild(capacitorNode);

      // Numbered from 1, as the circuit diagrams in the design document are.
      const number = index + 1;
      const label = new RichText(new PatternStringProperty(capacitorPattern, { number: number }), {
        font: LABEL_FONT,
        fill: CapacitorLabColors.textColorProperty,
      });
      this.addChild(label);
      label.right = capacitorNode.bounds.minX - LABEL_SPACING;
      label.centerY = capacitorNode.bounds.centerY;

      // To the right of the plates: the left side holds the label and, for C₁,
      // the battery, so a control there would cover them.
      const capacitanceControl = new CapacitanceControlNode(capacitor, number);
      this.addChild(capacitanceControl);
      capacitanceControl.left = capacitorNode.bounds.maxX + LABEL_SPACING;
      capacitanceControl.centerY = capacitorNode.bounds.centerY;
    });

    // One pair of arrows for the whole circuit, on the battery's two leads.
    const topIndicator = new CurrentIndicatorNode(circuit, 0);
    const bottomIndicator = new CurrentIndicatorNode(circuit, Math.PI);
    this.currentIndicators = [topIndicator, bottomIndicator];
    this.addChild(topIndicator);
    this.addChild(bottomIndicator);

    const topWireBounds = this.localToParentBounds(this.bounds);
    topIndicator.centerX = batteryNode.centerX;
    topIndicator.centerY = topWireBounds.minY;
    bottomIndicator.centerX = batteryNode.centerX;
    bottomIndicator.centerY = topWireBounds.maxY;
  }

  /** Fades the current arrows. Driven from the screen view's step. */
  public step(dt: number): void {
    for (const indicator of this.currentIndicators) {
      indicator.step(dt);
    }
  }
}
