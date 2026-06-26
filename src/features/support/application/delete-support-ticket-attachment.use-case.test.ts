import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteSupportTicketAttachmentUseCase } from "./delete-support-ticket-attachment.use-case";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";
import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function buildAttachment(overrides: Partial<SupportTicketAttachment> = {}): SupportTicketAttachment {
  return {
    id:         "att-1",
    ticketId:   "ticket-1",
    filename:   "evidence.pdf",
    storageKey: "tickets/ticket-1/att-1",
    mimeType:   "application/pdf",
    sizeBytes:  512,
    uploadedBy: null,
    createdAt:  "2026-06-28T00:00:00Z",
    ...overrides,
  };
}

function buildStorage(overrides: Partial<SupportTicketAttachmentStorage> = {}): SupportTicketAttachmentStorage {
  return {
    upload:       vi.fn(),
    getSignedUrl: vi.fn(),
    delete:       vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildRepo(overrides: Partial<SupportTicketAttachmentRepository> = {}): SupportTicketAttachmentRepository {
  return {
    create:         vi.fn(),
    findByTicketId: vi.fn().mockResolvedValue([]),
    findById:       vi.fn().mockResolvedValue(buildAttachment()),
    delete:         vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── Validation ──────────────────────────────────────────────────────────────

describe("deleteSupportTicketAttachmentUseCase — validation", () => {
  it("returns ok:false when attachment is not found", async () => {
    const repo   = buildRepo({ findById: vi.fn().mockResolvedValue(null) });
    const result = await deleteSupportTicketAttachmentUseCase("ticket-1", "att-missing", buildStorage(), repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/encontrado/);
  });
});

// ─── Ownership ────────────────────────────────────────────────────────────────

describe("deleteSupportTicketAttachmentUseCase — ownership", () => {
  it("rejects when attachment belongs to a different ticket", async () => {
    const attachment = buildAttachment({ ticketId: "ticket-OTHER" });
    const repo       = buildRepo({ findById: vi.fn().mockResolvedValue(attachment) });
    const result     = await deleteSupportTicketAttachmentUseCase("ticket-1", "att-1", buildStorage(), repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/pertenece/);
  });

  it("does not call storage.delete when ownership check fails", async () => {
    const storageDelete = vi.fn();
    const attachment    = buildAttachment({ ticketId: "ticket-OTHER" });
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage({ delete: storageDelete }),
      buildRepo({ findById: vi.fn().mockResolvedValue(attachment) })
    );
    expect(storageDelete).not.toHaveBeenCalled();
  });

  it("does not call repository.delete when ownership check fails", async () => {
    const repoDelete = vi.fn();
    const attachment = buildAttachment({ ticketId: "ticket-OTHER" });
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage(),
      buildRepo({ findById: vi.fn().mockResolvedValue(attachment), delete: repoDelete })
    );
    expect(repoDelete).not.toHaveBeenCalled();
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("deleteSupportTicketAttachmentUseCase — happy path", () => {
  it("returns ok:true on success", async () => {
    const result = await deleteSupportTicketAttachmentUseCase("ticket-1", "att-1", buildStorage(), buildRepo());
    expect(result.ok).toBe(true);
  });

  it("deletes metadata row first, then storage file", async () => {
    const calls: string[] = [];
    const repoDelete    = vi.fn().mockImplementation(() => { calls.push("db"); });
    const storageDelete = vi.fn().mockImplementation(() => { calls.push("storage"); });
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage({ delete: storageDelete }),
      buildRepo({ delete: repoDelete })
    );
    expect(calls).toEqual(["db", "storage"]);
  });

  it("deletes storage file using the correct storageKey", async () => {
    const storageDelete = vi.fn().mockResolvedValue(undefined);
    const attachment    = buildAttachment({ storageKey: "tickets/t-1/custom-key" });
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage({ delete: storageDelete }),
      buildRepo({ findById: vi.fn().mockResolvedValue(attachment) })
    );
    expect(storageDelete).toHaveBeenCalledWith("tickets/t-1/custom-key");
  });
});

// ─── Failure cases ────────────────────────────────────────────────────────────

describe("deleteSupportTicketAttachmentUseCase — failure cases", () => {
  it("returns ok:false (no partial) when metadata delete fails", async () => {
    const repo   = buildRepo({ delete: vi.fn().mockRejectedValue(new Error("DB fail")) });
    const result = await deleteSupportTicketAttachmentUseCase("ticket-1", "att-1", buildStorage(), repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.partial).toBeUndefined();
  });

  it("does not call storage.delete when metadata delete fails", async () => {
    const storageDelete = vi.fn();
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage({ delete: storageDelete }),
      buildRepo({ delete: vi.fn().mockRejectedValue(new Error("DB fail")) })
    );
    expect(storageDelete).not.toHaveBeenCalled();
  });

  it("returns ok:false with partial:true when storage delete fails after metadata is deleted", async () => {
    const result = await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-1",
      buildStorage({ delete: vi.fn().mockRejectedValue(new Error("storage fail")) }),
      buildRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.partial).toBe(true);
  });
});

// ─── Security ─────────────────────────────────────────────────────────────────

describe("deleteSupportTicketAttachmentUseCase — security", () => {
  it("only deletes the attachment with the given ID (no wildcard)", async () => {
    const repoDelete = vi.fn().mockResolvedValue(undefined);
    await deleteSupportTicketAttachmentUseCase(
      "ticket-1", "att-specific",
      buildStorage(),
      buildRepo({
        delete:  repoDelete,
        findById: vi.fn().mockResolvedValue(buildAttachment({ id: "att-specific" })),
      })
    );
    expect(repoDelete).toHaveBeenCalledWith("att-specific");
    expect(repoDelete).toHaveBeenCalledTimes(1);
  });
});
