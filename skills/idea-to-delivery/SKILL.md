---
name: idea-to-delivery
description: End-to-end method from a product idea to a delivered system, in two independent modes with go/no-go gates. STARTUP mode - idea shaping (concept, variants, УТП, canvas), customer discovery (interviews, JTBD), competitors, market size, unit economics (CAC, LTV), prototype, paid experiment, MVP. CORPORATE mode - business case (NPV/IRR/PI/DPP), AS-IS/TO-BE processes, requirements, system analysis, ТЗ, tests, acceptance, rollout, ITSM/SLA, change management. Use when the user brings a product or startup idea, asks where to start, whether it is worth building, how to check demand, needs a business case, requirements, ТЗ or a check of an IT project's financial calculations. Russian triggers - докрутить идею, идея стартапа, УТП, проверить спрос, юнит-экономика, конкуренты, бизнес-кейс, бизнес-процессы, требования, ТЗ, приёмка, эскалация. Not for - hour and price estimates or proposals (kp-estimate), fundraising packs and pitch decks (fundraising-pack), editing existing code.
---

# Idea to Delivery

Goal: at every stage learn cheaply whether to continue, and leave exactly the artifact the next stage needs. Main risk: building corporate documents (processes, ТЗ, five-year models) before demand is proven, or shipping a "validated" idea with no formal delivery frame.

## Language

Answer the user in their language (Russian by default). Produce documents in the client's language using the standard local names (ТЗ, ФТ/НФТ, акт приёмки). This skill's text is English to save tokens.

## Principles

1. **Cheap before expensive:** conversation -> prototype -> prepayment -> code. Stage order follows the cost of being wrong.
2. **Gate on every stage:** question -> artifact -> stop condition. Decision is Go / Kill / Hold / Recycle (change segment or hypothesis), and is logged. Scale = Go, continue = Go, pivot = Recycle, stop = Kill.
3. **Every number is a fact (source), an estimate (method, inputs, range) or an assumption (how to test).** Never promote an assumption to a fact silently.
4. **Check calculations before relying on them:** `shared/model-traps.md` and `scripts/fincheck.py`.
5. **Depth follows the stage.** No five-year NPV before a paid signal; a sheet of assumptions is enough early.
6. **Traceability:** requirement -> problem -> effect -> calculation -> source of assumption.
7. **Do not duplicate neighbours:** market sizing for a round, pricing, the financial model for investors, traction decks, valuation, term sheets -> `fundraising-pack`; hours, price and proposals -> `kp-estimate`; removing ambiguity about what to build -> `deep-interview` if available (optional input to stage S; this skill does not call it).
8. **Thresholds here are rules of thumb, not laws.** Say where a number comes from and let the user change it.

## Step 0 - intake and mode

Ask once, in one message, only what is not already known: idea in one sentence; who pays and who uses; is there a named person or company with the pain; stage (idea / prototype / pilot / revenue) and what is already proven and how; budget, deadline, team, regulation; who is the buyer (founder, client company).

| Situation | Mode | Start at |
|---|---|---|
| Raw idea (a sentence), directions undecided | Startup, stage S | `startup/idea-shaping.md` |
| Idea nobody has validated | Startup | `startup/overview.md` |
| Client brings a task, demand is not in question | Corporate | `corporate/overview.md` |
| Startup passed gate 9 and must be delivered inside or sold into companies | Startup -> Corporate | `handoff.md` |
| Corporate business case fails or the client's problem is unclear | back to Startup | `handoff.md` (return path) |
| Only one thing needed (a business case, ТЗ, check of a model, unit economics) | either, single stage | route table below |

Modes do not interfere: each runs alone; shared material lives in `shared/`.

## Route by request

| Request | Files |
|---|---|
| Sharpen a raw idea; variants, reframing, pivot options, УТП, canvas, JTBD | `startup/idea-shaping.md`, `startup/value-proposition.md` |
| Where to start / is there demand | `startup/discovery.md`, `startup/competition.md`, `startup/experiments.md` |
| How big is the market | `startup/market.md` |
| Does one customer pay back (CAC, LTV, retention) | `startup/unit-economics.md`, `shared/model-traps.md` |
| What goes into the MVP, pilot, roadmap | `startup/mvp.md` |
| How an investor would judge it | `startup/investor-lens.md` |
| Business case, effects, payback | `corporate/business-case.md`, `shared/economics-core.md` |
| Processes AS-IS/TO-BE | `corporate/processes.md` |
| Requirements, data model, architecture, ТЗ | `corporate/systems.md` |
| Plan, risks, tests, acceptance, pilot | `corporate/delivery.md` |
| Support, SLA, incidents, changes | `corporate/operations.md` |
| Contract, acts, warranty | `corporate/contract-acceptance.md` |
| Stakeholders, RACI, escalation, conflict | `corporate/people-governance.md` |
| Adoption, training, resistance | `corporate/change-management.md` |
| Check someone's calculations | `shared/model-traps.md`, `scripts/fincheck.py` |
| Templates | `assets/templates/` |
| Worked samples | `examples/` |

## Running a stage

1. State the question and the stop condition before the work; log them.
2. Pick the cheapest way to answer.
3. Fill the artifact; label every number fact / estimate / assumption.
4. Run the gate: Go / Kill / Hold / Recycle, one sentence why, what is tested next.
5. Tell the user the decision and one next step. If the gate failed, do not move on silently; if the user chooses to go anyway, log it as a risk.

## Outputs

Folder `<project>/idea-to-delivery/` with `decisions.md`, `assumptions.md` (templates: `assets/templates/decision-log.md`) and one file per finished stage named `<id>-<stage>.md`: startup `S-shaping`, `0-hypothesis`, `1-discovery`, `2-opportunity`, `3-prototype`, `4-experiment`, `5-economics`, `6-requirements`, `7-mvp`, `8-pilot`, `9-decision`; corporate `C0-charter`, `C1-survey`, `C2-business-case`, `C3-processes`, `C4-ux`, `C5-systems`, `C6-pilot`, `C7-delivery`, `C8-launch`. Report to the user: stage, what is confirmed and by what, what is still an assumption, the gate decision, one next step. Plain language; explain terms (CAC, LTV, JTBD, ADR) on first use.

## Independent review

Before declaring a mode complete, run one subagent with no conversation context on the economics and the requirements (cheap model for mechanical checks, one pass, fix once). Protocol: `shared/evidence-and-logs.md`. If subagents are unavailable, run the same checklist yourself in a separate pass and label it "self-review".

## Files

`shared/` evidence-and-logs, economics-core, model-traps, provenance · `startup/` overview, idea-shaping, value-proposition, discovery, competition, experiments, market, unit-economics, mvp, investor-lens · `corporate/` overview, business-case, processes, systems, delivery, operations, contract-acceptance, people-governance, change-management · `handoff.md` · `assets/templates/` · `examples/` · `scripts/fincheck.py`. All paths are relative to the skill folder (`~/.claude/skills/idea-to-delivery/`); inside a file `../` points back to it. Run the calculator as `python3 -I ~/.claude/skills/idea-to-delivery/scripts/fincheck.py`.
