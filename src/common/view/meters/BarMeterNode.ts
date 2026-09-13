/**
 * BarMeterNode.ts
 *
 * A draggable bar meter: a vertical track, a coloured bar whose height is the
 * value as a fraction of the current scale, a readout, and zoom buttons.
 *
 * The quantities this reads are around 1e-13, and they range over orders of
 * magnitude as the user changes the circuit. So the scale is a power of ten that
 * the user can step, and the meter picks a sensible one the first time it is
 * shown — otherwise the bar would spend most of its life pinned at one end.
 *
 * A bar that overruns the current scale shows an arrow above the track rather
 * than silently clipping.
 *
 * Ported from `view/meters/BarMeterNode.java`.
 */

import { DerivedProperty, NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { type Color, Node, Path, Rectangle, RichText, Text } from "scenerystack/scenery";
import { ArrowNode, CloseButton, PhetFont, PlusMinusZoomButtonGroup } from "scenerystack/scenery-phet";
import CapacitorLabColors from "../../../CapacitorLabColors.js";
import { StringManager } from "../../../i18n/StringManager.js";
import type { CLModelViewTransform3D } from "../../model/CLModelViewTransform3D.js";
import type { BarMeter } from "../../model/meter/BarMeter.js";
import { makeWorldDraggable } from "../drag/worldPositionDragListener.js";

const TRACK_SIZE = new Dimension2(50, 200);
const NUMBER_OF_TICKS = 10;
const TITLE_FONT = new PhetFont({ size: 16, weight: "bold" });
const VALUE_FONT = new PhetFont(16);
const RANGE_LABEL_FONT = new PhetFont(14);

const OVERLOAD_ARROW_WIDTH = 0.75 * TRACK_SIZE.width;
const OVERLOAD_ARROW_HEIGHT = 15;

export type BarMeterNodeOptions = {
  /** Fill of the bar. Identifies which quantity this meter reads. */
  barColorProperty: TReadOnlyProperty<Color>;

  /** Meter title, e.g. "Capacitance". */
  titleProperty: TReadOnlyProperty<string>;

  /** Unit abbreviation, e.g. "F". */
  unitsProperty: TReadOnlyProperty<string>;

  /** Power of ten the scale starts at. */
  initialExponent: number;
};

export class BarMeterNode extends Node {
  private readonly exponentProperty: NumberProperty;
  private hasBeenVisible: boolean;

  public constructor(meter: BarMeter, modelViewTransform: CLModelViewTransform3D, options: BarMeterNodeOptions) {
    super();

    this.exponentProperty = new NumberProperty(options.initialExponent);
    this.hasBeenVisible = meter.visibleProperty.value;

    const maxValueProperty = new DerivedProperty([this.exponentProperty], (exponent: number) => 10 ** exponent);

    const track = new Rectangle(0, 0, TRACK_SIZE.width, TRACK_SIZE.height, {
      fill: CapacitorLabColors.controlSurfaceColorProperty,
      stroke: CapacitorLabColors.boxStrokeColorProperty,
      lineWidth: 1,
    });

    const bar = new Rectangle(0, 0, TRACK_SIZE.width, 0, {
      fill: options.barColorProperty,
      stroke: CapacitorLabColors.boxStrokeColorProperty,
      lineWidth: 1,
    });

    // Evenly spaced marks so the bar can be read off without a numeric scale.
    const ticks = new Path(
      (() => {
        const shape = new Shape();
        for (let i = 1; i < NUMBER_OF_TICKS; i++) {
          const y = (TRACK_SIZE.height * i) / NUMBER_OF_TICKS;
          shape.moveTo(0, y).lineTo(TRACK_SIZE.width, y);
        }
        return shape;
      })(),
      { stroke: CapacitorLabColors.boxStrokeColorProperty, lineWidth: 1 },
    );

    // Points past the top of the track when the value exceeds the current scale.
    const overloadArrow = new ArrowNode(0, OVERLOAD_ARROW_HEIGHT, 0, 0, {
      headWidth: OVERLOAD_ARROW_WIDTH,
      headHeight: OVERLOAD_ARROW_HEIGHT,
      tailWidth: 1,
      fill: options.barColorProperty,
      stroke: null,
      visible: false,
    });

    const title = new Text(options.titleProperty, {
      font: TITLE_FONT,
      fill: CapacitorLabColors.textColorProperty,
      maxWidth: 2 * TRACK_SIZE.width,
    });

    const value = new RichText(
      new DerivedProperty(
        [meter.valueProperty, this.exponentProperty, options.unitsProperty],
        (v: number, exponent: number, units: string) => {
          const mantissa = v / 10 ** exponent;
          return `${mantissa.toFixed(2)} × 10<sup>${exponent}</sup> ${units}`;
        },
      ),
      { font: VALUE_FONT, fill: CapacitorLabColors.textColorProperty },
    );

    const maxLabel = new RichText(
      new DerivedProperty([this.exponentProperty], (exponent: number) => `10<sup>${exponent}</sup>`),
      { font: RANGE_LABEL_FONT, fill: CapacitorLabColors.textColorProperty },
    );
    const minLabel = new Text("0", { font: RANGE_LABEL_FONT, fill: CapacitorLabColors.textColorProperty });

    // Zooming in lowers the exponent, which shrinks full scale and makes the bar
    // taller — the opposite sign to what "zoom in" suggests numerically.
    const zoomButtons = new PlusMinusZoomButtonGroup(this.exponentProperty, {
      orientation: "vertical",
      applyZoomIn: (exponent: number) => exponent - 1,
      applyZoomOut: (exponent: number) => exponent + 1,
    });

    const closeButton = new CloseButton({
      iconLength: 10,
      listener: () => {
        meter.visibleProperty.value = false;
      },
    });

    this.addChild(track);
    this.addChild(bar);
    this.addChild(ticks);
    this.addChild(overloadArrow);
    this.addChild(maxLabel);
    this.addChild(minLabel);
    this.addChild(title);
    this.addChild(value);
    this.addChild(zoomButtons);
    this.addChild(closeButton);

    // Layout: labels down the left, title and readout under the track, buttons
    // to the right.
    maxLabel.right = track.left - 4;
    maxLabel.centerY = track.top;
    minLabel.right = track.left - 4;
    minLabel.centerY = track.bottom;
    overloadArrow.centerX = track.centerX;
    overloadArrow.bottom = track.top - 1;
    title.centerX = track.centerX;
    title.top = track.bottom + 6;
    value.centerX = track.centerX;
    value.top = title.bottom + 2;
    zoomButtons.left = track.right + 6;
    zoomButtons.top = track.top;
    closeButton.left = track.right + 6;
    closeButton.bottom = track.bottom;

    // The bar grows up from the bottom of the track.
    const updateBar = (): void => {
      const fraction = meter.valueProperty.value / maxValueProperty.value;
      const height = Math.min(Math.abs(fraction), 1) * TRACK_SIZE.height;
      bar.setRect(0, TRACK_SIZE.height - height, TRACK_SIZE.width, height);
      bar.translation = track.translation;
      overloadArrow.visible = Math.abs(fraction) > 1;
    };
    meter.valueProperty.link(updateBar);
    maxValueProperty.link(updateBar);

    makeWorldDraggable(this, meter.positionProperty, modelViewTransform, options.titleProperty);

    meter.visibleProperty.link((visible: boolean) => {
      this.visible = visible;
      // Pick a scale the first time the meter is brought out, so its very first
      // reading is legible rather than off the end of the track.
      if (visible && !this.hasBeenVisible) {
        this.hasBeenVisible = true;
        this.autoScale(meter.valueProperty.value);
      }
    });
    this.visible = meter.visibleProperty.value;
  }

  /** Chooses the smallest power of ten that keeps the bar above a tenth of full scale. */
  private autoScale(value: number): void {
    if (value === 0) {
      return;
    }
    let exponent = 0;
    while (Math.abs(value) / 10 ** exponent < 0.1) {
      exponent--;
    }
    this.exponentProperty.value = exponent;
  }

  public reset(): void {
    this.exponentProperty.reset();
    this.hasBeenVisible = false;
  }
}

/** Builds the three meters each screen shows, with their colours and units. */
export function createCapacitanceMeterNode(
  meter: BarMeter,
  modelViewTransform: CLModelViewTransform3D,
  titleProperty: TReadOnlyProperty<string>,
  exponent: number,
): BarMeterNode {
  return new BarMeterNode(meter, modelViewTransform, {
    barColorProperty: CapacitorLabColors.capacitanceColorProperty,
    titleProperty: titleProperty,
    unitsProperty: StringManager.getInstance().getUnitStrings().faradsStringProperty,
    initialExponent: exponent,
  });
}

export function createPlateChargeMeterNode(
  meter: BarMeter,
  modelViewTransform: CLModelViewTransform3D,
  titleProperty: TReadOnlyProperty<string>,
  exponent: number,
): BarMeterNode {
  return new BarMeterNode(meter, modelViewTransform, {
    barColorProperty: CapacitorLabColors.positiveChargeColorProperty,
    titleProperty: titleProperty,
    unitsProperty: StringManager.getInstance().getUnitStrings().coulombsStringProperty,
    initialExponent: exponent,
  });
}

export function createStoredEnergyMeterNode(
  meter: BarMeter,
  modelViewTransform: CLModelViewTransform3D,
  titleProperty: TReadOnlyProperty<string>,
  exponent: number,
): BarMeterNode {
  return new BarMeterNode(meter, modelViewTransform, {
    barColorProperty: CapacitorLabColors.storedEnergyColorProperty,
    titleProperty: titleProperty,
    unitsProperty: StringManager.getInstance().getUnitStrings().joulesStringProperty,
    initialExponent: exponent,
  });
}
