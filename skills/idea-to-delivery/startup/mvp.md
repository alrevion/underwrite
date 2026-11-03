# Stages 7-9: MVP slicing, build and pilot, decision

Hours, price, payment stages and the proposal: `kp-estimate`. Here: what goes into the MVP and how to tell it worked. Formal plan, tests and acceptance in depth: `../corporate/delivery.md`.

## Stage 7. Slicing

1. **One job, one persona.** The MVP proves the value of one result for one user type. The rest goes to "later".
2. **Vertical slice** = a piece from interface to data that gives the user a complete result. Not "database first, screens later".
3. **Riskiest slice first.** If the risk is value, the slice where the user pays or comes back.
4. **Prioritise:** MoSCoW (Must - value cannot be proven without it; Should; Could; Won't now) or RICE = reach x impact x confidence / effort. For 5-10 features MoSCoW is enough.
5. **Acceptance criterion per Must slice**, as given / when / then, or a checkable number.
6. **Pivot/persevere metric fixed before building:** which retention, payment or time-to-result value counts as success. Write it as experiment cards for the value and the growth hypothesis (`experiments.md`). Pivot versus iteration: the working rule is in `idea-shaping.md` (Definitions).

Gate: the core does not fit time and budget without removing the point -> narrow the persona or the job, do not stretch the deadline.

## Plan (light)

- WBS: stages and sub-stages; role, rate, duration, dependencies, output artifact per item.
- Critical path; parallel work where there is no dependency (purchasing and environment preparation).
- Risks: short register (`../corporate/delivery.md`, risk register).

## Stage 8. Build and pilot

- N users and duration (for example 5-10 people, 4-6 weeks); pilot acceptance criteria are the numbers from stage 7.
- Metrics instrumented from day one (`experiments.md`, section Traction).
- Defects: levels S1-S3 and the release rule are in `../assets/templates/test-plan.md`. Acceptance record: criteria, results, open defects, decision, signatories (`../assets/templates/acceptance-act.md`).
- Changes during the pilot: log every change as a decision; "on the fly" changes without a record are the main source of MVP creep.

## Stage 9. Decision

| Evidence | Decision |
|---|---|
| Retention curve flattens above zero; the intended customers pay | Go / Scale: financial model v1 (`fundraising-pack`), roadmap, and `../handoff.md` if a formal delivery frame is needed |
| People pay but not those you built for | Recycle the segment |
| They do not retain and do not pay | Kill; write what you learned |
| Evidence incomplete | Hold with a named test and date |

## Roadmap (what an investor expects to see)

A company should have a coherent roadmap in several lines: **product**, **marketing**, **geographic**, **investment** (and others). After the deal the investor typically works with you on strategy and controls key stages - plan the milestones they will check.

| Line | Content | Horizon |
|---|---|---|
| Product | next 2-3 releases, each tied to a metric | 6-12 months |
| Marketing | channels to test, budget, expected CAC | 6-12 months |
| Geographic | next market, why, entry cost | 12-24 months |
| Investment | next round: amount, milestones, runway | 12-24 months |

## Exit thinking (short)
Plan the exit routes early; list and examples are in `fundraising-pack/references/investors-and-process.md` (section on fund lifecycle and exit).
