import { useTheme } from "./hooks";
import { t } from "./i18n";
import { Link, usePath } from "./nav";
import { BatchPage } from "./pages/Batch";
import { FundsHome } from "./pages/Funds";
import { Landing } from "./pages/Landing";
import { RunPage } from "./pages/RunPage";

function Page({ path }: { path: string }) {
  const run = /^\/r\/([\w-]+)\/?$/.exec(path);
  if (run) return <RunPage key={run[1]} id={run[1]!} />;
  const batch = /^\/funds\/([\w-]+)\/?$/.exec(path);
  if (batch) return <BatchPage key={batch[1]} id={batch[1]!} />;
  if (/^\/funds\/?$/.test(path)) return <FundsHome />;
  return <Landing />;
}

function ThemeIcon({ theme }: { theme: string }) {
  const c = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  if (theme === "dark") return <svg {...c}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
  if (theme === "light") return <svg {...c}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  return <svg {...c}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
}

export function App() {
  const path = usePath();
  const [theme, setTheme] = useTheme();
  const next = theme === "auto" ? "dark" : theme === "dark" ? "light" : "auto";
  return (
    <div className="shell">
      <header className="top noprint">
        <Link to="/" className="brand"><i aria-hidden="true" />Underwrite</Link>
        <nav>
          {path.startsWith("/funds") ? <Link to="/">{t.forFounders}</Link> : <Link to="/funds">{t.forFunds}</Link>}
          <button className="themebtn" onClick={() => setTheme(next)} aria-label={`${t.theme}: ${theme}. ${t.switchTo} ${next}`} title={`${t.theme}: ${theme}`}><ThemeIcon theme={theme} /></button>
        </nav>
      </header>
      <main><Page path={path} /></main>
    </div>
  );
}
