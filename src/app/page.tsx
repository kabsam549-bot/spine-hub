import Link from "next/link";

const tools = [
  {
    href: "/prism",
    title: "PRISM",
    subtitle: "Prognostic Index for Spinal Metastases",
    description: "Validated scoring system stratifying survival in spine SBRT patients into four prognostic groups.",
    stats: "6 variables, 4 groups",
    color: "blue",
    category: "Prognosis",
  },
  {
    href: "/sins",
    title: "SINS",
    subtitle: "Spinal Instability Neoplastic Score",
    description: "Six-component assessment of spinal instability in neoplastic disease to guide surgical referral decisions.",
    stats: "6 components, 0-18 range",
    color: "violet",
    category: "Stability",
  },
  {
    href: "/noms",
    title: "NOMS",
    subtitle: "Treatment Decision Framework",
    description: "MSKCC decision framework integrating neurologic, oncologic, mechanical, and systemic assessments for spine metastases.",
    stats: "4 assessments",
    color: "rose",
    category: "Treatment",
  },
  {
    href: "/myelopathy",
    title: "Myelopathy Risk",
    subtitle: "Nieder Reirradiation Tolerance",
    description: "Estimate spinal cord myelopathy risk using cumulative BED, treatment interval, and single-course dose thresholds.",
    stats: "3-variable scoring",
    color: "amber",
    category: "Reirradiation",
  },
  {
    href: "/dose-budget",
    title: "Dose Budget",
    subtitle: "OAR Tolerance Calculator",
    description: "Interactive dose budget for 13 spine OARs with tissue recovery modeling and physical dose conversion.",
    stats: "13 OARs, 3 tiers",
    color: "emerald",
    category: "Planning",
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; hover: string; stat: string; cat: string }> = {
  blue: { bg: "bg-blue-50/70", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", hover: "hover:border-blue-300 hover:shadow-md", stat: "text-blue-600", cat: "text-blue-500" },
  violet: { bg: "bg-violet-50/70", border: "border-violet-200", badge: "bg-violet-100 text-violet-700", hover: "hover:border-violet-300 hover:shadow-md", stat: "text-violet-600", cat: "text-violet-500" },
  rose: { bg: "bg-rose-50/70", border: "border-rose-200", badge: "bg-rose-100 text-rose-700", hover: "hover:border-rose-300 hover:shadow-md", stat: "text-rose-600", cat: "text-rose-500" },
  amber: { bg: "bg-amber-50/70", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", hover: "hover:border-amber-300 hover:shadow-md", stat: "text-amber-600", cat: "text-amber-500" },
  emerald: { bg: "bg-emerald-50/70", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", hover: "hover:border-emerald-300 hover:shadow-md", stat: "text-emerald-600", cat: "text-emerald-500" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col gap-6 pt-8 sm:pt-12 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Clinical Decision Support
        </div>
        <h1 className="text-4xl font-bold leading-[1.1] text-gray-900 sm:text-5xl lg:text-6xl tracking-tight">
          SpineRT
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-gray-500">
          Validated clinical tools for spine radiation therapy. Prognostic scoring, stability assessment, treatment decision support, reirradiation safety, and dose planning -- in one place.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400 font-medium">
          <span>QUANTEC</span>
          <span>TG-101</span>
          <span>Sahgal HyTEC</span>
          <span>Nieder</span>
          <span>Fisher SOSG</span>
          <span>Laufer MSKCC</span>
        </div>
      </section>

      {/* Tool grid */}
      <section className="fade-in-up fade-delay-1">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const c = colorMap[tool.color];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group relative rounded-2xl border ${c.border} ${c.bg} p-6 transition-all ${c.hover}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${c.cat}`}>
                    {tool.category}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}>
                    {tool.stats}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{tool.subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
                <div className="mt-4 text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                  Open &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Evidence base */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10 fade-in-up fade-delay-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Evidence Base</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-500 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-700 mb-1">Prognostic Scoring</p>
            <p>Jensen et al. IJROBP 2017 (PRISM). Florez, De, Kowalchuk et al. Radiother Oncol 2024 (external validation).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Stability Assessment</p>
            <p>Fisher et al. Spine 2010 (SINS). Fourney et al. JCO 2011 (validation). Spine Oncology Study Group consensus.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Treatment Framework</p>
            <p>Laufer, Bilsky et al. Oncologist 2013 (NOMS). MSKCC multidisciplinary spine team paradigm.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Cord Reirradiation</p>
            <p>Nieder et al. IJROBP 2005, 2006. Sahgal et al. IJROBP 2012, 2021 (HyTEC).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Dose Constraints</p>
            <p>QUANTEC (Marks 2010). AAPM TG-101 (Benedict 2010). Kirkpatrick et al. IJROBP 2010.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">ESCC Grading</p>
            <p>Bilsky et al. J Neurosurg Spine 2010. Six-point SOSG epidural compression scale.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
