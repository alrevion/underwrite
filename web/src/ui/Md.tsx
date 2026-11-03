import { Fragment, type ReactNode } from "react";
import { safeUrl } from "../fmt";

// Tiny safe Markdown: builds React elements only, so nothing from the model is ever parsed as HTML.
const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

function inline(s: string, k = ""): ReactNode[] {
  return s.split(INLINE).map((p, i) => {
    const key = `${k}${i}`;
    if (p.startsWith("**") && p.endsWith("**") && p.length > 4) return <strong key={key}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`") && p.length > 2) return <code key={key}>{p.slice(1, -1)}</code>;
    if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={key}>{p.slice(1, -1)}</em>;
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
    if (m) {
      const href = safeUrl(m[2]!);
      return href ? <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{m[1]}</a> : <Fragment key={key}>{m[1]}</Fragment>;
    }
    return <Fragment key={key}>{p}</Fragment>;
  });
}

const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export function Md({ src }: { src: string }) {
  const lines = src.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let i = 0, n = 0;
  while (i < lines.length) {
    const l = lines[i]!;
    const key = n++;
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("```")) {
      const buf: string[] = []; i++;
      while (i < lines.length && !lines[i]!.startsWith("```")) buf.push(lines[i++]!);
      i++; out.push(<pre key={key}><code>{buf.join("\n")}</code></pre>); continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(l);
    if (h) {
      const lv = Math.min(h[1]!.length + 1, 5);
      const Tag = `h${lv}` as "h2" | "h3" | "h4" | "h5";
      out.push(<Tag key={key}>{inline(h[2]!)}</Tag>); i++; continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(l.trim())) { out.push(<hr key={key} />); i++; continue; }
    if (l.trim().startsWith("|") && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? "")) {
      const head = cells(l); i += 2; const rows: string[][] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("|")) rows.push(cells(lines[i++]!));
      out.push(
        <div className="tablewrap" key={key}><table>
          <thead><tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
          <tbody>{rows.map((r, a) => <tr key={a}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody>
        </table></div>);
      continue;
    }
    const list = /^(\s*)([-*]|\d+\.)\s+/;
    if (list.test(l)) {
      const ordered = /^\s*\d+\./.test(l); const items: string[] = [];
      while (i < lines.length && list.test(lines[i]!)) items.push(lines[i++]!.replace(list, ""));
      const kids = items.map((it, j) => <li key={j}>{inline(it)}</li>);
      out.push(ordered ? <ol key={key}>{kids}</ol> : <ul key={key}>{kids}</ul>); continue;
    }
    if (l.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i]!.startsWith(">")) buf.push(lines[i++]!.replace(/^>\s?/, ""));
      out.push(<blockquote key={key}>{inline(buf.join(" "))}</blockquote>); continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{1,4}\s|```|>|\||\s*([-*]|\d+\.)\s)/.test(lines[i]!)) buf.push(lines[i++]!);
    if (!buf.length) { buf.push(lines[i++]!); }
    out.push(<p key={key}>{inline(buf.join(" "))}</p>);
  }
  return <div className="md">{out}</div>;
}
