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
      new Rectangle(x, y, 65, 145, {
        fill: CapacitorLabColors.panelBackgroundColorProperty,
        stroke: CapacitorLabColors.wireColorProperty,
        lineWidth: 8,
        cornerRadius: 12,
      }),
      new Rectangle(x + 21, y - 12, 23, 14, { fill: CapacitorLabColors.wireColorProperty }),
    ],
  });
}

function plates(x: number, y: number, width = 150): Node {
  return new Node({
    children: [
      new Rectangle(x, y, width, 22, {
        fill: CapacitorLabColors.plateColorProperty,
        stroke: CapacitorLabColors.boxStrokeColorProperty,
        lineWidth: 4,
      }),
      new Rectangle(x, y + 105, width, 22, {
        fill: CapacitorLabColors.plateColorProperty,
        stroke: CapacitorLabColors.boxStrokeColorProperty,
        lineWidth: 4,
      }),
    ],
  });
}

function wire(x1: number, y1: number, x2: number, y2: number): Line {
  return new Line(x1, y1, x2, y2, { stroke: CapacitorLabColors.wireColorProperty, lineWidth: 8 });
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
        new Rectangle(340, 113, 150, 80, {
          fill: CapacitorLabColors.customDielectricColorProperty,
          stroke: CapacitorLabColors.boxStrokeColorProperty,
          lineWidth: 4,
        }),
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
        plates(205, 68, 80),
        plates(315, 68, 80),
        plates(425, 68, 80),
      ],
    }),
  );
}
