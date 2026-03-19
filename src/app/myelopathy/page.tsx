"use client";

import { useCallback, useMemo, useState } from "react";

/* ── types ── */
interface Treatment {
  id: number;
  dose: string;
  fractions: string;
  date: string;
  approxDate: string;
}

interface RiskResult {
  totalBED: number;
  bedPoints: number;
  shortIntervalPenalty: number;
  highSingleCoursePenalty: number;
  totalScore: number;
  riskLevel: "low" | "intermediate" | "high";
  riskPct: string;
  riskDesc: string;
}

/* ── helpers ── */
const calcBED = (totalDose: number, fractions: number, ab: number) => {
  if (!totalDose || !fractions || fractions <= 0) return 0;
  const d = totalDose / fractions;
  return Math.round(totalDose * (1 + d / ab) * 10) / 10;
};

const parseApproxDate = (s: string): Date | null => {
  const input = s.toLowerCase().trim();
  const agoMatch = input.match(/(\d+)\s*(month|year)s?\s*ago/);
  if (agoMatch) {
    const d = new Date();
    if (agoMatch[2] === "month") d.setMonth(d.getMonth() - parseInt(agoMatch[1]));
    else d.setFullYear(d.getFullYear() - parseInt(agoMatch[1]));
    return d;
  }
  const yearMatch = input.match(/^(19|20)\d{2}$/);
  if (yearMatch) return new Date(parseInt(yearMatch[0]), 5, 15);
  if (input.includes("last year")) return new Date(new Date().getFullYear() - 1, 5, 15);
  if (input.includes("recent")) { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; }
  return null;
};

const getDate = (t: Treatment): Date | null => {
  if (t.date) return new Date(t.date);
  if (t.approxDate) return parseApproxDate(t.approxDate);
  return null;
};

const bedPoints = (bed: number): number => {
  if (bed <= 120) return 0;
  if (bed <= 130) return 1;
  if (bed <= 140) return 2;
  if (bed <= 150) return 3;
  if (bed <= 160) return 4;
  if (bed <= 170) return 5;
  if (bed <= 180) return 6;
  if (bed <= 190) return 7;
  if (bed <= 200) return 8;
  return 9;
};

const riskFromScore = (score: number): Pick<RiskResult, "riskLevel" | "riskPct" | "riskDesc"> => {
  if (score <= 3)
    return { riskLevel: "low", riskPct: "~3%", riskDesc: "Low risk of spinal cord myelopathy. Generally considered acceptable for reirradiation." };
  if (score <= 6)
    return { riskLevel: "intermediate", riskPct: "~25%", riskDesc: "Intermediate risk of spinal cord myelopathy. Careful consideration of treatment benefits vs. risks required." };
  return { riskLevel: "high", riskPct: "~90%", riskDesc: "High risk of spinal cord myelopathy. Reirradiation should be approached with extreme caution." };
};

const riskColors = {
  low: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", chip: "bg-green-100 text-green-800", bar: "#16a34a" },
  intermediate: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", chip: "bg-amber-100 text-amber-800", bar: "#d97706" },
  high: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", chip: "bg-red-100 text-red-800", bar: "#dc2626" },
};

let nextId = 2;

export default function MyelopathyPage() {
  const [alphaBeta, setAlphaBeta] = useState(2);
  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: 1, dose: "", fractions: "", date: "", approxDate: "" },
  ]);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const addTreatment = () => {
    setTreatments((prev) => [...prev, { id: nextId++, dose: "", fractions: "", date: "", approxDate: "" }]);
  };

  const removeTreatment = (id: number) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTreatment = useCallback((id: number, field: keyof Treatment, value: string) => {
    setTreatments((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  }, []);

  const beds = useMemo(() => {
    return treatments.map((t) => {
      const dose = parseFloat(t.dose);
      const fx = parseInt(t.fractions);
      return calcBED(dose, fx, alphaBeta);
    });
  }, [treatments, alphaBeta]);

  const calculate = () => {
    const errs: string[] = [];
    const parsed: { bed: number; date: Date }[] = [];

    treatments.forEach((t, i) => {
      const dose = parseFloat(t.dose);
      const fx = parseInt(t.fractions);
      const date = getDate(t);
      if (!dose || dose <= 0) errs.push(`Treatment ${i + 1}: Enter a valid total dose.`);
      if (!fx || fx <= 0) errs.push(`Treatment ${i + 1}: Enter valid fractions.`);
      if (!date) errs.push(`Treatment ${i + 1}: Enter a date (exact or approximate).`);
      if (dose > 0 && fx > 0 && date) parsed.push({ bed: calcBED(dose, fx, alphaBeta), date });
    });

    if (errs.length) { setErrors(errs); setResult(null); return; }
    setErrors([]);

    parsed.sort((a, b) => a.date.getTime() - b.date.getTime());

    const totalBED = Math.round(parsed.reduce((s, p) => s + p.bed, 0) * 10) / 10;
    const bp = bedPoints(totalBED);

    let shortInterval = 0;
    for (let i = 1; i < parsed.length; i++) {
      const months = (parsed[i].date.getTime() - parsed[i - 1].date.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      if (months < 6) { shortInterval = 4.5; break; }
    }

    const highSingle = parsed.some((p) => p.bed >= 102) ? 4.5 : 0;
    const totalScore = bp + shortInterval + highSingle;

    setResult({
      totalBED,
      bedPoints: bp,
      shortIntervalPenalty: shortInterval,
      highSingleCoursePenalty: highSingle,
      totalScore,
      ...riskFromScore(totalScore),
    });
  };

  const rc = result ? riskColors[result.riskLevel] : null;

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Reirradiation Risk
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Myelopathy Risk<br className="hidden sm:block" /> Calculator
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          Based on the Nieder et al. spinal cord reirradiation tolerance model. Enter prior treatment courses to calculate cumulative BED and estimate myelopathy risk using a validated three-variable scoring system.
        </p>
      </section>

      {/* Calculator */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] fade-in-up fade-delay-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Treatment History</h2>
              <p className="mt-1 text-sm text-gray-500">Enter all prior radiation courses to the spinal cord.</p>
            </div>
          </div>

          {/* Alpha/Beta selector */}
          <div className="mt-5 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Alpha/Beta ratio:</label>
            <select
              value={alphaBeta}
              onChange={(e) => setAlphaBeta(parseFloat(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {[1, 1.5, 2, 2.5, 3, 4, 5, 10].map((v) => (
                <option key={v} value={v}>{v} Gy{v === 2 ? " (spinal cord)" : ""}</option>
              ))}
            </select>
          </div>

          {/* Treatment cards */}
          <div className="mt-6 space-y-4">
            {treatments.map((t, i) => (
              <div key={t.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Treatment {i + 1}</h3>
                  {treatments.length > 1 && (
                    <button type="button" onClick={() => removeTreatment(t.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">&times;</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-gray-500">Total Dose (Gy)</label>
                    <input type="number" step="0.1" min="0" value={t.dose} onChange={(e) => updateTreatment(t.id, "dose", e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-gray-500">Fractions</label>
                    <input type="number" min="1" value={t.fractions} onChange={(e) => updateTreatment(t.id, "fractions", e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-gray-500">Date</label>
                    <input type="date" value={t.date} onChange={(e) => updateTreatment(t.id, "date", e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-gray-500">Or approximate</label>
                    <input type="text" placeholder="e.g. 3 months ago" value={t.approxDate} onChange={(e) => updateTreatment(t.id, "approxDate", e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">BED:</span>
                  <span className="font-semibold text-gray-800 tabular-nums">{beds[i] > 0 ? `${beds[i].toFixed(1)} Gy` : "\u2014"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-3">
            <button type="button" onClick={addTreatment}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              + Add Treatment
            </button>
            <button type="button" onClick={calculate}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              Calculate Risk
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium mb-1">Please correct the following:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex flex-col gap-6">
          {result && rc ? (
            <>
              <div className={`rounded-2xl border ${rc.border} ${rc.bg} p-6 sm:p-8 shadow-sm transition-all`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Risk Assessment</p>
                    <div className="mt-2 text-4xl font-bold" style={{ color: rc.bar }}>
                      {result.riskLevel === "low" ? "Low" : result.riskLevel === "intermediate" ? "Intermediate" : "High"} Risk
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rc.chip}`}>
                        Myelopathy: {result.riskPct}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{result.riskDesc}</p>
                  </div>
                  <div className="h-16 w-2 rounded-full" style={{ backgroundColor: rc.bar }} />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Score Breakdown</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <p className="text-gray-800 font-medium">Cumulative BED</p>
                      <p className="text-xs text-gray-400">{result.totalBED} Gy</p>
                    </div>
                    <div className="text-sm font-bold tabular-nums text-gray-700">{result.bedPoints} pts</div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <p className="text-gray-800 font-medium">Short Interval Penalty</p>
                      <p className="text-xs text-gray-400">Any courses &lt;6 months apart</p>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${result.shortIntervalPenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                      {result.shortIntervalPenalty > 0 ? `+${result.shortIntervalPenalty}` : "0"} pts
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <p className="text-gray-800 font-medium">High Single Course Penalty</p>
                      <p className="text-xs text-gray-400">Any single course BED &ge;102 Gy</p>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${result.highSingleCoursePenalty > 0 ? "text-red-500" : "text-gray-400"}`}>
                      {result.highSingleCoursePenalty > 0 ? `+${result.highSingleCoursePenalty}` : "0"} pts
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm">
                    <p className="text-blue-900 font-semibold">Total Score</p>
                    <div className="text-lg font-bold tabular-nums text-blue-700">{result.totalScore}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-400">Enter treatment data and click &quot;Calculate Risk&quot; to see results.</p>
            </div>
          )}

          {/* Scoring reference */}
          <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 flex items-center justify-between">
              Scoring Reference
              <svg className="h-4 w-4 text-gray-400 transition-transform details-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Cumulative BED Points</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {[
                    ["\u2264120 Gy", "0"], ["120.1\u2013130", "1"], ["130.1\u2013140", "2"], ["140.1\u2013150", "3"],
                    ["150.1\u2013160", "4"], ["160.1\u2013170", "5"], ["170.1\u2013180", "6"], ["180.1\u2013190", "7"],
                    ["190.1\u2013200", "8"], [">200", "9"],
                  ].map(([range, pts]) => (
                    <div key={range} className="flex justify-between bg-gray-50 rounded px-2 py-1">
                      <span className="text-gray-600">{range}</span>
                      <span className="font-semibold text-gray-800">{pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Risk Interpretation</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between bg-green-50 rounded px-2 py-1"><span className="text-green-800">Score &le;3</span><span className="font-semibold text-green-800">Low (~3%)</span></div>
                  <div className="flex justify-between bg-amber-50 rounded px-2 py-1"><span className="text-amber-800">Score 4&ndash;6</span><span className="font-semibold text-amber-800">Intermediate (~25%)</span></div>
                  <div className="flex justify-between bg-red-50 rounded px-2 py-1"><span className="text-red-800">Score &gt;6</span><span className="font-semibold text-red-800">High (~90%)</span></div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* About */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up fade-delay-2">
        <h2 className="text-xl font-semibold text-gray-900">About This Calculator</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
          <p>
            This calculator implements the Nieder et al. spinal cord reirradiation tolerance model. The risk score is based on three variables: cumulative biologically effective dose (BED), treatment interval, and highest single-course BED.
          </p>
          <p>
            BED is calculated using the linear-quadratic model: BED = D &times; (1 + d/(&alpha;/&beta;)), where D is total dose, d is dose per fraction, and &alpha;/&beta; defaults to 2 Gy for spinal cord.
          </p>
          <h3 className="text-base font-semibold text-gray-800 pt-2">References</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-gray-500">
            <li>Nieder C, Grosu AL, Andratschke NH, Molls M. Proposal of human spinal cord reirradiation dose based on collection of data from 40 patients. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2005;61(3):851&ndash;855. <a href="https://doi.org/10.1016/j.ijrobp.2004.06.016" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DOI</a></li>
            <li>Nieder C, Grosu AL, Andratschke NH, Molls M. Update of human spinal cord reirradiation tolerance based on additional data from 38 patients. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2006;66(5):1446&ndash;1449. <a href="https://doi.org/10.1016/j.ijrobp.2006.07.1383" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DOI</a></li>
          </ol>
        </div>
      </section>
    </div>
  );
}
