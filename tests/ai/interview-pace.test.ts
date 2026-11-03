import { describe, expect, it } from "vitest";
import { ANSWER_GAIN, CLARITY_WEIGHTS, floorAfterAnswer, overallClarity, weakest } from "../../worker/ai/interview";
import { plainText } from "../../worker/ai/provenance";
import { slopSigns } from "../../worker/ai/prototype";

describe("clarity", () => {
  const c = (o: Partial<Record<keyof typeof CLARITY_WEIGHTS, number>>) => {
    const d = (k: keyof typeof CLARITY_WEIGHTS) => ({ score: o[k] ?? 100, why: "" });
    return { problem: d("problem"), customer: d("customer"), product: d("product"), money: d("money"), founder: d("founder") };
  };
  it("weights sum to 100", () => {
    expect(Object.values(CLARITY_WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
  it("weights the problem above the founder", () => {
    expect(overallClarity(c({ problem: 0 }))).toBe(70);
    expect(overallClarity(c({ founder: 0 }))).toBe(90);
  });
  it("finds the weakest dimension", () => {
    expect(weakest({ problem: 90, customer: 90, product: 90, money: 20, founder: 40 })).toBe("money");
  });
  it("an answer raises the asked dimension even if the model does not", () => {
    const f = floorAfterAnswer({ clarity: c({ money: 20 }), overall: 0, target: "money", message: "", suggestions: [], done: false })!;
    expect(f.money).toBe(20 + ANSWER_GAIN);
    expect(f.problem).toBe(100);
  });
});

describe("plainText", () => {
  it("removes bold and links but keeps the words", () => {
    expect(plainText("**fact** see [Frontline](https://x.com/a)  now")).toBe("fact see Frontline now");
  });
  it("drops label prefixes the model adds, since chips show the label", () => {
    expect(plainText("fact: 8 tutors. [assumption] No demand. Assumption: none")).toBe("8 tutors. No demand. none");
  });
});

describe("slopSigns", () => {
  const page = (css: string, body: string) => `<!doctype html><html><head><style>${css}</style></head><body>${body}</body></html>`;
  it("passes a plain page", () => {
    expect(slopSigns(page("body{color:#111;font-weight:500}", "<h1>Today</h1>"))).toEqual([]);
  });
  it("finds the common signs", () => {
    const signs = slopSigns(page("a{background:linear-gradient(#f0f,#00f);font-weight:800;text-transform:uppercase}", "<h1>Good morning, Sam</h1><p>🔔 Saved!</p>"));
    expect(signs).toHaveLength(6);
  });
});
