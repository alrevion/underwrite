import type { Claim } from "../../../shared/contract";
import { host, safeUrl } from "../fmt";
import { t } from "../i18n";

export function Chip({ label }: { label: Claim["label"] }) {
  return <span className={`chip ${label}`}><i className={`mk ${label}`} aria-hidden="true" />{t[label]}</span>;
}

export function Sources({ urls }: { urls: string[] }) {
  const ok = urls.map((u) => [u, safeUrl(u)] as const).filter((x): x is readonly [string, string] => !!x[1]);
  if (!ok.length) return null;
  return <span className="srcs">{ok.map(([u, h], i) => <a key={u + i} href={h} target="_blank" rel="noopener noreferrer nofollow">{host(u)}</a>)}</span>;
}

export function ClaimView({ c, label }: { c: Claim; label?: string }) {
  return (
    <div className="claim">
      {label && <span className="label">{label}</span>}
      <div><Chip label={c.label} /> <span>{c.text}</span> <Sources urls={c.sources} /></div>
      {c.label === "assumption" && c.howToTest && <div className="small muted">{t.cheapestTest}: {c.howToTest}</div>}
    </div>
  );
}
