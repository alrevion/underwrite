import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import type { Ai } from "../../worker/index";
import { createApp } from "../../worker/index";
import type { Env } from "../../worker/db";

// Minimal D1 over node:sqlite: just the calls worker/db.ts uses (prepare/bind/first/run).
export function memoryD1(): D1Database {
  const sql = new DatabaseSync(":memory:");
  for (const f of readdirSync("migrations").sort()) sql.exec(readFileSync(`migrations/${f}`, "utf8"));
  const stmt = (q: string, args: unknown[] = []) => ({
    bind: (...a: unknown[]) => stmt(q, a),
    first: async () => (sql.prepare(q).get(...(args as never[])) as never) ?? null,
    run: async () => { sql.prepare(q).run(...(args as never[])); return {} as never; },
  });
  return { prepare: (q: string) => stmt(q) } as unknown as D1Database;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Stub pipeline: records calls, optionally slow.
export function stubAi(delay = 0) {
  const calls: string[] = [];
  const step = async (name: string, v: unknown) => { calls.push(name); await sleep(delay); return v; };
  const ai = {
    nextTurn: async (run: { transcript: unknown[] }) => step("nextTurn", { message: "Q?", suggestions: [], done: run.transcript.length >= 3 }),
    concept: (_r: unknown, _e: unknown, p: (s: string) => void) => { p("working"); return step("concept", { name: "X" }); },
    research: () => step("research", { competitors: [] }),
    report: () => step("report", { verdict: "hold" }),
    system: () => step("system", { overview: "o" }),
    legal: (_r: unknown, country: string) => step("legal", { country }),
    prototype: () => step("prototype", { html: "<html></html>", screens: [], repaired: false }),
    repairPrototype: () => step("repair", { html: "<html>fixed</html>", screens: [], repaired: true }),
    screen: () => step("screen", { id: crypto.randomUUID(), company: "Co" }),
    transcribe: () => step("transcribe", "hello"),
  } as unknown as Ai;
  return { ai, calls };
}

export function setup(opts: { delay?: number; env?: Partial<Env>; ai?: Record<string, unknown> } = {}) {
  const { ai, calls } = stubAi(opts.delay);
  const app = createApp({ ...ai, ...opts.ai } as Ai);
  const env = { DB: memoryD1(), MODEL_API_KEY: "k", MUSE_BASE_URL: "x", MUSE_MODEL: "m", MUSE_IMAGE_MODEL: "i", DAILY_RUN_LIMIT: "100", ...opts.env } as Env;
  const call = async (path: string, init?: RequestInit & { json?: unknown; ip?: string }) =>
    app.request(path, {
      ...init,
      method: init?.method ?? (init?.json !== undefined ? "POST" : "GET"),
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
      headers: { ...(init?.json !== undefined ? { "content-type": "application/json" } : {}), ...(init?.ip ? { "cf-connecting-ip": init.ip } : {}), ...(init?.headers as object) },
    }, env);
  return { app, env, call, calls };
}

export const IDEA = "A Telegram bot for dental clinics";
export async function ndjson(res: Response) {
  return (await res.text()).split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
// Walk a run through the interview until done.
export async function finishedRun(call: ReturnType<typeof setup>["call"]) {
  let run = await (await call("/api/runs", { json: { idea: IDEA } })).json() as any;
  for (let i = 0; i < 5 && !run.interview.done; i++) run = await (await call(`/api/runs/${run.id}/interview`, { json: { answer: "a" } })).json();
  return run;
}
