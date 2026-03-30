/**
 * OAR Dose Budget Calculations for Spine Re-Irradiation
 *
 * Calculates remaining dose budget for organs at risk.
 * No recovery-time adjustments. Time since last treatment is tracked
 * solely for cautionary alerts when < 6 months.
 */

import { calculateBED, calculateEQD2, eqd2ToPhysicalDose } from "./bedCalculations";
import type { OARBudgetData } from "./oarData";

export interface PriorCourse {
  dose: number;
  fractions: number;
  timeSinceRT: number; // months (used for caution alerts only)
  isDoseToPrescription?: boolean; // true = prescription dose, false = actual OAR dose
}

export type RiskLevel = "safe" | "caution" | "warning" | "critical";
export type RiskTolerance = "low" | "medium" | "high";

/** Scaling factors applied to lifetime tolerance based on risk appetite */
export const RISK_TOLERANCE_FACTORS: Record<RiskTolerance, number> = {
  low: 0.85,
  medium: 1.0,
  high: 1.15,
};

export const RISK_TOLERANCE_LABELS: Record<RiskTolerance, string> = {
  low: "Conservative -- reduce ceiling by 15%",
  medium: "Standard -- published tolerance limits",
  high: "Aggressive -- extend ceiling by 15%",
};

export interface OARBudgetResult {
  oar: OARBudgetData;
  priorEQD2: number;
  effectiveTolerance: number;
  remainingBudgetEQD2: number;
  percentRemaining: number;
  percentUsed: number;
  physicalDoseBudgets: {
    oneFraction: number;
    threeFractions: number;
    fiveFractions: number;
  };
  courseBreakdown: CourseBreakdown[];
  riskLevel: RiskLevel;
  warningMessage?: string;
  timeCaution: boolean; // true if any course < 6 months ago
}

export interface CourseBreakdown {
  courseIndex: number;
  dose: number;
  fractions: number;
  dosePerFraction: number;
  alphaBeta: number;
  bed: number;
  eqd2: number;
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
 * No recovery-time adjustments applied. Risk tolerance scales the ceiling.
 */
export function calculateOARBudget(
  oar: OARBudgetData,
  courses: PriorCourse[],
  riskTolerance: RiskTolerance = "medium"
): OARBudgetResult {
  let totalEQD2 = 0;
  let timeCaution = false;
  const courseBreakdown: CourseBreakdown[] = [];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    if (c.dose <= 0 || c.fractions < 1) continue;

    if (c.timeSinceRT < 6) {
      timeCaution = true;
    }

    const dosePerFraction = c.dose / c.fractions;
    const bed = calculateBED(c.dose, c.fractions, oar.alphaBeta);
    const eqd2 = calculateEQD2(bed, oar.alphaBeta);
    totalEQD2 += eqd2;

    courseBreakdown.push({
      courseIndex: i + 1,
      dose: c.dose,
      fractions: c.fractions,
      dosePerFraction: Math.round(dosePerFraction * 100) / 100,
      alphaBeta: oar.alphaBeta,
      bed: Math.round(bed * 10) / 10,
      eqd2: Math.round(eqd2 * 10) / 10,
    });
  }

  const toleranceFactor = RISK_TOLERANCE_FACTORS[riskTolerance];
  const effectiveTolerance = oar.lifetimeToleranceEQD2 * toleranceFactor;
  const remainingBudgetEQD2 = Math.max(0, effectiveTolerance - totalEQD2);
  const percentRemaining = effectiveTolerance > 0 ? (remainingBudgetEQD2 / effectiveTolerance) * 100 : 0;
  const percentUsed = effectiveTolerance > 0 ? (Math.min(totalEQD2, effectiveTolerance) / effectiveTolerance) * 100 : 100;

  const physicalDoseBudgets = {
    oneFraction: eqd2ToPhysicalDose(remainingBudgetEQD2, 1, oar.alphaBeta),
    threeFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 3, oar.alphaBeta),
    fiveFractions: eqd2ToPhysicalDose(remainingBudgetEQD2, 5, oar.alphaBeta),
  };

  const riskLevel = determineRiskLevel(percentRemaining);
  const warningMessage = generateWarning(oar, percentRemaining);

  return {
    oar,
    priorEQD2: Math.round(totalEQD2 * 10) / 10,
    effectiveTolerance: Math.round(effectiveTolerance * 10) / 10,
    remainingBudgetEQD2: Math.round(remainingBudgetEQD2 * 10) / 10,
    percentRemaining: Math.round(percentRemaining * 10) / 10,
    percentUsed: Math.round(percentUsed * 10) / 10,
    physicalDoseBudgets,
    courseBreakdown,
    riskLevel,
    warningMessage,
    timeCaution,
  };
}

export const riskColors: Record<RiskLevel, { bg: string; border: string; text: string; chip: string; bar: string }> = {
  safe: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", chip: "bg-green-100 text-green-800", bar: "#16a34a" },
  caution: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", chip: "bg-yellow-100 text-yellow-800", bar: "#ca8a04" },
  warning: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", chip: "bg-orange-100 text-orange-800", bar: "#ea580c" },
  critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", chip: "bg-red-100 text-red-800", bar: "#dc2626" },
};
