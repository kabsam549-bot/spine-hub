"use client";

import Link from "next/link";
import { useState } from "react";

type Choice = "short" | "long" | "intact" | "not-intact" | "stable" | "unstable" | "treat" | "observe" | "prior-cebrt" | "naive" | "sensitive" | "resistant" | "oligo" | "not-oligo" | "low-bilsky" | "high-bilsky";

type Option = { value: Choice; label: string; detail?: string };

function DecisionNode({ number, title, detail, value, options, onChoose }: { number: string; title: string; detail?: string; value: Choice | null; options: Option[]; onChoose: (value: Choice) => void }) {
  return (
    <section className="relative rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-amber-950">{number}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {detail && <p className="mt-1 text-sm leading-relaxed text-gray-600">{detail}</p>}
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return <button key={option.value} type="button" onClick={() => onChoose(option.value)} className={`rounded-xl border px-4 py-3 text-left transition ${selected ? "border-blue-700 bg-blue-700 text-white shadow" : "border-amber-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50"}`}>
            <span className="block text-sm font-bold">{option.label}</span>
            {option.detail && <span className={`mt-1 block text-xs leading-relaxed ${selected ? "text-blue-100" : "text-gray-500"}`}>{option.detail}</span>}
          </button>;
        })}
      </div>
    </section>
  );
}

function Connector({ label }: { label?: string }) {
  return <div className="flex flex-col items-center py-3" aria-hidden="true">{label && <span className="mb-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">{label}</span>}<span className="h-5 border-l-2 border-gray-400" /><span className="-mt-1 text-lg leading-none text-gray-500">▼</span></div>;
}

function ActionNode({ title, children, tone = "green", doseBudget = false }: { title: string; children: React.ReactNode; tone?: "green" | "blue" | "red"; doseBudget?: boolean }) {
  const styles = { green: "border-emerald-300 bg-emerald-50", blue: "border-blue-300 bg-blue-50", red: "border-red-300 bg-red-50" }[tone];
  return <section className={`rounded-2xl border-2 p-5 shadow-sm sm:p-6 ${styles}`}><p className="text-xs font-bold uppercase tracking-widest text-gray-600">Pathway action</p><h2 className="mt-2 text-xl font-bold text-gray-900">{title}</h2><div className="mt-3 text-sm leading-relaxed text-gray-700">{children}</div>{doseBudget && <Link href="/dose-budget" className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">Open cumulative OAR Dose Budget</Link>}</section>;
}

const templates = [
  "Conventional EBRT: 30 Gy in 10 fractions with a 40 Gy simultaneous integrated boost (SIB), when an integrated boost approach is appropriate.",
  "Conventional EBRT alternatives: 30 Gy in 10 fractions or 20 Gy in 5 fractions.",
  "RT-naive, radiosensitive SSRS: 18/16 Gy × 1, or 30/24 Gy × 3.",
  "RT-naive, radioresistant SSRS: 24/16 Gy × 1, or 30/24 Gy × 3.",
  "Prior cEBRT, radiosensitive SSRS: 27/21 Gy × 3 after cumulative OAR review.",
  "Prior cEBRT, radioresistant SSRS: 27/24 Gy × 3 after cumulative OAR review.",
  "Post-SBRT salvage: no automatic template. Reconstruct composite dose and individualize.",
  "Bilsky 1c or greater: assess separation strategy before SSRS if neural constraints compromise coverage.",
];

export default function PathwayPage() {
  const [prognosis, setPrognosis] = useState<Choice | null>(null);
  const [neurologic, setNeurologic] = useState<Choice | null>(null);
  const [stability, setStability] = useState<Choice | null>(null);
  const [indication, setIndication] = useState<Choice | null>(null);
  const [priorRt, setPriorRt] = useState<Choice | null>(null);
  const [sensitive, setSensitive] = useState<Choice | null>(null);
  const [oligo, setOligo] = useState<Choice | null>(null);
  const [epidural, setEpidural] = useState<Choice | null>(null);

  const reset = () => { setPrognosis(null); setNeurologic(null); setStability(null); setIndication(null); setPriorRt(null); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterPrognosis = (value: Choice) => { setPrognosis(value); setNeurologic(null); setStability(null); setIndication(null); setPriorRt(null); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterNeuro = (value: Choice) => { setNeurologic(value); setStability(null); setIndication(null); setPriorRt(null); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterStability = (value: Choice) => { setStability(value); setIndication(null); setPriorRt(null); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterIndication = (value: Choice) => { setIndication(value); setPriorRt(null); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterPriorRt = (value: Choice) => { setPriorRt(value); setSensitive(null); setOligo(null); setEpidural(null); };
  const resetAfterSensitive = (value: Choice) => { setSensitive(value); setOligo(null); setEpidural(null); };
  const resetAfterOligo = (value: Choice) => { setOligo(value); setEpidural(null); };

  const needsEpidural = priorRt === "prior-cebrt" || (priorRt === "naive" && sensitive === "resistant") || (priorRt === "naive" && sensitive === "sensitive" && oligo === "oligo");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="max-w-4xl pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600"><span className="h-px w-8 bg-blue-600" />Interactive MD Anderson framework</div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">Spine metastasis management pathway</h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">Click the decision cards to move through the published pathway. This recreates the algorithm as an interactive clinical workflow, rather than an image of the figure.</p>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><strong>Scope.</strong> Educational decision support only. Urgent neural compromise, imaging review, multidisciplinary input, prior-plan review, and institutional protocols remain required.</div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-slate-50 p-5 shadow-sm sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-900">Click-through treatment pathway</h2><p className="mt-1 text-sm text-gray-500">Yellow cards are decisions. Green and blue cards are pathway actions.</p></div><button type="button" onClick={reset} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Reset</button></div>
        <div className="mx-auto max-w-2xl">
          <DecisionNode number="1" title="Prognosis" detail="The figure begins with life expectancy and ability to benefit from durable local therapy." value={prognosis} onChoose={resetAfterPrognosis} options={[{ value: "short", label: "Life expectancy ≤3 months" }, { value: "long", label: "Life expectancy >3 months" }]} />
          {prognosis === "short" && <><Connector label="≤3 months" /><ActionNode title="Consider supportive care, cEBRT, or ablation">Prioritize symptom relief, supportive care, and patient goals. The published pathway does not prescribe a single regimen in this branch.</ActionNode></>}
          {prognosis === "long" && <><Connector label=">3 months" /><DecisionNode number="2" title="Neurological status" detail="Assess whether the patient is neurologically intact." value={neurologic} onChoose={resetAfterNeuro} options={[{ value: "intact", label: "Intact" }, { value: "not-intact", label: "Not intact" }]} /></>}
          {neurologic === "not-intact" && <><Connector label="Not intact" /><ActionNode title="Decompression and stabilization" tone="red">Address the acute neural threat. After this branch, select consolidation cEBRT or SSRS based on anatomy, histology, disease burden, and multidisciplinary review.</ActionNode></>}
          {neurologic === "intact" && <><Connector label="Intact" /><DecisionNode number="3" title="Mechanically stable?" detail="Use SINS plus mechanical pain, as specified in the figure." value={stability} onChoose={resetAfterStability} options={[{ value: "stable", label: "Yes, stable" }, { value: "unstable", label: "No, unstable" }]} /></>}
          {stability === "unstable" && <><Connector label="No" /><ActionNode title="Surgically stabilize">Instrumented fusion or cement augmentation may be used. After stabilization, continue to indication to treat.</ActionNode><Connector /><DecisionNode number="4" title="Indication to treat?" detail="Indications include epidural disease, oligometastatic/oligoprogressive disease, or local failure following cEBRT." value={indication} onChoose={resetAfterIndication} options={[{ value: "treat", label: "Yes" }, { value: "observe", label: "No" }]} /></>}
          {stability === "stable" && <><Connector label="Yes" /><DecisionNode number="4" title="Indication to treat?" detail="Indications include epidural disease, oligometastatic/oligoprogressive disease, or local failure following cEBRT." value={indication} onChoose={resetAfterIndication} options={[{ value: "treat", label: "Yes" }, { value: "observe", label: "No" }]} /></>}
          {indication === "observe" && <><Connector label="No" /><ActionNode title="Continue non-local management" tone="blue">Continue systemic management, symptom reassessment, and surveillance. Re-enter the pathway when a local-treatment indication develops.</ActionNode></>}
          {indication === "treat" && <><Connector label="Yes" /><DecisionNode number="5" title="Previous cEBRT?" value={priorRt} onChoose={resetAfterPriorRt} options={[{ value: "prior-cebrt", label: "Yes, prior cEBRT" }, { value: "naive", label: "No, RT-naive" }]} /></>}
          {priorRt === "naive" && <><Connector label="No" /><DecisionNode number="6" title="Radiosensitive?" value={sensitive} onChoose={resetAfterSensitive} options={[{ value: "sensitive", label: "Yes" }, { value: "resistant", label: "No, radioresistant" }]} /></>}
          {priorRt === "naive" && sensitive === "sensitive" && <><Connector label="Yes" /><DecisionNode number="7" title="Oligometastatic or oligoprogressive?" value={oligo} onChoose={resetAfterOligo} options={[{ value: "oligo", label: "Yes" }, { value: "not-oligo", label: "No" }]} /></>}
          {priorRt === "naive" && sensitive === "sensitive" && oligo === "not-oligo" && <><Connector label="No" /><ActionNode title="cEBRT">The algorithm routes a radiation-naive, radiosensitive lesion without an oligometastatic/oligoprogressive strategy to cEBRT.</ActionNode></>}
          {needsEpidural && <><Connector label={priorRt === "prior-cebrt" ? "Prior cEBRT" : "SSRS pathway"} /><DecisionNode number="8" title="Epidural disease" detail="The key anatomic split is whether disease touches or compresses the spinal cord." value={epidural} onChoose={setEpidural} options={[{ value: "low-bilsky", label: "Does not touch cord", detail: "Bilsky 0-1b" }, { value: "high-bilsky", label: "Touches/compresses cord", detail: "Bilsky 1c-3" }]} /></>}
          {epidural === "low-bilsky" && <><Connector label="Bilsky 0-1b" /><ActionNode title="SSRS">The figure routes disease that does not touch the spinal cord to spine stereotactic radiosurgery. For prior cEBRT, review cumulative OAR exposure before planning.</ActionNode>{priorRt === "prior-cebrt" && <Link href="/dose-budget" className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">Open cumulative OAR Dose Budget</Link>}</>}
          {epidural === "high-bilsky" && <><Connector label="Bilsky 1c-3" /><ActionNode title="Separation surgery, then SSRS">The figure routes tumor touching or compressing the spinal cord to separation surgery, followed by SSRS. In selected cases, separation may include percutaneous ablation such as LITT.</ActionNode>{priorRt === "prior-cebrt" && <Link href="/dose-budget" className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">Open cumulative OAR Dose Budget</Link>}</>}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Supporting assessments</p><h2 className="mt-2 text-xl font-bold text-gray-900">Use the tools at their branch point</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{[{ href: "/prism", name: "PRISM", detail: "Prognosis" }, { href: "/sins", name: "SINS", detail: "Mechanical stability" }, { href: "/noms", name: "NOMS", detail: "Integrated local strategy" }].map((tool) => <Link key={tool.href} href={tool.href} className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"><p className="font-bold text-gray-900">{tool.name}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{tool.detail}</p></Link>)}</div></div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Reirradiation checkpoint</p><h2 className="mt-2 text-xl font-bold text-gray-900">Actual prior OAR dose before a new plan</h2><p className="mt-2 text-sm leading-relaxed text-gray-600">For the prior-cEBRT branch, use actual OAR dose from the prior plan/DVH and a selected cumulative EQD2 ceiling. Do not substitute prescription dose.</p><Link href="/dose-budget" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Open cumulative OAR Dose Budget</Link></div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Template guide</p><h2 className="mt-2 text-xl font-bold text-gray-900">Planning templates, after the pathway branch</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">{templates.map((template) => <p key={template} className="rounded-xl border border-gray-200 bg-white p-4 leading-relaxed text-gray-600">{template}</p>)}</div><p className="mt-5 text-xs leading-relaxed text-gray-500">These are service-template starting points, not outputs of the published algorithm or replacements for plan-specific anatomy, target coverage, institutional constraints, and cumulative OAR review.</p></section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-600"><strong className="text-gray-900">Citation:</strong> Bahouth SM, Yeboa DN, Ghia AJ, et al. <em>Advances in the management of spinal metastases: what the radiologist needs to know.</em> Br J Radiol. 2023;96:20220267. doi: <a className="font-semibold text-blue-600 hover:underline" href="https://doi.org/10.1259/bjr.20220267" target="_blank" rel="noreferrer">10.1259/bjr.20220267</a>. <a className="font-semibold text-blue-600 hover:underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10997009/" target="_blank" rel="noreferrer">Open-access full text</a>.</section>
    </div>
  );
}
