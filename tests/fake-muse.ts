// Stand-in for Meta's Muse API so the whole app runs with no key and no cost.
//
//   .dev.vars:   MODEL_API_KEY=fake
//                MUSE_BASE_URL=http://localhost:8799/v1
//   terminal 1:  pnpm fake-muse            (node --experimental-strip-types tests/fake-muse.ts)
//   terminal 2:  pnpm dev
// "pnpm dev:fake" guidance: run the two commands above side by side; there is no combined script on purpose.
//
// Routes: POST /v1/responses (web search), /v1/chat/completions (json_schema by name, or plain text = prototype HTML),
// /v1/images/generations, /v1/asr/transcribe. Set FAKE_MUSE_DELAY_MS to simulate slow models.
import { createServer } from "node:http";
import * as f from "./fixtures/dental.ts";

const PORT = Number(process.env.PORT ?? 8799);
const DELAY = Number(process.env.FAKE_MUSE_DELAY_MS ?? 300);
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const byName: Record<string, (req: any) => unknown> = {
  interview_turn: (req) => {
    const text = JSON.stringify(req.messages ?? []);
    const answers = Number(/\((\d+) founder answers/.exec(text)?.[1] ?? 0); // the pipeline states the count in its prompt
    return answers >= 3 ? f.interviewDone : { ...f.interviewQuestions[answers]!, done: false };
  },
  concept: () => f.concept,
  research: () => f.research,
  report: () => f.report,
  system_design: () => f.systemDesign,
  legal: () => f.legal,
  application: () => f.application,
  screening: () => f.screening,
};

function body(req: import("node:http").IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c)).on("end", () => resolve(Buffer.concat(chunks))).on("error", reject);
  });
}

createServer(async (req, res) => {
  const send = (status: number, data: unknown) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
  try {
    if (req.method !== "POST") return send(404, { error: "not found" });
    if (!req.headers.authorization?.startsWith("Bearer ")) return send(401, { error: "missing key" });
    const raw = await body(req);
    await new Promise((r) => setTimeout(r, DELAY));
    const path = (req.url ?? "").split("?")[0];
    if (path === "/v1/asr/transcribe") return send(200, { text: "A Telegram bot for small dental clinics." });
    const json = JSON.parse(raw.toString() || "{}");
    if (path === "/v1/images/generations") return send(200, { data: [{ b64_json: PNG }] });
    if (path === "/v1/responses") {
      const cited = f.SEARCH_RESULTS.slice(0, 3);
      return send(200, { output: [
        { type: "web_search_call", results: f.SEARCH_RESULTS },
        { type: "message", content: [{ type: "output_text", text: f.SEARCH_RESULTS.map((r) => `${r.title}: ${r.snippet}`).join("\n"),
          annotations: cited.map((r) => ({ type: "url_citation", url: r.url, title: r.title })) }] },
      ] });
    }
    if (path === "/v1/chat/completions") {
      const name = json.response_format?.json_schema?.name as string | undefined;
      if (!name) return send(200, { choices: [{ message: { content: f.prototypeHtml } }] }); // prototype and repair ask for plain text
      const make = byName[name];
      if (!make) return send(400, { error: `fake-muse: no fixture for schema "${name}"` });
      return send(200, { choices: [{ message: { content: JSON.stringify(make(json)) } }] });
    }
    send(404, { error: "not found" });
  } catch {
    send(500, { error: "fake-muse failure" });
  }
}).listen(PORT, () => console.log(`fake-muse on http://localhost:${PORT}/v1`));
