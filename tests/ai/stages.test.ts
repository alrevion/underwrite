import { describe, expect, it, vi } from "vitest";
import type { Muse } from "../../worker/ai/muse";
import { prototype, repairPrototype, sanitize } from "../../worker/ai/prototype";
import { nextTurn, report, research } from "../../worker/ai/index";
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
    verdict, verdictWhy: "w", headline: "h", risks: [], nextTests: [], fullDocument: "# Doc",
    criteria: [{ id: "problem", rating: problem, evidence: "e", nextStep: "n" }],
  });
  it("guards go without problem evidence, appends legend and sources, computes scores", async () => {
    const json = async (_n: string, s: any) => s.parse(rep("go", "missing"));
    const r = await report({ ...run, research: { sources: [{ url: "https://a.com", title: "A" }] } as any }, env, () => {}, stub({ json: json as any }));
    expect(r.verdict).toBe("hold");
    expect(r.fullDocument).toMatch(/\*\*Labels\.\*\*/);
    expect(r.fullDocument).toContain("[A](https://a.com)");
    expect(r.readiness).toBe(0);
    expect(Report.shape.verdict.options).toContain("kill");
  });
  it("lets kill through", async () => {
    const json = async (_n: string, s: any) => s.parse(rep("kill", "weak"));
    expect((await report(run, env, () => {}, stub({ json: json as any }))).verdict).toBe("kill");
  });
});

describe("nextTurn", () => {
  it("forces done at 12 founder answers", async () => {
    const transcript = Array.from({ length: 12 }, () => ({ role: "founder" as const, text: "a" }));
    const json = async (_n: string, s: any) => s.parse({ phase: "product", message: "q", suggestions: ["a", "b", "c", "d", "e"], done: false });
    const t = await nextTurn({ ...run, transcript }, env, stub({ json: json as any }));
    expect(t.done).toBe(true);
    expect(t.suggestions).toEqual([]);
  });
  it("caps suggestions at 4", async () => {
    const json = async (_n: string, s: any) => s.parse({ phase: "founder", message: "q", suggestions: ["a", "b", "c", "d", "e"], done: false });
    expect((await nextTurn(run, env, stub({ json: json as any }))).suggestions).toHaveLength(4);
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
