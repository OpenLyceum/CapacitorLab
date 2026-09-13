/**
 * DielectricPropertiesControlPanel.ts
 *
 * "Dielectric": which material fills the gap, its constant, and how its charges
 * are drawn.
 *
 * The constant slider is enabled only for the custom material — the real ones
 * have the constants they have, and letting the user edit "glass" would teach the
 * wrong thing.
 *
 * Ported from `control/DielectricPropertiesControlPanel.java`,
 * `DielectricMaterialControl.java`, `DielectricConstantControl.java` and
 * `DielectricChargesControl.java`.
 */

import { DerivedProperty, type Property } from "scenerystack/axon";
import { Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, ComboBox } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { DIELECTRIC_CONSTANT_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import { CAPACITOR_LAB_COMBO_BOX_OPTIONS, LIGHT_SURFACE_TEXT_FILL } from "../../CapacitorLabButtonOptions.js";
import { CapacitorLabPanel } from "../../CapacitorLabPanel.js";
import type { Capacitor } from "../../model/Capacitor.js";
import { DielectricChargeView, type DielectricChargeViewValue } from "../../model/DielectricChargeView.js";
import type { DielectricMaterial } from "../../model/DielectricMaterial.js";
import { CONTROL_LABEL_FONT, createControlTitle } from "./controlFonts.js";

export class DielectricPropertiesControlPanel extends CapacitorLabPanel {
  public constructor(
    capacitor: Capacitor,
    materials: readonly DielectricMaterial[],
    dielectricChargeViewProperty: Property<DielectricChargeViewValue>,
    listParent: Node,
  ) {
    const strings = StringManager.getInstance();
    const panelStrings = strings.getDielectricPanelStrings();
    const screenStrings = strings.getScreenNames();

    const materialComboBox = new ComboBox(
      capacitor.dielectricMaterialProperty,
      materials.map((material) => ({
        value: material,
        createNode: () => new Text(material.nameProperty, { font: CONTROL_LABEL_FONT, fill: LIGHT_SURFACE_TEXT_FILL }),
      })),
      listParent,
      CAPACITOR_LAB_COMBO_BOX_OPTIONS,
    );

    // The custom material owns the only mutable constant, so the slider always
    // drives it — and is disabled while a real material is selected.
    const customMaterial = materials.find((material) => material.isCustom);
    const constantControl =
      customMaterial === undefined
        ? new Node()
        : new NumberControl(
            panelStrings.constantStringProperty,
            customMaterial.dielectricConstantProperty,
            DIELECTRIC_CONSTANT_RANGE,
            {
              titleNodeOptions: { font: CONTROL_LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
              numberDisplayOptions: { textOptions: { font: CONTROL_LABEL_FONT }, decimalPlaces: 1 },
              sliderOptions: { thumbFill: CapacitorLabColors.dragHandleColorProperty },
              delta: 0.1,
              enabledProperty: new DerivedProperty(
                [capacitor.dielectricMaterialProperty],
                (material: DielectricMaterial) => material.isCustom,
              ),
            },
          );

    const chargeViewButtons = new AquaRadioButtonGroup<DielectricChargeViewValue>(
      dielectricChargeViewProperty,
      [
        {
          value: DielectricChargeView.NONE,
          createNode: () => createRadioLabel(panelStrings.hideAllChargesStringProperty),
        },
        {
          value: DielectricChargeView.TOTAL,
          createNode: () => createRadioLabel(panelStrings.showAllChargesStringProperty),
        },
        {
          value: DielectricChargeView.EXCESS,
          createNode: () => createRadioLabel(panelStrings.showExcessChargesStringProperty),
        },
      ],
      { spacing: 4, radioButtonOptions: { radius: 8 } },
    );

    super(
      new VBox({
        align: "left",
        spacing: 8,
        children: [
          createControlTitle(screenStrings.dielectricStringProperty),
          materialComboBox,
          constantControl,
          createControlTitle(panelStrings.chargesStringProperty),
          chargeViewButtons,
        ],
      }),
    );
  }
}

function createRadioLabel(textProperty: Parameters<typeof createControlTitle>[0]): Node {
  return new Text(textProperty, { font: CONTROL_LABEL_FONT, fill: CapacitorLabColors.textColorProperty });
}
