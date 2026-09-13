/**
 * IntroductionKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * Covers the simulation's buttons, sliders, capacitor handles and draggable
 * meter bodies and probes.
 */

import {
  BasicActionsKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class IntroductionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const leftColumn = [new SliderControlsKeyboardHelpSection(), new MoveDraggableItemsKeyboardHelpSection()];
    const rightColumn = [new BasicActionsKeyboardHelpSection()];

    super(leftColumn, rightColumn);
  }
}
