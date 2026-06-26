import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAttentionItemsUseCase, getAttentionItemCountUseCase } from "./get-attention-items.use-case";
import type { AttentionItemRepository, AttentionCandidate } from "@/features/operations/infrastructure/attention-item.repository";
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

function makeCandidate(overrides: {
  ticket?: Partial<SupportTicket>;
  workItem?: Partial<ProjectWorkItem> | null;
  workItemMissing?: boolean;
} = {}): AttentionCandidate {
  const workItem = overrides.workItem === null
    ? null
    : makeWorkItem(overrides.workItem ?? {});

  return {
    ticket:          makeTicket(overrides.ticket ?? {}),
    workItem,
    workItemMissing: overrides.workItemMissing ?? false,
  };
}

function buildRepo(candidates: AttentionCandidate[], count = 0): AttentionItemRepository {
  return {
    findAttentionCandidates: vi.fn().mockResolvedValue(candidates),
    countAttentionTickets:   vi.fn().mockResolvedValue(count),
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── Happy paths ──────────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — item derivation", () => {
  it("returns ok:true with empty items when there are no candidates", async () => {
    const result = await getAttentionItemsUseCase(buildRepo([]));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.items).toHaveLength(0);
  });

  it("produces support_intervention_pending when ticket is action_required", async () => {
    const candidate = makeCandidate({
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
    expect(item?.href).toBe("/admin/support/ticket-1");
  });

  it("also produces development_intervention_active when ticket is action_required with a linked WI", async () => {
    const candidate = makeCandidate({
      ticket:   { status: "action_required", escalatedWorkItemId: "wi-1" },
      workItem: { status: "awaiting_support", id: "wi-1", projectId: "project-1" },
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const devItem = result.items.find((i) => i.kind === "development_intervention_active");
    expect(devItem).toBeDefined();
    expect(devItem?.audience).toBe("development");
    expect(devItem?.workItemId).toBe("wi-1");
    expect(devItem?.href).toBe("/admin/projects/project-1/work-items/wi-1");
  });

  it("produces support_validation_pending when WI is done", async () => {
    const candidate = makeCandidate({ workItem: { status: "done" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "support_validation_pending");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("support");
    expect(item?.href).toBe("/admin/support/ticket-1");
  });

  it("produces support_cancellation_review when WI is cancelled", async () => {
    const candidate = makeCandidate({ workItem: { status: "cancelled" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "support_cancellation_review");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("support");
  });

  it("produces no attention item when WI is in normal open status (development_in_progress)", async () => {
    const openStatuses = ["in_progress", "blocked", "review", "testing", "ready", "backlog"] as const;
    for (const status of openStatuses) {
      const candidate = makeCandidate({ workItem: { status } });
      const result = await getAttentionItemsUseCase(buildRepo([candidate]));
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.items, `status=${status}`).toHaveLength(0);
    }
  });
});

// ─── Integrity ────────────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — integrity items", () => {
  it("produces integrity_missing_work_item when escalatedWorkItemId set but WI not found", async () => {
    const candidate = makeCandidate({
      ticket:          { escalatedWorkItemId: "wi-missing" },
      workItem:        null,
      workItemMissing: true,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "integrity_missing_work_item");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("integrity");
    expect(item?.workItemId).toBeNull();
  });

  it("produces integrity_orphan_escalation when ticket is escalated_to_development without escalatedWorkItemId", async () => {
    const candidate = makeCandidate({
      ticket:   { status: "escalated_to_development", escalatedWorkItemId: null },
      workItem: null,
    });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const item = result.items.find((i) => i.kind === "integrity_orphan_escalation");
    expect(item).toBeDefined();
    expect(item?.audience).toBe("integrity");
  });

  it("does not produce orphan_escalation when WI is present", async () => {
    const candidate = makeCandidate({ workItem: { status: "in_progress" } });
    const result = await getAttentionItemsUseCase(buildRepo([candidate]));
    expect(result.ok).toBe(true);
    if (result.ok) {
      const orphan = result.items.find((i) => i.kind === "integrity_orphan_escalation");
      expect(orphan).toBeUndefined();
    }
  });
});

// ─── Sorting ──────────────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — sorting", () => {
  it("sorts urgent before high, high before medium, medium before low", async () => {
    const candidates = [
      makeCandidate({ ticket: { id: "t-low",    priority: "low",    escalatedWorkItemId: "wi-low",    updatedAt: "2026-06-20T10:00:00Z" }, workItem: { id: "wi-low",    status: "done" } }),
      makeCandidate({ ticket: { id: "t-urgent",  priority: "urgent", escalatedWorkItemId: "wi-urgent", updatedAt: "2026-06-20T10:00:00Z" }, workItem: { id: "wi-urgent", status: "done" } }),
      makeCandidate({ ticket: { id: "t-high",   priority: "high",   escalatedWorkItemId: "wi-high",   updatedAt: "2026-06-20T10:00:00Z" }, workItem: { id: "wi-high",   status: "done" } }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const priorities = result.items.map((i) => i.ticketPriority);
    expect(priorities.indexOf("urgent")).toBeLessThan(priorities.indexOf("high"));
    expect(priorities.indexOf("high")).toBeLessThan(priorities.indexOf("low"));
  });

  it("sorts older items before newer items within same priority", async () => {
    // updatedAt on the WI determines recency for validation items.
    const candidates = [
      makeCandidate({ ticket: { id: "t-new", priority: "high", escalatedWorkItemId: "wi-new" }, workItem: { id: "wi-new", status: "done", updatedAt: "2026-06-22T10:00:00Z" } }),
      makeCandidate({ ticket: { id: "t-old", priority: "high", escalatedWorkItemId: "wi-old" }, workItem: { id: "wi-old", status: "done", updatedAt: "2026-06-20T10:00:00Z" } }),
    ];
    const result = await getAttentionItemsUseCase(buildRepo(candidates));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ids = result.items.map((i) => i.ticketId);
    expect(ids.indexOf("t-old")).toBeLessThan(ids.indexOf("t-new"));
  });
});

// ─── Error handling ──────────────────────────────────────────────────────────

describe("getAttentionItemsUseCase — error handling", () => {
  it("returns ok:false when repository throws", async () => {
    const repo: AttentionItemRepository = {
      findAttentionCandidates: vi.fn().mockRejectedValue(new Error("DB fail")),
      countAttentionTickets:   vi.fn().mockResolvedValue(0),
    };
    const result = await getAttentionItemsUseCase(repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/bandeja/);
  });
});

// ─── Nav badge ───────────────────────────────────────────────────────────────

describe("getAttentionItemCountUseCase", () => {
  it("returns the count from the repository", async () => {
    const repo = buildRepo([], 7);
    const count = await getAttentionItemCountUseCase(repo);
    expect(count).toBe(7);
  });

  it("returns 0 when the repository throws", async () => {
    const repo: AttentionItemRepository = {
      findAttentionCandidates: vi.fn(),
      countAttentionTickets:   vi.fn().mockRejectedValue(new Error("DB fail")),
    };
    const count = await getAttentionItemCountUseCase(repo);
    expect(count).toBe(0);
  });
});
