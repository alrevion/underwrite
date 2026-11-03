import { useState } from "react";
import { api, explain } from "../api";
import { remember } from "../hooks";
import { t } from "../i18n";
import { Link, go } from "../nav";
import { ErrorBox } from "../ui/Parts";
import { Mic } from "../ui/Mic";

export function Landing() {
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  async function start() {
    setBusy(true); setErr(undefined);
    try { const run = await api.createRun(idea.trim()); remember(run); go(`/r/${run.id}`); }
    catch (e) { setErr(explain(e)); setBusy(false); }
  }

  return (
    <div className="landing">
      <p className="label">{t.kicker}</p>
      <h1>{t.landingTitle}</h1>
      <p className="lede">{t.landingLine}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (idea.trim().length > 5) void start(); }} className="stack">
        <div>
          <label className="l" htmlFor="idea">{t.describe}</label>
          <textarea id="idea" className="field" rows={6} value={idea} maxLength={4000} onChange={(e) => setIdea(e.target.value)} placeholder={t.ideaPlaceholder} />
        </div>
        <div className="row">
          <button className="btn" disabled={busy || idea.trim().length < 6}>{busy ? t.starting : t.start}</button>
          <Mic onText={(s) => setIdea((v) => (v ? v + " " : "") + s)} onError={setErr} />
        </div>
        {err && <ErrorBox text={err} onRetry={idea.trim().length > 5 ? start : undefined} />}
      </form>
      <div className="samples">
        <span className="label">{t.tryOne}</span>
        <ul className="plain">
          {t.samples.map((s) => <li key={s}><button type="button" className="sample" onClick={() => setIdea(s)}>{s}</button></li>)}
        </ul>
      </div>
      <p className="funds-link"><Link to="/funds">{t.forFunds} →</Link></p>
    </div>
  );
}
