import {
  calculateBED,
  calculateEQD2,
  eqd2ToPhysicalDoseExact,
} from "./bedCalculations.ts";

export const SPINAL_CORD_ALPHA_BETA = 2;
export const HYTEC_CUMULATIVE_CEILING = 70;
export const HYTEC_NEW_COURSE_CAP = 25;
export const HYTEC_RATIO_CAP = 0.5;
export const HYTEC_MINIMUM_INTERVAL_MONTHS = 5;

export interface PriorNeuralCourse {
  totalDose: number;
  fractions: number;
  monthsSinceTreatment: number;
}

export interface DoseBudgetRule {
  id: "cumulative" | "new-course" | "ratio";
  label: string;
  maximumNewCourseEQD2: number;
  explanation: string;
}

export interface SpineDoseBudgetResult {
  priorCourses: Array<
    PriorNeuralCourse & {
      dosePerFraction: number;
      bed2: number;
      eqd2: number;
    }
  >;
  priorEQD2: number;
  cumulativeCeiling: number;
  cumulativeRoom: number;
  newCourseCap: number;
  ratioCap: number;
  allowableNewCourseEQD2: number;
  rules: DoseBudgetRule[];
  bindingRuleIds: DoseBudgetRule["id"][];
  intervalBelowFiveMonths: boolean;
  intervalFiveToSixMonths: boolean;
}

export interface CandidateDoseResult {
  totalDose: number;
  fractions: number;
  dosePerFraction: number;
  eqd2: number;
  cumulativeEQD2: number;
  newToCumulativeRatio: number;
  withinCumulativeCeiling: boolean;
  withinNewCourseCap: boolean;
  withinRatioCap: boolean;
  withinCalculatedBudget: boolean;
  passes: boolean;
}

export function neuralEQD2(totalDose: number, fractions: number): number {
  const bed = calculateBED(
    totalDose,
    fractions,
    SPINAL_CORD_ALPHA_BETA,
  );
  return calculateEQD2(bed, SPINAL_CORD_ALPHA_BETA);
}

export function calculateSpineDoseBudget(
  priorCourses: PriorNeuralCourse[],
  cumulativeCeiling = HYTEC_CUMULATIVE_CEILING,
): SpineDoseBudgetResult {
  const parsedCourses = priorCourses
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
      const bed2 = calculateBED(
        course.totalDose,
        course.fractions,
        SPINAL_CORD_ALPHA_BETA,
      );
      return {
        ...course,
        dosePerFraction: course.totalDose / course.fractions,
        bed2,
        eqd2: calculateEQD2(bed2, SPINAL_CORD_ALPHA_BETA),
      };
    });

  const priorEQD2 = parsedCourses.reduce(
    (total, course) => total + course.eqd2,
    0,
  );
  const cumulativeRoom = Math.max(0, cumulativeCeiling - priorEQD2);

  // x / (prior + x) <= 0.5 reduces algebraically to x <= prior.
  const ratioCap = Math.max(0, priorEQD2);
  const rules: DoseBudgetRule[] = [
    {
      id: "cumulative",
      label: "70 Gy cumulative ceiling",
      maximumNewCourseEQD2: cumulativeRoom,
      explanation: `${cumulativeCeiling} − prior EQD2`,
    },
    {
      id: "new-course",
      label: "25 Gy new-course cap",
      maximumNewCourseEQD2: HYTEC_NEW_COURSE_CAP,
      explanation: "Published HyTEC new-course maximum",
    },
    {
      id: "ratio",
      label: "0.50 new-to-cumulative ratio",
      maximumNewCourseEQD2: ratioCap,
      explanation: "New / (prior + new) ≤ 0.50",
    },
  ];
  const allowableNewCourseEQD2 = Math.max(
    0,
    Math.min(...rules.map((rule) => rule.maximumNewCourseEQD2)),
  );
  const bindingRuleIds = rules
    .filter(
      (rule) =>
        Math.abs(rule.maximumNewCourseEQD2 - allowableNewCourseEQD2) <
        1e-9,
    )
    .map((rule) => rule.id);

  return {
    priorCourses: parsedCourses,
    priorEQD2,
    cumulativeCeiling,
    cumulativeRoom,
    newCourseCap: HYTEC_NEW_COURSE_CAP,
    ratioCap,
    allowableNewCourseEQD2,
    rules,
    bindingRuleIds,
    intervalBelowFiveMonths: parsedCourses.some(
      (course) =>
        course.monthsSinceTreatment < HYTEC_MINIMUM_INTERVAL_MONTHS,
    ),
    intervalFiveToSixMonths: parsedCourses.some(
      (course) =>
        course.monthsSinceTreatment >= HYTEC_MINIMUM_INTERVAL_MONTHS &&
        course.monthsSinceTreatment < 6,
    ),
  };
}

export function physicalDoseForBudget(
  allowableNewCourseEQD2: number,
  fractions: number,
): number {
  return eqd2ToPhysicalDoseExact(
    allowableNewCourseEQD2,
    fractions,
    SPINAL_CORD_ALPHA_BETA,
  );
}

export function evaluateCandidateDose(
  budget: SpineDoseBudgetResult,
  totalDose: number,
  fractions: number,
): CandidateDoseResult | null {
  if (
    !Number.isFinite(totalDose) ||
    totalDose <= 0 ||
    !Number.isFinite(fractions) ||
    fractions < 1
  ) {
    return null;
  }

  const eqd2 = neuralEQD2(totalDose, fractions);
  const cumulativeEQD2 = budget.priorEQD2 + eqd2;
  const newToCumulativeRatio =
    cumulativeEQD2 > 0 ? eqd2 / cumulativeEQD2 : 0;
  const epsilon = 1e-9;
  const withinCumulativeCeiling =
    cumulativeEQD2 <= budget.cumulativeCeiling + epsilon;
  const withinNewCourseCap =
    eqd2 <= HYTEC_NEW_COURSE_CAP + epsilon;
  const withinRatioCap =
    newToCumulativeRatio <= HYTEC_RATIO_CAP + epsilon;
  const withinCalculatedBudget =
    eqd2 <= budget.allowableNewCourseEQD2 + epsilon;

  return {
    totalDose,
    fractions,
    dosePerFraction: totalDose / fractions,
    eqd2,
    cumulativeEQD2,
    newToCumulativeRatio,
    withinCumulativeCeiling,
    withinNewCourseCap,
    withinRatioCap,
    withinCalculatedBudget,
    passes:
      withinCumulativeCeiling &&
      withinNewCourseCap &&
      withinRatioCap &&
      withinCalculatedBudget,
  };
}
