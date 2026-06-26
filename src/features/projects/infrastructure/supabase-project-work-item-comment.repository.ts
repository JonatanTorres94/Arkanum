import { createServerClient } from "@/lib/supabase/server";
import type { ProjectWorkItemComment, CreateProjectWorkItemCommentInput } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "./project-work-item-comment.repository";

type CommentRow = {
  id:                 string;
  work_item_id:       string;
  content:            string;
  visible_to_support: boolean;
  created_by:         string | null;
  created_at:         string;
};

function toDomain(row: CommentRow): ProjectWorkItemComment {
  return {
    id:               row.id,
    workItemId:       row.work_item_id,
    content:          row.content,
    visibleToSupport: row.visible_to_support,
    createdBy:        row.created_by,
    createdAt:        row.created_at,
  };
}

export class SupabaseProjectWorkItemCommentRepository implements ProjectWorkItemCommentRepository {
  async findByWorkItemId(workItemId: string): Promise<ProjectWorkItemComment[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_item_comments")
      .select("*")
      .eq("work_item_id", workItemId)
      .order("created_at", { ascending: true })
      .returns<CommentRow[]>();

    if (error) throw new Error("Supabase findByWorkItemId comments failed");

    return (data ?? []).map(toDomain);
  }

  async findByWorkItemIdVisibleToSupport(workItemId: string): Promise<ProjectWorkItemComment[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_item_comments")
      .select("*")
      .eq("work_item_id", workItemId)
      .eq("visible_to_support", true)
      .order("created_at", { ascending: true })
      .returns<CommentRow[]>();

    if (error) throw new Error("Supabase findByWorkItemIdVisibleToSupport failed");

    return (data ?? []).map(toDomain);
  }

  async create(
    workItemId: string,
    input: CreateProjectWorkItemCommentInput,
    createdBy: string | null
  ): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("project_work_item_comments")
      .insert({
        work_item_id:       workItemId,
        content:            input.content,
        visible_to_support: input.visibleToSupport,
        created_by:         createdBy,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase comment insert failed");

    return { id: data.id };
  }
}
