// The founders' method and the interview method, as written. Muse has no skill loader, so a skill is connected
// by handing its text to the model on the stage it belongs to. Edit the files in skills/, not copies in code.
import deepInterview from "../../skills/deep-interview/SKILL.md?raw";
import overview from "../../skills/idea-to-delivery/SKILL.md?raw";
import shaping from "../../skills/idea-to-delivery/startup/idea-shaping.md?raw";
import value from "../../skills/idea-to-delivery/startup/value-proposition.md?raw";
import competition from "../../skills/idea-to-delivery/startup/competition.md?raw";
import market from "../../skills/idea-to-delivery/startup/market.md?raw";
import unit from "../../skills/idea-to-delivery/startup/unit-economics.md?raw";
import experiments from "../../skills/idea-to-delivery/startup/experiments.md?raw";
import mvp from "../../skills/idea-to-delivery/startup/mvp.md?raw";
import investor from "../../skills/idea-to-delivery/startup/investor-lens.md?raw";
import startupOverview from "../../skills/idea-to-delivery/startup/overview.md?raw";
import economics from "../../skills/idea-to-delivery/shared/economics-core.md?raw";
import evidence from "../../skills/idea-to-delivery/shared/evidence-and-logs.md?raw";
import traps from "../../skills/idea-to-delivery/shared/model-traps.md?raw";
import systems from "../../skills/idea-to-delivery/corporate/systems.md?raw";
import conceptPage from "../../skills/idea-to-delivery/assets/concept-page.md?raw";

const method = (...docs: string[]) => `

Your method is the text inside <method> below, written for an agent with tools. Use its thinking, its questions and its standards. You have no tools, files, subagents, state or memory here: skip every instruction about those, about saving files, about asking the user through a tool or waiting for approval. Everything above this line wins over the method: language, the output schema, the treatment of untrusted data, and what you were asked to produce. Reply only in the requested format.
<method>
${docs.join("\n\n---\n\n")}
</method>`;

export const SKILL = {
  interview: method(deepInterview),
  concept: method(overview, shaping, value, conceptPage),
  research: method(market, competition, evidence),
  report: method(startupOverview, investor, unit, economics, traps, experiments, mvp, evidence),
  system: method(mvp, systems),
  screen: method(investor, unit, traps, competition, market, evidence),
};
