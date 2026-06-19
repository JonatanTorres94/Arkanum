"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { createProjectRepositoryLinkUseCase } from "@/features/projects/application/create-project-repository-link.use-case";
import { SupabaseProjectRepositoryLinkRepository } from "@/features/projects/infrastructure/supabase-project-repository-link.repository";
import { REPOSITORY_PROVIDERS, type RepositoryProvider } from "@/features/projects/domain/project-repository-link.types";
import { createProjectEnvironmentUseCase } from "@/features/projects/application/create-project-environment.use-case";
import { SupabaseProjectEnvironmentRepository } from "@/features/projects/infrastructure/supabase-project-environment.repository";
import {
  ENVIRONMENT_TYPES,
  ENVIRONMENT_STATUSES,
  type EnvironmentType,
  type EnvironmentStatus,
} from "@/features/projects/domain/project-environment.types";

const NAME_MAX_LENGTH = 200;

function normalize(value: string): string | null {
  const str = value.trim();
  return str ? str : null;
}

function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function assertProjectExists(projectId: string): Promise<{ error?: string }> {
  const result = await getProjectByIdUseCase(projectId, new SupabaseProjectRepository());
  if (!result.ok) return { error: "El proyecto no existe." };
  return {};
}

export async function createProjectRepositoryAction(
  projectId: string,
  input: {
    provider: string;
    owner: string;
    name: string;
    repoUrl: string;
    defaultBranch: string;
    notes: string;
  }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const { error: projectError } = await assertProjectExists(projectId);
  if (projectError) return { error: projectError };

  if (!isValidEnumValue(REPOSITORY_PROVIDERS, input.provider)) {
    return { error: "Proveedor inválido." };
  }

  const name = normalize(input.name);
  if (!name) return { error: "El nombre del repositorio es obligatorio." };
  if (name.length > NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  const repoUrl = normalize(input.repoUrl);
  if (!repoUrl) return { error: "La URL del repositorio es obligatoria." };
  if (!isValidHttpUrl(repoUrl)) return { error: "La URL del repositorio no es válida." };

  const repository = new SupabaseProjectRepositoryLinkRepository();
  const result = await createProjectRepositoryLinkUseCase(
    {
      projectId,
      provider:      input.provider as RepositoryProvider,
      owner:         normalize(input.owner),
      name,
      repoUrl,
      defaultBranch: normalize(input.defaultBranch),
      notes:         normalize(input.notes),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function createProjectEnvironmentAction(
  projectId: string,
  input: {
    name: string;
    type: string;
    url: string;
    status: string;
    notes: string;
  }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const { error: projectError } = await assertProjectExists(projectId);
  if (projectError) return { error: projectError };

  const name = normalize(input.name);
  if (!name) return { error: "El nombre del entorno es obligatorio." };
  if (name.length > NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  if (!isValidEnumValue(ENVIRONMENT_TYPES, input.type)) {
    return { error: "Tipo de entorno inválido." };
  }
  if (!isValidEnumValue(ENVIRONMENT_STATUSES, input.status)) {
    return { error: "Estado de entorno inválido." };
  }

  const url = normalize(input.url);
  if (url && !isValidHttpUrl(url)) return { error: "La URL del entorno no es válida." };

  const repository = new SupabaseProjectEnvironmentRepository();
  const result = await createProjectEnvironmentUseCase(
    {
      projectId,
      name,
      type:   input.type as EnvironmentType,
      url,
      status: input.status as EnvironmentStatus,
      notes:  normalize(input.notes),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}
