import type { ProjectStatus } from "@/features/projects/domain/project.types";

const LABELS: Record<ProjectStatus, string> = {
  discovery:       "Discovery",
  planning:        "Planificación",
  in_development:  "En desarrollo",
  testing:         "Testing",
  deployed:        "Desplegado",
  maintenance:     "Mantenimiento",
  paused:          "Pausado",
  cancelled:       "Cancelado",
};

const COLORS: Record<ProjectStatus, string> = {
  discovery:      "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  planning:       "bg-blue-400/10 text-blue-400 border-blue-400/20",
  in_development: "bg-violet-400/10 text-violet-400 border-violet-400/20",
  testing:        "bg-amber-400/10 text-amber-400 border-amber-400/20",
  deployed:       "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  maintenance:    "bg-teal-400/10 text-teal-400 border-teal-400/20",
  paused:         "bg-slate-400/10 text-slate-400 border-slate-700",
  cancelled:      "bg-red-400/10 text-red-400 border-red-400/20",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
