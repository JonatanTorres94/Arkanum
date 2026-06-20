import type { TicketCategory, TicketPriority, TicketStatus } from "@/features/support/domain/support-ticket.types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  new:                       "Nuevo",
  triage:                    "Triage",
  waiting_client:            "Esperando cliente",
  waiting_internal:          "Esperando interno",
  escalated_to_development:  "Escalado a desarrollo",
  resolved:                  "Resuelto",
  closed:                    "Cerrado",
  cancelled:                 "Cancelado",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  new:                      "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  triage:                   "bg-blue-400/10 text-blue-400 border-blue-400/20",
  waiting_client:           "bg-amber-400/10 text-amber-400 border-amber-400/20",
  waiting_internal:         "bg-amber-400/10 text-amber-400 border-amber-400/20",
  escalated_to_development: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  resolved:                 "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  closed:                   "bg-slate-400/10 text-slate-500 border-slate-700",
  cancelled:                "bg-slate-400/10 text-slate-500 border-slate-700",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low:    "bg-slate-400/10 text-slate-400 border-slate-700",
  medium: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  high:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  urgent: "bg-red-400/10 text-red-400 border-red-400/20",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  question:        "Pregunta",
  configuration:   "Configuración",
  bug_report:      "Reporte de bug",
  incident:        "Incidente",
  change_request:  "Pedido de cambio",
  training:        "Capacitación",
  billing:         "Facturación",
  access_issue:    "Problema de acceso",
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge className={PRIORITY_COLORS[priority]}>{PRIORITY_LABELS[priority]}</Badge>;
}

export function TicketCategoryBadge({ category }: { category: TicketCategory }) {
  return (
    <Badge className="bg-slate-800 text-slate-400 border-slate-700">
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}
