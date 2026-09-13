/**
 * MultipleCapacitorsScreenView.ts
 *
 * The Multiple Capacitors screen: a picker for seven circuits, the selected one
 * drawn, and the same meters as the other screens with network-level labels.
 *
 * All seven circuit nodes are built once and toggled by visibility rather than
 * created and destroyed on each change. The Java sim made the same choice, and
 * its reasoning holds: there is no teardown to get wrong, and the only thing that
 * actually has to move is where the meters are reading from.
 *
 * Ported from `module/multiplecapacitors/MultipleCapacitorsCanvas.java` and
 * `MultipleCapacitorsControlPanel.java`.
 */

import { VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  CAPACITANCE_METER_VALUE_EXPONENT,
  PLATE_CHARGE_METER_VALUE_EXPONENT,
  SCREEN_VIEW_MARGIN,
  STORED_ENERGY_METER_VALUE_EXPONENT,
} from "../../CapacitorLabConstants.js";
import type { Circuit } from "../../common/model/circuit/Circuit.js";
import { CapacitorLabScreenView, CONTROL_PANEL_WIDTH } from "../../common/view/CapacitorLabScreenView.js";
import { CircuitChoiceControl } from "../../common/view/controls/CircuitChoiceControl.js";
import { MetersControlPanel } from "../../common/view/controls/MetersControlPanel.js";
import { ViewControlPanel } from "../../common/view/controls/ViewControlPanel.js";
import {
  type BarMeterNode,
  createCapacitanceMeterNode,
  createPlateChargeMeterNode,
  createStoredEnergyMeterNode,
} from "../../common/view/meters/BarMeterNode.js";
import { EFieldDetectorNode } from "../../common/view/meters/EFieldDetectorNode.js";
import { VoltmeterNode } from "../../common/view/meters/VoltmeterNode.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { MultipleCapacitorsModel } from "../model/MultipleCapacitorsModel.js";
import { MultipleCapacitorsCircuitNode } from "./MultipleCapacitorsCircuitNode.js";

export class MultipleCapacitorsScreenView extends CapacitorLabScreenView {
  private readonly circuitNodes: ReadonlyMap<Circuit, MultipleCapacitorsCircuitNode>;
  private readonly barMeterNodes: readonly BarMeterNode[];
  private readonly model: MultipleCapacitorsModel;

  public constructor(model: MultipleCapacitorsModel, options?: ScreenViewOptions) {
    super(model, options);

    this.model = model;
    const strings = StringManager.getInstance();
    const meterStrings = strings.getMeterStrings();

    // Every circuit is built up front; switching only changes which is visible.
    const circuitNodes = new Map<Circuit, MultipleCapacitorsCircuitNode>();
    for (const circuit of model.circuits) {
      const node = new MultipleCapacitorsCircuitNode(
        circuit,
        model.modelViewTransform,
        this.plateChargesVisibleProperty,
        this.eFieldVisibleProperty,
      );
      circuitNodes.set(circuit, node);
      this.playAreaLayer.addChild(node);
    }
    this.circuitNodes = circuitNodes;

    model.currentCircuitProperty.link((circuit: Circuit) => {
      for (const [candidate, node] of circuitNodes) {
        node.visible = candidate === circuit;
      }
    });

    // ── Meters ──────────────────────────────────────────────────────────────
    // Labelled for a network rather than a single capacitor.
    const capacitanceMeterNode = createCapacitanceMeterNode(
      model.capacitanceMeter,
      model.modelViewTransform,
      meterStrings.totalCapacitanceStringProperty,
      CAPACITANCE_METER_VALUE_EXPONENT,
    );
    const plateChargeMeterNode = createPlateChargeMeterNode(
      model.plateChargeMeter,
      model.modelViewTransform,
      meterStrings.storedChargeStringProperty,
      PLATE_CHARGE_METER_VALUE_EXPONENT,
    );
    const storedEnergyMeterNode = createStoredEnergyMeterNode(
      model.storedEnergyMeter,
      model.modelViewTransform,
      meterStrings.storedEnergyStringProperty,
      STORED_ENERGY_METER_VALUE_EXPONENT,
    );
    this.barMeterNodes = [capacitanceMeterNode, plateChargeMeterNode, storedEnergyMeterNode];
    for (const node of this.barMeterNodes) {
      this.meterLayer.addChild(node);
    }

    this.meterLayer.addChild(
      new EFieldDetectorNode(model.eFieldDetector, model.modelViewTransform, { simplified: false }),
    );
    this.meterLayer.addChild(new VoltmeterNode(model.voltmeter, model.modelViewTransform));

    // ── Control panels ──────────────────────────────────────────────────────
    const panels = new VBox({
      align: "right",
      spacing: 10,
      children: [
        new ViewControlPanel(this.plateChargesVisibleProperty, this.eFieldVisibleProperty),
        new MetersControlPanel({
          capacitanceLabelProperty: meterStrings.totalCapacitanceStringProperty,
          plateChargeLabelProperty: meterStrings.storedChargeStringProperty,
          capacitanceVisibleProperty: model.capacitanceMeter.visibleProperty,
          plateChargeVisibleProperty: model.plateChargeMeter.visibleProperty,
          storedEnergyVisibleProperty: model.storedEnergyMeter.visibleProperty,
          voltmeterVisibleProperty: model.voltmeter.visibleProperty,
          eFieldDetectorVisibleProperty: model.eFieldDetector.visibleProperty,
        }),
        new CircuitChoiceControl(model.circuits, model.currentCircuitProperty),
      ],
    });
    this.controlPanelLayer.addChild(panels);
    panels.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    panels.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;
    panels.maxWidth = CONTROL_PANEL_WIDTH;
  }

  public override step(dt: number): void {
    this.circuitNodes.get(this.model.currentCircuitProperty.value)?.step(dt);
  }

  public override reset(): void {
    super.reset();
    for (const node of this.barMeterNodes) {
      node.reset();
    }
  }
}
