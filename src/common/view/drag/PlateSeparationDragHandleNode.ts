/**
 * PlateSeparationDragHandleNode.ts
 *
 * The handle above the top plate that sets how far apart the plates are.
 *
 * Dragging it moves the top plate, but the capacitor stays centred on its own
 * origin — so the plates separate symmetrically and the gap grows by twice the
 * pointer's travel. That factor of two is the one piece of arithmetic here worth
 * looking twice at.
 *
 * Ported from `drag/PlateSeparationDragHandleNode.java` and its handler.
 */

import { DerivedProperty, Multilink } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { DragListener, KeyboardDragListener, Node } from "scenerystack/scenery";
import { PLATE_SEPARATION_RANGE } from "../../../CapacitorLabConstants.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { Capacitor } from "../../model/Capacitor.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import { metersToMillimeters } from "../../model/UnitsUtils.js";
import { createDragHandleArrow, createDragHandleLine, DragHandleValueNode } from "./DragHandleNode.js";

const LINE_LENGTH = 60;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class PlateSeparationDragHandleNode extends Node {
  public constructor(capacitor: Capacitor, modelViewTransform: CLModelViewTransform3D) {
    super();

    const strings = StringManager.getInstance();

    // Both the line and the arrow point up, away from the capacitor.
    const line = createDragHandleLine(LINE_LENGTH);
    line.rotation = -Math.PI / 2;

    const arrow = createDragHandleArrow();
    arrow.rotation = -Math.PI / 2;
    arrow.bottom = line.top - 2;

    const valueNode = new DragHandleValueNode(
      strings.getCapacitorStrings().separationStringProperty,
      new DerivedProperty([capacitor.plateSeparationProperty], metersToMillimeters),
      strings.getUnitStrings().millimetersStringProperty,
    );
    valueNode.right = arrow.right;
    valueNode.bottom = arrow.top;

    this.addChild(line);
    this.addChild(arrow);
    this.addChild(valueNode);

    const setSeparation = (separation: number): void => {
      capacitor.plateSeparationProperty.value = clamp(
        separation,
        PLATE_SEPARATION_RANGE.min,
        PLATE_SEPARATION_RANGE.max,
      );
    };

    let startPoint = Vector2.ZERO;
    let startSeparation = 0;
    arrow.addInputListener(
      new DragListener({
        start: (event) => {
          startPoint = this.globalToParentPoint(event.pointer.point);
          startSeparation = capacitor.plateSeparationProperty.value;
        },
        drag: (event) => {
          const deltaView = this.globalToParentPoint(event.pointer.point).y - startPoint.y;
          // Dragging up is negative in view coordinates, and both plates move.
          setSeparation(startSeparation - 2 * modelViewTransform.viewToModelDeltaXY(0, deltaView).y);
        },
      }),
    );

    arrow.tagName = "div";
    arrow.focusable = true;
    arrow.accessibleName = strings.getCapacitorStrings().separationStringProperty;
    arrow.addInputListener(
      new KeyboardDragListener({
        // In model units, since this listener's deltas feed the model directly.
        dragDelta: (PLATE_SEPARATION_RANGE.max - PLATE_SEPARATION_RANGE.min) / 20,
        shiftDragDelta: (PLATE_SEPARATION_RANGE.max - PLATE_SEPARATION_RANGE.min) / 100,
        drag: (_event, listener) => {
          setSeparation(capacitor.plateSeparationProperty.value - 2 * listener.modelDelta.y);
        },
      }),
    );

    Multilink.multilink([capacitor.plateSeparationProperty, capacitor.plateSizeProperty], () => {
      // Sits off to one side of the plate's centre, clear of the wire.
      this.translation = modelViewTransform.modelToViewXYZ(
        capacitor.position.x - 0.3 * capacitor.getPlateWidth(),
        capacitor.position.y - capacitor.plateSeparationProperty.value / 2 - capacitor.getPlateHeight(),
        0,
      );
    });
  }
}
