"use client";

import { useMemo, useState } from "react";
import { RelatedTools } from "../components/RelatedTools";
import { OAR_DATABASE, type OARBudgetData } from "@/lib/oarData";
import {
  calculateOARBudget,
  type OARBudgetResult,
  type PriorCourse,
} from "@/lib/oarDoseBudget";
import { calcBEDAndEQD2, eqd2ToPhysicalDose } from "@/lib/bedCalculations";

type Tab = "budget" | "bed";

interface CourseInput {
  dose: string;
  fractions: string;
  timeSinceRT: string;
}

interface SelectedOAR {
  oar: OARBudgetData;
  constraintEQD2: number;
  courses: CourseInput[];
}

interface CalculationCard {
  id: string;
  dose: number;
  fractions: number;
  alphaBeta: number;
  label: string;
}

const emptyCourse = (): CourseInput => ({ dose: "", fractions: "", timeSinceRT: "" });

const SPINE_PRESETS = [
  { label: "24 Gy / 2 fx", dose: 24, fractions: 2 },
  { label: "27 Gy / 3 fx", dose: 27, fractions: 3 },
  { label: "30 Gy / 3 fx", dose: 30, fractions: 3 },
  { label: "30 Gy / 5 fx", dose: 30, fractions: 5 },
  { label: "35 Gy / 5 fx", dose: 35, fractions: 5 },
  { label: "40 Gy / 5 fx", dose: 40, fractions: 5 },
  { label: "20 Gy / 5 fx", dose: 20, fractions: 5 },
  { label: "30 Gy / 10 fx", dose: 30, fractions: 10 },
];

function parseNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDose(value: number): string {
  return value.toFixed(value >= 10 ? 1 : 2);
}

function getBudgetTone(remaining: number, percentRemaining: number) {
  if (remaining <= 0) return { border: "border-red-200", bg: "bg-red-50/70", text: "text-red-700", dot: "bg-red-500" };
  if (percentRemaining <= 15) return { border: "border-orange-200", bg: "bg-orange-50/70", text: "text-orange-700", dot: "bg-orange-500" };
  if (percentRemaining <= 35) return { border: "border-amber-200", bg: "bg-amber-50/70", text: "text-amber-700", dot: "bg-amber-500" };
  return { border: "border-blue-200", bg: "bg-blue-50/70", text: "text-blue-700", dot: "bg-blue-500" };
}

export default function DoseBudgetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("budget");
  const [selectedOARs, setSelectedOARs] = useState<SelectedOAR[]>([]);
  const [inputMode, setInputMode] = useState<"actual" | "prescription">("actual");
  const [dose, setDose] = useState("36");
  const [fractions, setFractions] = useState("4");
  const [alphaBeta, setAlphaBeta] = useState("2");
  const [cards, setCards] = useState<CalculationCard[]>([]);
  const [presetIndex, setPresetIndex] = useState(3);
  const [showFormula, setShowFormula] = useState(false);

  const results = useMemo(() => {
    return selectedOARs.flatMap((item) => {
      const courses: PriorCourse[] = item.courses.flatMap((course) => {
        const totalDose = parseNumber(course.dose);
        const fx = parseNumber(course.fractions);
        const interval = parseNumber(course.timeSinceRT);
        if (!totalDose || totalDose <= 0 || !fx || !Number.isInteger(fx) || fx < 1) return [];
        return [{
          dose: totalDose,
          fractions: fx,
          timeSinceRT: interval ?? 999,
          isDoseToPrescription: inputMode === "prescription",
        }];
      });
      const oar = { ...item.oar, lifetimeToleranceEQD2: item.constraintEQD2 };
      return courses.length ? [calculateOARBudget(oar, courses)] : [];
    });
  }, [inputMode, selectedOARs]);

  const resultByName = useMemo(
    () => new Map(results.map((result) => [result.oar.name, result])),
    [results],
  );
  const hasRecentTreatment = results.some((result) => result.timeCaution);
  const selectedNames = new Set(selectedOARs.map((item) => item.oar.name));

  const bedResult = useMemo(() => {
    const totalDose = parseNumber(dose);
    const fx = parseNumber(fractions);
    const ab = parseNumber(alphaBeta);
    if (!totalDose || totalDose <= 0 || !fx || !Number.isInteger(fx) || fx < 1 || !ab || ab <= 0) return undefined;
    return { totalDose, fractions: fx, alphaBeta: ab, ...calcBEDAndEQD2(totalDose, fx, ab) };
  }, [alphaBeta, dose, fractions]);

  const addOAR = (oar: OARBudgetData) => {
    if (selectedNames.has(oar.name)) return;
    setSelectedOARs((current) => [...current, { oar, constraintEQD2: oar.lifetimeToleranceEQD2, courses: [emptyCourse()] }]);
  };

  const removeOAR = (name: string) => setSelectedOARs((current) => current.filter((item) => item.oar.name !== name));

  const setConstraint = (name: string, constraintEQD2: number) => {
    setSelectedOARs((current) => current.map((item) => item.oar.name === name ? { ...item, constraintEQD2 } : item));
  };

  const updateCourse = (name: string, index: number, field: keyof CourseInput, value: string) => {
    setSelectedOARs((current) => current.map((item) => item.oar.name === name
      ? { ...item, courses: item.courses.map((course, courseIndex) => courseIndex === index ? { ...course, [field]: value } : course) }
      : item));
  };

  const addCourse = (name: string) => setSelectedOARs((current) => current.map((item) => item.oar.name === name ? { ...item, courses: [...item.courses, emptyCourse()] } : item));

  const removeCourse = (name: string, index: number) => setSelectedOARs((current) => current.map((item) => item.oar.name === name ? { ...item, courses: item.courses.filter((_, courseIndex) => courseIndex !== index) } : item));

  const addCalculationCard = () => {
    if (!bedResult) return;
    setCards((current) => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dose: bedResult.totalDose,
      fractions: bedResult.fractions,
      alphaBeta: bedResult.alphaBeta,
      label: `${formatDose(bedResult.totalDose)} Gy / ${bedResult.fractions} fx`,
    }, ...current]);
  };

  const applyPreset = () => {
    const preset = SPINE_PRESETS[presetIndex];
    setDose(String(preset.dose));
    setFractions(String(preset.fractions));
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Dose Planning
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">Spine Re-irradiation Tools</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">Cumulative OAR dose budgeting and linear-quadratic dose conversion for spine radiation planning.</p>
      </section>

      <div className="inline-flex w-full rounded-xl border border-gray-200 bg-gray-50 p-1 sm:w-auto" role="tablist" aria-label="Dose planning tool">
        <button type="button" role="tab" aria-selected={activeTab === "budget"} onClick={() => setActiveTab("budget")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${activeTab === "budget" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
          OAR Dose Budget
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "bed"} onClick={() => setActiveTab("bed")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none ${activeTab === "bed" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
          BED / EQD2
        </button>
      </div>

      {activeTab === "budget" ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Organs at risk</h2>
                <p className="mt-1 text-sm text-gray-500">Select an organ to enter each prior course. Budgets update in real time using cumulative EQD2, without recovery adjustments.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-full border border-gray-200 bg-white p-1 text-xs font-bold">
                  <button type="button" onClick={() => setInputMode("actual")} className={`rounded-full px-3 py-1.5 ${inputMode === "actual" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Actual OAR dose</button>
                  <button type="button" onClick={() => setInputMode("prescription")} className={`rounded-full px-3 py-1.5 ${inputMode === "prescription" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Prescription dose</button>
                </div>
                {selectedOARs.length > 0 && <button type="button" onClick={() => setSelectedOARs([])} className="text-xs font-semibold text-gray-500 hover:text-red-600">Clear all</button>}
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">{inputMode === "actual" ? "Enter the dose received by the organ from the prior plan or DVH." : "Prescription dose is used as an OAR-dose surrogate."}</p>
          </section>

          {hasRecentTreatment && (
            <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>Recent prior treatment:</strong> at least one entered interval is under 6 months. This is a caution only, not a recovery adjustment.
            </section>
          )}

          {selectedOARs.length > 0 && (
            <section className="space-y-4">
              {selectedOARs.map((item) => (
                <article key={item.oar.name} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-5">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.oar.name}</h3>
                      <p className="mt-1 text-xs text-gray-500">Tolerance {item.constraintEQD2} Gy EQD2, alpha/beta {item.oar.alphaBeta} Gy</p>
                      {item.oar.lifetimePresets && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Lifetime constraint</span>
                          {item.oar.lifetimePresets.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => setConstraint(item.oar.name, preset.value)}
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                item.constraintEQD2 === preset.value
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700"
                              }`}
                            >
                              {preset.label} {preset.value} Gy
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeOAR(item.oar.name)} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600">Remove</button>
                  </div>
                  <div className="space-y-3 p-4 sm:p-5">
                    {item.courses.map((course, index) => (
                      <div key={index} className={index ? "border-t border-gray-100 pt-3" : ""}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">{index === 0 ? "Prior course" : `Additional prior course ${index + 1}`}</span>
                          {index > 0 && <button type="button" onClick={() => removeCourse(item.oar.name, index)} className="text-xs font-semibold text-red-500 hover:text-red-700">Remove</button>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <NumberField label="Prior dose" unit="Gy" value={course.dose} onChange={(value) => updateCourse(item.oar.name, index, "dose", value)} step="0.1" />
                          <NumberField label="Fractions" unit="fx" value={course.fractions} onChange={(value) => updateCourse(item.oar.name, index, "fractions", value)} step="1" min="1" />
                          <NumberField label="Interval (caution only)" unit="mo" value={course.timeSinceRT} onChange={(value) => updateCourse(item.oar.name, index, "timeSinceRT", value)} step="1" min="0" />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addCourse(item.oar.name)} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700">Add prior course</button>
                    {resultByName.get(item.oar.name) ? <BudgetResult result={resultByName.get(item.oar.name)!} /> : <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">Enter dose and fractions to calculate the remaining budget.</div>}
                  </div>
                </article>
              ))}
            </section>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">{selectedOARs.length ? "Add another organ" : "Select organs at risk"}</h2>
            <p className="mt-1 text-sm text-gray-500">Choose only the structures relevant to the target and prior treatment.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {OAR_DATABASE.filter((oar) => !selectedNames.has(oar.name)).map((oar) => (
                <button type="button" key={oar.name} onClick={() => addOAR(oar)} className="rounded-xl border border-gray-200 bg-white p-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50">
                  <div className="font-semibold text-gray-900">{oar.name}</div>
                  <div className="mt-1 text-xs text-gray-500">Tolerance {oar.lifetimeToleranceEQD2} Gy EQD2, alpha/beta {oar.alphaBeta}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600">
            <strong className="text-gray-800">Clinical disclaimer.</strong> This calculator uses simple cumulative EQD2 budgeting without recovery-time adjustments. It does not account for dose heterogeneity, volume, overlap, organ substructure, systemic therapy, or patient-specific factors. Use with the full prior plan review and clinical judgment.
          </section>
        </div>
      ) : (
        <BEDCalculator
          dose={dose}
          fractions={fractions}
          alphaBeta={alphaBeta}
          result={bedResult}
          cards={cards}
          presetIndex={presetIndex}
          showFormula={showFormula}
          onDoseChange={setDose}
          onFractionsChange={setFractions}
          onAlphaBetaChange={setAlphaBeta}
          onPresetChange={setPresetIndex}
          onApplyPreset={applyPreset}
          onAddCard={addCalculationCard}
          onRemoveCard={(id) => setCards((current) => current.filter((card) => card.id !== id))}
          onClearCards={() => setCards([])}
          onToggleFormula={() => setShowFormula((value) => !value)}
        />
      )}

      <RelatedTools current="/dose-budget" />
    </div>
  );
}

function NumberField({ label, unit, value, onChange, step, min }: { label: string; unit: string; value: string; onChange: (value: string) => void; step: string; min?: string }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</span><div className="relative"><input type="number" inputMode="decimal" min={min ?? "0"} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="0" /><span className="pointer-events-none absolute right-3 top-3 text-xs text-gray-400">{unit}</span></div></label>;
}

function BudgetResult({ result }: { result: OARBudgetResult }) {
  const [customFractions, setCustomFractions] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const tone = getBudgetTone(result.remainingBudgetEQD2, result.percentRemaining);
  const customFx = parseNumber(customFractions);
  const physicalRows = [1, 3, 5].map((fractions) => {
    const totalDose = eqd2ToPhysicalDose(result.remainingBudgetEQD2, fractions, result.oar.alphaBeta);
    return { fractions, totalDose, dosePerFraction: totalDose / fractions };
  });

  return <div className={`mt-4 rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} /><h4 className="font-bold text-gray-900">Dose budget</h4></div><p className="mt-1 text-xs text-gray-600">Remaining EQD2 and physical-dose estimate.</p></div><div className={`text-xs font-bold ${tone.text}`}>{result.percentRemaining.toFixed(0)}% remaining</div></div>
    <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-5 text-center"><div className={`text-[11px] font-bold uppercase tracking-wide ${tone.text}`}>Remaining dose budget (EQD2)</div><div className="mt-1 text-4xl font-bold leading-none text-gray-950">{result.remainingBudgetEQD2.toFixed(1)}</div><div className="mt-1 text-sm font-semibold text-gray-600">Gy EQD2</div><div className="mt-1 text-xs text-gray-500">of {result.effectiveTolerance.toFixed(1)} Gy tolerance</div></div>
    <div className="mt-3 grid grid-cols-3 gap-2 text-center"><Metric label="Prior EQD2" value={result.priorEQD2.toFixed(1)} /><Metric label="Alpha/beta" value={result.oar.alphaBeta.toString()} /><Metric label="Tolerance" value={result.effectiveTolerance.toFixed(1)} /></div>
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white/80"><div className="border-b border-gray-200 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">Physical dose budget</div><table className="w-full text-sm"><thead className="text-left text-[11px] uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-2">Fractions</th><th className="px-3 py-2">Total dose</th><th className="px-3 py-2">Dose/fx</th></tr></thead><tbody className="divide-y divide-gray-200">{physicalRows.map((row) => <tr key={row.fractions}><td className="px-3 py-2 font-semibold text-gray-800">{row.fractions} fx</td><td className="px-3 py-2 font-semibold text-gray-900">{row.totalDose.toFixed(1)} Gy</td><td className="px-3 py-2 text-gray-600">{row.dosePerFraction.toFixed(1)} Gy</td></tr>)}<tr><td className="px-3 py-2"><input type="number" min="1" max="50" value={customFractions} onChange={(event) => setCustomFractions(event.target.value)} className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-xs" placeholder="#" /> <span className="text-xs text-gray-500">fx</span></td><td className="px-3 py-2 font-semibold text-gray-900">{customFx && customFx >= 1 ? `${eqd2ToPhysicalDose(result.remainingBudgetEQD2, customFx, result.oar.alphaBeta).toFixed(1)} Gy` : "-"}</td><td className="px-3 py-2 text-gray-600">{customFx && customFx >= 1 ? `${(eqd2ToPhysicalDose(result.remainingBudgetEQD2, customFx, result.oar.alphaBeta) / customFx).toFixed(1)} Gy` : "custom"}</td></tr></tbody></table></div>
    <details className="mt-4 rounded-xl border border-gray-200 bg-white/80" open={showDetails}><summary onClick={(event) => { event.preventDefault(); setShowDetails((value) => !value); }} className="cursor-pointer px-3 py-2 text-xs font-bold text-gray-600">Calculation details</summary><div className="border-t border-gray-200 px-3 py-3 text-xs text-gray-600"><p>Prior EQD2 = {result.courseBreakdown.map((course) => course.eqd2.toFixed(1)).join(" + ")} = {result.priorEQD2.toFixed(1)} Gy</p><p className="mt-1">Remaining = {result.effectiveTolerance.toFixed(1)} - {result.priorEQD2.toFixed(1)} = {result.remainingBudgetEQD2.toFixed(1)} Gy EQD2</p>{result.oar.specialNote && <p className="mt-3 rounded-lg bg-blue-50 p-3 leading-relaxed text-blue-900">{result.oar.specialNote}</p>}</div></details>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-white/80 p-3"><div className="text-[10px] font-bold uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 font-bold text-gray-900">{value}</div><div className="text-[10px] text-gray-500">Gy</div></div>; }

function BEDCalculator({ dose, fractions, alphaBeta, result, cards, presetIndex, showFormula, onDoseChange, onFractionsChange, onAlphaBetaChange, onPresetChange, onApplyPreset, onAddCard, onRemoveCard, onClearCards, onToggleFormula }: { dose: string; fractions: string; alphaBeta: string; result: { totalDose: number; fractions: number; alphaBeta: number; bed: number; eqd2: number } | undefined; cards: CalculationCard[]; presetIndex: number; showFormula: boolean; onDoseChange: (value: string) => void; onFractionsChange: (value: string) => void; onAlphaBetaChange: (value: string) => void; onPresetChange: (value: number) => void; onApplyPreset: () => void; onAddCard: () => void; onRemoveCard: (id: string) => void; onClearCards: () => void; onToggleFormula: () => void }) {
  return <div className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-bold text-gray-900">Live calculator</h2><p className="mt-1 text-sm text-gray-500">Convert dose and fractionation to BED and EQD2 with the linear-quadratic model.</p></div><div className="flex gap-2"><select value={presetIndex} onChange={(event) => onPresetChange(Number(event.target.value))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800">{SPINE_PRESETS.map((preset, index) => <option key={preset.label} value={index}>{preset.label}</option>)}</select><button type="button" onClick={onApplyPreset} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Use preset</button></div></div><div className="mt-5 grid gap-3 lg:grid-cols-3"><NumberField label="Total dose" unit="Gy" value={dose} onChange={onDoseChange} step="0.1" /><NumberField label="Fractions" unit="fx" value={fractions} onChange={onFractionsChange} step="1" min="1" /><NumberField label="Alpha/beta" unit="Gy" value={alphaBeta} onChange={onAlphaBetaChange} step="0.1" min="0.1" /></div>{result ? <div className="mt-5 grid gap-2 sm:grid-cols-3"><MetricBox label="Dose/fx" value={formatDose(result.totalDose / result.fractions)} tone="gray" /><MetricBox label="BED" value={formatDose(result.bed)} tone="blue" /><MetricBox label="EQD2" value={formatDose(result.eqd2)} tone="indigo" /></div> : <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Enter a positive total dose, a whole number of fractions, and an alpha/beta value above zero.</div>}<div className="mt-5 flex flex-col gap-2 sm:flex-row"><button type="button" disabled={!result} onClick={onAddCard} className={`rounded-full px-4 py-3 text-sm font-bold ${result ? "bg-blue-600 text-white hover:bg-blue-700" : "cursor-not-allowed bg-gray-200 text-gray-500"}`}>Add calculation card</button><button type="button" onClick={onToggleFormula} className="rounded-full border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">Calculation details</button></div>{showFormula && <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs leading-6 text-gray-700">d = total dose / fractions<br />BED = D × (1 + d / alpha/beta)<br />EQD2 = BED / (1 + 2 / alpha/beta)</div>}</section><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-gray-900">Calculation cards</h2><p className="mt-1 text-sm text-gray-500">Save regimens for quick side-by-side BED and EQD2 reference.</p></div>{cards.length > 0 && <button type="button" onClick={onClearCards} className="text-xs font-semibold text-gray-500 hover:text-red-600">Clear cards</button>}</div>{cards.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{cards.map((card) => { const values = calcBEDAndEQD2(card.dose, card.fractions, card.alphaBeta); return <article key={card.id} className="rounded-xl border border-gray-200 p-4"><div className="flex items-start justify-between"><div><h3 className="font-bold text-gray-900">{card.label}</h3><p className="mt-1 text-xs text-gray-500">alpha/beta {card.alphaBeta} Gy</p></div><button type="button" onClick={() => onRemoveCard(card.id)} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600">Remove</button></div><div className="mt-4 grid grid-cols-3 gap-2"><MetricBox label="Dose/fx" value={formatDose(card.dose / card.fractions)} tone="gray" /><MetricBox label="BED" value={formatDose(values.bed)} tone="blue" /><MetricBox label="EQD2" value={formatDose(values.eqd2)} tone="indigo" /></div></article>; })}</div> : <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">No calculation cards yet. Add the working regimen when you want to retain it.</div>}</section><section className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600"><strong className="text-gray-800">Clinical disclaimer.</strong> BED and EQD2 are linear-quadratic model estimates. They do not account for dose heterogeneity, volume, retreatment interval, tissue recovery, systemic therapy, or patient-specific risk.</section></div>;
}

function MetricBox({ label, value, tone }: { label: string; value: string; tone: "gray" | "blue" | "indigo" }) { const classes = tone === "blue" ? "border-blue-200 bg-blue-50 text-blue-900" : tone === "indigo" ? "border-indigo-200 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-gray-50 text-gray-900"; return <div className={`rounded-xl border p-3 text-center ${classes}`}><div className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</div><div className="mt-1 text-xl font-bold leading-none">{value}</div><div className="mt-1 text-[10px] font-semibold opacity-70">Gy</div></div>; }
