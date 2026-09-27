import { Node } from "scenerystack/scenery";
import CapacitorLabNamespace from "../CapacitorLabNamespace.js";

/** Empty conventional preferences node; the sim currently uses only framework preferences. */
export class CapacitorLabPreferencesNode extends Node {}

CapacitorLabNamespace.register("CapacitorLabPreferencesNode", CapacitorLabPreferencesNode);
