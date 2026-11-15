/**
 * Memory-leak regression suite (fleet standard): each screen model is collected after
 * dispose(), and leaves no survivors across repeated cycles (tests/helpers/memoryLeak.ts).
 * Screen models own meters (BarMeter, Voltmeter, EFieldDetector) whose dispose() is
 * exercised through the model dispose path.
 */

import { DielectricModel } from "../src/dielectric/model/DielectricModel.js";
import { IntroductionModel } from "../src/introduction/model/IntroductionModel.js";
import { MultipleCapacitorsModel } from "../src/multiple-capacitors/model/MultipleCapacitorsModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "IntroductionModel", create: () => new IntroductionModel() },
  { name: "DielectricModel", create: () => new DielectricModel() },
  { name: "MultipleCapacitorsModel", create: () => new MultipleCapacitorsModel() },
]);
