import { useCallback, useEffect, useRef, useState } from "react";
import type { Batch, ScreeningResult } from "../../../shared/contract";
import { api, explain, streamScreen } from "../api";
import { money, score100 } from "../fmt";
import { t } from "../i18n";
import { Competitors, Criteria, MarketMath } from "../ui/Evidence";
import { ClaimView } from "../ui/Claim";
import { ErrorBox, Loading, Section } from "../ui/Parts";
import { Proto } from "../ui/Proto";

const fitRank = { fit: 0, partial: 1, out: 2 } as const;

function toBase64(f: File): Promise<string> {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result).split(",")[1] ?? "");
    r.onerror = () => no(r.error);
    r.readAsDataURL(f);
  });
}

function AddForm({ id, onBatch }: { id: string; onBatch: (b: Batch) => void }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [steps, setSteps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  const ctl = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => ctl.current?.abort(), []);

  async function run() {
    const c = new AbortController(); ctl.current = c;
    setBusy(true); setErr(undefined); setSteps([]);
    let done = false, msg: string | undefined;
    try {
      const body = file ? { name, pdfBase64: await toBase64(file) } : { name, text };
      await streamScreen(id, body, (e) => {
        if (e.type === "progress") setSteps((s) => [...s, e.step]);
        else if (e.type === "done") { done = true; onBatch(e.batch); setName(""); setText(""); setFile(undefined); }
        else msg = e.message;
      }, c.signal);
    } catch (e) { if (c.signal.aborted) return; msg = explain(e); }
    if (!done) { // connection died: the server may have finished anyway
      try { const b = await api.getBatch(id); onBatch(b); } catch { /* keep error */ }
      setErr(msg ?? t.streamLost);
    }
    setBusy(false);
  }
  const ok = name.trim() && (file || text.trim().length > 20);
  return (
    <form className="card stack" onSubmit={(e) => { e.preventDefault(); if (ok && !busy) void run(); }}>
      <h3>{t.addApplication}</h3>
      <div><label className="l" htmlFor="co">{t.company}</label><input id="co" className="field" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div><label className="l" htmlFor="ap">{t.pasteText}</label>
        <textarea id="ap" className="field" rows={5} value={text} disabled={!!file} onChange={(e) => setText(e.target.value)} /></div>
      <div><label className="l" htmlFor="pdf">{t.orPdf}</label>
        <input id="pdf" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0])} />
        {file && file.size > 6e6 && <p className="small" style={{ color: "var(--kill)" }}>{t.pdfBig}</p>}</div>
      <button className="btn" disabled={!ok || busy}>{busy ? t.screening : t.screen}</button>
      {steps.length > 0 && <ol className="steps" aria-live="polite">{steps.map((s, i) => <li key={i} className={i === steps.length - 1 && busy ? "now" : "ok"}>{s}</li>)}</ol>}
      {err && <ErrorBox text={err} onRetry={ok ? run : undefined} />}
    </form>
  );
}

function Detail({ s, batchId, onClose }: { s: ScreeningResult; batchId: string; onClose: () => void }) {
  return (
    <article className="detail">
      <button className="btn small ghost" onClick={onClose}>← {t.back}</button>
      <h2 style={{ marginTop: 12 }}>{s.company}</h2>
      <p className="row"><span className={`vtag v-${s.verdict}`}>{t.verdicts[s.verdict]}</span><span className={`fit ${s.thesisFit}`}>{t.fit[s.thesisFit]}</span><span className="num">{t.readiness} {score100(s.readiness)}</span></p>
      <p className="lede">{s.summary}</p>
      <p><b>{t.thesisFit}:</b> {s.thesisWhy}</p>
      <Section title={t.questions}><ol className="tests">{s.questionsForFounder.map((q, i) => <li key={i}>{q}</li>)}</ol></Section>
      <Section title={`${t.redFlags} (${s.redFlags.length})`}><div className="stack">{s.redFlags.map((c, i) => <ClaimView key={i} c={c} />)}</div></Section>
      <Section title={t.criteriaTitle}><Criteria items={s.criteria} /></Section>
      <Section title={t.marketTitle}><MarketMath m={s.market} /></Section>
      {s.competitors.length > 0 && <Section title={t.competitorsTitle}><Competitors items={s.competitors} /></Section>}
      {s.prototype && <Section title={t.tabs.prototype}><Proto html={s.prototype.html} src={`/api/batches/${batchId}/items/${s.id}/prototype`} /></Section>}
    </article>
  );
}

export function BatchPage({ id }: { id: string }) {
  const [batch, setBatch] = useState<Batch>();
  const [err, setErr] = useState<unknown>();
  const [sel, setSel] = useState<string>();
  const load = useCallback(async () => { setErr(undefined); try { setBatch(await api.getBatch(id)); } catch (e) { setErr(e); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  if (err && !batch) return <ErrorBox error={err} onRetry={load} />;
  if (!batch) return <Loading />;
  const open = batch.items.find((x) => x.id === sel);
  if (open) return <Detail s={open} batchId={id} onClose={() => setSel(undefined)} />;
  const rows = [...batch.items].sort((a, b) => b.readiness - a.readiness);
  return (
    <div>
      <p className="label">{t.batch}</p>
      <h1>{t.ranked}</h1>
      <p className="muted"><b>{t.thesis}:</b> {batch.thesis}</p>
      <p className="small muted noprint">{t.shareHint}: <span className="mono">{location.href}</span></p>
      {rows.length > 0 ? (
        <div className="tablewrap"><table className="comp rank">
          <thead><tr><th>#</th><th>{t.company}</th><th>{t.readiness}</th><th>{t.thesisFit}</th><th>{t.verdict}</th><th>{t.redFlags}</th></tr></thead>
          <tbody>{rows.map((s, i) => (
            <tr key={s.id}>
              <td data-l="#" className="num">{i + 1}</td>
              <td data-l={t.company}><button className="linkbtn" onClick={() => setSel(s.id)}>{s.company}</button><br /><span className="small muted">{money(s.market.somUsd)} SOM</span></td>
              <td data-l={t.readiness} className="num"><b>{score100(s.readiness)}</b></td>
              <td data-l={t.thesisFit}><span className={`fit ${s.thesisFit}`}>{t.fit[s.thesisFit]}</span></td>
              <td data-l={t.verdict}><span className={`vtag v-${s.verdict}`}>{t.verdicts[s.verdict]}</span></td>
              <td data-l={t.redFlags} className="num">{s.redFlags.length}</td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <p className="muted">{t.noApps}</p>}
      <div className="sec"><AddForm id={id} onBatch={setBatch} /></div>
    </div>
  );
}
