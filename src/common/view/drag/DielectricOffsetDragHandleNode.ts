/**
 * DielectricOffsetDragHandleNode.ts
 *
 * The handle to the right of the capacitor that slides the dielectric out from
 * between the plates.
 *
 * This is the control the Dielectric screen is built around: withdrawing the slab
 * splits the plates into a dielectric-facing part and an air-facing part, and the
 * capacitance, charge and field all follow that split.
 *
 * Ported from `drag/DielectricOffsetDragHandleNode.java` and its handler.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { DragListener, KeyboardDragListener, Node } from "scenerystack/scenery";
import { DIELECTRIC_OFFSET_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { Capacitor } from "../../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import { metersToMillimeters } from "../../model/UnitsUtils.js";
import { createDragHandleArrow, createDragHandleLine, DragHandleValueNode } from "./DragHandleNode.js";

const LINE_LENGTH = 60;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class DielectricOffsetDragHandleNode extends Node {
  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D) {
    super();

    const strings = StringManager.getInstance();

    const line = createDragHandleLine(LINE_LENGTH);
    const arrow = createDragHandleArrow();
    arrow.left = line.right + 2;
    arrow.centerY = line.centerY;

    const valueNode = new DragHandleValueNode(
      strings.getDielectricPanelStrings().offsetStringProperty,
      new DerivedProperty([capacitor.dielectricOffsetProperty], metersToMillimeters),
      strings.getUnitStrings().millimetersStringProperty,
    );
    valueNode.left = arrow.left;
    valueNode.top = arrow.bottom;

    this.addChild(line);
    this.addChild(arrow);
    this.addChild(valueNode);

    const setOffset = (offset: number): void => {
      capacitor.dielectricOffsetProperty.value = clamp(
        offset,
        DIELECTRIC_OFFSET_RANGE.min,
        DIELECTRIC_OFFSET_RANGE.max,
      );
    };

    let startPoint = Vector2.ZERO;
    let startOffset = 0;
    arrow.addInputListener(
      new DragListener({
        start: (event) => {
          startPoint = this.globalToParentPoint(event.pointer.point);
          startOffset = capacitor.dielectricOffsetProperty.value;
        },
        drag: (event) => {
          const deltaView = this.globalToParentPoint(event.pointer.point).x - startPoint.x;
          setOffset(startOffset + modelViewTransform.viewToModelDeltaXY(deltaView, 0).x);
        },
      }),
    );

    arrow.tagName = "div";
    arrow.focusable = true;
    arrow.accessibleName = strings.getDielectricPanelStrings().offsetStringProperty;
    arrow.addInputListener(
      new KeyboardDragListener({
        // In model units, since this listener's deltas feed the model directly.
        dragDelta: (DIELECTRIC_OFFSET_RANGE.max - DIELECTRIC_OFFSET_RANGE.min) / 20,
        shiftDragDelta: (DIELECTRIC_OFFSET_RANGE.max - DIELECTRIC_OFFSET_RANGE.min) / 100,
        drag: (_event, listener) => {
          setOffset(capacitor.dielectricOffsetProperty.value + listener.modelDelta.x);
        },
      }),
    );

    Multilink.multilink([capacitor.dielectricOffsetProperty, capacitor.plateSizeProperty], () => {
      this.translation = modelViewTransform.modelToViewXYZ(
        capacitor.position.x + capacitor.getPlateWidth() / 2 + capacitor.dielectricOffsetProperty.value,
        capacitor.position.y,
        0,
      );
    });
  }
}
