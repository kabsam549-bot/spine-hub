"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";
import {
  MDACC_RERT_REGIMENS,
  MDACC_RERT_SERVICE_TEMPLATES,
  SPINE_REFERENCES,
} from "@/lib/spineClinicalData";
import {
  calculateSpineDoseBudget,
  evaluateCandidateDose,
  physicalDoseForBudget,
} from "@/lib/spineDoseBudget";

type DoseKnowledge = "actual" | "prescription";
type ResultView = "summary" | "proof";

interface CourseInput {
  dose: string;
  fractions: string;
  months: string;
}

const frameworkOptions = [
  {
    value: 70,
    label: "Published HyTEC",
    description: "70 Gy cumulative EQD2₂ ceiling",
  },
  {
    value: 65,
    label: "Planning reserve",
    description: "65 Gy cumulative EQD2₂ working ceiling",
  },
  {
    value: 72,
    label: "MD Anderson protocol",
    description: "72 Gy cumulative EQD2₂ program ceiling",
  },
];

const plannedFractionOptions = [1, 3, 5, 10];

const emptyCourse = (): CourseInput => ({
  dose: "",
  fractions: "",
  months: "",
});

const round = (value: number, digits = 1) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const format = (value: number, digits = 1) =>
  round(value, digits).toFixed(digits);

export default function DoseBudgetPage() {
  const [doseKnowledge, setDoseKnowledge] =
    useState<DoseKnowledge>("actual");
  const [courses, setCourses] = useState<CourseInput[]>([emptyCourse()]);
  const [plannedFractions, setPlannedFractions] = useState("3");
  const [candidateDose, setCandidateDose] = useState("");
  const [cumulativeCeiling, setCumulativeCeiling] = useState(70);
  const [showResult, setShowResult] = useState(false);
  const [resultView, setResultView] = useState<ResultView>("summary");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [error, setError] = useState("");

  const parsedCourses = useMemo(
    () =>
      courses.flatMap((course) => {
        const totalDose = Number(course.dose);
        const fractions = Number(course.fractions);
        const monthsSinceTreatment = Number(course.months);
        if (
          totalDose <= 0 ||
          fractions < 1 ||
          monthsSinceTreatment < 0 ||
          course.months.trim() === ""
        ) {
          return [];
        }
        return [{ totalDose, fractions, monthsSinceTreatment }];
      }),
    [courses],
  );

  const plannedFx = Number(plannedFractions);
  const budget = useMemo(
    () =>
      parsedCourses.length
        ? calculateSpineDoseBudget(parsedCourses, cumulativeCeiling)
        : null,
    [parsedCourses, cumulativeCeiling],
  );
  const physicalLimit =
    budget && plannedFx >= 1
      ? physicalDoseForBudget(
          budget.allowableNewCourseEQD2,
          plannedFx,
        )
      : 0;
  const candidate = budget
    ? evaluateCandidateDose(
        budget,
        Number(candidateDose),
        plannedFx,
      )
    : null;
  const selectedFramework =
    frameworkOptions.find(
      (option) => option.value === cumulativeCeiling,
    ) ?? frameworkOptions[0];
  const bindingRules =
    budget?.rules.filter((rule) =>
      budget.bindingRuleIds.includes(rule.id),
    ) ?? [];

  const updateCourse = (
    index: number,
    field: keyof CourseInput,
    value: string,
  ) => {
    setCourses((current) =>
      current.map((course, courseIndex) =>
        courseIndex === index ? { ...course, [field]: value } : course,
      ),
    );
    setShowResult(false);
    setError("");
  };

  const calculate = (event: FormEvent) => {
    event.preventDefault();
    if (parsedCourses.length !== courses.length) {
      setError(
        "Complete dose, fractions, and months since treatment for every prior course.",
      );
      return;
    }
    if (plannedFx < 1) {
      setError("Choose the planned number of fractions.");
      return;
    }
    setError("");
    setResultView("summary");
    setShowResult(true);
  };

  const loadExample = () => {
    setDoseKnowledge("actual");
    setCourses([{ dose: "24", fractions: "10", months: "12" }]);
    setPlannedFractions("3");
    setCandidateDose("");
    setCumulativeCeiling(70);
    setShowResult(false);
    setError("");
    setShowWalkthrough(false);
  };

  const startOver = () => {
    setCourses([emptyCourse()]);
    setCandidateDose("");
    setPlannedFractions("3");
    setCumulativeCeiling(70);
    setDoseKnowledge("actual");
    setShowResult(false);
    setResultView("summary");
    setError("");
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      <section className="fade-in-up">
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-blue-700"
        >
          ← All Spine Hub tools
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Spinal cord reirradiation
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Check the neural dose budget
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
              Enter the prior cord or thecal sac dose, choose the planned
              fractionation, and get one physical Dmax to take to planning.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWalkthrough((current) => !current)}
            aria-expanded={showWalkthrough}
            className="shrink-0 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 hover:bg-blue-100"
          >
            {showWalkthrough ? "Close walkthrough" : "How to use this"}
          </button>
        </div>
      </section>

      {showWalkthrough && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                60-second walkthrough
              </p>
              <h2 className="mt-1 text-xl font-bold text-blue-950">
                From prior plan to a checkable limit
              </h2>
            </div>
            <button
              type="button"
              onClick={loadExample}
              className="shrink-0 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Load example
            </button>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                number: "1",
                title: "Use the OAR dose",
                text: "Enter the prior cord or thecal sac Dmax, not the target prescription. Use prescription only when the prior plan is unavailable.",
              },
              {
                number: "2",
                title: "Choose planned fractions",
                text: "The tool converts the allowable EQD2₂ into a physical Dmax for that fractionation.",
              },
              {
                number: "3",
                title: "Proof-check the result",
                text: "Switch to Proof check to see the BED, EQD2₂, each HyTEC rule, and the binding limit.",
              },
            ].map((step) => (
              <li
                key={step.number}
                className="rounded-xl border border-blue-100 bg-white p-4"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
                  {step.number}
                </span>
                <p className="mt-3 text-sm font-bold text-gray-950">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-blue-900">
            Example: 24 Gy in 10 fractions to the cord equals 26.4 Gy
            EQD2₂. With the published framework, the 25 Gy new-course cap
            binds. In 3 fractions, that converts to 14.6 Gy total Dmax.
          </p>
        </section>
      )}

      {!showResult ? (
        <form
          onSubmit={calculate}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Step 1 of 2
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-950">
              What dose did the neural structure receive?
            </h2>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900">
                What information do you have?
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={doseKnowledge === "actual"}
                  onClick={() => setDoseKnowledge("actual")}
                  className={`rounded-xl border p-4 text-left ${
                    doseKnowledge === "actual"
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-gray-950">
                    Cord / thecal sac dose
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                    Recommended. Use Dmax or the relevant small-volume dose
                    from the prior plan.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={doseKnowledge === "prescription"}
                  onClick={() => setDoseKnowledge("prescription")}
                  className={`rounded-xl border p-4 text-left ${
                    doseKnowledge === "prescription"
                      ? "border-amber-600 bg-amber-50 ring-1 ring-amber-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="block text-sm font-bold text-gray-950">
                    Target prescription only
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                    Rough surrogate when the delivered neural dose cannot be
                    retrieved.
                  </span>
                </button>
              </div>
            </fieldset>

            {doseKnowledge === "prescription" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                The prescription will be treated as if the neural structure
                received the full dose. This is deliberately conservative and
                may materially understate the usable budget. Reconstruct the
                actual prior OAR dose before clinical use.
              </div>
            )}

            <div className="space-y-4">
              {courses.map((course, index) => (
                <fieldset
                  key={index}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <legend className="text-sm font-semibold text-gray-900">
                      Prior course {index + 1}
                    </legend>
                    {courses.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCourses((current) =>
                            current.filter(
                              (_, courseIndex) => courseIndex !== index,
                            ),
                          )
                        }
                        className="text-xs font-semibold text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {doseKnowledge === "actual"
                      ? "Dose received by the cord or thecal sac"
                      : "Target prescription used as a surrogate"}
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <label className="grid gap-1.5 text-sm font-medium text-gray-800">
                      Total dose
                      <span className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={course.dose}
                          onChange={(event) =>
                            updateCourse(
                              index,
                              "dose",
                              event.target.value,
                            )
                          }
                          placeholder="24"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-base text-gray-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-gray-400">
                          Gy
                        </span>
                      </span>
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-gray-800">
                      Fractions
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={course.fractions}
                        onChange={(event) =>
                          updateCourse(
                            index,
                            "fractions",
                            event.target.value,
                          )
                        }
                        placeholder="10"
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-gray-800">
                      Treated
                      <span className="relative">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={course.months}
                          onChange={(event) =>
                            updateCourse(
                              index,
                              "months",
                              event.target.value,
                            )
                          }
                          placeholder="12"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-20 text-base text-gray-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-gray-400">
                          months ago
                        </span>
                      </span>
                    </label>
                  </div>
                  {Number(course.dose) > 0 &&
                    Number(course.fractions) > 0 && (
                      <p className="mt-3 text-xs text-gray-500">
                        {course.dose} Gy in {course.fractions} fractions ={" "}
                        {format(
                          Number(course.dose) /
                            Number(course.fractions),
                          2,
                        )}{" "}
                        Gy per fraction
                      </p>
                    )}
                </fieldset>
              ))}
              <button
                type="button"
                onClick={() =>
                  setCourses((current) => [...current, emptyCourse()])
                }
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                + Add another prior course
              </button>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Step 2 of 2
              </p>
              <fieldset className="mt-2">
                <legend className="text-xl font-bold text-gray-950">
                  How many fractions are planned now?
                </legend>
                <p className="mt-1 text-sm text-gray-600">
                  The primary result will be a physical neural Dmax for this
                  fractionation.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {plannedFractionOptions.map((fractions) => (
                    <button
                      key={fractions}
                      type="button"
                      aria-pressed={plannedFractions === String(fractions)}
                      onClick={() => {
                        setPlannedFractions(String(fractions));
                        setShowResult(false);
                      }}
                      className={`min-w-16 rounded-lg border px-4 py-2.5 text-sm font-bold ${
                        plannedFractions === String(fractions)
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {fractions} fx
                    </button>
                  ))}
                  <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3">
                    <span className="text-xs font-medium text-gray-500">
                      Other
                    </span>
                    <input
                      aria-label="Custom planned fractions"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={
                        plannedFractionOptions.includes(plannedFx)
                          ? ""
                          : plannedFractions
                      }
                      onChange={(event) =>
                        setPlannedFractions(event.target.value)
                      }
                      className="w-12 py-2.5 text-sm font-semibold text-gray-900 outline-none"
                    />
                  </label>
                </div>
              </fieldset>

              <label className="mt-5 grid max-w-sm gap-1.5 text-sm font-medium text-gray-800">
                Proposed neural Dmax{" "}
                <span className="font-normal text-gray-500">(optional)</span>
                <span className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={candidateDose}
                    onChange={(event) =>
                      setCandidateDose(event.target.value)
                    }
                    placeholder="For example, 14.5"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-base text-gray-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-400">
                    Gy
                  </span>
                </span>
                <span className="text-xs font-normal leading-relaxed text-gray-500">
                  Enter cord or thecal sac Dmax, not target prescription.
                </span>
              </label>
            </div>

            <details className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                Advanced settings
              </summary>
              <label className="mt-4 grid max-w-sm gap-1.5 text-sm font-medium text-gray-800">
                Cumulative framework
                <select
                  value={cumulativeCeiling}
                  onChange={(event) =>
                    setCumulativeCeiling(Number(event.target.value))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900"
                >
                  {frameworkOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}: {option.description}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-gray-600">
                The default is the published 70 Gy HyTEC ceiling. No option
                applies recovery credit. The 65 Gy option is a planning
                reserve, while 72 Gy is an institutional protocol ceiling.
              </p>
            </details>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-700 px-5 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/20"
            >
              Calculate neural Dmax
            </button>
            <p className="text-center text-xs text-gray-500">
              α/β = 2 Gy · No recovery credit · Exact values used until display
            </p>
          </div>
        </form>
      ) : (
        budget && (
          <section className="space-y-5 fade-in-up">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                ← Change inputs
              </button>
              <div className="flex rounded-lg bg-gray-100 p-1">
                {[
                  { value: "summary" as ResultView, label: "Result" },
                  { value: "proof" as ResultView, label: "Proof check" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={resultView === option.value}
                    onClick={() => setResultView(option.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                      resultView === option.value
                        ? "bg-white text-gray-950 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {resultView === "summary" ? (
              <>
                {(budget.intervalBelowFiveMonths ||
                  budget.intervalFiveToSixMonths) && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-950">
                    <strong>Retreatment interval check:</strong>{" "}
                    {budget.intervalBelowFiveMonths
                      ? "At least one course is less than 5 months old and does not meet the published lower-risk interval factor."
                      : "The interval meets the published 5-month factor but remains inside the program's heightened-caution window of under 6 months."}
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-sm">
                  <div className="bg-blue-50 p-6 sm:p-8">
                    <p className="text-sm font-semibold text-blue-800">
                      Maximum new-course cord / thecal sac Dmax
                    </p>
                    <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="tabular-nums text-5xl font-bold tracking-tight text-blue-950 sm:text-6xl">
                        {format(physicalLimit)}
                      </span>
                      <span className="text-xl font-bold text-blue-950">
                        Gy total in {plannedFx} fx
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-blue-900">
                      Equivalent to{" "}
                      {format(budget.allowableNewCourseEQD2)} Gy EQD2₂.
                      The binding rule is{" "}
                      <strong>
                        {bindingRules
                          .map((rule) => rule.label.toLowerCase())
                          .join(" and ")}
                      </strong>
                      .
                    </p>
                  </div>
                  <div className="border-t border-blue-100 p-5 sm:px-8">
                    <p className="text-sm font-bold text-gray-950">
                      This is a neural avoidance limit, not the target
                      prescription.
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      Compare it with the applicable service-template
                      constraint, composite dose review, and case-specific
                      anatomy. Use the more restrictive clinically applicable
                      limit.
                    </p>
                  </div>
                </div>

                {plannedFx > 5 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                    <strong>Evidence scope:</strong> the HyTEC lower-risk
                    reirradiation factors were reported for SBRT delivered in
                    1 to 5 fractions. The {plannedFx}-fraction physical
                    conversion is LQ planning arithmetic and should not be
                    presented as a directly validated HyTEC constraint.
                  </div>
                )}

                {candidate && (
                  <div
                    className={`rounded-2xl border p-5 ${
                      candidate.passes
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <p
                      className={`text-base font-bold ${
                        candidate.passes
                          ? "text-emerald-950"
                          : "text-red-950"
                      }`}
                    >
                      Proposed {format(candidate.totalDose)} Gy in{" "}
                      {candidate.fractions} fx:{" "}
                      {candidate.passes
                        ? "within all selected dose rules"
                        : "exceeds one or more selected dose rules"}
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {[
                        {
                          label: "New course",
                          value: `${format(candidate.eqd2)} Gy EQD2₂`,
                          pass: candidate.withinNewCourseCap,
                        },
                        {
                          label: "Cumulative",
                          value: `${format(candidate.cumulativeEQD2)} / ${budget.cumulativeCeiling} Gy`,
                          pass: candidate.withinCumulativeCeiling,
                        },
                        {
                          label: "New / cumulative",
                          value: `${format(candidate.newToCumulativeRatio, 3)} / 0.500`,
                          pass: candidate.withinRatioCap,
                        },
                      ].map((check) => (
                        <div
                          key={check.label}
                          className="rounded-lg bg-white/75 p-3"
                        >
                          <p className="text-xs text-gray-600">
                            {check.label}
                          </p>
                          <p className="mt-1 text-sm font-bold text-gray-950">
                            {check.value}
                          </p>
                          <p
                            className={`mt-1 text-xs font-semibold ${
                              check.pass
                                ? "text-emerald-700"
                                : "text-red-700"
                            }`}
                          >
                            {check.pass ? "Pass" : "Exceeds"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setResultView("proof")}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50"
                >
                  Proof-check this calculation
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Calculation audit
                </p>
                <h2 className="mt-1 text-2xl font-bold text-gray-950">
                  See every number used
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Linear-quadratic model with α/β = 2 Gy. Values are summed at
                  full precision and rounded only for display.
                </p>

                <div className="mt-6 space-y-4">
                  {budget.priorCourses.map((course, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <p className="text-sm font-bold text-gray-950">
                        Prior course {index + 1}:{" "}
                        {format(course.totalDose)} Gy in{" "}
                        {course.fractions} fx
                      </p>
                      <div className="mt-3 grid gap-2 text-xs leading-relaxed text-gray-700 sm:grid-cols-3">
                        <p>
                          <span className="block text-gray-500">
                            Dose / fraction
                          </span>
                          {format(course.totalDose)} ÷{" "}
                          {course.fractions} ={" "}
                          <strong>
                            {format(course.dosePerFraction, 2)} Gy
                          </strong>
                        </p>
                        <p>
                          <span className="block text-gray-500">BED₂</span>
                          {format(course.totalDose)} × [1 +{" "}
                          {format(course.dosePerFraction, 2)} ÷ 2] ={" "}
                          <strong>{format(course.bed2)} Gy₂</strong>
                        </p>
                        <p>
                          <span className="block text-gray-500">EQD2₂</span>
                          {format(course.bed2)} ÷ (1 + 2 ÷ 2) ={" "}
                          <strong>{format(course.eqd2)} Gy</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-bold text-gray-950">
                    Three independent dose rules
                  </h3>
                  <div className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {budget.rules.map((rule) => {
                      const binds = budget.bindingRuleIds.includes(rule.id);
                      return (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between gap-4 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-950">
                              {rule.label}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {rule.id === "cumulative"
                                ? `${budget.cumulativeCeiling} − ${format(budget.priorEQD2)}`
                                : rule.explanation}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="tabular-nums text-lg font-bold text-gray-950">
                              {format(rule.maximumNewCourseEQD2)} Gy
                            </p>
                            <p
                              className={`text-xs font-semibold ${
                                binds
                                  ? "text-blue-700"
                                  : "text-gray-400"
                              }`}
                            >
                              {binds ? "Binding limit" : "Not limiting"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-blue-950">
                  <p className="font-bold">Final conversion</p>
                  <p className="mt-1">
                    Minimum of the three rules ={" "}
                    {format(budget.allowableNewCourseEQD2)} Gy EQD2₂.
                    Solving EQD2 = D × (D/{plannedFx} + 2) ÷ 4 gives{" "}
                    <strong>
                      {format(physicalLimit)} Gy total in {plannedFx}{" "}
                      fractions
                    </strong>
                    .
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    Framework: {selectedFramework.label}
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    No recovery credit
                  </span>
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                    Prior EQD2₂: {format(budget.priorEQD2)} Gy
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowResult(false)}
                className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Change inputs
              </button>
              <button
                type="button"
                onClick={startOver}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Start over
              </button>
            </div>
          </section>
        )
      )}

      <section className="space-y-3 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-950">
          Planning references
        </h2>
        <p className="text-sm text-gray-600">
          Open these only when needed. They are kept out of the calculation
          path to reduce visual load.
        </p>

        <details className="rounded-xl border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-gray-950">
            MD Anderson target regimens
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MDACC_RERT_REGIMENS.map((regimen) => (
              <div
                key={regimen.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-bold text-gray-950">
                  {regimen.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {regimen.scenario}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-gray-600">
            These are target prescriptions, not cord constraints. A regimen
            is viable only if the case-specific neural and adjacent OAR limits
            are met.
          </p>
        </details>

        <details className="rounded-xl border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-gray-950">
            Service-template neural checkpoints
          </summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {MDACC_RERT_SERVICE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-bold text-gray-950">
                  {template.name}
                </p>
                <div className="mt-2 space-y-1.5">
                  {template.oars
                    .filter((oar) =>
                      /spinal cord|cauda equina/i.test(oar.organ),
                    )
                    .slice(0, 2)
                    .map((oar) => (
                      <p
                        key={oar.organ}
                        className="text-xs leading-relaxed text-gray-600"
                      >
                        <strong>{oar.organ}:</strong> {oar.constraint}
                      </p>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/lived-experience"
            className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
          >
            Open the full OAR and evidence reference
          </Link>
        </details>

        <details className="rounded-xl border border-gray-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-bold text-gray-950">
            Evidence, scope, and limitations
          </summary>
          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-gray-600">
            <li>
              Cord and thecal sac calculations use α/β = 2 Gy and the
              linear-quadratic model. LQ estimates at high dose per fraction
              remain approximations.
            </li>
            <li>
              The published lower-risk factors are cumulative thecal sac
              EQD2₂ Dmax ≤70 Gy, new-course EQD2₂ Dmax ≤25 Gy,
              new-course/cumulative ratio ≤0.5, and interval ≥5 months.
            </li>
            <li>
              Spine Hub applies no recovery credit. Registration, contouring,
              dose reconstruction, and fractionation modeling introduce
              additional uncertainty.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            {["sahgal-2021", "bahouth-2023", "gales-2023"].map((id) => {
              const reference = SPINE_REFERENCES.find(
                (item) => item.id === id,
              );
              if (!reference) return null;
              return (
                <a
                  key={id}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  {reference.short}
                </a>
              );
            })}
          </div>
        </details>
      </section>

      <RelatedTools current="/dose-budget" />
    </div>
  );
}
