import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSupportTicketAttachmentSignedUrlUseCase } from "./get-support-ticket-attachment-signed-url.use-case";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";
import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";
import { SIGNED_URL_EXPIRY_SECONDS } from "@/features/support/domain/support-ticket-attachment.types";

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
    getSignedUrl: vi.fn().mockResolvedValue("https://example.com/signed?token=abc"),
    delete:       vi.fn(),
    ...overrides,
  };
}

function buildRepo(overrides: Partial<SupportTicketAttachmentRepository> = {}): SupportTicketAttachmentRepository {
  return {
    create:         vi.fn(),
    findByTicketId: vi.fn().mockResolvedValue([]),
    findById:       vi.fn().mockResolvedValue(buildAttachment()),
    delete:         vi.fn(),
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe("getSupportTicketAttachmentSignedUrlUseCase", () => {
  it("returns ok:false when attachment is not found", async () => {
    const repo   = buildRepo({ findById: vi.fn().mockResolvedValue(null) });
    const result = await getSupportTicketAttachmentSignedUrlUseCase("att-missing", buildStorage(), repo);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/encontrado/);
  });

  it("returns ok:true with signed URL and filename on success", async () => {
    const result = await getSupportTicketAttachmentSignedUrlUseCase("att-1", buildStorage(), buildRepo());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.url).toContain("signed");
      expect(result.filename).toBe("evidence.pdf");
    }
  });

  it("generates the URL using the attachment's storageKey", async () => {
    const getSignedUrl = vi.fn().mockResolvedValue("https://signed.url");
    const attachment   = buildAttachment({ storageKey: "tickets/t-1/custom-key" });
    await getSupportTicketAttachmentSignedUrlUseCase(
      "att-1",
      buildStorage({ getSignedUrl }),
      buildRepo({ findById: vi.fn().mockResolvedValue(attachment) })
    );
    expect(getSignedUrl).toHaveBeenCalledWith("tickets/t-1/custom-key", SIGNED_URL_EXPIRY_SECONDS);
  });

  it("uses the configured expiry duration", async () => {
    const getSignedUrl = vi.fn().mockResolvedValue("https://signed.url");
    await getSupportTicketAttachmentSignedUrlUseCase("att-1", buildStorage({ getSignedUrl }), buildRepo());
    const [, expiry] = getSignedUrl.mock.calls[0] as [string, number];
    expect(expiry).toBe(SIGNED_URL_EXPIRY_SECONDS);
    expect(expiry).toBeLessThanOrEqual(300); // short-lived
  });

  it("returns ok:false when signed URL generation fails", async () => {
    const storage = buildStorage({ getSignedUrl: vi.fn().mockRejectedValue(new Error("storage error")) });
    const result  = await getSupportTicketAttachmentSignedUrlUseCase("att-1", storage, buildRepo());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/enlace/);
  });
});
