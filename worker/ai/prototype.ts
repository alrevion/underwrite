import type { Prototype, Run } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse, type Progress } from "./muse";
import { PROTOTYPE, REPAIR, langLine } from "./prompts";
import { runContext } from "./stages";

const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:">`;
const REPORTER = `<script id="uw-err">window.onerror=function(m,s,l){parent.postMessage({type:'proto-error',message:String(m)+(l?' (line '+l+')':'')},'*')};window.addEventListener('unhandledrejection',function(e){parent.postMessage({type:'proto-error',message:String(e.reason)},'*')});document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a&&/^\\s*(https?:)?\\/\\//i.test(a.getAttribute('href')||''))e.preventDefault()},true);document.addEventListener('submit',function(e){var a=e.target&&e.target.getAttribute&&e.target.getAttribute('action');if(a&&/^\\s*(https?:)?\\/\\//i.test(a))e.preventDefault()},true);</script>`;
const FALLBACK_IMG = "data:image/svg+xml;base64," + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#e5e7eb"/></svg>`);

// Strip fences, drop any earlier CSP/reporter (idempotent), inject ours first in <head>.
export function sanitize(raw: string): string {
  let html = raw.trim().replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "").trim();
  if (!/<\/html>\s*$/i.test(html)) throw new Error("Prototype HTML is incomplete (no closing </html>)");
  html = html
    .replace(/<meta[^>]+http-equiv=["']?(?:content-security-policy|refresh)["']?[^>]*>/gi, "")
    .replace(/<script id="uw-err">[\s\S]*?<\/script>/i, "");
  const inject = CSP + REPORTER;
  if (/<head(?=[\s>])[^>]*>/i.test(html)) return html.replace(/<head(?=[\s>])[^>]*>/i, (m) => m + inject); // not <header>
  if (/<html(?=[\s>])[^>]*>/i.test(html)) return html.replace(/<html(?=[\s>])[^>]*>/i, (m) => `${m}<head>${inject}</head>`);
  return `<!doctype html><html><head>${inject}</head><body>${html}</body></html>`;
}

const screensOf = (html: string) => [...html.matchAll(/data-screen=["']([^"']+)["']/g)].map((m) => m[1]!);

async function withRetry(gen: () => Promise<string>): Promise<string> {
  try { return sanitize(await gen()); } catch { return sanitize(await gen()); }
}

export async function buildPrototype(brief: string, lang: string, muse: Muse, onProgress: Progress): Promise<Prototype> {
  onProgress("Building the clickable prototype");
  const heroP = muse.image(`Clean modern product illustration for a mobile app hero banner, no text, soft colors. Product: ${brief.slice(0, 400)}`);
  const html = await withRetry(() => muse.text(PROTOTYPE, `${langLine(lang)}\nProduct brief:\n${brief}`, "medium"));
  onProgress("Adding the hero image");
  const hero = await heroP;
  const final = html.split("{{HERO_IMAGE}}").join(hero ?? FALLBACK_IMG);
  return { html: final, screens: screensOf(final), repaired: false };
}

export function prototype(run: Run, env: AiEnv, onProgress: Progress = () => {}, muse: Muse = createMuse(env)) {
  return buildPrototype(runContext(run), run.lang, muse, onProgress);
}

export async function repairPrototype(html: string, error: string, env: AiEnv, muse: Muse = createMuse(env)): Promise<Prototype> {
  const fixed = await withRetry(() => muse.text(REPAIR, `Runtime error: ${error.slice(0, 500)}\n\nHTML:\n${html}`, "medium"));
  return { html: fixed, screens: screensOf(fixed), repaired: true };
}
