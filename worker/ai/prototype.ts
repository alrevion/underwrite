import type { Prototype, Run } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse, type Progress } from "./muse";
import { DESIGN_FIX, HERO_IMAGE, PROTOTYPE, REPAIR, langLine } from "./prompts";
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

// Signs of a generated look that code can see. The model does not get to judge its own taste.
export function slopSigns(html: string): string[] {
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join("\n") + [...html.matchAll(/style=["']([^"']*)["']/gi)].map((m) => m[1]).join("\n");
  const text = html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const checks: [boolean, string][] = [
    [/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), "Emoji or pictographs used as icons: replace with inline SVG line icons or remove"],
    [/(linear|radial|conic)-gradient/i.test(css), "CSS gradients: use flat surfaces from the neutral ramp"],
    [/font-weight:\s*(700|800|900|bold)/i.test(css), "Font weights above 600: use 400 to 600"],
    [/text-transform:\s*uppercase/i.test(css), "Uppercase labels: use sentence case without letter spacing"],
    [/backdrop-filter|filter:\s*blur/i.test(css), "Glass or blur effects: use a plain surface and a hairline"],
    [/animation[^;{}]*infinite/i.test(css), "Looping animation: remove it"],
    [/transition:\s*all/i.test(css), "transition: all: name the properties"],
    [/>\s*(good (morning|afternoon|evening)|welcome back|hi|hello)\b/i.test(text), "Greeting as a title: name the context instead"],
    [/[a-zа-яё]!\s*</i.test(text), "Exclamation marks in the interface: use a plain statement"],
    [/lorem ipsum/i.test(text), "Placeholder text: use realistic content"],
  ];
  return checks.filter(([bad]) => bad).map(([, why]) => why);
}

const screensOf = (html: string) => [...html.matchAll(/data-screen=["']([^"']+)["']/g)].map((m) => m[1]!);

async function withRetry(gen: () => Promise<string>): Promise<string> {
  try { return sanitize(await gen()); } catch { return sanitize(await gen()); }
}

export async function buildPrototype(brief: string, lang: string, muse: Muse, onProgress: Progress): Promise<Prototype> {
  onProgress("Building the clickable prototype");
  const heroP = muse.image(HERO_IMAGE(brief));
  let html = await withRetry(() => muse.text(PROTOTYPE, `${langLine(lang)}\nProduct brief:\n${brief}`, "medium"));
  const signs = slopSigns(html);
  if (signs.length) {
    onProgress("Reviewing the design");
    // One pass only. If it fails, the working prototype still stands.
    html = await withRetry(() => muse.text(DESIGN_FIX, `Problems:\n- ${signs.join("\n- ")}\n\nHTML:\n${html}`, "medium")).catch(() => html);
  }
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
