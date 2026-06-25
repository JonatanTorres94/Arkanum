import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateProjectWorkItemInput,
  ProjectWorkItem,
  UpdateProjectWorkItemInput,
  UpdateProjectWorkItemStatusInput,
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

  async findById(id: string): Promise<ProjectWorkItem | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_items")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProjectWorkItemRow>();

    if (error) throw new Error("Supabase findById failed");
    if (!data) return null;

    return toDomain(data);
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

  async update(id: string, input: UpdateProjectWorkItemInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("project_work_items")
      .update({
        title:       input.title,
        description: input.description,
        category:    input.category,
        status:      input.status,
        priority:    input.priority,
        notes:       input.notes,
      })
      .eq("id", id);

    if (error) throw new Error("Supabase update failed");
  }

  async updateStatus(id: string, input: UpdateProjectWorkItemStatusInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("project_work_items")
      .update({ status: input.status })
      .eq("id", id);

    if (error) throw new Error("Supabase updateStatus failed");
  }
}
