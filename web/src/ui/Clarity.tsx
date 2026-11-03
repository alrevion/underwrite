import { useState } from "react";
import { CLARITY, type InterviewTurn } from "../../../shared/contract";
import { t } from "../i18n";

/** One horizontal tile: what we understand so far. Explanations stay hidden until asked for. */
export function Clarity({ turn }: { turn: InterviewTurn }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="clarity" aria-label={t.clarityTitle}>
      <div className="ctile">
        <div className="ccell total"><span className="label">{t.clarityTotal}</span><span className="cval">{turn.overall}%</span></div>
        {CLARITY.map((d) => <div className="ccell" key={d}><span className="label">{t.clarity[d]}</span><span className="cval">{turn.clarity[d].score}%</span></div>)}
      </div>
      <button type="button" className="linkbtn quiet ctoggle" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? t.clarityHide : t.clarityShow}</button>
      {open && (
        <div className="cdetails">
          <p className="small muted">{t.clarityGate}</p>
          <dl>{CLARITY.map((d) => <div key={d}><dt>{t.clarity[d]}</dt><dd>{turn.clarity[d].why}</dd></div>)}</dl>
        </div>
      )}
    </section>
  );
}
