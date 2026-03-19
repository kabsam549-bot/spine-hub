"use client";

import { useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";

/* ── SINS Scoring Data ── */
interface SINSOption { label: string; detail?: string; value: number }
interface SINSVariable { name: string; description: string; options: SINSOption[] }

const variables: SINSVariable[] = [
  {
    name: "Location",
    description: "Spinal segment of the lesion",
    options: [
      { label: "Junctional (C0-C2, C7-T2, T11-L1, L5-S1)", value: 3 },
      { label: "Mobile (C3-C6, L2-L4)", value: 2 },
      { label: "Semi-rigid (T3-T10)", value: 1 },
      { label: "Rigid (S2-S5)", value: 0 },
    ],
  },
  {
    name: "Mechanical Pain",
    description: "Pain characteristics related to the lesion",
    options: [
      { label: "Yes", detail: "Pain with movement/loading, relieved by recumbency", value: 3 },
      { label: "Non-mechanical pain", detail: "Pain present but not movement-related", value: 1 },
      { label: "Pain-free", value: 0 },
    ],
  },
  {
    name: "Bone Lesion Quality",
    description: "Radiographic appearance of the lesion",
    options: [
      { label: "Lytic", value: 2 },
      { label: "Mixed (lytic/blastic)", value: 1 },
      { label: "Blastic", value: 0 },
    ],
  },
  {
    name: "Spinal Alignment",
    description: "Assessed on serial or upright vs. supine radiographs",
    options: [
      { label: "Subluxation/translation", value: 4 },
      { label: "De novo deformity (kyphosis/scoliosis)", value: 2 },
      { label: "Normal alignment", value: 0 },
    ],
  },
  {
    name: "Vertebral Body Collapse",
    description: "Extent of vertebral body involvement and collapse",
    options: [
      { label: ">50% collapse", value: 3 },
      { label: "<50% collapse", value: 2 },
      { label: "No collapse, >50% body involved", value: 1 },
      { label: "None of the above", value: 0 },
    ],
  },
  {
    name: "Posterolateral Involvement",
    description: "Involvement of posterior spinal elements",
    options: [
      { label: "Bilateral", detail: "Bilateral pedicle/facet/CV joint involvement", value: 3 },
      { label: "Unilateral", value: 1 },
      { label: "None", value: 0 },
    ],
  },
];

const getClassification = (score: number) => {
  if (score <= 6)
    return {
      label: "Stable",
      range: "0-6",
      color: "#16a34a",
      bg: "bg-green-50",
      border: "border-green-200",
      chip: "bg-green-100 text-green-800",
      text: "text-green-800",
      recommendation: "Surgical consultation generally not required for stability assessment. Consider radiation therapy as indicated.",
    };
  if (score <= 12)
    return {
      label: "Potentially Unstable",
      range: "7-12",
      color: "#d97706",
      bg: "bg-amber-50",
      border: "border-amber-200",
      chip: "bg-amber-100 text-amber-800",
      text: "text-amber-800",
      recommendation: "Surgical consultation recommended for stability evaluation. May benefit from stabilization prior to or concurrent with radiation therapy.",
    };
  return {
    label: "Unstable",
    range: "13-18",
    color: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    chip: "bg-red-100 text-red-800",
    text: "text-red-800",
    recommendation: "Surgical stabilization recommended. Refer to spine surgery for evaluation and intervention.",
  };
};

export default function SINSPage() {
  const [selections, setSelections] = useState<(number | null)[]>(variables.map(() => null));

  const score = useMemo(() => {
    if (selections.some((s) => s === null)) return null;
    return selections.reduce((sum, s) => sum! + s!, 0);
  }, [selections]);

  const classification = score !== null ? getClassification(score) : null;

  const breakdown = variables.map((v, i) => ({
    name: v.name,
    selected: selections[i] !== null ? v.options.find((o) => o.value === selections[i])?.label ?? "" : "Not selected",
    value: selections[i],
  }));

  const allSelected = selections.every((s) => s !== null);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Stability Assessment
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spinal Instability<br className="hidden sm:block" /> Neoplastic Score
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          The SINS evaluates spinal instability in patients with neoplastic disease using six variables (one clinical, five radiographic), stratifying patients into stable, potentially unstable, and unstable categories to guide surgical referral.
        </p>
      </section>

      {/* Calculator */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] fade-in-up fade-delay-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Calculator</h2>
          <p className="mt-1 text-sm text-gray-500">Select one option for each variable. Score: 0-18.</p>

          <div className="mt-6 space-y-6">
            {variables.map((v, vi) => (
              <div key={v.name} className="grid gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">{v.name}</label>
                  <p className="text-xs text-gray-400">{v.description}</p>
                </div>
                <div className="space-y-1.5">
                  {v.options.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelections((prev) => prev.map((s, i) => (i === vi ? opt.value : s)))}
                      className={`w-full text-left rounded-lg border px-4 py-2.5 text-sm transition-all ${
                        selections[vi] === opt.value
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{opt.label}</span>
                      {opt.detail && (
                        <span className={`block text-xs mt-0.5 ${selections[vi] === opt.value ? "text-blue-100" : "text-gray-400"}`}>
                          {opt.detail}
                        </span>
                      )}
                      <span className={`float-right text-xs font-bold ${selections[vi] === opt.value ? "text-white" : "text-gray-400"}`}>
                        +{opt.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-6">
          {allSelected && classification ? (
            <>
              <div className={`rounded-2xl border ${classification.border} ${classification.bg} p-6 sm:p-8 shadow-sm transition-all`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">SINS Score</p>
                    <div className="mt-2 text-5xl font-bold" style={{ color: classification.color }}>
                      {score}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classification.chip}`}>
                        {classification.label}
                      </span>
                      <span className={`text-xs ${classification.text}`}>{classification.range} range</span>
                    </div>
                  </div>
                  <div className="h-16 w-2 rounded-full" style={{ backgroundColor: classification.color }} />
                </div>
                <p className={`mt-4 text-sm ${classification.text}`}>{classification.recommendation}</p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Score Breakdown</h3>
                <div className="mt-3 space-y-2">
                  {breakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                      <div>
                        <p className="text-gray-800 font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.selected}</p>
                      </div>
                      <div className={`text-sm font-bold tabular-nums ${item.value! > 0 ? "text-blue-600" : "text-gray-400"}`}>
                        +{item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-400">
                Select all six variables to calculate the SINS score.
                <br />
                <span className="text-xs">{selections.filter((s) => s !== null).length}/6 selected</span>
              </p>
            </div>
          )}

          {/* Scoring reference */}
          <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 flex items-center justify-between">
              Classification Reference
              <svg className="h-4 w-4 text-gray-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between bg-green-50 rounded px-3 py-2"><span className="text-green-800">0-6: Stable</span><span className="text-green-700">No surgical referral needed</span></div>
              <div className="flex justify-between bg-amber-50 rounded px-3 py-2"><span className="text-amber-800">7-12: Potentially Unstable</span><span className="text-amber-700">Surgical consultation recommended</span></div>
              <div className="flex justify-between bg-red-50 rounded px-3 py-2"><span className="text-red-800">13-18: Unstable</span><span className="text-red-700">Surgical stabilization recommended</span></div>
            </div>
          </details>
        </div>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up fade-delay-2">
        <h2 className="text-xl font-semibold text-gray-900">About SINS</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            The Spinal Instability Neoplastic Score (SINS) was developed by the Spine Oncology Study Group in 2010 to standardize the assessment of spinal instability in patients with neoplastic disease. It incorporates six components: location, mechanical pain, bone lesion quality, spinal alignment, vertebral body collapse, and posterolateral element involvement.
          </p>
          <p>
            The total score ranges from 0 to 18 and stratifies patients into three categories. Patients scoring 7 or higher warrant surgical consultation for stability evaluation, while those scoring 0-6 generally do not require referral for instability assessment alone. Interrater reliability has been demonstrated as good to near-perfect (ICC 0.55-0.99).
          </p>
          <h3 className="text-base font-semibold text-gray-800 pt-2">References</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-500">
            <li>Fisher CG, DiPaola CP, Ryken TC, et al. A novel classification system for spinal instability in neoplastic disease. <span className="italic">Spine.</span> 2010;35:E1221-1229.</li>
            <li>Fourney DR, Frangou EM, Ryken TC, et al. Spinal instability neoplastic score: an analysis of reliability and validity. <span className="italic">J Clin Oncol.</span> 2011;29(22):3072-3077.</li>
          </ol>
        </div>
      </section>

      <RelatedTools current="/sins" />
    </div>
  );
}
