import type { Competitor, Market, ReportModel } from "../../../shared/contract";
import { count, money, pct } from "../fmt";
import { t } from "../i18n";
import { ClaimView } from "./Claim";

// Mirrors worker/ai/provenance.ts (weights sum to 100). Keep in sync.
const RW: Record<string, number> = { problem: 15, market: 15, business_model: 12, team: 12, product: 8, competition: 8, traction: 8, strategy: 5, financials: 5, valuation: 4, exit: 4, deal_structure: 4 };
const VW: Record<string, number> = { problem: 30, market: 30, competition: 20, business_model: 20 };

export function Criteria({ items }: { items: ReportModel["criteria"] }) {
  return (
    <ul className="criteria">
      {items.map((c) => (
        <li key={c.id}>
          <div className="crow"><b>{t.criteria[c.id]}</b><span className="small muted num">{t.weight} {RW[c.id]}{VW[c.id] ? ` · ${t.viability} ${VW[c.id]}` : ""}</span><span className={`rate ${c.rating}`}><i className={`mk ${c.rating}`} aria-hidden="true" />{t[c.rating]}</span></div>
          <p className="small">{c.evidence}</p>
          {c.nextStep && <p className="small muted">→ {c.nextStep}</p>}
        </li>
      ))}
    </ul>
  );
}

export function LedgerRow({ op, label, value, kind }: { op?: string; label: string; value: string; kind?: "sum" | "last" }) {
  return <div className={`lrow ${kind ?? ""}`}><span className="op" aria-hidden="true">{op}</span><span className="ll">{label}</span><span>{value}</span></div>;
}

export function MarketMath({ m }: { m: Market }) {
  return (
    <div>
      <p className="small muted">{m.customerType}, {m.region}</p>
      <div className="mgrid">
        <div className="ledger" role="group" aria-label={t.marketMath}>
          <LedgerRow label={t.customers} value={count(m.customers)} />
          <LedgerRow op="×" label={t.pricePerYear} value={money(m.annualPriceUsd)} />
          <LedgerRow op="=" label={t.tam} value={money(m.tamUsd)} kind="sum" />
          <LedgerRow op="×" label={t.reach} value={pct(m.reachableShare)} />
          <LedgerRow op="=" label={t.sam} value={money(m.samUsd)} kind="sum" />
          <LedgerRow op="×" label={t.winRate} value={pct(m.winRate)} />
          <LedgerRow op="=" label={t.som} value={money(m.somUsd)} kind="sum" />
        </div>
        <div className="stack">
          <ClaimView c={m.customersClaim} label={t.customers} />
          <ClaimView c={m.priceClaim} label={t.pricePerYear} />
          {m.drivers.map((d, i) => <ClaimView key={i} c={d} label={t.driver} />)}
        </div>
      </div>
    </div>
  );
}

export function Competitors({ items }: { items: Competitor[] }) {
  return (
    <div className="tablewrap"><table className="comp">
      <thead><tr><th>{t.competitor}</th><th>{t.pricing}</th><th>{t.revenue}</th><th>{t.funding}</th><th>{t.gap}</th></tr></thead>
      <tbody>
        {items.map((c, i) => (
          <tr key={i}>
            <td data-l={t.competitor}><b>{c.name}</b><span className="kind">{t.kinds[c.kind]}</span><span className="small muted">{c.whoItServes}</span></td>
            <td data-l={t.pricing}><ClaimView c={c.pricing} /></td>
            <td data-l={t.revenue}><ClaimView c={c.revenue} /></td>
            <td data-l={t.funding}><ClaimView c={c.funding} /></td>
            <td data-l={t.gap}><span className="small"><b>{t.strength}:</b> {c.strength}</span><br /><span className="small"><b>{t.gapLabel}:</b> {c.gap}</span></td>
          </tr>
        ))}
      </tbody>
    </table></div>
  );
}
