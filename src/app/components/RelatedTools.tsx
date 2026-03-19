import Link from "next/link";

const allTools = [
  { href: "/prism", label: "PRISM Calculator", desc: "Prognostic scoring for spine SBRT" },
  { href: "/myelopathy", label: "Myelopathy Risk", desc: "Nieder reirradiation tolerance" },
  { href: "/dose-budget", label: "Dose Budget", desc: "OAR remaining tolerance calculator" },
];

export function RelatedTools({ current }: { current: string }) {
  const others = allTools.filter((t) => t.href !== current);
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Related Tools</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {others.map((tool) => (
          <Link key={tool.href} href={tool.href}
            className="group flex flex-col gap-1 rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
              {tool.label} &rarr;
            </span>
            <span className="text-xs text-gray-400">{tool.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
