import Link from "next/link";

const tools = [
  {
    href: "/prism",
    title: "PRISM Calculator",
    subtitle: "Prognostic Index for Spinal Metastases",
    description:
      "Validated composite scoring system stratifying survival in spine SBRT patients into four prognostic groups based on performance status, disease burden, and treatment history.",
    stats: "6 variables, 4 groups",
    color: "blue",
  },
  {
    href: "/myelopathy",
    title: "Myelopathy Risk",
    subtitle: "Nieder Reirradiation Tolerance Model",
    description:
      "Estimate spinal cord myelopathy risk for reirradiation patients using cumulative BED, treatment interval, and single-course dose thresholds.",
    stats: "3-variable scoring, 3 risk tiers",
    color: "amber",
  },
  {
    href: "/dose-budget",
    title: "Dose Budget",
    subtitle: "OAR Tolerance Calculator",
    description:
      "Interactive dose budget planner for 13 spine OARs. Enter prior doses per organ, account for tissue recovery over time, and see remaining tolerance with physical dose conversions.",
    stats: "13 OARs, 3 toxicity tiers",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; hover: string; stat: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", hover: "hover:border-blue-300 hover:shadow-md", stat: "text-blue-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", hover: "hover:border-amber-300 hover:shadow-md", stat: "text-amber-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", hover: "hover:border-emerald-300 hover:shadow-md", stat: "text-emerald-600" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col gap-6 pt-8 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Clinical Decision Support
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spine Radiation<br className="hidden sm:block" /> Clinical Tools
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          A collection of validated calculators and reference tools for spine radiation therapy. Built for clinical decision support in conventional fractionation, SBRT, and reirradiation settings.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <span>QUANTEC</span>
          <span className="text-gray-200">|</span>
          <span>TG-101</span>
          <span className="text-gray-200">|</span>
          <span>Sahgal HyTEC</span>
          <span className="text-gray-200">|</span>
          <span>Nieder</span>
          <span className="text-gray-200">|</span>
          <span>Kirkpatrick</span>
        </div>
      </section>

      {/* Tool cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 fade-in-up fade-delay-1">
        {tools.map((tool) => {
          const c = colorMap[tool.color];
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group rounded-2xl border ${c.border} ${c.bg} p-6 transition-all ${c.hover}`}
            >
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.badge}`}>
                {tool.subtitle}
              </span>
              <h2 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {tool.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {tool.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-medium ${c.stat}`}>{tool.stats}</span>
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                  Open &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Evidence base */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 fade-in-up fade-delay-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence Base</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-500 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-700 mb-1">Prognostic Scoring</p>
            <p>Jensen et al. IJROBP 2017 (PRISM development). Florez, De, Kowalchuk et al. Radiother Oncol 2024 (external validation, Mayo + MDACC cohorts).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Cord Reirradiation</p>
            <p>Nieder et al. IJROBP 2005, 2006 (40 + 38 patients, three-variable risk score). Sahgal et al. IJROBP 2012, 2021 (HyTEC cord SBRT tolerance).</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Dose Constraints</p>
            <p>QUANTEC (Marks 2010). AAPM TG-101 (Benedict 2010). Kirkpatrick et al. IJROBP 2010 (dose-volume effects).</p>
          </div>
        </div>
      </section>
    </div>
  );
}
