const KIND: [RegExp, "fact" | "estimate" | "assumption"][] = [
  [/^(fact|факт)/i, "fact"],
  [/^(estimate|оценк)/i, "estimate"],
];

/** The model often opens a line with "[Assumption, not verified: ...]". Shown as the evidence mark, not raw brackets. */
export function Tagged({ text }: { text: string }) {
  const m = /^\s*\[([^\]]{1,120})\]\s*/.exec(text);
  if (!m) return <>{text}</>;
  const kind = KIND.find(([re]) => re.test(m[1]!))?.[1] ?? "assumption";
  return <span className="tagged"><span className={`tag ${kind}`}><i className={`mk ${kind}`} aria-hidden="true" />{m[1]}</span> {text.slice(m[0].length)}</span>;
}
