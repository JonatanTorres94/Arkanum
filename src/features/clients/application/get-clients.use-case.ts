import type { Client } from "@/features/clients/domain/client.types";
import type { ClientRepository } from "@/features/clients/infrastructure/client.repository";

export type GetClientsResult =
  | { ok: true; clients: Client[] }
  | { ok: false; error: string };

export async function getClientsUseCase(
  repository: ClientRepository
): Promise<GetClientsResult> {
  try {
    const clients = await repository.findAll();
    return { ok: true, clients };
  } catch {
    return { ok: false, error: "No se pudo cargar el listado de clientes." };
  }
}
