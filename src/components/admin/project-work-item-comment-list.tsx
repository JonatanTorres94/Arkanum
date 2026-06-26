import type { ProjectWorkItemComment } from "@/features/projects/domain/project-work-item-comment.types";

function CommentItem({ comment }: { comment: ProjectWorkItemComment }) {
  return (
    <li className="space-y-1.5 rounded-lg border border-admin-border bg-admin-bg-subtle p-3">
      <p className="text-sm text-admin-text whitespace-pre-wrap break-words">{comment.content}</p>
      <div className="flex flex-wrap items-center gap-2">
        {comment.visibleToSupport && (
          <span className="rounded-full bg-admin-accent/10 px-2 py-0.5 text-xs font-medium text-admin-accent">
            Visible a Soporte
          </span>
        )}
        <span className="text-xs text-admin-text-muted">
          {comment.createdBy ?? "Sistema"}
          {" · "}
          {new Date(comment.createdAt).toLocaleString("es-AR")}
        </span>
      </div>
    </li>
  );
}

export function ProjectWorkItemCommentList({
  comments,
}: {
  comments: ProjectWorkItemComment[];
}) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-admin-text-muted">Sin comentarios aún.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} />
      ))}
    </ul>
  );
}
