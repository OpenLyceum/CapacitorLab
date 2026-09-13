/**
 * DielectricModel.ts
 *
 * The Dielectric screen: the Introduction screen's circuit, plus a slab of
 * insulator the user can choose, characterize and slide out from between the
 * plates.
 *
 * Ported from `module/dielectric/DielectricModule.java`.
 */

import { DIELECTRIC_OFFSET_RANGE } from "../../CapacitorLabConstants.js";
import { createCustom, createGlass, createPaper, createTeflon } from "../../common/model/DielectricMaterial.js";
import { SingleCapacitorModel } from "../../common/model/SingleCapacitorModel.js";

export class DielectricModel extends SingleCapacitorModel {
  public constructor() {
    super({
      // Order as the Java sim listed them: the adjustable one first, then the
      // real materials by increasing dielectric constant.
      materials: [createCustom(), createTeflon(), createPaper(), createGlass()],
      dielectricOffset: DIELECTRIC_OFFSET_RANGE.defaultValue,
      eFieldDetectorSimplified: false,
    });
  }
}
