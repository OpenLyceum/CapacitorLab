/**
 * VoltmeterNode.ts
 *
 * The voltmeter: a body with a readout and two probes on curly leads.
 *
 * Body and probes drag independently, which is the point — the reading comes from
 * where the two probe tips are, so measuring means placing them deliberately
 * rather than dropping one instrument somewhere. A probe touching nothing in the
 * circuit reads "?" rather than zero, so that "no connection" and "no voltage"
 * stay distinguishable.
 *
 * Ported from `view/meters/VoltmeterNode.java`, `VoltmeterBodyNode.java`,
 * `VoltmeterProbeNode.java` and `ProbeWireNode.java`.
 */

import { DerivedProperty, Property, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Vector2, type Vector3 } from "scenerystack/dot";
import { Node, type TColor, Text } from "scenerystack/scenery";
import { PhetFont, ProbeNode, ShadedRectangle, WireNode } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import type { Voltmeter } from "../../model/meter/Voltmeter.js";
import type { WorldPositionProperty } from "../../model/WorldPositionProperty.js";
import { makeWorldDraggable } from "../drag/worldPositionDragListener.js";

const BODY_SIZE = new Vector2(150, 80);
const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const VALUE_FONT = new PhetFont(18);
const PROBE_RADIUS = 18;

// Where a lead leaves the body and where it arrives at a probe. These set the
// cubic's control points, which is what gives the leads their slack.
const BODY_WIRE_NORMAL = new Property(new Vector2(0, 60));
const PROBE_WIRE_NORMAL = new Property(new Vector2(0, -80));

function createProbe(color: TColor): ProbeNode {
  return new ProbeNode({
    radius: PROBE_RADIUS,
    innerRadius: PROBE_RADIUS * 0.6,
    handleWidth: PROBE_RADIUS,
    handleHeight: PROBE_RADIUS * 1.5,
    color: color,
    lightAngle: (5 * Math.PI) / 4,
  });
}

/** Tracks a draggable position in view coordinates, for the leads to follow. */
function viewPositionProperty(
  positionProperty: WorldPositionProperty,
  modelViewTransform: CLModelViewTransform3D,
  offset: Vector2,
): TReadOnlyProperty<Vector2> {
  return new DerivedProperty([positionProperty], (position: Vector3) =>
    modelViewTransform.modelToViewPosition(position).plus(offset),
  );
}

export class VoltmeterNode extends Node {
  public constructor(voltmeter: Voltmeter, modelViewTransform: CLModelViewTransform3D) {
    super();

    const strings = StringManager.getInstance();
    const unitStrings = strings.getUnitStrings();
    const a11y = strings.getCommonA11yStrings();

    // ── Body ────────────────────────────────────────────────────────────────
    const body = new Node();
    body.addChild(new ShadedRectangle(new Bounds2(0, 0, BODY_SIZE.x, BODY_SIZE.y)));
    this.addChild(body);

    const title = new Text(strings.getMeterStrings().voltmeterStringProperty, {
      font: TITLE_FONT,
      fill: CapacitorLabColors.controlSurfaceTextColorProperty,
    });
    const readout = new Text(
      new DerivedProperty(
        [voltmeter.valueProperty, unitStrings.voltsStringProperty, unitStrings.unknownStringProperty],
        (value: number, volts: string, unknown: string) =>
          Number.isNaN(value) ? unknown : `${value.toFixed(3)} ${volts}`,
      ),
      { font: VALUE_FONT, fill: CapacitorLabColors.controlSurfaceTextColorProperty },
    );
    body.addChild(title);
    body.addChild(readout);
    title.centerX = BODY_SIZE.x / 2;
    title.top = 6;
    readout.centerX = BODY_SIZE.x / 2;
    readout.top = title.bottom + 6;

    // ── Probes ──────────────────────────────────────────────────────────────
    const positiveProbe = createProbe(CapacitorLabColors.positiveChargeColorProperty);
    const negativeProbe = createProbe(CapacitorLabColors.voltmeterNegativeWireColorProperty);
    this.addChild(positiveProbe);
    this.addChild(negativeProbe);

    // ── Leads ───────────────────────────────────────────────────────────────
    // Drawn behind everything so they emerge from under the body and probes.
    const bodyAnchor = (dx: number): TReadOnlyProperty<Vector2> =>
      viewPositionProperty(voltmeter.bodyPositionProperty, modelViewTransform, new Vector2(dx, BODY_SIZE.y));
    const wireOptions = { lineWidth: 3 };
    this.insertChild(
      0,
      new WireNode(
        bodyAnchor(BODY_SIZE.x * 0.3),
        BODY_WIRE_NORMAL,
        viewPositionProperty(voltmeter.positiveProbePositionProperty, modelViewTransform, Vector2.ZERO),
        PROBE_WIRE_NORMAL,
        { ...wireOptions, stroke: CapacitorLabColors.voltmeterPositiveWireColorProperty },
      ),
    );
    this.insertChild(
      0,
      new WireNode(
        bodyAnchor(BODY_SIZE.x * 0.7),
        BODY_WIRE_NORMAL,
        viewPositionProperty(voltmeter.negativeProbePositionProperty, modelViewTransform, Vector2.ZERO),
        PROBE_WIRE_NORMAL,
        { ...wireOptions, stroke: CapacitorLabColors.voltmeterNegativeWireColorProperty },
      ),
    );

    makeWorldDraggable(body, voltmeter.bodyPositionProperty, modelViewTransform, a11y.voltmeterBodyStringProperty);
    makeWorldDraggable(
      positiveProbe,
      voltmeter.positiveProbePositionProperty,
      modelViewTransform,
      a11y.positiveProbeStringProperty,
    );
    makeWorldDraggable(
      negativeProbe,
      voltmeter.negativeProbePositionProperty,
      modelViewTransform,
      a11y.negativeProbeStringProperty,
    );

    voltmeter.visibleProperty.link((visible: boolean) => {
      this.visible = visible;
    });
  }
}
