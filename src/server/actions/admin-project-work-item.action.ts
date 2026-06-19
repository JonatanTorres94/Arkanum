"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { createProjectWorkItemUseCase } from "@/features/projects/application/create-project-work-item.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import {
  WORK_ITEM_CATEGORIES,
  WORK_ITEM_STATUSES,
  WORK_ITEM_PRIORITIES,
  type WorkItemCategory,
  type WorkItemStatus,
  type WorkItemPriority,
} from "@/features/projects/domain/project-work-item.types";

const TITLE_MAX_LENGTH = 200;

function normalize(value: string): string | null {
  const str = value.trim();
  return str ? str : null;
}

function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

export async function createProjectWorkItemAction(
  projectId: string,
  input: {
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    notes: string;
  }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const projectResult = await getProjectByIdUseCase(projectId, new SupabaseProjectRepository());
  if (!projectResult.ok) return { error: "El proyecto no existe." };

  const title = normalize(input.title);
  if (!title) return { error: "El título es obligatorio." };
  if (title.length > TITLE_MAX_LENGTH) return { error: "El título es demasiado largo." };

  if (!isValidEnumValue(WORK_ITEM_CATEGORIES, input.category)) {
    return { error: "Categoría inválida." };
  }
  if (!isValidEnumValue(WORK_ITEM_STATUSES, input.status)) {
    return { error: "Estado inválido." };
  }
  if (!isValidEnumValue(WORK_ITEM_PRIORITIES, input.priority)) {
    return { error: "Prioridad inválida." };
  }

  const repository = new SupabaseProjectWorkItemRepository();
  const result = await createProjectWorkItemUseCase(
    {
      projectId,
      title,
      description: normalize(input.description),
      category:    input.category as WorkItemCategory,
      status:      input.status as WorkItemStatus,
      priority:    input.priority as WorkItemPriority,
      notes:       normalize(input.notes),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}
