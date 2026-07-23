"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RelatedTools } from "../components/RelatedTools";
import {
  calcBEDAndEQD2,
  eqd2ToPhysicalDose,
} from "@/lib/bedCalculations";
import {
  MDACC_OAR_PLANNING_GOALS,
  MDACC_RERT_REGIMENS,
  MDACC_RERT_SERVICE_TEMPLATES,
  SPINE_REFERENCES,
} from "@/lib/spineClinicalData";

type Framework = "reserve" | "hytec" | "mdacc";
type DoseKnowledge = "actual" | "prescription";

interface CourseInput {
  dose: string;
  fractions: string;
  months: string;
}

interface ParsedCourse {
  dose: number;
  fractions: number;
  months: number;
  bed: number;
  eqd2: number;
}

const frameworkOptions: Record<
  Framework,
  {
    name: string;
    short: string;
    ceiling: number;
    style: string;
    description: string;
  }
> = {
  reserve: {
    name: "Conservative planning reserve",
    short: "Conservative",
    ceiling: 65,
    style: "border-emerald-600 bg-emerald-600 text-white",
    description:
      "Uses a 5 Gy EQD2 planning buffer below the published 70 Gy cumulative threshold. This is a planning reserve, not a separate validated toxicity limit.",
  },
  hytec: {
    name: "Published HyTEC framework",
    short: "Published",
    ceiling: 70,
    style: "border-blue-600 bg-blue-600 text-white",
    description:
      "Uses the published lower-risk cumulative thecal sac Dmax threshold of 70 Gy EQD2₂.",
  },
  mdacc: {
    name: "MD Anderson protocol ceiling",
    short: "MDACC ceiling",
    ceiling: 72,
    style: "border-amber-600 bg-amber-600 text-white",
    description:
      "Uses the 72 Gy EQD2₂ institutional ceiling described in the Spine Hub kickoff meeting. This is not the HyTEC published threshold and requires program review.",
  },
};

const emptyCourse = (): CourseInput => ({
  dose: "",
  fractions: "",
  months: "",
});

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function BEDCalc() {
  const [dose, setDose] = useState("");
  const [fractions, setFractions] = useState("");
  const [alphaBeta, setAlphaBeta] = useState("2");

  const result = useMemo(() => {
    const parsedDose = Number(dose);
    const parsedFractions = Number(fractions);
    const parsedAlphaBeta = Number(alphaBeta);
    if (
      parsedDose <= 0 ||
      parsedFractions < 1 ||
      parsedAlphaBeta <= 0
    ) {
      return null;
    }
    return calcBEDAndEQD2(
      parsedDose,
      parsedFractions,
      parsedAlphaBeta,
    );
  }, [dose, fractions, alphaBeta]);

  return (
    <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
        Quick BED / EQD2 calculator
        <span className="text-xs font-normal text-gray-400">
          LQ model
        </span>
      </summary>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-xs font-medium text-gray-500">
          Total dose (Gy)
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={dose}
            onChange={(event) => setDose(event.target.value)}
            placeholder="30"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
        <label className="grid gap-1 text-xs font-medium text-gray-500">
          Fractions
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={fractions}
            onChange={(event) => setFractions(event.target.value)}
            placeholder="10"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
        <label className="col-span-2 grid gap-1 text-xs font-medium text-gray-500 sm:col-span-1">
          Alpha / beta (Gy)
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            value={alphaBeta}
            onChange={(event) => setAlphaBeta(event.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
      </div>
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">BED</p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {result.bed} Gy
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-600">EQD2</p>
            <p className="mt-1 text-xl font-bold text-blue-950">
              {result.eqd2} Gy
            </p>
          </div>
        </div>
      )}
    </details>
  );
}

export default function DoseBudgetPage() {
  const [framework, setFramework] = useState<Framework>("hytec");
  const [doseKnowledge, setDoseKnowledge] =
    useState<DoseKnowledge>("actual");
  const [courses, setCourses] = useState<CourseInput[]>([emptyCourse()]);
  const [candidateDose, setCandidateDose] = useState("");
  const [candidateFractions, setCandidateFractions] = useState("3");

  const parsedCourses = useMemo<ParsedCourse[]>(() => {
    return courses.flatMap((course) => {
      const dose = Number(course.dose);
      const fractions = Number(course.fractions);
      const months = Number(course.months);
      if (dose <= 0 || fractions < 1 || months < 0) return [];
      const result = calcBEDAndEQD2(dose, fractions, 2);
      return [
        {
          dose,
          fractions,
          months,
          bed: result.bed,
          eqd2: result.eqd2,
        },
      ];
    });
  }, [courses]);

  const result = useMemo(() => {
    if (parsedCourses.length === 0) return null;

    const priorEQD2 = round(
      parsedCourses.reduce((sum, course) => sum + course.eqd2, 0),
    );
    const ceiling = frameworkOptions[framework].ceiling;
    const cumulativeRoom = round(Math.max(0, ceiling - priorEQD2));
    const newCourseCap = 25;
    const ratioCap = priorEQD2;
    const allowableNewCourseEQD2 = round(
      Math.max(0, Math.min(cumulativeRoom, newCourseCap, ratioCap)),
    );

    const limits = [
      { label: "Cumulative ceiling", value: cumulativeRoom },
      { label: "New-course HyTEC cap", value: newCourseCap },
      { label: "New/cumulative ratio cap", value: ratioCap },
    ];
    const bindingValue = Math.min(...limits.map((limit) => limit.value));
    const bindingLimits = limits
      .filter((limit) => Math.abs(limit.value - bindingValue) < 0.05)
      .map((limit) => limit.label);

    const candidatePhysical = Number(candidateDose);
    const candidateFx = Number(candidateFractions);
    const candidate =
      candidatePhysical > 0 && candidateFx >= 1
        ? calcBEDAndEQD2(candidatePhysical, candidateFx, 2)
        : null;
    const candidateCumulative = candidate
      ? round(priorEQD2 + candidate.eqd2)
      : null;
    const candidateRatio =
      candidate && candidateCumulative && candidateCumulative > 0
        ? round(candidate.eqd2 / candidateCumulative)
        : null;
    const candidatePass =
      candidate !== null &&
      candidate.eqd2 <= allowableNewCourseEQD2 + 0.05 &&
      candidate.eqd2 <= 25.05 &&
      candidateCumulative !== null &&
      candidateCumulative <= ceiling + 0.05 &&
      candidateRatio !== null &&
      candidateRatio <= 0.5005;

    return {
      priorEQD2,
      ceiling,
      cumulativeRoom,
      allowableNewCourseEQD2,
      bindingLimits,
      timeUnderFiveMonths: parsedCourses.some((course) => course.months < 5),
      timeUnderSixMonths: parsedCourses.some(
        (course) => course.months >= 5 && course.months < 6,
      ),
      physicalByFractions: [1, 2, 3, 4, 5, 10].map((fractions) => ({
        fractions,
        dose: eqd2ToPhysicalDose(
          allowableNewCourseEQD2,
          fractions,
          2,
        ),
      })),
      candidate,
      candidateCumulative,
      candidateRatio,
      candidatePass,
    };
  }, [parsedCourses, framework, candidateDose, candidateFractions]);

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
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Neural reirradiation support
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Cord Dose Budget
          <br className="hidden sm:block" /> and ReRT Guardrails
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-gray-500">
          Calculate a spinal cord or thecal sac reirradiation Dmax budget using
          actual prior OAR dose, EQD2₂ summation, the HyTEC new-course cap, and
          the new-to-cumulative ratio. Review adjacent OAR planning goals without
          inventing unsupported lifetime tolerances.
        </p>
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-900">
          Enter the dose received by the cord or thecal sac, not the target
          prescription. If only the prescription is known, this tool treats it
          as a conservative surrogate and flags the uncertainty. The result is
          an avoidance-structure limit, never a target prescription.
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] fade-in-up fade-delay-1">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-gray-900">
              1. Choose the cumulative framework
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              No recovery credit is applied in any option.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {(Object.keys(frameworkOptions) as Framework[]).map((key) => {
                const option = frameworkOptions[key];
                const active = framework === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFramework(key)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all ${
                      active
                        ? option.style
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {option.short}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        active ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {option.ceiling} Gy EQD2₂
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              {frameworkOptions[framework].description}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-semibold text-gray-900">
              2. Enter prior overlapping cord or thecal sac dose
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
              {[
                {
                  value: "actual" as DoseKnowledge,
                  label: "Actual OAR dose",
                },
                {
                  value: "prescription" as DoseKnowledge,
                  label: "Prescription only",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDoseKnowledge(option.value)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    doseKnowledge === option.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {doseKnowledge === "prescription" && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
                The prescription is being used as a worst-case surrogate for
                neural dose. Retrieve the prior plan or reconstruct the dose
                before clinical use because this assumption can materially
                underestimate the true remaining target opportunity.
              </div>
            )}

            <div className="mt-5 space-y-3">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-700">
                      Prior course {index + 1}
                    </p>
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
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="grid gap-1 text-[11px] font-medium text-gray-500">
                      Dose (Gy)
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.1"
                        value={course.dose}
                        onChange={(event) =>
                          updateCourse(index, "dose", event.target.value)
                        }
                        placeholder="30"
                        className="min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-medium text-gray-500">
                      Fractions
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        value={course.fractions}
                        onChange={(event) =>
                          updateCourse(
                            index,
                            "fractions",
                            event.target.value,
                          )
                        }
                        placeholder="10"
                        className="min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <label className="grid gap-1 text-[11px] font-medium text-gray-500">
                      Months ago
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={course.months}
                        onChange={(event) =>
                          updateCourse(index, "months", event.target.value)
                        }
                        placeholder="12"
                        className="min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setCourses((current) => [...current, emptyCourse()])
              }
              className="mt-3 rounded-lg border border-dashed border-blue-300 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              Add prior course
            </button>
          </div>

          <BEDCalc />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {result ? (
            <div className="space-y-4">
              {(result.timeUnderFiveMonths ||
                result.timeUnderSixMonths) && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-relaxed text-red-900">
                  <span className="font-bold">
                    Short retreatment interval:
                  </span>{" "}
                  {result.timeUnderFiveMonths
                    ? "At least one course is less than 5 months old, outside the HyTEC lower-risk interval factor."
                    : "At least one course is 5 to under 6 months old. It meets the published 5-month factor but remains within the program's heightened-caution window."}
                </div>
              )}

              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Maximum new-course neural Dmax
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold text-blue-950">
                    {result.allowableNewCourseEQD2}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-blue-700">
                    Gy EQD2₂
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-blue-900">
                  Binding limit: {result.bindingLimits.join(" and ")}. This
                  value is the most restrictive of cumulative room, the 25 Gy
                  new-course cap, and the 0.50 new-to-cumulative ratio.
                </p>

                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs text-blue-800">
                    <span>Prior: {result.priorEQD2} Gy</span>
                    <span>Ceiling: {result.ceiling} Gy</span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-white">
                    <div
                      className="absolute inset-y-0 left-0 bg-gray-400"
                      style={{
                        width: `${Math.min(
                          100,
                          (result.priorEQD2 / result.ceiling) * 100,
                        )}%`,
                      }}
                    />
                    <div
                      className="absolute inset-y-0 bg-blue-600"
                      style={{
                        left: `${Math.min(
                          100,
                          (result.priorEQD2 / result.ceiling) * 100,
                        )}%`,
                        width: `${Math.max(
                          0,
                          Math.min(
                            100 -
                              (result.priorEQD2 / result.ceiling) * 100,
                            (result.allowableNewCourseEQD2 /
                              result.ceiling) *
                              100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-blue-700">
                    <span>Gray: prior</span>
                    <span>Blue: allowable new course</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Physical Dmax by fractionation
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  LQ conversion of the allowable EQD2₂. Compare with the
                  published example table and use the more restrictive
                  case-specific constraint.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {result.physicalByFractions.map((item) => (
                    <div
                      key={item.fractions}
                      className="rounded-lg bg-gray-50 px-3 py-3 text-center"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        {item.fractions} fx
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {item.dose} Gy
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900">
                  Check a candidate neural Dmax
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the proposed cord or thecal sac Dmax, not the target
                  prescription.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-xs font-medium text-gray-500">
                    Candidate Dmax (Gy)
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      value={candidateDose}
                      onChange={(event) =>
                        setCandidateDose(event.target.value)
                      }
                      placeholder="14.5"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-medium text-gray-500">
                    Fractions
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={candidateFractions}
                      onChange={(event) =>
                        setCandidateFractions(event.target.value)
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                </div>

                {result.candidate && (
                  <div
                    className={`mt-4 rounded-xl border p-4 ${
                      result.candidatePass
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-red-200 bg-red-50 text-red-900"
                    }`}
                  >
                    <p className="text-sm font-bold">
                      {result.candidatePass
                        ? "Within the selected dose guardrails"
                        : "Exceeds one or more selected dose guardrails"}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <span>
                        New EQD2₂
                        <strong className="block">
                          {result.candidate.eqd2} Gy
                        </strong>
                      </span>
                      <span>
                        Cumulative
                        <strong className="block">
                          {result.candidateCumulative} Gy
                        </strong>
                      </span>
                      <span>
                        New / total
                        <strong className="block">
                          {result.candidateRatio}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">
                Enter dose, fractionation, and interval for at least one prior
                course to calculate the neural reirradiation guardrails.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Regimens to evaluate against the budget
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
              These are target prescriptions, not cord constraints. A regimen
              remains viable only if a deliverable plan meets the case-specific
              neural and adjacent OAR limits.
            </p>
          </div>
          <Link
            href="/lived-experience"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open evidence details
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MDACC_RERT_REGIMENS.map((regimen) => (
            <div
              key={regimen.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-sm font-bold text-gray-900">{regimen.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {regimen.scenario}
              </p>
              <span className="mt-3 inline-block rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                {regimen.evidence}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Regimen-specific service-template checkpoints
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          These are single-course planning constraints from the supplied MD
          Anderson service directives. They do not replace the cumulative
          neural calculation above, and the more restrictive result should
          govern planning.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {MDACC_RERT_SERVICE_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-sm font-bold text-gray-900">{template.name}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-blue-700">
                {template.status}
              </p>
              <div className="mt-3 space-y-2">
                {template.oars
                  .filter((oar) =>
                    /spinal cord|cauda equina/i.test(oar.organ),
                  )
                  .slice(0, 2)
                  .map((oar) => (
                    <div
                      key={oar.organ}
                      className="rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        {oar.organ}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-900">
                        {oar.constraint}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-amber-800">
          The 5-fraction extract has blank administrative and approval fields,
          and the supplied directive set does not establish routine
          single-fraction reirradiation constraints. Review the full service
          protocol for those selected cases.
        </p>
        <Link
          href="/lived-experience"
          className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline"
        >
          Review target coverage and complete template OAR lists
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Adjacent OAR review for reirradiation
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          MD Anderson single-course planning goals are shown for orientation.
          The calculator does not create numeric lifetime budgets for these
          structures because comparable validated cumulative reirradiation
          ceilings are not available.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Structure
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  1 fraction
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  3 fractions
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  ReRT interpretation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {MDACC_OAR_PLANNING_GOALS.filter(
                (goal) => goal.organ !== "Spinal cord",
              ).map((goal) => (
                <tr key={goal.organ} className="align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {goal.organ}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {goal.oneFraction}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {goal.threeFractions}
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-gray-500">
                    {goal.reirradiation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Calculation and source notes
        </h2>
        <ul className="mt-4 space-y-2 text-xs leading-relaxed text-gray-600">
          <li>
            • Cord and thecal sac calculations use alpha/beta = 2 Gy and the
            linear-quadratic model. LQ estimates at high dose per fraction are
            an approximation.
          </li>
          <li>
            • The HyTEC lower-risk factors are cumulative EQD2₂ Dmax ≤70 Gy,
            new-course EQD2₂ Dmax ≤25 Gy, new-course/cumulative ratio ≤0.5,
            and interval ≥5 months.
          </li>
          <li>
            • The Spine Hub program elected not to apply recovery credit. A
            treatment interval under 6 months produces an alert.
          </li>
          <li>
            • Dose mapping and summation have registration, contour, and
            fractionation-model uncertainty. Review the original plans and
            anatomy whenever possible.
          </li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          {["sahgal-2021", "mackin-2026", "alongi-2026"].map((id) => {
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
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {reference.short}
              </a>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-sm font-semibold text-amber-900">
          Legacy Nieder model
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-amber-800">
          The historical Nieder score remains available as a reference but is
          not used to calculate the budget above.
        </p>
        <Link
          href="/myelopathy"
          className="mt-3 inline-block text-xs font-semibold text-amber-900 hover:underline"
        >
          Open legacy myelopathy calculator
        </Link>
      </section>

      <RelatedTools current="/dose-budget" />
    </div>
  );
}
