import type { Client, CreateClientInput, UpdateClientInput } from "@/features/clients/domain/client.types";

export interface ClientRepository {
  create(input: CreateClientInput): Promise<{ id: string }>;
  update(id: string, input: UpdateClientInput): Promise<void>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
}
