/**
 * WireNode.ts
 *
 * A wire, drawn from the outline its model keeps.
 *
 * The model already owns the shape — it has to, since the voltmeter probes
 * against it — so this node only has to follow it. That shape has the occluding
 * plates and battery body already subtracted, which is what makes a wire appear
 * to pass behind them.
 *
 * Ported from `view/WireNode.java`.
 */

import type { Shape } from "scenerystack/kite";
import { Node, Path } from "scenerystack/scenery";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import type { Wire } from "../model/wire/Wire.js";

export class WireNode extends Node {
  public constructor(wire: Wire) {
    super();

    const path = new Path(wire.shapeProperty.value, {
      fill: CapacitorLabColors.wireColorProperty,
      stroke: CapacitorLabColors.boxStrokeColorProperty,
      lineWidth: 1,
    });
    this.addChild(path);

    wire.shapeProperty.link((shape: Shape) => {
      path.shape = shape;
    });
  }
}
