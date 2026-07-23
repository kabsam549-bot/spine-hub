import Link from "next/link";

const assessmentTools = [
  {
    href: "/prism",
    title: "PRISM",
    description: "Estimate prognosis after spine SBRT",
  },
  {
    href: "/sins",
    title: "SINS",
    description: "Assess mechanical stability",
  },
  {
    href: "/noms",
    title: "NOMS",
    description: "Structure multidisciplinary treatment decisions",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12">
      <section className="pt-8 sm:pt-14">
        <p className="text-sm font-semibold text-blue-700">
          Spine radiation decision support
        </p>
        <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          What do you need to decide?
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Start with the clinical task. Supporting evidence and calculators
          stay available when you need them.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/dose-budget"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md sm:p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Reirradiation planning
          </span>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">
            Find the remaining OAR room
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Enter prior doses for cord, cauda, bowel, esophagus, and other
            relevant organs. Reverse-calculate physical limits across
            fractionations, compare target BED, and proof-check a candidate
            plan.
          </p>
          <span className="mt-6 inline-flex items-center text-sm font-bold text-blue-700">
            Open dose workspace <span className="ml-2">→</span>
          </span>
        </Link>

        <Link
          href="/management-algorithm"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md sm:p-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Management
          </span>
          <h2 className="mt-3 text-2xl font-bold text-slate-950">
            Work through the treatment pathway
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Review neurologic urgency, stability, prior radiation, histology,
            disease burden, epidural anatomy, and the role of surgery or
            radiation.
          </p>
          <span className="mt-6 inline-flex items-center text-sm font-bold text-blue-700">
            Open management pathway <span className="ml-2">→</span>
          </span>
        </Link>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Focused calculators
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Assess one question at a time
            </h2>
          </div>
          <Link
            href="/lived-experience"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            View regimens and constraints
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {assessmentTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-400"
            >
              <h3 className="text-lg font-bold text-slate-950">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {tool.description}
              </p>
              <span className="mt-4 block text-sm font-semibold text-blue-700">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center rounded-2xl border border-slate-200 bg-slate-100/70 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            MD Anderson regimens, constraints, and practical notes
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Review the 1-, 3-, 5-, and 10-fraction directives, target
            coverage, OAR checkpoints, published outcomes, and the situations
            in which each approach is used.
          </p>
        </div>
        <Link
          href="/lived-experience"
          className="w-fit rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open reference
        </Link>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-500">
        Spine Hub is educational clinical decision support. Institutional
        sections summarize single-center practice and supplied service
        directives. Treatment decisions require review of the original plans,
        anatomy, composite dose, institutional protocol, and multidisciplinary
        context.
      </section>
    </div>
  );
}
