import type { Lead } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export type GetLeadsResult =
  | { ok: true; leads: Lead[] }
  | { ok: false; error: string };

export async function getLeadsUseCase(
  repository: LeadRepository
): Promise<GetLeadsResult> {
  try {
    const leads = await repository.findAll();
    return { ok: true, leads };
  } catch {
    return { ok: false, error: "No se pudo cargar el listado de leads." };
  }
}
