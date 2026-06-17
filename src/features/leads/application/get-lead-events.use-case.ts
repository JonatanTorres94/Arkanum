import type { LeadEvent } from "@/features/leads/domain/lead-event.types";
import type { EventRepository } from "@/features/leads/infrastructure/event.repository";

export type GetLeadEventsResult =
  | { ok: true; events: LeadEvent[] }
  | { ok: false; error: string };

export async function getLeadEventsUseCase(
  leadId: string,
  repository: EventRepository
): Promise<GetLeadEventsResult> {
  try {
    const events = await repository.findByLeadId(leadId);
    return { ok: true, events };
  } catch {
    return { ok: false, error: "No se pudo cargar la actividad." };
  }
}
