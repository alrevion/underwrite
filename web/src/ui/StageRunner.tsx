import { useCallback, useEffect, useRef, useState } from "react";
import type { Run, Stage } from "../../../shared/contract";
import { api, ApiError, explain, streamStage } from "../api";
import { t } from "../i18n";
import { ErrorBox } from "./Parts";

const has: Record<Stage, (r: Run) => boolean> = {
  concept: (r) => !!r.concept, research: (r) => !!r.research, report: (r) => !!r.report,
  system: (r) => !!r.system, prototype: (r) => !!r.prototype, legal: (r) => !!r.legal,
};

/** Runs one long stage, listing live steps. If the stream dies it asks the server what really happened, never trusts the socket. */
export function StageRunner({ id, stage, country, onDone, title }: {
  id: string; stage: Stage; country?: string; onDone: (r: Run) => void; title?: string;
}) {
  const [steps, setSteps] = useState<string[]>([]);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(true);
  const ctl = useRef<AbortController | undefined>(undefined);
  const done = useRef(onDone);
  done.current = onDone;

  const start = useCallback(async (tries = 0) => {
    ctl.current?.abort();
    const c = new AbortController(); ctl.current = c;
    setSteps([]); setErr(undefined); setBusy(true);
    let finished = false, message: string | undefined;
    try {
      await streamStage(id, stage, country, (e) => {
        if (e.type === "progress") setSteps((s) => [...s, e.step]);
        else if (e.type === "done") { finished = true; done.current(e.run); }
        else message = e.message;
      }, c.signal);
    } catch (e) {
      if (c.signal.aborted) return;
      // After a reload the old request may still hold the step for a few seconds: wait instead of showing an error.
      if (e instanceof ApiError && e.status === 409 && tries < 30) { setTimeout(() => { if (!c.signal.aborted) void start(tries + 1); }, 5000); return; }
      message = explain(e);
    }
    if (c.signal.aborted || finished) return;
    try { // the stream ended without a verdict: ask the server
      const r = await api.getRun(id);
      if (has[stage](r)) { done.current(r); return; }
    } catch { /* fall through to the error */ }
    setErr(message ?? t.streamLost); setBusy(false);
  }, [id, stage, country]);

  useEffect(() => { void start(); return () => ctl.current?.abort(); }, [start]);

  return (
    <div className="stack" aria-live="polite">
      <h2>{title ?? t.stageTitle[stage]}</h2>
      <ol className="steps">
        {steps.map((s, i) => <li key={i} className={i === steps.length - 1 && busy ? "now" : "ok"}>{s}</li>)}
        {busy && !steps.length && <li className="now">{t.starting}</li>}
      </ol>
      {err && <ErrorBox text={err} onRetry={() => void start()} />}
    </div>
  );
}
