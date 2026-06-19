import type { Client, CreateClientInput } from "@/features/clients/domain/client.types";

export interface ClientRepository {
  create(input: CreateClientInput): Promise<{ id: string }>;
  findAll(): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
}
