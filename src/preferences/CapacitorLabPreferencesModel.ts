import CapacitorLabNamespace from "../CapacitorLabNamespace.js";

/**
 * Reserved for simulation-specific preferences (Preferences → Simulation). Each preference
 * Property should take its initial value from a query parameter in
 * capacitorLabQueryParameters.ts; add the matching control to CapacitorLabPreferencesNode and register the
 * node under `simulationOptions.customPreferences` in src/main.ts.
 */
export class CapacitorLabPreferencesModel {
  public reset(): void {
    // No simulation-specific preferences yet.
  }
}

CapacitorLabNamespace.register("CapacitorLabPreferencesModel", CapacitorLabPreferencesModel);
