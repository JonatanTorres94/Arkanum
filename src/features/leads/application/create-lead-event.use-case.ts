import type { CreateLeadEventInput } from "@/features/leads/domain/lead-event.types";
import type { EventRepository } from "@/features/leads/infrastructure/event.repository";

export type CreateLeadEventResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createLeadEventUseCase(
  input: CreateLeadEventInput,
  repository: EventRepository
): Promise<CreateLeadEventResult> {
  try {
    await repository.create(input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar el evento." };
  }
}
