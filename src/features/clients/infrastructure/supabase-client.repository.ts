import { createServerClient } from "@/lib/supabase/server";
import type { Client, ClientStatus, CreateClientInput } from "@/features/clients/domain/client.types";
import type { ClientRepository } from "./client.repository";

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  industry: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toClientDomain(row: ClientRow): Client {
  return {
    id:           row.id,
    name:         row.name,
    company:      row.company,
    contactName:  row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    industry:     row.industry,
    status:       row.status as ClientStatus,
    notes:        row.notes,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

export class SupabaseClientRepository implements ClientRepository {
  async create(input: CreateClientInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name:          input.name,
        company:       input.company,
        contact_name:  input.contactName,
        contact_email: input.contactEmail,
        contact_phone: input.contactPhone,
        industry:      input.industry,
        status:        input.status,
        notes:         input.notes,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findAll(): Promise<Client[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ClientRow[]>();

    if (error) throw new Error("Supabase findAll failed");

    return (data ?? []).map(toClientDomain);
  }

  async findById(id: string): Promise<Client | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .maybeSingle<ClientRow>();

    if (error) throw new Error("Supabase findById failed");
    if (!data) return null;

    return toClientDomain(data);
  }
}
