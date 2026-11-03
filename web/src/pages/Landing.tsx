import { useState } from "react";
import { api, explain } from "../api";
import { remember } from "../hooks";
import { t } from "../i18n";
import { go } from "../nav";
import { ErrorBox } from "../ui/Parts";
import { Mic } from "../ui/Mic";
import { Chip, Sources } from "../ui/Claim";
import { LedgerRow } from "../ui/Evidence";

// A real result: one run on the real model, the figures unchanged.
function Example() {
  const x = t.example;
  return (
    <aside className="dossier v-hold" aria-label={x.caption}>
      <span className="label">{x.caption}</span>
      <p className="idea">{x.idea}</p>
      <div className="word">{t.verdicts.hold}</div>
      <p className="headline">{x.headline}</p>
      <div className="ledger">
        <LedgerRow label={x.schools} value="1,604" />
        <LedgerRow op="×" label={x.price} value="$480" />
        <LedgerRow op="=" label={t.tam} value="$770K" kind="sum" />
        <LedgerRow op="×" label={t.reach} value="25%" />
        <LedgerRow op="×" label={t.winRate} value="10%" />
        <LedgerRow op="=" label={t.som} value="$19K" kind="sum" />
      </div>
      <ul className="claims">
        <li className="claim"><Chip label="fact" /> {x.fact} <Sources urls={["https://pitchbook.com/profiles/company/109058-59"]} /></li>
        <li className="claim"><Chip label="estimate" /> {x.estimate} <Sources urls={["https://yep.uz/en/2026/08/uzbekistan-schools-and-students-since-independence/", "https://qazinform.com/news/no-of-private-schools-rises-37fold-in-five-years-in-kazakhstan-bafb70"]} /></li>
        <li className="claim"><Chip label="assumption" /> {x.assumption}</li>
      </ul>
    </aside>
  );
}

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
      <div>
      <h1>{t.landingTitle}</h1>
      <p className="lede">{t.landingLine}</p>
      <form onSubmit={(e) => { e.preventDefault(); if (idea.trim().length > 5) void start(); }} className="stack">
        <div>
          <label className="l" htmlFor="idea">{t.describe}</label>
          <textarea id="idea" className="field" rows={6} value={idea} maxLength={4000} onChange={(e) => setIdea(e.target.value)} placeholder={t.ideaPlaceholder} />
        </div>
        <div className="row">
          <button className={`btn${busy ? " busy" : ""}`} aria-busy={busy} disabled={busy || idea.trim().length < 6}>{busy && <span className="spin" aria-hidden="true" />}{busy ? t.preparing : t.start}</button>
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
      </div>
      <Example />
    </div>
  );
}
