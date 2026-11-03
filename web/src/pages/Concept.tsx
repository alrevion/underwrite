import type { Concept } from "../../../shared/contract";
import { t } from "../i18n";
import { Tagged } from "../ui/Tagged";
import { Section } from "../ui/Parts";

const List = ({ items }: { items: string[] }) => <ul className="plain tags">{items.map((x, i) => <li key={i}><Tagged text={x} /></li>)}</ul>;

export function ConceptReview({ c, onGo }: { c: Concept; onGo: () => void }) {
  return (
    <article>
      <p className="label">{t.conceptKicker}</p>
      <h1>{c.name}</h1>
      <p className="lede">{c.oneLiner}</p>
      <div className="cols">
        <div className="card"><span className="label">{t.firstUser}</span><p><Tagged text={c.firstUser} /></p></div>
        <div className="card"><span className="label">{t.job}</span><p><Tagged text={c.job} /></p></div>
      </div>
      <div className="cols">
        <div><h3>{t.pains}</h3><List items={c.pains} /></div>
        <div><h3>{t.gains}</h3><List items={c.gains} /></div>
      </div>
      <Section title={t.features}>
        <ul className="plain">{c.features.map((f) => <li key={f.name}><b>{f.name}</b><br /><span className="muted"><Tagged text={f.why} /></span></li>)}</ul>
      </Section>
      <Section title={t.improvements}>
        <ul className="plain">{c.improvements.map((f) => <li key={f.name}>{f.reframing && <span className="chip estimate">{t.reframing}</span>} <b>{f.name}</b><br /><span className="muted"><Tagged text={f.why} /></span></li>)}</ul>
      </Section>
      <div className="cols sec">
        <div><h3>{t.outOfScope}</h3><List items={c.outOfScope} /></div>
        <div><h3>{t.usp}</h3><p>{c.usp}</p><h3>{t.businessModel}</h3><p>{c.businessModel}</p></div>
      </div>
      <div className="card"><span className="label">{t.firstTest}</span><p style={{ margin: "6px 0 0" }}>{c.firstTest}</p></div>
      <div className="cta"><button className="btn" onClick={onGo}>{t.researchIt}</button><p className="small muted">{t.researchNote}</p></div>
    </article>
  );
}
