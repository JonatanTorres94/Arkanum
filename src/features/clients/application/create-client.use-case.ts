import type { CreateClientInput, CreateClientResult } from "@/features/clients/domain/client.types";
import type { ClientRepository } from "@/features/clients/infrastructure/client.repository";

export async function createClientUseCase(
  input: CreateClientInput,
  repository: ClientRepository
): Promise<CreateClientResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo crear el cliente." };
  }
}
