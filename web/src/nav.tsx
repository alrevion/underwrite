import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

export function go(path: string) {
  history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
export function usePath(): string {
  const [p, setP] = useState(location.pathname);
  useEffect(() => { const f = () => setP(location.pathname); addEventListener("popstate", f); return () => removeEventListener("popstate", f); }, []);
  return p;
}
export function Link({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const click = (e: MouseEvent) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); go(to); };
  return <a href={to} onClick={click} className={className}>{children}</a>;
}
