import type { WorkItemStatus, WorkItemPriority, WorkItemCategory } from "./project-work-item.types";

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
  backlog:          "Backlog",
  ready:            "Listo para iniciar",
  in_progress:      "En progreso",
  blocked:          "Bloqueado",
  review:           "En revisión",
  testing:          "Testing",
  awaiting_support: "Esperando a Soporte",
  done:             "Completado",
  cancelled:        "Cancelado",
};

export const WORK_ITEM_PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};

export const WORK_ITEM_CATEGORY_LABELS: Record<WorkItemCategory, string> = {
  feature:            "Feature",
  bug:                "Bug",
  task:               "Tarea",
  improvement:        "Mejora",
  technical_debt:     "Deuda técnica",
  research:           "Investigación",
  support_escalation: "Escalación de soporte",
};
