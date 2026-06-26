import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestSupportInterventionUseCase } from "./request-support-intervention.use-case";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

function buildWorkItem(overrides: Partial<ProjectWorkItem> = {}): ProjectWorkItem {
  return {
    id:          "wi-1",
    projectId:   "proj-1",
    title:       "Fix auth bug",
    description: null,
    category:    "bug",
    status:      "in_progress",
    priority:    "high",
    notes:       null,
    createdAt:   "2026-06-27T00:00:00Z",
    updatedAt:   "2026-06-27T00:00:00Z",
    ...overrides,
  };
}

function buildCommentRepo(overrides: Partial<ProjectWorkItemCommentRepository> = {}): ProjectWorkItemCommentRepository {
  return {
    findByWorkItemId: vi.fn().mockResolvedValue([]),
    findByWorkItemIdVisibleToSupport: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: "comment-1" }),
    ...overrides,
  };
}

function buildWorkItemRepo(overrides: Partial<ProjectWorkItemRepository> = {}): ProjectWorkItemRepository {
  return {
    create:         vi.fn().mockResolvedValue({ id: "wi-1" }),
    findById:       vi.fn().mockResolvedValue(buildWorkItem()),
    findByProjectId: vi.fn().mockResolvedValue([]),
    update:         vi.fn().mockResolvedValue(undefined),
    updateStatus:   vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildTicketRepo(overrides: Partial<SupportTicketRepository> = {}): SupportTicketRepository {
  return {
    create:                    vi.fn(),
    findAll:                   vi.fn().mockResolvedValue([]),
    findById:                  vi.fn(),
    findByClientId:            vi.fn().mockResolvedValue([]),
    findByEscalatedWorkItemId: vi.fn(),
    updateStatus:              vi.fn().mockResolvedValue(undefined),
    updateDetails:             vi.fn(),
    escalate:                  vi.fn(),
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

const VALID_COMMENT = "Necesitamos que Soporte confirme el ambiente de staging.";

beforeEach(() => vi.clearAllMocks());

// ─── Validation ──────────────────────────────────────────────────────────────

describe("requestSupportInterventionUseCase — validation", () => {
  it("rejects empty comment", async () => {
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", "", null,
      buildCommentRepo(), buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only comment", async () => {
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", "   ", null,
      buildCommentRepo(), buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/obligatorio/);
  });

  it("rejects comment exceeding 2000 characters", async () => {
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", "x".repeat(2001), null,
      buildCommentRepo(), buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/2000/);
  });

  it("rejects when work item not found", async () => {
    const wiRepo = buildWorkItemRepo({ findById: vi.fn().mockResolvedValue(null) });
    const result = await requestSupportInterventionUseCase(
      "wi-missing", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), wiRepo, buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/encontrado/);
  });

  it("rejects when work item is already awaiting_support", async () => {
    const wiRepo = buildWorkItemRepo({ findById: vi.fn().mockResolvedValue(buildWorkItem({ status: "awaiting_support" })) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), wiRepo, buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/activa/);
  });

  it("rejects when work item is done", async () => {
    const wiRepo = buildWorkItemRepo({ findById: vi.fn().mockResolvedValue(buildWorkItem({ status: "done" })) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), wiRepo, buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("rejects when work item is cancelled", async () => {
    const wiRepo = buildWorkItemRepo({ findById: vi.fn().mockResolvedValue(buildWorkItem({ status: "cancelled" })) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), wiRepo, buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("requestSupportInterventionUseCase — happy path", () => {
  it("returns ok:true and creates comment visible to support", async () => {
    const createComment = vi.fn().mockResolvedValue({ id: "c-1" });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, "dev@example.com",
      buildCommentRepo({ create: createComment }),
      buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(true);
    expect(createComment).toHaveBeenCalledWith(
      "wi-1",
      { content: VALID_COMMENT, visibleToSupport: true },
      "dev@example.com"
    );
  });

  it("sets work item status to awaiting_support", async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), buildWorkItemRepo({ updateStatus }), buildTicketRepo(), buildNoteRepo()
    );
    expect(updateStatus).toHaveBeenCalledWith("wi-1", { status: "awaiting_support" });
  });

  it("updates ticket status to action_required", async () => {
    const updateStatus = vi.fn().mockResolvedValue(undefined);
    await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), buildWorkItemRepo(), buildTicketRepo({ updateStatus }), buildNoteRepo()
    );
    expect(updateStatus).toHaveBeenCalledWith("ticket-1", {
      status:     "action_required",
      resolvedAt: null,
    });
  });

  it("trims the comment before creating it", async () => {
    const createComment = vi.fn().mockResolvedValue({ id: "c-1" });
    await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", "  trimmed  ", null,
      buildCommentRepo({ create: createComment }),
      buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    const [, inputArg] = createComment.mock.calls[0] as [string, { content: string }, unknown];
    expect(inputArg.content).toBe("trimmed");
  });
});

// ─── Partial failure ──────────────────────────────────────────────────────────

describe("requestSupportInterventionUseCase — partial failure", () => {
  it("returns ok:false when comment creation fails (nothing persisted)", async () => {
    const commentRepo = buildCommentRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      commentRepo, buildWorkItemRepo(), buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when work item update fails", async () => {
    const wiRepo = buildWorkItemRepo({ updateStatus: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), wiRepo, buildTicketRepo(), buildNoteRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("returns ok:true with warning when ticket update fails (best-effort)", async () => {
    const ticketRepo = buildTicketRepo({ updateStatus: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), buildWorkItemRepo(), ticketRepo, buildNoteRepo()
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warning).toBeTruthy();
  });

  it("returns ok:true (no warning) when only the audit note fails", async () => {
    const noteRepo = buildNoteRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await requestSupportInterventionUseCase(
      "wi-1", "ticket-1", VALID_COMMENT, null,
      buildCommentRepo(), buildWorkItemRepo(), buildTicketRepo(), noteRepo
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warning).toBeUndefined();
  });
});
