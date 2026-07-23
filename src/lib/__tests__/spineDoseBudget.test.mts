import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateSpineDoseBudget,
  evaluateCandidateDose,
  neuralEQD2,
  physicalDoseForBudget,
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

test("24 Gy in 10 fractions produces 26.4 Gy EQD2_2", () => {
  closeTo(neuralEQD2(24, 10), 26.4);

  const result = calculateSpineDoseBudget([
    { totalDose: 24, fractions: 10, monthsSinceTreatment: 12 },
  ]);

  closeTo(result.priorEQD2, 26.4);
  closeTo(result.cumulativeRoom, 43.6);
  closeTo(result.ratioCap, 26.4);
  closeTo(result.allowableNewCourseEQD2, 25);
  assert.deepEqual(result.bindingRuleIds, ["new-course"]);
  closeTo(physicalDoseForBudget(25, 3), 14.5783958312, 1e-9);
});

test("30 Gy in 10 fractions is limited by the 25 Gy new-course cap", () => {
  const result = calculateSpineDoseBudget([
    { totalDose: 30, fractions: 10, monthsSinceTreatment: 18 },
  ]);

  closeTo(result.priorEQD2, 37.5);
  closeTo(result.allowableNewCourseEQD2, 25);
  assert.deepEqual(result.bindingRuleIds, ["new-course"]);

  const candidate = evaluateCandidateDose(result, 14.5, 3);
  assert.ok(candidate);
  assert.equal(candidate.passes, true);
});

test("50 Gy in 25 fractions is limited by cumulative room", () => {
  const result = calculateSpineDoseBudget([
    { totalDose: 50, fractions: 25, monthsSinceTreatment: 24 },
  ]);

  closeTo(result.priorEQD2, 50);
  closeTo(result.cumulativeRoom, 20);
  closeTo(result.allowableNewCourseEQD2, 20);
  assert.deepEqual(result.bindingRuleIds, ["cumulative"]);
  closeTo(physicalDoseForBudget(20, 5), 15.6155281281, 1e-9);
});

test("the ratio rule can be the binding limit after a low prior dose", () => {
  const result = calculateSpineDoseBudget([
    { totalDose: 6, fractions: 3, monthsSinceTreatment: 12 },
  ]);

  closeTo(result.priorEQD2, 6);
  closeTo(result.allowableNewCourseEQD2, 6);
  assert.deepEqual(result.bindingRuleIds, ["ratio"]);
});

test("multiple prior courses sum without intermediate rounding", () => {
  const result = calculateSpineDoseBudget([
    { totalDose: 24, fractions: 10, monthsSinceTreatment: 18 },
    { totalDose: 9, fractions: 3, monthsSinceTreatment: 8 },
  ]);

  closeTo(result.priorEQD2, 37.65);
  closeTo(result.allowableNewCourseEQD2, 25);
});

test("candidate evaluation checks all three HyTEC dose rules", () => {
  const result = calculateSpineDoseBudget([
    { totalDose: 24, fractions: 10, monthsSinceTreatment: 12 },
  ]);
  const passing = evaluateCandidateDose(result, 14.5, 3);
  const failing = evaluateCandidateDose(result, 18, 3);

  assert.ok(passing);
  assert.equal(passing.passes, true);
  assert.ok(failing);
  assert.equal(failing.passes, false);
  assert.equal(failing.withinNewCourseCap, false);
});
