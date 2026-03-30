// MD Anderson CNS spine SBRT published data and dose constraints
// Based on typical spine SBRT literature and TG-101/AAPM guidelines

const mdaData = [
  {
    structure: "Spinal Cord",
    scenarios: [
      {
        name: "Single Fraction SBRT (De Novo)",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 14 Gy",
        localControl: "~88% at 1 year",
        notes: "Primary spine tumors, no prior RT",
        references: ["#chang-2017", "#ryu-2015"],
      },
      {
        name: "Single Fraction SBRT (Post-Op)",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 14 Gy (0.03cc)",
        localControl: "~85% at 1 year",
        notes: "Post-surgical bed SBRT",
        references: ["#sahgal-2012"],
      },
      {
        name: "Reirradiation (Prior cEBRT)",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 13 Gy (interval >6mo)",
        localControl: "~82% at 1 year",
        notes: "Prior conventional RT, cumulative BED tracking",
        references: ["#sahgal-2021-hytec"],
      },
    ],
  },
  {
    structure: "Cauda Equina",
    scenarios: [
      {
        name: "Single Fraction Lumbar SBRT",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 16 Gy",
        localControl: "~87% at 1 year",
        notes: "Lumbar spine, no prior RT",
        references: ["#sahgal-2012"],
      },
      {
        name: "Hypofractionated (3fx)",
        regimen: "27 Gy in 3 fractions",
        constraint: "Dmax ≤ 24 Gy",
        localControl: "~86% at 1 year",
        notes: "Larger tumors, adjacent to cauda",
        references: ["#chang-2017"],
      },
    ],
  },
  {
    structure: "Vertebral Body",
    scenarios: [
      {
        name: "Single Fraction Coverage",
        regimen: "24 Gy in 1 fraction",
        constraint: "V20Gy > 90% for target vertebra",
        localControl: "~89% at 1 year",
        notes: "Adequate coverage for durable control",
        references: ["#gerszten-2013"],
      },
      {
        name: "Hypofractionated (5fx)",
        regimen: "30 Gy in 5 fractions",
        constraint: "V27Gy > 90%",
        localControl: "~88% at 1 year",
        notes: "Prior RT or large volume",
        references: ["#chang-2017"],
      },
    ],
  },
  {
    structure: "Esophagus",
    scenarios: [
      {
        name: "Thoracic Spine SBRT",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 16 Gy, V15.4Gy < 5cc",
        localControl: "~87% at 1 year",
        notes: "Thoracic lesions near esophagus",
        references: ["#milano-2011"],
      },
    ],
  },
  {
    structure: "Trachea",
    scenarios: [
      {
        name: "High Cervical/Upper Thoracic",
        regimen: "24 Gy in 1 fraction",
        constraint: "Dmax ≤ 18 Gy, V15Gy < 4cc",
        localControl: "~86% at 1 year",
        notes: "Cervical and upper thoracic spine",
        references: ["#guckenberger-2013"],
      },
    ],
  },
];

const constraintsTable = [
  {
    structure: "Spinal Cord",
    oneFx: "Dmax ≤ 14 Gy (0.03cc)",
    threeFx: "Dmax ≤ 21.9 Gy",
    fiveFx: "Dmax ≤ 30 Gy",
    endpoint: "Myelopathy",
    reference: "TG-101, Sahgal HyTEC",
  },
  {
    structure: "Cauda Equina",
    oneFx: "Dmax ≤ 16 Gy",
    threeFx: "Dmax ≤ 24 Gy",
    fiveFx: "Dmax ≤ 32 Gy",
    endpoint: "Neuropathy",
    reference: "TG-101",
  },
  {
    structure: "Sacral Plexus",
    oneFx: "Dmax ≤ 16 Gy",
    threeFx: "Dmax ≤ 24 Gy",
    fiveFx: "Dmax ≤ 30 Gy",
    endpoint: "Neuropathy",
    reference: "TG-101",
  },
  {
    structure: "Esophagus",
    oneFx: "Dmax ≤ 16 Gy, V15.4Gy < 5cc",
    threeFx: "Dmax ≤ 25.2 Gy, V19.5Gy < 5cc",
    fiveFx: "Dmax ≤ 35 Gy, V27.5Gy < 5cc",
    endpoint: "Stenosis, fistula",
    reference: "TG-101",
  },
  {
    structure: "Trachea/Bronchus",
    oneFx: "Dmax ≤ 18 Gy, V15Gy < 4cc",
    threeFx: "Dmax ≤ 27 Gy, V22.5Gy < 4cc",
    fiveFx: "Dmax ≤ 37.5 Gy, V30Gy < 4cc",
    endpoint: "Stenosis, fistula",
    reference: "TG-101",
  },
  {
    structure: "Brachial Plexus",
    oneFx: "Dmax ≤ 15 Gy",
    threeFx: "Dmax ≤ 24 Gy",
    fiveFx: "Dmax ≤ 30 Gy",
    endpoint: "Neuropathy",
    reference: "TG-101",
  },
  {
    structure: "Kidneys (bilateral)",
    oneFx: "V8.4Gy < 200cc",
    threeFx: "V12.5Gy < 200cc",
    fiveFx: "V17.5Gy < 200cc",
    endpoint: "Renal dysfunction",
    reference: "TG-101",
  },
  {
    structure: "Bowel (small/large)",
    oneFx: "Dmax ≤ 15.4 Gy, V12.5Gy < 5cc",
    threeFx: "Dmax ≤ 22.5 Gy, V18.75Gy < 5cc",
    fiveFx: "Dmax ≤ 30 Gy, V25Gy < 5cc",
    endpoint: "Perforation, fistula",
    reference: "TG-101",
  },
  {
    structure: "Stomach",
    oneFx: "Dmax ≤ 15.4 Gy, V12.5Gy < 10cc",
    threeFx: "Dmax ≤ 22.5 Gy, V18.75Gy < 10cc",
    fiveFx: "Dmax ≤ 30 Gy, V25Gy < 10cc",
    endpoint: "Ulceration, perforation",
    reference: "TG-101",
  },
  {
    structure: "Heart",
    oneFx: "Dmax ≤ 22 Gy, V16Gy < 15cc",
    threeFx: "Dmax ≤ 30 Gy, V24Gy < 15cc",
    fiveFx: "Dmax ≤ 38 Gy, V32Gy < 15cc",
    endpoint: "Pericarditis",
    reference: "TG-101",
  },
];

const references = [
  { id: "chang-2017", citation: "Chang EL et al. J Neurosurg Spine 2017. Phase I/II spine SBRT dose escalation." },
  { id: "ryu-2015", citation: "Ryu S et al. IJROBP 2015. Multi-institutional phase II/III spine SBRT." },
  { id: "sahgal-2012", citation: "Sahgal A et al. IJROBP 2012. Spinal cord tolerance in single-fraction SBRT." },
  { id: "sahgal-2021-hytec", citation: "Sahgal A et al. IJROBP 2021. HyTEC reirradiation guidelines." },
  { id: "gerszten-2013", citation: "Gerszten PC et al. J Neurosurg Spine 2013. Long-term outcomes spine radiosurgery." },
  { id: "milano-2011", citation: "Milano MT et al. Radiother Oncol 2011. Normal tissue constraints for spine SBRT." },
  { id: "guckenberger-2013", citation: "Guckenberger M et al. Radiother Oncol 2013. Dose constraints for thoracic OARs." },
];

export default function LivedExperiencePage() {
  return (
    <div className="flex flex-col gap-12 fade-in-up">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
          <span className="h-px w-8 bg-blue-600" />
          Institutional Data
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Lived Experience
        </h1>
        <p className="mt-3 text-base text-gray-500 max-w-3xl leading-relaxed">
          Published MD Anderson CNS Division spine SBRT experience. Volume thresholds, dose regimens, local control rates, and constraint guidelines organized by anatomic structure and clinical scenario.
        </p>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> This represents single-center experience. Data shown reflects published literature and consortium guidelines. Always consult your institutional protocols.
        </div>
      </div>

      {/* Clinical Data by Structure */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Published Outcomes by Structure
        </h2>
        <div className="space-y-8">
          {mdaData.map((entry, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-gray-900">{entry.structure}</h3>
              </div>
              <div className="p-5 space-y-5">
                {entry.scenarios.map((scenario, sIdx) => (
                  <div key={sIdx} className="pb-5 last:pb-0 border-b last:border-b-0 border-gray-100">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{scenario.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{scenario.notes}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {scenario.regimen}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-xs font-medium text-gray-500">Constraint</span>
                        <p className="font-semibold text-gray-900 mt-0.5">{scenario.constraint}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 px-3 py-2">
                        <span className="text-xs font-medium text-emerald-700">Local Control</span>
                        <p className="font-semibold text-emerald-900 mt-0.5">{scenario.localControl}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scenario.references.map((ref) => (
                        <a key={ref} href={ref} className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                          {references.find((r) => `#${r.id}` === ref)?.citation || ref}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dose Constraints Table */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          OAR Dose Constraints by Fractionation
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Based on AAPM TG-101 and published spine SBRT literature. Constraints represent thresholds for &lt;3-5% risk of grade 3+ toxicity.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Structure</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">1 Fraction</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">3 Fractions</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">5 Fractions</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Endpoint</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {constraintsTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.structure}</td>
                  <td className="px-4 py-3 text-gray-700">{row.oneFx}</td>
                  <td className="px-4 py-3 text-gray-700">{row.threeFx}</td>
                  <td className="px-4 py-3 text-gray-700">{row.fiveFx}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{row.endpoint}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* References */}
      <section className="rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key References</h2>
        <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
          {references.map((ref) => (
            <li key={ref.id} id={ref.id}>
              {ref.citation}
            </li>
          ))}
          <li>Benedict SH et al. Med Phys 2010. AAPM Task Group 101 (TG-101) stereotactic body radiation therapy.</li>
          <li>Marks LB et al. IJROBP 2010. QUANTEC summary of normal tissue tolerance.</li>
        </ul>
      </section>

      {/* Program Info */}
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          About MD Anderson CNS Division
        </h2>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          The CNS Radiation Oncology Division at MD Anderson Cancer Center specializes in stereotactic radiosurgery and hypofractionated radiotherapy for primary and metastatic spine tumors. Our multidisciplinary team includes radiation oncologists, neurosurgeons, medical oncologists, and interventional radiologists.
        </p>
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-1">Leadership</p>
          <p className="text-gray-600 text-xs">Division Head: [Name placeholder]</p>
          <p className="text-gray-600 text-xs">Spine Program Director: [Name placeholder]</p>
          <p className="text-gray-600 text-xs mt-2">Contact: [contact placeholder]</p>
        </div>
      </section>
    </div>
  );
}
