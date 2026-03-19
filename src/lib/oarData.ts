/**
 * Spine OAR Dose Budget Database
 *
 * Cumulative re-irradiation EQD2 limits from published literature.
 * CNS structures: alpha/beta = 2 Gy
 * Non-CNS structures: alpha/beta = 3 Gy (except liver 2.5)
 *
 * Sources: QUANTEC, TG-101, Sahgal HyTEC, Nieder, Kirkpatrick
 */

export type ToxicityTier = 1 | 2 | 3;

export interface OARBudgetData {
  name: string;
  tier: ToxicityTier;
  lifetimeToleranceEQD2: number;
  alphaBeta: number;
  complication: string;
  specialNote: string;
}

export const OAR_DATABASE: OARBudgetData[] = [
  // ── Tier 1: Life-Threatening ──
  {
    name: "Spinal Cord",
    tier: 1,
    lifetimeToleranceEQD2: 70,
    alphaBeta: 2,
    complication: "Myelopathy",
    specialNote:
      "Sahgal HyTEC: cumulative thecal sac EQD2 Dmax <=70 Gy. SBRT single fraction: Dmax 14 Gy (0.035cc). Nieder: low risk if cumulative BED2 <120 Gy, interval >=6 mo, no single course BED >=102 Gy.",
  },
  {
    name: "Cauda Equina",
    tier: 1,
    lifetimeToleranceEQD2: 72,
    alphaBeta: 2,
    complication: "Neuropathy",
    specialNote:
      "QUANTEC: Dmax 60 Gy conventional. SBRT 1fx Dmax 16 Gy, 3fx 24 Gy, 5fx D5cc 32 Gy (TG-101). Limited reirradiation data; extrapolated from cord.",
  },
  {
    name: "Esophagus",
    tier: 1,
    lifetimeToleranceEQD2: 68,
    alphaBeta: 3,
    complication: "Perforation / fistula / stricture",
    specialNote:
      "QUANTEC: Dmean <34 Gy for Grade 2+ esophagitis. TG-101 SBRT: 1fx D5cc 11.9 Gy, 3fx 17.7 Gy, 5fx 19.5 Gy. Relevant for thoracic/cervical spine targets.",
  },
  {
    name: "Aorta / Great Vessels",
    tier: 1,
    lifetimeToleranceEQD2: 120,
    alphaBeta: 3,
    complication: "Rupture",
    specialNote:
      "TG-101: 1fx D10cc 31 Gy, 3fx 39 Gy. Relevant when spine target abuts aorta. Extremely conservative constraint; breach is catastrophic.",
  },
  {
    name: "Trachea / Large Bronchus",
    tier: 1,
    lifetimeToleranceEQD2: 80,
    alphaBeta: 3,
    complication: "Stenosis / fistula",
    specialNote:
      "TG-101: 1fx D4cc 10.5 Gy, 3fx 15 Gy. Relevant for upper thoracic spine targets near airway.",
  },

  // ── Tier 2: Critical ──
  {
    name: "Brachial Plexus",
    tier: 2,
    lifetimeToleranceEQD2: 75,
    alphaBeta: 3,
    complication: "Plexopathy",
    specialNote:
      "QUANTEC: <66 Gy single course. TG-101 SBRT: 1fx D3cc 14 Gy, 3fx 20.4 Gy, 5fx Dmax 30.5 Gy. Relevant for cervicothoracic spine targets.",
  },
  {
    name: "Sacral Plexus",
    tier: 2,
    lifetimeToleranceEQD2: 75,
    alphaBeta: 3,
    complication: "Neuropathy / bowel-bladder dysfunction",
    specialNote:
      "Limited dedicated literature. Constraints extrapolated from brachial plexus and cauda equina data. Relevant for sacral/lumbosacral spine targets.",
  },
  {
    name: "Kidneys (bilateral)",
    tier: 2,
    lifetimeToleranceEQD2: 28,
    alphaBeta: 3,
    complication: "Renal dysfunction",
    specialNote:
      "QUANTEC: Dmean 15-18 Gy, V20 <32% for <5% renal dysfunction. Relevant for lumbar spine targets. Constraint is bilateral mean; single kidney tolerance higher.",
  },
  {
    name: "Stomach",
    tier: 2,
    lifetimeToleranceEQD2: 54,
    alphaBeta: 3,
    complication: "Ulceration / perforation",
    specialNote:
      "TG-101: 1fx D10cc 11.2 Gy, 3fx 16.5 Gy. Relevant for lower thoracic/upper lumbar spine. PPI prophylaxis recommended when dose approaches limits.",
  },
  {
    name: "Small Bowel",
    tier: 2,
    lifetimeToleranceEQD2: 50,
    alphaBeta: 3,
    complication: "Obstruction / perforation",
    specialNote:
      "QUANTEC: V45 <195cc for Grade 3+ <10%. TG-101: 1fx D5cc 11.9 Gy, 3fx 15.4 Gy. Critical for lumbar/sacral spine targets.",
  },
  {
    name: "Liver (mean)",
    tier: 2,
    lifetimeToleranceEQD2: 32,
    alphaBeta: 2.5,
    complication: "Radiation-induced liver disease (RILD)",
    specialNote:
      "QUANTEC: Dmean <28-32 Gy conventional. Relevant for lower thoracic spine. Liver has significant regenerative capacity but limited reirradiation data.",
  },

  // ── Tier 3: Quality of Life ──
  {
    name: "Skin",
    tier: 3,
    lifetimeToleranceEQD2: 60,
    alphaBeta: 3,
    complication: "Ulceration / fibrosis",
    specialNote:
      "TG-101: 1fx D10cc 23 Gy, 3fx 30 Gy. Generally not dose-limiting for deep spine targets but relevant for superficial sacral lesions.",
  },
  {
    name: "Rib",
    tier: 3,
    lifetimeToleranceEQD2: 70,
    alphaBeta: 3,
    complication: "Fracture",
    specialNote:
      "Risk increases with SBRT doses >40 Gy in 5fx to rib. Relevant for paravertebral extension. Rib fractures usually manageable; rarely dose-limiting.",
  },
];

export function getOARsByTier(tier: ToxicityTier): OARBudgetData[] {
  return OAR_DATABASE.filter((o) => o.tier === tier);
}
