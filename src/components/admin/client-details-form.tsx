"use client";

import { useState, useTransition } from "react";
import { CLIENT_STATUSES, type ClientStatus } from "@/features/clients/domain/client.types";
import { updateClientAction } from "@/server/actions/admin-client.action";

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  former: "Ex cliente",
};

const fieldClass =
  "w-full min-w-0 rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";
const labelClass = "mb-1.5 block text-sm font-medium text-admin-text-secondary";

export function ClientDetailsForm({
  clientId,
  name,
  company,
  contactName,
  contactEmail,
  contactPhone,
  industry,
  status,
  notes,
  onCancel,
  onSaved,
}: {
  clientId:     string;
  name:         string;
  company:      string | null;
  contactName:  string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry:     string | null;
  status:       ClientStatus;
  notes:        string | null;
  onCancel:     () => void;
  onSaved:      () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateClientAction(clientId, {
        name:         (fd.get("name")         as string) ?? "",
        company:      (fd.get("company")      as string) ?? "",
        contactName:  (fd.get("contactName")  as string) ?? "",
        contactEmail: (fd.get("contactEmail") as string) ?? "",
        contactPhone: (fd.get("contactPhone") as string) ?? "",
        industry:     (fd.get("industry")     as string) ?? "",
        status:       (fd.get("status")       as string) ?? "",
        notes:        (fd.get("notes")        as string) ?? "",
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="cl-name" className={labelClass}>
            Nombre <span className="text-admin-danger">*</span>
          </label>
          <input
            id="cl-name"
            name="name"
            type="text"
            required
            defaultValue={name}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-company" className={labelClass}>Empresa</label>
          <input
            id="cl-company"
            name="company"
            type="text"
            defaultValue={company ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-industry" className={labelClass}>Rubro</label>
          <input
            id="cl-industry"
            name="industry"
            type="text"
            defaultValue={industry ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-contactName" className={labelClass}>Contacto principal</label>
          <input
            id="cl-contactName"
            name="contactName"
            type="text"
            defaultValue={contactName ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-contactEmail" className={labelClass}>Email de contacto</label>
          <input
            id="cl-contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={contactEmail ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-contactPhone" className={labelClass}>Teléfono / WhatsApp</label>
          <input
            id="cl-contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={contactPhone ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cl-status" className={labelClass}>Estado</label>
          <select
            id="cl-status"
            name="status"
            defaultValue={status}
            disabled={isPending}
            className={fieldClass}
          >
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="cl-notes" className={labelClass}>Notas internas</label>
          <textarea
            id="cl-notes"
            name="notes"
            rows={3}
            defaultValue={notes ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
