import { useState } from "react";
import { api, explain } from "../api";
import { t } from "../i18n";
import { go } from "../nav";
import { ErrorBox } from "../ui/Parts";

export function FundsHome() {
  const [thesis, setThesis] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  async function create() {
    setBusy(true); setErr(undefined);
    try { const b = await api.createBatch(thesis.trim()); go(`/funds/${b.id}`); } catch (e) { setErr(explain(e)); setBusy(false); }
  }
  return (
    <div>
      <p className="label">{t.fundsKicker}</p>
      <h1>{t.fundsTitle}</h1>
      <p className="lede">{t.fundsLine}</p>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); if (thesis.trim().length > 9) void create(); }}>
        <div><label className="l" htmlFor="thesis">{t.thesis}</label>
          <textarea id="thesis" className="field" rows={6} value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder={t.thesisPh} /></div>
        <button className="btn" disabled={busy || thesis.trim().length < 10}>{busy ? t.starting : t.createBatch}</button>
        {err && <ErrorBox text={err} onRetry={create} />}
      </form>
    </div>
  );
}
