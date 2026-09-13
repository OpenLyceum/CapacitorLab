/**
 * EFieldDetectorNode.ts
 *
 * The E-field detector: a body that draws the field at the probe as up to three
 * arrows, and a probe on a lead.
 *
 * The three arrows are the whole point of the instrument. "Plate" is the field
 * the plates alone would make, "Dielectric" the opposing field from polarization,
 * and "Sum" what is actually there — so the picture shows the dielectric
 * *cancelling* part of the plates' field rather than merely stating that it
 * raises capacitance.
 *
 * On the Introduction screen only the sum is shown and its checkboxes are hidden:
 * with air in the gap the other two arrows would sit on top of it.
 *
 * Ported from `view/meters/EFieldDetectorNode.java` and `EFieldDetectorBodyNode.java`.
 */

import { DerivedProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Vector2, type Vector3 } from "scenerystack/dot";
import { type Color, Node, Text, VBox } from "scenerystack/scenery";
import { ArrowNode, PhetFont, ProbeNode, ShadedRectangle, WireNode } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { StringManager } from "../../../i18n/StringManager.js";
import { EFIELD_REFERENCE_MAGNITUDE } from "../../model/CLCalibration.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import type { EFieldDetector } from "../../model/meter/EFieldDetector.js";
import { makeWorldDraggable } from "../drag/worldPositionDragListener.js";

const BODY_SIZE = new Vector2(240, 230);
const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const LABEL_FONT = new PhetFont(13);
const PROBE_RADIUS = 16;

/** View pixels an arrow gets for a field of EFIELD_REFERENCE_MAGNITUDE. */
const REFERENCE_ARROW_LENGTH = 70;

const BODY_WIRE_NORMAL = new Property(new Vector2(0, 80));
const PROBE_WIRE_NORMAL = new Property(new Vector2(0, -80));

/** One labelled arrow: its length is the field, its direction the field's sign. */
class VectorDisplay extends Node {
  public constructor(
    labelProperty: TReadOnlyProperty<string>,
    valueProperty: TReadOnlyProperty<number>,
    colorProperty: TReadOnlyProperty<Color>,
    valuesVisibleProperty: TReadOnlyProperty<boolean>,
    unitsProperty: TReadOnlyProperty<string>,
  ) {
    super();

    const label = new Text(labelProperty, { font: LABEL_FONT, fill: CapacitorLabColors.textColorProperty });
    const arrow = new ArrowNode(0, 0, 0, REFERENCE_ARROW_LENGTH, {
      headWidth: 14,
      headHeight: 12,
      tailWidth: 5,
      fill: colorProperty,
      stroke: null,
    });
    const value = new Text(
      new DerivedProperty([valueProperty, unitsProperty], (v: number, units: string) => `${v.toFixed(0)} ${units}`),
      { font: LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
    );

    this.addChild(label);
    this.addChild(arrow);
    this.addChild(value);

    valueProperty.link((field: number) => {
      // Length is proportional to the field, clamped so a large field cannot run
      // off the body; direction follows the sign.
      const length = Math.min(Math.abs(field) / EFIELD_REFERENCE_MAGNITUDE, 2) * REFERENCE_ARROW_LENGTH;
      arrow.setTip(0, field >= 0 ? length : -length);
    });
    valuesVisibleProperty.link((visible: boolean) => {
      value.visible = visible;
    });

    label.centerX = 0;
    label.bottom = -REFERENCE_ARROW_LENGTH - 4;
    value.centerX = 0;
    value.top = label.bottom + 2;
  }
}

export type EFieldDetectorNodeOptions = {
  /**
   * True on the Introduction screen: show the sum alone and hide the vector
   * checkboxes, since air gives the other two nothing to say.
   */
  simplified: boolean;
};

export class EFieldDetectorNode extends Node {
  public constructor(
    detector: EFieldDetector,
    modelViewTransform: CLModelViewTransform3D,
    options: EFieldDetectorNodeOptions,
  ) {
    super();

    const strings = StringManager.getInstance();
    const detectorStrings = strings.getEFieldDetectorStrings();
    const unitsProperty = strings.getUnitStrings().voltsPerMeterStringProperty;
    const a11y = strings.getCommonA11yStrings();

    // ── Body ────────────────────────────────────────────────────────────────
    const body = new Node();
    body.addChild(new ShadedRectangle(new Bounds2(0, 0, BODY_SIZE.x, BODY_SIZE.y)));
    this.addChild(body);

    const title = new Text(detectorStrings.titleStringProperty, {
      font: TITLE_FONT,
      fill: CapacitorLabColors.controlSurfaceTextColorProperty,
      maxWidth: BODY_SIZE.x - 16,
    });
    body.addChild(title);
    title.centerX = BODY_SIZE.x / 2;
    title.top = 6;

    const plateVector = new VectorDisplay(
      detectorStrings.plateStringProperty,
      detector.plateVectorProperty,
      CapacitorLabColors.plateEFieldVectorColorProperty,
      detector.valuesVisibleProperty,
      unitsProperty,
    );
    const dielectricVector = new VectorDisplay(
      strings.getEFieldDetectorStrings().dielectricStringProperty,
      detector.dielectricVectorProperty,
      CapacitorLabColors.dielectricEFieldVectorColorProperty,
      detector.valuesVisibleProperty,
      unitsProperty,
    );
    const sumVector = new VectorDisplay(
      detectorStrings.sumStringProperty,
      detector.sumVectorProperty,
      CapacitorLabColors.sumEFieldVectorColorProperty,
      detector.valuesVisibleProperty,
      unitsProperty,
    );

    // Laid out side by side so the three can be compared at a glance — which is
    // what makes the cancellation visible.
    const vectors = [plateVector, dielectricVector, sumVector];
    vectors.forEach((vector, index) => {
      body.addChild(vector);
      vector.centerX = (BODY_SIZE.x * (index + 1)) / 4;
      vector.centerY = BODY_SIZE.y * 0.55;
    });

    detector.plateVectorVisibleProperty.link((visible: boolean) => {
      plateVector.visible = visible;
    });
    detector.dielectricVectorVisibleProperty.link((visible: boolean) => {
      dielectricVector.visible = visible;
    });
    detector.sumVectorVisibleProperty.link((visible: boolean) => {
      sumVector.visible = visible;
    });

    // ── Controls ────────────────────────────────────────────────────────────
    const createCheckbox = (textProperty: TReadOnlyProperty<string>, property: Property<boolean>): Checkbox =>
      new Checkbox(
        property,
        new Text(textProperty, { font: LABEL_FONT, fill: CapacitorLabColors.controlSurfaceTextColorProperty }),
        { boxWidth: 14 },
      );

    const controls = new VBox({ align: "left", spacing: 3 });
    if (!options.simplified) {
      controls.addChild(
        new Text(detectorStrings.showVectorsStringProperty, {
          font: LABEL_FONT,
          fill: CapacitorLabColors.controlSurfaceTextColorProperty,
        }),
      );
      controls.addChild(createCheckbox(detectorStrings.plateStringProperty, detector.plateVectorVisibleProperty));
      controls.addChild(
        createCheckbox(detectorStrings.dielectricStringProperty, detector.dielectricVectorVisibleProperty),
      );
      controls.addChild(createCheckbox(detectorStrings.sumStringProperty, detector.sumVectorVisibleProperty));
    }
    controls.addChild(createCheckbox(detectorStrings.showValuesStringProperty, detector.valuesVisibleProperty));
    body.addChild(controls);
    controls.left = 10;
    controls.bottom = BODY_SIZE.y - 8;

    // ── Probe and lead ──────────────────────────────────────────────────────
    const probe = new ProbeNode({
      radius: PROBE_RADIUS,
      innerRadius: PROBE_RADIUS * 0.6,
      handleWidth: PROBE_RADIUS,
      handleHeight: PROBE_RADIUS * 1.5,
      color: CapacitorLabColors.eFieldDetectorWireColorProperty,
      lightAngle: (5 * Math.PI) / 4,
    });
    this.addChild(probe);

    const bodyAnchor = new DerivedProperty([detector.bodyPositionProperty], (position: Vector3) =>
      modelViewTransform.modelToViewPosition(position).plusXY(BODY_SIZE.x / 2, BODY_SIZE.y),
    );
    const probeAnchor = new DerivedProperty([detector.probePositionProperty], (position: Vector3) =>
      modelViewTransform.modelToViewPosition(position),
    );
    this.insertChild(
      0,
      new WireNode(bodyAnchor, BODY_WIRE_NORMAL, probeAnchor, PROBE_WIRE_NORMAL, {
        stroke: CapacitorLabColors.eFieldDetectorWireColorProperty,
        lineWidth: 3,
      }),
    );

    makeWorldDraggable(body, detector.bodyPositionProperty, modelViewTransform, a11y.eFieldDetectorBodyStringProperty);
    makeWorldDraggable(probe, detector.probePositionProperty, modelViewTransform, a11y.eFieldProbeStringProperty);

    detector.visibleProperty.link((visible: boolean) => {
      this.visible = visible;
    });
  }
}
