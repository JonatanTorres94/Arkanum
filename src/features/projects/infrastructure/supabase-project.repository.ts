import { createServerClient } from "@/lib/supabase/server";
import type { CreateProjectInput, Project, ProjectStatus } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "./project.repository";

type ProjectRow = {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  target_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toProjectDomain(row: ProjectRow): Project {
  return {
    id:          row.id,
    clientId:    row.client_id,
    name:        row.name,
    description: row.description,
    status:      row.status as ProjectStatus,
    startDate:   row.start_date,
    targetDate:  row.target_date,
    notes:       row.notes,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

export class SupabaseProjectRepository implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        client_id:   input.clientId,
        name:        input.name,
        description: input.description,
        status:      input.status,
        start_date:  input.startDate,
        target_date: input.targetDate,
        notes:       input.notes,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findAll(): Promise<Project[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<ProjectRow[]>();

    if (error) throw new Error("Supabase findAll failed");

    return (data ?? []).map(toProjectDomain);
  }

  async findById(id: string): Promise<Project | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProjectRow>();

    if (error) throw new Error("Supabase findById failed");
    if (!data) return null;

    return toProjectDomain(data);
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .returns<ProjectRow[]>();

    if (error) throw new Error("Supabase findByClientId failed");

    return (data ?? []).map(toProjectDomain);
  }
}
