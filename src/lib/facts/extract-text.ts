// CV file → plain text. PDF and DOCX per the prototype's upload copy;
// plain text accepted as a convenience.

export const MAX_CV_BYTES = 5 * 1024 * 1024;

export class CvFileError extends Error {}

export async function extractCvText(
  fileName: string,
  mimeType: string,
  body: Uint8Array,
): Promise<string> {
  if (body.byteLength === 0) throw new CvFileError("The file is empty.");
  if (body.byteLength > MAX_CV_BYTES) {
    throw new CvFileError("That file is over 5 MB. Export a lighter PDF and try again.");
  }

  const ext = fileName.toLowerCase().split(".").pop() ?? "";

  if (ext === "pdf" || mimeType === "application/pdf") {
    const { extractText } = await import("unpdf");
    // pdf.js transfers (detaches) the buffer it receives — hand it a copy so
    // the caller's bytes stay usable for storage.
    const { text } = await extractText(new Uint8Array(body), { mergePages: true });
    return normalize(text);
  }

  if (
    ext === "docx" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({
      buffer: Buffer.from(body),
    });
    return normalize(value);
  }

  if (ext === "txt" || ext === "md" || mimeType.startsWith("text/")) {
    return normalize(new TextDecoder().decode(body));
  }

  throw new CvFileError("Use a PDF or DOCX file — that's what we can read reliably.");
}

function normalize(text: string): string {
  const cleaned = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (cleaned.length < 40) {
    throw new CvFileError(
      "We couldn't find readable text in that file. If it's a scanned PDF, export a text-based one.",
    );
  }
  return cleaned;
}
