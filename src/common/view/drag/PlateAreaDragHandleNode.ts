/**
 * PlateAreaDragHandleNode.ts
 *
 * The handle at the top plate's front-left corner that sets the plate size.
 *
 * It lies along the diagonal of the plate's top face, so dragging it looks like
 * pulling the corner of the plate outwards. Plates are square, so one drag sets
 * both the width and the depth, and the readout is an area rather than a length.
 *
 * The corner's own screen position depends on the plate width, so the drag cannot
 * simply add a delta — it inverts the projection instead. `cornerViewPerWidth`
 * below is that inversion, and it is a constant because the projection is linear.
 *
 * Ported from `drag/PlateAreaDragHandleNode.java` and its handler.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { DragListener, KeyboardDragListener, Node } from "scenerystack/scenery";
import { PLATE_WIDTH_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { Capacitor } from "../../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import { metersSquaredToMillimetersSquared } from "../../model/UnitsUtils.js";
import { createDragHandleArrow, createDragHandleLine, DragHandleValueNode } from "./DragHandleNode.js";

const LINE_LENGTH = 22;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class PlateAreaDragHandleNode extends Node {
  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D) {
    super();

    const strings = StringManager.getInstance();

    // Aligned with the diagonal of the plate's top face. Half the yaw, because
    // the diagonal bisects the angle between the face's two projected edges.
    const angle = Math.PI / 2 + modelViewTransform.yaw / 2;

    const line = createDragHandleLine(LINE_LENGTH);
    line.rotation = angle;

    const arrow = createDragHandleArrow();
    arrow.rotation = angle;
    arrow.right = line.left - 2;
    arrow.top = line.bottom + 2;

    const valueNode = new DragHandleValueNode(
      strings.getCapacitorStrings().plateAreaStringProperty,
      new DerivedProperty([capacitor.plateAreaProperty], metersSquaredToMillimetersSquared),
      strings.getUnitStrings().millimetersSquaredStringProperty,
    );
    valueNode.right = line.right;
    valueNode.bottom = line.top;

    this.addChild(line);
    this.addChild(arrow);
    this.addChild(valueNode);

    const setPlateWidth = (width: number): void => {
      capacitor.setPlateWidth(clamp(width, PLATE_WIDTH_RANGE.min, PLATE_WIDTH_RANGE.max));
    };

    // How far the front-left corner moves horizontally per unit of plate width.
    // Constant, because the projection has no vanishing point.
    const cornerViewPerWidth = modelViewTransform.modelToViewDeltaXYZ(-0.5, 0, -0.5).x;

    let startPoint = Vector2.ZERO;
    let startWidth = 0;
    arrow.addInputListener(
      new DragListener({
        start: (event) => {
          startPoint = this.globalToParentPoint(event.pointer.point);
          startWidth = capacitor.getPlateWidth();
        },
        drag: (event) => {
          const deltaView = this.globalToParentPoint(event.pointer.point).x - startPoint.x;
          setPlateWidth(startWidth + deltaView / cornerViewPerWidth);
        },
      }),
    );

    arrow.tagName = "div";
    arrow.focusable = true;
    arrow.accessibleName = strings.getCapacitorStrings().plateAreaStringProperty;
    arrow.addInputListener(
      new KeyboardDragListener({
        // In model units, since this listener's deltas feed the model directly.
        dragDelta: (PLATE_WIDTH_RANGE.max - PLATE_WIDTH_RANGE.min) / 20,
        shiftDragDelta: (PLATE_WIDTH_RANGE.max - PLATE_WIDTH_RANGE.min) / 100,
        drag: (_event, listener) => {
          // Pulling the corner down-left grows the plate, so both axes push the
          // same way.
          setPlateWidth(capacitor.getPlateWidth() - listener.modelDelta.x + listener.modelDelta.y);
        },
      }),
    );

    Multilink.multilink([capacitor.plateSizeProperty, capacitor.plateSeparationProperty], () => {
      this.translation = modelViewTransform.modelToViewXYZ(
        capacitor.position.x - capacitor.getPlateWidth() / 2,
        capacitor.position.y - capacitor.plateSeparationProperty.value / 2 - capacitor.getPlateHeight(),
        capacitor.position.z - capacitor.getPlateDepth() / 2,
      );
    });
  }
}
