"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AttentionItem, AttentionAudience } from "@/features/operations/domain/attention-item.types";
import {
  ATTENTION_KIND_LABELS,
  ATTENTION_AUDIENCE_LABELS,
} from "@/features/operations/domain/attention-item.types";

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_CLASSES: Record<string, string> = {
  urgent: "bg-admin-danger/10 text-admin-danger border border-admin-danger/20",
  high:   "bg-orange-500/10 text-orange-500 border border-orange-500/20",
  medium: "bg-admin-warning/10 text-admin-warning border border-admin-warning/20",
  low:    "bg-admin-surface-hover text-admin-text-muted border border-admin-border",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgente",
  high:   "Alta",
  medium: "Media",
  low:    "Baja",
};

// ─── Kind indicator ───────────────────────────────────────────────────────────

const KIND_INDICATOR_CLASSES: Record<string, string> = {
  support_intervention_pending:        "bg-admin-danger",
  support_validation_pending:          "bg-admin-accent",
  support_cancellation_review:         "bg-orange-500",
  development_intervention_active:     "bg-admin-warning",
  integrity_missing_work_item:         "bg-admin-text-faint",
  integrity_orphan_escalation:         "bg-admin-text-faint",
  integrity_action_required_mismatch:   "bg-admin-text-faint",
  integrity_awaiting_support_mismatch:  "bg-admin-text-faint",
  support_open_ticket:                 "bg-admin-accent/50",
  development_open_work_item:          "bg-admin-warning/50",
  development_blocked_work_item:       "bg-orange-500",
};

// ─── Age formatting ───────────────────────────────────────────────────────────

function formatAge(updatedAt: string): string {
  const diffMs = Date.now() - new Date(updatedAt).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const AUDIENCES: Array<{ value: "all" | AttentionAudience; label: string }> = [
  { value: "all",         label: "Todos" },
  { value: "support",     label: ATTENTION_AUDIENCE_LABELS["support"] },
  { value: "development", label: ATTENTION_AUDIENCE_LABELS["development"] },
  { value: "integrity",   label: ATTENTION_AUDIENCE_LABELS["integrity"] },
];

// ─── Item row ────────────────────────────────────────────────────────────────

function AttentionItemRow({ item }: { item: AttentionItem }) {
  const indicatorClass = KIND_INDICATOR_CLASSES[item.kind] ?? "bg-admin-text-faint";
  const priorityClass  = PRIORITY_CLASSES[item.priority] ?? PRIORITY_CLASSES.low;

  return (
    <div className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-admin-surface-hover">
      {/* Kind indicator dot */}
      <div className="mt-1.5 shrink-0">
        <span className={`block h-2 w-2 rounded-full ${indicatorClass}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-admin-text-muted">
            {ATTENTION_KIND_LABELS[item.kind]}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityClass}`}>
            {PRIORITY_LABELS[item.priority]}
          </span>
          <span className="text-xs text-admin-text-faint">{formatAge(item.updatedAt)}</span>
        </div>
        <p className="truncate text-sm font-medium text-admin-text">
          {item.title}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={item.href}
        className="shrink-0 rounded-lg border border-admin-border px-3 py-1.5 text-xs text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-accent"
      >
        Ver →
      </Link>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

const VALID_FILTER_VALUES = new Set(["all", "support", "development", "integrity"]);

export function AttentionInbox({ items }: { items: AttentionItem[] }) {
  const searchParams = useSearchParams();
  const rawAudience  = searchParams.get("audience") ?? "all";
  const activeFilter = (VALID_FILTER_VALUES.has(rawAudience) ? rawAudience : "all") as "all" | AttentionAudience;

  const filtered = activeFilter === "all"
    ? items
    : items.filter((i) => i.audience === activeFilter);

  const countForAudience = (aud: AttentionAudience) =>
    items.filter((i) => i.audience === aud).length;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-admin-border px-4 pb-0 pt-2">
        {AUDIENCES.map(({ value, label }) => {
          const count = value === "all" ? items.length : countForAudience(value as AttentionAudience);
          const isActive = activeFilter === value;
          const href = value === "all" ? "/admin/attention" : `/admin/attention?audience=${value}`;

          return (
            <Link
              key={value}
              href={href}
              className={`flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-b-2 border-admin-accent font-medium text-admin-accent"
                  : "text-admin-text-secondary hover:text-admin-text"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] font-semibold leading-4 ${
                  isActive ? "bg-admin-accent/15 text-admin-accent" : "bg-admin-surface-hover text-admin-text-muted"
                }`}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-admin-text-muted">
          No hay ítems pendientes para este filtro.
        </div>
      ) : (
        <div className="divide-y divide-admin-border">
          {filtered.map((item) => (
            <AttentionItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
