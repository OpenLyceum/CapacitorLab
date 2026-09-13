/**
 * MultipleCapacitorsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createMultipleCapacitorsIcon() in src/common/CapacitorLabScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import CapacitorLabColors from "../CapacitorLabColors.js";
import { createMultipleCapacitorsIcon } from "../common/CapacitorLabScreenIcons.js";
import { MultipleCapacitorsModel } from "./model/MultipleCapacitorsModel.js";
import { MultipleCapacitorsKeyboardHelpContent } from "./view/MultipleCapacitorsKeyboardHelpContent.js";
import { MultipleCapacitorsScreenView } from "./view/MultipleCapacitorsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MultipleCapacitorsScreenOptions = ScreenOptions & { tandem: Tandem };

export class MultipleCapacitorsScreen extends Screen<MultipleCapacitorsModel, MultipleCapacitorsScreenView> {
  public constructor(options: MultipleCapacitorsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MultipleCapacitorsModel(),
      // View factory — receives the model instance
      (model) =>
        new MultipleCapacitorsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<MultipleCapacitorsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: CapacitorLabColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new MultipleCapacitorsKeyboardHelpContent(),
          homeScreenIcon: createMultipleCapacitorsIcon(),
          navigationBarIcon: createMultipleCapacitorsIcon(),
        },
        options,
      ),
    );
  }
}
