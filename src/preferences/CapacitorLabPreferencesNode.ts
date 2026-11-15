/**
 * CapacitorLabPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Currently empty —
 * add controls here when the sim gains real preferences.
 */

import { Node } from "scenerystack/scenery";
import type { Tandem } from "scenerystack/tandem";
import CapacitorLabNamespace from "../CapacitorLabNamespace.js";
import type { CapacitorLabPreferencesModel } from "./CapacitorLabPreferencesModel.js";

/** Empty conventional preferences node; the sim currently uses only framework preferences. */
export class CapacitorLabPreferencesNode extends Node {
  public constructor(_preferencesModel: CapacitorLabPreferencesModel, _tandem?: Tandem) {
    super();
  }
}

CapacitorLabNamespace.register("CapacitorLabPreferencesNode", CapacitorLabPreferencesNode);
