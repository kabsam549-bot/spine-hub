"use client";

import { useCallback, useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";
import { OAR_DATABASE, getOARsByTier, type OARBudgetData, type ToxicityTier } from "@/lib/oarData";
import {
  calculateOARBudget,
  riskColors,
  type RiskTolerance,
  RISK_TOLERANCE_LABELS,
  type OARBudgetResult,
  type PriorCourse,
} from "@/lib/oarDoseBudget";
import { calcBEDAndEQD2, eqd2ToPhysicalDose } from "@/lib/bedCalculations";

/* ── Types ── */
interface CourseInput {
  dose: string;
  fractions: string;
  timeSinceRT: string;
}

interface OARInput {
  oar: OARBudgetData;
  courses: CourseInput[];
}

const emptyCourse = (): CourseInput => ({ dose: "", fractions: "", timeSinceRT: "" });

/* ── Quick BED/EQD2 Calculator ── */
function BEDCalc() {
  const [dose, setDose] = useState("");
  const [fx, setFx] = useState("");
  const [ab, setAb] = useState("2");

  const d = parseFloat(dose);
  const f = parseInt(fx);
  const a = parseFloat(ab);
  const result = d > 0 && f >= 1 && a > 0 ? calcBEDAndEQD2(d, f, a) : null;
  const dpf = d && f ? (d / f).toFixed(2) : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick BED / EQD2 Calculator</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Total Dose (Gy)</label>
          <input type="number" step="0.1" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="30"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Fractions</label>
          <input type="number" min="1" value={fx} onChange={(e) => setFx(e.target.value)} placeholder="5"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="grid gap-1 col-span-2 sm:col-span-1">
          <label className="text-xs font-medium text-gray-500">Alpha/Beta (Gy)</label>
          <input type="number" step="0.1" min="0" value={ab} onChange={(e) => setAb(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>
      {result && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-gray-500">BED: <span className="font-semibold text-gray-800">{result.bed} Gy</span></span>
          <span className="text-gray-500">EQD2: <span className="font-semibold text-gray-800">{result.eqd2} Gy</span></span>
          {dpf && <span className="text-gray-500">Dose/fx: <span className="font-semibold text-gray-800">{dpf} Gy</span></span>}
        </div>
      )}
    </div>
  );
}

/* ── Tier Badge ── */
const tierLabel: Record<ToxicityTier, { label: string; color: string }> = {
  1: { label: "Life-Threatening", color: "bg-red-100 text-red-700" },
  2: { label: "Critical", color: "bg-amber-100 text-amber-700" },
  3: { label: "Quality of Life", color: "bg-blue-100 text-blue-700" },
};

/* ── Main Component ── */
export default function DoseBudgetPage() {
  const [selectedOARs, setSelectedOARs] = useState<OARInput[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("medium");
  const [inputMode, setInputMode] = useState<"actual" | "prescription">("actual");

  const selectedNames = useMemo(() => new Set(selectedOARs.map((o) => o.oar.name)), [selectedOARs]);

  // Real-time calculation: compute results whenever inputs change
  const results = useMemo(() => {
    const validInputs: { oar: OARBudgetData; courses: PriorCourse[] }[] = [];

    for (const item of selectedOARs) {
      const courses: PriorCourse[] = [];
      for (const c of item.courses) {
        const dose = parseFloat(c.dose);
        const fx = parseInt(c.fractions);
        const time = parseInt(c.timeSinceRT);
        if (dose > 0 && fx >= 1 && time >= 0) {
          courses.push({
            dose,
            fractions: fx,
            timeSinceRT: time,
            isDoseToPrescription: inputMode === "prescription",
          });
        }
      }
      if (courses.length > 0) validInputs.push({ oar: item.oar, courses });
    }

    if (validInputs.length === 0) return [];

    const res = validInputs.map((v) => calculateOARBudget(v.oar, v.courses, riskTolerance));
    const riskOrder: Record<string, number> = { critical: 0, warning: 1, caution: 2, safe: 3 };
    res.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    return res;
  }, [selectedOARs, riskTolerance, inputMode]);

  // Check if any course has timeSinceRT < 6 months
  const hasRecentTreatment = results.some((r) => r.timeCaution);

  const addOAR = (oar: OARBudgetData) => {
    if (selectedNames.has(oar.name)) return;
    setSelectedOARs((prev) => [...prev, { oar, courses: [emptyCourse()] }]);
  };

  const removeOAR = (name: string) => {
    setSelectedOARs((prev) => prev.filter((o) => o.oar.name !== name));
  };

  const updateCourse = useCallback(
    (oarName: string, courseIdx: number, field: keyof CourseInput, value: string) => {
      setSelectedOARs((prev) =>
        prev.map((o) =>
          o.oar.name === oarName
            ? {
                ...o,
                courses: o.courses.map((c, i) => (i === courseIdx ? { ...c, [field]: value } : c)),
              }
            : o
        )
      );
    },
    []
  );

  const addCourse = (oarName: string) => {
    setSelectedOARs((prev) =>
      prev.map((o) => (o.oar.name === oarName ? { ...o, courses: [...o.courses, emptyCourse()] } : o))
    );
  };

  const removeCourse = (oarName: string, idx: number) => {
    setSelectedOARs((prev) =>
      prev.map((o) =>
        o.oar.name === oarName ? { ...o, courses: o.courses.filter((_, i) => i !== idx) } : o
      )
    );
  };

  const reset = () => {
    setSelectedOARs([]);
    setRiskTolerance("medium");
    setInputMode("actual");
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Dose Planning
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          OAR Dose Budget<br className="hidden sm:block" /> Calculator
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          Calculate remaining radiation dose tolerance for organs at risk during spine re-irradiation planning. Enter prior doses per organ; results update dynamically as you type.
        </p>
      </section>

      {/* BED Calculator */}
      <section className="fade-in-up fade-delay-1">
        <BEDCalc />
      </section>

      {/* Controls Row: Risk Tolerance + Input Mode */}
      <section className="flex flex-col sm:flex-row gap-4 fade-in-up fade-delay-1">
        {/* Risk Tolerance */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Risk Tolerance
          </label>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as RiskTolerance[]).map((rt) => (
              <button
                key={rt}
                onClick={() => setRiskTolerance(rt)}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                  riskTolerance === rt
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {rt.charAt(0).toUpperCase() + rt.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{RISK_TOLERANCE_LABELS[riskTolerance]}</p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            Dose Input Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode("actual")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                inputMode === "actual"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              Actual OAR Dose
            </button>
            <button
              onClick={() => setInputMode("prescription")}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                inputMode === "prescription"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              Prescription Dose
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {inputMode === "actual" ? "Enter the actual dose delivered to the OAR (from DVH)." : "Enter the prescription dose (will be used as surrogate for OAR dose)."}
          </p>
        </div>
      </section>

      {/* Recent Treatment Alert Banner */}
      {hasRecentTreatment && (
        <section className="rounded-xl border-2 border-red-400 bg-red-50 p-4 fade-in-up">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
              !
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">CAUTION: Recent Prior Treatment Detected</p>
              <p className="text-xs text-red-800">
                One or more organs received radiation within the last 6 months. Tissue recovery may be minimal. Exercise extreme caution when planning additional dose.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 fade-in-up fade-delay-1">
        <p className="font-semibold mb-2">How to use:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Select organs at risk from the list below</li>
          <li>Enter the prior dose (Gy), fractions, and time since treatment for each course</li>
          <li>Adjust risk tolerance and input mode as needed</li>
          <li>Results update automatically as you type</li>
        </ol>
      </section>

      {/* Selected OARs */}
      {selectedOARs.length > 0 && (
        <section className="space-y-4 fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Selected Organs ({selectedOARs.length})
            </h2>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
              Clear All
            </button>
          </div>

          {selectedOARs.map((item) => (
            <div key={item.oar.name} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{item.oar.name}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierLabel[item.oar.tier].color}`}>
                      Tier {item.oar.tier}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-gray-400">
                    <span>Tolerance: <span className="font-semibold text-gray-600">{item.oar.lifetimeToleranceEQD2} Gy EQD2</span></span>
                    <span>Alpha/Beta = {item.oar.alphaBeta}</span>
                  </div>
                </div>
                <button onClick={() => removeOAR(item.oar.name)}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none p-1">&times;</button>
              </div>

              {/* Course inputs */}
              {item.courses.map((course, ci) => (
                <div key={ci} className={`${ci > 0 ? "mt-3 pt-3 border-t border-gray-100" : ""}`}>
                  {ci > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-amber-600">Course {ci + 1}</span>
                      <button onClick={() => removeCourse(item.oar.name, ci)}
                        className="text-[11px] text-red-400 hover:text-red-600">Remove</button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">
                        {ci === 0 ? "Dose" : "Dose"}
                      </label>
                      <div className="relative">
                        <input type="number" inputMode="decimal" step="0.1" min="0" value={course.dose}
                          onChange={(e) => updateCourse(item.oar.name, ci, "dose", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Gy" />
                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 pointer-events-none">Gy</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">Fractions</label>
                      <div className="relative">
                        <input type="number" inputMode="numeric" min="1" value={course.fractions}
                          onChange={(e) => updateCourse(item.oar.name, ci, "fractions", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 pr-7 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="fx" />
                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 pointer-events-none">fx</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1">Interval</label>
                      <div className="relative">
                        <input type="number" inputMode="numeric" min="0" value={course.timeSinceRT}
                          onChange={(e) => updateCourse(item.oar.name, ci, "timeSinceRT", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 pr-8 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="mo" />
                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-300 pointer-events-none">mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => addCourse(item.oar.name)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium">
                + Add Prior Course
              </button>
            </div>
          ))}
        </section>
      )}

      {/* Results View */}
      {results.length > 0 && (
        <section className="space-y-6 fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900">Dose Budget Results</h2>
          
          {results.map((r) => (
            <ResultCard key={r.oar.name} result={r} />
          ))}
        </section>
      )}

      {/* OAR Selector */}
      <section className="fade-in-up fade-delay-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedOARs.length === 0 ? "Select Organs at Risk" : "Add More OARs"}
        </h2>
        {([1, 2, 3] as ToxicityTier[]).map((tier) => {
          const oars = getOARsByTier(tier).filter((o) => !selectedNames.has(o.name));
          if (oars.length === 0) return null;
          return (
            <div key={tier} className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                <span className={`inline-block rounded-full px-2 py-0.5 mr-1 ${tierLabel[tier].color}`}>
                  Tier {tier}
                </span>
                {tierLabel[tier].label}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {oars.map((oar) => (
                  <button key={oar.name} onClick={() => addOAR(oar)}
                    className="text-left p-3 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-sm">
                    <div className="font-medium text-gray-900">{oar.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Tolerance: {oar.lifetimeToleranceEQD2} Gy EQD2
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {OAR_DATABASE.every((o) => selectedNames.has(o.name)) && (
          <p className="text-sm text-gray-400 text-center py-4">All available OARs have been added.</p>
        )}
      </section>

      {/* Static SBRT Reference Table */}
      <section className="fade-in-up">
        <details className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <summary className="cursor-pointer list-none text-base font-semibold text-gray-900 flex items-center justify-between">
            Quick Reference: Spinal Cord SBRT Dose Constraints
            <svg className="h-5 w-5 text-gray-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </summary>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4 font-semibold">Scenario</th>
                  <th className="py-3 pr-4 font-semibold">Metric</th>
                  <th className="py-3 pr-4 font-semibold">Limit</th>
                  <th className="py-3 pr-4 font-semibold">Endpoint</th>
                  <th className="py-3 pr-4 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Conventional (1.8-2 Gy/fx)", "Dmax", "45-50 Gy", "Myelopathy <0.2%", "QUANTEC"],
                  ["Conventional (1.8-2 Gy/fx)", "Dmax", "54 Gy", "Myelopathy ~1%", "QUANTEC"],
                  ["SBRT 1 fx", "Dmax (0.035cc)", "14 Gy", "Myelopathy <1%", "Sahgal / TG-101"],
                  ["SBRT 1 fx", "Dmax (0.035cc)", "10 Gy", "Myelopathy <0.4%", "Sahgal 2010"],
                  ["SBRT 3 fx", "Dmax (0.035cc)", "21.9 Gy", "Myelopathy <1%", "Sahgal 2010"],
                  ["SBRT 3 fx", "D0.35cc", "18 Gy", "Myelopathy <1%", "TG-101"],
                  ["SBRT 5 fx", "Dmax (0.035cc)", "30 Gy", "Myelopathy <1%", "Sahgal 2010"],
                  ["SBRT 5 fx", "D0.035cc", "25.3 Gy", "Myelopathy <1%", "Sahgal 2019"],
                  ["Reirradiation", "Cumulative BED2", "<=120 Gy", "Low risk (~3%)", "Nieder"],
                  ["Reirradiation", "Cumulative BED2", "120-150 Gy", "Intermediate risk", "Nieder"],
                  ["Reirradiation", "Interval", ">=6 months", "Required for safe re-RT", "Nieder"],
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="py-2.5 pr-4 text-gray-700">{row[0]}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-gray-600">{row[1]}</td>
                    <td className="py-2.5 pr-4 font-semibold text-gray-900 tabular-nums">{row[2]}</td>
                    <td className="py-2.5 pr-4 text-gray-600">{row[3]}</td>
                    <td className="py-2.5 pr-4 text-xs text-gray-400">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <RelatedTools current="/dose-budget" />

      {/* Sources */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up">
        <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-500">
          <ol className="list-decimal list-inside space-y-2">
            <li>Marks LB, et al. Use of normal tissue complication probability models in the clinic. <span className="italic">IJROBP.</span> 2010;76(3 Suppl):S10-S19. (QUANTEC)</li>
            <li>Benedict SH, et al. Stereotactic body radiation therapy: AAPM TG-101. <span className="italic">Med Phys.</span> 2010;37(8):4078-4101.</li>
            <li>Sahgal A, et al. Reirradiation human spinal cord tolerance for SBRT. <span className="italic">IJROBP.</span> 2012;82(1):107-116.</li>
            <li>Sahgal A, et al. Spinal cord dose tolerance to SBRT. <span className="italic">IJROBP.</span> 2021;110(1):124-136.</li>
            <li>Nieder C, et al. Proposal of human spinal cord reirradiation dose. <span className="italic">IJROBP.</span> 2005;61(3):851-855.</li>
            <li>Nieder C, et al. Update of human spinal cord reirradiation tolerance. <span className="italic">IJROBP.</span> 2006;66(5):1446-1449.</li>
            <li>Kirkpatrick JP, et al. Radiation dose-volume effects in the spinal cord. <span className="italic">IJROBP.</span> 2010;76(3 Suppl):S42-S49.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

/* ── Result Card Component ── */
function ResultCard({ result: r }: { result: OARBudgetResult }) {
  const [customFx, setCustomFx] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const c = riskColors[r.riskLevel];
  const cfx = parseInt(customFx);
  const customPhys = cfx >= 1 ? eqd2ToPhysicalDose(r.remainingBudgetEQD2, cfx, r.oar.alphaBeta) : null;

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{r.oar.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Risk: {r.oar.complication}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.chip}`}>
          {r.riskLevel.toUpperCase()}
        </span>
      </div>

      {/* Visual Dose Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Used: {r.percentUsed}%</span>
          <span>Remaining: {r.percentRemaining}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
          {/* Used portion */}
          <div
            className="absolute left-0 top-0 h-full bg-gray-400"
            style={{ width: `${Math.min(100, r.percentUsed)}%` }}
          />
          {/* Remaining portion */}
          <div
            className="absolute h-full transition-all"
            style={{
              left: `${Math.min(100, r.percentUsed)}%`,
              width: `${Math.min(100 - r.percentUsed, r.percentRemaining)}%`,
              backgroundColor: c.bar,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0 Gy</span>
          <span>{r.effectiveTolerance} Gy (tolerance ceiling)</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200/50">
        <div>
          <p className="text-xs text-gray-500">Prior EQD2</p>
          <p className="text-lg font-bold text-gray-900">{r.priorEQD2} Gy</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Effective Tolerance</p>
          <p className="text-lg font-bold text-gray-900">{r.effectiveTolerance} Gy</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Remaining Budget (EQD2)</p>
          <p className="text-3xl font-bold text-gray-900">{r.remainingBudgetEQD2} Gy</p>
        </div>
      </div>

      {/* Physical Dose Budget Table */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
          Physical Dose Budget by Fractionation
        </h4>
        <div className="rounded-lg overflow-hidden border border-gray-200/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100/50 text-xs text-gray-500">
                <th className="text-left py-2 px-3 font-semibold">Fractions</th>
                <th className="text-left py-2 px-3 font-semibold">Total Dose</th>
                <th className="text-left py-2 px-3 font-semibold">Dose/Fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 px-3 font-medium">1 fx</td>
                <td className="py-2 px-3 tabular-nums">{r.physicalDoseBudgets.oneFraction} Gy</td>
                <td className="py-2 px-3 tabular-nums">{r.physicalDoseBudgets.oneFraction} Gy</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">3 fx</td>
                <td className="py-2 px-3 tabular-nums">{r.physicalDoseBudgets.threeFractions} Gy</td>
                <td className="py-2 px-3 tabular-nums">{(r.physicalDoseBudgets.threeFractions / 3).toFixed(1)} Gy</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium">5 fx</td>
                <td className="py-2 px-3 tabular-nums">{r.physicalDoseBudgets.fiveFractions} Gy</td>
                <td className="py-2 px-3 tabular-nums">{(r.physicalDoseBudgets.fiveFractions / 5).toFixed(1)} Gy</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1">
                    <input type="number" min="1" max="50" value={customFx}
                      onChange={(e) => setCustomFx(e.target.value)}
                      className="w-12 rounded border border-gray-200 px-1.5 py-1 text-xs text-center focus:border-blue-500 focus:outline-none"
                      placeholder="#" />
                    <span className="text-xs text-gray-400">fx</span>
                  </div>
                </td>
                <td className="py-2 px-3 tabular-nums text-sm">
                  {customPhys !== null ? `${customPhys} Gy` : "—"}
                </td>
                <td className="py-2 px-3 tabular-nums text-sm">
                  {customPhys !== null && cfx >= 1 ? `${(customPhys / cfx).toFixed(1)} Gy` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Message */}
      {r.warningMessage && (
        <div className={`rounded-lg border ${c.border} bg-white/50 p-3 text-sm ${c.text} font-medium mb-3`}>
          {r.warningMessage}
        </div>
      )}

      {/* Full Calculation Breakdown (Expandable) */}
      <details className="rounded-lg border border-gray-200 bg-white/70 p-3 mb-3">
        <summary className="cursor-pointer text-xs font-semibold text-gray-700 flex items-center justify-between"
          onClick={() => setShowBreakdown(!showBreakdown)}>
          Full Calculation Breakdown
          <svg className={`h-3 w-3 text-gray-400 transition-transform ${showBreakdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="mt-3 space-y-3">
          {r.courseBreakdown.map((cb, i) => (
            <div key={i} className="border-t border-gray-100 pt-2">
              <p className="text-xs font-semibold text-gray-700 mb-1">Course {cb.courseIndex}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Total Dose:</span> <span className="font-medium text-gray-900">{cb.dose} Gy</span>
                </div>
                <div>
                  <span className="text-gray-500">Fractions:</span> <span className="font-medium text-gray-900">{cb.fractions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dose/Fx:</span> <span className="font-medium text-gray-900">{cb.dosePerFraction} Gy</span>
                </div>
                <div>
                  <span className="text-gray-500">Alpha/Beta:</span> <span className="font-medium text-gray-900">{cb.alphaBeta}</span>
                </div>
                <div>
                  <span className="text-gray-500">BED:</span> <span className="font-medium text-gray-900">{cb.bed} Gy</span>
                </div>
                <div>
                  <span className="text-gray-500">EQD2:</span> <span className="font-medium text-gray-900">{cb.eqd2} Gy</span>
                </div>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2">
            <p className="text-xs font-semibold text-gray-700">Summary</p>
            <div className="text-xs mt-1">
              <div><span className="text-gray-500">Total Prior EQD2:</span> <span className="font-bold text-gray-900">{r.priorEQD2} Gy</span></div>
              <div><span className="text-gray-500">Effective Tolerance:</span> <span className="font-bold text-gray-900">{r.effectiveTolerance} Gy</span></div>
              <div><span className="text-gray-500">Remaining Budget:</span> <span className="font-bold text-gray-900">{r.remainingBudgetEQD2} Gy</span></div>
            </div>
          </div>
        </div>
      </details>

      {/* Clinical Notes */}
      <details className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-blue-700 flex items-center justify-between">
          Clinical Notes
          <svg className="h-3 w-3 text-blue-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <p className="mt-2 text-xs text-blue-800 leading-relaxed">{r.oar.specialNote}</p>
      </details>
    </div>
  );
}
