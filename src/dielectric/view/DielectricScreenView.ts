/**
 * DielectricScreenView.ts
 *
 * The Dielectric screen's view: the shared single-capacitor view with the slab
 * visible and draggable, the material controls in the panel, and the full
 * three-vector E-field detector.
 *
 * Ported from `module/dielectric/DielectricModule.java`.
 */

import type { ScreenViewOptions } from "scenerystack/sim";
import { SingleCapacitorScreenView } from "../../common/view/SingleCapacitorScreenView.js";
import type { DielectricModel } from "../model/DielectricModel.js";
import { DielectricScreenSummaryContent } from "./DielectricScreenSummaryContent.js";

export class DielectricScreenView extends SingleCapacitorScreenView {
  public constructor(model: DielectricModel, providedOptions?: ScreenViewOptions) {
    // These two are not options this screen offers — they are what makes it this
    // screen rather than the other one — so they are set, not defaulted.
    super(model, {
      ...providedOptions,
      dielectricVisible: true,
      eFieldDetectorSimplified: false,
      screenSummaryContent: new DielectricScreenSummaryContent(model),
    });
  }
}
