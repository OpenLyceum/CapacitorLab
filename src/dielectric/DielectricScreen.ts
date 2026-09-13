/**
 * DielectricScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createDielectricIcon() in src/common/CapacitorLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CapacitorLabColors from "../CapacitorLabColors.js";
import { createDielectricIcon } from "../common/CapacitorLabScreenIcons.js";
import { DielectricModel } from "./model/DielectricModel.js";
import { DielectricKeyboardHelpContent } from "./view/DielectricKeyboardHelpContent.js";
import { DielectricScreenView } from "./view/DielectricScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type DielectricScreenOptions = ScreenOptions & { tandem: Tandem };

export class DielectricScreen extends Screen<DielectricModel, DielectricScreenView> {
  public constructor(options: DielectricScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new DielectricModel(),
      // View factory — receives the model instance
      (model) =>
        new DielectricScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<DielectricScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CapacitorLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new DielectricKeyboardHelpContent(),
          homeScreenIcon: createDielectricIcon(),
          navigationBarIcon: createDielectricIcon(),
        },
        options,
      ),
    );
  }
}
