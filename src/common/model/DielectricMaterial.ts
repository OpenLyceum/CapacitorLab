/**
 * DielectricMaterial.ts
 *
 * The insulating material between a capacitor's plates. Real materials (teflon,
 * glass, paper, air) are immutable; the "custom" material has a dielectric
 * constant the user sets with a slider.
 *
 * Ported from `model/DielectricMaterial.java`. The Java version used a class per
 * material; here one class covers all of them, with `isCustom` marking the single
 * mutable case, because nothing else differed between the subclasses.
 */

import { NumberProperty, StringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import type { Color, ProfileColorProperty } from "scenerystack/scenery";
import CapacitorLabColors from "../../CapacitorLabColors.js";
import {
  DIELECTRIC_CONSTANT_RANGE,
  EPSILON_AIR,
  EPSILON_GLASS,
  EPSILON_PAPER,
  EPSILON_TEFLON,
} from "../../CapacitorLabConstants.js";
import { StringManager } from "../../i18n/StringManager.js";

export class DielectricMaterial {
  /** Localized name shown in the material combo box. */
  public readonly nameProperty: TReadOnlyProperty<string>;

  /** Dimensionless relative permittivity ε_r. Mutable only when {@link isCustom}. */
  public readonly dielectricConstantProperty: NumberProperty;

  /** Fill for the slab. Themed, so it follows the projector-mode profile. */
  public readonly colorProperty: ProfileColorProperty;

  /** True for the one material whose constant the user can change. */
  public readonly isCustom: boolean;

  public constructor(
    nameProperty: TReadOnlyProperty<string>,
    dielectricConstant: number,
    colorProperty: ProfileColorProperty,
    isCustom = false,
  ) {
    this.nameProperty = nameProperty;
    this.dielectricConstantProperty = new NumberProperty(dielectricConstant);
    this.colorProperty = colorProperty;
    this.isCustom = isCustom;
  }

  /**
   * True when the slab hides whatever is behind it. Only glass is translucent, so
   * only glass lets the plate charges show through without the view having to
   * force transparency.
   */
  public isOpaque(): boolean {
    return (this.colorProperty.value as Color).alpha === 1;
  }

  public reset(): void {
    this.dielectricConstantProperty.reset();
  }
}

/** Teflon, ε = 2.1. */
export function createTeflon(): DielectricMaterial {
  return new DielectricMaterial(
    StringManager.getInstance().getMaterialStrings().teflonStringProperty,
    EPSILON_TEFLON,
    CapacitorLabColors.teflonColorProperty,
  );
}

/** Glass, ε = 4.7. The only translucent material. */
export function createGlass(): DielectricMaterial {
  return new DielectricMaterial(
    StringManager.getInstance().getMaterialStrings().glassStringProperty,
    EPSILON_GLASS,
    CapacitorLabColors.glassColorProperty,
  );
}

/** Paper, ε = 3.5. */
export function createPaper(): DielectricMaterial {
  return new DielectricMaterial(
    StringManager.getInstance().getMaterialStrings().paperStringProperty,
    EPSILON_PAPER,
    CapacitorLabColors.paperColorProperty,
  );
}

/**
 * Air, ε = 1 (see `EPSILON_AIR` for why it is not 1.00059). Fills the gap on the
 * Introduction and Multiple Capacitors screens, where it is never drawn — hence
 * the deliberately wrong color and the untranslated name.
 */
export function createAir(): DielectricMaterial {
  // Not localized: air is never offered in the material combo box, so this name
  // never reaches the screen. The Java sim made the same call.
  return new DielectricMaterial(new StringProperty("air"), EPSILON_AIR, CapacitorLabColors.airColorProperty);
}

/** The custom material, whose constant the user drives with a slider. */
export function createCustom(dielectricConstant = DIELECTRIC_CONSTANT_RANGE.defaultValue): DielectricMaterial {
  return new DielectricMaterial(
    StringManager.getInstance().getMaterialStrings().customStringProperty,
    dielectricConstant,
    CapacitorLabColors.customDielectricColorProperty,
    true,
  );
}
