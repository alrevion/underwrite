# Stages 3-4: prototype, paid experiment, traction

An experiment answers **one** question. Write the success threshold before launching; otherwise any result gets explained as success.

## Stage 3. Prototype and test

Run it after discovery: a polished prototype does not prove that anyone needs the product.
- Clickable, no backend; one user task from entry to result.
- 5 people from the target segment; observe silently; record: done / not done, time, errors, words.
- Threshold (rule of thumb): at least 4 of 5 complete the task without help; a repeating error in 2 or more - fix and retest.
- "Understandable" is not "needed": stage 4 answers "needed".

## Stage 4. Paid experiment

Signal strength, strongest first (same ladder as `../shared/evidence-and-logs.md`):

| Signal | What it is | Strength |
|---|---|---|
| Payment | prepayment, paid pilot, subscription | high |
| Letter of intent | signature, amount, date, conditions | medium |
| Sign-up | left contact or joined a waitlist after seeing the price | low |
| Observed behaviour | completes the task, returns on its own | medium-low |
| Words | "sounds interesting", a like | does not count |

Methods, cheapest first:
- **Explainer video or concept page:** tests whether the problem story resonates (sign-ups); weak evidence on its own.
- **Fake door / landing page** with price and a buy/sign-up button: measures intent conversion.
- **Pre-order** with prepayment or discount for early commitment.
- **Manual service** (concierge, wizard of Oz): do the result by hand on the client's data, no product.
- **Paid pilot** for 4-8 weeks with acceptance criteria.
- **Letter of intent** only with date, signature, amount and conditions; an empty form is not traction.

State the threshold as numbers: "of N target visitors, at least X% leave a request and Y pay; otherwise pivot". For B2B small numbers: "of 10 conversations at least 2 sign a pilot at a price not below P".

Gate: no payments or signed commitments at the target price -> pivot (price, segment, offer) or Kill. Do not cut the price to "pass": learn at which price they pay and recompute economics (`unit-economics.md`).

## Hypotheses and experiment cards

Every experiment starts from a written hypothesis; card template: `../assets/templates/experiment-card.md`. Two hypotheses (Ries; definitions here come from a secondary summary, his own post was not reached):
- **Value hypothesis:** do these people have the problem, and does the product deliver value once they use it?
- **Growth hypothesis:** how will new users find it and how will it grow?

Card parts (concepts from Strategyzer's Test Card and Learning Card; the wording below is community wording, not the official labels): hypothesis "We believe that ..." · test "To verify that, we will ..." · metric "And measure ..." · success criterion "We are right if ..." (threshold set before) · then, after the run: "We observed ..." · "From that we learned ..." · "Therefore we will ...". Write several cards, run the cheapest that could falsify the top assumption, then digest the results into one learning.

### Testing the УТП wording
At stages 3-4 the УТП (`value-proposition.md`) is the first line of the prototype intro, the landing headline or the opening of the pitch. If traffic or conversations allow, compare two wordings; record which one the target customer repeats back and which gets requests or payments. A click on a price page is interest by plan, not purchase intent.

### Verified examples and common misuse (by method above)

| Method (above) | Tests | Example (checked on a page) | Misuse |
|---|---|---|---|
| Explainer video | does the problem story resonate; sign-ups | Dropbox: Hacker News submission, 2007, and an explainer video made for the YC application (sign-up counts in the sources conflict) | treating attention as product validation; commenters doubted the problem |
| Fake door / landing page (with a price page) | demand and message; which plan is clicked | Buffer's two-page test, 2011 (Gascoigne) | a pricing click or an email is not a purchase |
| Manual service: wizard of Oz | will people buy before anything is automated | Zappos: photographed shoes, bought at retail after each order (Fortune, 2012; the "Oz" label is not in that source) | a manual service with no stated hypothesis |
| Manual service: concierge | learn first, code last: serve a few customers by hand | Food on the Table (Rosso's deck) | calling any manual service "concierge" without a measured hypothesis |
| Pre-order | willingness to pay | no verified primary example found | a waitlist counted as demand; scope growing because of pre-sales |

Rules of thumb quoted online ("3-5 pre-orders", "3% conversion") are vendor guidance with no primary source; set your own threshold in advance.

## Traction (metrics that prove the model works)

Traction is the evaluation of how successful the business model and project development are.

| Group | Metrics |
|---|---|
| Financial | revenue (dynamics, structure, growth: MoM month on month, QoQ quarter on quarter, YoY year on year); margin dynamics at different levels (gross, contribution); marketing spend |
| Operational | units/services sold; conversion dynamics; audience growth; activation; retention by cohort |

Pilot metrics from day one:
- activation: share who reached the first result;
- retention by cohort: returned in week 2, 4, 8; the curve should flatten above zero;
- payments and revenue per customer; time to first result;
- qualitative: what they would pay for, what they switched off.

Investor-facing traction deck and definitions: `fundraising-pack/references/traction.md` and `seed-metrics.md`.
