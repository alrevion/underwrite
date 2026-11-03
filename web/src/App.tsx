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
          <button className="themebtn" onClick={() => setTheme(next)} aria-label={`${t.theme}: ${theme}. ${t.switchTo} ${next}`} title={`${t.theme}: ${theme}`}>{theme === "dark" ? "☾" : theme === "light" ? "☀" : "◐"}</button>
        </nav>
      </header>
      <main><Page path={path} /></main>
    </div>
  );
}
