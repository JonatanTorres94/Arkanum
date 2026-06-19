import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateProjectRepositoryLinkInput,
  ProjectRepositoryLink,
  RepositoryProvider,
} from "@/features/projects/domain/project-repository-link.types";
import type { ProjectRepositoryLinkRepository } from "./project-repository-link.repository";

type ProjectRepositoryLinkRow = {
  id: string;
  project_id: string;
  provider: string;
  owner: string | null;
  name: string;
  repo_url: string;
  default_branch: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toDomain(row: ProjectRepositoryLinkRow): ProjectRepositoryLink {
  return {
    id:            row.id,
    projectId:     row.project_id,
    provider:      row.provider as RepositoryProvider,
    owner:         row.owner,
    name:          row.name,
    repoUrl:       row.repo_url,
    defaultBranch: row.default_branch,
    notes:         row.notes,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

export class SupabaseProjectRepositoryLinkRepository implements ProjectRepositoryLinkRepository {
  async create(input: CreateProjectRepositoryLinkInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_repositories")
      .insert({
        project_id:     input.projectId,
        provider:       input.provider,
        owner:          input.owner,
        name:           input.name,
        repo_url:       input.repoUrl,
        default_branch: input.defaultBranch,
        notes:          input.notes,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findByProjectId(projectId: string): Promise<ProjectRepositoryLink[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_repositories")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .returns<ProjectRepositoryLinkRow[]>();

    if (error) throw new Error("Supabase findByProjectId failed");

    return (data ?? []).map(toDomain);
  }
}
