export function money(n: number): string {
  const a = Math.abs(n);
  const f = (v: number, s: string) => `$${v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")}${s}`;
  if (a >= 1e12) return f(n / 1e12, "T");
  if (a >= 1e9) return f(n / 1e9, "B");
  if (a >= 1e6) return f(n / 1e6, "M");
  if (a >= 1e3) return f(n / 1e3, "K");
  return `$${Math.round(n)}`;
}
export const count = (n: number) => n.toLocaleString("en-US");
export const pct = (n: number) => `${+(n * 100).toFixed(1)}%`;
/** readiness and viability are 0..100 integers computed by the worker */
export const score100 = (v: number) => Math.round(v);
export const safeUrl = (u: string): string | null => {
  try { const x = new URL(u); return x.protocol === "http:" || x.protocol === "https:" ? x.href : null; } catch { return null; }
};
export const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
