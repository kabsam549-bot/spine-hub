"use client";

import { useState } from "react";
import { RelatedTools } from "../components/RelatedTools";

/* ── NOMS Decision Framework ── */

type ESCCGrade = "0" | "1a" | "1b" | "1c" | "2" | "3" | null;
type Radiosensitivity = "sensitive" | "resistant" | null;
type Stability = "stable" | "potentially-unstable" | "unstable" | null;
type SystemicStatus = "good" | "moderate" | "poor" | null;

const esccOptions: { value: ESCCGrade; label: string; detail: string }[] = [
  { value: "0", label: "Grade 0", detail: "Bone only, no epidural extension" },
  { value: "1a", label: "Grade 1a", detail: "Epidural impingement, no thecal sac deformation" },
  { value: "1b", label: "Grade 1b", detail: "Thecal sac deformation, no cord abutment" },
  { value: "1c", label: "Grade 1c", detail: "Cord abutment without compression" },
  { value: "2", label: "Grade 2", detail: "Cord compression, CSF visible" },
  { value: "3", label: "Grade 3", detail: "Cord compression, no visible CSF" },
];

const radioOptions: { value: Radiosensitivity; label: string; detail: string }[] = [
  {
    value: "sensitive",
    label: "Radiosensitive",
    detail: "Lymphoma, myeloma, seminoma, breast, prostate, ovarian, neuroendocrine",
  },
  {
    value: "resistant",
    label: "Radioresistant",
    detail: "Renal, thyroid, HCC, colon, NSCLC, sarcoma, melanoma",
  },
];

const stabilityOptions: { value: Stability; label: string; detail: string }[] = [
  { value: "stable", label: "Stable", detail: "SINS 0-6" },
  { value: "potentially-unstable", label: "Potentially Unstable", detail: "SINS 7-12" },
  { value: "unstable", label: "Unstable", detail: "SINS 13-18" },
];

const systemicOptions: { value: SystemicStatus; label: string; detail: string }[] = [
  { value: "good", label: "Good", detail: "Able to tolerate surgery, expected survival >3 months" },
  { value: "moderate", label: "Moderate", detail: "Limited reserve, consider minimally invasive options" },
  { value: "poor", label: "Poor", detail: "Not a surgical candidate, palliative measures only" },
];

function getRecommendation(
  escc: ESCCGrade,
  radio: Radiosensitivity,
  stability: Stability,
  systemic: SystemicStatus
): { primary: string; radiation: string; surgery: string; details: string } | null {
  if (!escc || !radio || !stability || !systemic) return null;

  const highGrade = escc === "2" || escc === "3";
  const lowGrade = !highGrade;
  const needsStabilization = stability === "unstable" || stability === "potentially-unstable";

  // Poor systemic = palliative only
  if (systemic === "poor") {
    return {
      primary: "Palliative Management",
      radiation: highGrade ? "Consider cEBRT for symptom palliation" : "cEBRT for pain control",
      surgery: "Patient not a surgical candidate",
      details: "Focus on symptom management, pain control, and quality of life. Consider single-fraction palliative radiation (8 Gy x 1).",
    };
  }

  // High-grade ESCC
  if (highGrade) {
    if (radio === "sensitive") {
      return {
        primary: "cEBRT (may defer surgery)",
        radiation: "Conventional EBRT -- radiosensitive histology may achieve adequate decompression",
        surgery: needsStabilization
          ? "Surgical stabilization recommended for mechanical instability"
          : "Surgery reserved for failure of radiation or progressive deficit",
        details: "Radiosensitive tumors with high-grade ESCC may respond to cEBRT alone. Monitor closely for neurologic progression. If no improvement within 24-48 hours of radiation, consider surgical decompression.",
      };
    } else {
      return {
        primary: "Surgical Decompression + Radiation",
        radiation: "Postoperative SRS (stereotactic radiosurgery) for durable local control",
        surgery: "Separation surgery for epidural decompression" + (needsStabilization ? " + stabilization" : ""),
        details: "Radioresistant tumors with high-grade ESCC require surgical decompression to create separation from the cord, followed by postoperative SRS. Separation surgery + SRS achieves >90% local control rates.",
      };
    }
  }

  // Low-grade ESCC
  if (radio === "sensitive") {
    return {
      primary: "cEBRT or SRS",
      radiation: "cEBRT provides adequate local control for radiosensitive histology. SRS also effective.",
      surgery: needsStabilization
        ? "Surgical stabilization for mechanical instability (percutaneous or open)"
        : "No surgical indication for tumor decompression",
      details: "Low-grade ESCC with radiosensitive histology can be effectively treated with radiation alone. SRS offers higher local control rates but cEBRT is also acceptable.",
    };
  } else {
    return {
      primary: "SRS (Stereotactic Radiosurgery)",
      radiation: "SRS preferred for durable local control of radioresistant tumors",
      surgery: needsStabilization
        ? "Consider stabilization (cement augmentation, percutaneous screws, or open)"
        : "No surgical indication at this time",
      details: "Radioresistant tumors with low-grade ESCC benefit from SRS, which achieves local control rates of 85-95%. cEBRT is suboptimal for radioresistant histologies.",
    };
  }
}

const sectionColors = {
  N: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", icon: "text-violet-600" },
  O: { bg: "bg-rose-50", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", icon: "text-rose-600" },
  M: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "text-amber-600" },
  S: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-600" },
};

export default function NOMSPage() {
  const [escc, setEscc] = useState<ESCCGrade>(null);
  const [radio, setRadio] = useState<Radiosensitivity>(null);
  const [stability, setStability] = useState<Stability>(null);
  const [systemic, setSystemic] = useState<SystemicStatus>(null);

  const recommendation = getRecommendation(escc, radio, stability, systemic);
  const allSelected = escc !== null && radio !== null && stability !== null && systemic !== null;

  function OptionButton<T extends string>({
    current,
    value,
    label,
    detail,
    onChange,
  }: {
    current: T | null;
    value: T;
    label: string;
    detail: string;
    onChange: (v: T) => void;
  }) {
    const active = current === value;
    return (
      <button type="button" onClick={() => onChange(value)}
        className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-all ${
          active ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}>
        <span className="font-medium">{label}</span>
        <span className={`block text-xs mt-0.5 ${active ? "text-blue-100" : "text-gray-400"}`}>{detail}</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Decision Framework
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          NOMS Decision<br className="hidden sm:block" /> Framework
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          The MSKCC NOMS framework integrates Neurologic, Oncologic, Mechanical, and Systemic assessments to determine optimal therapy for spinal metastases, combining radiation (cEBRT/SRS) and surgical considerations.
        </p>
      </section>

      {/* Four Assessment Panels */}
      <section className="grid gap-6 sm:grid-cols-2 fade-in-up fade-delay-1">
        {/* N - Neurologic */}
        <div className={`rounded-2xl border ${sectionColors.N.border} ${sectionColors.N.bg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionColors.N.badge} font-bold text-sm`}>N</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Neurologic</h3>
              <p className="text-xs text-gray-500">Epidural Spinal Cord Compression (ESCC)</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {esccOptions.map((opt) => (
              <OptionButton key={opt.value} current={escc} value={opt.value!} label={opt.label} detail={opt.detail} onChange={setEscc as (v: string) => void} />
            ))}
          </div>
        </div>

        {/* O - Oncologic */}
        <div className={`rounded-2xl border ${sectionColors.O.border} ${sectionColors.O.bg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionColors.O.badge} font-bold text-sm`}>O</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Oncologic</h3>
              <p className="text-xs text-gray-500">Tumor radiosensitivity to cEBRT</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {radioOptions.map((opt) => (
              <OptionButton key={opt.value} current={radio} value={opt.value!} label={opt.label} detail={opt.detail} onChange={setRadio as (v: string) => void} />
            ))}
          </div>
        </div>

        {/* M - Mechanical */}
        <div className={`rounded-2xl border ${sectionColors.M.border} ${sectionColors.M.bg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionColors.M.badge} font-bold text-sm`}>M</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Mechanical</h3>
              <p className="text-xs text-gray-500">Spinal stability (SINS-based)</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {stabilityOptions.map((opt) => (
              <OptionButton key={opt.value} current={stability} value={opt.value!} label={opt.label} detail={opt.detail} onChange={setStability as (v: string) => void} />
            ))}
          </div>
          <a href="/sins" className="mt-3 inline-block text-xs text-blue-600 hover:underline">Calculate SINS score &rarr;</a>
        </div>

        {/* S - Systemic */}
        <div className={`rounded-2xl border ${sectionColors.S.border} ${sectionColors.S.bg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${sectionColors.S.badge} font-bold text-sm`}>S</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Systemic</h3>
              <p className="text-xs text-gray-500">Overall disease burden and surgical fitness</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {systemicOptions.map((opt) => (
              <OptionButton key={opt.value} current={systemic} value={opt.value!} label={opt.label} detail={opt.detail} onChange={setSystemic as (v: string) => void} />
            ))}
          </div>
        </div>
      </section>

      {/* Recommendation */}
      <section className="fade-in-up fade-delay-2">
        {allSelected && recommendation ? (
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 sm:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Treatment Recommendation</p>
            <h2 className="text-2xl font-bold text-gray-900">{recommendation.primary}</h2>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/70 border border-blue-100 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Radiation</p>
                <p className="text-sm text-gray-800">{recommendation.radiation}</p>
              </div>
              <div className="rounded-xl bg-white/70 border border-blue-100 p-4">
                <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Surgery</p>
                <p className="text-sm text-gray-800">{recommendation.surgery}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-600 leading-relaxed">{recommendation.details}</p>

            {/* Selected inputs summary */}
            <div className="mt-6 pt-4 border-t border-blue-200 grid grid-cols-4 gap-3 text-xs">
              <div><span className="text-gray-500">ESCC:</span> <span className="font-semibold text-gray-800">{escc?.toUpperCase()}</span></div>
              <div><span className="text-gray-500">Histology:</span> <span className="font-semibold text-gray-800">{radio === "sensitive" ? "Sensitive" : "Resistant"}</span></div>
              <div><span className="text-gray-500">Stability:</span> <span className="font-semibold text-gray-800">{stability?.replace("-", " ")}</span></div>
              <div><span className="text-gray-500">Systemic:</span> <span className="font-semibold text-gray-800 capitalize">{systemic}</span></div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-400">
              Complete all four assessments to see the treatment recommendation.
              <br />
              <span className="text-xs">
                {[escc, radio, stability, systemic].filter((s) => s !== null).length}/4 completed
              </span>
            </p>
          </div>
        )}
      </section>

      {/* About */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up">
        <h2 className="text-xl font-semibold text-gray-900">About NOMS</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            The NOMS (Neurologic, Oncologic, Mechanical, Systemic) framework was developed at Memorial Sloan Kettering Cancer Center as a multidisciplinary decision-making tool for spinal metastases. It integrates four sentinel assessments to determine the optimal combination of radiation therapy, surgery, and systemic therapy.
          </p>
          <p>
            The framework is dynamic -- as new treatment modalities emerge (novel systemic agents, advanced radiation techniques), they can be incorporated into the existing decision structure without changing the fundamental assessment categories.
          </p>
          <h3 className="text-base font-semibold text-gray-800 pt-2">References</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-500">
            <li>Laufer I, Rubin DG, Lis E, et al. The NOMS framework: approach to the treatment of spinal metastatic tumors. <span className="italic">Oncologist.</span> 2013;18(6):744-751. <a href="https://doi.org/10.1634/theoncologist.2012-0293" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DOI</a></li>
            <li>Bilsky MH, Laufer I, Fourney DR, et al. Reliability analysis of the epidural spinal cord compression scale. <span className="italic">J Neurosurg Spine.</span> 2010;13(3):324-328.</li>
          </ol>
        </div>
      </section>

      <RelatedTools current="/noms" />
    </div>
  );
}
