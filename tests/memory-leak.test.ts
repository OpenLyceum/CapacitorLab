/**
 * Memory-leak regression suite (fleet standard): each disposable is collected after
 * dispose(), and leaves no survivors across repeated cycles (tests/helpers/memoryLeak.ts).
 * Screen models own meters (BarMeter, Voltmeter, EFieldDetector) whose dispose() is
 * exercised through the model dispose path.
 */

import { Vector3 } from "scenerystack/dot";
import { PLATE_WIDTH_RANGE } from "../src/CapacitorLabConstants.js";
import { createAir } from "../src/common/model/DielectricMaterial.js";
import { SingleCapacitorModel } from "../src/common/model/SingleCapacitorModel.js";
import { WorldBounds } from "../src/common/model/WorldBounds.js";
import { WorldPositionProperty } from "../src/common/model/WorldPositionProperty.js";
import { DielectricModel } from "../src/dielectric/model/DielectricModel.js";
import { IntroductionModel } from "../src/introduction/model/IntroductionModel.js";
import { MultipleCapacitorsModel } from "../src/multiple-capacitors/model/MultipleCapacitorsModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

/** Far enough out that no part of the slab is between the plates (Introduction layout). */
const DIELECTRIC_FULLY_WITHDRAWN = PLATE_WIDTH_RANGE.max + 1;

/** Outlives every WorldPositionProperty case so dispose() must unlink from it. */
const worldBounds = new WorldBounds();

describeDisposalLeaks([
  // memory-leak-covers: BarMeter, EFieldDetector, Voltmeter (built and disposed by every screen model)
  { name: "IntroductionModel", create: () => new IntroductionModel() },
  { name: "DielectricModel", create: () => new DielectricModel() },
  { name: "MultipleCapacitorsModel", create: () => new MultipleCapacitorsModel() },
  {
    name: "SingleCapacitorModel",
    create: () =>
      new SingleCapacitorModel({
        materials: [createAir()],
        dielectricOffset: DIELECTRIC_FULLY_WITHDRAWN,
        eFieldDetectorSimplified: true,
      }),
  },
  {
    name: "WorldPositionProperty",
    create: () => new WorldPositionProperty(worldBounds, new Vector3(0, 0, 0)),
    keepAlive: () => [worldBounds],
  },
]);
