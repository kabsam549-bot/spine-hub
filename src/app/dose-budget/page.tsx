"use client";

import { useCallback, useMemo, useState } from "react";
import { OAR_DATABASE, getOARsByTier, type OARBudgetData, type ToxicityTier } from "@/lib/oarData";
import {
  calculateOARBudget,
  recoveryLabel,
  riskColors,
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
      <div className="grid grid-cols-3 gap-3">
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
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">&alpha;/&beta; (Gy)</label>
          <select value={ab} onChange={(e) => setAb(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            {[1, 1.5, 2, 2.5, 3, 4, 5, 10].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      {result && (
        <div className="mt-3 flex gap-4 text-sm">
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
  const [results, setResults] = useState<OARBudgetResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [customFx, setCustomFx] = useState<Record<string, string>>({});

  const selectedNames = useMemo(() => new Set(selectedOARs.map((o) => o.oar.name)), [selectedOARs]);

  const addOAR = (oar: OARBudgetData) => {
    if (selectedNames.has(oar.name)) return;
    setSelectedOARs((prev) => [...prev, { oar, courses: [emptyCourse()] }]);
    setShowResults(false);
  };

  const removeOAR = (name: string) => {
    setSelectedOARs((prev) => prev.filter((o) => o.oar.name !== name));
    setShowResults(false);
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
      setShowResults(false);
    },
    []
  );

  const addCourse = (oarName: string) => {
    setSelectedOARs((prev) =>
      prev.map((o) => (o.oar.name === oarName ? { ...o, courses: [...o.courses, emptyCourse()] } : o))
    );
    setShowResults(false);
  };

  const removeCourse = (oarName: string, idx: number) => {
    setSelectedOARs((prev) =>
      prev.map((o) =>
        o.oar.name === oarName ? { ...o, courses: o.courses.filter((_, i) => i !== idx) } : o
      )
    );
    setShowResults(false);
  };

  const calculate = () => {
    const errs: string[] = [];
    const validInputs: { oar: OARBudgetData; courses: PriorCourse[] }[] = [];

    for (const item of selectedOARs) {
      const courses: PriorCourse[] = [];
      for (let i = 0; i < item.courses.length; i++) {
        const c = item.courses[i];
        const dose = parseFloat(c.dose);
        const fx = parseInt(c.fractions);
        const time = parseInt(c.timeSinceRT);
        if (!c.dose && !c.fractions && !c.timeSinceRT) continue; // empty row
        if (!dose || dose <= 0) errs.push(`${item.oar.name} Course ${i + 1}: Enter a valid dose.`);
        if (!fx || fx < 1) errs.push(`${item.oar.name} Course ${i + 1}: Enter valid fractions.`);
        if (isNaN(time) || time < 0) errs.push(`${item.oar.name} Course ${i + 1}: Enter time since RT (months).`);
        if (dose > 0 && fx >= 1 && time >= 0) courses.push({ dose, fractions: fx, timeSinceRT: time });
      }
      if (courses.length > 0) validInputs.push({ oar: item.oar, courses });
    }

    if (errs.length > 0) {
      setErrors(errs);
      setResults([]);
      setShowResults(false);
      return;
    }
    if (validInputs.length === 0) {
      setErrors(["Enter dose data for at least one OAR."]);
      setResults([]);
      setShowResults(false);
      return;
    }

    setErrors([]);
    const res = validInputs.map((v) => calculateOARBudget(v.oar, v.courses));
    const riskOrder: Record<string, number> = { critical: 0, warning: 1, caution: 2, safe: 3 };
    res.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    setResults(res);
    setShowResults(true);
  };

  const reset = () => {
    setSelectedOARs([]);
    setResults([]);
    setShowResults(false);
    setErrors([]);
  };

  const hasValidInput = selectedOARs.some((o) =>
    o.courses.some((c) => {
      const d = parseFloat(c.dose);
      const f = parseInt(c.fractions);
      const t = parseInt(c.timeSinceRT);
      return d > 0 && f >= 1 && t >= 0;
    })
  );

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
          Calculate remaining radiation dose tolerance for organs at risk during spine re-irradiation planning. Enter actual prior doses per organ, and the system accounts for tissue recovery over time.
        </p>
      </section>

      {/* BED Calculator */}
      <section className="fade-in-up fade-delay-1">
        <BEDCalc />
      </section>

      {showResults ? (
        /* ── RESULTS VIEW ── */
        <ResultsView
          results={results}
          customFx={customFx}
          setCustomFx={setCustomFx}
          onBack={() => setShowResults(false)}
        />
      ) : (
        /* ── INPUT VIEW ── */
        <>
          {/* Instructions */}
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 fade-in-up fade-delay-1">
            <p className="font-semibold mb-1">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Select organs at risk from the list below</li>
              <li>Enter the <strong>actual prior dose</strong> each organ received (not prescription dose)</li>
              <li>Enter fractions and time since treatment (months)</li>
              <li>Click &quot;Calculate Dose Budgets&quot; to see remaining tolerance for each OAR</li>
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
                <div key={item.oar.name} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{item.oar.name}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierLabel[item.oar.tier].color}`}>
                          {tierLabel[item.oar.tier].label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Lifetime tolerance: <span className="font-semibold">{item.oar.lifetimeToleranceEQD2} Gy EQD2</span>
                        {" | "}&alpha;/&beta; = {item.oar.alphaBeta} Gy
                        {" | "}Risk: {item.oar.complication}
                      </p>
                    </div>
                    <button onClick={() => removeOAR(item.oar.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">&times;</button>
                  </div>

                  {item.courses.map((course, ci) => (
                    <div key={ci} className={`${ci > 0 ? "mt-3 border-l-4 border-amber-200 pl-4" : ""}`}>
                      {ci > 0 && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">Course {ci + 1}</span>
                          <button onClick={() => removeCourse(item.oar.name, ci)}
                            className="text-xs text-red-400 hover:text-red-600">Remove</button>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-1">
                          <label className="text-xs font-medium text-gray-500">
                            {ci === 0 ? "Prior Dose (Gy)" : "Dose (Gy)"}
                          </label>
                          <div className="relative">
                            <input type="number" step="0.1" min="0" value={course.dose}
                              onChange={(e) => updateCourse(item.oar.name, ci, "dose", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="0" />
                            <span className="absolute right-3 top-2 text-xs text-gray-400">Gy</span>
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs font-medium text-gray-500">Fractions</label>
                          <div className="relative">
                            <input type="number" min="1" value={course.fractions}
                              onChange={(e) => updateCourse(item.oar.name, ci, "fractions", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="0" />
                            <span className="absolute right-3 top-2 text-xs text-gray-400">fx</span>
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs font-medium text-gray-500">Time Since RT</label>
                          <div className="relative">
                            <input type="number" min="0" value={course.timeSinceRT}
                              onChange={(e) => updateCourse(item.oar.name, ci, "timeSinceRT", e.target.value)}
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="0" />
                            <span className="absolute right-3 top-2 text-xs text-gray-400">mo</span>
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

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium mb-1">Please correct the following:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Calculate Button */}
          <div className="sticky bottom-6 z-10">
            <button onClick={calculate} disabled={!hasValidInput}
              className={`w-full py-4 text-sm font-semibold uppercase tracking-wider rounded-xl transition-all shadow-lg ${
                hasValidInput
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}>
              {hasValidInput ? "Calculate Dose Budgets" : "Enter dose data to calculate"}
            </button>
          </div>
        </>
      )}

      {/* Sources */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up">
        <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
        <div className="mt-4 space-y-3 text-xs leading-relaxed text-gray-500">
          <p>Tissue recovery model based on empirical estimates: &lt;6 mo (0%), 6-12 mo (25%), 12-24 mo (40%), &gt;24 mo (50%). Conservative estimates; actual recovery varies by tissue type, dose, volume, and patient factors.</p>
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

/* ── Results View Component ── */
function ResultsView({
  results,
  customFx,
  setCustomFx,
  onBack,
}: {
  results: OARBudgetResult[];
  customFx: Record<string, string>;
  setCustomFx: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBack: () => void;
}) {
  const worstRisk = results[0]?.riskLevel ?? "safe";

  const summaryColors: Record<string, { bg: string; border: string; text: string }> = {
    critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-900" },
    warning: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900" },
    caution: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-900" },
    safe: { bg: "bg-green-50", border: "border-green-300", text: "text-green-900" },
  };
  const sc = summaryColors[worstRisk];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between fade-in-up">
        <h2 className="text-2xl font-bold text-gray-900">Dose Budget Results</h2>
        <button onClick={onBack}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Back to Input
        </button>
      </div>

      {/* Summary */}
      <div className={`rounded-xl border-2 ${sc.border} ${sc.bg} p-4 fade-in-up`}>
        <p className={`text-sm font-semibold ${sc.text}`}>
          {worstRisk === "critical" && "CRITICAL: Some organs have minimal remaining tolerance. Exercise extreme caution."}
          {worstRisk === "warning" && "WARNING: Some organs are approaching tolerance limits. Careful dose planning required."}
          {worstRisk === "caution" && "CAUTION: Some organs have moderate remaining tolerance. Monitor closely."}
          {worstRisk === "safe" && "All evaluated organs have reasonable dose budget remaining."}
        </p>
      </div>

      {/* Result Cards */}
      <div className="space-y-6 fade-in-up fade-delay-1">
        {results.map((r) => {
          const c = riskColors[r.riskLevel];
          const cfx = parseInt(customFx[r.oar.name] || "");
          const customPhys = cfx >= 1 ? eqd2ToPhysicalDose(r.remainingBudgetEQD2, cfx, r.oar.alphaBeta) : null;

          return (
            <div key={r.oar.name} className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6`}>
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

              {/* Calculation Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200/50">
                <div>
                  <p className="text-xs text-gray-500">Prior EQD2</p>
                  <p className="text-lg font-bold text-gray-900">{r.priorEQD2} Gy</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recovery</p>
                  <p className="text-lg font-bold text-gray-900">{r.recoveryPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Effective Prior</p>
                  <p className="text-lg font-bold text-gray-900">{r.effectivePriorEQD2} Gy</p>
                  <p className="text-[10px] text-gray-400">after recovery</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lifetime Tolerance</p>
                  <p className="text-lg font-bold text-gray-900">{r.oar.lifetimeToleranceEQD2} Gy</p>
                </div>
              </div>

              {/* Remaining Budget */}
              <div className="rounded-xl bg-white/70 border border-gray-200/50 p-4 mb-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Remaining Dose Budget</p>
                <p className="text-4xl font-bold text-gray-900">{r.remainingBudgetEQD2} Gy</p>
                <p className="text-sm text-gray-500">EQD2 ({r.percentRemaining}% of lifetime tolerance)</p>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-3 overflow-hidden">
                  <div className="h-full transition-all rounded-full" style={{
                    width: `${Math.min(100, r.percentRemaining)}%`,
                    backgroundColor: c.bar,
                  }} />
                </div>
              </div>

              {/* Physical Dose Table */}
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
                            <input type="number" min="1" max="50" value={customFx[r.oar.name] ?? ""}
                              onChange={(e) => setCustomFx((p) => ({ ...p, [r.oar.name]: e.target.value }))}
                              className="w-12 rounded border border-gray-200 px-1.5 py-1 text-xs text-center focus:border-blue-500 focus:outline-none"
                              placeholder="#" />
                            <span className="text-xs text-gray-400">fx</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 tabular-nums text-sm">
                          {customPhys !== null ? `${customPhys} Gy` : "\u2014"}
                        </td>
                        <td className="py-2 px-3 tabular-nums text-sm">
                          {customPhys !== null && cfx >= 1 ? `${(customPhys / cfx).toFixed(1)} Gy` : "\u2014"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warning */}
              {r.warningMessage && (
                <div className={`rounded-lg border ${c.border} bg-white/50 p-3 text-sm ${c.text} font-medium mb-3`}>
                  {r.warningMessage}
                </div>
              )}

              {/* Clinical Note */}
              <details className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-blue-700 flex items-center justify-between">
                  Clinical Notes
                  <svg className="h-3 w-3 text-blue-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <p className="mt-2 text-xs text-blue-800 leading-relaxed">{r.oar.specialNote}</p>
              </details>
            </div>
          );
        })}
      </div>

      {/* Back */}
      <div className="text-center">
        <button onClick={onBack}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Modify Inputs
        </button>
      </div>
    </>
  );
}
