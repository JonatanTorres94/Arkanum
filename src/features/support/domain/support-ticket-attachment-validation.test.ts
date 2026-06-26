import { describe, it, expect } from "vitest";
import { validateAttachmentContent } from "./support-ticket-attachment-validation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buf(...bytes: number[]): ArrayBuffer {
  const ab   = new ArrayBuffer(Math.max(bytes.length, 12));
  const view = new DataView(ab);
  bytes.forEach((b, i) => view.setUint8(i, b));
  return ab;
}

function textBuf(content: string): ArrayBuffer {
  return new TextEncoder().encode(content).buffer;
}

// ─── Empty file ───────────────────────────────────────────────────────────────

describe("validateAttachmentContent — empty buffer", () => {
  it("rejects an empty buffer regardless of MIME type", () => {
    const result = validateAttachmentContent(new ArrayBuffer(0), "application/pdf");
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/vacío/);
  });
});

// ─── Text types ───────────────────────────────────────────────────────────────

describe("validateAttachmentContent — text types", () => {
  it("accepts plain ASCII text for text/plain", () => {
    const result = validateAttachmentContent(textBuf("Hello, world!"), "text/plain");
    expect(result.valid).toBe(true);
  });

  it("accepts CSV content for text/csv", () => {
    const result = validateAttachmentContent(textBuf("name,value\nfoo,1"), "text/csv");
    expect(result.valid).toBe(true);
  });

  it("rejects text/plain containing a NUL byte", () => {
    const result = validateAttachmentContent(buf(0x48, 0x65, 0x00, 0x6C), "text/plain");
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/legible/);
  });

  it("rejects text/csv containing a NUL byte", () => {
    const result = validateAttachmentContent(buf(0x61, 0x00), "text/csv");
    expect(result.valid).toBe(false);
  });
});

// ─── Image types ──────────────────────────────────────────────────────────────

describe("validateAttachmentContent — images", () => {
  it("accepts valid JPEG magic bytes", () => {
    const result = validateAttachmentContent(buf(0xFF, 0xD8, 0xFF, 0xE0), "image/jpeg");
    expect(result.valid).toBe(true);
  });

  it("rejects mismatched JPEG magic bytes", () => {
    const result = validateAttachmentContent(buf(0x89, 0x50, 0x4E, 0x47), "image/jpeg");
    expect(result.valid).toBe(false);
  });

  it("accepts valid PNG magic bytes", () => {
    const result = validateAttachmentContent(buf(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A), "image/png");
    expect(result.valid).toBe(true);
  });

  it("rejects mismatched PNG magic bytes", () => {
    const result = validateAttachmentContent(buf(0xFF, 0xD8, 0xFF), "image/png");
    expect(result.valid).toBe(false);
  });

  it("accepts valid GIF87a magic bytes", () => {
    const result = validateAttachmentContent(buf(0x47, 0x49, 0x46, 0x38, 0x37, 0x61), "image/gif");
    expect(result.valid).toBe(true);
  });

  it("accepts valid GIF89a magic bytes", () => {
    const result = validateAttachmentContent(buf(0x47, 0x49, 0x46, 0x38, 0x39, 0x61), "image/gif");
    expect(result.valid).toBe(true);
  });

  it("accepts valid WEBP (RIFF + WEBP)", () => {
    // RIFF at 0, arbitrary 4 bytes at 4-7, WEBP at 8
    const result = validateAttachmentContent(
      buf(0x52,0x49,0x46,0x46, 0x00,0x00,0x00,0x00, 0x57,0x45,0x42,0x50),
      "image/webp"
    );
    expect(result.valid).toBe(true);
  });

  it("rejects WEBP without RIFF header", () => {
    const result = validateAttachmentContent(
      buf(0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0x00, 0x57,0x45,0x42,0x50),
      "image/webp"
    );
    expect(result.valid).toBe(false);
  });

  it("rejects WEBP without WEBP marker at offset 8", () => {
    const result = validateAttachmentContent(
      buf(0x52,0x49,0x46,0x46, 0x00,0x00,0x00,0x00, 0x00,0x00,0x00,0x00),
      "image/webp"
    );
    expect(result.valid).toBe(false);
  });
});

// ─── PDF ─────────────────────────────────────────────────────────────────────

describe("validateAttachmentContent — PDF", () => {
  it("accepts valid PDF magic bytes (%PDF-)", () => {
    const result = validateAttachmentContent(buf(0x25,0x50,0x44,0x46,0x2D), "application/pdf");
    expect(result.valid).toBe(true);
  });

  it("rejects non-PDF content declared as application/pdf", () => {
    const result = validateAttachmentContent(buf(0xFF,0xD8,0xFF), "application/pdf");
    expect(result.valid).toBe(false);
  });
});

// ─── ZIP / Office Open XML ────────────────────────────────────────────────────

describe("validateAttachmentContent — ZIP and Office Open XML", () => {
  const ZIP_MAGIC = [0x50, 0x4B, 0x03, 0x04];

  it("accepts valid ZIP magic bytes for application/zip", () => {
    const result = validateAttachmentContent(buf(...ZIP_MAGIC), "application/zip");
    expect(result.valid).toBe(true);
  });

  it("accepts valid DOCX (ZIP-based)", () => {
    const result = validateAttachmentContent(
      buf(...ZIP_MAGIC),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(result.valid).toBe(true);
  });

  it("accepts valid XLSX (ZIP-based)", () => {
    const result = validateAttachmentContent(
      buf(...ZIP_MAGIC),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(result.valid).toBe(true);
  });

  it("rejects non-ZIP content declared as DOCX", () => {
    const result = validateAttachmentContent(
      buf(0xFF, 0xD8, 0xFF),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    expect(result.valid).toBe(false);
  });
});

// ─── Legacy Office (OLE2) ─────────────────────────────────────────────────────

describe("validateAttachmentContent — legacy Office (OLE2)", () => {
  const OLE2_MAGIC = [0xD0, 0xCF, 0x11, 0xE0];

  it("accepts valid OLE2 magic bytes for application/msword (DOC)", () => {
    const result = validateAttachmentContent(buf(...OLE2_MAGIC), "application/msword");
    expect(result.valid).toBe(true);
  });

  it("accepts valid OLE2 magic bytes for application/vnd.ms-excel (XLS)", () => {
    const result = validateAttachmentContent(buf(...OLE2_MAGIC), "application/vnd.ms-excel");
    expect(result.valid).toBe(true);
  });

  it("rejects non-OLE2 content declared as DOC", () => {
    const result = validateAttachmentContent(buf(0x50,0x4B,0x03,0x04), "application/msword");
    expect(result.valid).toBe(false);
  });
});

// ─── Spoofing scenarios ───────────────────────────────────────────────────────

describe("validateAttachmentContent — spoofing scenarios", () => {
  it("rejects an executable declared as image/png (no PNG magic)", () => {
    // MZ header (Windows PE) declared as PNG
    const result = validateAttachmentContent(buf(0x4D, 0x5A, 0x90, 0x00), "image/png");
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.reason).toMatch(/firma/);
  });

  it("rejects HTML content declared as text/plain (NUL byte presence)", () => {
    // Embed a NUL in what looks like HTML
    const result = validateAttachmentContent(buf(0x3C, 0x68, 0x74, 0x00, 0x6C, 0x3E), "text/plain");
    expect(result.valid).toBe(false);
  });

  it("rejects a JPEG declared as application/pdf", () => {
    const result = validateAttachmentContent(buf(0xFF, 0xD8, 0xFF), "application/pdf");
    expect(result.valid).toBe(false);
  });
});
