import Link from "next/link";

const supportingTools = [
  {
    href: "/prism",
    title: "PRISM",
    subtitle: "Prognostic Index for Spinal Metastases",
    description:
      "Validated scoring system stratifying survival in spine SBRT patients into four prognostic groups.",
    stats: "6 variables, 4 groups",
  },
  {
    href: "/sins",
    title: "SINS",
    subtitle: "Spinal Instability Neoplastic Score",
    description:
      "Six-component assessment of spinal instability to guide surgical referral decisions.",
    stats: "6 components, 0-18",
  },
  {
    href: "/noms",
    title: "NOMS",
    subtitle: "Treatment Decision Framework",
    description:
      "MSKCC framework integrating neurologic, oncologic, mechanical, and systemic assessments.",
    stats: "4 assessments",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="flex flex-col gap-5 pt-8 sm:pt-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Spine Radiation Tools
        </div>
        <h1 className="text-4xl font-bold leading-[1.1] text-gray-900 sm:text-5xl lg:text-6xl tracking-tight">
          SpineRT
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-gray-500">
          Clinical decision support for spine radiation therapy. Dose planning,
          prognostic scoring, stability assessment, and treatment frameworks,
          built on published evidence and institutional experience.
        </p>
      </section>

      {/* Dose Budget: Featured */}
      <section>
        <Link
          href="/dose-budget"
          className="group relative block rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-8 sm:p-10 transition-all hover:border-blue-400 hover:shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                  Primary Tool
                </span>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  13 OARs, 3 risk levels
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                Dose Budget Calculator
              </h2>
              <p className="text-sm leading-relaxed text-gray-600 max-w-xl">
                Calculate remaining OAR dose budgets for reirradiation using
                EQD2 with adjustable risk tolerance. Enter prior courses, select
                organs at risk, and get real-time remaining dose with visual
                breakdowns. Includes standalone BED/EQD2 converter.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-medium">
                <span>EQD2 budgets</span>
                <span>Risk tolerance toggle</span>
                <span>Multi-OAR support</span>
                <span>Visual dose bar</span>
                <span>BED/EQD2 widget</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white group-hover:bg-blue-700 transition-colors">
                Open Calculator
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Supporting Tools */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
          Assessment Tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {supportingTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                  {tool.stats}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-400 mb-2">
                {tool.subtitle}
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                {tool.description}
              </p>
              <div className="mt-3 text-sm font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
                Open &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Our Data link */}
      <section>
        <Link
          href="/lived-experience"
          className="group block rounded-xl border border-gray-200 bg-gray-50/50 p-6 transition-all hover:border-blue-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Our Data
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Published MD Anderson spine SBRT experience: dose regimens,
                volume thresholds, local control rates, and OAR constraints by
                fractionation scheme.
              </p>
            </div>
            <span className="text-gray-400 group-hover:text-blue-500 transition-colors text-lg">
              &rarr;
            </span>
          </div>
        </Link>
      </section>

      {/* Evidence Base */}
      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          Evidence Base
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs text-gray-500 leading-relaxed">
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Prognostic Scoring
            </p>
            <p>
              Jensen et al. IJROBP 2017 (PRISM). Florez, De, Kowalchuk et al.
              Radiother Oncol 2024 (external validation).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Stability Assessment
            </p>
            <p>
              Fisher et al. Spine 2010 (SINS). Fourney et al. JCO 2011
              (validation). Spine Oncology Study Group consensus.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Treatment Framework
            </p>
            <p>
              Laufer, Bilsky et al. Oncologist 2013 (NOMS). MSKCC
              multidisciplinary spine team paradigm.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Cord Reirradiation
            </p>
            <p>
              Nieder et al. IJROBP 2005, 2006. Sahgal et al. IJROBP 2012, 2021
              (HyTEC).
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">
              Dose Constraints
            </p>
            <p>
              QUANTEC (Marks 2010). AAPM TG-101 (Benedict 2010). Kirkpatrick et
              al. IJROBP 2010.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">ESCC Grading</p>
            <p>
              Bilsky et al. J Neurosurg Spine 2010. Six-point SOSG epidural
              compression scale.
            </p>
          </div>
        </div>
      </section>

      {/* Disclaimer + Program Info */}
      <section className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-900 leading-relaxed">
          <strong className="font-semibold">Educational Use Only:</strong> This
          platform is for educational purposes only and is not a clinical
          decision-making tool. All treatment decisions should be made by the
          treating physician in consultation with institutional protocols and
          multidisciplinary teams.
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 leading-relaxed space-y-3">
          <p>
            <strong className="font-semibold text-gray-900">
              MD Anderson Cancer Center, CNS Division
            </strong>{" "}
            -- Developed by the CNS Radiation Oncology Division at The
            University of Texas MD Anderson Cancer Center. Our team specializes
            in stereotactic radiosurgery and hypofractionated radiotherapy for
            primary and metastatic spine tumors.
          </p>
          <p className="text-xs text-gray-400">
            Institutional data sections reflect single-center published
            experience. Treatment approaches should be adapted to individual
            patient circumstances and institutional capabilities.
          </p>
        </div>
      </section>
    </div>
  );
}
