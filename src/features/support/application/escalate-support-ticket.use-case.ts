import type {
  EscalateSupportTicketInput,
  EscalateSupportTicketResult,
} from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

// Only persists the escalation metadata on the ticket itself — creating the
// project_work_item is a separate use-case/repository, orchestrated by the
// server action, same as other multi-repository flows in this codebase.
export async function escalateSupportTicketUseCase(
  id: string,
  input: EscalateSupportTicketInput,
  repository: SupportTicketRepository
): Promise<EscalateSupportTicketResult> {
  try {
    await repository.escalate(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar la escalación del ticket." };
  }
}
