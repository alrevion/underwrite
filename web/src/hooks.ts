import { useCallback, useEffect, useState } from "react";
import type { Run } from "../../shared/contract";
import { api } from "./api";

const cache = new Map<string, Run>();
export const remember = (r: Run) => cache.set(r.id, r);

export function useRun(id: string) {
  const [run, setRun] = useState<Run | undefined>(cache.get(id));
  const [err, setErr] = useState<unknown>();
  const load = useCallback(async () => {
    setErr(undefined);
    try { const r = await api.getRun(id); cache.set(id, r); setRun(r); } catch (e) { setErr(e); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  const put = useCallback((r: Run) => { cache.set(r.id, r); setRun(r); }, []);
  return { run, err, reload: load, put };
}

export function useTheme() {
  const [theme, set] = useState<"light" | "dark" | "auto">(() => {
    try { const v = localStorage.getItem("uw-theme"); return v === "light" || v === "dark" ? v : "auto"; } catch { return "auto"; }
  });
  useEffect(() => {
    const el = document.documentElement;
    if (theme === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", theme);
    try { if (theme === "auto") localStorage.removeItem("uw-theme"); else localStorage.setItem("uw-theme", theme); } catch { /* private mode */ }
  }, [theme]);
  return [theme, set] as const;
}
