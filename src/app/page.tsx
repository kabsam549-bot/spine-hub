import Link from "next/link";

const tools = [
  {
    href: "/prism",
    title: "PRISM Calculator",
    subtitle: "Prognostic Index for Spinal Metastases",
    description:
      "Validated composite scoring system stratifying survival in spine SBRT patients into four prognostic groups based on performance status, disease burden, and treatment history.",
    color: "blue",
  },
  {
    href: "/myelopathy",
    title: "Myelopathy Risk",
    subtitle: "Nieder Reirradiation Tolerance Model",
    description:
      "Estimate spinal cord myelopathy risk for reirradiation patients using cumulative BED, treatment interval, and single-course dose.",
    color: "amber",
  },
  {
    href: "/dose-budget",
    title: "Dose Budget",
    subtitle: "OAR Constraints Reference",
    description:
      "Quick-reference dose constraints for the spinal cord and nearby OARs in conventional fractionation and SBRT, with a built-in BED/EQD2 calculator.",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; border: string; badge: string; hover: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", hover: "hover:border-blue-300 hover:shadow-md" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700", hover: "hover:border-amber-300 hover:shadow-md" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", hover: "hover:border-emerald-300 hover:shadow-md" },
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="flex flex-col gap-4 pt-8 fade-in-up">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spine Radiation<br className="hidden sm:block" /> Clinical Tools
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-gray-500">
          A collection of validated calculators and reference tools for spine radiation therapy. Built for clinical decision support in conventional fractionation, SBRT, and reirradiation settings.
        </p>
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
              <div className="mt-4 text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                Open calculator &rarr;
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
