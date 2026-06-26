// Binary content validation via magic bytes.
// File.type from the browser can be spoofed; this independently verifies that
// the raw bytes match the declared MIME type before allowing upload.

export type ContentValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

const TEXT_MIME_TYPES = new Set(["text/plain", "text/csv"]);

function checkBytes(
  view: DataView,
  expected: number[],
  offset: number
): ContentValidationResult {
  if (view.byteLength < offset + expected.length) {
    return { valid: false, reason: "El archivo es demasiado pequeño para validar su tipo." };
  }
  const matches = expected.every((b, i) => view.getUint8(offset + i) === b);
  return matches
    ? { valid: true }
    : { valid: false, reason: "La firma del archivo no coincide con el tipo declarado." };
}

export function validateAttachmentContent(
  data: ArrayBuffer,
  mimeType: string
): ContentValidationResult {
  if (data.byteLength === 0) {
    return { valid: false, reason: "El archivo está vacío." };
  }

  const view = new DataView(data);

  // Text types: no NUL bytes in the first 512 bytes.
  if (TEXT_MIME_TYPES.has(mimeType)) {
    const sample = Math.min(data.byteLength, 512);
    for (let i = 0; i < sample; i++) {
      if (view.getUint8(i) === 0x00) {
        return { valid: false, reason: "El contenido del archivo no es texto legible." };
      }
    }
    return { valid: true };
  }

  switch (mimeType) {
    case "image/jpeg":
      return checkBytes(view, [0xFF, 0xD8, 0xFF], 0);

    case "image/png":
      return checkBytes(view, [0x89, 0x50, 0x4E, 0x47], 0);

    case "image/gif":
      // GIF87a or GIF89a — both start with GIF8.
      return checkBytes(view, [0x47, 0x49, 0x46, 0x38], 0);

    case "image/webp": {
      // RIFF at offset 0, then WEBP at offset 8.
      const riff = checkBytes(view, [0x52, 0x49, 0x46, 0x46], 0);
      if (!riff.valid) return riff;
      return checkBytes(view, [0x57, 0x45, 0x42, 0x50], 8);
    }

    case "application/pdf":
      return checkBytes(view, [0x25, 0x50, 0x44, 0x46, 0x2D], 0); // %PDF-

    case "application/zip":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      // Open Packaging Convention (ZIP-based) — PK\x03\x04
      return checkBytes(view, [0x50, 0x4B, 0x03, 0x04], 0);

    case "application/msword":
    case "application/vnd.ms-excel":
      // Legacy OLE2 Compound Document — D0 CF 11 E0
      return checkBytes(view, [0xD0, 0xCF, 0x11, 0xE0], 0);

    default:
      return { valid: false, reason: "Tipo de archivo no reconocido para validación de contenido." };
  }
}
