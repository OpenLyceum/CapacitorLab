/**
 * CapacitorLabPreferencesModel.ts
 *
 * Model for the simulation-specific preferences shown in Preferences →
 * Simulation. Each preference Property takes its initial value from the
 * corresponding query parameter in capacitorLabQueryParameters.
 *
 * Currently empty — add Properties here when the sim gains real preferences.
 * The constructor keeps an optional tandem so main.ts can pass one without
 * changing call sites when preferences are added later.
 */

import type { Tandem } from "scenerystack/tandem";
import CapacitorLabNamespace from "../CapacitorLabNamespace.js";

export class CapacitorLabPreferencesModel {
  // biome-ignore lint/complexity/noUselessConstructor: tandem reserved for future preference Properties
  public constructor(_tandem?: Tandem) {
    // No sim-specific preferences yet.
  }

  public reset(): void {
    // No-op until preferences are added.
  }
}

CapacitorLabNamespace.register("CapacitorLabPreferencesModel", CapacitorLabPreferencesModel);
