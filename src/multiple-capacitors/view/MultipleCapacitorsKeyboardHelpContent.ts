/**
 * MultipleCapacitorsKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * Covers circuit and meter buttons, capacitance sliders, and draggable meter
 * bodies and probes.
 */

import {
  BasicActionsKeyboardHelpSection,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class MultipleCapacitorsKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const leftColumn = [new SliderControlsKeyboardHelpSection(), new MoveDraggableItemsKeyboardHelpSection()];
    const rightColumn = [new BasicActionsKeyboardHelpSection()];

    super(leftColumn, rightColumn);
  }
}
