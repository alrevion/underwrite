import type { ReactNode } from "react";
import { explain } from "../api";
import { t } from "../i18n";

export function ErrorBox({ error, onRetry, text }: { error?: unknown; onRetry?: () => void; text?: string }) {
  return (
    <div className="err" role="alert">
      <b>{t.problem}</b> {text ?? explain(error)}
      {onRetry && <div style={{ marginTop: 10 }}><button className="btn small" onClick={onRetry}>{t.retry}</button></div>}
    </div>
  );
}

export function Loading({ text }: { text?: string }) {
  return <p className="muted" role="status"><span className="pulse" aria-hidden="true" /> {text ?? t.loading}</p>;
}

export function Section({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return <section className="sec"><h2>{title}</h2>{kicker && <p className="sec-sub">{kicker}</p>}<div className="sec-body">{children}</div></section>;
}
