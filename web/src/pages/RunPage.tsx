import { useState } from "react";
import type { Run, Stage } from "../../../shared/contract";
import { useRun } from "../hooks";
import { t } from "../i18n";
import { ConceptReview } from "./Concept";
import { Interview } from "./Interview";
import { Legal } from "./Legal";
import { Report } from "./Report";
import { Summary } from "./Summary";
import { System } from "./System";
import { Proto } from "../ui/Proto";
import { ErrorBox, Loading } from "../ui/Parts";
import { StageRunner } from "../ui/StageRunner";

const TABS = ["summary", "report", "system", "prototype", "legal"] as const;
type Tab = (typeof TABS)[number];

function Tabs({ run, put }: { run: Run; put: (r: Run) => void }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [want, setWant] = useState<Stage>();
  const pick = (x: Tab) => { setTab(x); setWant(undefined); };
  const missing = (s: "system" | "prototype") => (want === s ? <StageRunner id={run.id} stage={s} onDone={(r) => { put(r); setWant(undefined); }} />
    : <div className="card"><p>{t.notGenerated}</p><button className="btn" onClick={() => setWant(s)}>{t.generate}</button></div>);
  return (
    <div>
      <div className="tabs noprint" role="tablist" aria-label={t.sections}>
        {TABS.map((x) => <button key={x} role="tab" id={`tab-${x}`} aria-selected={tab === x} aria-controls="panel" tabIndex={tab === x ? 0 : -1} onClick={() => pick(x)}
          onKeyDown={(e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const n = TABS[(TABS.indexOf(x) + d + TABS.length) % TABS.length]!; pick(n); document.getElementById(`tab-${n}`)?.focus(); } }}>{t.tabs[x]}</button>)}
      </div>
      <div id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "summary" && <Summary run={run} />}
        {tab === "report" && <Report run={run} />}
        {tab === "system" && (run.system ? <System s={run.system} /> : missing("system"))}
        {tab === "prototype" && (run.prototype ? <Proto html={run.prototype.html} runId={run.id} /> : missing("prototype"))}
        {tab === "legal" && <Legal run={run} onRun={put} />}
      </div>
    </div>
  );
}

export function RunPage({ id }: { id: string }) {
  const { run, err, reload, put } = useRun(id);
  const key = `uw-go-${id}`;
  const [go, setGo0] = useState(() => { try { return sessionStorage.getItem(key) === "1"; } catch { return false; } });
  const setGo = (v: boolean) => { setGo0(v); try { sessionStorage.setItem(key, v ? "1" : "0"); } catch { /* private mode */ } };
  if (err && !run) return <ErrorBox error={err} onRetry={reload} />;
  if (!run) return <Loading />;
  if (!run.concept) {
    if (run.interview && !run.interview.done) return <Interview run={run} onRun={put} />;
    return <StageRunner id={id} stage="concept" onDone={put} />;
  }
  if (!run.report) {
    if (!go && !run.research) return <ConceptReview c={run.concept} onGo={() => setGo(true)} />;
    if (!run.research) return <StageRunner id={id} stage="research" onDone={put} />;
    return <StageRunner id={id} stage="report" onDone={put} />;
  }
  return <Tabs run={run} put={put} />;
}
