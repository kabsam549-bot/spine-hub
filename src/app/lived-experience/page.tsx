import Link from "next/link";
import {
  ESTRO_ISRS_RERT_REGIMENS,
  MDACC_DE_NOVO_SERVICE_TEMPLATES,
  MDACC_DOSE_SELECTION_MATRIX,
  MDACC_OAR_PLANNING_GOALS,
  MDACC_RERT_REGIMENS,
  MDACC_RERT_SERVICE_TEMPLATES,
  PUBLISHED_CORD_RERT_DMAX,
  SPINE_REFERENCES,
  regimenRadiobiology,
} from "@/lib/spineClinicalData";

const evidenceStyles = {
  "Published MD Anderson series": "bg-emerald-100 text-emerald-800",
  "Published MD Anderson workflow": "bg-blue-100 text-blue-800",
  "MD Anderson program practice": "bg-amber-100 text-amber-800",
  "International consensus": "bg-violet-100 text-violet-800",
};

function ReferenceLinks({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return (
      <span className="text-xs font-medium text-amber-700">
        Faculty confirmation requested before public release
      </span>
    );
  }

  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {ids.map((id) => {
        const reference = SPINE_REFERENCES.find((item) => item.id === id);
        if (!reference) return null;
        return (
          <a
            key={id}
            href={reference.href}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {reference.short}
          </a>
        );
      })}
    </span>
  );
}

export default function LivedExperiencePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="fade-in-up">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Evidence and institutional practice
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          MD Anderson Spine Experience
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-500">
          A living reference for published MD Anderson dose regimens, current
          program practice, neural reirradiation limits, and OAR planning goals.
          Every item is labeled by evidence type so institutional practice is
          not mistaken for a validated universal standard.
        </p>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          Single-center experience and program-reported regimens require
          multidisciplinary review. Target prescription must never be selected
          from an OAR budget alone. Prior plan retrieval, image registration,
          contour review, and composite dose assessment remain essential.
        </div>
      </section>

      <section className="fade-in-up fade-delay-1">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Reirradiation regimen ladder
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
              These are options to discuss after prior radiation, especially
              after prior stereotactic treatment. Moving down the list generally
              shortens the course and demands increasingly favorable target
              geometry and OAR clearance. The displayed BED values should be
              used to compare biologic intensity.
            </p>
          </div>
          <Link
            href="/dose-budget"
            className="inline-flex flex-none items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Test cord budget
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {MDACC_RERT_REGIMENS.map((regimen, index) => {
            const biology = regimenRadiobiology(regimen);
            return (
              <article
                key={regimen.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {regimen.name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          evidenceStyles[regimen.evidence]
                        }`}
                      >
                        {regimen.evidence}
                      </span>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
                      {regimen.scenario}
                    </p>
                  </div>
                  <span className="w-fit rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    {regimen.intensity}
                  </span>
                </div>

                {biology && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                        GTV BED10
                      </p>
                      <p className="mt-0.5 font-bold text-blue-950">
                        {biology.gtv.bed} Gy
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                        GTV EQD2₁₀
                      </p>
                      <p className="mt-0.5 font-bold text-blue-950">
                        {biology.gtv.eqd2} Gy
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        CTV BED10
                      </p>
                      <p className="mt-0.5 font-bold text-gray-900">
                        {biology.ctv.bed} Gy
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        CTV EQD2₁₀
                      </p>
                      <p className="mt-0.5 font-bold text-gray-900">
                        {biology.ctv.eqd2} Gy
                      </p>
                    </div>
                  </div>
                )}

                {regimen.outcome && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
                    <span className="font-semibold">Published outcome: </span>
                    {regimen.outcome}
                  </div>
                )}

                <p className="mt-4 text-xs leading-relaxed text-gray-500">
                  {regimen.note}
                </p>
                <div className="mt-3">
                  <ReferenceLinks ids={regimen.referenceIds} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Dose selection by prior RT and histology
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          This matrix summarizes the published MD Anderson workflow and the
          supplied service-template directive. It is a starting point for
          regimen discussion, not an automatic prescription selector.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Prior RT setting
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Histology
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Template prescription
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Interpretation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {MDACC_DOSE_SELECTION_MATRIX.map((row) => (
                <tr
                  key={`${row.setting}-${row.histology}-${row.prescription}`}
                  className="align-top"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {row.setting}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.histology}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {row.prescription}
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-gray-500">
                    {row.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          After prior SBRT, the broader salvage ladder above may be more useful
          than a single template row. Target extent, epidural geometry, mapped
          neural dose, adjacent OAR overlap, histology, and treatment intent
          determine whether 10, 5, 3, or selected single-fraction treatment is
          reasonable.
        </p>
        <div className="mt-3">
          <ReferenceLinks ids={["mackin-2026"]} />
        </div>
      </section>

      <section className="rounded-2xl border border-violet-200 bg-violet-50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-800">
              International consensus
            </span>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">
              ESTRO-ISRS 2026 reirradiation options
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              The consensus panel recommends spine SBRT reirradiation for
              carefully selected patients and lists the following schedules. It
              also recommends the HyTEC 2021 spinal cord limits, MRI-based target
              and OAR delineation, and highly conformal image-guided delivery.
            </p>
          </div>
          <div className="grid flex-none grid-cols-2 gap-2">
            {ESTRO_ISRS_RERT_REGIMENS.map((regimen) => (
              <span
                key={regimen}
                className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-center text-xs font-bold text-violet-900"
              >
                {regimen}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <ReferenceLinks ids={["alongi-2026"]} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          MD Anderson service templates and directive extracts
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          The following planning details come from an internal summary of MD
          Anderson Brocade CNS/Spine service templates and a supplied
          5-fraction directive extract. Approval status is stated for each.
          These items are separate from peer-reviewed evidence and are not
          cumulative lifetime dose limits.
        </p>
        <div className="mt-5 space-y-3">
          {[
            ...MDACC_DE_NOVO_SERVICE_TEMPLATES,
            ...MDACC_RERT_SERVICE_TEMPLATES,
          ].map((template) => (
            <details
              key={template.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <summary className="cursor-pointer list-none">
                <span className="block text-sm font-bold text-gray-900">
                  {template.name}
                </span>
                <span className="mt-1 block text-xs text-blue-700">
                  {template.status}
                </span>
              </summary>
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Target and coverage
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
                    {template.targetCoverage.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Use notes
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
                    {template.notes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-gray-700">
                          OAR
                        </th>
                        <th className="px-3 py-2 font-semibold text-gray-700">
                          Template constraint
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {template.oars.map((oar) => (
                        <tr key={oar.organ}>
                          <td className="px-3 py-2 font-semibold text-gray-900">
                            {oar.organ}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {oar.constraint}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          The 5-fraction extract is included, but its administrative and
          approval fields were blank, so it remains labeled as program
          practice rather than a finalized service standard. No routine
          single-fraction reirradiation directive was supplied. The
          cord-relaxation trial described in the local file is protocol-specific
          and is intentionally not presented here as a routine salvage
          constraint set.
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Cord and thecal sac reirradiation guardrails
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          HyTEC identifies a combination of factors associated with lower
          myelopathy risk. These are not independent checkboxes. The calculator
          applies all three dose conditions and shows a separate time alert.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cumulative Dmax", "≤70 Gy EQD2₂"],
            ["New-course Dmax", "≤25 Gy EQD2₂"],
            ["New / cumulative", "≤0.50"],
            ["Minimum interval", "≥5 months"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-blue-200 bg-blue-50 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-blue-950">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ReferenceLinks ids={["sahgal-2021", "alongi-2026"]} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          Published cord Dmax examples after conventional EBRT
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          Physical retreatment Dmax values summarized in a 2023 review from the
          Sahgal lower-risk criteria. Values refer to the neural avoidance
          structure, not the target prescription.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Prior course
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Prior EQD2₂
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">1 fx</th>
                <th className="px-4 py-3 font-semibold text-gray-700">2 fx</th>
                <th className="px-4 py-3 font-semibold text-gray-700">3 fx</th>
                <th className="px-4 py-3 font-semibold text-gray-700">4 fx</th>
                <th className="px-4 py-3 font-semibold text-gray-700">5 fx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {PUBLISHED_CORD_RERT_DMAX.map((row) => (
                <tr key={row.prior}>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {row.prior}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.priorEQD2} Gy
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.one}</td>
                  <td className="px-4 py-3 text-gray-600">{row.two}</td>
                  <td className="px-4 py-3 text-gray-600">{row.three}</td>
                  <td className="px-4 py-3 text-gray-600">{row.four}</td>
                  <td className="px-4 py-3 text-gray-600">{row.five}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <ReferenceLinks ids={["gales-2023", "sahgal-2021"]} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900">
          MD Anderson single-course OAR planning goals
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">
          These goals come from the published 2026 MD Anderson workflow. Except
          for the cord/thecal sac HyTEC framework, they are not validated
          cumulative reirradiation ceilings. The reirradiation column therefore
          states how each should be used rather than inventing a remaining
          lifetime budget.
        </p>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Structure
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  1 fraction
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  3 fractions
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Reirradiation use
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {MDACC_OAR_PLANNING_GOALS.map((row) => (
                <tr key={row.organ} className="align-top">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {row.organ}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.oneFraction}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.threeFractions}
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-gray-500">
                    {row.reirradiation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <ReferenceLinks ids={["mackin-2026", "sahgal-2021"]} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900">Key references</h2>
        <ol className="mt-4 space-y-3">
          {SPINE_REFERENCES.map((reference) => (
            <li
              key={reference.id}
              id={reference.id}
              className="text-xs leading-relaxed text-gray-600"
            >
              <a
                href={reference.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:text-blue-600 hover:underline"
              >
                {reference.citation}
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
