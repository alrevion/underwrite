// One worked idea: a Telegram bot that reminds patients of small dental clinics.
// Shapes are the raw MODEL outputs (what the pipeline asks Muse for), typed loosely on purpose.
// Plain .ts without runtime imports so `node --experimental-strip-types` can load it.
import type { Concept, InterviewTurn, Legal, SystemDesign } from "../../shared/contract.ts";

export const IDEA = "A Telegram bot that reminds patients of small dental clinics about appointments and asks them to confirm, so clinics lose fewer slots to no-shows.";

// URLs the fake web search returns. The research fixture also cites one that is NOT here,
// which the pipeline must demote from "fact" (provenance check).
export const SEARCH_RESULTS = [
  { type: "text_result", title: "ClinicPing pricing", url: "https://clinicping.example/pricing", snippet: "ClinicPing plans start at $79 per clinic per month for SMS reminders." },
  { type: "text_result", title: "No-show rates in dental practices", url: "https://dental-journal.example/no-shows", snippet: "Missed appointments cost a small practice roughly 10-15% of chair time." },
  { type: "text_result", title: "RemindDent about", url: "https://reminddent.example/about", snippet: "RemindDent serves multi-location dental groups with email and SMS reminders." },
  { type: "text_result", title: "Telegram usage by country", url: "https://stats.example/telegram", snippet: "Telegram is the default messenger in several Central Asian and Eastern European markets." },
];
const U = SEARCH_RESULTS.map((r) => r.url) as [string, string, string, string];
const claim = (text: string, label: "fact" | "estimate" | "assumption", sources: string[], howToTest = "") => ({ text, label, sources, howToTest });

export const interviewQuestions: Pick<InterviewTurn, "phase" | "message" | "suggestions">[] = [
  { phase: "founder", message: "Who are you and why are you the right person to build this?", suggestions: ["I run a dental clinic", "I am a developer", "I worked in clinic software"] },
  { phase: "problem", message: "How do clinics handle reminders today, and how many slots do they lose to no-shows?", suggestions: ["Receptionist calls", "SMS from a basic tool", "Nothing"] },
  { phase: "product", message: "What must the first version do for a clinic to pay for it?", suggestions: ["Send reminders", "Let patients confirm or reschedule", "Fill cancelled slots"] },
];
export const interviewDone = { phase: "improvements", message: "Thanks, that is enough to start. I will build the concept now.", suggestions: [], done: true } as const;

export const concept: Concept = {
  name: "Dentacall",
  oneLiner: "A receptionist at a small dental clinic, in a busy morning, gets fewer no-shows by sending Telegram reminders that patients confirm in one tap.",
  firstUser: "Receptionist of a 2-5 chair private dental clinic where patients already use Telegram",
  job: "When a booked slot is about to go empty, I want to know early whether the patient comes, so I can refill the slot.",
  pains: ["Phone reminders eat 1-2 hours of reception time per day", "No-shows leave the chair empty", "Patients ignore SMS from unknown numbers"],
  gains: ["Confirmations arrive in the chat patients already read", "Cancelled slots are visible hours earlier"],
  features: [
    { name: "Reminder schedule", why: "Sends 24h and 2h reminders automatically" },
    { name: "One-tap confirm or cancel", why: "Turns a reply into a calendar update" },
    { name: "Free-slot list", why: "Shows what can be refilled today" },
  ],
  improvements: [
    { name: "Waiting list nudges", why: "Offers a cancelled slot to patients who asked for an earlier time", reframing: false },
    { name: "Sell recovered chair time, not reminders", why: "The buyer cares about revenue per chair, not message counts", reframing: true },
  ],
  outOfScope: ["Full practice management", "Insurance billing", "Patient records"],
  usp: "Works inside Telegram, where patients answer, and needs no app install.",
  businessModel: "Monthly subscription per clinic, priced against one recovered appointment per week.",
  firstTest: "Offer 10 clinics a two-week pilot and measure the no-show rate before and after.",
};

const mkMarketClaim = (t: string, label: "fact" | "estimate" | "assumption", s: string[]) => claim(t, label, s, label === "assumption" ? "Ask 10 clinics" : "");
export const research = {
  competitors: [
    { name: "ClinicPing", kind: "direct", url: U[0], whoItServes: "Independent dental clinics in North America",
      pricing: claim("From $79 per clinic per month", "fact", [U[0]]),
      revenue: claim("Not found", "assumption", [], "Search funding databases or ask in clinic forums"),
      funding: claim("Not found", "assumption", [], "Check Crunchbase"),
      strength: "Established, integrates with common calendars", gap: "SMS only, no Telegram" },
    { name: "RemindDent", kind: "direct", url: U[2], whoItServes: "Multi-location dental groups",
      pricing: claim("Quoted per group, not published", "assumption", [], "Request a quote"),
      // Cites a URL the search never returned: must be demoted to non-fact.
      revenue: claim("Reported revenue above $20M a year", "fact", ["https://made-up-news.example/reminddent-revenue"]),
      funding: claim("Not found", "assumption", [], "Check Crunchbase"),
      strength: "Group-level analytics", gap: "Too heavy for a 3-chair clinic" },
    { name: "Front desk phone calls", kind: "status_quo", url: "", whoItServes: "Every clinic today",
      pricing: claim("Receptionist time, 1-2 hours per day", "estimate", []),
      revenue: claim("Not applicable", "assumption", []), funding: claim("Not applicable", "assumption", []),
      strength: "Personal, no software", gap: "Does not scale, interrupts other work" },
  ],
  market: {
    customerType: "Private dental clinics with 2-5 chairs", region: "Central Asia and Eastern Europe",
    customers: 40000, customersClaim: mkMarketClaim("Rough count of small private clinics in the region", "estimate", [U[3]]),
    reachableShare: 0.3, winRate: 0.05, annualPriceUsd: 600,
    priceClaim: claim("Below the $79 per month of the closest competitor", "fact", [U[0]]),
    drivers: [claim("A small practice loses roughly 10-15% of chair time to missed appointments", "fact", [U[1]]), mkMarketClaim("Telegram is the default messenger for patients", "fact", [U[3]])],
  },
  positioning: "The reminder tool that lives where small-clinic patients already chat.",
  gaps: ["No competitor reminds through Telegram", "No competitor sells recovered chair time as the outcome"],
};

const crit = (id: string, rating: "strong" | "weak" | "missing", evidence: string, nextStep: string) => ({ id, rating, evidence, nextStep });
export const report = {
  verdict: "hold",
  verdictWhy: "The problem is real and the wedge is clear, but nobody has paid yet and the market claim rests on one estimate.",
  headline: "Get 3 clinics to pay for a pilot before you build more than reminders.",
  criteria: [
    crit("problem", "strong", "No-shows cost 10-15% of chair time.", "Quantify for 5 clinics"),
    crit("product", "weak", "Reminders are easy to copy.", "Add the waiting-list refill"),
    crit("market", "weak", "Count of clinics is an estimate.", "Count from a regional registry"),
    crit("competition", "weak", "Direct competitors exist but skip Telegram.", "Check local players"),
    crit("business_model", "weak", "Price not tested.", "Ask 10 clinics for a price"),
    crit("traction", "missing", "No users yet.", "Run the pilot"),
    crit("team", "missing", "Unknown.", "Describe domain experience"),
    crit("strategy", "weak", "Go-to-market is not defined.", "Pick one city"),
    crit("financials", "missing", "No cost model.", "Model per-clinic margin"),
    crit("valuation", "missing", "Too early.", "Skip until revenue"),
    crit("exit", "missing", "Too early.", "Skip until revenue"),
    crit("deal_structure", "missing", "No round planned.", "Skip until revenue"),
  ],
  risks: [{ risk: "Clinics will not pay for reminders alone", critical: true, test: "Pre-sell 3 pilots at $40 per month" }, { risk: "Telegram is not used by patients in the target city", critical: false, test: "Ask 30 patients" }],
  nextTests: [{ test: "Pilot with 3 clinics", passIf: "No-shows drop by a quarter and 2 clinics agree to pay", costUsd: 300, days: 21 }],
  fullDocument: "# Dentacall\n\nVerdict: **hold**.\n\nNo-shows cost a small practice 10-15% of chair time ([source](" + U[1] + ")). Competitors such as [ClinicPing](" + U[0] + ") use SMS only.\n",
};

export const systemDesign: SystemDesign = {
  overview: "A Telegram bot plus a small web dashboard. A scheduler sends reminders; replies update appointment status.",
  businessLogic: [{ rule: "Send reminders 24h and 2h before a slot", why: "Two touches double confirmation rates in practice" }, { rule: "Cancelled slots go to the waiting list first", why: "Refills the chair fastest" }],
  entities: [{ name: "Clinic", fields: ["id", "name", "timezone"] }, { name: "Appointment", fields: ["id", "clinicId", "patientChatId", "startsAt", "status"] }],
  apis: [{ route: "POST /webhook/telegram", purpose: "Receive patient replies" }, { route: "GET /api/appointments", purpose: "Dashboard list" }],
  stack: [{ part: "Runtime", choice: "Cloudflare Workers", why: "Cheap, global, cron triggers" }, { part: "Database", choice: "D1", why: "Relational, serverless" }],
  diagrams: [{ title: "Reminder flow", mermaid: "sequenceDiagram\n  Scheduler->>Bot: due reminders\n  Bot->>Patient: Confirm?\n  Patient->>Bot: Yes\n  Bot->>DB: status=confirmed" }],
  buildOrder: ["Appointment import", "Reminder scheduler", "Confirm/cancel replies", "Dashboard", "Waiting list"],
};

export const legal: Legal = {
  jurisdictionAdvice: "Register a local limited company; patient contact data is personal data, so keep it in the country if local law requires.",
  entitySteps: [{ step: "Register the company", costUsd: 150, days: 5, source: "https://registry.example/steps" }],
  equityAdvice: "Split founder equity with 4-year vesting and a 1-year cliff.",
  mustHaveDocs: ["Founders agreement", "Privacy policy", "Clinic service agreement"],
  pitfalls: ["Storing patient health details you do not need", "Messaging patients without consent"],
};

export const screening = {
  company: "Dentacall",
  summary: "Telegram reminders for small dental clinics; pre-revenue.",
  thesisFit: "partial",
  thesisWhy: "Real pain and a clear wedge, but it is pre-revenue and the thesis asks for traction.",
  verdict: "hold",
  criteria: report.criteria,
  redFlags: [claim("The application states the market is $2B; the search supports a far smaller number", "assumption", [], "Ask for the bottom-up calculation")],
  questionsForFounder: ["How many clinics have agreed to a pilot?", "What is the cost to serve one clinic?"],
  hasPrototype: false,
};

// The "application" call: a read-out of a submitted application.
export const application = {
  company: "Dentacall", summary: "Telegram reminders for small dental clinics; pre-revenue.",
  product: "A Telegram bot that reminds patients and collects confirmations.", market: "A $2B global dental software market.",
  traction: "None yet; 3 clinics verbally interested.", team: "Two founders, one ex-clinic manager.", ask: "$150k pre-seed",
  claims: ["The dental software market is $2B", "Reminders cut no-shows by half"], hasPrototype: false,
};

export const prototypeHtml = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dentacall</title>
<style>body{font-family:system-ui,sans-serif;margin:0;background:#f6f8fa;color:#1a2330}nav{display:flex;gap:8px;padding:12px;background:#fff;border-bottom:1px solid #dde3ea}nav button{border:0;background:#e8eef5;padding:8px 14px;border-radius:8px;cursor:pointer}nav button.on{background:#1f6feb;color:#fff}section{display:none;padding:16px;max-width:560px;margin:auto}section.on{display:block}.card{background:#fff;border:1px solid #dde3ea;border-radius:10px;padding:12px;margin:8px 0;display:flex;justify-content:space-between;align-items:center}.ok{color:#1a7f37}.no{color:#cf222e}</style></head><body>
<nav><button data-go="Today" class="on">Today</button><button data-go="Patients">Patients</button><button data-go="Reminders">Reminders</button></nav>
<section data-screen="Today" class="on"><h2>Today</h2><div class="card"><span>09:00 Aigul K.</span><span class="ok">confirmed</span></div><div class="card"><span>10:30 Timur R.</span><span>waiting</span></div><div class="card"><span>12:00 Dilya S.</span><span class="no">cancelled</span> <button id="refill">Refill</button></div><p id="msg"></p></section>
<section data-screen="Patients"><h2>Patients</h2><div class="card"><span>Aigul K.</span><span>Telegram linked</span></div><div class="card"><span>Timur R.</span><span>Telegram linked</span></div></section>
<section data-screen="Reminders"><h2>Reminders</h2><label><input type="checkbox" checked> 24 hours before</label><br><label><input type="checkbox" checked> 2 hours before</label></section>
<script>
const show=n=>{document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.dataset.screen===n));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===n))};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.go));
document.getElementById('refill').onclick=()=>{document.getElementById('msg').textContent='Offered the 12:00 slot to 2 patients on the waiting list.'};
</script></body></html>`;
