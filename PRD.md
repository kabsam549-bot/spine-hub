# PRD: SpineRT -- Spine Radiation Clinical Tools

## Overview

SpineRT is an enterprise-grade clinical decision-support platform for spine radiation therapy. Three validated tools in one cohesive app: PRISM prognostic calculator, Nieder-based myelopathy risk calculator, and an interactive OAR dose budget planner (modeled after headneckreirradiation.com).

**Live:** https://spine-hub.vercel.app
**Repo:** github.com/kabsam549-bot/spine-hub

## Stack
- Next.js 16 + TypeScript + Tailwind CSS v4
- Client-side only (no backend, no PHI)
- Vercel hosting

---

## Tool 1: PRISM Calculator (/prism)

Validated composite scoring system for spine SBRT prognosis. 6 variables, 4 groups.

| Variable | Score |
|----------|-------|
| Female sex | +2 |
| ECOG 0/1/2/>=3 | +3.5/+1.5/+0.5/0 |
| Prior surgery | +1 |
| Prior radiation | -1 |
| N organ systems with mets | -N |
| Solitary bone disease | +3 |
| Time dx to met >5yr | +3 |

Groups: >7 Excellent, 4-7 Good, 1-3 Intermediate, <1 Poor.

References: Jensen IJROBP 2017, Florez Radiother Oncol 2024.

---

## Tool 2: Myelopathy Risk Calculator (/myelopathy)

Nieder three-variable scoring: cumulative BED points (0-9), short interval penalty (+4.5 if <6mo), high single course penalty (+4.5 if BED>=102).

Risk: <=3 Low (~3%), 4-6 Intermediate (~25%), >6 High (~90%).

References: Nieder IJROBP 2005, 2006.

---

## Tool 3: OAR Dose Budget (/dose-budget)

Interactive dose budget planner mirroring H&N re-RT site architecture:

### Architecture
- lib/bedCalculations.ts -- BED, EQD2, physical dose conversion
- lib/oarData.ts -- 13 spine OARs across 3 toxicity tiers
- lib/oarDoseBudget.ts -- Per-OAR budget with tissue recovery

### Tissue Recovery Model
- <6 mo: 0% | 6-12 mo: 25% | 12-24 mo: 40% | >24 mo: 50%

### OAR Database

**Tier 1 (Life-Threatening):** Spinal Cord (70 Gy), Cauda Equina (72 Gy), Esophagus (68 Gy), Aorta (120 Gy), Trachea (80 Gy)

**Tier 2 (Critical):** Brachial Plexus (75 Gy), Sacral Plexus (75 Gy), Kidneys (28 Gy), Stomach (54 Gy), Small Bowel (50 Gy), Liver (32 Gy)

**Tier 3 (QOL):** Skin (60 Gy), Rib (70 Gy)

### UI Flow
1. Select OARs from tiered grid
2. Enter prior dose, fractions, time since RT per OAR (multiple courses supported)
3. Calculate: shows remaining budget in EQD2 with progress bar
4. Physical dose table for 1fx, 3fx, 5fx, custom fractionation
5. Risk badges: SAFE (>50%), CAUTION (25-50%), WARNING (10-25%), CRITICAL (<10%)
6. Clinical notes with evidence citations per OAR

### Data Sources
QUANTEC, TG-101, Sahgal HyTEC 2010/2012/2019, Nieder 2005/2006, Kirkpatrick 2010.

---

## Design System
- Font: Inter | Primary: Blue-600 | Risk: Green/Yellow/Orange/Red
- Cards: rounded-2xl, shadow-sm | Animations: fade-in-up
- No emoji | All values 1 decimal | Disclaimer on every page

## Future
- Custom domain | PDF export | URL state sharing
- SINS calculator | Oligomet classification
