# Underwrite

Startup due diligence that is allowed to say "don't build this".

A founder describes an idea. Underwrite interviews them, researches the market on the live web, and returns a verdict in which every number shows where it came from, then a system design, a clickable prototype and legal first steps. Funds and studios use the same engine to screen a batch of applications against their thesis.

Built on Meta's models for the Meta Global AI Developer Hackathon.

## Why it is different

Most idea validators return confident numbers that nobody can check. In Underwrite the model does not get the last word; plain code does:

- **Facts are earned.** A claim stays a `fact` only if its source is a URL the search really returned. Anything else is demoted to `assumption`, and the report says how many were demoted.
- **Markets are multiplied, not quoted.** The model supplies customers, price, reach and win rate. Code computes TAM, SAM and SOM, so every step is visible and can be challenged.
- **Scores are not probabilities.** Readiness and viability are fixed weights over rated investor criteria. A rating of `strong` on market or competition needs surviving verified evidence.
- **No evidence, no "go".** A verdict of `go` with no evidence about the problem becomes `hold`, whatever the model said.

Web pages and uploaded PDFs are untrusted data. An application that tells the model to rate itself highly is treated as text to report, not an instruction to follow.

## What you get

| Step | Output | Models |
| --- | --- | --- |
| Interview | One question at a time on the founder, problem, product and improvements, by text or voice | Muse Spark, Muse Voice Transcribe |
| Concept | One-liner, job to be done, pains, gains, features, reframings, first test | Muse Spark |
| Research | Competitors, pricing, revenue, funding, bottom-up market, gaps | Muse Spark with web search |
| Report | Go, hold, recycle or kill, 12 investor criteria, risks, next tests, full document | Muse Spark |
| System | Business logic, entities, APIs, stack, diagrams, build order | Muse Spark |
| Prototype | A self-contained clickable app in a locked-down sandbox that repairs its own runtime errors once | Muse Spark, Muse Image |
| Legal | Entity steps with cost and source, a founder split calculator. Not legal advice | Muse Spark with web search |
| Funds | Thesis, batch of PDFs or text, ranked table, red flags, questions for the founder | Muse Spark with web search, PDF input |

Prompts run in standard mode, never the contributor tier, because founders' ideas are confidential.

## Run it

Requires Node 22 or later and a key from [dev.meta.ai](https://dev.meta.ai).

```bash
npm install
cp .dev.vars.example .dev.vars   # add MODEL_API_KEY
npx wrangler d1 migrations apply underwrite --local
npm run dev
```

No key? Run the whole app against a local stand-in for the API: set `MODEL_API_KEY=fake` and `MUSE_BASE_URL=http://localhost:8799/v1` in `.dev.vars`, then start `npm run fake-muse` alongside `npm run dev`.

```bash
npm test
```

## Architecture

```
web/            React app (landing, interview, report, prototype, funds)
worker/         Cloudflare Worker: routes, limits, D1 storage, NDJSON streaming
worker/ai/      Prompts, stages and provenance.ts (the rules the model cannot override)
shared/         The contract between all three, as zod schemas
tests/          Unit and API tests, plus a fake Muse server
```

Search and structured output are two separate calls: the first returns text and its sources, the second extracts strict JSON. Provenance is then checked against what the search actually returned.

Paid routes have per-IP and global daily limits. Run links are unguessable and there are no accounts, so anyone with a link can open that run.

## License

MIT
