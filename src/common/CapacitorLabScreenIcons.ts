/**
 * CapacitorLabScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for each screen.
 * Drawn on the standard PhET 548 × 373 canvas using CapacitorLabColors.
 * Each motif is deliberately simple enough to remain legible in the navigation bar.
 */
import { Line, Node, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import CapacitorLabColors from "../CapacitorLabColors.js";
import { CAPACITOR_LAB_SCREEN_ICONS_SETTINGS } from "../CapacitorLabConstants.js";

const W = 548;
const H = 373;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: CapacitorLabColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: CapacitorLabColors.backgroundColorProperty,
  });
}

function battery(x: number, y: number): Node {
  return new Node({
    children: [
      new Rectangle(
        x,
        y,
        CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_WIDTH,
        CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_HEIGHT,
        {
          fill: CapacitorLabColors.panelBackgroundColorProperty,
          stroke: CapacitorLabColors.wireColorProperty,
          lineWidth: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_LINE_WIDTH,
          cornerRadius: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_CORNER_RADIUS,
        },
      ),
      new Rectangle(
        x + 21,
        y - 12,
        CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_WIDTH_SEGMENT_2,
        CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.BATTERY_HEIGHT_SEGMENT_2,
        { fill: CapacitorLabColors.wireColorProperty },
      ),
    ],
  });
}

function plates(x: number, y: number, width: number = CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.DEFAULT_WIDTH): Node {
  return new Node({
    children: [
      new Rectangle(x, y, width, CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.PLATES_HEIGHT, {
        fill: CapacitorLabColors.plateColorProperty,
        stroke: CapacitorLabColors.boxStrokeColorProperty,
        lineWidth: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.PLATES_LINE_WIDTH,
      }),
      new Rectangle(x, y + 105, width, CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.PLATES_HEIGHT, {
        fill: CapacitorLabColors.plateColorProperty,
        stroke: CapacitorLabColors.boxStrokeColorProperty,
        lineWidth: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.PLATES_LINE_WIDTH,
      }),
    ],
  });
}

function wire(x1: number, y1: number, x2: number, y2: number): Line {
  return new Line(x1, y1, x2, y2, {
    stroke: CapacitorLabColors.wireColorProperty,
    lineWidth: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.WIRE_LINE_WIDTH,
  });
}

export function createIntroductionIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [background(), wire(150, 100, 310, 100), wire(150, 270, 310, 270), battery(85, 112), plates(310, 88)],
    }),
  );
}

export function createDielectricIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [
        background(),
        wire(150, 100, 310, 100),
        wire(150, 270, 310, 270),
        battery(85, 112),
        plates(310, 88),
        new Rectangle(
          CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_DIELECTRIC_ICON_X,
          CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_DIELECTRIC_ICON_Y,
          CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_DIELECTRIC_ICON_WIDTH,
          CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_DIELECTRIC_ICON_HEIGHT,
          {
            fill: CapacitorLabColors.customDielectricColorProperty,
            stroke: CapacitorLabColors.boxStrokeColorProperty,
            lineWidth: CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_DIELECTRIC_ICON_LINE_WIDTH,
          },
        ),
      ],
    }),
  );
}

export function createMultipleCapacitorsIcon(): ScreenIcon {
  return iconFrom(
    new Node({
      children: [
        background(),
        wire(150, 80, 470, 80),
        wire(150, 290, 470, 290),
        battery(75, 112),
        plates(205, 68, CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_MULTIPLE_CAPACITORS_ICON_WIDTH),
        plates(315, 68, CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_MULTIPLE_CAPACITORS_ICON_WIDTH),
        plates(425, 68, CAPACITOR_LAB_SCREEN_ICONS_SETTINGS.CREATE_MULTIPLE_CAPACITORS_ICON_WIDTH),
      ],
    }),
  );
}
