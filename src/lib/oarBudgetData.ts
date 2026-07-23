export type SpineRegion = "cervical" | "thoracic" | "lumbar" | "sacral";

export interface OARBudgetProfile {
  id: string;
  name: string;
  metric: string;
  alphaBeta: number;
  workingCeilingEQD2: number;
  regions: SpineRegion[];
  complication: string;
  planningTip: string;
  ceilingNote: string;
}

export const OAR_BUDGET_PROFILES: OARBudgetProfile[] = [
  {
    id: "spinal-cord",
    name: "Spinal cord / cord PRV",
    metric: "D0.01 cc or matched near-maximum metric",
    alphaBeta: 2,
    workingCeilingEQD2: 72,
    regions: ["cervical", "thoracic"],
    complication: "Myelopathy",
    planningTip:
      "Use the actual overlapping cord or cord-PRV dose. Keep the same structure and near-maximum metric across courses whenever possible.",
    ceilingNote:
      "72 Gy EQD2₂ is the MD Anderson working cumulative ceiling from the Spine Hub kickoff. It is editable for case review.",
  },
  {
    id: "cauda-equina",
    name: "Cauda equina / cauda PRV",
    metric: "D0.01 cc or matched near-maximum metric",
    alphaBeta: 2,
    workingCeilingEQD2: 72,
    regions: ["lumbar", "sacral"],
    complication: "Neuropathy",
    planningTip:
      "Use the cauda equina rather than spinal cord below the conus. Confirm whether the prior plan used a PRV before summing.",
    ceilingNote:
      "Institutional working ceiling used for budget exploration. Dedicated cumulative cauda data are limited, so the ceiling remains editable.",
  },
  {
    id: "brachial-plexus",
    name: "Brachial plexus",
    metric: "D0.01 cc or matched near-maximum metric",
    alphaBeta: 3,
    workingCeilingEQD2: 75,
    regions: ["cervical"],
    complication: "Plexopathy",
    planningTip:
      "Most relevant at the cervicothoracic junction. Review both plexus dose and the involved nerve root when gross disease tracks laterally.",
    ceilingNote:
      "Editable working ceiling for composite review, not a validated universal reirradiation threshold.",
  },
  {
    id: "esophagus",
    name: "Esophagus",
    metric: "D0.01 cc",
    alphaBeta: 3,
    workingCeilingEQD2: 68,
    regions: ["cervical", "thoracic"],
    complication: "Ulceration, stricture, or fistula",
    planningTip:
      "For thoracic disease, inspect both near-maximum dose and the service-template small-volume constraint. Circumferential exposure may matter.",
    ceilingNote:
      "Editable working ceiling for composite review. There is no universally validated lifetime spine reirradiation ceiling.",
  },
  {
    id: "bowel",
    name: "Bowel bag / small bowel",
    metric: "D0.01 cc",
    alphaBeta: 3,
    workingCeilingEQD2: 50,
    regions: ["lumbar", "sacral"],
    complication: "Ulceration, obstruction, or perforation",
    planningTip:
      "Bowel is often a principal limiter for lumbar and sacral targets. Also review the regimen-specific circumferential-dose instruction.",
    ceilingNote:
      "Editable working ceiling for matched near-maximum dose. Volume and circumferential constraints must be reviewed separately.",
  },
  {
    id: "stomach",
    name: "Stomach",
    metric: "D0.01 cc",
    alphaBeta: 3,
    workingCeilingEQD2: 54,
    regions: ["thoracic", "lumbar"],
    complication: "Ulceration or perforation",
    planningTip:
      "Relevant for lower thoracic and upper lumbar targets. Pair the near-maximum budget with the applicable V30 or V21 small-volume goal.",
    ceilingNote:
      "Editable working ceiling for composite review, not a validated universal reirradiation threshold.",
  },
  {
    id: "kidneys",
    name: "Kidneys",
    metric: "Mean dose",
    alphaBeta: 3,
    workingCeilingEQD2: 28,
    regions: ["lumbar"],
    complication: "Renal dysfunction",
    planningTip:
      "Use a matched mean-dose metric. Review combined and individual kidney volume constraints separately, especially with a solitary kidney.",
    ceilingNote:
      "Editable mean-dose working ceiling. Do not compare a prior kidney mean with a new-plan Dmax or Vx.",
  },
  {
    id: "heart",
    name: "Heart",
    metric: "Mean dose",
    alphaBeta: 3,
    workingCeilingEQD2: 50,
    regions: ["thoracic"],
    complication: "Late cardiac injury",
    planningTip:
      "Use mean dose for the cumulative budget and separately review small-volume hot spots for short-course plans.",
    ceilingNote:
      "Editable planning value used for composite review. Cardiac risk is continuous and patient-specific rather than a binary lifetime threshold.",
  },
  {
    id: "lungs",
    name: "Lungs",
    metric: "Mean lung dose",
    alphaBeta: 3,
    workingCeilingEQD2: 20,
    regions: ["thoracic"],
    complication: "Pneumonitis or fibrosis",
    planningTip:
      "Use a matched mean-lung-dose metric. V15, V20, and spared-lung volume remain separate plan checks and cannot be collapsed into this number.",
    ceilingNote:
      "Editable mean-dose planning value. This scalar budget does not replace dose-volume review.",
  },
  {
    id: "liver",
    name: "Liver",
    metric: "Mean dose",
    alphaBeta: 2.5,
    workingCeilingEQD2: 32,
    regions: ["thoracic", "lumbar"],
    complication: "Radiation-induced liver disease",
    planningTip:
      "Use a matched mean-dose metric and retain an adequate spared liver volume. The directive V23 goal remains a separate check.",
    ceilingNote:
      "Editable mean-dose planning value. Functional reserve and baseline liver disease materially affect interpretation.",
  },
  {
    id: "sacral-plexus",
    name: "Sacral plexus",
    metric: "D0.01 cc or matched near-maximum metric",
    alphaBeta: 3,
    workingCeilingEQD2: 75,
    regions: ["sacral"],
    complication: "Neuropathy or bowel/bladder dysfunction",
    planningTip:
      "Contour when disease extends through the sacral foramina or along the plexus. Dedicated cumulative tolerance data are limited.",
    ceilingNote:
      "Editable extrapolated working ceiling. Treat as a planning aid rather than a validated reirradiation threshold.",
  },
  {
    id: "skin",
    name: "Skin",
    metric: "D0.01 cc",
    alphaBeta: 3,
    workingCeilingEQD2: 60,
    regions: ["cervical", "thoracic", "lumbar", "sacral"],
    complication: "Ulceration or fibrosis",
    planningTip:
      "Most relevant for posterior superficial targets and previously operated fields. Inspect overlap with scars and hardware.",
    ceilingNote:
      "Editable working ceiling for near-maximum dose. Clinical examination and prior skin reaction remain important.",
  },
  {
    id: "great-vessels",
    name: "Aorta / great vessels",
    metric: "D0.01 cc or matched near-maximum metric",
    alphaBeta: 3,
    workingCeilingEQD2: 120,
    regions: ["thoracic", "lumbar"],
    complication: "Vascular injury or rupture",
    planningTip:
      "Relevant when paraspinal extension abuts the aorta. Review wall involvement, surgery, stent grafts, and small-volume dose.",
    ceilingNote:
      "Editable working value with substantial uncertainty. It must not be treated as a universal binary safety threshold.",
  },
];

export const REGION_PRESETS: Array<{
  id: SpineRegion;
  label: string;
  helper: string;
  oarIds: string[];
}> = [
  {
    id: "cervical",
    label: "Cervical",
    helper: "Cord, plexus, esophagus",
    oarIds: ["spinal-cord", "brachial-plexus", "esophagus", "skin"],
  },
  {
    id: "thoracic",
    label: "Thoracic",
    helper: "Cord, esophagus, heart, lungs",
    oarIds: [
      "spinal-cord",
      "esophagus",
      "heart",
      "lungs",
      "great-vessels",
      "skin",
    ],
  },
  {
    id: "lumbar",
    label: "Lumbar",
    helper: "Cauda, bowel, stomach, kidneys",
    oarIds: [
      "cauda-equina",
      "bowel",
      "stomach",
      "kidneys",
      "liver",
      "great-vessels",
      "skin",
    ],
  },
  {
    id: "sacral",
    label: "Sacral",
    helper: "Cauda, plexus, bowel, skin",
    oarIds: ["cauda-equina", "sacral-plexus", "bowel", "skin"],
  },
];

export const FRACTIONATION_OPTIONS = [1, 3, 5, 10];

export const SPINE_REGIMEN_OPTIONS = [
  {
    id: "ssib-40-30-5",
    label: "SSIB 40/30 Gy in 5 fx",
    gtvDose: 40,
    electiveDose: 30,
    fractions: 5,
    priorRT: true,
    intensity: "Highest target BED among the listed prior-RT regimens",
    practicalTip:
      "Dose-intensified option. Bowel, stomach, esophagus, and neural geometry commonly determine whether the boost is deliverable.",
  },
  {
    id: "ssib-40-30-10",
    label: "SSIB 40/30 Gy in 10 fx",
    gtvDose: 40,
    electiveDose: 30,
    fractions: 10,
    priorRT: true,
    intensity: "More fractionated salvage",
    practicalTip:
      "Useful after prior stereotactic treatment, long targets, marked epidural extension, or when adjacent OAR geometry favors fractionation.",
  },
  {
    id: "ssib-27-24-3",
    label: "SSIB 27/24 Gy in 3 fx",
    gtvDose: 27,
    electiveDose: 24,
    fractions: 3,
    priorRT: true,
    intensity: "Common radioresistant prior-RT template",
    practicalTip:
      "The radiosensitive prior-RT variant keeps 27 Gy to GTV but lowers the elective level to 21 Gy.",
  },
  {
    id: "ssrs-24-16-1",
    label: "SSRS 24/16 Gy in 1 fx",
    gtvDose: 24,
    electiveDose: 16,
    fractions: 1,
    priorRT: false,
    intensity: "Selected radioresistant single fraction",
    practicalTip:
      "Primarily a radiation-naive template. Reirradiation use is highly selected and requires case-specific composite review.",
  },
  {
    id: "ssrs-18-16-1",
    label: "SSRS 18/16 Gy in 1 fx",
    gtvDose: 18,
    electiveDose: 16,
    fractions: 1,
    priorRT: false,
    intensity: "Selected radiosensitive single fraction",
    practicalTip:
      "Primarily a radiation-naive template. Do not infer reirradiation feasibility from the target BED alone.",
  },
];
