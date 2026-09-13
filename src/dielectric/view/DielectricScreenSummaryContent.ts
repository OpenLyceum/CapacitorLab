/**
 * DielectricScreenSummaryContent.ts
 *
 * The accessible screen summary read by screen readers (SceneryStack's
 * Interactive Description). It appears at the top of the parallel DOM and gives
 * a non-visual user a way to orient themselves and to re-read the simulation's
 * current state at any time.
 *
 * Its current-details paragraph follows capacitance, charge and stored energy.
 */
import { ScreenSummaryContent } from "scenerystack/sim";
import { createCurrentDetailsProperty } from "../../common/view/currentDetails.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { DielectricModel } from "../model/DielectricModel.js";

export class DielectricScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: DielectricModel) {
    const a11y = StringManager.getInstance().getDielectricA11yStrings();

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: createCurrentDetailsProperty(model, a11y.currentDetailsStringProperty),
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
