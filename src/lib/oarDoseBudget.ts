/**
 * OAR Dose Budget Calculations for Spine Re-Irradiation
 *
 * Calculates remaining dose "room" for organs at risk, accounting for
 * prior doses, tissue recovery over time, and lifetime tolerances.
 */

import { calculateBED, calculateEQD2, eqd2ToPhysicalDose } from "./bedCalculations";
import type { OARBudgetData } from "./oarData";

export interface PriorCourse {
  dose: number;
  fractions: number;
  timeSinceRT: number; // months
}

export type RiskLevel = "safe" | "caution" | "warning" | "critical";

export interface OARBudgetResult {
  oar: OARBudgetData;
  priorEQD2: number;
  recoveryPercent: number;
  effectivePriorEQD2: number;
  remainingBudgetEQD2: number;
  percentRemaining: number;
  physicalDoseBudgets: {
    oneFraction: number;
    threeFractions: number;
    fiveFractions: number;
  };
  riskLevel: RiskLevel;
  warningMessage?: string;
}

/**
 * Tissue recovery factor based on time since RT.
 * Conservative estimates from empirical data.
 */
export function calculateRecoveryFactor(months: number): number {
  if (months < 6) return 0.0;
  if (months < 12) return 0.25;
  if (months < 24) return 0.4;
  return 0.5;
}

export function recoveryLabel(months: number): string {
  if (months < 6) return "<6 mo: no recovery";
  if (months < 12) return "6-12 mo: 25% recovery";
  if (months < 24) return "12-24 mo: 40% recovery";
  return ">24 mo: 50% recovery";
}

function determineRiskLevel(pct: number): RiskLevel {
  if (pct > 50) return "safe";
  if (pct > 25) return "caution";
  if (pct > 10) return "warning";
  return "critical";
}

function generateWarning(oar: OARBudgetData, pct: number): string | undefined {
  if (pct <= 10) return `Only ${pct.toFixed(1)}% of lifetime tolerance remaining. Risk of ${oar.complication} is substantially elevated.`;
  if (pct <= 25) return `${pct.toFixed(1)}% of lifetime tolerance remaining. Approaching threshold for ${oar.complication}.`;
  if (pct <= 50) return `${pct.toFixed(1)}% of lifetime tolerance remaining. Monitor for ${oar.complication}.`;
  return undefined;
}

/**
 * Calculate dose budget for a single OAR with multiple prior courses.
 * Each course has its own time-dependent recovery factor.
 */
export function calculateOARBudget(
  oar: OARBudgetData,
  courses: PriorCourse[]
): OARBudgetResult {
  let totalRawEQD2 = 0;
  let totalEffectiveEQD2 = 0;

  for (const c of courses) {
    if (c.dose <= 0 || c.fractions < 1) continue;
    const bed = calculateBED(c.dose, c.fractions, oar.alphaBeta);
    const eqd2 = calculateEQD2(bed, oar.alphaBeta);
    const recovery = calculateRecoveryFactor(c.timeSinceRT);
    totalRawEQD2 += eqd2;
    totalEffectiveEQD2 += eqd2 * (1 - recovery);
  }

  const recoveryPercent =
    totalRawEQD2 > 0
      ? (1 - totalEffectiveEQD2 / totalRawEQD2) * 100
      : 0;

  const remainingBudgetEQD2 = Math.max(0, oar.lifetimeToleranceEQD2 - totalEffectiveEQD2);
  const percentRemaining = (remainingBudgetEQD2 / oar.lifetimeToleranceEQD2) * 100;

  const physicalDoseBudgets = {
    oneFraction: eqd2ToPhysicalDose(remainingBudgetEQD2, 1, oar.alphaBeta),
    threeFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 3, oar.alphaBeta),
    fiveFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 5, oar.alphaBeta),
  };

  const riskLevel = determineRiskLevel(percentRemaining);
  const warningMessage = generateWarning(oar, percentRemaining);

  return {
    oar,
    priorEQD2: Math.round(totalRawEQD2 * 10) / 10,
    recoveryPercent: Math.round(recoveryPercent * 10) / 10,
    effectivePriorEQD2: Math.round(totalEffectiveEQD2 * 10) / 10,
    remainingBudgetEQD2: Math.round(remainingBudgetEQD2 * 10) / 10,
    percentRemaining: Math.round(percentRemaining * 10) / 10,
    physicalDoseBudgets,
    riskLevel,
    warningMessage,
  };
}

export const riskColors: Record<RiskLevel, { bg: string; border: string; text: string; chip: string; bar: string }> = {
  safe: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", chip: "bg-green-100 text-green-800", bar: "#16a34a" },
  caution: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", chip: "bg-yellow-100 text-yellow-800", bar: "#ca8a04" },
  warning: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", chip: "bg-orange-100 text-orange-800", bar: "#ea580c" },
  critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", chip: "bg-red-100 text-red-800", bar: "#dc2626" },
};
