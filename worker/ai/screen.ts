import { z } from "zod";
import { Screening, type Claim, type ScreeningResult } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse, type Progress } from "./muse";
import { buildPrototype } from "./prototype";
import { READ_APPLICATION, SCREEN, fence, langLine } from "./prompts";
import { capByEvidence, enforce, readiness, verdictGuard } from "./provenance";
import { researchCore } from "./stages";

const AppRead = z.object({
  company: z.string(), summary: z.string(), product: z.string(), market: z.string(),
  traction: z.string(), team: z.string(), ask: z.string(),
  claims: z.array(z.string()), hasPrototype: z.boolean(),
});

export type Application = { name: string; text?: string; pdfBase64?: string };

export async function screen(
  thesis: string, app: Application, env: AiEnv, onProgress: Progress = () => {}, muse: Muse = createMuse(env),
): Promise<ScreeningResult> {
  const lang = "auto";
  onProgress(`Reading the application: ${app.name}`);
  const pdf = app.pdfBase64 ? { filename: "application.pdf", base64: app.pdfBase64 } : undefined;
  const read = await muse.json("application", AppRead, READ_APPLICATION,
    `${langLine(lang)}\nApplicant file name: ${fence(app.name)}\n${fence(app.text ?? "(see attached PDF)")}`, "medium", pdf);

  const ctx = fence(`Company: ${read.company}\nProduct: ${read.product}\nMarket claimed: ${read.market}\nSummary: ${read.summary}`);
  const research = await researchCore(ctx, lang, muse, onProgress);

  onProgress("Rating against the thesis");
  const user = `${langLine(lang)}\nInvestor thesis:\n${fence(thesis)}\nApplication read-out: ${fence(JSON.stringify(read))}\nResearch: ${fence(JSON.stringify(research))}`;
  const m = await muse.json("screening", Screening, SCREEN, user, "high");

  const criteria = capByEvidence(m.criteria, research);
  const known = research.sources.map((s) => s.url);
  const redFlags: Claim[] = m.redFlags.map((c) => enforce(c, known).claim);
  const result: ScreeningResult = {
    ...m, criteria, redFlags, hasPrototype: read.hasPrototype,
    verdict: verdictGuard(m.verdict, criteria),
    id: crypto.randomUUID(),
    readiness: readiness(criteria),
    market: research.market, competitors: research.competitors, sources: research.sources,
  };
  if (!read.hasPrototype) {
    try { result.prototype = await buildPrototype(`${read.product}\n${read.summary}`, lang, muse, onProgress); }
    catch { onProgress("Prototype skipped"); }
  }
  return result;
}
