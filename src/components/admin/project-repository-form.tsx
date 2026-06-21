"use client";

import { useRef, useState, useTransition } from "react";
import { REPOSITORY_PROVIDERS, type RepositoryProvider } from "@/features/projects/domain/project-repository-link.types";
import { createProjectRepositoryAction } from "@/server/actions/admin-project-metadata.action";

const PROVIDER_LABELS: Record<RepositoryProvider, string> = {
  github: "GitHub",
  other:  "Otro",
};

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-xs font-medium text-admin-text-muted";

export function ProjectRepositoryForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createProjectRepositoryAction(projectId, {
        provider:      (data.get("provider") as string) ?? "",
        owner:         (data.get("owner") as string) ?? "",
        name:          (data.get("name") as string) ?? "",
        repoUrl:       (data.get("repoUrl") as string) ?? "",
        defaultBranch: (data.get("defaultBranch") as string) ?? "",
        notes:         (data.get("notes") as string) ?? "",
      });
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p role="alert" className="text-xs text-admin-danger">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="repo-name" className={labelClass}>Nombre</label>
          <input
            id="repo-name"
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder="arkanum-web"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="repo-provider" className={labelClass}>Proveedor</label>
          <select
            id="repo-provider"
            name="provider"
            defaultValue="github"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {REPOSITORY_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>{PROVIDER_LABELS[provider]}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="repo-url" className={labelClass}>URL del repositorio</label>
          <input
            id="repo-url"
            name="repoUrl"
            type="url"
            required
            disabled={isPending}
            placeholder="https://github.com/JonatanTorres94/Arkanum"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="repo-owner" className={labelClass}>Owner</label>
          <input
            id="repo-owner"
            name="owner"
            type="text"
            disabled={isPending}
            placeholder="JonatanTorres94"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="repo-branch" className={labelClass}>Branch por defecto</label>
          <input
            id="repo-branch"
            name="defaultBranch"
            type="text"
            disabled={isPending}
            placeholder="main"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="repo-notes" className={labelClass}>Notas</label>
          <textarea
            id="repo-notes"
            name="notes"
            rows={2}
            disabled={isPending}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Vincular repositorio"}
      </button>
    </form>
  );
}
