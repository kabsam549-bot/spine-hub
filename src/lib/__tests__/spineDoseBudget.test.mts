import assert from "node:assert/strict";
import test from "node:test";
import { OAR_BUDGET_PROFILES } from "../oarBudgetData.ts";
import {
  calculateOARBudget,
  calculateRegimenRadiobiology,
  doseToEQD2,
  evaluateCandidateOARDose,
} from "../spineDoseBudget.ts";

const closeTo = (
  actual: number,
  expected: number,
  tolerance = 1e-6,
) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

const cord = OAR_BUDGET_PROFILES.find(
  (profile) => profile.id === "spinal-cord",
);
const bowel = OAR_BUDGET_PROFILES.find(
  (profile) => profile.id === "bowel",
);

assert.ok(cord);
assert.ok(bowel);

test("24 Gy in 10 fractions to cord produces 26.4 Gy EQD2_2", () => {
  closeTo(doseToEQD2(24, 10, 2), 26.4);

  const result = calculateOARBudget({
    profile: cord,
    priorCourses: [
      { totalDose: 24, fractions: 10, monthsSinceTreatment: 12 },
    ],
  });

  closeTo(result.priorEQD2, 26.4);
  closeTo(result.remainingEQD2, 45.6);
  closeTo(result.physicalByFractions[1].totalDose, 20.5838928084, 1e-9);
});

test("the institutional ceiling is the only subtraction rule", () => {
  const result = calculateOARBudget({
    profile: cord,
    priorCourses: [
      { totalDose: 30, fractions: 10, monthsSinceTreatment: 18 },
    ],
  });

  closeTo(result.priorEQD2, 37.5);
  closeTo(result.remainingEQD2, 34.5);
  assert.ok(result.remainingEQD2 > 25);
});

test("editable ceilings are honored", () => {
  const result = calculateOARBudget({
    profile: cord,
    ceilingEQD2: 68,
    priorCourses: [
      { totalDose: 30, fractions: 10, monthsSinceTreatment: 18 },
    ],
  });

  closeTo(result.remainingEQD2, 30.5);
});

test("each organ uses its own alpha beta and working ceiling", () => {
  const result = calculateOARBudget({
    profile: bowel,
    priorCourses: [
      { totalDose: 30, fractions: 10, monthsSinceTreatment: 12 },
    ],
  });

  closeTo(result.priorEQD2, 36);
  closeTo(result.remainingEQD2, 14);
});

test("multiple prior courses sum without intermediate rounding", () => {
  const result = calculateOARBudget({
    profile: cord,
    priorCourses: [
      { totalDose: 24, fractions: 10, monthsSinceTreatment: 18 },
      { totalDose: 9, fractions: 3, monthsSinceTreatment: 8 },
    ],
  });

  closeTo(result.priorEQD2, 37.65);
  closeTo(result.remainingEQD2, 34.35);
});

test("regimen BED10 comparison uses GTV and elective dose separately", () => {
  const five = calculateRegimenRadiobiology(40, 30, 5);
  const ten = calculateRegimenRadiobiology(40, 30, 10);

  closeTo(five.gtvBED10, 72);
  closeTo(ten.gtvBED10, 56);
  assert.ok(five.gtvBED10 > ten.gtvBED10);
});

test("candidate OAR dose is checked against the selected cumulative ceiling", () => {
  const budget = calculateOARBudget({
    profile: cord,
    priorCourses: [
      { totalDose: 24, fractions: 10, monthsSinceTreatment: 12 },
    ],
  });
  const passing = evaluateCandidateOARDose(budget, 20, 3);
  const failing = evaluateCandidateOARDose(budget, 21, 3);

  assert.ok(passing);
  assert.equal(passing.passes, true);
  assert.ok(failing);
  assert.equal(failing.passes, false);
});
