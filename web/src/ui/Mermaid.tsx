import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";

let seq = 0;
let ready: Promise<typeof import("mermaid").default> | undefined;
function load() {
  ready ??= import("mermaid").then((m) => {
    const dark = matchMedia("(prefers-color-scheme: dark)").matches && document.documentElement.getAttribute("data-theme") !== "light" || document.documentElement.getAttribute("data-theme") === "dark";
    m.default.initialize({ startOnLoad: false, securityLevel: "strict", theme: dark ? "dark" : "neutral", fontFamily: "Hanken Grotesk, sans-serif" });
    return m.default;
  });
  return ready;
}

/** Renders a diagram; a broken one shows its source instead of crashing. SVG comes from mermaid (strict mode) and is attached as parsed nodes. */
export function Diagram({ title, code }: { title: string; code: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    const id = `mm${++seq}`;
    load().then((m) => m.render(id, code)).then(({ svg }) => {
      if (!live || !host.current) return;
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("svg");
      host.current.replaceChildren(document.importNode(doc.documentElement, true));
    }).catch(() => { document.getElementById(`d${id}`)?.remove(); if (live) setFailed(true); });
    return () => { live = false; };
  }, [code]);
  return (
    <figure className="diagram">
      <figcaption className="label">{title}</figcaption>
      {failed
        ? <div><p className="small muted">{t.diagramBroken}</p><pre><code>{code}</code></pre></div>
        : <div ref={host} className="dg" role="img" aria-label={title}><span className="muted small">{t.loading}</span></div>}
    </figure>
  );
}
