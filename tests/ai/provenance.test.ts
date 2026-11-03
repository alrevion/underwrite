import { describe, expect, it } from "vitest";
import type { Claim } from "../../shared/contract";
import { enforce, marketMath, normUrl, readiness, verdictGuard, viability } from "../../worker/ai/provenance";

const claim = (o: Partial<Claim>): Claim => ({ text: "x", label: "fact", sources: [], howToTest: "", ...o });
const known = ["https://Example.com/a/?utm_source=x", "https://b.org/page"];

describe("normUrl", () => {
  it("ignores host case, trailing slash, utm and fragment", () => {
    expect(normUrl("https://EXAMPLE.com/a/?utm_medium=y#top")).toBe(normUrl("https://example.com/a"));
    expect(normUrl("https://a.com/p?id=1")).not.toBe(normUrl("https://a.com/p?id=2"));
  });
});

describe("enforce", () => {
  it("keeps a fact whose sources were returned", () => {
    const r = enforce(claim({ sources: ["https://example.com/a"] }), known);
    expect(r.downgraded).toBe(false);
    expect(r.claim.label).toBe("fact");
  });
  it("demotes a fact with no sources", () => {
    const r = enforce(claim({}), known);
    expect(r.downgraded).toBe(true);
    expect(r.claim.label).toBe("assumption");
    expect(r.claim.howToTest).not.toBe("");
  });
  it("demotes a fact with a hallucinated url and drops that url", () => {
    const r = enforce(claim({ sources: ["https://b.org/page", "https://fake.io/x"] }), known);
    expect(r.downgraded).toBe(true);
    expect(r.claim.label).toBe("assumption");
    expect(r.claim.sources).toEqual(["https://b.org/page"]);
  });
  it("drops unknown urls from an estimate without demoting it", () => {
    const r = enforce(claim({ label: "estimate", sources: ["https://fake.io"] }), known);
    expect(r.downgraded).toBe(false);
    expect(r.claim.label).toBe("estimate");
    expect(r.claim.sources).toEqual([]);
  });
});

describe("marketMath", () => {
  it("multiplies and clamps shares", () => {
    expect(marketMath({ customers: 1000, annualPriceUsd: 100, reachableShare: 0.5, winRate: 0.1 }))
      .toEqual({ tamUsd: 100000, samUsd: 50000, somUsd: 5000 });
    expect(marketMath({ customers: 10, annualPriceUsd: 10, reachableShare: 3, winRate: -1 }).somUsd).toBe(0);
  });
  it("rejects non-finite or negative inputs", () => {
    expect(() => marketMath({ customers: NaN, annualPriceUsd: 1, reachableShare: 1, winRate: 1 })).toThrow();
    expect(() => marketMath({ customers: 1, annualPriceUsd: Infinity, reachableShare: 1, winRate: 1 })).toThrow();
    expect(() => marketMath({ customers: -1, annualPriceUsd: 1, reachableShare: 1, winRate: 1 })).toThrow();
    expect(() => marketMath({ customers: 1, annualPriceUsd: 1, reachableShare: NaN, winRate: 1 })).toThrow();
  });
});

const ids = ["problem", "product", "market", "competition", "business_model", "traction", "team", "strategy", "financials", "valuation", "exit", "deal_structure"];
const all = (rating: "strong" | "weak" | "missing") => ids.map((id) => ({ id, rating }));

describe("readiness / viability", () => {
  it("is 100 / 40 / 0 for all strong / weak / missing", () => {
    expect(readiness(all("strong"))).toBe(100);
    expect(readiness(all("weak"))).toBe(40);
    expect(readiness(all("missing"))).toBe(0);
    expect(viability(all("strong"))).toBe(100);
    expect(viability([])).toBe(0);
  });
  it("weights problem more than exit", () => {
    const only = (id: string) => readiness([{ id, rating: "strong" }]);
    expect(only("problem")).toBe(15);
    expect(only("exit")).toBe(4);
  });
  it("viability ignores criteria outside its four", () => {
    expect(viability([{ id: "team", rating: "strong" }])).toBe(0);
    expect(viability([{ id: "market", rating: "strong" }])).toBe(30);
  });
});

describe("verdictGuard", () => {
  it("turns go into hold when the problem is missing or unrated", () => {
    expect(verdictGuard("go", [{ id: "problem", rating: "missing" }])).toBe("hold");
    expect(verdictGuard("go", [])).toBe("hold");
  });
  it("leaves other verdicts alone", () => {
    expect(verdictGuard("go", [{ id: "problem", rating: "weak" }])).toBe("go");
    expect(verdictGuard("kill", [{ id: "problem", rating: "missing" }])).toBe("kill");
  });
});
