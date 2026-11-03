# Stages 0-2: hypothesis, discovery, opportunity

## Stage 0. Hypothesis page (template: `assets/templates/hypothesis-page.md`)

One page, no marketing:
- **Who:** a specific person or company type (role, size, country). "All schools" is not a segment.
- **Pain and trigger:** what happened when they started looking for a solution.
- **Workaround:** what they do now (spreadsheet, contractor, manual work) and what it costs them.
- **Why now:** what changed (law, technology, price).
- **Assumptions by four risks** (map below).
- **Market order of magnitude in 5 minutes:** number of such customers x annual price. Only to kill the clearly tiny. Proper sizing is stage 5 (`market.md`).

Stop: no named person with the pain, or the order of magnitude cannot feed a minimal team.

If stage S ran, fill this page from `S-shaping.md` (concept page, УТП draft, pre-mortem assumptions) instead of starting from zero. Carried-over items are still assumptions until interviews confirm them.

## Problem validation questions (the five that investors also ask)

1. Which problem does it solve? State it without the solution.
2. Is it actual - does it happen now, is it recurring?
3. How large is it - how many people or companies, how much money or time per case?
4. Are people ready to pay to solve it - what do they pay now?
5. How is it confirmed - interviews, observed behaviour, money? ("Friends say they love it" is not validation.)

## Four risks and the assumption map

| Risk | Question | How to test |
|---|---|---|
| Value | Is it needed, will they pay? | interviews, paid experiment |
| Usability | Will they understand and manage? | prototype test |
| Feasibility | Can we build it in time and budget? | spike, estimate |
| Viability | Does the economics, law and channel work? | unit economics, lawyer, channel test |

List 5-10 assumptions; rate each by "how critical" and "how little we know"; test critical and unknown ones first (usually value).

## Stage 1. Interviews

Rules (Mom Test):
- ask about **past behaviour and money**, not opinions about the future: "when did you last... what did you do... what did it cost", not "would you buy";
- do not pitch in the first 10 minutes; talk less; write verbatim;
- look for the **trigger**, the **workaround**, the **budget**, **who decides**;
- commitments beat compliments: time, money, introduction to a colleague, access to data;
- one segment per series; 10-15 interviews is a rule of thumb - stop earlier if a pattern repeats;
- also interview those who chose a competitor or did nothing; friends and relatives do not count.

Question bank (adapt):

| Good (facts) | Bad (opinions) |
|---|---|
| "Tell me about the last time you had to do X" | "Would you use a tool that does X?" |
| "What did you try? What did it cost?" | "How much would you pay?" |
| "Who else was involved? Who approved it?" | "Do you think this is a good idea?" |
| "What is the hardest part?" | "Is this a big problem for you?" |
| "Why did you stop using Y?" | "Would you switch if we were cheaper?" |

Three kinds of conversation: problem (the pain), management (process and budget), UX (how they work now). CustDev cycle in eight steps: hypothesis -> target audience -> respondents -> interview -> analysis -> adjustment -> prototype -> decision. Segment respondents by value to you (ABCDX).

### Forces of progress (JTBD)
A switch happens when **push** (current pain) + **pull** (promise of the new) beat **anxiety** (it may not work) + **habit** (how we do it now). Record the four forces per interview; most failures are anxiety and habit, not product quality.

### Switch interview (a JTBD technique)
Sources: jobstobedone.org (Moesta, Spiek) and Moesta's 2024 talk; the numbers are practitioner guidance.
- **Who:** people who **recently switched** from one solution to another (about the last 30-90 days), plus some who considered switching and did not. With no customers yet (our adaptation), interview people who switched *anything* for this job (a competitor, a workaround, a hire). Find the person who first raised the idea, not only the signer. Prospects who never switched give opinions, not stories.
- **Timeline** (purchase journey): first thought -> passive looking -> active looking -> deciding -> first use -> ongoing use. Anchor the story at the first thought, often weeks or months before the purchase, and walk it event by event ("and then what happened?").
- Forces emerge from the events; do not ask about them directly. Record the customer's own words.
- 45-90 minutes; in pairs if possible (one asks, one listens for forces). Patterns often show after 5-8 interviews for one job (switch-interview page); the talk suggests about 7-12 interviews in total.
- Do not turn the stage names into a questionnaire; mapping forces onto stages is one vendor's interpretation, not Moesta's.

### Interview note (template: `assets/templates/interview-note.md`)
who / context · trigger · what they did before · verbatim quotes · price and budget · commitments given · four forces · one-line conclusion.

### Synthesis
- A pattern repeats in at least 3 of 10 (rule of thumb); single quotes are not a pattern.
- A verdict per assumption: confirmed / refuted / open, with the number of interviews.
- Gate: no trigger and no budget anywhere -> Recycle (other segment) or Kill; trigger exists but no budget -> Hold and find the payer. Respondents' words contradict the job statement from S -> Recycle to S (`idea-shaping.md`, Loops).

## Stage 2. Opportunity

Pick **one** outcome (a measurable result for the customer, not a product feature) and one persona. "We could also..." goes into the log, not into work. For the riskiest assumption choose the cheapest experiment (`experiments.md`) and set the success threshold in advance.

**Opportunity map** (Torres, Product Talk page on the opportunity solution tree; book: *Continuous Discovery Habits*): root = one product outcome (customer behaviour or sentiment, not a broad business metric); below it the opportunities (needs, pains, desires) built from **interview stories**, not from assumptions; solutions only for the one target opportunity, compare at least three; then test the riskiest assumptions of each. Start mapping after 3-4 stories, refresh every 3-4 interviews, revisit the structure if it is still messy after 6-8. Assess opportunities by sizing, market position, company fit and customer factors (importance and satisfaction with what exists). Do not build the tree from sales or support data alone (it lacks context). Candidates from stage S are not opportunities until interviews support them.

## Definitions

- **Segment** = a group with the same pain and context. **ICP** (ideal customer profile) = the precise description of the segment you sell to first: role, company size, trigger, budget owner, channel. **Persona** = one representative person of the ICP used to design the product.
- **Job statement** (JTBD; a "job story": Intercom 2016, format named by Klement): "When [situation], I want to [motivation], so I can [expected outcome]." Write it without naming the product (`value-proposition.md`). Collect 3-5 from interviews; wording must come from the respondent.

## Finding respondents

Own network only for warm introductions to the target role; then: industry chats and communities, LinkedIn/Telegram outreach with a short "research, not selling" message, referrals from each interview ("who else lives with this?"), user groups of the incumbent product, conferences. Offer something small (summary of findings). Aim for 10 slots in two weeks; no friends or relatives.

## Team (investors ask it early)
Who is who; how the project started; why this team; what experience is relevant. Keep a single paragraph and evidence (shipped products, domain years). Detail for rounds: `fundraising-pack`.
