# Market sizing (stage 0 sanity check, stage 5 proper)

Question: **what is the realistically obtainable market, and does it feed the team?** An investor also looks at volume, trends and growth drivers.

Full bottom-up procedure with an investigator prompt: `fundraising-pack/references/market-sizing.md`. This file gives definitions, the lecture example and checks.

## Three layers

| Layer | Meaning |
|---|---|
| TAM (Total Addressable Market) | total volume of the target market |
| SAM (Serviceable Addressable Market) | the part you can serve with your product, geography and channel |
| SOM (Serviceable Obtainable Market) | the part you can realistically win in a stated period |

## Two methods

- **Top-down:** start from a large figure and cut by shares. Fast, used as a cross-check. Risk: wide percentages hide the real customer count.
- The **5-minute check at stage 0** is a rough bottom-up (customers x annual price).
- **Bottom-up (preferred):** number of reachable customers x annual price x realistic adoption. Auditable; ties to the plan.

## Worked example (lecture): online shop for cycling equipment (top-down)

1. TAM = share of population with bikes x population x average ticket: 5% x 146 m x 2,000 RUB = about 14.6 bn RUB (the slide rounds to 14 bn).
2. SAM = TAM x share of people who ride professionally: 14 bn x 2% = 280 m RUB.
3. SOM = SAM x potential share: 280 m x 10% = 28 m RUB.

Exact arithmetic: 7.3 m owners x 2,000 = 14.6 bn -> SAM 292 m -> SOM 29.2 m; the slide rounds to 14 bn / 280 m / 28 m. The slide calls this an example of a **narrow market**. The 10% share is an assumption; label it.

## Bottom-up template

| Step | Value | Source |
|---|---|---|
| Number of target customers (companies, schools, clubs) in the first region | N | official statistics, registers |
| Share you can reach with your channel in 12-36 months | r | channel test |
| Annual price per customer | P | paid signal |
| Realistic win rate among reached | w | pilot conversion |
| **SOM (year)** | N x r x w x P | |

Region ladder: home city -> country -> adjacent markets with the same language/regulation. Show each rung separately.

## Checks

- SOM equals the revenue line of the model for the same period.
- SOM covers the minimal team for 12-36 months; otherwise the stage-0/5 stop applies.
- TAM is not "the whole industry"; it is only those who have the problem you solve.
- A large market with a slow incumbent is not a SOM; state who you win from and why.
- Trends and growth drivers: name two with sources (law, technology, price).

## Mistakes seen

- "1% of a huge market" as a plan.
- Mixing revenue of an industry with revenue available to your product.
- Using global figures for a regional product.
- A SOM larger than the number of reachable customers allows.
