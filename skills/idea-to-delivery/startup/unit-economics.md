# Unit economics (stage 5)

Question it answers: **does the company earn more on one unit (usually a customer) than it spends to acquire that unit?** You compare two values: cost to acquire, and money earned from that unit over time. Use it to find break-even and margin, judge channels and pricing, forecast growth at a healthy LTV/CAC, and size the funding need.

Traps list: `../shared/model-traps.md` (sections F-I). Calculator: `scripts/fincheck.py --unit`. What to *show* investors at seed: `fundraising-pack/references/seed-metrics.md`.

## 1. Choose the unit and stay consistent

| Business | Typical unit |
|---|---|
| Mobile app / game | new user |
| SaaS B2B | paying customer (company), not each seat |
| E-commerce | customer with a purchase |
| Marketplace / ride-hailing | transaction or trip (also customers) |

Rule: the same starting point for CPA and LTV. Extra accounts are separate units only if they cost sales effort.

## 2. Definitions and formulas

| Metric | Formula | Notes |
|---|---|---|
| CPA | acquisition spend of a cohort / users in the cohort | cost of any target action (sign-up, trial, lead) |
| CAC | (marketing + sales expenses) / new paying customers in the period | fully loaded; with lag (section 5) |
| Gross profit GP | revenue - variable costs (COGS) | variable: store fees, goods, delivery, payment fees, per-deal integration; not R&D or dev team |
| ARPU / revenue per user | revenue / users, same period as churn | |
| Retention (period) | (users at end - new users in period) / users at start x 100% | see section 4 |
| Churn | 1 - retention | annualise: 1 - (1 - monthly churn)^12 (canon) |
| LTV (cohort method) | cumulative GP of the cohort to horizon X / users in the cohort | preferred when data exist |
| LTV (shortcut) | ARPU x gross margin / churn | needs stable churn, recurring revenue, same period |
| LTV (contribution form) | (revenue per customer - direct cost per customer) / (1 - retention rate) | |
| LTV/CAC | LTV / CAC | |
| ROI of a channel | (LTV - CPA) / CPA | |
| CAC payback | CAC / monthly gross profit per customer (canon) | funding model sets the acceptable horizon |
| Break-even customers (canon) | fixed costs per year / annual contribution per customer | for subscriptions: yearly operating cost / yearly price; this is operating break-even - it excludes the capital investment |

Two LTV families (SaaS pages):
- **Predictive LTV**, mature stable revenue: (T x AOV x AGM x ACL) / C, where T transactions, AOV average order value, AGM average gross margin, ACL average customer lifetime, C customers.
- **Flexible LTV**, new product: GML x R / (1 + D - R), where GML is gross margin per customer (the page: "per customer lifespan"), R retention, D discount rate. The bracket notation on the source page is ambiguous: verify before using.

Recommendation: use the **cohort method** whenever there is real data (it also exposes the shape of the curve). Use ARPU x margin / churn only as a quick estimate and write its assumptions next to the number.

## 3. Cohort analysis

Idea: split customers into groups by a shared start, then watch each group over time. Averages hide whether things get better or worse.

Cohort types: acquisition (date of install / sign-up), behavioural (did action X in a window), time (campaign, holiday, release), segment (device, plan, region), size (beta vs public launch).

Reading the table: rows = cohorts; columns = age (day 0, 1, 2...); cells = share still active. Along a row: how one cohort ages (retention over user lifetime). Down a column: how successive cohorts compare at the same age (retention over product lifetime).

Illustration (mobile app, 13,487 users over 10 cohorts): day 1 about 27%, day 2 about 19%, day 3 about 15%, day 7 about 12.5%, day 10 about 12%; the early drop dominates, so onboarding is the lever. Some cohorts differ by 5-10 points at day 1 (24-34%): look for the event that explains the gap before celebrating.

Procedure: goal -> exact cohort definition (one user, one cohort) -> metric -> table -> fill from data (dedupe, check time stamps) -> visualise (heatmap or overlaid curves) -> interpret (sharp drops, odd cohorts, curve shape). Improvement after a change is a correlation until another cohort or a controlled experiment confirms it.

## 4. Retention variants

- **Classic / N-day:** share of the cohort active on exactly day N. Best for daily-use products.
- **Unbounded:** active on day N or any day after. Fits irregular use.
- **Bracketed:** active within chosen intervals (day 1, 3, 7, 14, 31) matching the usage cycle.
- By users (includes free), by paying customers (ties to revenue), by cohort.
- Churn used in LTV is **period churn on the customer base** (1 - period retention). N-day cohort values describe the shape of a curve; do not plug an N-day number into the churn slot.
- Always define the **critical event** (action that proves value and relates to revenue) and the **usage interval** (how often it should happen).

Benchmarks, month 1 / 2 / 3 retention, all industries 14 / 12 / 11 (%); education 10 / 7.7 / 6.6; finance 15 / 12 / 11; IT 15 / 12 / 11; manufacturing 17 / 15 / 14; media and telecom 12 / 10 / 8.5; retail 12 / 9.5 / 8.5; transport and logistics 16 / 13 / 12 (vendor report, 2024; method not stated; not norms).

## 5. CAC done properly

1. **Who is a customer?** CAC is per paying customer; a registration or trial is CPA.
2. **Lag.** Expenses precede customers (sales cycle often 60 days). Formula for a 60-day cycle with sales spread evenly: CAC(n) = [marketing(n-60 days) + 0.5 x sales(n-30 days) + 0.5 x sales(n)] / new customers(n). In the source example a same-month CAC of 148 against a target of 125 says "switch the channel off"; with a two-month lag the same data gives 84 (March) and 111 (April), which says "scale".
3. **Fully loaded.** Include salaries of everyone doing marketing and sales (also part-time), overhead, tools. Distinguish fully loaded and non-loaded CAC.
4. **Free tier / trial** that is the acquisition channel: include its product, support and delivery cost; a $1 trial customer is a customer only after renewal.
5. **New vs returning.** Either all spend on all customers, or split acquisition from reactivation and count only new ones.
6. **Segments.** By channel, platform, region. Mind attribution (paid users recorded as organic understate a channel) and incrementality (would they have come anyway).

## 6. Thresholds

| LTV/CAC | Reading |
|---|---|
| < 1 | acquisition does not pay back |
| 3 or more | good benchmark; usual target for growing SaaS |
| 4 or more | strong model |
| 5 or more | typical of fast-growing firms but may mean under-investing in marketing |

Interpretation depends on industry and business model. Payback horizon follows the funding model: venture-funded teams often accept 12-18 months, sometimes longer; self-funded rarely wait more than 2-6 months. If LTV plateaus, take the month where the curve flattens.

## 7. Worked example A (lecture): subscription of pet supplies

Inputs: price per box $43; COGS $21; delivery and packaging $7; 2 orders per customer per year; the customer leaves after a year; marketing and sales $7,500 per year; 1,000 new customers.

- CAC = 7,500 / 1,000 = **$7.5**
- LTV = (43 - 21 - 7) x 2 = **$30**
- LTV/CAC = 30 / 7.5 = **4**

The slide notes it is simplified: acquiring-bank fees, real conversion and exact repeat orders are not included.

## 8. Worked example B (GoPractice): mobile app, one January cohort

Inputs: 2,500 users; acquisition spend $2,000; revenue Jan-Apr 1,000 / 600 / 480 / 440; variable costs 15% of revenue.

- CPA = 2,000 / 2,500 = **$0.80**
- Gross profit Jan-Apr = 850 / 510 / 408 / 374 = **2,142**
- Forecast May-Jul = 363 / 360 / 358 (monthly split as given by the page summary) -> cumulative **3,223**
- LTV through July = 3,223 / 2,500 = **about $1.29** (the article rounds to 1.28 and calls it the 6-month LTV; January-July is seven calendar months - check the horizon definition at the source) > CPA $0.80
- ROI of the channel = (1.29 - 0.80) / 0.80 = about **0.61**

Forecast method: take past cohorts' decay curve plus 1-2 weeks of actuals.

## 9. Worked example C (CFI): online shop, contribution form

Ad spend 10,000, 1,000 customers -> CAC 10. Revenue per customer 50, direct costs 30, retention 75% (the page gives no period; the example treats it as annual) -> contribution 20; LTV = 20 / (1 - 0.75) = 80; LTV/CAC = **8.0x**. Valid only if fixed costs are small; retention and CAC change over time.

## 10. Procedure

1. Fix the unit and the period.
2. Pull spend and customers by channel with the lag.
3. Compute gross profit per customer.
4. Build the cohort table; choose the horizon.
5. Compute LTV by cohort method; add the shortcut with its assumptions.
6. Compute LTV/CAC and payback per channel.
7. Decide: scale, fix price/margin, change channel, or stop.
8. Record assumptions and the decision.

## 11. Gate (stage 5)

Pass: unit economics computed on real price or conversion signals for at least one channel; payback within the funding model; assumptions listed. Stop: margin <= 0 at the intended price, or CAC cannot be tied to any repeatable channel.

## 12. Pricing (stage 5)

1. **Ceiling:** the customer's cost of the status quo (`competition.md`) and the value of the outcome.
2. **Reference:** price per outcome of the best alternative.
3. **Floor:** unit cost + margin needed for LTV/CAC >= 3 at the observed churn and CAC.
4. **Test:** the paid experiment at two or three price points (`experiments.md`); keep the price at which the intended segment pays.
Do not lower the price to pass a gate; recompute economics at the price that actually sells.

## 13. Extras

- Break-even forecast, marginality and funding need follow from the same sheet.
- Use the sheet to price: what price makes LTV/CAC >= 3 at the observed churn?
- Do not mix "paying customers" and "users" in numerator and denominator.
