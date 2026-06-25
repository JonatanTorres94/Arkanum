import type { ClientOperationalOverview } from "@/features/clients/domain/client.types";
import type { Project } from "@/features/projects/domain/project.types";
import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

const TERMINAL_TICKET_STATUSES = new Set(["resolved", "closed", "cancelled"]);

function computeOverview(projects: Project[], tickets: SupportTicket[]): ClientOperationalOverview {
  const latestTimestamps: string[] = [
    ...projects.map((p) => p.updatedAt),
    ...tickets.map((t) => t.updatedAt),
  ];
  const latestRelatedActivityAt =
    latestTimestamps.length > 0
      ? latestTimestamps.reduce((a, b) => (a > b ? a : b))
      : null;

  return {
    projects: {
      total:         projects.length,
      inDevelopment: projects.filter((p) => p.status === "in_development").length,
      paused:        projects.filter((p) => p.status === "paused").length,
      deployed:      projects.filter((p) => p.status === "deployed").length,
    },
    support: {
      total:                  tickets.length,
      open:                   tickets.filter((t) => !TERMINAL_TICKET_STATUSES.has(t.status)).length,
      escalatedToDevelopment: tickets.filter((t) => t.status === "escalated_to_development").length,
    },
    latestRelatedActivityAt,
  };
}

export type ClientOperationalOverviewResult =
  | { ok: true; overview: ClientOperationalOverview; projects: Project[]; tickets: SupportTicket[] }
  | { ok: false; error: string };

export async function getClientOperationalOverviewUseCase(
  clientId: string,
  projectRepository: ProjectRepository,
  ticketRepository: SupportTicketRepository
): Promise<ClientOperationalOverviewResult> {
  try {
    const [projects, tickets] = await Promise.all([
      projectRepository.findByClientId(clientId),
      ticketRepository.findByClientId(clientId),
    ]);

    return { ok: true, overview: computeOverview(projects, tickets), projects, tickets };
  } catch {
    return { ok: false, error: "No se pudo cargar el resumen operativo." };
  }
}
