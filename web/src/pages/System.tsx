import type { SystemDesign } from "../../../shared/contract";
import { t } from "../i18n";
import { Diagram } from "../ui/Mermaid";
import { Section } from "../ui/Parts";

export function System({ s }: { s: SystemDesign }) {
  return (
    <div>
      <p className="lede">{s.overview}</p>
      <Section title={t.logic}>
        <ul className="plain">{s.businessLogic.map((r, i) => <li key={i}><b>{r.rule}</b><br /><span className="muted">{r.why}</span></li>)}</ul>
      </Section>
      <Section title={t.diagrams}>
        <div className="stack">{s.diagrams.map((d, i) => <Diagram key={i} title={d.title} code={d.mermaid} />)}</div>
      </Section>
      <Section title={t.entities}>
        <div className="cols">{s.entities.map((e) => (
          <div className="card" key={e.name}><h3 className="mono">{e.name}</h3><ul className="plain mono small">{e.fields.map((f) => <li key={f}>{f}</li>)}</ul></div>
        ))}</div>
      </Section>
      <Section title={t.apis}>
        <ul className="plain">{s.apis.map((a, i) => <li key={i}><code>{a.route}</code> <span className="muted">{a.purpose}</span></li>)}</ul>
      </Section>
      <Section title={t.stack}>
        <div className="tablewrap"><table className="comp">
          <thead><tr><th>{t.part}</th><th>{t.choice}</th><th>{t.why}</th></tr></thead>
          <tbody>{s.stack.map((x, i) => <tr key={i}><td data-l={t.part}><b>{x.part}</b></td><td data-l={t.choice}>{x.choice}</td><td data-l={t.why} className="muted">{x.why}</td></tr>)}</tbody>
        </table></div>
      </Section>
      <Section title={t.buildOrder}><ol className="tests">{s.buildOrder.map((b, i) => <li key={i}>{b}</li>)}</ol></Section>
    </div>
  );
}
