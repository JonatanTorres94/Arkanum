import type { UpdateClientInput, UpdateClientResult } from "@/features/clients/domain/client.types";
import type { ClientRepository } from "@/features/clients/infrastructure/client.repository";

export async function updateClientUseCase(
  id: string,
  input: UpdateClientInput,
  repository: ClientRepository
): Promise<UpdateClientResult> {
  try {
    const existing = await repository.findById(id);
    if (!existing) return { ok: false, error: "Cliente no encontrado." };

    await repository.update(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el cliente." };
  }
}
