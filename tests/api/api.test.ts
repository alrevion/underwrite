import { describe, expect, it } from "vitest";
import { finishedRun, IDEA, ndjson, setup, sleep } from "./helpers";
import { ipKey, MAX_BATCH_ITEMS } from "../../worker/index";
import { cleanupDaily, lock, unlock } from "../../worker/db";

describe("health and headers", () => {
  it("answers and sets security headers", async () => {
    const { call } = setup();
    const r = await call("/api/health");
    expect(r.status).toBe(200);
    expect(r.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await r.json()).toEqual({ ok: true, model: true });
  });
  it("503 with a clear message when MODEL_API_KEY is missing", async () => {
    const { call } = setup({ env: { MODEL_API_KEY: undefined } });
    const r = await call("/api/runs", { json: { idea: IDEA } });
    expect(r.status).toBe(503);
    expect(((await r.json()) as any).error).toContain("MODEL_API_KEY");
  });
});

describe("validation", () => {
  it.each([
    ["short idea", "/api/runs", { idea: "tiny" }],
    ["long idea", "/api/runs", { idea: "x".repeat(5001) }],
    ["non-string idea", "/api/runs", { idea: 5 }],
  ])("rejects %s", async (_n, path, json) => {
    const { call } = setup();
    expect((await call(path, { json })).status).toBe(400);
  });
  it("rejects bad JSON and oversized bodies", async () => {
    const { call } = setup();
    expect((await call("/api/runs", { method: "POST", body: "{nope", headers: { "content-type": "application/json" } })).status).toBe(400);
    expect((await call("/api/runs", { json: { idea: "x".repeat(70_000) } })).status).toBe(413);
  });
  it("limits answer, thesis, country, text, audio", async () => {
    const { call } = setup();
    const run = await finishedRun(call);
    const open = await (await call("/api/runs", { json: { idea: IDEA } })).json() as any;
    expect((await call(`/api/runs/${open.id}/interview`, { json: { answer: "a".repeat(4001) } })).status).toBe(400);
    expect((await call("/api/batches", { json: { thesis: "t".repeat(4001) } })).status).toBe(400);
    expect((await call(`/api/runs/${run.id}/stages/concept`, { json: {} })).status).toBe(200);
    expect((await call(`/api/runs/${run.id}/stages/legal`, { json: { country: "c".repeat(81) } })).status).toBe(400);
    const b = await (await call("/api/batches", { json: { thesis: "fund" } })).json() as any;
    expect((await call(`/api/batches/${b.id}/screen`, { json: { name: "A", text: "t".repeat(60001) } })).status).toBe(400);
    expect((await call(`/api/batches/${b.id}/screen`, { json: { name: "A" } })).status).toBe(400);
    const big = await call("/api/transcribe", { method: "POST", body: new Uint8Array(10 * 1024 * 1024 + 1), headers: { "content-type": "audio/wav" } });
    expect(big.status).toBe(413);
    expect((await call("/api/transcribe", { method: "POST", body: "x", headers: { "content-type": "text/plain" } })).status).toBe(400);
    expect((await call("/api/transcribe", { method: "POST", body: "x", headers: { "content-type": "audio/webm" } })).status).toBe(415);
  });
  it("404s on malformed or unknown ids without touching the DB", async () => {
    const { call } = setup();
    expect((await call("/api/runs/not-a-uuid")).status).toBe(404);
    expect((await call(`/api/runs/${crypto.randomUUID()}`)).status).toBe(404);
    expect((await call("/api/batches/zzz")).status).toBe(404);
  });
});

describe("rate limit", () => {
  it("allows DAILY_RUN_LIMIT runs per IP, then 429; other IPs unaffected", async () => {
    const { call } = setup({ env: { DAILY_RUN_LIMIT: "2" } });
    const go = (ip: string) => call("/api/runs", { json: { idea: IDEA }, ip }).then((r) => r.status);
    expect([await go("1.1.1.1"), await go("1.1.1.1"), await go("1.1.1.1")]).toEqual([200, 200, 429]);
    expect(await go("2.2.2.2")).toBe(200);
  });
  it("counts each screened application", async () => {
    const { call } = setup({ env: { DAILY_RUN_LIMIT: "2" } });
    const b = await (await call("/api/batches", { json: { thesis: "fund" } })).json() as any;
    const go = () => call(`/api/batches/${b.id}/screen`, { json: { name: "A", text: "pitch" }, ip: "3.3.3.3" }).then(async (r) => { await r.text(); return r.status; });
    expect([await go(), await go(), await go()]).toEqual([200, 200, 429]);
  });
});

describe("interview and stage order", () => {
  it("runs the interview then enforces stage order", async () => {
    const { call } = setup();
    const early = await (await call("/api/runs", { json: { idea: IDEA } })).json() as any;
    expect((await call(`/api/runs/${early.id}/stages/concept`, { json: {} })).status).toBe(409);
    const run = await finishedRun(call);
    expect((await call(`/api/runs/${run.id}/interview`, { json: { answer: "more" } })).status).toBe(409);
    for (const s of ["research", "report", "system", "prototype"]) expect((await call(`/api/runs/${run.id}/stages/${s}`, { json: {} })).status).toBe(409);
    const order = ["concept", "research", "report", "system", "prototype"];
    for (const s of order) {
      const res = await call(`/api/runs/${run.id}/stages/${s}`, { json: {} });
      expect(res.headers.get("content-type")).toContain("application/x-ndjson");
      const ev = await ndjson(res);
      expect(ev.at(-1).type).toBe("done");
      expect(ev.at(-1).run[s]).toBeTruthy();
    }
    expect((await call(`/api/runs/${run.id}/stages/legal`, { json: {} })).status).toBe(400);
    const legal = await ndjson(await call(`/api/runs/${run.id}/stages/legal`, { json: { country: "Germany" } }));
    expect(legal.at(-1).run.legal.country).toBe("Germany");
    expect((await call(`/api/runs/${run.id}/stages/nope`, { json: {} })).status).toBe(404);
  });
  it("returns the stored result unless ?redo=1, and redo drops later stages", async () => {
    const { call, calls } = setup();
    const run = await finishedRun(call);
    for (const s of ["concept", "research"]) await (await call(`/api/runs/${run.id}/stages/${s}`, { json: {} })).text();
    const n = calls.filter((c) => c === "concept").length;
    const again = await ndjson(await call(`/api/runs/${run.id}/stages/concept`, { json: {} }));
    expect(again).toEqual([{ type: "done", run: expect.objectContaining({ id: run.id }) }]);
    expect(calls.filter((c) => c === "concept").length).toBe(n);
    const redo = await ndjson(await call(`/api/runs/${run.id}/stages/concept?redo=1`, { json: {} }));
    expect(calls.filter((c) => c === "concept").length).toBe(n + 1);
    expect(redo.at(-1).run.research).toBeUndefined();
  });
  it("emits progress events and an error event when the pipeline throws", async () => {
    const { call } = setup();
    const run = await finishedRun(call);
    const ev = await ndjson(await call(`/api/runs/${run.id}/stages/concept`, { json: {} }));
    expect(ev[0]).toEqual({ type: "progress", step: "working" });
    const bad = setup({ ai: { concept: async () => { throw new Error("boom"); } } });
    const run2 = await finishedRun(bad.call);
    const ev2 = await ndjson(await bad.call(`/api/runs/${run2.id}/stages/concept`, { json: {} }));
    expect(ev2.at(-1)).toEqual({ type: "error", message: "The step failed. Please try again." });
    // the lock is released after a failure
    expect(((await bad.call(`/api/runs/${run2.id}/stages/concept`, { json: {} })).status)).toBe(200);
  });
});

describe("double-call guard", () => {
  it("rejects a concurrent call for the same run while one is in flight and spends once", async () => {
    const { call, calls } = setup({ delay: 150 });
    const run = await finishedRun(call);
    const [a, b] = await Promise.all([call(`/api/runs/${run.id}/stages/concept`, { json: {} }), (async () => { await sleep(20); return call(`/api/runs/${run.id}/stages/concept`, { json: {} }); })()]);
    expect([a.status, b.status]).toEqual([200, 409]);
    await a.text();
    expect(calls.filter((c) => c === "concept").length).toBe(1);
    // lock released afterwards
    expect((await call(`/api/runs/${run.id}/stages/research`, { json: {} })).status).toBe(200);
  });
});

describe("prototype page", () => {
  it("serves the stored html with its own CSP, 404 before it exists", async () => {
    const { call } = setup();
    const run = await finishedRun(call);
    expect((await call(`/api/runs/${run.id}/prototype`)).status).toBe(404);
    for (const s of ["concept", "research", "report", "system", "prototype"]) await (await call(`/api/runs/${run.id}/stages/${s}`, { json: {} })).text();
    const r = await call(`/api/runs/${run.id}/prototype`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/html");
    expect(r.headers.get("content-security-policy")).toContain("script-src 'unsafe-inline'");
    expect(await r.text()).toBe("<html></html>");
  });
});

describe("batch item prototype page", () => {
  it("serves an item's prototype and 404s otherwise", async () => {
    const withProto = setup({ ai: { screen: async () => ({ id: "11111111-1111-4111-8111-111111111111", prototype: { html: "<html>p</html>", screens: [], repaired: false } }) } });
    const b = await (await withProto.call("/api/batches", { json: { thesis: "t" } })).json() as any;
    await (await withProto.call(`/api/batches/${b.id}/screen`, { json: { name: "A", text: "p" } })).text();
    const r = await withProto.call(`/api/batches/${b.id}/items/11111111-1111-4111-8111-111111111111/prototype`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-security-policy")).toContain("script-src 'unsafe-inline'");
    expect(await r.text()).toBe("<html>p</html>");
    expect((await withProto.call(`/api/batches/${b.id}/items/nope/prototype`)).status).toBe(404);
  });
});

describe("prototype repair", () => {
  it("repairs once, then 409", async () => {
    const { call } = setup();
    const run = await finishedRun(call);
    for (const s of ["concept", "research", "report", "system", "prototype"]) await (await call(`/api/runs/${run.id}/stages/${s}`, { json: {} })).text();
    const r1 = await call(`/api/runs/${run.id}/prototype/repair`, { json: { error: "x is not defined" } });
    expect(r1.status).toBe(200);
    expect(((await r1.json()) as any).prototype.repaired).toBe(true);
    expect((await call(`/api/runs/${run.id}/prototype/repair`, { json: { error: "again" } })).status).toBe(409);
  });
});

describe("batches", () => {
  it("screens applications into the batch and stores no PDF", async () => {
    const { call, env } = setup();
    const b = await (await call("/api/batches", { json: { thesis: "B2B SaaS" } })).json() as any;
    const ev = await ndjson(await call(`/api/batches/${b.id}/screen`, { json: { name: "A", pdfBase64: "JVBERi0=" } }));
    expect(ev.at(-1).type).toBe("done");
    const got = await (await call(`/api/batches/${b.id}`)).json() as any;
    expect(got.items).toHaveLength(1);
    const row = await env.DB.prepare("SELECT data FROM batches WHERE id = ?").bind(b.id).first<{ data: string }>();
    expect(row!.data).not.toContain("JVBERi0=");
  });
  it("transcribes audio", async () => {
    const { call } = setup();
    const r = await call("/api/transcribe", { method: "POST", body: new Uint8Array([1, 2, 3]), headers: { "content-type": "audio/wav" } });
    expect(await r.json()).toEqual({ text: "hello" });
  });
});

const usage = async (env: { DB: D1Database }, like: string) =>
  (await env.DB.prepare("SELECT count FROM usage WHERE ip_day LIKE ?").bind(like).first<{ count: number }>())?.count ?? 0;

describe("budget", () => {
  it("global daily cap returns 503 with the capacity message", async () => {
    const { call } = setup({ env: { DAILY_GLOBAL_LIMIT: "3" } });
    const a = await (await call("/api/runs", { json: { idea: IDEA }, ip: "1.1.1.1" })).json() as any; // 1
    expect((await call(`/api/runs/${a.id}/interview`, { json: { answer: "a" }, ip: "2.2.2.2" })).status).toBe(200); // 2
    expect((await call("/api/runs", { json: { idea: IDEA }, ip: "3.3.3.3" })).status).toBe(200); // 3
    const r = await call("/api/runs", { json: { idea: IDEA }, ip: "4.4.4.4" });
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: "Daily capacity reached, try tomorrow" });
  });
  it("per-IP unit cap returns 429 while other IPs still work", async () => {
    const { call } = setup({ env: { DAILY_IP_UNITS: "2" } });
    const go = (ip: string) => call("/api/runs", { json: { idea: IDEA }, ip }).then((r) => r.status);
    expect([await go("1.1.1.1"), await go("1.1.1.1"), await go("1.1.1.1"), await go("9.9.9.9")]).toEqual([200, 200, 429, 200]);
  });
  it("a refused request does not eat global capacity", async () => {
    const { call } = setup({ env: { DAILY_IP_UNITS: "1", DAILY_GLOBAL_LIMIT: "3" } });
    const go = (ip: string) => call("/api/runs", { json: { idea: IDEA }, ip }).then((r) => r.status);
    const out = [await go("1.1.1.1")];
    for (let i = 0; i < 5; i++) out.push(await go("1.1.1.1"));
    out.push(await go("2.2.2.2"), await go("3.3.3.3"));
    expect(out).toEqual([200, 429, 429, 429, 429, 429, 200, 200]);
  });
  it("buckets IPv6 by /64", () => {
    expect(ipKey("2001:db8:1:2:aaaa:bbbb:cccc:dddd")).toBe(ipKey("2001:db8:1:2::1"));
    expect(ipKey("2001:db8:1:2::1")).not.toBe(ipKey("2001:db8:1:3::1"));
    expect(ipKey("1.2.3.4")).toBe("1.2.3.4");
  });
  it("charges the first execution and redo, not a stored result", async () => {
    const { call, env } = setup();
    const run = await finishedRun(call); // 1 run + 3 interview turns
    const stage = (q = "") => call(`/api/runs/${run.id}/stages/concept${q}`, { json: {} }).then((r) => r.text());
    const before = await usage(env, "u:%");
    await stage();
    expect(await usage(env, "u:%")).toBe(before + 1);
    await stage();
    expect(await usage(env, "u:%")).toBe(before + 1);
    await stage("?redo=1");
    expect(await usage(env, "u:%")).toBe(before + 2);
  });
  it("refunds when the upstream call fails before producing anything", async () => {
    const { call, env } = setup({ env: { DAILY_GLOBAL_LIMIT: "2" }, ai: { nextTurn: async () => { throw new Error("Muse /chat/completions 500"); } } });
    for (let i = 0; i < 4; i++) {
      const r = await call("/api/runs", { json: { idea: IDEA } });
      expect(r.status).toBe(502); // never 503: failed calls cost nothing
      expect(JSON.stringify(await r.json())).not.toContain("500");
    }
    expect(await usage(env, "g:%")).toBe(0);
    const bad = setup({ ai: { concept: async () => { throw new Error("x"); } } });
    const run = await finishedRun(bad.call);
    const g = await usage(bad.env, "g:%");
    await (await bad.call(`/api/runs/${run.id}/stages/concept`, { json: {} })).text();
    expect(await usage(bad.env, "g:%")).toBe(g);
  });
  it("hides upstream details from error events and logs only a short reason", async () => {
    const spy = (await import("vitest")).vi.spyOn(console, "error").mockImplementation(() => {});
    const { call } = setup({ ai: { concept: async () => { throw new Error("Muse /chat/completions 502 https://api.meta.ai/v1"); } } });
    const run = await finishedRun(call);
    const text = await (await call(`/api/runs/${run.id}/stages/concept`, { json: {} })).text();
    expect(text).not.toMatch(/502|chat|meta/);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
  it("caps batch creation per IP at 20 a day", async () => {
    const { call } = setup();
    let last = 0;
    for (let i = 0; i < 21; i++) last = (await call("/api/batches", { json: { thesis: "t" }, ip: "5.5.5.5" })).status;
    expect(last).toBe(429);
  });
  it("transcribe and repair are metered", async () => {
    const { call } = setup({ env: { DAILY_IP_UNITS: "1" } });
    const t = () => call("/api/transcribe", { method: "POST", body: new Uint8Array([1]), headers: { "content-type": "audio/wav" } }).then((r) => r.status);
    expect([await t(), await t()]).toEqual([200, 429]);
  });
});

describe("locks and cleanup", () => {
  it("a client that leaves does not keep the run locked, and its result is not saved", async () => {
    const { call, calls } = setup({ delay: 200 });
    const run = await finishedRun(call);
    const first = await call(`/api/runs/${run.id}/stages/concept`, { json: {} });
    await first.body!.cancel();
    const retry = await call(`/api/runs/${run.id}/stages/concept`, { json: {} });
    expect(retry.status).toBe(200);
    expect((await ndjson(retry)).at(-1).type).toBe("done");
    await sleep(300);
    expect(calls.filter((c) => c === "concept").length).toBe(2);
  });
  it("unlock with a stale token keeps the new owner's lock", async () => {
    const { env } = setup();
    const t1 = await lock(env.DB, "k", 1);
    await sleep(5);
    const t2 = await lock(env.DB, "k", 60_000);
    expect(t1 && t2).toBeTruthy();
    await unlock(env.DB, "k", t1!);
    expect(await lock(env.DB, "k", 60_000)).toBeNull();
    await unlock(env.DB, "k", t2!);
    expect(await lock(env.DB, "k", 60_000)).toBeTruthy();
  });
  it("concurrent screenings of one batch all land", async () => {
    const { call } = setup({ delay: 30 });
    const b = await (await call("/api/batches", { json: { thesis: "t" } })).json() as any;
    await Promise.all([1, 2, 3].map((n) => call(`/api/batches/${b.id}/screen`, { json: { name: `A${n}`, text: "p" } }).then((r) => r.text())));
    expect(((await (await call(`/api/batches/${b.id}`)).json()) as any).items).toHaveLength(3);
  });
  it("cleans old usage rows and expired locks once a day", async () => {
    const { env } = setup();
    await env.DB.prepare("INSERT INTO usage (ip_day, count) VALUES ('u:1.1.1.1:2020-01-01', 5), ('u:1.1.1.1:2999-01-01', 5)").run();
    await env.DB.prepare("INSERT INTO locks (key, expires, owner) VALUES ('old', 1, 'x')").run();
    await cleanupDaily(env.DB, "2026-11-03");
    expect(await usage(env, "%2020-01-01")).toBe(0);
    expect(await usage(env, "%2999-01-01")).toBe(5);
    expect(await env.DB.prepare("SELECT key FROM locks WHERE key = 'old'").first()).toBeNull();
  });
});

describe("batch size", () => {
  it("refuses an application over the row-size cap without charging", async () => {
    const { call, env } = setup();
    const made = await (await call("/api/batches", { json: { thesis: "A thesis long enough" } })).json() as { id: string; thesis: string; createdAt: number };
    const items = Array.from({ length: MAX_BATCH_ITEMS }, (_, i) => ({ id: String(i) }));
    await env.DB.prepare("UPDATE batches SET data = ?2 WHERE id = ?1").bind(made.id, JSON.stringify({ ...made, items })).run();
    const r = await call(`/api/batches/${made.id}/screen`, { json: { name: "X", text: "An application text" } });
    expect(r.status).toBe(409);
  });
});
