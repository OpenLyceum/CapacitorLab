import { Property } from "scenerystack/axon";
import { Vector3 } from "scenerystack/dot";
import { Color, Path } from "scenerystack/scenery";
import { expect, it } from "vitest";
import CapacitorLabColors from "../../../src/CapacitorLabColors.js";
import { PLATE_SEPARATION_RANGE, PLATE_WIDTH_RANGE } from "../../../src/CapacitorLabConstants.js";
import { Capacitor } from "../../../src/common/model/Capacitor.js";
import { CLModelViewTransform3D } from "../../../src/common/model/CLModelViewTransform3D.js";
import type { DielectricChargeViewValue } from "../../../src/common/model/DielectricChargeView.js";
import { createCustom, createGlass, createPaper, createTeflon } from "../../../src/common/model/DielectricMaterial.js";
import { DielectricNode } from "../../../src/common/view/DielectricNode.js";

it("maps material identities to slab colors and follows palette changes", () => {
  const transform = new CLModelViewTransform3D();
  const capacitor = new Capacitor(
    new Vector3(0, 0, 0),
    PLATE_WIDTH_RANGE.defaultValue,
    PLATE_SEPARATION_RANGE.defaultValue,
    createGlass(),
    0,
    transform,
  );
  const chargeView = new Property<DielectricChargeViewValue>("none");
  const node = new DielectricNode(capacitor, transform, chargeView, 1, 1);
  const fills = () =>
    node.children.filter((child): child is Path => child instanceof Path).map((child) => child.getFillValue());
  for (const [material, color] of [
    [createGlass(), CapacitorLabColors.glassColorProperty],
    [createTeflon(), CapacitorLabColors.teflonColorProperty],
    [createPaper(), CapacitorLabColors.paperColorProperty],
    [createCustom(), CapacitorLabColors.customDielectricColorProperty],
  ] as const) {
    capacitor.dielectricMaterialProperty.value = material;
    expect(fills()).toContainEqual(Color.toColor(color.value));
  }
  const original = CapacitorLabColors.customDielectricColorProperty.value;
  try {
    const updated = new Color(10, 20, 30);
    CapacitorLabColors.customDielectricColorProperty.value = updated;
    expect(fills()).toContainEqual(updated);
  } finally {
    CapacitorLabColors.customDielectricColorProperty.value = original;
    node.dispose();
  }
});
