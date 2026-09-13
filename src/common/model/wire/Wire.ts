/**
 * Wire.ts
 *
 * A run of connected {@link WireSegment}s drawn as one piece of wire.
 *
 * The wire keeps its projected shape in a Property so the view can redraw and the
 * voltmeter can probe without either recomputing the union: a wire is what the
 * probe most often lands on, and the shape only changes when a segment moves.
 *
 * Some wires pass behind the battery or a capacitor plate. Rather than rely on
 * z-ordering — which cannot work, since the wire is both in front of and behind
 * parts of the scene — those wires subtract the occluding shapes from their own,
 * via the `occluders` option.
 *
 * Ported from `model/wire/Wire.java`.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Shape } from "scenerystack/kite";
import type { CLModelViewTransform3D } from "../CLModelViewTransform3D.js";
import { shapeIntersects } from "../shapes/shapeIntersects.js";
import { createWireShape } from "../shapes/WireShapes.js";
import type { WireSegment } from "./WireSegment.js";

export type WireOptions = {
  /** Shapes to cut out of the wire, in view coordinates, re-read on every update. */
  occluders?: readonly (() => Shape)[];

  /** Extra properties that change the occluders, e.g. a capacitor's plate size. */
  occluderDependencies?: readonly TReadOnlyProperty<unknown>[];
};

export class Wire {
  public readonly segments: readonly WireSegment[];

  /** Wire thickness in model units, metres. */
  public readonly thickness: number;

  /** The wire's outline in *view* coordinates, recomputed when a segment or occluder moves. */
  public readonly shapeProperty: TReadOnlyProperty<Shape>;

  public constructor(
    modelViewTransform: CLModelViewTransform3D,
    thickness: number,
    segments: readonly WireSegment[],
    options?: WireOptions,
  ) {
    this.segments = segments;
    this.thickness = thickness;

    const occluders = options?.occluders ?? [];
    const dependencies: TReadOnlyProperty<unknown>[] = [
      ...segments.flatMap((segment) => [segment.startPointProperty, segment.endPointProperty]),
      ...(options?.occluderDependencies ?? []),
    ];

    this.shapeProperty = DerivedProperty.deriveAny(dependencies, () => {
      let shape = createWireShape(segments, thickness, modelViewTransform);
      for (const occluder of occluders) {
        shape = shape.shapeDifference(occluder());
      }
      return shape;
    });
  }

  /** Does a shape touch this wire? Used by the voltmeter's probes. */
  public intersects(shape: Shape): boolean {
    return shapeIntersects(this.shapeProperty.value, shape);
  }
}

/**
 * Offset applied where segments meet at a corner. Zero, because the segments are
 * stroked with round caps and already overlap there.
 */
export const WIRE_CORNER_OFFSET = 0;

/** Offset that pulls a wire end back inside the component it attaches to. */
export function wireEndOffset(thickness: number): number {
  return thickness / 2;
}
