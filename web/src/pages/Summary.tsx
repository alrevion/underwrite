import type { Run } from "../../../shared/contract";
import { money, score100 } from "../fmt";
import { t } from "../i18n";
import { Criteria, Competitors, MarketMath } from "../ui/Evidence";
import { Section } from "../ui/Parts";
import { Sources } from "../ui/Claim";

function Gauge({ label, v }: { label: string; v: number }) {
  const p = score100(v);
  return (
    <div className="gauge" role="img" aria-label={`${label} ${p} / 100`}>
      <span className="label">{label}</span>
      <span className="big num">{p}<small>/100</small></span>
      <span className="bar"><i style={{ width: `${p}%` }} /></span>
    </div>
  );
}

export function Summary({ run }: { run: Run }) {
  const r = run.report!, rs = run.research;
  const cost = r.nextTests.reduce((a, x) => a + x.costUsd, 0);
  return (
    <div>
      <header className={`verdict v-${r.verdict}`}>
        <span className="label">{t.verdict}</span>
        <div className="word" data-testid="verdict">{t.verdicts[r.verdict]}</div>
        <p className="headline">{r.headline}</p>
        <p className="why">{r.verdictWhy}</p>
      </header>

      <div className="gauges">
        <Gauge label={t.readiness} v={r.readiness} />
        <Gauge label={t.viability} v={r.viability} />
      </div>
      <details className="explain" open>
        <summary>{t.notProbability}</summary>
        <p>{t.howComputed}</p>
        <Criteria items={r.criteria} />
      </details>

      {rs && (
        <>
          <Section title={t.marketTitle} kicker={t.marketKicker}><MarketMath m={rs.market} /></Section>
          <Section title={t.competitorsTitle}>
            <Competitors items={rs.competitors} />
            <p className="note"><b className="num">{rs.downgraded}</b> {t.demoted(rs.downgraded)}</p>
            <p className="small muted">{rs.positioning}</p>
            {rs.gaps.length > 0 && <><h3>{t.gaps}</h3><ul className="bul">{rs.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul></>}
            {rs.sources.length > 0 && (
              <details className="small"><summary>{t.allSources} ({rs.sources.length})</summary>
                <ul className="bul">{rs.sources.map((s) => <li key={s.url}>{s.title} <Sources urls={[s.url]} /></li>)}</ul>
              </details>
            )}
          </Section>
        </>
      )}

      <Section title={t.risks}>
        <ul className="plain">{r.risks.map((x, i) => (
          <li key={i}>{x.critical && <span className="chip crit">{t.critical}</span>} {x.risk}<br /><span className="small muted">{t.test}: {x.test}</span></li>
        ))}</ul>
      </Section>
      <Section title={t.nextTests} kicker={`${t.total} ${money(cost)} · ${r.nextTests.reduce((a, x) => a + x.days, 0)} ${t.days}`}>
        <ol className="tests">{r.nextTests.map((x, i) => (
          <li key={i}><b>{x.test}</b><br /><span className="small muted">{t.passIf}: {x.passIf}</span><span className="cost num">{money(x.costUsd)} · {x.days} {t.days}</span></li>
        ))}</ol>
      </Section>
    </div>
  );
}
