import { useState } from "react";
import { api, explain } from "../api";
import { t } from "../i18n";
import { go } from "../nav";
import { ErrorBox } from "../ui/Parts";
import { Chip } from "../ui/Claim";

// A real result: one application screened by the real model. The application itself was written as a test.
function Example() {
  const x = t.fundExample;
  return (
    <aside className="dossier v-kill" aria-label={x.caption}>
      <span className="label">{x.caption}</span>
      <p className="idea">{x.idea}</p>
      <div className="word">{t.verdicts.kill}</div>
      <p className="headline">{x.headline}</p>
      <p className="scores"><span>{t.readiness} <b className="num">26</b> / 100</span><span>{x.fit}</span></p>
      <span className="label">{t.redFlags}</span>
      <ul className="claims">
        <li className="claim"><Chip label="fact" /> {x.flag1}</li>
        <li className="claim"><Chip label="estimate" /> {x.flag2}</li>
        <li className="claim"><Chip label="assumption" /> {x.flag3}</li>
      </ul>
    </aside>
  );
}

export function FundsHome() {
  const [thesis, setThesis] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();
  async function create() {
    setBusy(true); setErr(undefined);
    try { const b = await api.createBatch(thesis.trim()); go(`/funds/${b.id}`); } catch (e) { setErr(explain(e)); setBusy(false); }
  }
  return (
    <div className="landing">
      <div>
      <h1>{t.fundsTitle}</h1>
      <p className="lede">{t.fundsLine}</p>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); if (thesis.trim().length > 9) void create(); }}>
        <div><label className="l" htmlFor="thesis">{t.thesis}</label>
          <textarea id="thesis" className="field" rows={6} value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder={t.thesisPh} /></div>
        <button className={`btn${busy ? " busy" : ""}`} aria-busy={busy} disabled={busy || thesis.trim().length < 10}>{busy && <span className="spin" aria-hidden="true" />}{busy ? t.starting : t.createBatch}</button>
        {err && <ErrorBox text={err} onRetry={create} />}
      </form>
      </div>
      <Example />
    </div>
  );
}
