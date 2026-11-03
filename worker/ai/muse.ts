// Thin Muse client over fetch (OpenAI-compatible routes). No SDK: smaller bundle, nothing hidden.
import { z } from "zod";

export type AiEnv = { MODEL_API_KEY: string; MUSE_BASE_URL: string; MUSE_MODEL: string; MUSE_IMAGE_MODEL: string };
export type Progress = (step: string) => void;
export type Source = { url: string; title: string };
export type Effort = "minimal" | "low" | "medium" | "high";
export type PdfInput = { filename: string; base64: string };

export type Muse = {
  searchText(prompt: string): Promise<{ text: string; sources: Source[] }>;
  json<T>(name: string, schema: z.ZodType<T>, system: string, user: string, effort?: Effort, pdf?: PdfInput): Promise<T>;
  text(system: string, user: string, effort?: Effort): Promise<string>;
  image(prompt: string): Promise<string | null>; // data URI, null on any failure
  transcribe(bytes: Uint8Array | ArrayBuffer, contentType: string): Promise<string>;
};

// Web search and long generations often take over a minute.
const SEARCH_MS = 130_000, LLM_MS = 170_000, IMAGE_MS = 60_000;

export function createMuse(env: AiEnv, doFetch: typeof fetch = fetch): Muse {
  const base = env.MUSE_BASE_URL.replace(/\/+$/, "");

  async function post(path: string, body: BodyInit, headers: Record<string, string>, ms: number): Promise<any> {
    let lastErr = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await doFetch(base + path, {
          method: "POST", body, signal: AbortSignal.timeout(ms),
          headers: { Authorization: `Bearer ${env.MODEL_API_KEY}`, ...headers },
        });
        if (res.ok) return await res.json();
        lastErr = `Muse ${path} ${res.status}`;
        if (res.status !== 429 && res.status < 500) break; // 4xx other than 429 will not get better
      } catch (e) {
        lastErr = `Muse ${path} ${e instanceof Error ? e.message : "network error"}`;
        if (e instanceof Error && e.name === "TimeoutError") break; // repeating a slow call only doubles the wait
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    throw new Error(lastErr);
  }
  const postJson = (path: string, body: unknown, ms: number) =>
    post(path, JSON.stringify(body), { "Content-Type": "application/json" }, ms);

  const chat = async (messages: unknown[], extra: Record<string, unknown>, effort?: Effort): Promise<string> => {
    const r = await postJson("/chat/completions", {
      model: env.MUSE_MODEL, messages, ...(effort ? { reasoning_effort: effort } : {}), ...extra,
    }, LLM_MS);
    const content = r?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content) throw new Error("Muse returned an empty answer");
    return content;
  };

  return {
    async searchText(prompt) {
      const r = await postJson("/responses", {
        model: env.MUSE_MODEL, input: prompt,
        tools: [{ type: "web_search" }], include: ["web_search_call.results"],
      }, SEARCH_MS);
      const texts: string[] = [];
      const seen = new Map<string, string>();
      const add = (url?: unknown, title?: unknown) => {
        if (typeof url === "string" && /^https?:\/\//i.test(url) && !seen.has(url)) seen.set(url, typeof title === "string" ? title : url);
      };
      for (const item of Array.isArray(r?.output) ? r.output : []) {
        if (item?.type === "web_search_call") for (const x of item.results ?? []) add(x?.url, x?.title);
        if (item?.type === "message") {
          for (const c of item.content ?? []) {
            if (c?.type !== "output_text") continue;
            texts.push(String(c.text ?? ""));
            for (const a of c.annotations ?? []) if (a?.type === "url_citation") add(a.url, a.title);
          }
        }
      }
      if (!texts.length && typeof r?.output_text === "string") texts.push(r.output_text);
      return { text: texts.join("\n").trim(), sources: [...seen].map(([url, title]) => ({ url, title })) };
    },

    async json(name, schema, system, user, effort = "low", pdf) {
      const js = z.toJSONSchema(schema) as Record<string, unknown>;
      delete js.$schema;
      const userContent = pdf
        ? [{ type: "text", text: user }, { type: "file", file: { filename: pdf.filename, file_data: `data:application/pdf;base64,${pdf.base64}` } }]
        : user;
      const messages: unknown[] = [{ role: "system", content: system }, { role: "user", content: userContent }];
      const rf = { response_format: { type: "json_schema", json_schema: { name, schema: js, strict: true } } };
      let err = "";
      for (let i = 0; i < 2; i++) {
        const raw = await chat(messages, rf, effort);
        try {
          return schema.parse(JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")));
        } catch (e) {
          err = e instanceof Error ? e.message : String(e);
          messages.push({ role: "assistant", content: raw }, { role: "user", content: `Your JSON failed validation: ${err.slice(0, 800)}\nReturn the corrected JSON only.` });
        }
      }
      throw new Error(`Muse JSON for "${name}" failed validation twice`);
    },

    text: (system, user, effort = "low") =>
      chat([{ role: "system", content: system }, { role: "user", content: user }], {}, effort),

    async image(prompt) {
      try {
        const r = await postJson("/images/generations", {
          model: env.MUSE_IMAGE_MODEL, prompt, n: 1, size: "1024x1024", response_format: "b64_json", output_format: "webp",
        }, IMAGE_MS);
        const b64 = r?.data?.[0]?.b64_json;
        return typeof b64 === "string" && b64 ? `data:image/webp;base64,${b64}` : null;
      } catch { return null; }
    },

    async transcribe(bytes, contentType) {
      const form = new FormData();
      form.append("request", new Blob([JSON.stringify({ model: "muse-voice-transcribe-1.0", audioEncoding: "WAV", mode: "PUSH_TO_TALK" })], { type: "application/json" }));
      form.append("audio", new Blob([bytes as BlobPart], { type: contentType }), "audio.wav");
      const r = await post("/asr/transcribe", form, { Accept: "application/json" }, LLM_MS);
      // TranscribeResponse fields are not in the docs we could read: accept the plausible shapes.
      const t = r?.text ?? r?.transcript ?? (Array.isArray(r?.turns) ? r.turns.map((x: any) => x?.text ?? x?.transcript ?? "").join(" ") : "");
      return String(t).trim();
    },
  };
}
