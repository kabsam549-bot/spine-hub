import {
  calculateBED,
  calculateEQD2,
  eqd2ToPhysicalDoseExact,
} from "./bedCalculations.ts";
import type { OARBudgetProfile } from "./oarBudgetData.ts";

export interface PriorOARDose {
  totalDose: number;
  fractions: number;
  monthsSinceTreatment: number;
}

export interface OARBudgetInput {
  profile: OARBudgetProfile;
  priorCourses: PriorOARDose[];
  ceilingEQD2?: number;
}

export interface OARBudgetResult {
  profile: OARBudgetProfile;
  ceilingEQD2: number;
  priorEQD2: number;
  remainingEQD2: number;
  percentUsed: number;
  intervalUnderSixMonths: boolean;
  courses: Array<
    PriorOARDose & {
      dosePerFraction: number;
      bed: number;
      eqd2: number;
    }
  >;
  physicalByFractions: Array<{
    fractions: number;
    totalDose: number;
    dosePerFraction: number;
  }>;
}

export interface RegimenRadiobiology {
  gtvBED10: number;
  gtvEQD2_10: number;
  electiveBED10: number;
  electiveEQD2_10: number;
}

export interface CandidateOARDoseCheck {
  newCourseEQD2: number;
  cumulativeEQD2: number;
  remainingAfterCandidateEQD2: number;
  passes: boolean;
}

export function doseToEQD2(
  totalDose: number,
  fractions: number,
  alphaBeta: number,
): number {
  return calculateEQD2(
    calculateBED(totalDose, fractions, alphaBeta),
    alphaBeta,
  );
}

export function calculateOARBudget(
  input: OARBudgetInput,
  fractionationOptions: number[] = [1, 3, 5, 10],
): OARBudgetResult {
  const ceilingEQD2 =
    input.ceilingEQD2 && input.ceilingEQD2 > 0
      ? input.ceilingEQD2
      : input.profile.workingCeilingEQD2;
  const courses = input.priorCourses
    .filter(
      (course) =>
        Number.isFinite(course.totalDose) &&
        course.totalDose > 0 &&
        Number.isFinite(course.fractions) &&
        course.fractions >= 1 &&
        Number.isFinite(course.monthsSinceTreatment) &&
        course.monthsSinceTreatment >= 0,
    )
    .map((course) => {
      const dosePerFraction = course.totalDose / course.fractions;
      const bed = calculateBED(
        course.totalDose,
        course.fractions,
        input.profile.alphaBeta,
      );
      return {
        ...course,
        dosePerFraction,
        bed,
        eqd2: calculateEQD2(bed, input.profile.alphaBeta),
      };
    });
  const priorEQD2 = courses.reduce(
    (total, course) => total + course.eqd2,
    0,
  );
  const remainingEQD2 = Math.max(0, ceilingEQD2 - priorEQD2);
  const percentUsed =
    ceilingEQD2 > 0
      ? Math.min(100, Math.max(0, (priorEQD2 / ceilingEQD2) * 100))
      : 100;

  return {
    profile: input.profile,
    ceilingEQD2,
    priorEQD2,
    remainingEQD2,
    percentUsed,
    intervalUnderSixMonths: courses.some(
      (course) => course.monthsSinceTreatment < 6,
    ),
    courses,
    physicalByFractions: fractionationOptions.map((fractions) => {
      const totalDose = eqd2ToPhysicalDoseExact(
        remainingEQD2,
        fractions,
        input.profile.alphaBeta,
      );
      return {
        fractions,
        totalDose,
        dosePerFraction: totalDose / fractions,
      };
    }),
  };
}

export function calculateRegimenRadiobiology(
  gtvDose: number,
  electiveDose: number,
  fractions: number,
): RegimenRadiobiology {
  const gtvBED10 = calculateBED(gtvDose, fractions, 10);
  const electiveBED10 = calculateBED(electiveDose, fractions, 10);
  return {
    gtvBED10,
    gtvEQD2_10: calculateEQD2(gtvBED10, 10),
    electiveBED10,
    electiveEQD2_10: calculateEQD2(electiveBED10, 10),
  };
}

export function evaluateCandidateOARDose(
  budget: OARBudgetResult,
  totalDose: number,
  fractions: number,
): CandidateOARDoseCheck | null {
  if (
    !Number.isFinite(totalDose) ||
    totalDose <= 0 ||
    !Number.isFinite(fractions) ||
    fractions < 1
  ) {
    return null;
  }
  const newCourseEQD2 = doseToEQD2(
    totalDose,
    fractions,
    budget.profile.alphaBeta,
  );
  const cumulativeEQD2 = budget.priorEQD2 + newCourseEQD2;
  return {
    newCourseEQD2,
    cumulativeEQD2,
    remainingAfterCandidateEQD2:
      budget.ceilingEQD2 - cumulativeEQD2,
    passes: cumulativeEQD2 <= budget.ceilingEQD2 + 1e-9,
  };
}
