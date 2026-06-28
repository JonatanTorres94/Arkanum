import type { Lead } from "./lead.types";

export type LeadPriority = "alta" | "media" | "baja";

type PriorityInput = Pick<Lead, "urgency" | "budget" | "weeklyHoursLost">;

function scoreUrgency(urgency: string): number {
  if (urgency === "Lo necesitamos cuanto antes") return 3;
  if (urgency === "Este mes") return 2;
  if (urgency === "En los próximos 3 meses") return 1;
  return 0;
}

function scoreBudget(budget: string): number {
  if (budget === "Más de $5.000.000") return 3;
  if (budget === "$1.500.000 a $5.000.000") return 2;
  if (budget === "$500.000 a $1.500.000") return 1;
  return 0;
}

function scoreHoursLost(weeklyHoursLost: string | null): number {
  if (weeklyHoursLost === "Más de 20 horas") return 2;
  if (weeklyHoursLost === "10 a 20 horas") return 1;
  return 0;
}

// Derived purely from lead fields — no persistence, no DB access.
// Alta  >= 5  (strong urgency + budget signal)
// Media >= 2  (some intent)
// Baja  < 2   (early-stage / unclear demand)
export function deriveLeadPriority(lead: PriorityInput): LeadPriority {
  const score =
    scoreUrgency(lead.urgency) +
    scoreBudget(lead.budget) +
    scoreHoursLost(lead.weeklyHoursLost);

  if (score >= 5) return "alta";
  if (score >= 2) return "media";
  return "baja";
}
