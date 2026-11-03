import type { Run } from "../../../shared/contract";
import { money, score100 } from "../fmt";
import { t } from "../i18n";
import { Criteria, Competitors, MarketMath } from "../ui/Evidence";
import { Section } from "../ui/Parts";
import { Sources } from "../ui/Claim";

function Metric({ label, value, of }: { label: string; value: string; of?: string }) {
  return <div className="ccell"><span className="label">{label}</span><span className="cval">{value}{of && <small> {of}</small>}</span></div>;
}

// Share of research claims backed by a source the search really returned.
function sourced(rs: NonNullable<Run["research"]>): number {
  const claims = [rs.market.customersClaim, rs.market.priceClaim, ...rs.market.drivers, ...rs.competitors.flatMap((c) => [c.pricing, c.revenue, c.funding])];
  return claims.length ? Math.round((100 * claims.filter((c) => c.label === "fact").length) / claims.length) : 0;
}

export function Summary({ run }: { run: Run }) {
  const r = run.report!, rs = run.research;
  const cost = r.nextTests.reduce((a, x) => a + x.costUsd, 0);
  return (
    <div>
      <header className={`verdict v-${r.verdict}`}>
        <div className="vhead">
          <div>
            <div className="word" data-testid="verdict" aria-label={`${t.verdict}: ${t.verdicts[r.verdict]}`}>{t.verdicts[r.verdict]}</div>
            <p className="headline">{r.headline}</p>
            <p className="why">{r.verdictWhy}</p>
          </div>
          <div className="metrics">
            <Metric label={t.readiness} value={String(score100(r.readiness))} of="/ 100" />
            <Metric label={t.viability} value={String(score100(r.viability))} of="/ 100" />
            {rs && <Metric label={t.sourcedFacts} value={`${sourced(rs)}%`} />}
            {rs && <Metric label={t.som} value={money(rs.market.somUsd)} />}
            <Metric label={t.criticalRisks} value={String(r.risks.filter((x) => x.critical).length)} />
            <Metric label={t.costToProve} value={money(cost)} />
          </div>
        </div>
      </header>

      <Section title={t.criteriaTitle}>
        <div className="stripline">
          <div className="strip" role="img" aria-label={r.criteria.map((c) => `${t.criteria[c.id]}: ${t[c.rating]}`).join(", ")}>
            {r.criteria.map((c) => <i key={c.id} className={`mk ${c.rating}`} title={`${t.criteria[c.id]}: ${t[c.rating]}`} />)}
          </div>
          <div className="legend">
            <span><i className="mk strong" aria-hidden="true" />{t.strong}</span>
            <span><i className="mk weak" aria-hidden="true" />{t.weak}</span>
            <span><i className="mk missing" aria-hidden="true" />{t.missing}</span>
          </div>
        </div>
        <details className="explain">
          <summary>{t.notProbability}</summary>
          <p>{t.howComputed}</p>
        </details>
        <Criteria items={r.criteria} />
      </Section>

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
      <Section title={t.nextTests} kicker={`${t.total}: ${money(cost)}, ${r.nextTests.reduce((a, x) => a + x.days, 0)} ${t.days}`}>
        <ol className="tests">{r.nextTests.map((x, i) => (
          <li key={i}><b>{x.test}</b><br /><span className="small muted">{t.passIf}: {x.passIf}</span><span className="cost num">{money(x.costUsd)}, {x.days} {t.days}</span></li>
        ))}</ol>
      </Section>
    </div>
  );
}
