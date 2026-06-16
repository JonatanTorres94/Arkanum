import type { Lead } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export type GetLeadByIdResult =
  | { ok: true; lead: Lead }
  | { ok: false; notFound: boolean; error: string };

export async function getLeadByIdUseCase(
  id: string,
  repository: LeadRepository
): Promise<GetLeadByIdResult> {
  try {
    const lead = await repository.findById(id);
    if (!lead) return { ok: false, notFound: true, error: "Lead no encontrado." };
    return { ok: true, lead };
  } catch {
    return { ok: false, notFound: false, error: "No se pudo cargar el lead." };
  }
}
