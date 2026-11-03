// Code, not the model, decides what counts as a fact. Pure functions: no I/O.
import { CRITERIA, type Claim, type Market, type MarketInputs, type ReportModel } from "../../shared/contract";

// Lowercase host, drop fragment, utm_* and trailing slash, so equal pages compare equal.
export function normUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) if (/^utm_/i.test(k)) u.searchParams.delete(k);
    const path = u.pathname.replace(/\/+$/, "");
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`;
  } catch { return raw.trim(); }
}

// A fact needs >=1 source and every source must be a URL the search really returned.
export function enforce(claim: Claim, knownUrls: Iterable<string>): { claim: Claim; downgraded: boolean } {
  const known = new Map<string, string>();
  for (const u of knownUrls) known.set(normUrl(u), u);
  const kept = claim.sources.filter((s) => known.has(normUrl(s))).map((s) => known.get(normUrl(s))!);
  const bad = kept.length !== claim.sources.length;
  if (claim.label === "fact" && (kept.length === 0 || bad)) {
    return {
      claim: { ...claim, label: "assumption", sources: kept, howToTest: claim.howToTest || "Find a primary source that confirms this." },
      downgraded: true,
    };
  }
  return { claim: { ...claim, sources: kept }, downgraded: false };
}

const share = (x: number) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : NaN);
export function marketMath(i: Pick<MarketInputs, "customers" | "reachableShare" | "winRate" | "annualPriceUsd">) {
  const { customers, annualPriceUsd } = i;
  const reach = share(i.reachableShare), win = share(i.winRate);
  if (![customers, annualPriceUsd, reach, win].every(Number.isFinite) || customers < 0 || annualPriceUsd < 0) {
    throw new Error("Market inputs must be finite non-negative numbers");
  }
  const tamUsd = customers * annualPriceUsd, samUsd = tamUsd * reach;
  return { tamUsd, samUsd, somUsd: samUsd * win } satisfies Pick<Market, "tamUsd" | "samUsd" | "somUsd">;
}

type Rated = { id: string; rating: "strong" | "weak" | "missing" }[];
const SCORE = { strong: 1, weak: 0.4, missing: 0 } as const;

// Weights sum to 100. Problem, market, business model and team count most.
export const READINESS_WEIGHTS: Record<(typeof CRITERIA)[number], number> = {
  problem: 15, market: 15, business_model: 12, team: 12,
  product: 8, competition: 8, traction: 8,
  strategy: 5, financials: 5, valuation: 4, exit: 4, deal_structure: 4,
};
export const VIABILITY_WEIGHTS = { problem: 30, market: 30, competition: 20, business_model: 20 } as const;

function weighted(criteria: Rated, weights: Record<string, number>): number {
  const rating = new Map(criteria.map((c) => [c.id, c.rating]));
  let sum = 0;
  for (const [id, w] of Object.entries(weights)) sum += w * SCORE[rating.get(id) ?? "missing"];
  return Math.round(sum); // 0..100 integer. A completeness score of the evidence, NOT a probability of success.
}
export const readiness = (criteria: Rated) => weighted(criteria, READINESS_WEIGHTS);
export const viability = (criteria: Rated) => weighted(criteria, VIABILITY_WEIGHTS);

// No evidence about the problem means no "go".
export function verdictGuard(verdict: ReportModel["verdict"], criteria: Rated): ReportModel["verdict"] {
  const problem = criteria.find((c) => c.id === "problem")?.rating ?? "missing";
  return verdict === "go" && problem === "missing" ? "hold" : verdict;
}

type Cr = { id: string; rating: "strong" | "weak" | "missing" };
type Evid = { competitors: { pricing: Claim; revenue: Claim; funding: Claim }[]; market: { customersClaim: Claim; priceClaim: Claim } };
const isFact = (c?: Claim) => !!c && c.label === "fact" && c.sources.length > 0;

// "strong" for market / competition needs at least one verified fact behind it; otherwise it is only "weak".
export function capByEvidence<T extends Cr>(criteria: T[], research?: Evid): T[] {
  const marketOk = !!research && ((isFact(research.market?.customersClaim) || isFact(research.market?.priceClaim)));
  const compOk = !!research && (research.competitors ?? []).some((c) => isFact(c.pricing) || isFact(c.revenue) || isFact(c.funding));
  return criteria.map((c) =>
    c.rating === "strong" && ((c.id === "market" && !marketOk) || (c.id === "competition" && !compOk)) ? { ...c, rating: "weak" } : c);
}

// Markdown links to URLs the search never returned become plain text.
export function stripUnverifiedLinks(md: string, sources: string[]): string {
  const ok = new Set(sources.map(normUrl));
  return md.replace(/!?\[([^\]]*)\]\(\s*<?([^)\s>]+)>?[^)]*\)/g, (all, text, url) => (ok.has(normUrl(url)) ? all : text));
}
