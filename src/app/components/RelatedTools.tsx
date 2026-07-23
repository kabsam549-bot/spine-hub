import Link from "next/link";

const allTools = [
  { href: "/management-algorithm", label: "Management Algorithm", desc: "MD Anderson multidisciplinary spine pathway" },
  { href: "/prism", label: "PRISM Calculator", desc: "Prognostic scoring for spine SBRT" },
  { href: "/sins", label: "SINS Calculator", desc: "Spinal instability neoplastic score" },
  { href: "/noms", label: "NOMS Framework", desc: "Multidisciplinary treatment decision support" },
  { href: "/myelopathy", label: "Legacy Myelopathy Model", desc: "Historical Nieder reference" },
  { href: "/dose-budget", label: "OAR Dose Workspace", desc: "Multi-organ budgets and regimen comparison" },
];

export function RelatedTools({ current }: { current: string }) {
  const others = allTools.filter((t) => t.href !== current);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="mb-3 text-base font-semibold text-slate-950">Related tools</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {others.map((tool) => (
          <Link key={tool.href} href={tool.href}
            className="group flex flex-col gap-1 rounded-xl border border-slate-100 p-4 transition hover:border-slate-300 hover:bg-slate-50">
            <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700">
              {tool.label} &rarr;
            </span>
            <span className="text-xs text-slate-500">{tool.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
