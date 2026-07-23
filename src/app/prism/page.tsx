"use client";

import { useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";

type Sex = "male" | "female";
type Kps = 50 | 60 | 70 | 80 | 90 | 100;

interface PRISMInput {
  sex: Sex;
  kps: Kps;
  priorSurgery: boolean;
  priorRadiation: boolean;
  organSystemsWithMets: number;
  solitaryMetastasis: boolean;
  timeDxToMet5Years: boolean;
}

const DEFAULT_INPUT: PRISMInput = {
  sex: "male",
  kps: 80,
  priorSurgery: false,
  priorRadiation: false,
  organSystemsWithMets: 0,
  solitaryMetastasis: false,
  timeDxToMet5Years: false,
};

const componentRows = [
  { variable: "Female sex", score: "+2" },
  { variable: "Karnofsky Performance Status", score: "+1 per 10 points over 60" },
  { variable: "Previous surgery at the SSRS site", score: "+2" },
  { variable: "Previous radiation at the SSRS site", score: "\u22122" },
  { variable: "Other organ systems with metastasis, excluding bone", score: "\u22121 per system" },
  { variable: "SSRS for a solitary metastasis", score: "+3" },
  { variable: "Diagnosis-to-metastasis interval >5 years", score: "+3" },
];

const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));

const scoreFromInput = (i: PRISMInput) => {
  let s = 0;
  if (i.sex === "female") s += 2;
  s += Math.max(0, (i.kps - 60) / 10);
  if (i.priorSurgery) s += 2;
  if (i.priorRadiation) s -= 2;
  s -= i.organSystemsWithMets;
  if (i.solitaryMetastasis) s += 3;
  if (i.timeDxToMet5Years) s += 3;
  return s;
};

const groupFromScore = (score: number) => {
  if (score > 7) return { 
    group: "Group 1", 
    prognosis: "Excellent", 
    derivationSurvival: "Not reached",
    validationSurvival: "Not reached",
    externalSurvival: "57.1 months",
    color: "#16a34a", 
    bg: "bg-green-50", 
    border: "border-green-200", 
    text: "text-green-800", 
    chip: "bg-green-100 text-green-800" 
  };
  if (score >= 4) return { 
    group: "Group 2", 
    prognosis: "Good", 
    derivationSurvival: "32.4 months",
    validationSurvival: "24.1 months",
    externalSurvival: "37.0 months",
    color: "#ca8a04", 
    bg: "bg-yellow-50", 
    border: "border-yellow-200", 
    text: "text-yellow-800", 
    chip: "bg-yellow-100 text-yellow-800" 
  };
  if (score >= 1) return { 
    group: "Group 3", 
    prognosis: "Intermediate", 
    derivationSurvival: "22.2 months",
    validationSurvival: "13.1 months",
    externalSurvival: "23.7 months",
    color: "#ea580c", 
    bg: "bg-orange-50", 
    border: "border-orange-200", 
    text: "text-orange-800", 
    chip: "bg-orange-100 text-orange-800" 
  };
  return { 
    group: "Group 4", 
    prognosis: "Poor", 
    derivationSurvival: "9.1 months",
    validationSurvival: "6.5 months",
    externalSurvival: "8.8 months",
    color: "#dc2626", 
    bg: "bg-red-50", 
    border: "border-red-200", 
    text: "text-red-800", 
    chip: "bg-red-100 text-red-800" 
  };
};

const contributionsFromInput = (i: PRISMInput) => [
  { label: "Sex", detail: i.sex === "female" ? "Female" : "Male", value: i.sex === "female" ? 2 : 0 },
  { label: "KPS", detail: `${i.kps}`, value: Math.max(0, (i.kps - 60) / 10) },
  { label: "Prior surgery", detail: i.priorSurgery ? "Yes" : "No", value: i.priorSurgery ? 2 : 0 },
  { label: "Prior radiation", detail: i.priorRadiation ? "Yes" : "No", value: i.priorRadiation ? -2 : 0 },
  { label: "Other organ systems with metastasis", detail: `${i.organSystemsWithMets}`, value: -i.organSystemsWithMets },
  { label: "SSRS for solitary metastasis", detail: i.solitaryMetastasis ? "Yes" : "No", value: i.solitaryMetastasis ? 3 : 0 },
  { label: "Time from dx to met >5 years", detail: i.timeDxToMet5Years ? "Yes" : "No", value: i.timeDxToMet5Years ? 3 : 0 },
];

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        {([true, false] as const).map((option) => (
          <button
            key={option ? "y" : "n"}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
              value === option
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {option ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PRISMPage() {
  const [input, setInput] = useState<PRISMInput>(DEFAULT_INPUT);
  const [warning, setWarning] = useState<string | null>(null);

  const score = useMemo(() => scoreFromInput(input), [input]);
  const group = useMemo(() => groupFromScore(score), [score]);
  const breakdown = useMemo(() => contributionsFromInput(input), [input]);

  const handleOrganChange = (value: number) => {
    const clamped = Math.max(0, Math.floor(Number.isNaN(value) ? 0 : value));
    if (input.solitaryMetastasis && clamped > 0) {
      setWarning("A solitary metastasis requires 0 other organ systems. It has been deselected.");
      setInput((p) => ({ ...p, organSystemsWithMets: clamped, solitaryMetastasis: false }));
      return;
    }
    setWarning(null);
    setInput((p) => ({ ...p, organSystemsWithMets: clamped }));
  };

  const handleSolitaryChange = (checked: boolean) => {
    if (checked && input.organSystemsWithMets > 0) {
      setWarning("A solitary metastasis requires 0 other organ systems. The organ count has been reset to 0.");
      setInput((p) => ({ ...p, solitaryMetastasis: true, organSystemsWithMets: 0 }));
      return;
    }
    setWarning(null);
    setInput((p) => ({ ...p, solitaryMetastasis: checked }));
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Clinical Calculator
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Prognostic Index for<br className="hidden sm:block" /> Spinal Metastases
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          A validated composite scoring system for stratifying survival in patients treated with spinal stereotactic radiosurgery, integrating performance status, disease burden, and treatment history into four prognostic groups.
        </p>
      </section>

      {/* Calculator */}
      <section id="calculator" className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] fade-in-up fade-delay-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Calculator</h2>
          <p className="mt-1 text-sm text-gray-500">Enter clinical variables. Score updates in real time.</p>
          <div className="mt-6 grid gap-5">
            {/* Sex */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Sex</label>
              <div className="flex gap-2">
                {(["male", "female"] as Sex[]).map((o) => (
                  <button key={o} type="button" onClick={() => setInput((p) => ({ ...p, sex: o }))}
                    className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${input.sex === o ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                  >{o === "male" ? "Male" : "Female"}</button>
                ))}
              </div>
            </div>
            {/* KPS */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Karnofsky Performance Status</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {([50, 60, 70, 80, 90, 100] as Kps[]).map((v) => (
                  <button key={v} type="button" onClick={() => setInput((p) => ({ ...p, kps: v }))}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${input.kps === v ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                  >{v}</button>
                ))}
              </div>
              <p className="text-xs text-gray-400">+1 point for each 10-point increment above KPS 60.</p>
            </div>
            <Toggle label="Prior surgery at SBRT site" value={input.priorSurgery} onChange={(v) => setInput((p) => ({ ...p, priorSurgery: v }))} />
            <Toggle label="Prior radiation at SBRT site" value={input.priorRadiation} onChange={(v) => setInput((p) => ({ ...p, priorRadiation: v }))} />
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Other organ systems with metastasis (excluding bone)</label>
              <input type="number" min={0} value={input.organSystemsWithMets} onChange={(e) => handleOrganChange(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
              <p className="text-xs text-gray-400">Count distinct non-bone organ systems (lung, liver, brain, etc.).</p>
            </div>
            <Toggle label="SSRS for a solitary metastasis" value={input.solitaryMetastasis} onChange={handleSolitaryChange} />
            <Toggle label="Time from diagnosis to metastasis >5 years" value={input.timeDxToMet5Years} onChange={(v) => setInput((p) => ({ ...p, timeDxToMet5Years: v }))} />
          </div>
          {warning && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{warning}</div>}
        </div>

        {/* Results */}
        <div className="flex flex-col gap-6">
          <div className={`rounded-2xl border ${group.border} ${group.bg} p-6 sm:p-8 shadow-sm transition-all`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">PRISM Score</p>
                <div className="mt-2 text-5xl font-bold" style={{ color: group.color }}>{fmt(score)}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${group.chip}`}>{group.group}</span>
                  <span className={`text-sm font-medium ${group.text}`}>{group.prognosis} prognosis</span>
                </div>
              </div>
              <div className="h-16 w-2 rounded-full" style={{ backgroundColor: group.color }} />
            </div>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/60 border border-gray-200/50 px-4 py-3">
                <p className="text-xs text-gray-500">Derivation Median OS</p>
                <p className="text-base font-bold" style={{ color: group.color }}>{group.derivationSurvival}</p>
              </div>
              <div className="rounded-xl bg-white/60 border border-gray-200/50 px-4 py-3">
                <p className="text-xs text-gray-500">Internal Validation OS</p>
                <p className="text-base font-bold" style={{ color: group.color }}>{group.validationSurvival}</p>
              </div>
              <div className="rounded-xl bg-white/60 border border-gray-200/50 px-4 py-3">
                <p className="text-xs text-gray-500">External Validation OS</p>
                <p className="text-base font-bold" style={{ color: group.color }}>{group.externalSurvival}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
              PRISM stratifies overall survival after spine SSRS. It does not
              estimate local control. Published medians are cohort-level
              outcomes, not an individual survival prediction.
            </p>
            <div className="mt-3 rounded-xl bg-white/60 border border-gray-200/50 px-4 py-3 text-xs text-gray-500">
              Thresholds: &gt;7 (Excellent) | 4&ndash;7 (Good) | 1&ndash;3 (Intermediate) | &lt;1 (Poor)
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">Score Breakdown</h3>
            <div className="mt-3 space-y-2">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <div>
                    <p className="text-gray-800 font-medium">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.detail}</p>
                  </div>
                  <div className={`text-sm font-bold tabular-nums ${item.value > 0 ? "text-green-600" : item.value < 0 ? "text-red-500" : "text-gray-400"}`}>
                    {item.value > 0 ? `+${fmt(item.value)}` : fmt(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up fade-delay-2">
        <h2 className="text-xl font-semibold text-gray-900">About PRISM</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
          <p>PRISM (Prognostic Index for Spinal Metastases) is a prognostic scoring system for patients undergoing spinal stereotactic radiosurgery (SSRS). It combines seven readily available clinical variables into a composite score, stratifying patients into four groups with distinct survival profiles.</p>
          <p>The original MD Anderson model used KPS, not an ECOG conversion. It was internally validated in a separate single-institution cohort and externally validated in an independent contemporary cohort. The displayed median overall survival values are descriptive cohort outcomes and should not be interpreted as an individual prediction.</p>
          <h3 className="text-base font-semibold text-gray-800 pt-2">References</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-500">
            <li>Tang C, Hess K, Bishop AJ, et al. Creation of a prognostic index for spine metastasis to stratify survival in patients treated with spinal stereotactic radiosurgery. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2015;93(1):118-125. <a href="https://doi.org/10.1016/j.ijrobp.2015.04.050" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DOI</a></li>
            <li>Jensen G, Tang C, Hess KR, et al. Internal validation of the prognostic index for spine metastasis (PRISM). <span className="italic">J Radiosurg SBRT.</span> 2017;5(1):25-34. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5675505/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Full text</a></li>
            <li>Florez MA, De B, Kowalchuk R, et al. Validation of the prognostic index for spine metastasis (PRISM). <span className="italic">Radiother Oncol.</span> 2024;201:110570. <a href="https://doi.org/10.1016/j.radonc.2024.110570" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DOI</a></li>
          </ol>
        </div>
      </section>

      {/* Reference table */}
      <section id="reference" className="fade-in-up fade-delay-3">
        <details className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <summary className="cursor-pointer list-none text-base font-semibold text-gray-900 flex items-center justify-between">
            Published PRISM score components
            <svg className="h-5 w-5 text-gray-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4 font-semibold">Variable</th>
                  <th className="py-3 pr-4 font-semibold">Score contribution</th>
                </tr>
              </thead>
              <tbody>
                {componentRows.map((row, i) => (
                  <tr key={row.variable} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-3 pr-4 font-medium text-gray-800">{row.variable}</td>
                    <td className="py-3 pr-4 text-gray-600 tabular-nums">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <RelatedTools current="/prism" />
    </div>
  );
}
