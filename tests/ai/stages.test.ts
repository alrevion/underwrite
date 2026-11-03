import { describe, expect, it, vi } from "vitest";
import type { Muse } from "../../worker/ai/muse";
import { prototype, repairPrototype, sanitize } from "../../worker/ai/prototype";
import { nextTurn, report, research } from "../../worker/ai/index";
import { MAX_ANSWERS } from "../../worker/ai/interview";
import { Report, type Run } from "../../shared/contract";

const env = { MODEL_API_KEY: "k", MUSE_BASE_URL: "http://x", MUSE_MODEL: "m", MUSE_IMAGE_MODEL: "i" };
const run: Run = { id: "r", createdAt: 0, idea: "idea", lang: "en", transcript: [] };
const cl = (o: object = {}) => ({ text: "t", label: "fact", sources: [], howToTest: "", ...o });

function stub(over: Partial<Muse>): Muse {
  return {
    searchText: async () => ({ text: "**Acme** does things", sources: [{ url: "https://acme.com/", title: "Acme" }] }),
    json: async () => { throw new Error("unstubbed"); },
    text: async () => "",
    image: async () => null,
    transcribe: async () => "",
    ...over,
  };
}

describe("research", () => {
  it("runs 3 searches, enforces provenance, computes market in code", async () => {
    const searchText = vi.fn(async () => ({ text: "**Acme** x", sources: [{ url: "https://acme.com/", title: "Acme" }] }));
    const json = vi.fn(async (_n: string, schema: any) => schema.parse({
      competitors: [{ name: "Acme", kind: "direct", url: "https://acme.com", whoItServes: "s",
        pricing: cl({ sources: ["https://acme.com"] }), revenue: cl({ text: "$9M", sources: ["https://invented.com/r"] }), funding: cl({ label: "assumption", text: "Not found" }),
        strength: "a", gap: "b" }],
      market: { customerType: "c", region: "r", customers: 1000, customersClaim: cl(), reachableShare: 2, winRate: 0.1, annualPriceUsd: 100, priceClaim: cl({ sources: ["https://acme.com/"] }), drivers: [] },
      positioning: "p", gaps: ["g"],
    }));
    const res = await research(run, env, () => {}, stub({ searchText, json: json as any }));
    expect(searchText).toHaveBeenCalledTimes(3);
    expect(res.competitors[0]!.revenue.label).toBe("assumption"); // hallucinated url
    expect(res.competitors[0]!.pricing.label).toBe("fact");
    expect(res.downgraded).toBe(2); // revenue + customersClaim (no sources)
    expect(res.market.reachableShare).toBe(1);
    expect(res.market.tamUsd).toBe(100000);
    expect(res.market.somUsd).toBe(10000);
  });
});

describe("report", () => {
  const rep = (verdict: string, problem: string) => ({
    verdict, verdictWhy: "w", headline: "h", risks: [], nextTests: [], fullDocument: "# Doc [A](https://a.com)",
    criteria: [{ id: "problem", rating: problem, evidence: "e", nextStep: "n" }],
  });
  it("guards go without problem evidence, appends legend and sources, computes scores", async () => {
    const json = async (_n: string, s: any) => s.parse(rep("go", "missing"));
    const r = await report({ ...run, research: { sources: [{ url: "https://a.com", title: "A" }] } as any }, env, () => {}, stub({ json: json as any }));
    expect(r.verdict).toBe("hold");
    expect(r.fullDocument).toMatch(/\*\*Labels\.\*\*/);
    expect(r.fullDocument).toMatch(/## Sources\n- \[A\]\(https:\/\/a.com\)/);
    expect(r.readiness).toBe(0);
    expect(Report.shape.verdict.options).toContain("kill");
  });
  it("lets kill through", async () => {
    const json = async (_n: string, s: any) => s.parse(rep("kill", "weak"));
    expect((await report(run, env, () => {}, stub({ json: json as any }))).verdict).toBe("kill");
  });
});

describe("nextTurn", () => {
  const reply = (score: number) => {
    const d = { score, why: "w" };
    return { clarity: { problem: d, customer: d, product: d, money: d, founder: d }, message: "question", closing: "bye", suggestions: ["a", "b", "c", "d", "e"] };
  };
  const answers = (n: number) => Array.from({ length: n }, () => ({ role: "founder" as const, text: "a" }));
  const turn = (score: number, n: number, interview?: any) =>
    nextTurn({ ...run, transcript: answers(n), interview }, env, stub({ json: (async (_n: string, s: any) => s.parse(reply(score))) as any }));

  it("keeps asking under the gate", async () => {
    const t = await turn(79, 5);
    expect([t.done, t.overall, t.message]).toEqual([false, 79, "question"]);
    expect(t.suggestions).toHaveLength(4);
  });
  it("opens the gate at 80 and closes instead of asking", async () => {
    const t = await turn(80, 5);
    expect([t.done, t.message, t.suggestions]).toEqual([true, "bye", []]);
  });
  it("needs at least two answers even for a detailed first message", async () => {
    expect((await turn(95, 1)).done).toBe(false);
    expect((await turn(95, 2)).done).toBe(true);
  });
  it("ends at the question limit whatever the clarity", async () => {
    expect((await turn(10, MAX_ANSWERS)).done).toBe(true);
  });
  it("only lets clarity rise", async () => {
    const before = await turn(60, 3);
    const t = await turn(20, 4, before);
    expect(t.overall).toBeGreaterThanOrEqual(60);
  });
});

describe("sanitize", () => {
  const doc = "<!doctype html><html><head><title>t</title></head><body>hi</body></html>";
  it("injects CSP and reporter first in head and strips fences", () => {
    const out = sanitize("```html\n" + doc + "\n```");
    expect(out).not.toContain("```");
    expect(out).toMatch(/<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:">/);
    expect(out).toContain("proto-error");
  });
  it("is idempotent and replaces a model-written CSP", () => {
    const once = sanitize(doc.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="default-src *">`));
    expect(once.match(/Content-Security-Policy/g)).toHaveLength(1);
    expect(sanitize(once)).toBe(once);
  });
  it("rejects output without closing </html>", () => {
    expect(() => sanitize("<html><body>cut off")).toThrow();
  });
});

describe("prototype", () => {
  const doc = '<!doctype html><html><head></head><body><section data-screen="Home"><img src="{{HERO_IMAGE}}"></section><section data-screen="Cart"></section></body></html>';
  it("retries once on truncated html, inlines hero image, lists screens", async () => {
    const text = vi.fn().mockResolvedValueOnce("<html><body>cut").mockResolvedValueOnce(doc);
    const p = await prototype(run, env, () => {}, stub({ text, image: async () => "data:image/webp;base64,AAA" }));
    expect(text).toHaveBeenCalledTimes(2);
    expect(p.html).toContain("data:image/webp;base64,AAA");
    expect(p.html).not.toContain("{{HERO_IMAGE}}");
    expect(p.screens).toEqual(["Home", "Cart"]);
  });
  it("survives image failure", async () => {
    const p = await prototype(run, env, () => {}, stub({ text: async () => doc, image: async () => null }));
    expect(p.html).not.toContain("{{HERO_IMAGE}}");
  });
  it("repair marks repaired and sanitizes", async () => {
    const p = await repairPrototype(doc, "boom", env, stub({ text: async () => doc }));
    expect(p.repaired).toBe(true);
    expect(p.html).toContain("Content-Security-Policy");
  });
});

describe("research when searches fail", () => {
  const sr = (fail: (p: string) => boolean) => async (p: string) => {
    if (fail(p)) throw new Error("timeout");
    return { text: "found", sources: [] };
  };
  const reached = async () => { throw new Error("reached extraction"); };
  it("goes on with the searches that worked", async () => {
    let n = 0;
    await expect(research(run, env, () => {}, stub({ searchText: sr(() => n++ === 0), json: reached as any }))).rejects.toThrow("reached extraction");
  });
  it("fails only when every search failed", async () => {
    await expect(research(run, env, () => {}, stub({ searchText: sr(() => true), json: reached as any }))).rejects.toThrow("All web searches failed");
  });
});
