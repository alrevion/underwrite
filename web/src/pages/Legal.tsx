import { useState } from "react";
import type { Run } from "../../../shared/contract";
import { money } from "../fmt";
import { t } from "../i18n";
import { Section } from "../ui/Parts";
import { StageRunner } from "../ui/StageRunner";
import { Sources } from "../ui/Claim";
import { FACTORS, split, vested, type Factor, type Founder, type Weights } from "../split";

export function Legal({ run, onRun }: { run: Run; onRun: (r: Run) => void }) {
  const [country, setCountry] = useState(run.legal?.country ?? "");
  const [go, setGo] = useState<string>();
  const l = run.legal;
  return (
    <div>
      <p className="note strong">{t.notLegal}</p>
      {!go && (
        <form className="row form" onSubmit={(e) => { e.preventDefault(); if (country.trim()) setGo(country.trim()); }}>
          <div className="grow"><label className="l" htmlFor="country">{t.country}</label>
            <input id="country" className="field" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t.countryPh} /></div>
          <button className="btn" disabled={!country.trim()}>{l ? t.rerun : t.runLegal}</button>
        </form>
      )}
      {go && <StageRunner id={run.id} stage="legal" country={go} onDone={(r) => { onRun(r); setGo(undefined); }} />}
      {l && !go && (
        <>
          <p className="muted small">{t.forCountry}: <b>{l.country}</b></p>
          <p>{l.jurisdictionAdvice}</p>
          <Section title={t.entitySteps}>
            <div className="tablewrap"><table className="comp">
              <thead><tr><th>{t.step}</th><th>{t.cost}</th><th>{t.time}</th><th>{t.source}</th></tr></thead>
              <tbody>{l.entitySteps.map((s, i) => (
                <tr key={i}><td data-l={t.step}>{s.step}</td><td data-l={t.cost} className="num">{money(s.costUsd)}</td><td data-l={t.time} className="num">{s.days} {t.days}</td><td data-l={t.source}><Sources urls={[s.source]} /></td></tr>
              ))}</tbody>
            </table></div>
          </Section>
          <Section title={t.equity}><p>{l.equityAdvice}</p></Section>
          <div className="cols sec">
            <div><h3>{t.docs}</h3><ul className="bul">{l.mustHaveDocs.map((d, i) => <li key={i}>{d}</li>)}</ul></div>
            <div><h3>{t.pitfalls}</h3><ul className="bul">{l.pitfalls.map((d, i) => <li key={i}>{d}</li>)}</ul></div>
          </div>
        </>
      )}
      <Calculator />
    </div>
  );
}

const blank = (n: number): Founder => ({ name: `${t.founder} ${n}`, score: { idea: 5, execution: 5, capital: 5, time: 5 } });

function Calculator() {
  const [fs, setFs] = useState<Founder[]>([blank(1), blank(2)]);
  const [w, setW] = useState<Weights>({ idea: 1, execution: 3, capital: 2, time: 4 });
  const out = split(fs, w);
  const upd = (i: number, f: Factor, v: number) => setFs(fs.map((x, j) => (j === i ? { ...x, score: { ...x.score, [f]: v } } : x)));
  return (
    <Section title={t.splitTitle} kicker={t.splitKicker}>
      <p className="small muted">{t.splitHow}</p>
      <fieldset className="weights"><legend className="label">{t.weights}</legend>
        {FACTORS.map((f) => (
          <label key={f}>{t.factors[f]} <input type="number" min={0} max={10} step={1} className="field mini" value={w[f]} onChange={(e) => setW({ ...w, [f]: Math.max(0, +e.target.value || 0) })} /></label>
        ))}
      </fieldset>
      <div className="founders">
        {fs.map((x, i) => (
          <div className="card" key={i}>
            <div className="row">
              <label className="sr" htmlFor={`fn${i}`}>{t.founder} {i + 1}</label>
              <input id={`fn${i}`} className="field name" value={x.name} onChange={(e) => setFs(fs.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
              {fs.length > 1 && <button className="btn small ghost" onClick={() => setFs(fs.filter((_, j) => j !== i))} aria-label={`${t.remove} ${x.name}`}>×</button>}
            </div>
            {FACTORS.map((f) => (
              <label className="slider" key={f}><span>{t.factors[f]}</span>
                <input type="range" min={0} max={10} value={x.score[f]} onChange={(e) => upd(i, f, +e.target.value)} /><b className="num">{x.score[f]}</b></label>
            ))}
            <p className="share num"><b>{out[i]!.toFixed(1)}%</b> <span className="small muted">{t.afterCliff}: {(out[i]! * vested(12)).toFixed(1)}% · {t.after2y}: {(out[i]! * vested(24)).toFixed(1)}%</span></p>
          </div>
        ))}
      </div>
      <div className="row">
        {fs.length < 6 && <button className="btn small ghost" onClick={() => setFs([...fs, blank(fs.length + 1)])}>{t.addFounder}</button>}
        <span className="num total">{t.sum}: {out.reduce((a, b) => a + b, 0).toFixed(1)}%</span>
      </div>
      <p className="small muted">{t.vestingNote}</p>
    </Section>
  );
}
