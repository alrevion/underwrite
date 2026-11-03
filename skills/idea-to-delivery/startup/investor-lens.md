# Investor lens

An investor screens a deal on twelve criteria. Use this file as a **readiness check** at any stage: for each criterion, what we can show today, and how strong the evidence is. Fundraising mechanics (decks, forms, term sheets, cap table) stay in `fundraising-pack`.

## The twelve criteria

| # | Criterion | The investor asks | Where we answer (stage) | Strong evidence | Weak evidence |
|---|---|---|---|---|---|
| 1 | Problem | Which problem? Is it actual? Will people pay? How is it confirmed? | 0-2 `discovery.md` | interviews with trigger and budget; payments | friends' opinions |
| 2 | Technology and product | What is special? Is there know-how? | 3-8 | working product, what is hard to copy | feature list |
| 3 | Market | Volume, trends, growth drivers | 0, 5 `market.md` | bottom-up with sources | "1% of a huge market" |
| 4 | Competition | Competitor analysis, barriers to entry | 1, 5 `competition.md` | matrix incl. status quo, durability argument | "no competitors" |
| 5 | Business model and unit economics | Monetisation, cohort analysis, LTV/CAC | 5 `unit-economics.md` | cohort-based LTV, CAC fully loaded | ARPU / churn without data |
| 6 | Traction | Key operational and financial indicators | 8-9 `experiments.md` | MoM/QoQ growth graphs, retention | single point numbers |
| 7 | Team / investors | Who is who, how it started, why you, experience; the investor's share, functions, influence on decisions | 0 | shipped products, domain years, cap table clean | titles only |
| 8 | Strategy | Product and marketing strategy, geographic plans | 9 `mvp.md` roadmap | milestone roadmaps | slogans |
| 9 | Financials | Model, burn, runway, break-even, debt load, IRR, cash-on-cash | 5, 9 `../shared/economics-core.md` | monthly model reconciled with bank statements | top-down hockey stick |
| 10 | Valuation | Earlier rounds, current, analogues | at the round | reverse calc and multiples (`fundraising-pack`) | a number with no method |
| 11 | Exit strategy | When and how can the investor exit | 9 | named acquirers/routes, plan | "IPO someday" |
| 12 | Deal structure | Instrument, main terms | at the round | term-sheet items understood | untested legal text |

## How to use

1. Walk the table and mark each row: strong / weak / missing.
2. Missing rows become tests or tasks with an owner and date; log them.
3. Do not present a row you cannot support: facts are checked in due diligence.

## Three things the lecture stresses
- **Cash control** links the financial analysis and the model: plan runway first. Valuations claimed at fundraising and terms accepted 18 months later can differ sharply if cash is not controlled.
- **Valuation methods:** VC method (reverse calculation) vs multiples vs DCF. DCF needs predictable flows and a settled business model; the lecture asks whether the 10-30% WACC of corporate finance matches the returns venture investors target - DCF fits late-stage companies better than early startups.
- **Exit planning** starts early; due diligence and legal documents are often the longest and most tiring stage of a deal.

## Where the details live
Reverse-calculation example, multiples table, DCF applicability: `fundraising-pack/references/valuation-methods.md`. Term-sheet checklist, due diligence types and legal documents (SHA, SPA, CLA, option agreement): `fundraising-pack/references/terms-and-dataroom.md`. Fund lifecycle and exit routes: `fundraising-pack/references/investors-and-process.md`.
