/**
 * CapacitorLabPanel.ts
 *
 * A pre-themed Panel that automatically uses CapacitorLabColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { CapacitorLabPanel } from "../../common/CapacitorLabPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new CapacitorLabPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new CapacitorLabPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new CapacitorLabPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import CapacitorLabColors from "../CapacitorLabColors.js";
import { PANEL_CORNER_RADIUS } from "../CapacitorLabConstants.js";

export type CapacitorLabPanelOptions = PanelOptions;

export class CapacitorLabPanel extends Panel {
  public constructor(content: Node, providedOptions?: CapacitorLabPanelOptions) {
    const options = optionize<CapacitorLabPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: CapacitorLabColors.panelBackgroundColorProperty,
        stroke: CapacitorLabColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
