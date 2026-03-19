"use client";

import { useMemo, useState } from "react";

/* ── Constraint data ── */

interface Constraint {
  oar: string;
  scenario: string;
  metric: string;
  limit: string;
  endpoint: string;
  source: string;
}

const constraints: Constraint[] = [
  // ── Spinal Cord ──
  { oar: "Spinal Cord", scenario: "Conventional (1.8\u20132 Gy/fx)", metric: "Dmax", limit: "45\u201350 Gy", endpoint: "Myelopathy <0.2%", source: "QUANTEC" },
  { oar: "Spinal Cord", scenario: "Conventional (1.8\u20132 Gy/fx)", metric: "Dmax", limit: "54 Gy", endpoint: "Myelopathy ~1%", source: "QUANTEC" },
  { oar: "Spinal Cord", scenario: "Conventional (1.8\u20132 Gy/fx)", metric: "Dmax", limit: "60 Gy", endpoint: "Myelopathy ~6%", source: "QUANTEC" },
  { oar: "Spinal Cord", scenario: "SBRT 1 fx", metric: "Dmax (0.035cc)", limit: "14 Gy", endpoint: "Myelopathy <1%", source: "Sahgal 2010 / TG-101" },
  { oar: "Spinal Cord", scenario: "SBRT 1 fx", metric: "Dmax (0.035cc)", limit: "10 Gy", endpoint: "Myelopathy <0.4%", source: "Sahgal 2010" },
  { oar: "Spinal Cord", scenario: "SBRT 3 fx", metric: "Dmax (0.035cc)", limit: "21.9 Gy", endpoint: "Myelopathy <1%", source: "Sahgal 2010" },
  { oar: "Spinal Cord", scenario: "SBRT 3 fx", metric: "D0.35cc", limit: "18 Gy", endpoint: "Myelopathy <1%", source: "TG-101" },
  { oar: "Spinal Cord", scenario: "SBRT 5 fx", metric: "Dmax (0.035cc)", limit: "30 Gy", endpoint: "Myelopathy <1%", source: "Sahgal 2010" },
  { oar: "Spinal Cord", scenario: "SBRT 5 fx", metric: "D0.035cc", limit: "25.3 Gy", endpoint: "Myelopathy <1%", source: "Sahgal 2019" },
  { oar: "Spinal Cord", scenario: "Reirradiation", metric: "Cumulative BED\u2082", limit: "\u2264120 Gy", endpoint: "Low risk (~3%)", source: "Nieder 2005/2006" },
  { oar: "Spinal Cord", scenario: "Reirradiation", metric: "Cumulative BED\u2082", limit: "120\u2013150 Gy", endpoint: "Intermediate risk", source: "Nieder 2005/2006" },
  { oar: "Spinal Cord", scenario: "Reirradiation", metric: "Interval", limit: "\u22656 months", endpoint: "Required for safe re-RT", source: "Nieder 2005/2006" },

  // ── Cauda Equina ──
  { oar: "Cauda Equina", scenario: "Conventional", metric: "Dmax", limit: "60 Gy", endpoint: "Neuropathy <5%", source: "QUANTEC" },
  { oar: "Cauda Equina", scenario: "SBRT 1 fx", metric: "Dmax", limit: "16 Gy", endpoint: "Neuropathy <1%", source: "TG-101" },
  { oar: "Cauda Equina", scenario: "SBRT 3 fx", metric: "Dmax", limit: "24 Gy", endpoint: "Neuropathy <1%", source: "TG-101" },
  { oar: "Cauda Equina", scenario: "SBRT 5 fx", metric: "D5cc", limit: "32 Gy", endpoint: "Neuropathy <1%", source: "TG-101" },

  // ── Esophagus ──
  { oar: "Esophagus", scenario: "Conventional", metric: "Dmean", limit: "34 Gy", endpoint: "Esophagitis Grade \u22653", source: "QUANTEC" },
  { oar: "Esophagus", scenario: "SBRT 1 fx", metric: "D5cc", limit: "11.9 Gy", endpoint: "Stenosis/fistula <1%", source: "TG-101" },
  { oar: "Esophagus", scenario: "SBRT 3 fx", metric: "D5cc", limit: "17.7 Gy", endpoint: "Stenosis/fistula <1%", source: "TG-101" },
  { oar: "Esophagus", scenario: "SBRT 5 fx", metric: "D5cc", limit: "19.5 Gy", endpoint: "Grade \u22653 esophagitis", source: "TG-101" },

  // ── Kidneys ──
  { oar: "Kidneys (bilateral)", scenario: "Conventional", metric: "Dmean", limit: "15\u201318 Gy", endpoint: "Renal dysfunction <5%", source: "QUANTEC" },
  { oar: "Kidneys (bilateral)", scenario: "Conventional", metric: "V20", limit: "<32%", endpoint: "Renal dysfunction <5%", source: "QUANTEC" },

  // ── Stomach ──
  { oar: "Stomach", scenario: "SBRT 1 fx", metric: "D10cc", limit: "11.2 Gy", endpoint: "Ulceration/fistula", source: "TG-101" },
  { oar: "Stomach", scenario: "SBRT 3 fx", metric: "D10cc", limit: "16.5 Gy", endpoint: "Ulceration", source: "TG-101" },

  // ── Small Bowel ──
  { oar: "Small Bowel", scenario: "Conventional", metric: "V45", limit: "<195 cc", endpoint: "Grade \u22653 toxicity <10%", source: "QUANTEC" },
  { oar: "Small Bowel", scenario: "SBRT 1 fx", metric: "D5cc", limit: "11.9 Gy", endpoint: "Obstruction/perforation", source: "TG-101" },
  { oar: "Small Bowel", scenario: "SBRT 3 fx", metric: "D5cc", limit: "15.4 Gy", endpoint: "Obstruction/perforation", source: "TG-101" },

  // ── Aorta/Great vessels ──
  { oar: "Aorta / Great Vessels", scenario: "SBRT 1 fx", metric: "D10cc", limit: "31 Gy", endpoint: "Rupture", source: "TG-101" },
  { oar: "Aorta / Great Vessels", scenario: "SBRT 3 fx", metric: "D10cc", limit: "39 Gy", endpoint: "Rupture", source: "TG-101" },

  // ── Skin ──
  { oar: "Skin", scenario: "SBRT 1 fx", metric: "D10cc", limit: "23 Gy", endpoint: "Ulceration", source: "TG-101" },
  { oar: "Skin", scenario: "SBRT 3 fx", metric: "D10cc", limit: "30 Gy", endpoint: "Ulceration", source: "TG-101" },

  // ── Trachea / Bronchus ──
  { oar: "Trachea / Large Bronchus", scenario: "SBRT 1 fx", metric: "D4cc", limit: "10.5 Gy", endpoint: "Stenosis/fistula", source: "TG-101" },
  { oar: "Trachea / Large Bronchus", scenario: "SBRT 3 fx", metric: "D4cc", limit: "15 Gy", endpoint: "Stenosis/fistula", source: "TG-101" },

  // ── Brachial Plexus ──
  { oar: "Brachial Plexus", scenario: "Conventional", metric: "Dmax", limit: "66 Gy", endpoint: "Plexopathy <5%", source: "QUANTEC" },
  { oar: "Brachial Plexus", scenario: "SBRT 1 fx", metric: "D3cc", limit: "14 Gy", endpoint: "Neuropathy", source: "TG-101" },
  { oar: "Brachial Plexus", scenario: "SBRT 3 fx", metric: "D3cc", limit: "20.4 Gy", endpoint: "Neuropathy", source: "TG-101" },
  { oar: "Brachial Plexus", scenario: "SBRT 5 fx", metric: "Dmax", limit: "30.5 Gy", endpoint: "Neuropathy", source: "TG-101" },
];

const oars = [...new Set(constraints.map((c) => c.oar))];

/* ── BED Calculator ── */
function BEDCalc() {
  const [dose, setDose] = useState("");
  const [fx, setFx] = useState("");
  const [ab, setAb] = useState("2");

  const d = parseFloat(dose);
  const f = parseInt(fx);
  const a = parseFloat(ab);
  const dpf = d && f ? d / f : 0;
  const bed = d && f && a ? Math.round(d * (1 + dpf / a) * 10) / 10 : null;
  const eqd2 = bed && a ? Math.round((bed / (1 + 2 / a)) * 10) / 10 : null;

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
      {bed !== null && (
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-500">BED: <span className="font-semibold text-gray-800">{bed} Gy</span></span>
          <span className="text-gray-500">EQD2: <span className="font-semibold text-gray-800">{eqd2} Gy</span></span>
          <span className="text-gray-500">Dose/fx: <span className="font-semibold text-gray-800">{dpf.toFixed(2)} Gy</span></span>
        </div>
      )}
    </div>
  );
}

export default function DoseBudgetPage() {
  const [filterOar, setFilterOar] = useState("all");
  const [filterScenario, setFilterScenario] = useState("all");

  const scenarios = useMemo(() => {
    const filtered = filterOar === "all" ? constraints : constraints.filter((c) => c.oar === filterOar);
    return [...new Set(filtered.map((c) => c.scenario))];
  }, [filterOar]);

  const filtered = useMemo(() => {
    let f = constraints;
    if (filterOar !== "all") f = f.filter((c) => c.oar === filterOar);
    if (filterScenario !== "all") f = f.filter((c) => c.scenario === filterScenario);
    return f;
  }, [filterOar, filterScenario]);

  // Group by OAR
  const grouped = useMemo(() => {
    const m = new Map<string, Constraint[]>();
    for (const c of filtered) {
      if (!m.has(c.oar)) m.set(c.oar, []);
      m.get(c.oar)!.push(c);
    }
    return m;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Quick Reference
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spine Radiation<br className="hidden sm:block" /> Dose Budget
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          Dose constraints for the spinal cord and nearby organs at risk in conventional fractionation and SBRT. Sourced from QUANTEC, TG-101, Sahgal et al., and Nieder et al.
        </p>
      </section>

      {/* BED Calculator */}
      <section className="fade-in-up fade-delay-1">
        <BEDCalc />
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-3 fade-in-up fade-delay-1">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Organ at Risk</label>
          <select value={filterOar} onChange={(e) => { setFilterOar(e.target.value); setFilterScenario("all"); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All OARs</option>
            {oars.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-gray-500">Scenario</label>
          <select value={filterScenario} onChange={(e) => setFilterScenario(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="all">All Scenarios</option>
            {scenarios.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      {/* Constraints table grouped by OAR */}
      <section className="space-y-6 fade-in-up fade-delay-2">
        {[...grouped.entries()].map(([oar, rows]) => (
          <div key={oar} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">{oar}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3 font-semibold">Scenario</th>
                    <th className="px-4 py-3 font-semibold">Metric</th>
                    <th className="px-4 py-3 font-semibold">Limit</th>
                    <th className="px-4 py-3 font-semibold">Endpoint</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                      <td className="px-6 py-3 text-gray-700">{row.scenario}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.metric}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">{row.limit}</td>
                      <td className="px-4 py-3 text-gray-600">{row.endpoint}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {/* Sources */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up fade-delay-3">
        <h2 className="text-xl font-semibold text-gray-900">Sources</h2>
        <ol className="mt-4 list-decimal list-inside space-y-2 text-xs leading-relaxed text-gray-500">
          <li>Marks LB, Yorke ED, Jackson A, et al. Use of normal tissue complication probability models in the clinic. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2010;76(3 Suppl):S10&ndash;S19. (QUANTEC)</li>
          <li>Benedict SH, Yenice KM, Followill D, et al. Stereotactic body radiation therapy: The report of AAPM Task Group 101. <span className="italic">Med Phys.</span> 2010;37(8):4078&ndash;4101. (TG-101)</li>
          <li>Sahgal A, Ma L, Weinberg V, et al. Reirradiation human spinal cord tolerance for stereotactic body radiotherapy. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2012;82(1):107&ndash;116.</li>
          <li>Sahgal A, Chang JH, Ma L, et al. Spinal cord dose tolerance to stereotactic body radiation therapy. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2021;110(1):124&ndash;136.</li>
          <li>Nieder C, Grosu AL, Andratschke NH, Molls M. Proposal of human spinal cord reirradiation dose. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2005;61(3):851&ndash;855.</li>
          <li>Nieder C, Grosu AL, Andratschke NH, Molls M. Update of human spinal cord reirradiation tolerance. <span className="italic">Int J Radiat Oncol Biol Phys.</span> 2006;66(5):1446&ndash;1449.</li>
        </ol>
      </section>
    </div>
  );
}
