import { useEffect, useRef, useState } from "react";
import type { Run } from "../../../shared/contract";
import { api, explain } from "../api";
import { t } from "../i18n";
import { Clarity } from "../ui/Clarity";
import { Mic } from "../ui/Mic";
import { ErrorBox } from "../ui/Parts";


export function Interview({ run, onRun }: { run: Run; onRun: (r: Run) => void }) {
  const turn = run.interview!;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const [pending, setPending] = useState<string>();
  const end = useRef<HTMLDivElement>(null);
  // As in a messenger: the newest message and the answer box stay in view. The marker sits under the form.
  useEffect(() => { end.current?.scrollIntoView({ block: "end", behavior: "smooth" }); }, [run.transcript.length, pending, busy]);

  async function send(a: string) {
    const answer = a.trim();
    if (!answer || busy) return;
    setBusy(true); setErr(undefined); setPending(answer); setText("");
    try { onRun(await api.answer(run.id, answer)); }
    catch (e) { setErr(explain(e)); setText(answer); } // nothing typed is ever lost
    setPending(undefined); setBusy(false);
  }

  async function finish() {
    setBusy(true); setErr(undefined);
    try { onRun(await api.finishInterview(run.id)); }
    catch (e) { setErr(explain(e)); }
    setBusy(false);
  }

  const log = run.transcript;
  const lastQ = [...log].reverse().find((m) => m.role === "interviewer");
  const answered = log.filter((m) => m.role === "founder").length;

  return (
    <div className="interview">
      {turn.clarity && <Clarity turn={turn} />}
      <div className="chat" role="log" aria-live="polite">
        <div className="msg me"><span className="label">{t.you}</span>{run.idea}</div>
        {log.map((m, i) => <div key={i} className={`msg ${m.role === "founder" ? "me" : "ai"}`}><span className="label">{m.role === "founder" ? t.you : t.interviewer}</span>{m.text}</div>)}
        {lastQ?.text !== turn.message && !pending && <div className="msg ai"><span className="label">{t.interviewer}</span>{turn.message}</div>}
        {pending && <div className="msg me"><span className="label">{t.you}</span>{pending}</div>}
        {busy && <p className="muted small" role="status"><span className="pulse" aria-hidden="true" /> {t.thinking}</p>}
      </div>
      {!turn.done && (
        <form className="stack answer" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
          {turn.suggestions.length > 0 && (
            <div className="sugg" aria-label={t.suggestions}>
              {turn.suggestions.map((s) => <button type="button" key={s} disabled={busy} onClick={() => void send(s)}>{s}</button>)}
            </div>
          )}
          <label className="sr" htmlFor="ans">{t.yourAnswer}</label>
          <textarea id="ans" className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.yourAnswer}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(text); }} />
          <div className="row">
            <button className="btn" disabled={busy || !text.trim()}>{t.send}</button>
            <Mic onText={(s) => setText((v) => (v ? v + " " : "") + s)} onError={setErr} />
            {answered > 0 && <button type="button" className="linkbtn quiet" disabled={busy} onClick={() => void finish()}>{t.researchNow}</button>}
          </div>
          {err && <ErrorBox text={err} onRetry={() => void send(pending ?? text)} />}
        </form>
      )}
      <div ref={end} />
    </div>
  );
}
