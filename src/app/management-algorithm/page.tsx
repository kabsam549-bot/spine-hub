"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Prognosis = "poor" | "good" | null;
type NeurologicStatus = "urgent" | "intact" | null;
type Stability = "stable" | "needs-stabilization" | null;
type Indication =
  | "none"
  | "epidural"
  | "oligometastatic"
  | "oligoprogressive"
  | "local-failure"
  | null;
type PriorRT = "none" | "cebrt" | "sbrt" | null;
type Radiosensitivity = "sensitive" | "resistant" | null;
type EpiduralStatus = "low-grade" | "bilsky-1c-plus" | null;
type DiseaseBurden = "limited" | "widespread" | null;

interface Recommendation {
  headline: string;
  urgency: "routine" | "priority" | "urgent";
  steps: string[];
  rationale: string[];
  doseLink?: boolean;
}

interface Choice<T extends string> {
  value: T;
  label: string;
  detail: string;
}

function ChoiceGroup<T extends string>({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: T | null;
  choices: Choice<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const active = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(choice.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                active
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <span className="block text-sm font-semibold">{choice.label}</span>
              <span
                className={`mt-0.5 block text-xs leading-relaxed ${
                  active ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {choice.detail}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildRecommendation(input: {
  prognosis: Prognosis;
  neurologic: NeurologicStatus;
  stability: Stability;
  indication: Indication;
  priorRT: PriorRT;
  radiosensitivity: Radiosensitivity;
  epidural: EpiduralStatus;
  diseaseBurden: DiseaseBurden;
}): Recommendation | null {
  const {
    prognosis,
    neurologic,
    stability,
    indication,
    priorRT,
    radiosensitivity,
    epidural,
    diseaseBurden,
  } = input;

  if (!prognosis) return null;

  if (prognosis === "poor") {
    return {
      headline: "Supportive care, with palliative cEBRT when needed",
      urgency: "priority",
      steps: [
        "Clarify goals of care and symptom priorities.",
        "Use supportive care and analgesic management.",
        "Consider short-course palliative conventional EBRT for pain or symptom control.",
      ],
      rationale: [
        "The MD Anderson framework starts with prognosis because patients with poor expected survival are unlikely to benefit from an aggressive local-control program.",
      ],
    };
  }

  if (!neurologic) return null;

  if (neurologic === "urgent") {
    if (!radiosensitivity || !diseaseBurden) return null;

    const consolidation =
      radiosensitivity === "resistant" || diseaseBurden === "limited"
        ? "Plan postoperative SSRS when feasible for durable local control."
        : radiosensitivity === "sensitive"
          ? "Plan postoperative cEBRT or SSRS according to disease burden and target geometry."
          : "Choose postoperative cEBRT versus SSRS after histology and disease burden review.";

    return {
      headline: "Urgent decompressive surgical evaluation",
      urgency: "urgent",
      steps: [
        "Escalate urgently to the multidisciplinary spine team.",
        "Decompress threatened neural structures; add stabilization when mechanically indicated.",
        consolidation,
      ],
      rationale: [
        "Urgent neurologic compromise is managed first to prevent further neurologic injury.",
        "Radiation remains necessary for consolidation because decompression alone is not expected to provide durable tumor control.",
      ],
    };
  }

  if (!stability || !indication) return null;

  const stabilizationStep =
    stability === "needs-stabilization"
      ? "Address mechanical instability first with spine surgery or interventional stabilization, using instrumented fusion or cement augmentation as appropriate."
      : "No stabilization procedure is indicated from the current stability assessment.";

  if (indication === "none") {
    return {
      headline: "No immediate local treatment indication identified",
      urgency: "routine",
      steps: [
        stabilizationStep,
        "Continue systemic therapy, imaging surveillance, and symptom reassessment.",
        "Re-enter the pathway if epidural progression, oligoprogression, local failure, or neurologic symptoms develop.",
      ],
      rationale: [
        "In the MD Anderson framework, local treatment is typically prompted by epidural disease, an oligometastatic or oligoprogressive strategy, or local failure after prior radiation.",
      ],
    };
  }

  if (!priorRT || !epidural) return null;

  const priorTreatmentFailure =
    priorRT === "cebrt" || priorRT === "sbrt" || indication === "local-failure";

  if (priorTreatmentFailure) {
    if (!radiosensitivity) return null;

    const separation =
      epidural === "bilsky-1c-plus"
        ? "Create separation from the neural structure before salvage SSRS, using separation surgery or a selected ablative approach such as LITT where appropriate."
        : "No separation procedure is required solely for epidural geometry at the selected grade.";
    const regimenStartingPoint =
      priorRT === "sbrt"
        ? "For post-SBRT salvage, compare the 40/30 Gy in 10, 40/30 Gy in 5, three-fraction, and selected single-fraction pathways against the mapped composite dose and service-template constraints."
        : radiosensitivity === "resistant"
          ? "For prior conventional RT and radioresistant disease, the service-template starting point is 27/24 Gy in 3 fractions when deliverable."
          : "For prior conventional RT and radiosensitive disease, the service-template starting point is 27/21 Gy in 3 fractions when deliverable.";

    return {
      headline:
        epidural === "bilsky-1c-plus"
          ? "Separation strategy followed by salvage SSRS"
          : "Salvage stereotactic reirradiation evaluation",
      urgency: epidural === "bilsky-1c-plus" ? "priority" : "routine",
      steps: [
        stabilizationStep,
        separation,
        "Reconstruct or map the prior dose to the current anatomy whenever possible.",
        regimenStartingPoint,
        "Select the reirradiation regimen only after composite cord/thecal sac and adjacent OAR review.",
      ],
      rationale: [
        "The MD Anderson algorithm routes previously irradiated lesions toward SSRS when durable local salvage is intended.",
        "Disease touching or compressing the cord limits safe target coverage and may require separation before stereotactic treatment.",
        priorRT === "sbrt"
          ? "Failure after prior SBRT is not explicitly resolved by the 2023 simplified figure; the regimen ladder and composite-dose review reflect current program practice and newer consensus."
          : "Prior conventional EBRT is a standard indication for salvage SSRS when anatomy and normal-tissue constraints permit.",
      ],
      doseLink: true,
    };
  }

  if (!radiosensitivity || !diseaseBurden) return null;

  const ssrsIndicated =
    radiosensitivity === "resistant" || diseaseBurden === "limited";
  const deNovoTemplate =
    radiosensitivity === "resistant"
      ? "24/16 Gy in 1 fraction"
      : "18/16 Gy in 1 fraction";

  if (!ssrsIndicated) {
    return {
      headline: "Conventional EBRT",
      urgency: "routine",
      steps: [
        stabilizationStep,
        "Use conventional EBRT for the radiosensitive lesion.",
        "Coordinate systemic therapy and follow-up imaging.",
      ],
      rationale: [
        "For a previously untreated radiosensitive lesion outside an oligometastatic or oligoprogressive strategy, cEBRT can provide appropriate palliation and disease control.",
      ],
    };
  }

  if (epidural === "bilsky-1c-plus") {
    return {
      headline: "Separation strategy followed by SSRS",
      urgency: "priority",
      steps: [
        stabilizationStep,
        "Create sufficient separation between tumor and neural tissue before SSRS.",
        "Use separation surgery or selected LITT when appropriate and available.",
        `After separation, use ${deNovoTemplate} as the radiation-naive single-fraction service-template starting point when geometry permits; 30/24 Gy in 3 fractions is the treatment-naive multi-fraction alternative.`,
      ],
      rationale: [
        "SSRS is favored for radioresistant histology and for limited metastatic or oligoprogressive disease.",
        "Bilsky grade 1c or greater may prevent adequate target dosing while respecting neural constraints.",
      ],
    };
  }

  return {
    headline: "Definitive SSRS",
    urgency: "routine",
    steps: [
      stabilizationStep,
      "Plan definitive SSRS using high-quality MRI fusion and image guidance.",
      `Use ${deNovoTemplate} as the radiation-naive single-fraction service-template starting point when geometry permits; 30/24 Gy in 3 fractions is the treatment-naive multi-fraction alternative.`,
      "Choose target dose by prior RT status, histology, target extent, epidural geometry, and OAR constraints.",
    ],
    rationale: [
      radiosensitivity === "resistant"
        ? "Radioresistant histology is a primary indication for SSRS."
        : "The limited-disease strategy favors durable local control with SSRS even for a radiosensitive histology.",
    ],
  };
}

const urgencyStyles = {
  routine: "border-blue-200 bg-blue-50 text-blue-900",
  priority: "border-amber-200 bg-amber-50 text-amber-900",
  urgent: "border-red-200 bg-red-50 text-red-900",
};

export default function ManagementAlgorithmPage() {
  const [prognosis, setPrognosis] = useState<Prognosis>(null);
  const [neurologic, setNeurologic] = useState<NeurologicStatus>(null);
  const [stability, setStability] = useState<Stability>(null);
  const [indication, setIndication] = useState<Indication>(null);
  const [priorRT, setPriorRT] = useState<PriorRT>(null);
  const [radiosensitivity, setRadiosensitivity] =
    useState<Radiosensitivity>(null);
  const [epidural, setEpidural] = useState<EpiduralStatus>(null);
  const [diseaseBurden, setDiseaseBurden] = useState<DiseaseBurden>(null);

  const recommendation = useMemo(
    () =>
      buildRecommendation({
        prognosis,
        neurologic,
        stability,
        indication,
        priorRT,
        radiosensitivity,
        epidural,
        diseaseBurden,
      }),
    [
      prognosis,
      neurologic,
      stability,
      indication,
      priorRT,
      radiosensitivity,
      epidural,
      diseaseBurden,
    ],
  );

  const reset = () => {
    setPrognosis(null);
    setNeurologic(null);
    setStability(null);
    setIndication(null);
    setPriorRT(null);
    setRadiosensitivity(null);
    setEpidural(null);
    setDiseaseBurden(null);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="flex flex-col gap-4 fade-in-up">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
          <span className="h-px w-8 bg-blue-600" />
          Multidisciplinary pathway
        </div>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
          Spine Metastasis
          <br className="hidden sm:block" /> Management Algorithm
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-gray-500">
          An interactive reconstruction of the simplified MD Anderson pathway
          published by Bahouth, Yeboa, Ghia, and colleagues. It integrates
          prognosis, neurologic urgency, mechanical stability, indication for
          treatment, prior radiation, histology, disease burden, and epidural
          anatomy.
        </p>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          This pathway organizes multidisciplinary discussion. It does not
          replace urgent evaluation for cord compression, SINS or Bilsky review,
          image fusion, prior-dose reconstruction, or physician judgment.
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] fade-in-up fade-delay-1">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Walk through the pathway
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                The result updates as the required decision points are selected.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 space-y-8">
            <ChoiceGroup
              label="1. Expected prognosis and ability to benefit from durable local control"
              value={prognosis}
              onChange={setPrognosis}
              choices={[
                {
                  value: "poor",
                  label: "Poor prognosis",
                  detail:
                    "Limited expected survival or no realistic systemic options.",
                },
                {
                  value: "good",
                  label: "Meaningful expected survival",
                  detail:
                    "Performance status and systemic options support a durable local-control strategy.",
                },
              ]}
            />

            {prognosis === "good" && (
              <ChoiceGroup
                label="2. Neurologic status"
                value={neurologic}
                onChange={setNeurologic}
                choices={[
                  {
                    value: "urgent",
                    label: "Urgent neurologic compromise",
                    detail:
                      "Progressive deficit or symptomatic cord/cauda compression requiring immediate escalation.",
                  },
                  {
                    value: "intact",
                    label: "Neurologically intact or non-urgent",
                    detail:
                      "No urgent decompressive indication at this decision point.",
                  },
                ]}
              />
            )}

            {prognosis === "good" && neurologic === "intact" && (
              <>
                <ChoiceGroup
                  label="3. Mechanical stability"
                  value={stability}
                  onChange={setStability}
                  choices={[
                    {
                      value: "stable",
                      label: "Stable",
                      detail:
                        "No mechanical pain or instability requiring intervention.",
                    },
                    {
                      value: "needs-stabilization",
                      label: "Stabilization needed",
                      detail:
                        "Mechanical pain, SINS concern, pathologic collapse, or deformity.",
                    },
                  ]}
                />
                <ChoiceGroup
                  label="4. Indication for local treatment"
                  value={indication}
                  onChange={(value) => {
                    setIndication(value);
                    if (value === "none") {
                      setPriorRT(null);
                      setEpidural(null);
                      setRadiosensitivity(null);
                      setDiseaseBurden(null);
                    } else if (
                      value === "local-failure" &&
                      priorRT === "none"
                    ) {
                      setPriorRT(null);
                    }
                  }}
                  choices={[
                    {
                      value: "none",
                      label: "No current indication",
                      detail:
                        "No epidural threat, limited-disease strategy, or local failure.",
                    },
                    {
                      value: "epidural",
                      label: "Epidural disease",
                      detail:
                        "Local treatment is needed to prevent or address neural compromise.",
                    },
                    {
                      value: "oligometastatic",
                      label: "Oligometastatic",
                      detail:
                        "Durable control of all limited sites is part of the treatment strategy.",
                    },
                    {
                      value: "oligoprogressive",
                      label: "Oligoprogressive",
                      detail:
                        "Local control may allow continuation of otherwise effective systemic therapy.",
                    },
                    {
                      value: "local-failure",
                      label: "Local failure after RT",
                      detail:
                        "Imaging-confirmed progression in or adjacent to a prior radiation field.",
                    },
                  ]}
                />
              </>
            )}

            {prognosis === "good" &&
              neurologic === "intact" &&
              indication &&
              indication !== "none" && (
                <>
                  <ChoiceGroup
                    label="5. Prior radiation at this level"
                    value={priorRT}
                    onChange={setPriorRT}
                    choices={[
                      ...(indication === "local-failure"
                        ? []
                        : [
                            {
                              value: "none" as const,
                              label: "No prior RT",
                              detail: "Radiation-naive target level.",
                            },
                          ]),
                      {
                        value: "cebrt",
                        label: "Prior conventional EBRT",
                        detail:
                          "Prior overlapping conventional or palliative field.",
                      },
                      {
                        value: "sbrt",
                        label: "Prior SBRT or SSRS",
                        detail:
                          "Prior overlapping stereotactic treatment requiring composite-dose review.",
                      },
                    ]}
                  />
                  <ChoiceGroup
                    label="6. Epidural relationship to neural tissue"
                    value={epidural}
                    onChange={setEpidural}
                    choices={[
                      {
                        value: "low-grade",
                        label: "Below Bilsky 1c",
                        detail:
                          "No cord abutment or compression at the target level.",
                      },
                      {
                        value: "bilsky-1c-plus",
                        label: "Bilsky 1c or greater",
                        detail:
                          "Cord abutment or compression may limit stereotactic target coverage.",
                      },
                    ]}
                  />
                </>
              )}

            {prognosis === "good" &&
              (neurologic === "urgent" ||
                (neurologic === "intact" && priorRT !== null)) && (
                <ChoiceGroup
                  label={`${
                    neurologic === "urgent" ? "3" : "7"
                  }. Histology response to conventional EBRT`}
                  value={radiosensitivity}
                  onChange={setRadiosensitivity}
                  choices={[
                    {
                      value: "sensitive",
                      label: "Radiosensitive",
                      detail:
                        "Examples include lymphoma, myeloma, seminoma, ovarian, breast, and prostate in the MD Anderson framework.",
                    },
                    {
                      value: "resistant",
                      label: "Radioresistant",
                      detail:
                        "Examples include renal cell, melanoma, HCC, NSCLC, thyroid, sarcoma, and colorectal.",
                    },
                  ]}
                />
              )}

            {prognosis === "good" &&
              (neurologic === "urgent" ||
                (neurologic === "intact" && priorRT === "none")) && (
                  <ChoiceGroup
                    label={`${
                      neurologic === "urgent" ? "4" : "8"
                    }. Overall disease strategy`}
                    value={diseaseBurden}
                    onChange={setDiseaseBurden}
                    choices={[
                      {
                        value: "limited",
                        label: "Limited or oligometastatic",
                        detail:
                          "Durable local control is prioritized within the systemic strategy.",
                      },
                      {
                        value: "widespread",
                        label: "Widespread",
                        detail:
                          "Palliation and efficient coordination with systemic therapy are prioritized.",
                      },
                    ]}
                  />
              )}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {recommendation ? (
            <div
              className={`rounded-2xl border-2 p-6 shadow-sm ${
                urgencyStyles[recommendation.urgency]
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
                Framework output
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                {recommendation.headline}
              </h2>
              <ol className="mt-5 space-y-3">
                {recommendation.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/70 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-current/15 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider opacity-70">
                  Why this branch
                </h3>
                <ul className="mt-2 space-y-2 text-xs leading-relaxed opacity-85">
                  {recommendation.rationale.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              {recommendation.doseLink && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/dose-budget"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700"
                  >
                    Open reRT dose budget
                  </Link>
                  <Link
                    href="/lived-experience"
                    className="rounded-lg border border-current/20 bg-white/60 px-4 py-2 text-xs font-semibold hover:bg-white"
                  >
                    Review regimen ladder
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm text-gray-500">
                Select the visible decision points to generate the next-step
                framework.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 text-xs leading-relaxed text-gray-500">
            <p className="font-semibold text-gray-800">Source boundary</p>
            <p className="mt-2">
              The core branches reproduce the simplified MD Anderson algorithm
              in Bahouth et al. The prior-SBRT salvage branch adds current
              program practice and newer reirradiation consensus because the
              published 2023 figure does not resolve every post-SBRT scenario.
            </p>
            <a
              href="https://doi.org/10.1259/bjr.20220267"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-semibold text-blue-600 hover:underline"
            >
              Open source article
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
