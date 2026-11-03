# Evidence, decisions and review

Shared by both modes. Keeps every claim traceable and every gate decision recorded.

## 1. Label every number

| Label | Meaning | Example | What is required |
|---|---|---|---|
| Fact | measured or documented | "11 of 14 interviewees named spreadsheets as the workaround" | source (file, date, who) |
| Estimate | derived with a method | "TAM 14.6 bn = 5% x 146 m x 2000" | method, inputs, range |
| Assumption | not yet checked | "30% of trial users convert" | how and when it will be tested |

Rules: an assumption may drive a plan, never a conclusion. Keep assumptions in `assumptions.md`, not buried in prose. When an assumption is tested, change its status and cite the evidence.

## 2. Evidence ladder (strongest at the top)

1. Payment (prepayment, paid pilot, subscription).
2. Signed letter of intent with amount, date and conditions.
3. Sign-up or contact left after seeing the price.
4. Behaviour observed (task completion, repeat use).
5. Stated opinion ("sounds interesting", likes). Does not count.

An empty or unsigned form is not evidence. Friends and relatives are not a sample.

## 3. Gate decisions

| Decision | Meaning | Typical next step |
|---|---|---|
| Go | stop condition not met, evidence sufficient | next stage |
| Kill | the idea cannot work as framed | write what was learned; close |
| Hold | blocked by something external or missing data | name the blocker and the date to re-check |
| Recycle | change segment, offer, price or hypothesis | go back to a named earlier stage |

A gate is passed on evidence, not on effort spent. Vocabulary used elsewhere maps to these four: Scale = Go, continue = Go, pivot = Recycle, stop = Kill.

Gate S (shaping) is a **clarity** gate: it checks that the idea is concrete, bounded and testable, not that anyone wants it. Everything it passes is still an assumption (its best evidence class is opinion). It uses the same four words.

## 4. Logs (templates in `assets/templates/decision-log.md`)

`decisions.md`: date | stage | question | what was done | finding | decision | next step | who.
`assumptions.md`: assumption | risk type (value / usability / feasibility / viability) | how to test | threshold | status (open / confirmed / refuted) | source | date.

## 5. Independent review protocol

Use at the end of a mode or before sending a document to a client.

1. Give one subagent (no conversation context) the artifact set and a checklist: arithmetic and formulas, every number labelled, traceability requirement -> problem -> effect, undefined terms, contradictions between files.
2. Cheap model for mechanical checks (recalculation, link and cross-reference checks); a stronger model only for judgement (is the alternative set honest, are effects plausible).
3. One pass. Fix findings once; do not loop.
4. Report to the user: what was found, what was fixed, what remains a judgement call.
5. Without subagents: run the checklist yourself in a separate pass and call it "self-review".

## 6. Common failure modes

- Writing the conclusion first and collecting facts to fit it.
- Averaging across segments and hiding the one segment that works.
- Counting effort (documents written) as progress through a gate.
- Silent scope growth: log every change as a decision.
