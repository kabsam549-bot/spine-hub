import Link from "next/link";

type NodeProps = {
  x: number;
  y: number;
  width: number;
  height?: number;
  children: React.ReactNode;
  kind?: "decision" | "action" | "neutral";
};

function Node({ x, y, width, height = 58, children, kind = "neutral" }: NodeProps) {
  const fill = kind === "decision" ? "#fff3cd" : kind === "action" ? "#e5f3df" : "#ffffff";
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="5" fill={fill} stroke="#1f2937" strokeWidth="2" />
      <foreignObject x={x + 10} y={y + 6} width={width - 20} height={height - 12}>
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#111827", fontSize: "15px", fontWeight: 600, lineHeight: 1.2 }}>
          {children}
        </div>
      </foreignObject>
    </g>
  );
}

function Line({ points, label }: { points: string; label?: { x: number; y: number; text: string } }) {
  return (
    <g>
      <polyline points={points} fill="none" stroke="#374151" strokeWidth="2" markerEnd="url(#arrow)" />
      {label && <text x={label.x} y={label.y} fill="#374151" fontSize="13" fontWeight="600">{label.text}</text>}
    </g>
  );
}

const templates = [
  "RT-naive, radiosensitive: 18/16 Gy × 1, or 30/24 Gy × 3.",
  "RT-naive, radioresistant: 24/16 Gy × 1, or 30/24 Gy × 3.",
  "Prior cEBRT, radiosensitive: 27/21 Gy × 3 after cumulative OAR review.",
  "Prior cEBRT, radioresistant: 27/24 Gy × 3 after cumulative OAR review.",
  "Post-SBRT salvage: no automatic template. Reconstruct composite dose and individualize.",
  "Bilsky 1c or greater: assess separation strategy before SSRS if neural constraints compromise coverage.",
];

export default function PathwayPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      <section className="max-w-4xl pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600"><span className="h-px w-8 bg-blue-600" />MD Anderson framework</div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">Spine metastasis management pathway</h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">The clinical pathway, reproduced as a decision tree from the simplified MD Anderson Spine Metastasis Management Algorithm. Yellow nodes require imaging or clinical assessment input.</p>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><strong>Scope.</strong> This is an educational decision-support pathway, not an autonomous prescription engine. Urgent cord compression, imaging review, prior-plan review, multidisciplinary input, and institutional protocols remain required.</div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-7">
          <h2 className="text-xl font-bold text-gray-900">Management algorithm</h2>
          <p className="mt-1 text-sm text-gray-500">Scroll horizontally on smaller screens to follow every branch.</p>
        </div>
        <div className="overflow-x-auto bg-slate-50 p-5 sm:p-8">
          <svg viewBox="0 0 1280 1260" role="img" aria-label="MD Anderson spine metastasis management decision tree" className="min-w-[960px] w-full rounded-xl bg-white shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#374151" /></marker>
            </defs>

            <Node x={510} y={35} width={260}>Prognosis</Node>
            <Line points="640,93 640,125 240,125 240,160" label={{ x: 350, y: 118, text: "LE ≤3 months" }} />
            <Line points="640,93 640,160" label={{ x: 655, y: 128, text: "LE >3 months" }} />
            <Node x={90} y={160} width={300} kind="action">Consider supportive care, cEBRT, or ablation</Node>
            <Node x={510} y={160} width={260}>Neurological status</Node>

            <Line points="640,218 640,245 430,245 430,285" label={{ x: 470, y: 238, text: "Intact" }} />
            <Line points="640,218 640,245 920,245 920,285" label={{ x: 760, y: 238, text: "Not intact" }} />
            <Node x={280} y={285} width={300} kind="decision">Mechanically stable?<sup>1</sup></Node>
            <Node x={790} y={285} width={260} kind="action">Decompression / stabilization</Node>

            <Line points="430,343 430,380 220,380 220,425" label={{ x: 335, y: 373, text: "No" }} />
            <Line points="430,343 430,380 600,380 600,425" label={{ x: 490, y: 373, text: "Yes" }} />
            <Node x={70} y={425} width={300} kind="action">Surgically stabilize<sup>2</sup></Node>
            <Node x={470} y={425} width={300} kind="decision">Indication to treat<sup>3</sup></Node>
            <Line points="370,454 470,454" />

            <Line points="600,483 600,535" />
            <Node x={470} y={535} width={300} kind="decision">Previous cEBRT?</Node>
            <Line points="620,593 620,660" label={{ x: 635, y: 632, text: "No" }} />
            <Line points="770,564 1110,564 1110,890 930,890" label={{ x: 860, y: 556, text: "Yes" }} />
            <Line points="920,343 920,660" />
            <Node x={470} y={660} width={300}>Radiosensitive?</Node>

            <Line points="620,718 620,760" label={{ x: 635, y: 747, text: "Yes" }} />
            <Line points="770,689 930,689 930,890" label={{ x: 835, y: 680, text: "No" }} />
            <Node x={470} y={760} width={300} kind="decision">Oligometastatic or oligoprogressive?</Node>
            <Line points="620,818 620,850 325,850 325,915" label={{ x: 405, y: 842, text: "No" }} />
            <Line points="620,818 620,850 930,850 930,890" label={{ x: 755, y: 842, text: "Yes" }} />
            <Node x={175} y={915} width={300} kind="action">cEBRT</Node>
            <Node x={780} y={890} width={300} kind="decision">Epidural disease</Node>

            <Line points="930,948 930,985 680,985 680,1045" label={{ x: 620, y: 978, text: "Does not touch spinal cord (Bilsky 0-1b)" }} />
            <Line points="930,948 930,985 1090,985 1090,1045" label={{ x: 968, y: 978, text: "Touches/compresses spinal cord (Bilsky 1c-3)" }} />
            <Node x={530} y={1045} width={300} kind="action">SSRS</Node>
            <Node x={940} y={1045} width={300} kind="action">Separation surgery<sup>4</sup></Node>
            <Line points="940,1074 830,1074" />

            <text x="40" y="1180" fill="#4b5563" fontSize="14">1 Mechanical stability: SINS plus mechanical pain. 2 Instrumented fusion or cement augmentation. 3 Epidural disease, oligometastatic/oligoprogressive setting, or local failure following cEBRT.</text>
            <text x="40" y="1210" fill="#4b5563" fontSize="14">4 Separation surgery may include percutaneous ablation (for example, LITT) in specific cases. cEBRT: conventional external beam RT. SSRS: spine stereotactic radiosurgery.</text>
          </svg>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Supporting assessments</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Use the tools at their branch point</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[{ href: "/prism", name: "PRISM", detail: "Prognosis" }, { href: "/sins", name: "SINS", detail: "Mechanical stability" }, { href: "/noms", name: "NOMS", detail: "Integrated local strategy" }].map((tool) => (
              <Link key={tool.href} href={tool.href} className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50">
                <p className="font-bold text-gray-900">{tool.name}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{tool.detail}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Reirradiation checkpoint</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Review actual prior OAR dose before a new plan</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">For the prior-cEBRT branch, use actual OAR dose from the prior plan/DVH and a selected cumulative EQD2 ceiling. Do not substitute prescription dose.</p>
          <Link href="/dose-budget" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Open cumulative OAR Dose Budget</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Template guide</p>
        <h2 className="mt-2 text-xl font-bold text-gray-900">Planning templates, after the pathway branch</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {templates.map((template) => <p key={template} className="rounded-xl border border-gray-200 bg-white p-4 leading-relaxed text-gray-600">{template}</p>)}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-gray-500">These are service-template starting points, not outputs of the published algorithm or replacements for plan-specific anatomy, target coverage, institutional constraints, and cumulative OAR review.</p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm leading-relaxed text-gray-600"><strong className="text-gray-900">Source:</strong> Bahouth SM, Yeboa DN, Ghia AJ, et al. <em>Advances in the management of spinal metastases: what the radiologist needs to know.</em> Br J Radiol. 2023;96:20220267. <a className="font-semibold text-blue-600 hover:underline" href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10997009/" target="_blank" rel="noreferrer">Read the open-access article</a>.</section>
    </div>
  );
}
