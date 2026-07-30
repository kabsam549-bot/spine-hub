import Link from "next/link";

const pathwaySteps = [
  {
    number: "01",
    title: "Define urgency and treatment intent",
    description:
      "Identify neurologic compromise, mechanical pain or instability, systemic reserve, prior treatment, and whether the immediate goal is durable local control, decompression support, or symptom relief.",
    actions: ["Review MRI and ESCC grade", "Clarify neurologic symptoms and trajectory", "Review prior RT plans and cumulative OAR exposure"],
  },
  {
    number: "02",
    title: "Complete the core assessments",
    description:
      "Use prognosis, stability, and NOMS assessments together. A score is an input to multidisciplinary judgment, not a treatment recommendation by itself.",
    actions: ["Estimate prognosis with PRISM", "Assess instability with SINS", "Integrate neurologic, oncologic, mechanical, and systemic factors with NOMS"],
  },
  {
    number: "03",
    title: "Choose the local strategy",
    description:
      "For high-grade epidural disease or mechanical instability, discuss surgical decompression or stabilization first. For radiation-alone candidates, choose conventional RT or SBRT based on disease extent, anatomy, prior RT, and ability to meet OAR constraints.",
    actions: ["Multidisciplinary surgical review when indicated", "Choose conventional RT versus SBRT", "Define target, image guidance, and setup requirements"],
  },
  {
    number: "04",
    title: "Select and validate the regimen",
    description:
      "Match fractionation to the clinical scenario, target geometry, and normal-tissue limits. For reirradiation, complete cumulative EQD2 review before finalizing a plan.",
    actions: ["Use the regimen guide below as a planning starting point", "Run the OAR Dose Budget for prior RT", "Document rationale, constraints, and follow-up plan"],
  },
];

const assessmentTools = [
  {
    href: "/prism",
    title: "PRISM",
    detail: "Prognostic Index for Spinal Metastases",
    use: "Estimate survival group to support proportionality of local therapy.",
  },
  {
    href: "/sins",
    title: "SINS",
    detail: "Spinal Instability Neoplastic Score",
    use: "Screen for mechanical instability and need for surgical consultation.",
  },
  {
    href: "/noms",
    title: "NOMS",
    detail: "Neurologic, Oncologic, Mechanical, Systemic framework",
    use: "Integrate ESCC, histology, stability, and systemic fitness into a local-treatment strategy.",
  },
  {
    href: "/dose-budget",
    title: "Dose Budget",
    detail: "Cumulative OAR EQD2 review",
    use: "Review prior RT and remaining OAR budget before reirradiation planning.",
  },
];

const regimens = [
  {
    regimen: "8 Gy × 1",
    category: "Conventional palliation",
    use: "Limited-prognosis disease, symptom-focused treatment, or when a brief course is the priority.",
  },
  {
    regimen: "20 Gy / 5 fx",
    category: "Conventional palliation",
    use: "Symptom-focused treatment when a short multi-fraction course is appropriate.",
  },
  {
    regimen: "30 Gy / 10 fx",
    category: "Conventional RT",
    use: "When a more protracted conventional course is selected for disease control or palliation.",
  },
  {
    regimen: "24 Gy / 2 fx",
    category: "SBRT",
    use: "Ablative-intent spine SBRT when anatomy, setup, and OAR constraints permit a two-fraction approach.",
  },
  {
    regimen: "27 Gy / 3 fx",
    category: "SBRT",
    use: "Spine SBRT when three fractions improve normal-tissue feasibility or target coverage relative to a more condensed schedule.",
  },
  {
    regimen: "30 Gy / 3 fx",
    category: "SBRT",
    use: "Selected SBRT cases needing a higher biologic dose while maintaining acceptable target geometry and OAR limits.",
  },
  {
    regimen: "30 Gy / 5 fx",
    category: "Hypofractionated SBRT",
    use: "Larger, complex, or OAR-adjacent targets where five fractions improve plan feasibility.",
  },
  {
    regimen: "35-40 Gy / 5 fx",
    category: "Hypofractionated SBRT",
    use: "Highly selected durable-control cases after multidisciplinary review, target-volume assessment, and OAR validation.",
  },
];

export default function PathwayPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="max-w-3xl pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />Clinical Workflow
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spine treatment pathway
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
          A practical sequence for moving from presentation to a treatment strategy, regimen selection, and reirradiation review.
        </p>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pathway</h2>
            <p className="mt-1 text-sm text-gray-500">Work through the clinical question before choosing a dose and fractionation.</p>
          </div>
          <Link href="/noms" className="hidden text-sm font-semibold text-blue-600 hover:text-blue-700 sm:block">Open NOMS framework →</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {pathwaySteps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold tracking-widest text-blue-600">{step.number}</span>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
              <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs leading-relaxed text-gray-500">
                {step.actions.map((action) => <li key={action} className="flex gap-2"><span className="font-bold text-blue-600">•</span><span>{action}</span></li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900">Assessment tools</h2>
        <p className="mt-1 text-sm text-gray-500">Use these tools at the relevant decision point, not in isolation.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {assessmentTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">{tool.title}</h3>
              <p className="mt-1 text-xs font-medium text-gray-400">{tool.detail}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.use}</p>
              <p className="mt-4 text-sm font-semibold text-blue-600">Open tool →</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Fractionation guide</p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">Regimens and when to consider them</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">Common SpineRT planning regimens. The appropriate schedule depends on treatment intent, epidural disease, stability, target extent, prior RT, setup, and achievable OAR constraints.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {regimens.map((item) => (
              <article key={item.regimen} className="rounded-xl border border-white/80 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.regimen}</h3>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">{item.category}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.use}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-blue-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-xs leading-relaxed text-blue-900">For any reirradiation plan, verify the cumulative OAR budget and inspect the prior treatment plan. These entries are planning prompts, not prescriptive institutional protocols.</p>
            <Link href="/dose-budget" className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">Open Dose Budget</Link>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
        <strong>Clinical use note.</strong> This pathway supports structured discussion and does not replace multidisciplinary review, prior-plan review, or institutional protocols.
      </section>
    </div>
  );
}
