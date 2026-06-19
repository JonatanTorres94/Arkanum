import type { Client } from "@/features/clients/domain/client.types";
import type { ClientRepository } from "@/features/clients/infrastructure/client.repository";

export type GetClientByIdResult =
  | { ok: true; client: Client }
  | { ok: false; notFound: boolean; error: string };

export async function getClientByIdUseCase(
  id: string,
  repository: ClientRepository
): Promise<GetClientByIdResult> {
  try {
    const client = await repository.findById(id);
    if (!client) return { ok: false, notFound: true, error: "Cliente no encontrado." };
    return { ok: true, client };
  } catch {
    return { ok: false, notFound: false, error: "No se pudo cargar el cliente." };
  }
}
