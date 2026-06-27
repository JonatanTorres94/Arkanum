import type { Project } from "@/features/projects/domain/project.types";
import { TERMINAL_TICKET_STATUSES, type SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

type ProjectsSummary = {
  total:         number;
  inDevelopment: number;
  paused:        number;
  deployed:      number;
};

type SupportSummary = {
  total:                  number;
  open:                   number;
  escalatedToDevelopment: number;
};

export type ClientOperationalOverviewResult = {
  projects: { ok: true;  items: Project[];       summary: ProjectsSummary }
          | { ok: false; items: [];              error: string };
  support:  { ok: true;  items: SupportTicket[]; summary: SupportSummary }
          | { ok: false; items: [];              error: string };
  latestRelatedActivityAt: string | null;
};

function computeProjectsSummary(projects: Project[]): ProjectsSummary {
  return {
    total:         projects.length,
    inDevelopment: projects.filter((p) => p.status === "in_development").length,
    paused:        projects.filter((p) => p.status === "paused").length,
    deployed:      projects.filter((p) => p.status === "deployed").length,
  };
}

function computeSupportSummary(tickets: SupportTicket[]): SupportSummary {
  return {
    total:                  tickets.length,
    open:                   tickets.filter((t) => !TERMINAL_TICKET_STATUSES.has(t.status)).length,
    escalatedToDevelopment: tickets.filter((t) => t.status === "escalated_to_development").length,
  };
}

// latestRelatedActivityAt only considers sources that loaded successfully.
// client.updatedAt is deliberately excluded — contact/status edits are not
// operational activity.
function computeLatestActivity(
  projectsOk: boolean, projects: Project[],
  ticketsOk:  boolean, tickets:  SupportTicket[]
): string | null {
  const timestamps: string[] = [
    ...(projectsOk ? projects.map((p) => p.updatedAt) : []),
    ...(ticketsOk  ? tickets.map((t)  => t.updatedAt) : []),
  ];
  return timestamps.length > 0 ? timestamps.reduce((a, b) => (a > b ? a : b)) : null;
}

export async function getClientOperationalOverviewUseCase(
  clientId: string,
  projectRepository: ProjectRepository,
  ticketRepository: SupportTicketRepository
): Promise<ClientOperationalOverviewResult> {
  const [projectsSettled, ticketsSettled] = await Promise.allSettled([
    projectRepository.findByClientId(clientId),
    ticketRepository.findByClientId(clientId),
  ]);

  const projectsOk = projectsSettled.status === "fulfilled";
  const ticketsOk  = ticketsSettled.status  === "fulfilled";

  const projects = projectsOk ? projectsSettled.value : [];
  const tickets  = ticketsOk  ? ticketsSettled.value  : [];

  return {
    projects: projectsOk
      ? { ok: true,  items: projects, summary: computeProjectsSummary(projects) }
      : { ok: false, items: [],       error: "No se pudieron cargar los proyectos." },

    support: ticketsOk
      ? { ok: true,  items: tickets, summary: computeSupportSummary(tickets) }
      : { ok: false, items: [],      error: "No se pudieron cargar los tickets de soporte." },

    latestRelatedActivityAt: computeLatestActivity(projectsOk, projects, ticketsOk, tickets),
  };
}
