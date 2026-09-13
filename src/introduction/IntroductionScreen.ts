/**
 * IntroductionScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createIntroductionIcon() in src/common/CapacitorLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CapacitorLabColors from "../CapacitorLabColors.js";
import { createIntroductionIcon } from "../common/CapacitorLabScreenIcons.js";
import { IntroductionModel } from "./model/IntroductionModel.js";
import { IntroductionKeyboardHelpContent } from "./view/IntroductionKeyboardHelpContent.js";
import { IntroductionScreenView } from "./view/IntroductionScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type IntroductionScreenOptions = ScreenOptions & { tandem: Tandem };

export class IntroductionScreen extends Screen<IntroductionModel, IntroductionScreenView> {
  public constructor(options: IntroductionScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new IntroductionModel(),
      // View factory — receives the model instance
      (model) =>
        new IntroductionScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<IntroductionScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CapacitorLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new IntroductionKeyboardHelpContent(),
          homeScreenIcon: createIntroductionIcon(),
          navigationBarIcon: createIntroductionIcon(),
        },
        options,
      ),
    );
  }
}
