import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateProjectWorkItemInput,
  ProjectWorkItem,
  WorkItemCategory,
  WorkItemPriority,
  WorkItemStatus,
} from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "./project-work-item.repository";

type ProjectWorkItemRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toDomain(row: ProjectWorkItemRow): ProjectWorkItem {
  return {
    id:          row.id,
    projectId:   row.project_id,
    title:       row.title,
    description: row.description,
    category:    row.category as WorkItemCategory,
    status:      row.status as WorkItemStatus,
    priority:    row.priority as WorkItemPriority,
    notes:       row.notes,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

export class SupabaseProjectWorkItemRepository implements ProjectWorkItemRepository {
  async create(input: CreateProjectWorkItemInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_items")
      .insert({
        project_id:  input.projectId,
        title:       input.title,
        description: input.description,
        category:    input.category,
        status:      input.status,
        priority:    input.priority,
        notes:       input.notes,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findByProjectId(projectId: string): Promise<ProjectWorkItem[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_items")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .returns<ProjectWorkItemRow[]>();

    if (error) throw new Error("Supabase findByProjectId failed");

    return (data ?? []).map(toDomain);
  }
}
