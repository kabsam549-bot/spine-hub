# Spine Hub Kick-Off Action Items

Source: Notion page cda31a62-bb63-40f6-bf53-c26d049dbda0
Project: /Volumes/Kouzy/projects/spine-hub
Live: https://spine-hub.vercel.app

## Dose Budget Calculator
- [ ] Accept user inputs: organ at risk (dropdown), prior dose (Gy), fractionation (e.g. 30 in 10), and time since last treatment (months) [c425040d]
- [ ] Compute prior EQD2 from entered dose and fractionation using alpha/beta ratio [0e21dacf]
- [ ] Set MD Anderson lifetime cord tolerance at 72 Gy EQD2 as the default ceiling [a99d8d76]
- [ ] Calculate remaining dose budget: lifetime tolerance minus prior EQD2 [f43bfa7b]
- [ ] Given a user-selected new fractionation scheme (1, 3, 5 fractions etc.), convert remaining EQD2 budget back to a max physical dose per fraction [12c41a03]
- [ ] Display a visual scale/bar showing dose used vs. dose remaining against the tolerance ceiling [9827efaa]
- [ ] Show a full calculation breakdown section so users can verify the math step by step [e7a64b85]
- [ ] Remove all recovery-time logic from the calculator entirely [414c60f6]
- [ ] If time since last treatment is less than 6 months, display a prominent cautionary alert [01eff61d]
- [ ] Add risk tolerance toggle buttons: Low / Medium / High [364f80a7]
- [ ] Default the risk tolerance to one preset (e.g. Medium) on load [9e6b3dd6]
- [ ] Support adding multiple organs at risk simultaneously [c8ed92f4]
- [ ] Include a quick standalone BED/EQD2 calculator widget [2b47aab2]
- [ ] Add input option to toggle between "actual OAR dose" and "prescription dose" [983568e5]

## Prism Score Calculator
- [ ] Implement dynamic scoring: update in real time as user changes inputs [33c3481b]
- [ ] Display a score breakdown section showing each component's contribution [8bfc29f5]
- [ ] Add score range/outcome data next to the score result [85753114]
- [ ] Include a brief description of what Prism is and cite the two relevant papers [688dd324]

## SINS Calculator
- [ ] Build a click-through interface for each SINS component [8a89510e]
- [ ] Dynamic score update as components are selected [6dd5f33c]
- [ ] Score breakdown with explanation of each component's contribution [35d803b0]

## NOMS Framework
- [ ] Build a click-through interface for NOMS assessment [e8f4d533]
- [ ] Dynamic scoring with real-time updates [9c28db62]
- [ ] Display recommendation/output based on selections [976cad32]

## Neider Myelopathy Risk Calculator
- [ ] De-emphasize in the UI -- move to a secondary position or add a footer note [2165ab8d]
- [ ] Keep the existing calculator functional but clearly label it as a legacy/reference tool [72735e5c]

## Lived Experience Tab
- [ ] Create a new top-level tab called "Lived Experience" or "Our Data" [4f156fa2]
- [ ] Display published MD Anderson spine SBRT data [e080a4df]
- [ ] Include which clinical scenario each regimen applies to [854ff5ad]
- [ ] Link to key references (papers) for each data point [9dc30698]
- [ ] Design as a living document structure easy to update [491609ca]
- [ ] Add a constraints table similar to the H&N group's format [bfb7a65d]

## Landing Page / About Section
- [ ] Include disclaimers: "For educational purposes only" [f8412228]
- [ ] Add program information: leadership, papers, contact info [f3184317]
- [ ] Add qualifiers on single-center experience data [d909cf27]
- [ ] General calculators don't need institutional disclaimers [0eb557f9]

## UI / UX Requirements
- [ ] Mobile-friendly responsive design [aa299233]
- [ ] Clean, modern aesthetic [1e13f51a]
- [ ] All inputs should produce real-time dynamic updates [19aa8fed]
