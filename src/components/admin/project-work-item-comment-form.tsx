"use client";

import { useRef, useState, useTransition } from "react";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";
import { createWorkItemCommentAction } from "@/server/actions/admin-project-work-item-comment.action";

export function ProjectWorkItemCommentForm({
  projectId,
  workItemId,
}: {
  projectId: string;
  workItemId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]             = useState<string | null>(null);
  const [visibleToSupport, setVisibleToSupport] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const content = textareaRef.current?.value ?? "";

    startTransition(async () => {
      const result = await createWorkItemCommentAction(projectId, workItemId, {
        content,
        visibleToSupport,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (textareaRef.current) textareaRef.current.value = "";
      setVisibleToSupport(false);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        ref={textareaRef}
        name="content"
        required
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        placeholder="Agregar comentario interno..."
        disabled={isPending}
        className="w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none disabled:opacity-50 resize-none"
      />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-xs text-admin-text-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={visibleToSupport}
            onChange={(e) => setVisibleToSupport(e.target.checked)}
            disabled={isPending}
            className="rounded border-admin-border-strong accent-admin-accent"
          />
          Visible para Soporte
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Agregando..." : "Agregar comentario"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-admin-danger">
          {error}
        </p>
      )}
    </form>
  );
}
