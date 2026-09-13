/**
 * UnitsUtils.ts
 *
 * Conversions from the model's SI units to the ones the sim shows.
 *
 * The model works in metres because the design document did, which leaves plate
 * separations like 0.005 — fine for the physics, useless on a readout. Everything
 * the user sees goes through here first.
 *
 * Ported from `util/UnitsUtils.java`.
 */

const MILLIMETERS_PER_METER = 1000;

export function metersToMillimeters(meters: number): number {
  return meters * MILLIMETERS_PER_METER;
}

export function metersSquaredToMillimetersSquared(metersSquared: number): number {
  return metersSquared * MILLIMETERS_PER_METER * MILLIMETERS_PER_METER;
}
