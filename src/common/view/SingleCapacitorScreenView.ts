/**
 * SingleCapacitorScreenView.ts
 *
 * The view shared by the Introduction and Dielectric screens.
 *
 * Like their models, the two screens differ only in arguments: Introduction hides
 * the dielectric and simplifies the E-field detector, Dielectric shows both and
 * adds the material controls.
 *
 * Ported from `module/dielectric/DielectricCanvas.java`, plus the control panels
 * from `IntroductionControlPanel.java` and `DielectricControlPanel.java`.
 */

import { Multilink } from "scenerystack/axon";
import { VBox } from "scenerystack/scenery";
import type { ScreenViewOptions } from "scenerystack/sim";
import {
  CAPACITANCE_METER_VALUE_EXPONENT,
  PLATE_CHARGE_METER_VALUE_EXPONENT,
  SCREEN_VIEW_MARGIN,
  STORED_ENERGY_METER_VALUE_EXPONENT,
} from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { DielectricChargeView } from "../model/DielectricChargeView.js";
import type { SingleCapacitorModel } from "../model/SingleCapacitorModel.js";
import { CapacitorLabScreenView, CONTROL_PANEL_WIDTH } from "./CapacitorLabScreenView.js";
import { DielectricPropertiesControlPanel } from "./controls/DielectricPropertiesControlPanel.js";
import { MetersControlPanel } from "./controls/MetersControlPanel.js";
import { ViewControlPanel } from "./controls/ViewControlPanel.js";
import {
  type BarMeterNode,
  createCapacitanceMeterNode,
  createPlateChargeMeterNode,
  createStoredEnergyMeterNode,
} from "./meters/BarMeterNode.js";
import { EFieldDetectorNode } from "./meters/EFieldDetectorNode.js";
import { VoltmeterNode } from "./meters/VoltmeterNode.js";
import { SingleCapacitorCircuitNode } from "./SingleCapacitorCircuitNode.js";

export type SingleCapacitorScreenViewOptions = ScreenViewOptions & {
  /** False on the Introduction screen: no slab, no offset handle, no material controls. */
  dielectricVisible: boolean;

  /** True on the Introduction screen: the E-field detector shows the sum alone. */
  eFieldDetectorSimplified: boolean;
};

export class SingleCapacitorScreenView extends CapacitorLabScreenView {
  private readonly circuitNode: SingleCapacitorCircuitNode;
  private readonly barMeterNodes: readonly BarMeterNode[];

  public constructor(model: SingleCapacitorModel, options: SingleCapacitorScreenViewOptions) {
    super(model, options);

    const strings = StringManager.getInstance();
    const meterStrings = strings.getMeterStrings();

    this.circuitNode = new SingleCapacitorCircuitNode(
      model.circuit,
      model.modelViewTransform,
      this.plateChargesVisibleProperty,
      this.eFieldVisibleProperty,
      this.dielectricChargeViewProperty,
      { dielectricVisible: options.dielectricVisible },
    );
    this.playAreaLayer.addChild(this.circuitNode);

    // ── Meters ──────────────────────────────────────────────────────────────
    const capacitanceMeterNode = createCapacitanceMeterNode(
      model.capacitanceMeter,
      model.modelViewTransform,
      meterStrings.capacitanceStringProperty,
      CAPACITANCE_METER_VALUE_EXPONENT,
    );
    const plateChargeMeterNode = createPlateChargeMeterNode(
      model.plateChargeMeter,
      model.modelViewTransform,
      meterStrings.plateChargeTopStringProperty,
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
      new EFieldDetectorNode(model.eFieldDetector, model.modelViewTransform, {
        simplified: options.eFieldDetectorSimplified,
      }),
    );
    this.meterLayer.addChild(new VoltmeterNode(model.voltmeter, model.modelViewTransform));

    // ── Control panels ──────────────────────────────────────────────────────
    const panels = new VBox({
      align: "right",
      spacing: 10,
      children: [
        new ViewControlPanel(this.plateChargesVisibleProperty, this.eFieldVisibleProperty),
        new MetersControlPanel({
          capacitanceLabelProperty: meterStrings.capacitanceStringProperty,
          plateChargeLabelProperty: meterStrings.plateChargeStringProperty,
          capacitanceVisibleProperty: model.capacitanceMeter.visibleProperty,
          plateChargeVisibleProperty: model.plateChargeMeter.visibleProperty,
          storedEnergyVisibleProperty: model.storedEnergyMeter.visibleProperty,
          voltmeterVisibleProperty: model.voltmeter.visibleProperty,
          eFieldDetectorVisibleProperty: model.eFieldDetector.visibleProperty,
        }),
      ],
    });
    if (options.dielectricVisible) {
      panels.addChild(
        new DielectricPropertiesControlPanel(
          model.circuit.capacitor,
          model.materials,
          this.dielectricChargeViewProperty,
          this.popupLayer,
        ),
      );
    }
    this.controlPanelLayer.addChild(panels);
    panels.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    panels.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;
    panels.maxWidth = CONTROL_PANEL_WIDTH;

    // The slab goes translucent whenever something behind it matters. Without
    // this, turning on field lines or dropping a probe into the gap would show
    // nothing on the Dielectric screen.
    Multilink.multilink(
      [
        this.eFieldVisibleProperty,
        model.voltmeter.visibleProperty,
        model.eFieldDetector.visibleProperty,
        this.dielectricChargeViewProperty,
      ],
      (eFieldVisible, voltmeterVisible, detectorVisible, chargeView) => {
        this.circuitNode.setDielectricTransparent(
          eFieldVisible || voltmeterVisible || detectorVisible || chargeView === DielectricChargeView.EXCESS,
        );
      },
    );
  }

  public override step(dt: number): void {
    this.circuitNode.step(dt);
  }

  public override reset(): void {
    super.reset();
    for (const node of this.barMeterNodes) {
      node.reset();
    }
  }
}
