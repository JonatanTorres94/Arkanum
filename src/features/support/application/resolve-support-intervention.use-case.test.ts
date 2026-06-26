import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveSupportInterventionUseCase } from "./resolve-support-intervention.use-case";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";
import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

function buildTicket(overrides: Partial<SupportTicket> = {}): SupportTicket {
  return {
    id:                  "ticket-1",
    clientId:            "client-1",
    projectId:           "proj-1",
    title:               "Auth issue",
    description:         null,
    notes:               null,
    reportedBy:          null,
    source:              "manual",
    category:            "bug_report",
    status:              "action_required",
    priority:            "high",
    createdAt:           "2026-06-27T00:00:00Z",
    updatedAt:           "2026-06-27T00:00:00Z",
    resolvedAt:          null,
    escalatedWorkItemId: "wi-1",
    escalatedAt:         "2026-06-27T00:00:00Z",
    escalatedBy:         null,
    ...overrides,
  };
}

function buildWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id:          "wi-1",
    projectId:   "proj-1",
    title:       "Fix auth bug",
    description: null,
    category:    "bug",
    status:      "awaiting_support",
    priority:    "high",
    notes:       null,
    createdAt:   "2026-06-27T00:00:00Z",
    updatedAt:   "2026-06-27T00:00:00Z",
    ...overrides,
  };
}

function buildTicketRepo(overrides: Partial<SupportTicketRepository> = {}): SupportTicketRepository {
  return {
    create:                    vi.fn(),
    findAll:                   vi.fn().mockResolvedValue([]),
    findById:                  vi.fn().mockResolvedValue(buildTicket()),
    findByClientId:            vi.fn().mockResolvedValue([]),
    findByEscalatedWorkItemId: vi.fn(),
    updateStatus:              vi.fn().mockResolvedValue(undefined),
    updateDetails:             vi.fn(),
    escalate:                  vi.fn(),
    ...overrides,
  };
}

function buildWorkItemRepo(overrides: Partial<ProjectWorkItemRepository> = {}): ProjectWorkItemRepository {
  return {
    create:          vi.fn(),
    findById:        vi.fn().mockResolvedValue(buildWorkItem()),
    findByProjectId: vi.fn().mockResolvedValue([]),
    update:          vi.fn(),
    updateStatus:    vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildNoteRepo(overrides: Partial<SupportTicketNoteRepository> = {}): SupportTicketNoteRepository {
  return {
    findByTicketId: vi.fn().mockResolvedValue([]),
    create:         vi.fn().mockResolvedValue({ id: "note-1" }),
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── Validation ──────────────────────────────────────────────────────────────

describe("resolveSupportInterventionUseCase — validation", () => {
  it("rejects when ticket not found", async () => {
    const ticketRepo = buildTicketRepo({ findById: vi.fn().mockResolvedValue(null) });
    const result = await resolveSupportInterventionUseCase(
      "ticket-missing", null, ticketRepo, buildWorkItemRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/encontrado/);
  });

  it("rejects when ticket has no escalated work item", async () => {
    const ticketRepo = buildTicketRepo({
      findById: vi.fn().mockResolvedValue(buildTicket({ escalatedWorkItemId: null })),
    });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, ticketRepo, buildWorkItemRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/vinculado/);
  });

  it("rejects when work item is not found", async () => {
    const wiRepo = buildWorkItemRepo({ findById: vi.fn().mockResolvedValue(null) });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo(), wiRepo, buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("rejects when work item is not in awaiting_support state", async () => {
    const wiRepo = buildWorkItemRepo({
      findById: vi.fn().mockResolvedValue(buildWorkItem({ status: "in_progress" })),
    });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo(), wiRepo, buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/esperando/i);
  });

  it("rejects when ticket status is not action_required", async () => {
    const ticketRepo = buildTicketRepo({
      findById: vi.fn().mockResolvedValue(buildTicket({ status: "escalated_to_development" })),
    });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, ticketRepo, buildWorkItemRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/no requiere/);
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("resolveSupportInterventionUseCase — happy path", () => {
  it("returns ok:true on success", async () => {
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", "support@example.com", buildTicketRepo(), buildWorkItemRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(true);
  });

  it("updates ticket status to escalated_to_development", async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo({ updateStatus }), buildWorkItemRepo(), buildNoteRepo()
    );
    expect(updateStatus).toHaveBeenCalledWith("ticket-1", {
      status:     "escalated_to_development",
      resolvedAt: null,
    });
  });

  it("updates work item status to ready", async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo(), buildWorkItemRepo({ updateStatus }), buildNoteRepo()
    );
    expect(updateStatus).toHaveBeenCalledWith("wi-1", { status: "ready" });
  });

  it("creates an audit note on the ticket", async () => {
    const create = vi.fn().mockResolvedValue({ id: "note-1" });
    await resolveSupportInterventionUseCase(
      "ticket-1", "support@example.com",
      buildTicketRepo(), buildWorkItemRepo(), buildNoteRepo({ create })
    );
    expect(create).toHaveBeenCalledWith(
      "ticket-1",
      expect.stringContaining("Soporte atendió"),
      "support@example.com"
    );
  });
});

// ─── Partial failure ──────────────────────────────────────────────────────────

describe("resolveSupportInterventionUseCase — partial failure", () => {
  it("returns ok:false when ticket status update fails", async () => {
    const ticketRepo = buildTicketRepo({ updateStatus: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, ticketRepo, buildWorkItemRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("returns ok:false with partial:true when work item update fails", async () => {
    const wiRepo = buildWorkItemRepo({ updateStatus: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo(), wiRepo, buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.partial).toBe(true);
      expect(result.error).toMatch(/parcialmente|no se pudo/i);
    }
  });

  it("returns ok:true when only the audit note fails", async () => {
    const noteRepo = buildNoteRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await resolveSupportInterventionUseCase(
      "ticket-1", null, buildTicketRepo(), buildWorkItemRepo(), noteRepo
    );
    expect(result.ok).toBe(true);
  });
});
