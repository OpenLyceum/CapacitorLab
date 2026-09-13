/**
 * IntroductionModel.ts
 *
 * The Introduction screen: one battery, one capacitor, air between the plates.
 *
 * It is a {@link SingleCapacitorModel} with the dielectric pushed entirely out of
 * the way, which is how the Java sim built this screen too — `IntroductionModule`
 * instantiated a `DielectricModel` rather than defining a model of its own. The
 * dielectric machinery is all still here, doing nothing, so that the Dielectric
 * screen is the same model with different arguments rather than a second
 * implementation that has to be kept in step.
 *
 * Ported from `module/introduction/IntroductionModule.java`.
 */

import { PLATE_WIDTH_RANGE } from "../../CapacitorLabConstants.js";
import { createAir } from "../../common/model/DielectricMaterial.js";
import { SingleCapacitorModel } from "../../common/model/SingleCapacitorModel.js";

/**
 * Far enough out that no part of the slab is ever between the plates, at any
 * plate width. A metre is absurd next to a 2 cm plate, and deliberately so — it
 * makes the "no dielectric here" intent unmistakable, and it is the value the
 * Java sim used.
 */
const DIELECTRIC_FULLY_WITHDRAWN = PLATE_WIDTH_RANGE.max + 1;

export class IntroductionModel extends SingleCapacitorModel {
  public constructor() {
    super({
      materials: [createAir()],
      dielectricOffset: DIELECTRIC_FULLY_WITHDRAWN,
      eFieldDetectorSimplified: true,
    });
  }
}
