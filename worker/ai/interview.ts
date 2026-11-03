import { InterviewTurn, type Run } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse } from "./muse";
import { INTERVIEW, fence, langLine } from "./prompts";

export const MAX_ANSWERS = 8;

// Code, not the model, moves the interview along, so it can never circle on one topic.
export const phaseFor = (answers: number): InterviewTurn["phase"] =>
  answers < 2 ? "founder" : answers < 5 ? "problem" : answers < 7 ? "product" : "improvements";

export async function nextTurn(run: Run, env: AiEnv, muse: Muse = createMuse(env)): Promise<InterviewTurn> {
  const answers = run.transcript.filter((t) => t.role === "founder").length;
  const phase = phaseFor(answers);
  const log = run.transcript.map((t) => `${t.role === "founder" ? "FOUNDER" : "YOU"}: ${t.text}`).join("\n");
  const user = `${langLine(run.lang)}
Founder's first message (the idea):
${fence(run.idea)}
Interview so far (${answers} founder answers of at most ${MAX_ANSWERS}):
${fence(log || "(nothing yet)")}
${answers >= MAX_ANSWERS ? "The limit is reached: set done=true." : `Current phase: ${phase}. Ask the next single question, on a topic not asked yet.`}`;
  const turn = await muse.json("interview_turn", InterviewTurn, INTERVIEW, user, "low");
  const done = answers >= MAX_ANSWERS || (turn.done && answers >= 4);
  return { ...turn, phase, done, suggestions: done ? [] : turn.suggestions.slice(0, 4) };
}
