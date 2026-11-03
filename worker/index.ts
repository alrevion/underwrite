import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import type { Batch, Run, Stage, StageEvent, ScreenEvent } from "../shared/contract";
import * as realAi from "./ai/index";
import { appendItem, bump, cleanupDaily, loadBatch, loadRun, lock, saveBatch, saveRun, unbump, unlock, type Env } from "./db";
import type { Context } from "hono";

export type Ai = typeof realAi;

const MB = 1024 * 1024;
const Idea = z.object({ idea: z.string().min(10).max(5000), lang: z.string().max(20).optional() });
const Answer = z.object({ answer: z.string().min(1).max(4000) });
const Thesis = z.object({ thesis: z.string().min(1).max(4000) });
const Repair = z.object({ error: z.string().min(1).max(4000) });
const StageBody = z.object({ country: z.string().min(1).max(80).optional() });
const Application = z.object({
  name: z.string().min(1).max(200),
  text: z.string().max(60000).optional(),
  pdfBase64: z.string().max(15 * MB).optional(),
});

const STAGES = ["concept", "research", "report", "system", "prototype", "legal"] as const;
// Each stage needs the field on the left of its entry; concept needs a finished interview.
const NEEDS: Record<Stage, keyof Run | "interview-done"> = {
  concept: "interview-done", research: "concept", report: "research", system: "report", prototype: "report", legal: "report",
};
// Redoing a stage drops what was built on top of it.
const DOWNSTREAM: Record<Stage, Stage[]> = {
  concept: ["research", "report", "system", "prototype", "legal"],
  research: ["report", "system", "prototype", "legal"],
  report: ["system", "prototype", "legal"],
  system: [],
  prototype: [],
  legal: [],
};

const ndjson = (e: StageEvent | ScreenEvent) => JSON.stringify(e) + "\n";
const GENERIC = "The step failed. Please try again.";
const TOO_MANY = { error: "Daily limit reached. Try again tomorrow." };
const FULL = { error: "Daily capacity reached, try tomorrow" };
const INTERVIEW_TTL = 6 * 60_000; // above the worst case of one model call with retries
const STAGE_TTL = 10 * 60_000; // above the worst case of a stage; released early when the client leaves
const num = (v: string | undefined, d: number) => (v !== undefined && Number.isFinite(Number(v)) ? Number(v) : d);
// Server-side reason only: short, never user text, never sent to the client.
const logFail = (where: string, e: unknown) => console.error(where, e instanceof Error ? e.message.slice(0, 120) : "error");

// IPv6 clients rotate through a whole /64, so key them by it.
export function ipKey(raw: string | undefined): string {
  if (!raw) return "local";
  if (!raw.includes(":")) return raw;
  const [head = "", tail] = raw.toLowerCase().split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = tail === undefined ? h : [...h, ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"), ...t];
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

export const MAX_BATCH_ITEMS = 4;
type Ctx = Context<{ Bindings: Env }>;
type Charge = { refund(): Promise<void> };

export function createApp(ai: Ai) {
  const app = new Hono<{ Bindings: Env }>();

  app.use("/api/*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");
    c.header("Cache-Control", "no-store");
    if (!c.res.headers.has("Content-Security-Policy")) c.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  });
  app.onError((e, c) => {
    logFail("unhandled", e);
    return c.json({ error: "Internal error" }, 500);
  });
  app.notFound((c) => c.json({ error: "Not found" }, 404));

  const small = bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.json({ error: "Request too large" }, 413) });
  const big = bodyLimit({ maxSize: 16 * MB, onError: (c) => c.json({ error: "Request too large" }, 413) });
  const audio = bodyLimit({ maxSize: 10 * MB, onError: (c) => c.json({ error: "Audio too large" }, 413) });

  async function json<T extends z.ZodTypeAny>(c: { req: { json(): Promise<unknown> } }, schema: T, optional = false) {
    let raw: unknown = {};
    try { raw = await c.req.json(); } catch { if (!optional) return { err: "Invalid JSON" } as const; }
    const r = schema.safeParse(raw);
    return r.success ? ({ data: r.data as z.infer<T> } as const) : ({ err: "Invalid input: " + r.error.issues.map((i) => i.path.join(".") || "body").join(", ") } as const);
  }

  const needKey = (env: Env) => !env.MODEL_API_KEY;
  const NO_KEY = { error: "Server is missing MODEL_API_KEY. Add it to .dev.vars or as a Worker secret." };
  const uuid = z.string().uuid();
  const today = () => new Date().toISOString().slice(0, 10);
  const ipOf = (c: Ctx) => ipKey(c.req.header("cf-connecting-ip"));

  // Budget. Every paid model call costs one unit against the global daily cap and the per-IP unit cap;
  // creating a run or screening an application also counts against DAILY_RUN_LIMIT. Over any cap: nothing is spent.
  async function charge(c: Ctx, newRun = false): Promise<Charge | Response> {
    const db = c.env.DB, day = today(), ip = ipOf(c);
    try { await cleanupDaily(db, day); } catch { /* housekeeping must never block a request */ }
    const caps: [string, number, Response][] = [
      [`g:${day}`, num(c.env.DAILY_GLOBAL_LIMIT, 200), c.json(FULL, 503)],
      [`u:${ip}:${day}`, num(c.env.DAILY_IP_UNITS, 60), c.json(TOO_MANY, 429)],
    ];
    if (newRun) caps.push([`r:${ip}:${day}`, num(c.env.DAILY_RUN_LIMIT, 10), c.json(TOO_MANY, 429)]);
    const taken: string[] = [];
    for (const [key, limit, refusal] of caps) {
      taken.push(key);
      if ((await bump(db, key)) > limit) {
        for (const k of taken) await unbump(db, k);
        return refusal;
      }
    }
    let refunded = false;
    return { refund: async () => { if (!refunded) { refunded = true; for (const k of taken) await unbump(db, k); } } };
  }

  // Streams NDJSON and pings every 10 s. If the client leaves, `release` runs at once (so a retry is not
  // blocked) and `st.cancelled` tells the work to throw its result away instead of saving over a retry.
  type St = { cancelled: boolean };
  function stream(c: Ctx, work: (progress: (s: string) => void, st: St) => Promise<StageEvent | ScreenEvent>, release: () => Promise<unknown>) {
    const st: St = { cancelled: false };
    const enc = new TextEncoder();
    let ctrl!: ReadableStreamDefaultController<Uint8Array>;
    const send = (s: string) => { if (!st.cancelled) try { ctrl.enqueue(enc.encode(s)); } catch { /* closed */ } };
    const body = new ReadableStream<Uint8Array>({
      start(c_) { ctrl = c_ as ReadableStreamDefaultController<Uint8Array>; },
      async cancel() { st.cancelled = true; await release(); },
    });
    const done = (async () => {
      const ping = setInterval(() => send("\n"), 10_000);
      try {
        send(ndjson(await work((step) => send(ndjson({ type: "progress", step })), st)));
      } catch (e) {
        if (!st.cancelled) logFail("stage", e);
        send(ndjson({ type: "error", message: GENERIC }));
      } finally {
        clearInterval(ping);
        await release().catch(() => {});
        try { ctrl.close(); } catch { /* cancelled */ }
      }
    })();
    try { c.executionCtx.waitUntil(done); } catch { /* no execution context (tests) */ }
    return new Response(body, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }
  const storedStream = (event: StageEvent | ScreenEvent) =>
    new Response(ndjson(event), { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });

  app.get("/api/health", async (c) => {
    await c.env.DB.prepare("SELECT 1").first();
    return c.json({ ok: true, model: !needKey(c.env) });
  });

  app.post("/api/runs", small, async (c) => {
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const body = await json(c, Idea);
    if ("err" in body) return c.json({ error: body.err }, 400);
    const ch = await charge(c, true);
    if (ch instanceof Response) return ch;
    const run: Run = { id: crypto.randomUUID(), createdAt: Date.now(), idea: body.data.idea, lang: "auto", transcript: [] };
    try {
      run.interview = await ai.nextTurn(run, c.env as never);
    } catch (e) {
      logFail("interview", e);
      await ch.refund();
      return c.json({ error: "The interviewer is unavailable. Please try again." }, 502);
    }
    run.transcript.push({ role: "interviewer", text: run.interview.message });
    await saveRun(c.env.DB, run);
    return c.json(run);
  });

  app.get("/api/runs/:id", async (c) => {
    const id = c.req.param("id");
    const run = uuid.safeParse(id).success ? await loadRun(c.env.DB, id) : null;
    return run ? c.json(run) : c.json({ error: "Run not found" }, 404);
  });

  // The prototype page for an iframe (src, sandbox="allow-scripts"). A srcdoc iframe inherits the app's strict
  // script-src and its inline script would be blocked; served from here it gets its own policy instead.
  const protoPage = (c: Ctx, html: string) =>
    c.body(html, 200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; sandbox allow-scripts",
    });
  app.get("/api/runs/:id/prototype", async (c) => {
    const id = c.req.param("id");
    const run = uuid.safeParse(id).success ? await loadRun(c.env.DB, id) : null;
    return run?.prototype ? protoPage(c, run.prototype.html) : c.json({ error: "Prototype not found" }, 404);
  });
  app.get("/api/batches/:id/items/:itemId/prototype", async (c) => {
    const id = c.req.param("id");
    const b = uuid.safeParse(id).success ? await loadBatch(c.env.DB, id) : null;
    const item = b?.items.find((i) => i.id === c.req.param("itemId"));
    return item?.prototype ? protoPage(c, item.prototype.html) : c.json({ error: "Prototype not found" }, 404);
  });

  app.post("/api/runs/:id/interview", small, async (c) => {
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const id = c.req.param("id");
    const body = await json(c, Answer);
    if ("err" in body) return c.json({ error: body.err }, 400);
    if (!uuid.safeParse(id).success) return c.json({ error: "Run not found" }, 404);
    const key = `run:${id}`;
    const token = await lock(c.env.DB, key, INTERVIEW_TTL);
    if (!token) return c.json({ error: "Run is busy" }, 409);
    try {
      const run = await loadRun(c.env.DB, id);
      if (!run) return c.json({ error: "Run not found" }, 404);
      if (!run.interview || run.interview.done) return c.json({ error: "Interview is already finished" }, 409);
      const ch = await charge(c);
      if (ch instanceof Response) return ch;
      run.transcript.push({ role: "founder", text: body.data.answer });
      try {
        run.interview = await ai.nextTurn(run, c.env as never);
      } catch (e) {
        logFail("interview", e);
        await ch.refund();
        return c.json({ error: "The interviewer is unavailable. Please try again." }, 502);
      }
      run.transcript.push({ role: "interviewer", text: run.interview.message });
      await saveRun(c.env.DB, run);
      return c.json(run);
    } finally { await unlock(c.env.DB, key, token); }
  });

  // The founder may stop any time; the report labels whatever stayed unclear.
  app.post("/api/runs/:id/interview/finish", small, async (c) => {
    const id = c.req.param("id");
    if (!uuid.safeParse(id).success) return c.json({ error: "Run not found" }, 404);
    const key = `run:${id}`;
    const token = await lock(c.env.DB, key, INTERVIEW_TTL);
    if (!token) return c.json({ error: "Run is busy" }, 409);
    try {
      const run = await loadRun(c.env.DB, id);
      if (!run?.interview) return c.json({ error: "Run not found" }, 404);
      run.interview = { ...run.interview, done: true, suggestions: [] };
      await saveRun(c.env.DB, run);
      return c.json(run);
    } finally { await unlock(c.env.DB, key, token); }
  });

  app.post("/api/runs/:id/stages/:stage", small, async (c) => {
    const stage = c.req.param("stage") as Stage;
    const id = c.req.param("id");
    if (!(STAGES as readonly string[]).includes(stage)) return c.json({ error: "Unknown stage" }, 404);
    if (!uuid.safeParse(id).success) return c.json({ error: "Run not found" }, 404);
    const body = await json(c, StageBody, true);
    if ("err" in body) return c.json({ error: body.err }, 400);
    const country = body.data.country;
    if (stage === "legal" && !country) return c.json({ error: "country is required for legal" }, 400);
    const run = await loadRun(c.env.DB, id);
    if (!run) return c.json({ error: "Run not found" }, 404);
    const need = NEEDS[stage];
    if (need === "interview-done" ? !run.interview?.done : !run[need]) return c.json({ error: `Stage ${stage} needs ${need === "interview-done" ? "a finished interview" : need} first` }, 409);
    const redo = c.req.query("redo") === "1";
    if (run[stage] && !redo) return storedStream({ type: "done", run });
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const key = `run:${id}`;
    const token = await lock(c.env.DB, key, STAGE_TTL);
    if (!token) return c.json({ error: "A step for this run is already running" }, 409);
    const release = () => unlock(c.env.DB, key, token);
    const ch = await charge(c);
    if (ch instanceof Response) { await release(); return ch; }
    return stream(c, async (progress, st) => {
      try {
        const fresh = (await loadRun(c.env.DB, id)) ?? run;
        const env = c.env as never;
        if (redo) for (const s of DOWNSTREAM[stage]) delete fresh[s];
        switch (stage) {
          case "concept": fresh.concept = await ai.concept(fresh, env, progress); break;
          case "research": fresh.research = await ai.research(fresh, env, progress); break;
          case "report": fresh.report = await ai.report(fresh, env, progress); break;
          case "system": fresh.system = await ai.system(fresh, env, progress); break;
          case "prototype": fresh.prototype = await ai.prototype(fresh, env, progress); break;
          case "legal": fresh.legal = await ai.legal(fresh, country!, env, progress); break;
        }
        if (st.cancelled) throw new Error("client left"); // a retry may already hold the lock: do not save over it
        await saveRun(c.env.DB, fresh);
        return { type: "done", run: fresh } satisfies StageEvent;
      } catch (e) {
        if (!st.cancelled) await ch.refund(); // all-or-nothing stage: nothing was produced
        throw e;
      }
    }, release);
  });

  app.post("/api/runs/:id/prototype/repair", small, async (c) => {
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const id = c.req.param("id");
    const body = await json(c, Repair);
    if ("err" in body) return c.json({ error: body.err }, 400);
    if (!uuid.safeParse(id).success) return c.json({ error: "Run not found" }, 404);
    const key = `run:${id}`;
    const token = await lock(c.env.DB, key, INTERVIEW_TTL);
    if (!token) return c.json({ error: "Run is busy" }, 409);
    try {
      const run = await loadRun(c.env.DB, id);
      if (!run) return c.json({ error: "Run not found" }, 404);
      if (!run.prototype) return c.json({ error: "No prototype to repair" }, 409);
      if (run.prototype.repaired) return c.json({ error: "Prototype was already repaired once" }, 409);
      const ch = await charge(c);
      if (ch instanceof Response) return ch;
      try {
        run.prototype = await ai.repairPrototype(run.prototype.html, body.data.error, c.env as never);
      } catch (e) {
        logFail("repair", e);
        await ch.refund();
        return c.json({ error: "Repair failed. Please try again." }, 502);
      }
      run.prototype.repaired = true;
      await saveRun(c.env.DB, run);
      return c.json(run);
    } finally { await unlock(c.env.DB, key, token); }
  });

  app.post("/api/transcribe", audio, async (c) => {
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const type = c.req.header("content-type") ?? "";
    if (!type.startsWith("audio/")) return c.json({ error: "Content-Type must be audio/wav" }, 400);
    if (!/^audio\/(x-)?wave?(;|$)/i.test(type)) return c.json({ error: "Only WAV audio is supported" }, 415); // Muse ASR takes WAV only
    const bytes = new Uint8Array(await c.req.arrayBuffer());
    if (!bytes.length) return c.json({ error: "Empty audio" }, 400);
    if (bytes.length > 10 * MB) return c.json({ error: "Audio too large" }, 413);
    const ch = await charge(c);
    if (ch instanceof Response) return ch;
    try {
      return c.json({ text: await ai.transcribe(bytes, type, c.env as never) });
    } catch (e) {
      logFail("transcribe", e);
      await ch.refund();
      return c.json({ error: "Transcription failed" }, 502);
    }
  });

  app.post("/api/batches", small, async (c) => {
    const body = await json(c, Thesis);
    if ("err" in body) return c.json({ error: body.err }, 400);
    // Free of model cost, but it writes rows: cap it per IP.
    const key = `b:${ipOf(c)}:${today()}`;
    if ((await bump(c.env.DB, key)) > 20) { await unbump(c.env.DB, key); return c.json(TOO_MANY, 429); }
    const batch: Batch = { id: crypto.randomUUID(), createdAt: Date.now(), thesis: body.data.thesis, items: [] };
    await saveBatch(c.env.DB, batch);
    return c.json(batch);
  });

  app.get("/api/batches/:id", async (c) => {
    const id = c.req.param("id");
    const b = uuid.safeParse(id).success ? await loadBatch(c.env.DB, id) : null;
    return b ? c.json(b) : c.json({ error: "Batch not found" }, 404);
  });

  app.post("/api/batches/:id/screen", big, async (c) => {
    if (needKey(c.env)) return c.json(NO_KEY, 503);
    const id = c.req.param("id");
    const body = await json(c, Application);
    if ("err" in body) return c.json({ error: body.err }, 400);
    const app_ = body.data;
    if (!app_.text && !app_.pdfBase64) return c.json({ error: "Provide text or pdfBase64" }, 400);
    if (!uuid.safeParse(id).success) return c.json({ error: "Batch not found" }, 404);
    const batch = await loadBatch(c.env.DB, id);
    if (!batch) return c.json({ error: "Batch not found" }, 404);
    // ponytail: a batch is one row, capped at 2 MB, and a screening with its prototype is about 400 KB. Split items into rows to lift this.
    if (batch.items.length >= MAX_BATCH_ITEMS) return c.json({ error: `A batch holds ${MAX_BATCH_ITEMS} applications. Start a new batch for more.` }, 409);
    const ch = await charge(c, true);
    if (ch instanceof Response) return ch;
    return stream(c, async (progress, st) => {
      try {
        const item = await ai.screen(batch.thesis, app_, c.env as never, progress);
        if (st.cancelled) throw new Error("client left");
        await appendItem(c.env.DB, id, item); // atomic append; the PDF is never stored, only this result
        return { type: "done", batch: (await loadBatch(c.env.DB, id)) ?? batch } satisfies ScreenEvent;
      } catch (e) {
        if (!st.cancelled) await ch.refund();
        throw e;
      }
    }, async () => {});
  });

  return app;
}

export const app = createApp(realAi);
