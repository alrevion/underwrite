import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { t } from "../i18n";

/** Sandboxed prototype. No allow-same-origin: the page inside cannot touch our origin, cookies or storage. */
export function Proto({ html, runId, src, onRepaired }: { html: string; runId?: string; src?: string; onRepaired?: (html: string) => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [mode, setMode] = useState<"phone" | "desktop">("phone");
  const [doc, setDoc] = useState(html);
  const [ver, setVer] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [repairFailed, setRepairFailed] = useState(false);
  const tried = useRef(false);
  useEffect(() => { setDoc(html); tried.current = false; }, [html]);

  useEffect(() => {
    async function onMsg(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow) return;
      const d = e.data as { type?: string; error?: unknown; message?: unknown } | null;
      if (d?.type !== "proto-error" || tried.current || !runId) return;
      tried.current = true;
      try {
        const r = await api.repair(runId, String(d.error ?? d.message ?? "").slice(0, 2000));
        const next = r.prototype?.html;
        if (next) { setDoc(next); setVer((v) => v + 1); setFixed(true); onRepaired?.(next); }
      } catch { setRepairFailed(true); }
    }
    addEventListener("message", onMsg);
    return () => removeEventListener("message", onMsg);
  }, [runId, onRepaired]);

  return (
    <div>
      <div className="row noprint" role="group" aria-label={t.viewport}>
        <button className={`btn small ${mode === "phone" ? "" : "ghost"}`} aria-pressed={mode === "phone"} onClick={() => setMode("phone")}>{t.phone}</button>
        <button className={`btn small ${mode === "desktop" ? "" : "ghost"}`} aria-pressed={mode === "desktop"} onClick={() => setMode("desktop")}>{t.desktop}</button>
      </div>
      <p className="small muted">{t.protoNote}</p>
      {fixed && <p className="note" role="status">{t.autoFixed}</p>}
      {repairFailed && <p className="note" role="status">{t.repairFailed}</p>}
      <div className={`stage ${mode}`}>
        <div className="device">
          {/* Served by the API with its own CSP: the app CSP would block inline scripts in srcDoc. */}
          <iframe ref={frame} title={t.protoTitle} sandbox="allow-scripts" src={src ?? `/api/runs/${runId}/prototype?v=${ver}`} />
        </div>
      </div>
    </div>
  );
}
