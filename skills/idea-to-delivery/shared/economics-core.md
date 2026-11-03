# Economics core (both modes)

Formulas and rules for costs, effects, indicators and risk analysis. Unit economics of a product (CAC, LTV, retention) -> `startup/unit-economics.md`. Market size -> `startup/market.md`. Investor-side valuation, cap table, terms -> `fundraising-pack`.

## Depth by moment

| Moment | What to compute |
|---|---|
| Idea | a sheet of assumptions: price, channel, order of magnitude of market |
| After interviews | price hypothesis, channel, CAC hypothesis, margin per unit |
| After a paid signal | unit economics on real conversion; break-even |
| Before a round | monthly model for 18-24 months, scenarios, reconciled with the bank (`fundraising-pack`) |
| Client company decides | NPV/IRR/PI/DPP inside a business case (`corporate/business-case.md`) |

## Cost structure of an IT project

| Block | Items |
|---|---|
| Capital (TIC, once) | purchase or development (salaries with contributions, outsourcing), equipment, integration and database, training, extra software, launch, contingency |
| Operating (Z_op, recurring) | licences and renewals, support, hosting, enhancements, depreciation, contingency, promotion |

Rules: boxed software -> intangible asset plus amortisation; cloud -> subscription in operating costs; count "own" and "hired" executors separately (taxes); a change in users' salaries is not an operating cost of the system; every price carries a source and a date.

Bottom-up budget: sum over stages of (hours x rate) + equipment and licences + contingency (10% is a common default; the diploma case also uses 20% on the operating base - pick by uncertainty and state it). For client proposals, hours and prices go through `kp-estimate`. Savings: events per year x hours saved per event x hourly rate.

Cash position (investor view): burn = monthly net cash outflow; runway = cash on hand / monthly burn; break-even = the volume where contribution covers fixed costs. Track cash weekly, not only the model.

## Indicators and when to use them

| Indicator | Formula | Criterion | When |
|---|---|---|---|
| NP (annual extra profit) | dV + dZ - Z_op | > 0 | basis of the flows |
| SRR | NP / TIC | higher is better | quick filter, cheap fast projects |
| PP | 1 / SRR | within horizon | quick filter |
| NPV | sum NCF_t / (1+i)^t, t=0 is the investment | > 0 | expensive or long projects, payback > 1 year |
| IRR | rate where NPV = 0 | > discount rate | same |
| PI | 1 + NPV / TIC (TIC = PV of the investment) | > 1 | comparing variants |
| DPP | year when cumulative discounted flow >= 0, interpolated | within horizon | same |

Static indicators ignore the time value of money - use only as a first filter. Compute dynamic indicators with `scripts/fincheck.py`.

## Discount rate

`i = risk-free + sum of risk premiums`. Risk-free: yield of a government bond with a matching horizon **on the calculation date**; the central-bank key rate is a fallback and needs an explanation. Premiums by factor (for example five groups of 0-5%): market, management, technology, organisation, security/regulation. Every premium has a one-line reason; the sum in the table equals the figure in the text (`fincheck.py --premiums`). For a startup without revenue the rate is high; show NPV at 2-3 rates.

## Effects

One row per problem:

| Problem | Solution (function) | Qualitative effect | Quantitative effect | Impact on dV / dZ |
|---|---|---|---|---|

- Every quantitative assumption has a source (measurement, interview, benchmark) or the label "assumption".
- Revenue growth enters profit through margin, not at 100%.
- Qualitative effects (speed, quality, transparency, risk reduction, image) are described and linked to strategy through a scorecard: four perspectives (finance, customers, processes, learning and growth); goal -> indicator -> target value -> initiative.
- Chain to verify: problem -> requirement -> criterion -> function -> result (calculation).

## Risk analysis

1. **Sensitivity:** change one factor at a time by +/-10...45% **relative** to base; output NPV per factor.
2. **Critical points:** value of a factor where NPV = 0, with safety margin in percent (price, volume, costs).
3. **Scenarios:** three coherent sets (pessimistic / realistic / optimistic) where related factors move together.

Conclusion is written from the table: if NPV < 0 the project is not recommended even when IRR "looks fine".

## Make-or-buy comparison (box vs cloud, build vs buy)

Six criteria used in the course material: implementation cost, flexibility and scalability, maintenance, infrastructure requirements, data security, UX and updates. There is no universally better option: compute TCO over 3-5 years (up to 7 for on-premise infrastructure), include regulatory requirements, IT team capacity, customisation criticality, distributed team, and roadmap.

## Abbreviations

| Abbr. | Meaning |
|---|---|
| dV, dZ | change in revenue, change in costs (per year) |
| NP | annual extra profit = dV + dZ - Z_op |
| TIC | total investment (capital) costs |
| Z_op | operating costs per year |
| NCF | net cash flow of a year |
| SRR, PP | simple rate of return, simple payback period |
| NPV, IRR, PI, DPP | net present value, internal rate of return, profitability index, discounted payback period |
| CAC, CPA, LTV | customer acquisition cost, cost per action, lifetime value |
| BMC | Business Model Canvas |
| ABCDX | respondent segmentation by value to the project |
| ICP | ideal customer profile |
| OLA, UC | operational-level agreement (internal), underpinning contract (supplier) |
| MTTR | mean time to restore |
