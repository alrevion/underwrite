import { InterviewTurn, type Run } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse } from "./muse";
import { INTERVIEW, fence, langLine } from "./prompts";

export const MAX_ANSWERS = 12;

export async function nextTurn(run: Run, env: AiEnv, muse: Muse = createMuse(env)): Promise<InterviewTurn> {
  const answers = run.transcript.filter((t) => t.role === "founder").length;
  const log = run.transcript.map((t) => `${t.role === "founder" ? "FOUNDER" : "YOU"}: ${t.text}`).join("\n");
  const user = `${langLine(run.lang)}
Founder's first message (the idea):
${fence(run.idea)}
Interview so far (${answers} founder answers of at most ${MAX_ANSWERS}):
${fence(log || "(nothing yet)")}
${answers >= MAX_ANSWERS ? "The limit is reached: set done=true." : "Ask the next single question."}`;
  const turn = await muse.json("interview_turn", InterviewTurn, INTERVIEW, user, "low");
  const done = turn.done || answers >= MAX_ANSWERS;
  return { ...turn, done, suggestions: done ? [] : turn.suggestions.slice(0, 4) };
}
