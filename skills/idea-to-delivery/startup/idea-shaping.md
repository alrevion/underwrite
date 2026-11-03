# Stage S: idea shaping (доводка идеи)

Goal: turn a raw idea into a coherent, bounded concept worth testing, before any research.
Output: `<project>/idea-to-delivery/S-shaping.md` (the filled `assets/templates/concept-page.md`: v0 after S1, v1 after S5) and a gate decision in `decisions.md`.

**How to run:** read `value-proposition.md` first (job lens, canvas, УТП) and the Definitions in `discovery.md`. Copy the template to `S-shaping.md` and fill it in place. Steps are named S0-S8 so they are not confused with stage 0.

S is the **first stage after the idea is voiced**, before stage 0. It produces clarity, not evidence: everything written here is an assumption (label it) and goes into `assumptions.md`. Evidence starts at stage 1.

Use S when the idea is a sentence or a paragraph, the user cannot yet say who exactly it is for, or several directions compete.
**Skip rule (single source):** skip S only if a concept page already exists with a named first user, a job statement and a first test.
Not S: asking what the user wants built (`deep-interview`, optional input at S0); market research, interviews, competitor analysis (stages 1-5).

## Rules of the stage

1. **Appetite** = the budget for the first bet: time, money, people (Shape Up uses it as a build budget, not an estimate). Fix it in S0; default if the user has none: 3 weeks, one person, no code. Later steps cut the idea to fit it.
2. **Diverge, then converge.** No evaluation while generating; scoring happens in S4.
3. **Problem lens before solutions** (S2 before S3). Sources disagree on order (design sprints sketch early; Torres and Graham start from problems); problem-first is cheaper to correct. The "what we do" slot in the S1 one-liner is a placeholder revised after S2.
4. **Two generators.** Founder and agent produce variants and failure reasons independently, then merge. This limits anchoring on the first idea. If the idea arrives as one message, that message is the founder's list, including sub-ideas voiced in it (pricing, technology, channels); do not stop for another round. Ask for the founder's own variants and failure reasons at the gate review and merge them then.
5. **Rough but bounded.** Solved at the level of the main flow, with explicit limits. No mockups or detailed specs: they hide complexity and freeze the design too early.
6. **Time-box for shaping:** at most two working sessions (a session = one sitting of roughly 1-2 hours). Our rule of thumb; no source gives a number for this phase. Then the gate decides.

## Relation to deep-interview

`deep-interview` removes ambiguity about **what to build** and produces a spec. S improves **the idea itself**: variants, reframing, choice. If a deep-interview spec exists, use it as S0 input and do not ask its questions again. If the idea is muddy and no spec exists, run the five intake questions. This skill never launches deep-interview by itself. It is useful again before stages 6-7 or corporate C5, to pin down the system to build. Corporate mode has no S: its C0 (charter, PR-FAQ) plays that role.

## Procedure

| Step | Do | Moves used | Artifact |
|---|---|---|---|
| S0 Intake and appetite | raw idea verbatim; ask only the questions below that the user or a spec have not answered; set appetite | | top of `S-shaping.md` |
| S1 Draft | one first user, one situation, one outcome; the one-liner | refinement | concept page v0 |
| S2 Job lens | job statement without the product; customer profile (jobs, pains, gains), ranked | | left half of the canvas |
| S3 Diverge | >= 6 variants, >= 2 reframings, >= 1 adjacent opportunity | ideation, reframing, opportunity discovery | variants table, reframings |
| S4 Converge | score variants; tar-pit check; pick main and reserve | pivot (as a choice) | choice with reasons |
| S5 Deepen | value map, use cycle, scenario, limits (appetite, no-gos, rabbit holes), how it earns | concept development | concept page v1 |
| S6 Package | УТП draft, provisional positioning sentence, 60-second pitch (optional mini press release) | | УТП block |
| S7 Stress | pre-mortem, coverage check, clarity check, choose the first test | | risks into `assumptions.md` |
| S8 Gate | decision logged in `decisions.md` | | Go / Kill / Hold / Recycle |

### S0. Intake questions
1. Who has the problem, in which situation? 2. What do they do today (including nothing)? 3. What outcome do you want for them? 4. Why now? 5. Why you (access to users, skills, motivation)?

### S1. Refinement checklist
- Name **one** first user (a real person or a precise type, not "everyone"), **one** situation, **one** outcome.
- Replace each adjective with an action or a number ("fast" -> "result in under 10 minutes").
- Monday-morning test: what is different for this person on Monday morning after they start using it?
- One-liner: "[First user], in [situation], gets [outcome] by [what we do]." This is **not** the positioning (that compares with alternatives: `competition.md`).

## The six moves

| Move | Question | How | Output | Typical mistake |
|---|---|---|---|---|
| **Idea refinement** (S1) | Is it concrete enough to argue about? | checklist above | concept page v0 | "for everyone", "convenient and fast" |
| **Concept development** (S5) | How does it work and how is it used? | use cycle (trigger -> action -> result -> return); two or three "day in the life" scenarios; in/out of the first version; first five minutes; how it earns | cycle, scenarios, limits | a feature list instead of a cycle |
| **Ideation** (S3) | In which other forms can this idea exist? | >= 6 variants that differ from each other and from the original on at least one axis; use the pivot catalogue below as the axis checklist; Crazy 8s (eight distinct ideas, eight minutes) or SCAMPER prompts (substitute, combine, adapt, modify, put to other use, eliminate, reverse) when stuck | variants table | judging while generating; six near-copies |
| **Reframing** (S3) | What if the value is elsewhere? | at least two techniques below; write each result as "we assumed X; maybe Y" | >= 2 reframings, each with what would change (user, solution, price) | cosmetic rewording |
| **Opportunity discovery** (S3) | What is behind the next door? | who else has this job; what do workarounds reveal; is there a narrow start with a credible path to a larger market (Graham's "well"); is a by-product worth more than the main thing | candidate list (not an opportunity tree) | inventing a platform with no first user |
| **Pivot** (S4; later a gate decision) | Which variant do we take if the current one is weak? | a decision, not work: at S a cheap choice of another variant; after stages 1-9 it is Recycle with a pivot type | `decisions.md` entry | pivot without a reason and without a kept backlog |

**S3 with two generators:** the founder's list comes first: the idea message itself, or, if the founder is present, two minutes and one message; then write the agent's list without referring to it; then merge and remove duplicates.

### Reframing techniques
A working set assembled from the sources below, not a single canonical list.
- **How Might We** (IDEO / IXDF account). Write a point of view (user, need, insight), then 5-10 questions "How might we [verb] for [user] so that [outcome]". Not so narrow that one answer remains, not so broad that there is no start. Practitioner caution: do not bake a feature into the wording.
- **Inversion** (reverse brainstorming). Ask "how could we make this problem worse, or make the customer fail?"; list without judging; flip each into an action; evaluate the flipped ones.
- **Analogy** (Synectics). Who solves a structurally similar problem in another field, and how? Can produce attractive nonsense; test the analogy against the job.
- **Job lens.** Restate the idea as the job someone hires something for (`value-proposition.md`).
- **Paradox** (the second step of Dorst's frame creation, as summarised in a citing paper): what makes this problem hard, where is the deadlock? The full nine-step model was not used.
- **Assumption challenge** (our prompt): what does everyone assume here that may not hold?

### Pivot catalogue (variant-generation checklist)
Walk the idea through each type before choosing; every type is also a possible future pivot.

| Type | Definition (as in two fetched lists) | Question for the idea |
|---|---|---|
| Zoom-in | one feature becomes the whole product | which single piece is the actual value? |
| Zoom-out | the product becomes a feature of a larger one | is this really a feature? |
| Customer segment | same product, a more receptive group | who needs it more urgently? |
| Customer need | another problem of the same customer | is this the most painful problem they have? |
| Platform | application <-> platform | one app now, or infrastructure others build on? |
| Business architecture | high margin / low volume <-> low margin / high volume | what economics suit this? |
| Value capture | change how it earns | who pays: user, third party, or on outcome? |
| Engine of growth | viral, sticky (retention), paid | how will new users arrive? |
| Channel | change how the customer receives it | where is the customer already? |
| Technology | same problem, different technology | is there a cheaper way to deliver the same result? |

Status of the list: one fetched list (Gust) attributes the ten types to Ries, a second names no author; Ries's own source was not found (`shared/provenance.md`).
**Definitions.** Ries (2011): a pivot is a structured course correction to test a new fundamental hypothesis about product, strategy or engine of growth; he suggests reviewing pivot-or-persevere not more often than every few weeks and not less often than every few months. Blank separates a pivot (substantial structural change, e.g. a new target market) from an iteration (smaller, e.g. wording). Working rule here: a change of segment, need, model, channel or growth engine is a pivot (Recycle, with the type logged); tuning price or wording inside the same model is an iteration (Go, with the card updated).

## S4. Converge

Score each variant 1-5 on six criteria; no weights; look at the lowest numbers. **All scores are assumptions.** Next to "founder fit" record the underlying facts (access to users, past work) with their source.

| Criterion | Question |
|---|---|
| Founder fit | why you: access to users, skill, unfair advantage |
| Pain and alternatives | how bad is it; do people hack around it today |
| First user reachable | can you name and reach ten such people within a week |
| Testable cheaply | can the riskiest assumption be tested within the appetite |
| Path to money | who pays, for what, order of magnitude |
| Upside | size if it works, judged at scale, not at entry |

Rules:
- **Who scores:** the agent proposes scores with a one-line reason; the founder corrects and decides.
- A variant that cannot be stated as a job a real person has is dropped here (`value-proposition.md`).
- A 1 on "testable" or "path to money" means the variant does not win without a plan to fix it.
- **Main** = best on the lowest-number rule and total. **Reserve** = the next best that differs from the main on at least one axis (segment, need, channel, model), so one failed assumption does not remove both. The rest stay in the table as the pivot backlog.
- **Ties.** If variants tie on total and on lowest score, take the one whose first test is cheapest and fastest and could falsify the riskiest assumption; then the one with the more reachable first user. If every finalist shares the same lowest score (for example money = 2 for all), that is a signal, not a tie: the choice will not change the first test, so record the shared unknown as the top assumption.
- Hard, boring or crowded are questions, not vetoes (a hard start can deter rivals; competitors are a positive sign of a real market, per a third-party account of a YC talk). Tar-pit check: who tried this and failed, and what is the barrier? If you cannot name the barrier you have no plan to overcome it.
- Sanity check with IDEO's three terms: desirable (people want it), feasible, viable. They map to the four risks in `discovery.md`.
- Do not use RICE or ICE here (our reasoning): reach and effort do not exist for a raw idea, and multiplying three guesses compounds error.

## S5. Concept page v1 (bounded)
Besides the cycle and scenarios: **appetite**, **rabbit holes** (parts that could swallow the budget and how to avoid them), **no-gos** (explicitly out), **how it earns**. A mini press release (under one page, passes the "so what?" test: why is this a meaningful improvement over what they do today) is an optional way to test the concept; the full PR-FAQ belongs to corporate C0.

**Money sanity (when the founder brings a price or payout model, or the concept assumes one).** Four checks, arithmetic written next to the model with its method:
1. Revenue per customer per period against variable cost per customer (payment fees, payouts, compute, support). Write the fee rate as an assumption.
2. Is the variable cost bounded? Usage-driven cost (reads, tokens, API calls) against a flat price is not: a fixed payout per unit turns into a loss past a break-even usage. Compute that number; fix it with a cap, a pool (revenue share divided in proportion to usage) or pricing by use.
3. Say what "we keep X" means: before or after infrastructure and compute.
4. Customers needed to cover a minimal team: yearly team cost / margin per customer per year. If it is out of reach even in a generous niche, say so now (stage 0 repeats it in five minutes). CAC and LTV wait for stage 5 (`unit-economics.md`, `../scripts/fincheck.py --unit`).

## S7. Stress test
- **Pre-mortem** (idea from Klein, HBR 2007; procedure after a secondary account, the original is paywalled): "It is [date]. The idea failed. Why?" Write about five reasons silently, around two minutes (counts and timings vary by source). The agent writes its own list independently; merge. Rate each reason as in `assumptions.md`: critical 1-5 (how bad if true) and unknown 1-5 (how little we know). The top three become assumptions with a test.
- **Two-sided and platform ideas** (marketplace, network, forum, exchange): add these reasons to the pre-mortem. Who comes first, and what do they get while the other side is empty? Can it start as a one-sided tool for one team or for yourself? What is the smallest crowd that makes the first test meaningful? What stops fake supply or fake demand? If users or agents read content from strangers, what happens when that content is hostile or wrong? A variant that needs both sides before its first test scores 1 on "testable".
- **Coverage check (not fit):** each of the top three pains and top three gains has a pain reliever / gain creator, or is consciously out of scope (`value-proposition.md`). Fit is claimed only after customers confirm it.
- **Clarity check:** three people from the target group if reachable inside the time-box, otherwise three strangers; show the 60-second pitch. **Pass** = at least 2 of 3 restate who it is for and what it does without prompting. One of 3: rewrite S6 and retry once. None: Recycle. This proves clarity only; on the evidence ladder it is opinion, not demand.
- **First test:** the cheapest test that could falsify the top assumption (`experiments.md`; card: `assets/templates/experiment-card.md`).

## S8. Gate

Criteria (our synthesis; no source gives a formal exit rule):
1. Concept page: no blank in who, trigger, value, how it earns.
2. One first user and one problem named; limits written (appetite, no-gos).
3. >= 6 variants and >= 2 reframings; main and reserve chosen with reasons.
4. УТП draft passes the three-question check (`value-proposition.md`); the "pulls" part stays a hypothesis, and "unique" may be "unknown" if logged as an assumption to test at stage 1.
5. Top three failure reasons are assumptions with tests; the first test is chosen and could falsify the top one.
6. Clarity check passed; time-box respected.

| Decision | When | Next |
|---|---|---|
| Go | criteria 1-6 met (items logged as accepted risk are named) | stage 0: the hypothesis page is filled from S; "revisit after three interviews" is allowed |
| Kill | no variant has a named first user, or every variant scores 1 on founder fit; or two Recycle loops did not fix it and no named fact could | stop; log what was learned |
| Hold | a required input is outside our control (access to a user, a data point) | park with a date and the named fact |
| Recycle | all variants weak on testability or money (criteria 2-3), or criteria 4-6 failed | back to S3 for another reframing round (criteria 2-3) or to S6-S7 (criteria 4-6); at most two loops, then Kill or Hold |

If the time-box is exceeded: decide with what is met; criteria 1-3 met and the rest not -> Hold with named facts.

**Run by the agent alone.** Criterion 6 needs three people, so an agent-only run ends with criteria 1-5 met and the check pending. Log it as **Hold (clarity check pending)** with the owner, a date two days out, the 60-second pitch text and the pass rule. It is a named state, not a failure. Pass: log Go and continue to stage 0 without redoing S1-S7. One of three: rewrite S6 once and retry. None: Recycle to S6.

## Loops
- **Stage 1 -> S:** after two or three interviews the user's words differ from the job statement. Expected, not a failure: log Recycle and reshape.
- **Stages 3-9 -> S:** pivot. The reserve and the rest of the variants table are the **pivot backlog**; pick from it instead of starting again.
- Interviews feed Torres-style mapping from stages 1-2: build the opportunity map after 3-4 interview stories and refresh every 3-4. At S, opportunities are candidates only.

## Anti-patterns
Endless polishing instead of a decision · a canvas filled with imagined data and presented as validated · mockups before the concept is bounded · "platform" ambitions without a first user · scoring variants before generating all of them · skipping the pre-mortem because the idea is loved · treating founder enthusiasm as evidence.
