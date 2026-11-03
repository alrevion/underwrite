# Startup mode

Goal: remove uncertainty about an idea as cheaply as possible and decide whether to build, change or stop. Output: either a validated, scoped MVP with evidence, or a logged Kill/Recycle with what was learned.

Start at stage S unless its skip rule holds (a concept page with a named first user, a job statement and a first test already exists: `idea-shaping.md`). Use startup mode when demand, price or the product itself is still unproven. If a client already knows what they want and demand is not in question, go to `corporate/overview.md`.

## Stages

| # | Stage | Question | Artifact | Stop if | File |
|---|---|---|---|---|---|
| S | Shaping | Is the idea concrete, bounded and worth testing? Which direction? | Concept page, >= 6 variants and >= 2 reframings, main + reserve, УТП draft, pre-mortem, first test (`S-shaping.md`) | Recycle or Kill: no named first user; every variant weak on testability or money (Gate S in `idea-shaping.md`) | `idea-shaping.md`, `value-proposition.md` |
| 0 | Hypothesis | Who, what pain, what is the riskiest assumption? | One page: segment, pain, workaround, assumptions by 4 risks, market order of magnitude in 5 minutes | no named person with the pain; market cannot feed a minimal team | `discovery.md` |
| 1 | Discovery | Is there a pain, a trigger, a workaround, a budget? Who else solves it today? | 10-15 interviews, notes, job statements, forces of progress, list of alternatives | nobody has trigger and budget -> change segment or Kill | `discovery.md`, `competition.md` |
| 2 | Opportunity | Which one opportunity do we take? | One outcome, assumption map, experiment for the riskiest assumption | no outcome chosen | `discovery.md` |
| 3 | Prototype | Do people understand and want the solution? | Clickable prototype without backend; 5 users, one task | fewer than 4 of 5 complete the task | `experiments.md` |
| 4 | Paid experiment | Will they pay? | Prepayment, letter of intent with amount, paid pilot or manual service; conversions | no payments or signed intents at target price -> pivot | `experiments.md` |
| 5 | Market and economics | How much money is reachable and does the margin work? | Bottom-up market; unit economics on real price signals | reachable revenue in 12-36 months does not cover the team; margin <= 0; no positioning or durability argument | `market.md`, `unit-economics.md` |
| 6 | Requirements | What exactly do we build, on what? | Functional and non-functional requirements with numbers, data model, ADRs | requirements do not trace to a problem; non-functional without numbers | `../corporate/systems.md` (section "Lite subset") |
| 7 | MVP slicing | The minimum that proves value? | One job, one persona, vertical slices, acceptance criteria, pivot/persevere metric, hours (kp-estimate) | the core does not fit time and budget | `mvp.md` |
| 8 | Build and pilot | Does it work on real people? | MVP with metrics, pilot, acceptance record | S1/S2 defects open; metrics not collected | `mvp.md` |
| 9 | Decision | Scale, pivot or stop? | Retention curve, payments, traction, financial model v1 (`fundraising-pack`), roadmap | retention does not plateau above zero; the wrong people pay | `mvp.md`, `investor-lens.md` |

Order note: a 5-minute market sanity check happens at stage 0 (cheap kill); the proper bottom-up sizing waits for ICP and a price signal (stage 5).

Stage S runs first, right after the idea is voiced, and may be re-entered: after two or three interviews (stage 1) or a pivot (stages 3-9) return to S and take the next variant from its backlog. S produces clarity, not evidence (`idea-shaping.md`).

## Customer Development (Blank) mapped to the stages

Sources: the "Customer development" article (Wikipedia) and Blank's manifesto post (2012); his books were not opened. The mapping to our stages is ours and approximate.

| Phase | Meaning | Our stages |
|---|---|---|
| Customer discovery | turn the vision into business-model hypotheses and test customer reactions outside the team | S, 0, 1, 2 |
| Customer validation | is the model repeatable and scalable? if not, go back to discovery; sell to early customers, do not give the product away | 3, 4, start of 8 |
| Customer creation | build end-user demand; only after validation | 9 and later |
| Company building | move from a learning team to one that runs a validated model | corporate mode and later |

Rules: evidence comes from outside the team (first principle of Blank's manifesto: there are no facts inside the building, so get outside; the exact phrase "get out of the building" is not in that text); write the hypotheses before the conversations; do not scale spend before validation. Test early: do we understand the customer's problem, do enough outsiders care to support a large business, will they spread the word. Pivot versus iteration: `idea-shaping.md` (Definitions).

## Gates require evidence, not effort

Use the ladder in `../shared/evidence-and-logs.md`: payment > signed intent > sign-up after price > observed behaviour > opinion (does not count). Exception: gate S checks clarity, not evidence.

## Exit to Corporate mode

After gate 9 = Go/Scale, or when a client company mandates a formal project, follow `../handoff.md`. Entry criteria: validated problem and segment, a paying or committed customer, retention or pilot metrics, scoped MVP and a decision log.

## Investor view

At any stage you can ask "what would an investor ask now?": `investor-lens.md` maps their 12 criteria to stages and artifacts.

## Gate criteria in numbers (rules of thumb, adjust with evidence)

| Stage | Pass when |
|---|---|
| S | the six criteria of Gate S in `idea-shaping.md`: concept page complete, one first user, >= 6 variants and >= 2 reframings, УТП check, first test chosen, clarity check passed, time-box respected |
| 1 | a pattern repeats in at least 3 of 10 interviews, with a trigger and a budget |
| 3 | at least 4 of 5 test users complete the task without help |
| 4 | B2B: at least 2 prepayments or signed paid pilots at the target price; B2C: the conversion threshold set in advance is met |
| 5 | payback within the funding horizon; LTV/CAC >= 3 or a dated plan to reach it |
| 9 | retention curve flat (period-to-period change within about 2-3 points) at a level where unit economics works, and at least 5-10 paying customers from the target segment (B2B) or the pre-set paying cohort (B2C) |
