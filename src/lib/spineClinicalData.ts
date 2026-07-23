import { calcBEDAndEQD2 } from "./bedCalculations";

export type EvidenceLabel =
  | "Published MD Anderson series"
  | "Published MD Anderson workflow"
  | "MD Anderson program practice"
  | "International consensus";

export interface SpineReference {
  id: string;
  short: string;
  citation: string;
  href: string;
}

export const SPINE_REFERENCES: SpineReference[] = [
  {
    id: "bahouth-2023",
    short: "Bahouth et al. 2023",
    citation:
      "Bahouth SM, Yeboa DN, Ghia AJ, et al. Advances in the management of spinal metastases: what the radiologist needs to know. Br J Radiol. 2023;96:20220267.",
    href: "https://doi.org/10.1259/bjr.20220267",
  },
  {
    id: "mackin-2026",
    short: "Mackin et al. 2026",
    citation:
      "Mackin D, Cifter G, Zlateva Y, et al. Clinical Workflow of Spine Stereotactic Radiotherapy and Radiosurgery: Insights from a Single-Institution Physics Perspective. Cancers. 2026;18:353.",
    href: "https://doi.org/10.3390/cancers18030353",
  },
  {
    id: "farooqi-2019",
    short: "Farooqi et al. 2019",
    citation:
      "Farooqi A, Bishop AJ, Narang S, et al. Outcomes After Hypofractionated Dose-Escalation Using a Simultaneous Integrated Boost Technique for Treatment of Spine Metastases Not Amenable to Stereotactic Radiosurgery. Pract Radiat Oncol. 2019;9:e142-e148.",
    href: "https://doi.org/10.1016/j.prro.2018.10.008",
  },
  {
    id: "sahgal-2021",
    short: "Sahgal et al. 2021",
    citation:
      "Sahgal A, Chang JH, Ma L, et al. Spinal Cord Dose Tolerance to Stereotactic Body Radiation Therapy. Int J Radiat Oncol Biol Phys. 2021;110:124-136.",
    href: "https://pubmed.ncbi.nlm.nih.gov/31606528/",
  },
  {
    id: "alongi-2026",
    short: "Alongi et al. 2026",
    citation:
      "Alongi F, Cuccia F, Kotecha R, et al. ESTRO-ISRS clinical practice recommendations for re-irradiation of spinal metastases with stereotactic body radiotherapy. Radiother Oncol. 2026;214:111304.",
    href: "https://doi.org/10.1016/j.radonc.2025.111304",
  },
  {
    id: "gales-2023",
    short: "Gales et al. 2023",
    citation:
      "Gales L, Mitrea D, Chivu B, et al. Risk of Myelopathy Following Second Local Treatment after Initial Irradiation of Spine Metastasis. Diagnostics. 2023;13:212.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9857541/",
  },
];

export interface DoseRegimen {
  id: string;
  name: string;
  gtvDose: number | null;
  ctvDose: number | null;
  fractions: number | null;
  scenario: string;
  intensity: string;
  evidence: EvidenceLabel;
  referenceIds: string[];
  outcome?: string;
  note: string;
}

export const MDACC_RERT_REGIMENS: DoseRegimen[] = [
  {
    id: "ssib-40-30-10",
    name: "SSIB 40/30 Gy in 10 fractions",
    gtvDose: 40,
    ctvDose: 30,
    fractions: 10,
    scenario:
      "More fractionated salvage when prior stereotactic treatment, target extent, epidural disease, or OAR geometry makes another short-course stereotactic plan less attractive.",
    intensity: "Fractionated",
    evidence: "Published MD Anderson series",
    referenceIds: ["farooqi-2019"],
    outcome:
      "In a 15-site retrospective series not amenable to SRS, 1-year local control was 93%; the published cord maximum point dose was 34 Gy.",
    note:
      "The published cohort was selected for targets extending beyond three vertebral levels or with marked epidural extension. Do not generalize its outcome estimate to every reirradiation case.",
  },
  {
    id: "ssib-40-30-5",
    name: "SSIB 40/30 Gy in 5 fractions",
    gtvDose: 40,
    ctvDose: 30,
    fractions: 5,
    scenario:
      "Dose-intensified institutional option for selected salvage cases when five-fraction OAR constraints and composite dose limits are achievable.",
    intensity: "Dose intensified",
    evidence: "MD Anderson program practice",
    referenceIds: [],
    note:
      "Program-reported regimen from the Spine Hub development discussion. A matching planning-directive extract supplies target and OAR goals, but its administrative approval fields were blank and no regimen-specific outcomes paper was identified.",
  },
  {
    id: "ssib-27-24-3",
    name: "SSIB 27/24 Gy in 3 fractions",
    gtvDose: 27,
    ctvDose: 24,
    fractions: 3,
    scenario:
      "Common MD Anderson reirradiation prescription for radioresistant histology when a three-fraction stereotactic plan is feasible.",
    intensity: "Stereotactic",
    evidence: "Published MD Anderson workflow",
    referenceIds: ["mackin-2026"],
    note:
      "The 2026 workflow reports 27/24 Gy for previously irradiated radioresistant disease and 27/21 Gy for previously irradiated radiosensitive disease.",
  },
  {
    id: "selected-single-fraction",
    name: "Selected single-fraction salvage",
    gtvDose: null,
    ctvDose: null,
    fractions: 1,
    scenario:
      "Highly selected cases with favorable geometry, limited target extent, adequate separation from neural tissue, and a composite OAR dose that remains acceptable.",
    intensity: "Most condensed",
    evidence: "MD Anderson program practice",
    referenceIds: ["alongi-2026", "sahgal-2021"],
    note:
      "Individualize the prescription. International consensus lists 16 Gy in 1 fraction as a reirradiation option; the program also uses selected single-fraction SIB approaches. Never infer target prescription from the cord budget alone.",
  },
];

export function regimenRadiobiology(regimen: DoseRegimen) {
  if (
    regimen.gtvDose === null ||
    regimen.ctvDose === null ||
    regimen.fractions === null
  ) {
    return null;
  }

  return {
    gtv: calcBEDAndEQD2(regimen.gtvDose, regimen.fractions, 10),
    ctv: calcBEDAndEQD2(regimen.ctvDose, regimen.fractions, 10),
  };
}

export const MDACC_DOSE_SELECTION_MATRIX = [
  {
    setting: "Radiation-naive",
    histology: "Radiosensitive",
    prescription: "18/16 Gy in 1 fraction",
    interpretation:
      "18 Gy GTV with a 16 Gy elective CTV level when single-fraction geometry is appropriate.",
  },
  {
    setting: "Radiation-naive",
    histology: "Radioresistant",
    prescription: "24/16 Gy in 1 fraction",
    interpretation:
      "24 Gy GTV with a 16 Gy elective CTV level for selected radioresistant disease.",
  },
  {
    setting: "Radiation-naive",
    histology: "Either",
    prescription: "30/24 Gy in 3 fractions",
    interpretation:
      "Treatment-naive three-fraction alternative when a multi-fraction stereotactic plan is preferred.",
  },
  {
    setting: "Prior radiation",
    histology: "Radiosensitive",
    prescription: "27/21 Gy in 3 fractions",
    interpretation:
      "Prior-RT template with a 27 Gy GTV dose and lower 21 Gy elective CTV level.",
  },
  {
    setting: "Prior radiation",
    histology: "Radioresistant",
    prescription: "27/24 Gy in 3 fractions",
    interpretation:
      "Prior-RT template with a 27 Gy GTV dose and 24 Gy elective CTV level.",
  },
];

export interface ServiceTemplateDirective {
  id: string;
  name: string;
  status: string;
  targetCoverage: string[];
  oars: Array<{ organ: string; constraint: string }>;
  notes: string[];
}

const PRIOR_RT_THREE_FRACTION_OARS = [
  {
    organ: "Spinal cord",
    constraint: "D0.01 cc <10 Gy; V9 Gy <1 cc",
  },
  {
    organ: "Cauda equina",
    constraint: "D0.01 cc <14 Gy; V12 Gy <1 cc",
  },
  { organ: "Nerve root", constraint: "D0.01 cc <27 Gy" },
  {
    organ: "Bowel bag",
    constraint: "V12 Gy <0.01 cc; circumferential dose <10 Gy",
  },
  {
    organ: "Esophagus",
    constraint: "D0.01 cc <21 Gy; V14 Gy <1 cc",
  },
  {
    organ: "Heart",
    constraint: "D0.01 cc <21 Gy; V15 Gy <15 cc",
  },
  { organ: "Kidneys", constraint: "Combined V10 Gy <20%" },
  {
    organ: "Stomach",
    constraint: "D0.01 cc <24 Gy; V21 Gy <10 cc",
  },
  { organ: "Skin", constraint: "D0.01 cc <21 Gy" },
];

const DE_NOVO_SINGLE_FRACTION_OARS = [
  {
    organ: "Spinal cord",
    constraint: "D0.01 cc <12 Gy; V10 Gy <1 cc",
  },
  {
    organ: "Cauda equina",
    constraint: "D0.01 cc <16 Gy; V14 Gy <1 cc",
  },
  { organ: "Nerve root", constraint: "D0.01 cc <24 Gy" },
  {
    organ: "Esophagus",
    constraint: "D0.01 cc <17 Gy; V14 Gy <1 cc",
  },
  {
    organ: "Bowel bag",
    constraint:
      "D0.01 cc <15.4 Gy; V10 Gy <5 cc; circumferential dose <12 Gy",
  },
  {
    organ: "Stomach",
    constraint: "D0.01 cc <16 Gy; V13 Gy <10 cc",
  },
  {
    organ: "Kidneys",
    constraint: "V8.4 Gy <200 cc. Single kidney: V5 Gy <50 cc",
  },
  { organ: "Heart", constraint: "D0.01 cc <22 Gy" },
];

export const MDACC_DE_NOVO_SERVICE_TEMPLATES: ServiceTemplateDirective[] = [
  {
    id: "directive-18-16-1",
    name: "SSRS 18/16 Gy in 1 fraction, radiosensitive RT-naive",
    status: "MD Anderson CNS/Spine service-approved template",
    targetCoverage: [
      "GTV: V18 Gy at least 95%, minimum at least 15 Gy, and maximum <21.6 Gy.",
      "Elective CTV_1600: V16 Gy at least 80%.",
    ],
    oars: DE_NOVO_SINGLE_FRACTION_OARS,
    notes: [
      "This is a radiation-naive radiosensitive template, not a reirradiation constraint set.",
      "The service summary also permits limited target-adjacent exceptions that require direct protocol review.",
    ],
  },
  {
    id: "directive-24-16-1",
    name: "SSRS 24/16 Gy in 1 fraction, radioresistant RT-naive",
    status: "MD Anderson CNS/Spine service-approved template",
    targetCoverage: [
      "GTV: V24 Gy at least 95%, minimum at least 15 Gy, and maximum <28.8 Gy.",
      "Elective CTV_1600: V16 Gy at least 80%.",
    ],
    oars: DE_NOVO_SINGLE_FRACTION_OARS,
    notes: [
      "This is a radiation-naive radioresistant template, not a reirradiation constraint set.",
      "Do not substitute these de novo neural constraints for a composite-dose salvage analysis.",
    ],
  },
];

export const MDACC_RERT_SERVICE_TEMPLATES: ServiceTemplateDirective[] = [
  {
    id: "directive-40-30-10",
    name: "SSIB 40/30 Gy in 10 fractions",
    status:
      "Finalized MD Anderson CNS/Spine service template, version 10 (November 2024)",
    targetCoverage: [
      "40 Gy boost to gross disease and 30 Gy to the CTV/PTV, with 3 mm GTV-to-PTV and CTV-to-PTV expansions.",
      "PTV_4000: at least 95% receives prescription; PTV_3000: minimum dose at least 30 Gy.",
      "Cord and cauda equina PRVs use a 3 mm expansion. In PTV overlap, the desired minimum is 30 Gy rather than the 40 Gy boost.",
    ],
    oars: [
      {
        organ: "Spinal cord PRV",
        constraint: "D0.01 cc <34 Gy",
      },
      {
        organ: "Cauda equina PRV",
        constraint: "D0.01 cc <34 Gy",
      },
      {
        organ: "Small bowel / bowel bag",
        constraint: "D0.01 cc <34 Gy; circumferential dose <32 Gy",
      },
      {
        organ: "Esophagus",
        constraint: "D0.01 cc <34 Gy; D1 cc <32 Gy",
      },
      {
        organ: "Stomach",
        constraint: "D0.01 cc <32 Gy; V30 Gy <10 cc",
      },
      { organ: "Heart", constraint: "Mean <20 Gy" },
      {
        organ: "Lungs",
        constraint: "Mean <15 Gy; each lung V15 Gy <600 cc",
      },
      { organ: "Liver", constraint: "V23 Gy <30%" },
      {
        organ: "Kidneys",
        constraint:
          "Combined V15 Gy <20%; each kidney V15 Gy <80%. Single kidney: V12 Gy <100 cc",
      },
      { organ: "Skin", constraint: "D0.01 cc <33 Gy" },
    ],
    notes: [
      "All listed OAR goals are marked high/required in the supplied directive summary.",
      "These are regimen-specific planning constraints, not cumulative lifetime reirradiation budgets.",
    ],
  },
  {
    id: "directive-40-30-5",
    name: "SSIB 40/30 Gy in 5 fractions",
    status:
      "Supplied spine planning-directive extract; pathway, attending, template name, and approval fields were not populated",
    targetCoverage: [
      "PTV: D95 at least 30 Gy.",
      "PTV_Boost: D90 at least 40 Gy.",
      "The supplied extract did not include target expansions or dosimetry instructions.",
    ],
    oars: [
      {
        organ: "Bowel bag",
        constraint: "D0.03 cc <25 Gy; D10 cc <22 Gy",
      },
      {
        organ: "Brachial plexus",
        constraint: "D0.01 cc <40 Gy",
      },
      {
        organ: "Cauda equina",
        constraint: "D0.03 cc <30 Gy",
      },
      {
        organ: "Esophagus",
        constraint: "D0.01 cc <33 Gy; D2.5 cc <25 Gy",
      },
      { organ: "Heart", constraint: "ALARA" },
      { organ: "Lungs", constraint: "ALARA" },
      {
        organ: "Skin",
        constraint: "D5 cc <35 Gy",
      },
      {
        organ: "Spinal cord",
        constraint: "D0.03 cc <28 Gy; D0.2 cc <23 Gy",
      },
    ],
    notes: [
      "The bowel D0.03 cc, brachial plexus, cauda equina, esophagus D0.01 cc, and spinal cord D0.03 cc goals were marked high/required in the supplied extract.",
      "Because the administrative and approval fields were blank, display this as a directive extract rather than a confirmed finalized service template.",
      "These are single-course template goals and must still be reconciled with mapped composite dose.",
    ],
  },
  {
    id: "directive-27-24-3",
    name: "SSRS 27/24 Gy in 3 fractions, radioresistant prior RT",
    status: "MD Anderson CNS/Spine service-approved prior-RT template",
    targetCoverage: [
      "GTV: V27 Gy at least 95%, minimum at least 21 Gy, and maximum <32.4 Gy.",
      "Elective CTV_2400: V24 Gy at least 80%.",
    ],
    oars: PRIOR_RT_THREE_FRACTION_OARS,
    notes: [
      "The 24 Gy elective level is the radioresistant prior-RT variant.",
      "These are single-course template goals and must still be reconciled with mapped composite dose.",
    ],
  },
  {
    id: "directive-27-21-3",
    name: "SSRS 27/21 Gy in 3 fractions, radiosensitive prior RT",
    status: "MD Anderson CNS/Spine service-approved prior-RT template",
    targetCoverage: [
      "GTV: V27 Gy at least 95%, minimum at least 21 Gy, and maximum <32.4 Gy.",
      "Elective CTV_2100: V21 Gy at least 80%.",
    ],
    oars: PRIOR_RT_THREE_FRACTION_OARS,
    notes: [
      "The lower 21 Gy elective level is the only dose difference from the radioresistant prior-RT template.",
      "These are single-course template goals and must still be reconciled with mapped composite dose.",
    ],
  },
];

export interface OARPlanningGoal {
  organ: string;
  oneFraction: string;
  threeFractions: string;
  reirradiation: string;
  referenceIds: string[];
}

export const MDACC_OAR_PLANNING_GOALS: OARPlanningGoal[] = [
  {
    organ: "Spinal cord",
    oneFraction: "V10 Gy <1 cc; D0.01 cc <12 Gy",
    threeFractions: "V9 Gy <1 cc; D0.01 cc <10 Gy",
    reirradiation:
      "HyTEC lower-risk factors: cumulative thecal sac EQD2₂ Dmax ≤70 Gy, retreatment EQD2₂ Dmax ≤25 Gy, retreatment/cumulative ratio ≤0.5, interval ≥5 months.",
    referenceIds: ["mackin-2026", "sahgal-2021"],
  },
  {
    organ: "Cauda equina",
    oneFraction: "V14 Gy <1 cc; D0.01 cc <16 Gy",
    threeFractions: "V12 Gy <1 cc; D0.01 cc <14 Gy",
    reirradiation:
      "No comparably validated cumulative lifetime threshold. Review the composite dose distribution and prior neurologic dose with spine physics and the treating physician.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Esophagus",
    oneFraction: "V14 Gy <1 cc; D0.01 cc <17 Gy",
    threeFractions: "V14 Gy <1 cc; D0.01 cc <21 Gy",
    reirradiation:
      "No validated universal cumulative ceiling. Sum the actual overlapping dose in EQD2₃ and review focal hotspots, circumferential exposure, prior toxicity, and interval.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Brachial plexus",
    oneFraction: "V14 Gy <3 cc; D0.01 cc <16 Gy",
    threeFractions: "V15 Gy <0.1 cc; D0.01 cc <18 Gy",
    reirradiation:
      "Use composite EQD2₃ as a review aid. There is no validated spine reirradiation lifetime ceiling equivalent to the HyTEC cord model.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Heart",
    oneFraction: "V16 Gy <15 cc; Dmax <22 Gy",
    threeFractions: "V15 Gy <15 cc; Dmax <21 Gy",
    reirradiation:
      "Evaluate the mapped composite dose and prior cardiac exposure. Do not convert these single-course goals into an automatic remaining budget.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Trachea",
    oneFraction: "V8.8 Gy <4 cc; Dmax <20.2 Gy",
    threeFractions: "V8.8 Gy <4 cc; Dmax <18 Gy",
    reirradiation:
      "Review composite EQD2₃, airway circumference exposed, prior toxicity, and concurrent systemic therapy. No validated universal cumulative ceiling.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Small bowel",
    oneFraction: "V10 Gy <5 cc; Dmax <15.4 Gy; circumference <12 Gy",
    threeFractions: "V12 Gy <0.01 cc; circumference <10 Gy",
    reirradiation:
      "Use actual mapped bowel dose when available and prioritize serial hotspot and circumferential review. No validated universal cumulative ceiling.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Colon",
    oneFraction: "V11 Gy <20 cc; Dmax <18.4 Gy",
    threeFractions: "V11 Gy <20 cc; Dmax <18 Gy",
    reirradiation:
      "Use mapped composite dose and case-specific review. Do not infer a safe cumulative dose from the single-course planning goal.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Skin",
    oneFraction: "V14 Gy <10 cc; Dmax <16 Gy",
    threeFractions: "V16 Gy <10 cc; Dmax <21 Gy",
    reirradiation:
      "Review overlap, skin condition, prior wound healing, surgery, and the composite hotspot. No validated universal cumulative ceiling.",
    referenceIds: ["mackin-2026"],
  },
  {
    organ: "Sacral plexus",
    oneFraction: "Dmax below GTV prescription",
    threeFractions: "Dmax below GTV prescription",
    reirradiation:
      "No numeric cumulative reirradiation ceiling was provided in the MD Anderson workflow. Individualize using composite dose and neurologic risk.",
    referenceIds: ["mackin-2026"],
  },
];

export const PUBLISHED_CORD_RERT_DMAX = [
  {
    prior: "20 Gy / 5 fx",
    priorEQD2: 30,
    one: "9 Gy",
    two: "12.2 Gy",
    three: "14.5 Gy",
    four: "16.2 Gy",
    five: "18 Gy",
  },
  {
    prior: "30 Gy / 10 fx",
    priorEQD2: 37.5,
    one: "9 Gy",
    two: "12.2 Gy",
    three: "14.5 Gy",
    four: "16.2 Gy",
    five: "19 Gy",
  },
  {
    prior: "40 Gy / 20 fx",
    priorEQD2: 40,
    one: "Not proposed",
    two: "12.2 Gy",
    three: "14.5 Gy",
    four: "16.2 Gy",
    five: "20 Gy",
  },
  {
    prior: "45 Gy / 25 fx",
    priorEQD2: 43,
    one: "Not proposed",
    two: "12.2 Gy",
    three: "14.5 Gy",
    four: "16.2 Gy",
    five: "21 Gy",
  },
  {
    prior: "50 Gy / 25 fx",
    priorEQD2: 50,
    one: "Not proposed",
    two: "11 Gy",
    three: "12.5 Gy",
    four: "14 Gy",
    five: "15.5 Gy",
  },
];

export const ESTRO_ISRS_RERT_REGIMENS = [
  "16 Gy / 1 fx",
  "24 Gy / 2 fx",
  "30 Gy / 4 fx",
  "30 Gy / 5 fx",
];
