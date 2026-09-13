/**
 * CapacitorLabScreenView.ts
 *
 * What every screen's view has: the two representation toggles, the charge-view
 * choice, a Reset All button, and the play-area bounds that draggable meters are
 * confined to.
 *
 * The model's world bounds are derived from the play area rather than the whole
 * screen, so a meter cannot be dragged under the control panel and lost.
 *
 * Ported from `module/CLCanvas.java`.
 */

import { BooleanProperty, Property } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import { Node } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import {
  EFIELD_VISIBLE,
  PLATE_CHARGES_VISIBLE,
  PLAY_AREA_DESIGN_SIZE,
  SCREEN_VIEW_MARGIN,
} from "../../CapacitorLabConstants.js";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../CapacitorLabButtonOptions.js";
import type { CapacitorLabModel } from "../model/CapacitorLabModel.js";
import { DielectricChargeView, type DielectricChargeViewValue } from "../model/DielectricChargeView.js";

/** Width reserved down the right-hand side for the control panels. */
export const CONTROL_PANEL_WIDTH = 260;

export abstract class CapacitorLabScreenView extends ScreenView {
  /** Whether + and − symbols are drawn on the plates. */
  public readonly plateChargesVisibleProperty = new BooleanProperty(PLATE_CHARGES_VISIBLE);

  /** Whether field lines are drawn in the gap. */
  public readonly eFieldVisibleProperty = new BooleanProperty(EFIELD_VISIBLE);

  /** Which of the dielectric's charges are drawn. */
  public readonly dielectricChargeViewProperty = new Property<DielectricChargeViewValue>(DielectricChargeView.TOTAL);

  /**
   * Everything positioned in model coordinates, scaled as one so the circuit and
   * the meters keep their relative sizes. Meters go above the circuit.
   */
  private readonly worldLayer = new Node();
  protected readonly playAreaLayer = new Node();
  protected readonly meterLayer = new Node();

  /** The right-hand column of control panels. */
  protected readonly controlPanelLayer = new Node();

  /** Popup lists (combo boxes) must sit above everything else. */
  protected readonly popupLayer = new Node();

  protected constructor(model: CapacitorLabModel, options?: ScreenViewOptions) {
    super(options);

    this.worldLayer.addChild(this.playAreaLayer);
    this.worldLayer.addChild(this.meterLayer);
    this.addChild(this.worldLayer);
    this.addChild(this.controlPanelLayer);

    // The circuit is laid out against a fixed design box — the Java sim's canvas —
    // which is then scaled to whatever room is left beside the control panels.
    const playAreaWidth = this.layoutBounds.width - CONTROL_PANEL_WIDTH;
    this.worldLayer.setScaleMagnitude(
      Math.min(playAreaWidth / PLAY_AREA_DESIGN_SIZE.width, this.layoutBounds.height / PLAY_AREA_DESIGN_SIZE.height),
    );
    this.addChild(this.popupLayer);

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        model.reset();
        this.reset();
      },
    });
    this.addChild(resetAllButton);
    resetAllButton.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - SCREEN_VIEW_MARGIN;

    // Keep keyboard and reading order independent from drawing order. Component
    // layers acquire their interactive descendants after this base constructor,
    // but these references remain live; Reset All is intentionally last.
    this.addChild(
      new Node({
        pdomOrder: [this.playAreaLayer, this.meterLayer, this.controlPanelLayer, resetAllButton],
      }),
    );

    // Draggable objects are confined to the design box, not to the scaled result,
    // because model positions are expressed against the design box.
    const corner = model.modelViewTransform.viewToModelDeltaXY(
      PLAY_AREA_DESIGN_SIZE.width,
      PLAY_AREA_DESIGN_SIZE.height,
    );
    model.worldBounds.value = new Bounds2(0, 0, corner.x, corner.y);
  }

  public reset(): void {
    this.plateChargesVisibleProperty.reset();
    this.eFieldVisibleProperty.reset();
    this.dielectricChargeViewProperty.reset();
  }
}
