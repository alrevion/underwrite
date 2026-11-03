import { CLARITY, InterviewReply, type ClarityDim, type InterviewTurn, type Run } from "../../shared/contract";
import { createMuse, type AiEnv, type Muse } from "./muse";
import { INTERVIEW, fence, langLine } from "./prompts";

export const MAX_ANSWERS = 12;
export const MIN_ANSWERS = 2;
export const CLARITY_GATE = 80;
export const CLARITY_WEIGHTS: Record<ClarityDim, number> = { problem: 30, product: 25, customer: 20, money: 15, founder: 10 };

// Clarity only rises: an answer cannot make the idea less understood, and the bar stays honest.
export function mergeClarity(floor: Record<ClarityDim, number> | undefined, next: InterviewReply["clarity"]): InterviewReply["clarity"] {
  const out = {} as InterviewReply["clarity"];
  for (const d of CLARITY) {
    const n = Math.max(0, Math.min(100, Math.round(next[d].score || 0)));
    out[d] = { score: Math.max(n, floor?.[d] ?? 0), why: next[d].why };
  }
  return out;
}

// A question that got an answer, even "I don't know", settles part of what was open. So the interview always moves on.
export const ANSWER_GAIN = 25;
export function floorAfterAnswer(turn: InterviewTurn | undefined): Record<ClarityDim, number> | undefined {
  if (!turn) return undefined;
  const f = Object.fromEntries(CLARITY.map((d) => [d, turn.clarity[d].score])) as Record<ClarityDim, number>;
  if (turn.target) f[turn.target] = Math.min(100, f[turn.target] + ANSWER_GAIN);
  return f;
}

export const overallClarity = (c: InterviewReply["clarity"]) =>
  Math.round(CLARITY.reduce((a, d) => a + c[d].score * CLARITY_WEIGHTS[d], 0) / 100);

export const weakest = (scores: Record<ClarityDim, number>): ClarityDim =>
  CLARITY.reduce((w, d) => (scores[d] < scores[w] ? d : w), CLARITY[0]);

// From deep interviewing: as answers add up, change angle so the questions do not circle.
const angle = (answers: number) =>
  answers === 3 ? "Angle for this question: challenge the assumption the idea most depends on, without arguing."
  : answers === 5 ? "Angle for this question: what is the smallest version that would still prove the idea?"
  : answers === 7 ? "Angle for this question: what is this really, in one plain sentence, and who would miss it?"
  : "";

export async function nextTurn(run: Run, env: AiEnv, muse: Muse = createMuse(env)): Promise<InterviewTurn> {
  const answers = run.transcript.filter((t) => t.role === "founder").length;
  const floor = floorAfterAnswer(run.interview);
  const asking = floor ? weakest(floor) : undefined; // code picks the topic, so the model cannot circle on one
  const log = run.transcript.map((t) => `${t.role === "founder" ? "FOUNDER" : "YOU"}: ${t.text}`).join("\n");
  const user = `${langLine(run.lang)}
Founder's first message (the idea):
${fence(run.idea)}
Interview so far (${answers} founder answers):
${fence(log || "(nothing yet)")}
Scores so far, your scores may only be equal or higher: ${floor ? JSON.stringify(floor) : "none"}
Ask the next question about: ${asking ?? "the dimension you scored lowest"}.
${angle(answers)}`;
  const m = await muse.json("interview_turn", InterviewReply, INTERVIEW, user, "minimal");
  const clarity = mergeClarity(floor, m.clarity);
  const target = asking ?? weakest(Object.fromEntries(CLARITY.map((d) => [d, clarity[d].score])) as Record<ClarityDim, number>);
  const overall = overallClarity(clarity);
  const done = answers >= MAX_ANSWERS || (answers >= MIN_ANSWERS && overall >= CLARITY_GATE); // the gate is code, never the model
  return { clarity, overall, target, done, message: done ? m.closing : m.message, suggestions: done ? [] : m.suggestions.slice(0, 4) };
}
