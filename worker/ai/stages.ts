import {
  Concept, Legal, Report, Research, SystemDesign,
  type Claim, type Competitor, type Run, type ResearchResult, type ReportResult, type Market,
} from "../../shared/contract";
import { createMuse, type AiEnv, type Muse, type Progress, type Source } from "./muse";
import * as P from "./prompts";
import { fence } from "./prompts";
import { capByEvidence, enforce, marketMath, normUrl, readiness, stripUnverifiedLinks, verdictGuard, viability } from "./provenance";

const none: Progress = () => {};
const J = (x: unknown) => JSON.stringify(x);

export function runContext(run: Run): string {
  const talk = run.transcript.map((t) => `${t.role}: ${t.text}`).join("\n");
  return `${fence(`Idea: ${run.idea}\n${talk}`)}${run.concept ? `\nConcept: ${fence(J(run.concept))}` : ""}`;
}

export async function concept(run: Run, env: AiEnv, onProgress: Progress = none, muse: Muse = createMuse(env)) {
  onProgress("Shaping the concept");
  return muse.json("concept", Concept, `${P.CONCEPT}\n${P.langLine(run.lang)}`, runContext(run), "medium");
}

function dedupe(sources: Source[]): Source[] {
  return [...new Map(sources.map((s) => [s.url, s])).values()];
}

// Shared by research() and screen(): three narrow searches, one strict extraction, provenance enforced in code.
export async function researchCore(ctx: string, lang: string, muse: Muse, onProgress: Progress): Promise<ResearchResult> {
  onProgress("Searching: alternatives and competitors");
  const alt = muse.searchText(P.SEARCH_ALTERNATIVES(ctx));
  const market = muse.searchText(P.SEARCH_MARKET(ctx));
  const altRes = await alt;
  const names = [...altRes.text.matchAll(/\*\*([^*\n]{2,40})\*\*/g)].slice(0, 5).map((m) => m[1]).join(", ");
  onProgress("Searching: funding, revenue and market data");
  const [money, mkt] = await Promise.all([muse.searchText(P.SEARCH_MONEY(ctx, fence(names))), market]);

  const found = [altRes, money, mkt];
  const sources = dedupe(found.flatMap((r) => r.sources));
  onProgress("Structuring the evidence");
  const evidence = found.map((r, i) => `--- search ${i + 1} ---\n${r.text}`).join("\n");
  const user = `${P.langLine(lang)}
Idea context:\n${ctx}
Allowed source URLs:\n${fence(sources.map((s) => `${s.url} (${s.title})`).join("\n") || "(none)")}
Search findings:\n${fence(evidence)}`;
  const m = await muse.json("research", Research, P.EXTRACT_RESEARCH, user, "medium");

  const known = sources.map((s) => s.url);
  let downgraded = 0;
  const fix = (c: Claim): Claim => {
    const r = enforce(c, known);
    if (r.downgraded) downgraded++;
    return r.claim;
  };
  const competitors: Competitor[] = m.competitors.map((c) => ({ ...c, pricing: fix(c.pricing), revenue: fix(c.revenue), funding: fix(c.funding) }));
  const inputs = { ...m.market, customersClaim: fix(m.market.customersClaim), priceClaim: fix(m.market.priceClaim), drivers: m.market.drivers.map(fix) };
  const mm = marketMath(inputs);
  const mk: Market = { ...inputs, reachableShare: Math.min(1, Math.max(0, inputs.reachableShare)), winRate: Math.min(1, Math.max(0, inputs.winRate)), ...mm };
  return { competitors, market: mk, positioning: m.positioning, gaps: m.gaps, sources, downgraded };
}

export function research(run: Run, env: AiEnv, onProgress: Progress = none, muse: Muse = createMuse(env)) {
  return researchCore(runContext(run), run.lang, muse, onProgress);
}

const LEGEND = `\n\n---\n**Labels.** **fact**: a cited source states it. **estimate**: derived from facts by stated arithmetic. **assumption**: not yet evidenced; it comes with the cheapest test. Readiness is a completeness score of the evidence, not a probability of success.`;

export async function report(run: Run, env: AiEnv, onProgress: Progress = none, muse: Muse = createMuse(env)): Promise<ReportResult> {
  onProgress("Writing the verdict");
  const r = run.research;
  const user = `${P.langLine(run.lang)}\n${runContext(run)}\nResearch data (the only URLs you may cite are in sources): ${fence(J(r ?? "none"))}`;
  const m = await muse.json("report", Report, P.REPORT, user, "high");
  const sources = (r?.sources ?? []).map((s) => `- [${s.title.replace(/[\[\]]/g, "")}](${s.url})`).join("\n");
  const criteria = capByEvidence(m.criteria, r);
  return {
    ...m,
    criteria,
    verdict: verdictGuard(m.verdict, criteria),
    fullDocument: stripUnverifiedLinks(m.fullDocument, (r?.sources ?? []).map((x) => x.url)) + LEGEND + (sources ? `\n\n## Sources\n${sources}` : ""),
    readiness: readiness(criteria),
    viability: viability(criteria),
  };
}

export async function system(run: Run, env: AiEnv, onProgress: Progress = none, muse: Muse = createMuse(env)) {
  onProgress("Designing the system");
  const s = await muse.json("system_design", SystemDesign, `${P.SYSTEM}\n${P.langLine(run.lang)}`, runContext(run), "medium");
  return { ...s, diagrams: s.diagrams.filter((d) => d.mermaid.trim()).map((d) => ({ ...d, mermaid: d.mermaid.replace(/^```(?:mermaid)?\s*|\s*```$/g, "").trim() })) };
}

export async function legal(run: Run, country: string, env: AiEnv, onProgress: Progress = none, muse: Muse = createMuse(env)) {
  onProgress(`Searching company setup rules: ${country}`);
  const s = await muse.searchText(`Search the web now. For a two-founder software startup in ${country}: official steps, cost and time to register a company, which legal form founders usually choose, taxes at registration, and what is normally agreed between co-founders (equity split, vesting). Prefer government and law-firm sources. Cite them. Say "Not found" when unsure.`);
  const urls = s.sources.map((x) => x.url);
  onProgress("Structuring legal guidance");
  const user = `${P.langLine(run.lang)}\nCountry: ${country}\n${runContext(run)}\nAllowed source URLs:\n${fence(urls.join("\n") || "(none)")}\nFindings:\n${fence(s.text)}`;
  const l = await muse.json("legal", Legal, P.LEGAL, user, "medium");
  const known = new Set(urls.map(normUrl));
  const ok = (u: string) => !u || known.has(normUrl(u));
  return { ...l, entitySteps: l.entitySteps.map((e) => ({ ...e, source: ok(e.source) ? e.source : "" })), country };
}
