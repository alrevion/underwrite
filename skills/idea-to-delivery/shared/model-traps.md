# Traps in financial and unit-economics calculations

Checklist for any model and the text around it. Sections A-E were seen in real student and case work (diplomas, coursework, cases); F-I come from the lecture and public pages on unit economics. Run `scripts/fincheck.py` first (NPV, IRR, PI, DPP, premium sum, unit economics), then walk the list.

## A. Investment formulas
- [ ] **DF = 1/(1+i)^t**, not 1/(1-i)^t. Sometimes the numbers are right and the formula in the text is mistyped - fix both.
- [ ] DPP denominator is the discounted flow of **the payback year**, not a sum with something else. Re-check "cumulative NPV minus (minus previous)" arithmetic. Text claims about "cumulative NPV turns positive in year N" must match the table.
- [ ] PI > 1 (not > 0). DPP is years with a fraction, not "1 year" by rounding.
- [ ] Do not swap static labels: SRR is a rate of return (1/year), PP = 1/SRR is a period.
- [ ] IRR is compared with the discount rate; when NPV < 0 "good IRR" is not an argument.

## B. Cash flows
- [ ] **No numbers typed over formulas** (case: a year's costs hard-coded - NPV overstated about 4x). Recompute each year from inputs.
- [ ] Revenue is not profit: revenue growth enters through margin.
- [ ] Do not mix financing views: evaluate either project flows **without** debt service at a project-level rate, or equity flows **with** debt service at the cost of equity; never count a loan both as an inflow and as interest.
- [ ] Depreciation is not a cash flow: add it back to net profit when moving to NCF.
- [ ] Taxes: payroll contributions, VAT, profit tax - by regime and **on the date**; check IT-company benefits.
- [ ] Payroll and contributions are not counted twice (case: payroll twice in the estimate).
- [ ] Identical flows five years in a row mean copy-paste or no growth - justify.
- [ ] Units: roubles / thousands / USD not mixed; prices of different periods brought to one date.

## C. Discount rate
- [ ] Sum of premiums in the table equals the figure in the text (case: 9.5% vs 10.5%).
- [ ] "Key rate as risk-free" needs an explanation; date and source given.
- [ ] NPV shown at 2-3 rates, not one.

## D. Effects and assumptions
- [ ] Every quantitative effect has a source; "+37% orders" with no basis is an assumption and is labelled.
- [ ] Profit effect cannot exceed what the market can give (customers x price).
- [ ] Horizon and liquidation stage (migration, archive, closure) are included or explicitly excluded.

## E. Scenarios and sensitivity
- [ ] "+/-5% / +/-10%" are **relative** shifts, not absolute (case: petrol 0.08 -> 0.03 turned out to be -62.5%).
- [ ] The conclusion in the text equals the table (case: pessimistic NPV -1.87 m in text vs -0.97 m in table).
- [ ] Scenarios are coherent: in the pessimistic case volume and price fall together, not one at a time.

## F. Unit economics: CAC
- [ ] **CAC vs CPA:** CAC is the cost of a *paying customer*; CPA is the cost of any other target action (sign-up, trial, lead). Do not use them as synonyms.
- [ ] **Fully loaded:** salaries of everyone in marketing and sales (including part-time), overhead, tools. A "media spend only" number is not CAC.
- [ ] **Lag:** spend in month n produces customers in n+lag (about 60 days in B2B SaaS). A same-month CAC can turn "switch the channel off" into "scale it".
- [ ] **New vs returning:** costs of acquisition in the numerator, new customers in the denominator; reactivated customers are counted separately.
- [ ] **Free tier / trial:** if it is the acquisition channel, its cost is part of CAC.
- [ ] **Blended average hides channels:** compute by channel, platform, region; attribution errors (paid users recorded as organic) understate a channel; ignoring incrementality overstates it.

## G. Unit economics: LTV
- [ ] **Gross profit, not revenue:** LTV on revenue overstates value. Gross margin includes all direct costs of delivering the product or service.
- [ ] **ARPU / churn only under assumptions:** stable churn, recurring revenue, same period for revenue and churn. State them or use the cohort method.
- [ ] LTV = ARPU is wrong; "lifetime = 1/churn" is a shortcut, not a measurement.
- [ ] **Horizon:** report LTV at a stated horizon (for example 6 or 12 months); compare with CAC payback acceptable for the funding model.
- [ ] Revenue per user and churn are taken over the **same period**.

## H. Retention and cohorts
- [ ] Retention = (end - new in period) / start, not end/start. Otherwise growth hides churn.
- [ ] Do not compare N-day, unbounded and bracketed retention with each other.
- [ ] Compare day-30 only for cohorts already 30 days old (immature cohorts).
- [ ] Small cohorts swing wildly: show sizes next to percentages.
- [ ] A paid subscription is not usage: also track a critical event.
- [ ] Improvement after a release is a correlation until a control exists.

## I. Ratios and thresholds
- [ ] LTV/CAC > 3 is a benchmark, not a verdict: check payback time, cash, and segment. A very high ratio may mean under-investment in growth.
- [ ] A ratio computed from forecasts is a forecast: label it.
- [ ] Benchmarks differ by industry and business model.

## J. Presentation
- [ ] One source per number: financial model -> document (not the reverse).
- [ ] Assumptions live on a separate sheet; formulas stay visible, not pasted as values.
- [ ] After the last model change, re-check tables and text; old versions do not sit nearby under similar names.
- [ ] Conclusions follow criteria: NPV > 0, IRR > i, PI > 1, DPP within horizon.
