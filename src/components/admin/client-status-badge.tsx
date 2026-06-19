import type { ClientStatus } from "@/features/clients/domain/client.types";

const LABELS: Record<ClientStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  former: "Ex cliente",
};

const COLORS: Record<ClientStatus, string> = {
  active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  paused: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  former: "bg-slate-400/10 text-slate-500 border-slate-700",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
