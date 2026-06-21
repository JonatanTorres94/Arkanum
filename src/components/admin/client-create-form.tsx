"use client";

import { useActionState } from "react";
import { CLIENT_STATUSES, type ClientStatus } from "@/features/clients/domain/client.types";
import { createClientAction } from "@/server/actions/admin-client.action";

const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  former: "Ex cliente",
};

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-sm font-medium text-admin-text-secondary";

export function ClientCreateForm() {
  const [state, action, pending] = useActionState(createClientAction, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-admin-danger/20 bg-admin-danger/10 px-4 py-3 text-sm text-admin-danger">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre del cliente <span className="text-admin-danger">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={pending}
          placeholder="Juan García"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            Empresa
          </label>
          <input
            id="company"
            name="company"
            type="text"
            disabled={pending}
            placeholder="Distribuidora García"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contactName" className={labelClass}>
            Contacto principal
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className={labelClass}>
            Email de contacto
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            disabled={pending}
            placeholder="juan@empresa.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className={labelClass}>
            Teléfono / WhatsApp
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            disabled={pending}
            placeholder="+54 11 1234-5678"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="industry" className={labelClass}>
            Rubro
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue="active"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {CLIENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas internas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={pending}
          placeholder="Contexto comercial, condiciones acordadas, etc."
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-admin-accent px-6 py-2.5 text-sm font-semibold text-admin-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear cliente"}
      </button>
    </form>
  );
}
