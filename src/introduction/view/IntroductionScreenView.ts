/**
 * IntroductionScreenView.ts
 *
 * The Introduction screen's view: the shared single-capacitor view with the
 * dielectric hidden and the E-field detector simplified.
 *
 * Ported from `module/introduction/IntroductionModule.java`, which likewise built
 * the Dielectric screen's canvas with those two flags off.
 */

import type { ScreenViewOptions } from "scenerystack/sim";
import { SingleCapacitorScreenView } from "../../common/view/SingleCapacitorScreenView.js";
import type { IntroductionModel } from "../model/IntroductionModel.js";
import { IntroductionScreenSummaryContent } from "./IntroductionScreenSummaryContent.js";

export class IntroductionScreenView extends SingleCapacitorScreenView {
  public constructor(model: IntroductionModel, providedOptions?: ScreenViewOptions) {
    // These two are not options this screen offers — they are what makes it this
    // screen rather than the other one — so they are set, not defaulted.
    super(model, {
      ...providedOptions,
      dielectricVisible: false,
      eFieldDetectorSimplified: true,
      screenSummaryContent: new IntroductionScreenSummaryContent(model),
    });
  }
}
