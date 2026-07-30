"use client";

import { useMemo, useState } from "react";

export type PathwaySideApp = "prism" | "sins" | null;

export interface PrismSummary {
  score: number;
  group: string;
  prognosis: string;
}

export interface SinsSummary {
  score: number;
  classification: "Stable" | "Potentially unstable" | "Unstable";
}

const prismGroup = (score: number): PrismSummary => {
  if (score > 7) return { score, group: "Group 1", prognosis: "Excellent" };
  if (score >= 4) return { score, group: "Group 2", prognosis: "Good" };
  if (score >= 1) return { score, group: "Group 3", prognosis: "Intermediate" };
  return { score, group: "Group 4", prognosis: "Poor" };
};

const sinsVariables = [
  { label: "Location", options: [["Junctional", 3], ["Mobile", 2], ["Semi-rigid", 1], ["Rigid", 0]] },
  { label: "Mechanical pain", options: [["Yes", 3], ["Non-mechanical", 1], ["Pain-free", 0]] },
  { label: "Bone lesion", options: [["Lytic", 2], ["Mixed", 1], ["Blastic", 0]] },
  { label: "Alignment", options: [["Subluxation", 4], ["Deformity", 2], ["Normal", 0]] },
  { label: "Vertebral body collapse", options: [[">50%", 3], ["<50%", 2], ["No collapse, >50% involved", 1], ["None", 0]] },
  { label: "Posterolateral involvement", options: [["Bilateral", 3], ["Unilateral", 1], ["None", 0]] },
] as const;

function ChoiceButtons({ label, value, choices, onChange }: { label: string; value: string; choices: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <div><p className="mb-1.5 text-xs font-semibold text-gray-700">{label}</p><div className="grid grid-cols-2 gap-1.5">{choices.map((choice) => <button key={choice.value} type="button" onClick={() => onChange(choice.value)} className={`rounded-lg border px-2 py-2 text-left text-xs font-medium transition ${value === choice.value ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}>{choice.label}</button>)}</div></div>;
}

function PrismSideApp({ onApply }: { onApply: (summary: PrismSummary) => void }) {
  const [sex, setSex] = useState("male");
  const [ecog, setEcog] = useState("0");
  const [surgery, setSurgery] = useState("no");
  const [radiation, setRadiation] = useState("no");
  const [organs, setOrgans] = useState("0");
  const [solitary, setSolitary] = useState("no");
  const [latency, setLatency] = useState("no");
  const normalizedOrgans = Math.max(0, Math.floor(Number(organs) || 0));
  const score = useMemo(() => (sex === "female" ? 2 : 0) + ({ "0": 3.5, "1": 1.5, "2": 0.5, "3": 0 }[ecog] ?? 0) + (surgery === "yes" ? 1 : 0) - (radiation === "yes" ? 1 : 0) - normalizedOrgans + (solitary === "yes" ? 3 : 0) + (latency === "yes" ? 3 : 0), [sex, ecog, surgery, radiation, normalizedOrgans, solitary, latency]);
  const summary = prismGroup(score);
  const setSolitarySafely = (value: string) => { if (value === "yes") setOrgans("0"); setSolitary(value); };

  return <div className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Side app</p><h3 className="mt-1 text-lg font-bold text-gray-900">PRISM prognosis</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">Score is retained in the pathway, it does not automatically determine life expectancy.</p></div><ChoiceButtons label="Sex" value={sex} onChange={setSex} choices={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} /><ChoiceButtons label="ECOG" value={ecog} onChange={setEcog} choices={["0", "1", "2", "3"].map((value) => ({ value, label: `ECOG ${value}${value === "3" ? "+" : ""}` }))} /><ChoiceButtons label="Prior surgery at SBRT site" value={surgery} onChange={setSurgery} choices={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} /><ChoiceButtons label="Prior radiation at SBRT site" value={radiation} onChange={setRadiation} choices={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} /><label className="block text-xs font-semibold text-gray-700">Other organ systems with metastasis<input type="number" min="0" value={organs} onChange={(event) => { setOrgans(event.target.value); if (Number(event.target.value) > 0) setSolitary("no"); }} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label><ChoiceButtons label="Solitary bone disease" value={solitary} onChange={setSolitarySafely} choices={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} /><ChoiceButtons label="Diagnosis to metastasis >5 years" value={latency} onChange={setLatency} choices={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} /><div className="rounded-xl border border-blue-200 bg-blue-50 p-3"><p className="text-xs font-semibold text-blue-800">PRISM {summary.group}, {summary.prognosis}</p><p className="mt-1 text-3xl font-bold text-blue-900">{Number.isInteger(score) ? score : score.toFixed(1)}</p><button type="button" onClick={() => onApply(summary)} className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Save to pathway</button></div></div>;
}

function SinsSideApp({ onApply }: { onApply: (summary: SinsSummary) => void }) {
  const [selections, setSelections] = useState<(number | null)[]>(sinsVariables.map(() => null));
  const complete = selections.every((selection) => selection !== null);
  const score = complete ? selections.reduce((sum, selection) => sum + selection!, 0) : null;
  const classification: SinsSummary["classification"] | null = score === null ? null : score <= 6 ? "Stable" : score <= 12 ? "Potentially unstable" : "Unstable";
  return <div className="space-y-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Side app</p><h3 className="mt-1 text-lg font-bold text-gray-900">SINS stability</h3><p className="mt-1 text-xs leading-relaxed text-gray-500">Complete all six variables, then save the result to retain it in the pathway.</p></div>{sinsVariables.map((variable, index) => <div key={variable.label}><p className="mb-1.5 text-xs font-semibold text-gray-700">{variable.label}</p><div className="space-y-1">{variable.options.map(([label, value]) => <button key={label} type="button" onClick={() => setSelections((current) => current.map((selection, selectionIndex) => selectionIndex === index ? value : selection))} className={`w-full rounded-lg border px-2.5 py-2 text-left text-xs transition ${selections[index] === value ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}`}><span>{label}</span><span className="float-right font-bold">+{value}</span></button>)}</div></div>)}<div className="rounded-xl border border-blue-200 bg-blue-50 p-3">{classification ? <><p className="text-xs font-semibold text-blue-800">SINS {classification}</p><p className="mt-1 text-3xl font-bold text-blue-900">{score}/18</p><button type="button" onClick={() => onApply({ score: score!, classification })} className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">Save to pathway</button></> : <p className="text-xs text-blue-800">Select all six variables to calculate and save the SINS result.</p>}</div></div>;
}

export function PathwaySideApps({ activeApp, onClose, onApplyPrism, onApplySins }: { activeApp: PathwaySideApp; onClose: () => void; onApplyPrism: (summary: PrismSummary) => void; onApplySins: (summary: SinsSummary) => void }) {
  if (!activeApp) return <aside className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500 xl:sticky xl:top-20 xl:h-fit">Open PRISM or SINS from the pathway to use the assessment side app without losing pathway state.</aside>;
  return <aside className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto"><div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3"><span className="text-xs font-bold uppercase tracking-widest text-gray-400">Assessment workspace</span><button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100">Close</button></div>{activeApp === "prism" ? <PrismSideApp onApply={onApplyPrism} /> : <SinsSideApp onApply={onApplySins} />}</aside>;
}
