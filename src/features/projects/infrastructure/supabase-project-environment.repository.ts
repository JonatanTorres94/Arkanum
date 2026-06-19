import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateProjectEnvironmentInput,
  EnvironmentStatus,
  EnvironmentType,
  ProjectEnvironment,
} from "@/features/projects/domain/project-environment.types";
import type { ProjectEnvironmentRepository } from "./project-environment.repository";

type ProjectEnvironmentRow = {
  id: string;
  project_id: string;
  name: string;
  type: string;
  url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toDomain(row: ProjectEnvironmentRow): ProjectEnvironment {
  return {
    id:        row.id,
    projectId: row.project_id,
    name:      row.name,
    type:      row.type as EnvironmentType,
    url:       row.url,
    status:    row.status as EnvironmentStatus,
    notes:     row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseProjectEnvironmentRepository implements ProjectEnvironmentRepository {
  async create(input: CreateProjectEnvironmentInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_environments")
      .insert({
        project_id: input.projectId,
        name:       input.name,
        type:       input.type,
        url:        input.url,
        status:     input.status,
        notes:      input.notes,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findByProjectId(projectId: string): Promise<ProjectEnvironment[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_environments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .returns<ProjectEnvironmentRow[]>();

    if (error) throw new Error("Supabase findByProjectId failed");

    return (data ?? []).map(toDomain);
  }
}
