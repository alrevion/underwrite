import type { Batch, Run, ScreenEvent, Stage, StageEvent } from "../../shared/contract";
import { t } from "./i18n";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** One friendly sentence for any failure. */
export function explain(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 429) return t.err429;
    if (e.status === 503) return e.message.startsWith("Daily capacity") ? e.message : t.err503;
    if (e.status === 404) return t.err404;
    return `${t.errGeneric} (${e.status}) ${e.message}`.trim();
  }
  return t.errNetwork;
}

async function fail(r: Response): Promise<never> {
  let msg = "";
  try { const j = await r.json(); msg = (j as { error?: string }).error ?? ""; } catch { /* body not JSON */ }
  throw new ApiError(r.status, msg);
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, init);
  if (!r.ok) return fail(r);
  return (await r.json()) as T;
}
const post = <T>(path: string, body: unknown) =>
  json<T>(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

export const api = {
  createRun: (idea: string) => post<Run>("/api/runs", { idea, lang: navigator.language.slice(0, 2) }),
  getRun: (id: string) => json<Run>(`/api/runs/${id}`),
  answer: (id: string, answer: string) => post<Run>(`/api/runs/${id}/interview`, { answer }),
  repair: (id: string, error: string) => post<Run>(`/api/runs/${id}/prototype/repair`, { error }),
  createBatch: (thesis: string) => post<Batch>("/api/batches", { thesis }),
  getBatch: (id: string) => json<Batch>(`/api/batches/${id}`),
  transcribe: async (blob: Blob) => {
    return (await json<{ text: string }>("/api/transcribe", { method: "POST", headers: { "content-type": "audio/wav" }, body: blob })).text;
  },
};

/** Reads an NDJSON stream; calls onEvent per line. Throws on HTTP failure or a dropped connection. */
async function ndjson<E>(path: string, body: unknown, onEvent: (e: E) => void, signal: AbortSignal): Promise<void> {
  const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}), signal });
  if (!r.ok) return fail(r);
  if (!r.body) throw new Error("no stream");
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    buf += dec.decode(value, { stream: !done });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line) { try { onEvent(JSON.parse(line) as E); } catch { /* skip a torn line */ } }
    }
    if (done) break;
  }
  if (buf.trim()) { try { onEvent(JSON.parse(buf) as E); } catch { /* ignore */ } }
}

export const streamStage = (id: string, stage: Stage, country: string | undefined, onEvent: (e: StageEvent) => void, signal: AbortSignal) =>
  ndjson<StageEvent>(`/api/runs/${id}/stages/${stage}`, country ? { country } : {}, onEvent, signal);

export const streamScreen = (id: string, body: { name: string; text?: string; pdfBase64?: string }, onEvent: (e: ScreenEvent) => void, signal: AbortSignal) =>
  ndjson<ScreenEvent>(`/api/batches/${id}/screen`, body, onEvent, signal);
