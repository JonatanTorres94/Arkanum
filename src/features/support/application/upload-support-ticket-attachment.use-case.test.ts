import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadSupportTicketAttachmentUseCase } from "./upload-support-ticket-attachment.use-case";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";
import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";
import { ATTACHMENT_MAX_SIZE_BYTES } from "@/features/support/domain/support-ticket-attachment.types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeBuf(...bytes: number[]): ArrayBuffer {
  const ab   = new ArrayBuffer(Math.max(bytes.length, 12));
  const view = new DataView(ab);
  bytes.forEach((b, i) => view.setUint8(i, b));
  return ab;
}

// Valid PDF buffer with %PDF- magic bytes — required for content validation to pass.
const PDF_BUFFER = makeBuf(0x25, 0x50, 0x44, 0x46, 0x2D);

// Buffer with no recognisable magic bytes — fails content validation.
const BAD_BUFFER = new ArrayBuffer(20);

const VALID_INPUT = {
  filename:  "evidence.pdf",
  mimeType:  "application/pdf",
  sizeBytes: 512,
  data:      PDF_BUFFER,
};

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
    upload:       vi.fn().mockResolvedValue(undefined),
    getSignedUrl: vi.fn().mockResolvedValue("https://example.com/signed"),
    delete:       vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildRepo(overrides: Partial<SupportTicketAttachmentRepository> = {}): SupportTicketAttachmentRepository {
  return {
    create:        vi.fn().mockResolvedValue(buildAttachment()),
    findByTicketId: vi.fn().mockResolvedValue([]),
    findById:      vi.fn().mockResolvedValue(buildAttachment()),
    delete:        vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

// ─── Validation ──────────────────────────────────────────────────────────────

describe("uploadSupportTicketAttachmentUseCase — validation", () => {
  it("rejects empty filename", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, filename: "" }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/inválido/);
  });

  it("rejects whitespace-only filename", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, filename: "   " }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("rejects files exceeding 10 MB", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, sizeBytes: ATTACHMENT_MAX_SIZE_BYTES + 1 }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/10 MB/);
  });

  it("accepts file exactly at 10 MB", async () => {
    const upload = vi.fn().mockResolvedValue(undefined);
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, sizeBytes: ATTACHMENT_MAX_SIZE_BYTES, data: PDF_BUFFER }, null,
      buildStorage({ upload }), buildRepo()
    );
    expect(result.ok).toBe(true);
    expect(upload).toHaveBeenCalledOnce();
  });

  it("rejects disallowed MIME type", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, mimeType: "application/x-executable" }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/no permitido/);
  });

  it("rejects file whose magic bytes don't match the declared MIME", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, data: BAD_BUFFER }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/firma/);
  });

  it("rejects a spoofed file (EXE bytes declared as image/png)", async () => {
    // MZ header (Windows PE)
    const exeBuf = makeBuf(0x4D, 0x5A, 0x90, 0x00);
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, mimeType: "image/png", data: exeBuf }, null,
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(false);
  });

  it("does not call storage.upload when content validation fails", async () => {
    const upload = vi.fn();
    await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, data: BAD_BUFFER }, null,
      buildStorage({ upload }), buildRepo()
    );
    expect(upload).not.toHaveBeenCalled();
  });
});

// ─── Happy path ───────────────────────────────────────────────────────────────

describe("uploadSupportTicketAttachmentUseCase — happy path", () => {
  it("returns ok:true with the created attachment", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, "admin@example.com",
      buildStorage(), buildRepo()
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.attachment.filename).toBe("evidence.pdf");
    }
  });

  it("calls storage.upload with the correct key prefix and mime type", async () => {
    const upload = vi.fn().mockResolvedValue(undefined);
    await uploadSupportTicketAttachmentUseCase(
      "ticket-42", VALID_INPUT, null,
      buildStorage({ upload }), buildRepo()
    );
    const [key, , mimeType] = upload.mock.calls[0] as [string, ArrayBuffer, string];
    expect(key).toMatch(/^tickets\/ticket-42\//);
    expect(mimeType).toBe("application/pdf");
  });

  it("calls repository.create with the correct data", async () => {
    const create = vi.fn().mockResolvedValue(buildAttachment());
    await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, "uploader@test.com",
      buildStorage(), buildRepo({ create })
    );
    expect(create).toHaveBeenCalledWith(
      "ticket-1",
      expect.objectContaining({
        filename:   "evidence.pdf",
        mimeType:   "application/pdf",
        sizeBytes:  512,
        uploadedBy: "uploader@test.com",
      })
    );
  });

  it("trims leading/trailing whitespace from filename", async () => {
    const create = vi.fn().mockResolvedValue(buildAttachment({ filename: "file.pdf" }));
    await uploadSupportTicketAttachmentUseCase(
      "ticket-1", { ...VALID_INPUT, filename: "  file.pdf  " }, null,
      buildStorage(), buildRepo({ create })
    );
    const [, data] = create.mock.calls[0] as [string, { filename: string }];
    expect(data.filename).toBe("file.pdf");
  });
});

// ─── Storage failure ──────────────────────────────────────────────────────────

describe("uploadSupportTicketAttachmentUseCase — storage upload failure", () => {
  it("returns ok:false when storage.upload fails (no compensation needed)", async () => {
    const storage = buildStorage({ upload: vi.fn().mockRejectedValue(new Error("network")) });
    const create  = vi.fn();
    const result  = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, null,
      storage, buildRepo({ create })
    );
    expect(result.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });
});

// ─── Compensation ─────────────────────────────────────────────────────────────

describe("uploadSupportTicketAttachmentUseCase — compensation", () => {
  it("deletes orphaned file when DB insert fails", async () => {
    const storageDelete = vi.fn().mockResolvedValue(undefined);
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, null,
      buildStorage({ delete: storageDelete }),
      buildRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) })
    );
    expect(result.ok).toBe(false);
    expect(storageDelete).toHaveBeenCalledOnce();
  });

  it("returns ok:false (no partial) when DB fails and compensation succeeds", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, null,
      buildStorage({ delete: vi.fn().mockResolvedValue(undefined) }),
      buildRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.partial).toBeUndefined();
  });

  it("returns ok:false with partial:true when DB fails and compensation also fails", async () => {
    const result = await uploadSupportTicketAttachmentUseCase(
      "ticket-1", VALID_INPUT, null,
      buildStorage({ delete: vi.fn().mockRejectedValue(new Error("storage fail")) }),
      buildRepo({ create: vi.fn().mockRejectedValue(new Error("DB fail")) })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.partial).toBe(true);
  });
});
