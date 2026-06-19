"use server";

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createClientUseCase } from "@/features/clients/application/create-client.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { CLIENT_STATUSES, type ClientStatus } from "@/features/clients/domain/client.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 200;

function normalize(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str ? str : null;
}

function isValidStatus(value: string): value is ClientStatus {
  return (CLIENT_STATUSES as readonly string[]).includes(value);
}

export type CreateClientFormState = { error: string } | null;

export async function createClientAction(
  _prev: CreateClientFormState,
  formData: FormData
): Promise<CreateClientFormState> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const name = normalize(formData.get("name"));
  if (!name) return { error: "El nombre es obligatorio." };
  if (name.length > NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  const statusRaw = normalize(formData.get("status")) ?? "active";
  if (!isValidStatus(statusRaw)) return { error: "Estado inválido." };

  const contactEmail = normalize(formData.get("contactEmail"));
  if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) {
    return { error: "El email de contacto no es válido." };
  }

  const repository = new SupabaseClientRepository();
  const result = await createClientUseCase(
    {
      name,
      company:      normalize(formData.get("company")),
      contactName:  normalize(formData.get("contactName")),
      contactEmail,
      contactPhone: normalize(formData.get("contactPhone")),
      industry:     normalize(formData.get("industry")),
      status:       statusRaw,
      notes:        normalize(formData.get("notes")),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  redirect(`/admin/clients/${result.id}`);
}
