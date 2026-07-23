"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";
import {
  FRACTIONATION_OPTIONS,
  OAR_BUDGET_PROFILES,
  REGION_PRESETS,
  SPINE_REGIMEN_OPTIONS,
} from "@/lib/oarBudgetData";
import {
  calculateOARBudget,
  calculateRegimenRadiobiology,
  evaluateCandidateOARDose,
} from "@/lib/spineDoseBudget";
import { MDACC_RERT_SERVICE_TEMPLATES } from "@/lib/spineClinicalData";

type InputMode = "actual" | "prescription";
type ResultView = "clinical" | "proof";

interface PriorCourseInput {
  fractions: string;
  months: string;
  prescriptionDose: string;
  oarDoses: Record<string, string>;
}

const emptyCourse = (): PriorCourseInput => ({
  fractions: "",
  months: "",
  prescriptionDose: "",
  oarDoses: {},
});

const round = (value: number, digits = 1) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const format = (value: number, digits = 1) =>
  round(value, digits).toFixed(digits);

export default function DoseBudgetPage() {
  const [selectedOARIds, setSelectedOARIds] = useState<string[]>([
    "spinal-cord",
  ]);
  const [courses, setCourses] = useState<PriorCourseInput[]>([
    emptyCourse(),
  ]);
  const [inputMode, setInputMode] = useState<InputMode>("actual");
  const [ceilings, setCeilings] = useState<Record<string, string>>({});
  const [resultView, setResultView] =
    useState<ResultView>("clinical");
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [selectedRegimenId, setSelectedRegimenId] = useState("");
  const [candidateOARDoses, setCandidateOARDoses] = useState<
    Record<string, string>
  >({});

  const selectedProfiles = useMemo(
    () =>
      selectedOARIds.flatMap((id) => {
        const profile = OAR_BUDGET_PROFILES.find(
          (item) => item.id === id,
        );
        return profile ? [profile] : [];
      }),
    [selectedOARIds],
  );

  const results = useMemo(
    () =>
      selectedProfiles.flatMap((profile) => {
        const priorCourses = courses.flatMap((course) => {
          const totalDose = Number(
            inputMode === "actual"
              ? course.oarDoses[profile.id]
              : course.prescriptionDose,
          );
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
        });
        if (!priorCourses.length) return [];
        return [
          calculateOARBudget({
            profile,
            priorCourses,
            ceilingEQD2: Number(ceilings[profile.id]) || undefined,
          }),
        ];
      }),
    [ceilings, courses, inputMode, selectedProfiles],
  );

  const regimenRows = useMemo(
    () =>
      SPINE_REGIMEN_OPTIONS.map((regimen) => ({
        ...regimen,
        radiobiology: calculateRegimenRadiobiology(
          regimen.gtvDose,
          regimen.electiveDose,
          regimen.fractions,
        ),
      })).sort((a, b) => {
        if (a.priorRT !== b.priorRT) return a.priorRT ? -1 : 1;
        return b.radiobiology.gtvBED10 - a.radiobiology.gtvBED10;
      }),
    [],
  );

  const selectedRegimen = regimenRows.find(
    (regimen) => regimen.id === selectedRegimenId,
  );
  const candidateChecks = useMemo(() => {
    if (!selectedRegimen) return [];
    return results.map((result) => {
      const physicalDose = Number(
        candidateOARDoses[result.profile.id],
      );
      const entered = physicalDose > 0;
      const evaluation = entered
        ? evaluateCandidateOARDose(
            result,
            physicalDose,
            selectedRegimen.fractions,
          )
        : null;
      return {
        result,
        entered,
        physicalDose,
        newEQD2: evaluation?.newCourseEQD2 ?? 0,
        cumulativeEQD2: evaluation?.cumulativeEQD2 ?? result.priorEQD2,
        passes: evaluation?.passes ?? false,
      };
    });
  }, [candidateOARDoses, results, selectedRegimen]);
  const allCandidateDosesEntered =
    candidateChecks.length > 0 &&
    candidateChecks.every((check) => check.entered);
  const candidatePasses =
    allCandidateDosesEntered &&
    candidateChecks.every((check) => check.passes);
  const hasRecentCourse = results.some(
    (result) => result.intervalUnderSixMonths,
  );

  const toggleOAR = (id: string) => {
    setSelectedOARIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const applyPreset = (oarIds: string[]) => {
    setSelectedOARIds(oarIds);
    setSelectedRegimenId("");
    setCandidateOARDoses({});
  };

  const updateCourse = (
    index: number,
    field: "fractions" | "months" | "prescriptionDose",
    value: string,
  ) => {
    setCourses((current) =>
      current.map((course, courseIndex) =>
        courseIndex === index ? { ...course, [field]: value } : course,
      ),
    );
  };

  const updateOARDose = (
    courseIndex: number,
    oarId: string,
    value: string,
  ) => {
    setCourses((current) =>
      current.map((course, index) =>
        index === courseIndex
          ? {
              ...course,
              oarDoses: { ...course.oarDoses, [oarId]: value },
            }
          : course,
      ),
    );
  };

  const loadExample = () => {
    setSelectedOARIds([
      "spinal-cord",
      "esophagus",
      "heart",
      "lungs",
    ]);
    setInputMode("actual");
    setCourses([
      {
        fractions: "10",
        months: "12",
        prescriptionDose: "",
        oarDoses: {
          "spinal-cord": "24",
          esophagus: "18",
          heart: "8",
          lungs: "6",
        },
      },
    ]);
    setShowWalkthrough(false);
    setSelectedRegimenId("");
    setCandidateOARDoses({});
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <section className="pt-2">
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          ← Spine Hub
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Reirradiation planning workspace
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Start with the prior dose. Then compare regimens.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
              Add the relevant organs and their prior delivered doses. Spine
              Hub calculates the remaining EQD2 budget, reverses it across
              1, 3, 5, and 10 fractions, and places the MD Anderson regimens
              beside those limits for planning review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowWalkthrough((current) => !current)}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400"
          >
            {showWalkthrough ? "Close guide" : "How this works"}
          </button>
        </div>
      </section>

      {showWalkthrough && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Four steps, in clinical order
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                <li>
                  <strong className="text-slate-900">1.</strong> Choose the
                  anatomic level to load the OARs that commonly matter.
                </li>
                <li>
                  <strong className="text-slate-900">2.</strong> Enter each
                  prior OAR dose using the same DVH metric shown in the row.
                </li>
                <li>
                  <strong className="text-slate-900">3.</strong> Compare the
                  reverse-calculated physical room across fractionations and
                  review target BED.
                </li>
                <li>
                  <strong className="text-slate-900">4.</strong> Select a
                  regimen and enter the anticipated new-plan OAR doses to
                  proof-check the composite budget.
                </li>
              </ol>
            </div>
            <button
              type="button"
              onClick={loadExample}
              className="shrink-0 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Load thoracic example
            </button>
          </div>
          <p className="mt-4 border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
            The calculator does not apply recovery credit or a separate
            new-course cap. It subtracts summed prior EQD2 from the selected
            working ceiling for each organ.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            1 · Choose anatomy and OARs
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Where is the target?
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {REGION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.oarIds)}
                className="rounded-xl border border-slate-200 p-3 text-left hover:border-blue-400 hover:bg-blue-50/40"
              >
                <span className="block text-sm font-bold text-slate-900">
                  {preset.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {preset.helper}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">
              Included organs
            </p>
            <span className="text-xs text-slate-500">
              {selectedOARIds.length} selected
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {OAR_BUDGET_PROFILES.map((profile) => {
              const active = selectedOARIds.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleOAR(profile.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {profile.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            2 · Enter prior treatment
          </p>
          <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                What did each organ receive?
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Use actual DVH values whenever the prior plan is available.
              </p>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {[
                { value: "actual" as InputMode, label: "Actual OAR dose" },
                {
                  value: "prescription" as InputMode,
                  label: "Prescription surrogate",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setInputMode(option.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    inputMode === option.value
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {inputMode === "prescription" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              The target prescription will be assigned to every selected OAR
              as a deliberately conservative surrogate. This does not
              represent the delivered OAR dose. Replace it with reconstructed
              DVH values before clinical use.
            </div>
          )}

          {courses.map((course, courseIndex) => (
            <div
              key={courseIndex}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-950">
                  Prior course {courseIndex + 1}
                </p>
                {courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setCourses((current) =>
                        current.filter(
                          (_, index) => index !== courseIndex,
                        ),
                      )
                    }
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm font-medium text-slate-800">
                  Fractions
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={course.fractions}
                    onChange={(event) =>
                      updateCourse(
                        courseIndex,
                        "fractions",
                        event.target.value,
                      )
                    }
                    placeholder="10"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-800">
                  Months since treatment
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.1"
                    value={course.months}
                    onChange={(event) =>
                      updateCourse(
                        courseIndex,
                        "months",
                        event.target.value,
                      )
                    }
                    placeholder="12"
                    className="rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                </label>
                {inputMode === "prescription" && (
                  <label className="grid gap-1.5 text-sm font-medium text-slate-800">
                    Prescription dose (Gy)
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.1"
                      value={course.prescriptionDose}
                      onChange={(event) =>
                        updateCourse(
                          courseIndex,
                          "prescriptionDose",
                          event.target.value,
                        )
                      }
                      placeholder="30"
                      className="rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </label>
                )}
              </div>

              {inputMode === "actual" && (
                <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {selectedProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="grid gap-3 p-3 sm:grid-cols-[1fr_11rem] sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {profile.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Enter {profile.metric}
                        </p>
                      </div>
                      <label className="relative">
                        <span className="sr-only">
                          {profile.name} total dose
                        </span>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={course.oarDoses[profile.id] ?? ""}
                          onChange={(event) =>
                            updateOARDose(
                              courseIndex,
                              profile.id,
                              event.target.value,
                            )
                          }
                          placeholder="Dose"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-base outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">
                          Gy
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

          <details className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              Review or edit working cumulative ceilings
            </summary>
            <div className="mt-4 divide-y divide-slate-200">
              {selectedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_9rem] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      α/β {profile.alphaBeta} Gy · {profile.ceilingNote}
                    </p>
                  </div>
                  <label className="relative">
                    <span className="sr-only">
                      {profile.name} working ceiling
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0.1"
                      step="0.1"
                      value={
                        ceilings[profile.id] ??
                        String(profile.workingCeilingEQD2)
                      }
                      onChange={(event) =>
                        setCeilings((current) => ({
                          ...current,
                          [profile.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-12 text-sm"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">
                      EQD2
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      {hasRecentCourse && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
          <strong>Interval caution:</strong> at least one entered course was
          delivered less than 6 months ago. Spine Hub does not change the
          budget or apply recovery credit, but the short interval should be
          reviewed explicitly.
        </section>
      )}

      {results.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3 · Compare remaining room
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Reverse-calculated OAR limits
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
                These are the physical doses that equal each organ&apos;s
                remaining EQD2 budget. They are not target prescriptions and
                do not replace the regimen-specific volume constraints.
              </p>
            </div>
            <div className="flex w-fit rounded-lg bg-slate-100 p-1">
              {[
                { value: "clinical" as ResultView, label: "Clinical view" },
                { value: "proof" as ResultView, label: "Proof check" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResultView(option.value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    resultView === option.value
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {resultView === "clinical" ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {results.map((result) => (
                  <article
                    key={result.profile.id}
                    className="rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-950">
                          {result.profile.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {result.profile.metric}
                        </p>
                      </div>
                      <p className="text-right">
                        <span className="block text-2xl font-bold tabular-nums text-slate-950">
                          {format(result.remainingEQD2)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Gy EQD2 remaining
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{ width: `${result.percentUsed}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>
                        Prior {format(result.priorEQD2)} Gy EQD2
                      </span>
                      <span>
                        Ceiling {format(result.ceilingEQD2)} Gy
                      </span>
                    </div>
                    <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">
                      {result.profile.planningTip}
                    </p>
                  </article>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700">
                        New course
                      </th>
                      {results.map((result) => (
                        <th
                          key={result.profile.id}
                          className="px-4 py-3 font-semibold text-slate-700"
                        >
                          {result.profile.name}
                          <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                            Max physical {result.profile.metric}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {FRACTIONATION_OPTIONS.map((fractions) => (
                      <tr key={fractions}>
                        <td className="px-4 py-3 font-bold text-slate-950">
                          {fractions} fraction
                          {fractions > 1 ? "s" : ""}
                        </td>
                        {results.map((result) => {
                          const physical =
                            result.physicalByFractions.find(
                              (item) => item.fractions === fractions,
                            );
                          return (
                            <td
                              key={result.profile.id}
                              className="px-4 py-3 tabular-nums text-slate-700"
                            >
                              <strong className="text-slate-950">
                                {physical
                                  ? format(physical.totalDose)
                                  : "—"}{" "}
                                Gy
                              </strong>
                              <span className="mt-0.5 block text-xs text-slate-400">
                                {physical
                                  ? `${format(
                                      physical.dosePerFraction,
                                      2,
                                    )} Gy/fx`
                                  : ""}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <details
                  key={result.profile.id}
                  open={results.length === 1}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <summary className="cursor-pointer text-sm font-bold text-slate-950">
                    {result.profile.name}: calculation audit
                  </summary>
                  <div className="mt-4 space-y-3">
                    {result.courses.map((course, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700"
                      >
                        <p className="font-bold text-slate-950">
                          Course {index + 1}:{" "}
                          {format(course.totalDose)} Gy in{" "}
                          {course.fractions} fx
                        </p>
                        <p className="mt-1">
                          d = {format(course.totalDose)} ÷{" "}
                          {course.fractions} ={" "}
                          {format(course.dosePerFraction, 2)} Gy/fx
                        </p>
                        <p>
                          BED = D × [1 + d/(α/β)] ={" "}
                          {format(course.bed)} Gy
                        </p>
                        <p>
                          EQD2 = BED ÷ [1 + 2/(α/β)] ={" "}
                          {format(course.eqd2)} Gy
                        </p>
                      </div>
                    ))}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                      {format(result.ceilingEQD2)} Gy ceiling −{" "}
                      {format(result.priorEQD2)} Gy prior EQD2 ={" "}
                      <strong>
                        {format(result.remainingEQD2)} Gy EQD2 remaining
                      </strong>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              4 · Compare target BED, then test a plan
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Regimen comparison
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
              Prior-RT regimens are listed first and ranked by GTV BED₁₀.
              Higher BED is not automatically safer or deliverable. Select a
              row to compare anticipated new-plan OAR doses with the
              reverse-calculated room above.
            </p>
          </div>

          <div className="grid gap-3">
            {regimenRows.map((regimen, index) => {
              const selected = selectedRegimenId === regimen.id;
              const matchingTemplate =
                MDACC_RERT_SERVICE_TEMPLATES.find((template) =>
                  template.name.includes(
                    `${regimen.gtvDose}/${regimen.electiveDose}`,
                  ),
                ) ??
                MDACC_RERT_SERVICE_TEMPLATES.find((template) =>
                  template.name.includes(
                    `${regimen.gtvDose}/${regimen.electiveDose} Gy`,
                  ),
                );
              return (
                <article
                  key={regimen.id}
                  className={`rounded-xl border bg-white ${
                    selected
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegimenId(
                        selected ? "" : regimen.id,
                      );
                      setCandidateOARDoses({});
                    }}
                    className="grid w-full gap-4 p-4 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-950">
                          {regimen.label}
                        </h3>
                        {index === 0 && regimen.priorRT && (
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Highest BED prior-RT candidate
                          </span>
                        )}
                        {!regimen.priorRT && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Primarily RT-naive
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {regimen.intensity}. {regimen.practicalTip}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        GTV BED₁₀
                      </p>
                      <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-950">
                        {format(regimen.radiobiology.gtvBED10)} Gy
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-blue-700">
                      {selected ? "Close check" : "Test this plan"}
                    </span>
                  </button>

                  {selected && (
                    <div className="border-t border-slate-200 p-4 sm:p-5">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">
                            Enter anticipated new-plan OAR doses
                          </h4>
                          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                            Use the same metric as the prior dose and working
                            ceiling. Passing this arithmetic check does not
                            replace registration, composite dose review, or
                            the service-template volume constraints.
                          </p>
                        </div>
                        {allCandidateDosesEntered && (
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                              candidatePasses
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {candidatePasses
                              ? "Within entered budgets"
                              : "Exceeds an entered budget"}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {candidateChecks.map((check) => {
                          const allowance =
                            check.result.physicalByFractions.find(
                              (item) =>
                                item.fractions === regimen.fractions,
                            );
                          return (
                            <div
                              key={check.result.profile.id}
                              className="grid gap-3 p-3 sm:grid-cols-[1fr_10rem_9rem] sm:items-center"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {check.result.profile.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Allowable physical{" "}
                                  {check.result.profile.metric}:{" "}
                                  <strong>
                                    {allowance
                                      ? format(allowance.totalDose)
                                      : "—"}{" "}
                                    Gy
                                  </strong>
                                </p>
                              </div>
                              <label className="relative">
                                <span className="sr-only">
                                  Anticipated{" "}
                                  {check.result.profile.name} dose
                                </span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.1"
                                  value={
                                    candidateOARDoses[
                                      check.result.profile.id
                                    ] ?? ""
                                  }
                                  onChange={(event) =>
                                    setCandidateOARDoses((current) => ({
                                      ...current,
                                      [check.result.profile.id]:
                                        event.target.value,
                                    }))
                                  }
                                  placeholder="Plan dose"
                                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm"
                                />
                                <span className="absolute right-3 top-2 text-xs text-slate-400">
                                  Gy
                                </span>
                              </label>
                              <p
                                className={`text-xs font-bold ${
                                  !check.entered
                                    ? "text-slate-400"
                                    : check.passes
                                      ? "text-emerald-700"
                                      : "text-red-700"
                                }`}
                              >
                                {!check.entered
                                  ? "Not entered"
                                  : check.passes
                                    ? "Within budget"
                                    : `Over by ${format(
                                        check.newEQD2 -
                                          check.result.remainingEQD2,
                                      )} Gy EQD2`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {matchingTemplate && (
                        <details className="mt-4 rounded-lg bg-slate-50 p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-800">
                            Practical service-template checkpoints
                          </summary>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {matchingTemplate.oars.map((oar) => (
                              <p
                                key={oar.organ}
                                className="text-xs leading-relaxed text-slate-600"
                              >
                                <strong className="text-slate-900">
                                  {oar.organ}:
                                </strong>{" "}
                                {oar.constraint}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-950">
          Practical reminders
        </h2>
        <div className="mt-3 grid gap-3 text-xs leading-relaxed text-slate-600 sm:grid-cols-2">
          <p>
            <strong className="text-slate-900">Match the endpoint.</strong>{" "}
            Do not subtract a prior mean dose from a Dmax ceiling or compare a
            D0.01 cc budget with a Vx constraint.
          </p>
          <p>
            <strong className="text-slate-900">Use actual overlap.</strong>{" "}
            Review mapped dose in the overlapping anatomy, not simply the
            highest value anywhere in the historical structure.
          </p>
          <p>
            <strong className="text-slate-900">Keep volume checks.</strong>{" "}
            Bowel circumference, kidney and lung Vx, liver reserve, and
            small-volume hot spots remain separate constraints.
          </p>
          <p>
            <strong className="text-slate-900">Do not add recovery.</strong>{" "}
            Time is displayed as a caution flag only. The numeric budget is
            prior EQD2 subtracted from the selected working ceiling.
          </p>
        </div>
      </section>

      <RelatedTools current="/dose-budget" />
    </div>
  );
}
