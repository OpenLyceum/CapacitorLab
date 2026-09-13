/**
 * worldPositionDragListener.ts
 *
 * Makes a node draggable by writing a {@link WorldPositionProperty}, which is
 * what every loose object in the sim uses: the three bar meters, the voltmeter's
 * body and both probes, and the E-field detector's body and probe.
 *
 * The property clamps itself to the play area, so nothing here has to know about
 * bounds — and a window resize pushes stray objects back on screen without any
 * help from the view.
 *
 * Ported from `drag/WorldLocationDragHandler.java`.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Vector2, Vector3 } from "scenerystack/dot";
import { DragListener, KeyboardDragListener, type Node } from "scenerystack/scenery";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import type { WorldPositionProperty } from "../../model/WorldPositionProperty.js";

/**
 * Attaches pointer and keyboard dragging to `node`, and keeps its translation in
 * step with `positionProperty`.
 */
export function makeWorldDraggable(
  node: Node,
  positionProperty: WorldPositionProperty,
  modelViewTransform: CLModelViewTransform3D,
  accessibleName: TReadOnlyProperty<string>,
): void {
  node.cursor = "pointer";

  let startPoint = Vector2.ZERO;
  let startPosition = new Vector3(0, 0, 0);

  node.addInputListener(
    new DragListener({
      start: (event) => {
        startPoint = node.globalToParentPoint(event.pointer.point);
        startPosition = positionProperty.value;
      },
      drag: (event) => {
        const delta = node.globalToParentPoint(event.pointer.point).minus(startPoint);
        const modelDelta = modelViewTransform.viewToModelDelta(delta);
        positionProperty.value = startPosition.plus(modelDelta);
      },
    }),
  );

  node.tagName = "div";
  node.focusable = true;
  node.accessibleName = accessibleName;
  node.addInputListener(
    new KeyboardDragListener({
      dragDelta: 10,
      drag: (_event, listener) => {
        const modelDelta = modelViewTransform.viewToModelDelta(listener.modelDelta);
        positionProperty.value = positionProperty.value.plus(modelDelta);
      },
    }),
  );

  positionProperty.link((position: Vector3) => {
    node.translation = modelViewTransform.modelToViewPosition(position);
  });
}
