/**
 * BED/EQD2 Calculations for Spine Radiation
 * Based on the Linear-Quadratic (LQ) model.
 */

/** BED = D * (1 + d/(alpha/beta)) */
export function calculateBED(totalDose: number, fractions: number, alphaBeta: number): number {
  if (totalDose <= 0 || fractions < 1 || alphaBeta <= 0) return 0;
  const d = totalDose / fractions;
  return totalDose * (1 + d / alphaBeta);
}

/** EQD2 = BED / (1 + 2/(alpha/beta)) */
export function calculateEQD2(bed: number, alphaBeta: number): number {
  if (bed <= 0 || alphaBeta <= 0) return 0;
  return bed / (1 + 2 / alphaBeta);
}

/** BED and EQD2 from dose/fractions */
export function calcBEDAndEQD2(totalDose: number, fractions: number, alphaBeta: number) {
  const bed = calculateBED(totalDose, fractions, alphaBeta);
  const eqd2 = calculateEQD2(bed, alphaBeta);
  return { bed: Math.round(bed * 10) / 10, eqd2: Math.round(eqd2 * 10) / 10 };
}

/**
 * Convert EQD2 budget back to physical dose for a given fractionation.
 * Exact positive solution of:
 * EQD2 = D * (D / n + alphaBeta) / (2 + alphaBeta)
 */
export function eqd2ToPhysicalDoseExact(
  eqd2: number,
  fractions: number,
  alphaBeta: number,
): number {
  if (eqd2 <= 0 || fractions < 1 || alphaBeta <= 0) return 0;
  const discriminant =
    alphaBeta ** 2 +
    (4 * eqd2 * (2 + alphaBeta)) / fractions;
  return (
    (fractions / 2) *
    (-alphaBeta + Math.sqrt(discriminant))
  );
}

export function eqd2ToPhysicalDose(
  eqd2: number,
  fractions: number,
  alphaBeta: number,
): number {
  const dose = eqd2ToPhysicalDoseExact(eqd2, fractions, alphaBeta);
  return Math.max(0, Math.round(dose * 10) / 10);
}
