import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAttentionItemsUseCase, getAttentionItemCountUseCase } from "./get-attention-items.use-case";
import type {
  AttentionItemRepository,
  AttentionCandidate,
  TicketCandidate,
  StandaloneWorkItemCandidate,
} from "@/features/operations/infrastructure/attention-item.repository";
import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
  return {
    id:                  "ticket-1",
    clientId:            "client-1",
    projectId:           "project-1",
    title:               "Bug en módulo de facturación",
    description:         null,
    notes:               null,
    reportedBy:          null,
    source:              "manual",
    category:            "bug_report",
    status:              "escalated_to_development",
    priority:            "high",
    createdAt:           "2026-06-20T00:00:00Z",
    updatedAt:           "2026-06-20T12:00:00Z",
    resolvedAt:          null,
    escalatedWorkItemId: "wi-1",
    escalatedAt:         "2026-06-20T10:00:00Z",
    escalatedBy:         null,
    ...overrides,
  };
}

function makeWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id:          "wi-1",
    projectId:   "project-1",
    title:       "Corregir bug en facturación",
    description: null,
    category:    "bug",
    status:      "in_progress",
    priority:    "high",
    notes:       null,
    createdAt:   "2026-06-20T10:00:00Z",
    updatedAt:   "2026-06-20T12:00:00Z",
    ...overrides,
  };
}

function makeTicketCandidate(overrides: {
  ticket?: Partial<SupportTicket>;
  workItem?: Partial<ProjectWorkItem> | null;
  workItemMissing?: boolean;
} = {}): TicketCandidate {
  const workItem = overrides.workItem === null
    ? null
    : makeWorkItem(overrides.workItem ?? {});

  return {
    type:            "ticket",
    ticket:          makeTicket(overrides.ticket ?? {}),
    workItem,
    workItemMissing: overrides.workItemMissing ?? false,
  };
}

function makeStandaloneWi(overrides: Partial<ProjectWorkItem> = {}): StandaloneWorkItemCandidate {
  return {
    type:     "standalone_work_item",
    workItem: makeWorkItem(overrides),
  };
}

function buildRepo(candidates: AttentionCandidate[]): AttentionItemRepository {
  return { findAttentionCandidates: vi.fn().mockResolvedValue(candidates) };
}

beforeEach(() => vi.clearAllMocks());

// ─── Generic: active Support tickets ─────────────────────────────────────────

describe("getAttentionItemsUseCase — generic support tickets", () => {
  it("produces support_open_ticket for an open ticket with no linked WI", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "new", escalatedWorkItemId: null },
      workItem: null,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.kind).toBe("support_open_ticket");
    expect(item.audience).toBe("support");
    expect(item.href).toBe("/admin/support/ticket-1");
    expect(item.ticketId).toBe("ticket-1");
  });

  it("produces support_open_ticket for a triage ticket with no linked WI", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "triage", escalatedWorkItemId: null },
      workItem: null,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeDefined();
  });

  it("produces support_open_ticket when ticket is escalated and linked WI is in active state", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "escalated_to_development", escalatedWorkItemId: "wi-1" },
      workItem: { status: "in_progress" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "support_open_ticket");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("support");
  });

  it("does NOT produce support_open_ticket when ticket already has a specific intervention item", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
  });

  it("does NOT produce support_open_ticket when ticket has a validation pending", async () => {
    const candidate = makeTicketCandidate({ workItem: { status: "done" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
  });
});

// ─── Generic: active Development work items ───────────────────────────────────

describe("getAttentionItemsUseCase — generic development work items", () => {
  it("produces development_open_work_item for a ready standalone WI", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "ready" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    const item = result.items[0];
    expect(item.kind).toBe("development_open_work_item");
    expect(item.audience).toBe("development");
    expect(item.ticketId).toBeNull();
    expect(item.workItemId).toBe("wi-1");
    expect(item.href).toBe("/admin/projects/project-1/work-items/wi-1");
  });

  it("produces development_open_work_item for in_progress standalone WI", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "in_progress" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeDefined();
  });

  it("produces development_open_work_item for review standalone WI", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "review" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeDefined();
  });

  it("produces development_open_work_item for testing standalone WI", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "testing" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeDefined();
  });

  it("produces development_blocked_work_item for blocked standalone WI (not development_open_work_item)", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "blocked" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("development_blocked_work_item");
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("produces integrity_awaiting_support_mismatch for awaiting_support standalone WI (not a generic dev item)", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "awaiting_support" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_awaiting_support_mismatch");
    expect(result.items[0].audience).toBe("integrity");
    expect(result.items[0].ticketId).toBeNull();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });
});

// ─── Integrity: awaiting_support mismatch (reciprocal validation) ────────────

describe("getAttentionItemsUseCase — awaiting_support without action_required ticket", () => {
  it("awaiting_support standalone WI → integrity_awaiting_support_mismatch only (no generic dev item)", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeStandaloneWi({ status: "awaiting_support" })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_awaiting_support_mismatch");
    expect(result.items[0].audience).toBe("integrity");
    expect(result.items[0].ticketId).toBeNull();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("awaiting_support WI + ticket open → integrity_awaiting_support_mismatch only (no support_open_ticket, no dev item)", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "new", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_awaiting_support_mismatch");
    expect(result.items[0].audience).toBe("integrity");
    expect(result.items[0].ticketId).toBe("ticket-1");
    expect(result.items[0].href).toBe("/admin/support/ticket-1");
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("awaiting_support WI + ticket escalated_to_development → integrity only", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "escalated_to_development", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_awaiting_support_mismatch");
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
  });

  it("awaiting_support WI + ticket action_required → specific pair (support_intervention_pending + development_intervention_active), NO integrity", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_intervention_pending")).toBeDefined();
    expect(result.items.find((i) => i.kind === "development_intervention_active")).toBeDefined();
    expect(result.items.find((i) => i.kind === "integrity_awaiting_support_mismatch")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });
});

// ─── Deduplication: specific items replace generic ────────────────────────────

describe("getAttentionItemsUseCase — no generic duplicates alongside specific items", () => {
  it("action_required+awaiting_support → specific pair only, no generic duplicates", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_intervention_pending")).toBeDefined();
    expect(result.items.find((i) => i.kind === "development_intervention_active")).toBeDefined();
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("validation pending → only support_validation_pending, no generic items", async () => {
    const candidate = makeTicketCandidate({ workItem: { status: "done" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_validation_pending")).toBeDefined();
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("cancellation review → only support_cancellation_review, no generic items", async () => {
    const candidate = makeTicketCandidate({ workItem: { status: "cancelled" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_cancellation_review")).toBeDefined();
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("integrity mismatch → only integrity item, no generic items", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "in_progress" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "integrity_action_required_mismatch")).toBeDefined();
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });

  it("escalated ticket + blocked WI → support_open_ticket + development_blocked_work_item only", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "escalated_to_development", escalatedWorkItemId: "wi-1" },
      workItem: { status: "blocked" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeDefined();
    expect(result.items.find((i) => i.kind === "development_blocked_work_item")).toBeDefined();
    expect(result.items.find((i) => i.kind === "development_open_work_item")).toBeUndefined();
  });
});

// ─── Specific Support workflow ────────────────────────────────────────────────

describe("getAttentionItemsUseCase — specific Support workflow items", () => {
  it("produces support_intervention_pending with correct unified fields", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "support_intervention_pending");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("support");
    expect(item?.ticketId).toBe("ticket-1");
    expect(item?.title).toBe("Bug en módulo de facturación");
    expect(item?.priority).toBe("high");
    expect(item?.href).toBe("/admin/support/ticket-1");
  });

  it("produces development_intervention_active with WI href and title from ticket", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support", id: "wi-1", projectId: "project-1" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "development_intervention_active");
    expect(item?.audience).toBe("development");
    expect(item?.workItemId).toBe("wi-1");
    expect(item?.href).toBe("/admin/projects/project-1/work-items/wi-1");
  });

  it("produces support_validation_pending when WI is done", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeTicketCandidate({ workItem: { status: "done" } })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_validation_pending")).toBeDefined();
  });

  it("produces support_cancellation_review when WI is cancelled", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([makeTicketCandidate({ workItem: { status: "cancelled" } })]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "support_cancellation_review")).toBeDefined();
  });
});

// ─── Integrity items ──────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — integrity items", () => {
  it("produces integrity_missing_work_item when escalatedWorkItemId set but WI not found", async () => {
    const candidate = makeTicketCandidate({
      ticket:          { escalatedWorkItemId: "wi-missing" },
      workItem:        null,
      workItemMissing: true,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_missing_work_item");
    expect(result.items[0].audience).toBe("integrity");
    expect(result.items[0].workItemId).toBeNull();
  });

  it("produces integrity_orphan_escalation when ticket is escalated_to_development without escalatedWorkItemId", async () => {
    const candidate = makeTicketCandidate({
      ticket:   { status: "escalated_to_development", escalatedWorkItemId: null },
      workItem: null,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items.find((i) => i.kind === "integrity_orphan_escalation")).toBeDefined();
  });

  it("action_required + WI missing → only integrity_missing_work_item (no operational items)", async () => {
    const candidate = makeTicketCandidate({
      ticket:          { status: "action_required", escalatedWorkItemId: "wi-missing" },
      workItem:        null,
      workItemMissing: true,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items).toHaveLength(1);
    expect(result.items[0].kind).toBe("integrity_missing_work_item");
  });

  const mismatchStatuses = [
    "ready", "in_progress", "blocked", "review", "testing", "done", "cancelled", "backlog",
  ] as const;

  for (const status of mismatchStatuses) {
    it(`action_required + WI ${status} → integrity_action_required_mismatch only`, async () => {
      const candidate = makeTicketCandidate({
        ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
        workItem: { status },
      });
      const result = await getAttentionItemsUseCase(buildRepo([candidate]));
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.items.find((i) => i.kind === "integrity_action_required_mismatch")).toBeDefined();
      expect(result.items.find((i) => i.kind === "support_intervention_pending")).toBeUndefined();
      expect(result.items.find((i) => i.kind === "support_open_ticket")).toBeUndefined();
    });
  }
});

// ─── Sorting ──────────────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — sorting", () => {
  it("places integrity items before specific workflow items regardless of priority", async () => {
    const candidates: AttentionCandidate[] = [
      makeTicketCandidate({
        ticket: { id: "t-specific", status: "action_required", escalatedWorkItemId: "wi-1", priority: "urgent" },
        workItem: { id: "wi-1", status: "awaiting_support", updatedAt: "2026-06-20T10:00:00Z" },
      }),
      makeTicketCandidate({
        ticket: { id: "t-integrity", escalatedWorkItemId: "wi-missing", priority: "low" },
        workItem: null,
        workItemMissing: true,
      }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.items.map((i) => i.id);
    expect(ids.findIndex((id) => id.includes("integrity"))).toBeLessThan(ids.findIndex((id) => id.includes("intervention")));
  });

  it("places blocked before generic open items of the same priority", async () => {
    const candidates: AttentionCandidate[] = [
      makeStandaloneWi({ id: "wi-open",    status: "in_progress", priority: "high", updatedAt: "2026-06-20T10:00:00Z" }),
      makeStandaloneWi({ id: "wi-blocked", status: "blocked",     priority: "high", updatedAt: "2026-06-20T10:00:00Z" }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.items.map((i) => i.id);
    expect(ids.indexOf("dev-blocked-wi-blocked")).toBeLessThan(ids.indexOf("dev-open-wi-open"));
  });

  it("sorts urgent before high within the same kind", async () => {
    const candidates: AttentionCandidate[] = [
      makeStandaloneWi({ id: "wi-high",   priority: "high",   updatedAt: "2026-06-20T10:00:00Z" }),
      makeStandaloneWi({ id: "wi-urgent", priority: "urgent", updatedAt: "2026-06-20T10:00:00Z" }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const priorities = result.items.map((i) => i.priority);
    expect(priorities.indexOf("urgent")).toBeLessThan(priorities.indexOf("high"));
  });

  it("sorts older items before newer items within the same kind and priority", async () => {
    const candidates: AttentionCandidate[] = [
      makeStandaloneWi({ id: "wi-new", priority: "high", updatedAt: "2026-06-22T10:00:00Z" }),
      makeStandaloneWi({ id: "wi-old", priority: "high", updatedAt: "2026-06-20T10:00:00Z" }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const wiIds = result.items.map((i) => i.workItemId);
    expect(wiIds.indexOf("wi-old")).toBeLessThan(wiIds.indexOf("wi-new"));
  });

  it("uses id as deterministic tiebreaker when kind, priority, and updatedAt are equal", async () => {
    const ts = "2026-06-20T12:00:00Z";
    const candidates: AttentionCandidate[] = [
      makeStandaloneWi({ id: "wi-z", priority: "high", updatedAt: ts }),
      makeStandaloneWi({ id: "wi-a", priority: "high", updatedAt: ts }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.items.map((i) => i.id);
    expect(ids.findIndex((id) => id.includes("wi-a"))).toBeLessThan(ids.findIndex((id) => id.includes("wi-z")));
  });
});

// ─── Error handling ──────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — error handling", () => {
  it("returns ok:false when repository throws", async () => {
    const repo: AttentionItemRepository = {
      findAttentionCandidates: vi.fn().mockRejectedValue(new Error("DB fail")),
    };
    const result = await getAttentionItemsUseCase(repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/bandeja/);
  });
});

// ─── Nav badge ───────────────────────────────────────────────────────────────

describe("getAttentionItemCountUseCase", () => {
  it("returns the exact derived count matching the inbox (mixed generic and specific)", async () => {
    // ticket action_required+awaiting_support → 2 items; standalone WI → 1 item; total: 3
    const candidates: AttentionCandidate[] = [
      makeTicketCandidate({
        ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
        workItem: { status: "awaiting_support" },
      }),
      makeStandaloneWi({ id: "wi-2", status: "in_progress" }),
    ];
    const count = await getAttentionItemCountUseCase(buildRepo(candidates));
    expect(count).toBe(3);
  });

  it("counts support_open_ticket correctly for a ticket with no linked WI", async () => {
    const candidates: AttentionCandidate[] = [
      makeTicketCandidate({ ticket: { status: "new", escalatedWorkItemId: null }, workItem: null }),
    ];
    const count = await getAttentionItemCountUseCase(buildRepo(candidates));
    expect(count).toBe(1);
  });

  it("counts standalone blocked WI as 1", async () => {
    const count = await getAttentionItemCountUseCase(buildRepo([makeStandaloneWi({ status: "blocked" })]));
    expect(count).toBe(1);
  });

  it("returns 0 when repository throws (fail-open)", async () => {
    const repo: AttentionItemRepository = {
      findAttentionCandidates: vi.fn().mockRejectedValue(new Error("DB fail")),
    };
    const count = await getAttentionItemCountUseCase(repo);
    expect(count).toBe(0);
  });
});

// ─── Empty inbox ──────────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — empty state", () => {
  it("returns ok:true with empty items when there are no candidates", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.items).toHaveLength(0);
  });
});
