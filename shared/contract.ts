// The contract between pipeline, API and web. Change it only with all three in mind.
import { z } from "zod";

// Every claim in a report is one of these. Code, not the model, decides "fact":
// a claim stays a fact only if its sources are URLs the search really returned (worker/ai/provenance.ts).
export const Label = z.enum(["fact", "estimate", "assumption"]);
export const Claim = z.object({
  text: z.string(),
  label: Label,
  sources: z.array(z.string()), // URLs
  howToTest: z.string(), // for an assumption: the cheapest test; otherwise ""
});
export type Claim = z.infer<typeof Claim>;

export const InterviewTurn = z.object({
  phase: z.enum(["founder", "problem", "product", "improvements"]),
  message: z.string(), // exactly one question, in the founder's language
  suggestions: z.array(z.string()), // 0-4 tap-to-answer options
  done: z.boolean(),
});
export type InterviewTurn = z.infer<typeof InterviewTurn>;

export const Concept = z.object({
  name: z.string(),
  oneLiner: z.string(), // "[First user], in [situation], gets [outcome] by [what we do]."
  firstUser: z.string(),
  job: z.string(), // "When..., I want to..., so I can..." without naming the product
  pains: z.array(z.string()),
  gains: z.array(z.string()),
  features: z.array(z.object({ name: z.string(), why: z.string() })),
  improvements: z.array(z.object({ name: z.string(), why: z.string(), reframing: z.boolean() })),
  outOfScope: z.array(z.string()),
  usp: z.string(),
  businessModel: z.string(),
  firstTest: z.string(),
});
export type Concept = z.infer<typeof Concept>;

export const Competitor = z.object({
  name: z.string(),
  kind: z.enum(["direct", "indirect", "status_quo"]),
  url: z.string(),
  whoItServes: z.string(),
  pricing: Claim,
  revenue: Claim, // label assumption with text "Not found" when unknown; never guess
  funding: Claim,
  strength: z.string(),
  gap: z.string(),
});
export type Competitor = z.infer<typeof Competitor>;

// Bottom-up only. The model supplies the inputs, code multiplies.
export const MarketInputs = z.object({
  customerType: z.string(),
  region: z.string(),
  customers: z.number(),
  customersClaim: Claim,
  reachableShare: z.number(), // 0..1
  winRate: z.number(), // 0..1
  annualPriceUsd: z.number(),
  priceClaim: Claim,
  drivers: z.array(Claim),
});
export type MarketInputs = z.infer<typeof MarketInputs>;
export type Market = MarketInputs & { tamUsd: number; samUsd: number; somUsd: number };

export const Research = z.object({
  competitors: z.array(Competitor),
  market: MarketInputs,
  positioning: z.string(),
  gaps: z.array(z.string()), // things no alternative does: refined improvements
});
export type ResearchModel = z.infer<typeof Research>;
export type ResearchResult = Omit<ResearchModel, "market"> & {
  market: Market;
  sources: { url: string; title: string }[];
  downgraded: number; // facts demoted because their source was not in the search results
};

// Twelve investor criteria. Readiness is computed from these by code: it is not a probability.
export const CRITERIA = [
  "problem", "product", "market", "competition", "business_model", "traction",
  "team", "strategy", "financials", "valuation", "exit", "deal_structure",
] as const;
export const Report = z.object({
  verdict: z.enum(["go", "hold", "recycle", "kill"]),
  verdictWhy: z.string(),
  headline: z.string(), // the one sentence a founder must hear, even if unpleasant
  criteria: z.array(z.object({
    id: z.enum(CRITERIA),
    rating: z.enum(["strong", "weak", "missing"]),
    evidence: z.string(),
    nextStep: z.string(),
  })),
  risks: z.array(z.object({ risk: z.string(), critical: z.boolean(), test: z.string() })),
  nextTests: z.array(z.object({ test: z.string(), passIf: z.string(), costUsd: z.number(), days: z.number() })),
  fullDocument: z.string(), // Markdown, cites sources as links
});
export type ReportModel = z.infer<typeof Report>;
export type ReportResult = ReportModel & { readiness: number; viability: number };

export const SystemDesign = z.object({
  overview: z.string(),
  businessLogic: z.array(z.object({ rule: z.string(), why: z.string() })),
  entities: z.array(z.object({ name: z.string(), fields: z.array(z.string()) })),
  apis: z.array(z.object({ route: z.string(), purpose: z.string() })),
  stack: z.array(z.object({ part: z.string(), choice: z.string(), why: z.string() })),
  diagrams: z.array(z.object({ title: z.string(), mermaid: z.string() })), // flowchart, sequenceDiagram or erDiagram
  buildOrder: z.array(z.string()),
});
export type SystemDesign = z.infer<typeof SystemDesign>;

export type Prototype = { html: string; screens: string[]; repaired: boolean };

export const Legal = z.object({
  jurisdictionAdvice: z.string(),
  entitySteps: z.array(z.object({ step: z.string(), costUsd: z.number(), days: z.number(), source: z.string() })),
  equityAdvice: z.string(),
  mustHaveDocs: z.array(z.string()),
  pitfalls: z.array(z.string()),
});
export type Legal = z.infer<typeof Legal>;

export type Stage = "concept" | "research" | "report" | "system" | "prototype" | "legal";

export type Run = {
  id: string;
  createdAt: number;
  idea: string;
  lang: string;
  transcript: { role: "founder" | "interviewer"; text: string }[];
  interview?: InterviewTurn;
  concept?: Concept;
  research?: ResearchResult;
  report?: ReportResult;
  system?: SystemDesign;
  prototype?: Prototype;
  legal?: Legal & { country: string };
};

// B2B: one application screened against a fund's or studio's thesis.
export const Screening = z.object({
  company: z.string(),
  summary: z.string(),
  thesisFit: z.enum(["fit", "partial", "out"]),
  thesisWhy: z.string(),
  verdict: Report.shape.verdict,
  criteria: Report.shape.criteria,
  redFlags: z.array(Claim), // claims in the application that the search contradicts or cannot confirm
  questionsForFounder: z.array(z.string()),
  hasPrototype: z.boolean(),
});
export type ScreeningModel = z.infer<typeof Screening>;
export type ScreeningResult = ScreeningModel & {
  id: string;
  readiness: number;
  market: Market;
  competitors: Competitor[];
  sources: { url: string; title: string }[];
  prototype?: Prototype; // generated when the application has none
};
export type Batch = { id: string; createdAt: number; thesis: string; items: ScreeningResult[] };

// Long stages stream NDJSON so the connection never idles.
export type StageEvent =
  | { type: "progress"; step: string }
  | { type: "done"; run: Run }
  | { type: "error"; message: string };
export type ScreenEvent =
  | { type: "progress"; step: string }
  | { type: "done"; batch: Batch }
  | { type: "error"; message: string };

/*
HTTP API (all JSON unless noted; a run id is an unguessable capability, there are no accounts):
POST /api/runs {idea, lang?}                 -> Run with first interview turn. 429 over DAILY_RUN_LIMIT per IP per day.
GET  /api/runs/:id                           -> Run
POST /api/runs/:id/interview {answer}        -> Run
POST /api/runs/:id/stages/:stage {country?}  -> NDJSON StageEvent stream. country only for legal.
POST /api/transcribe (body: audio, Content-Type audio/*) -> {text}
POST /api/batches {thesis}                   -> Batch
GET  /api/batches/:id                        -> Batch
POST /api/batches/:id/screen {name, text?, pdfBase64?} -> NDJSON ScreenEvent stream. PDF is not stored.
*/
