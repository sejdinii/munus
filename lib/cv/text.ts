import { createRequire } from "module";
import { pathToFileURL } from "url";

/** Text extraction from CV files — server-only (route handlers).
 *  PDF via pdfjs-dist legacy build (pure Node, no DOM), DOCX via mammoth. */

/** Point pdfjs at the real worker file. Bundled Next server builds break
 *  the default fake-worker resolution ("Cannot find module
 *  .../chunks/pdf.worker.mjs"); a file:// URL to node_modules fixes it. */
function setPdfWorker(pdfjs: { GlobalWorkerOptions: { workerSrc?: string } }) {
  try {
    const require_ = createRequire(import.meta.url);
    const workerPath = require_.resolve(
      "pdfjs-dist/legacy/build/pdf.worker.mjs",
    );
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  } catch {
    try {
      // Fallback: `next start` runs from the project root.
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
        `${process.cwd()}/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs`,
      ).href;
    } catch {
      console.error("[cv] could not resolve pdf.worker.mjs");
    }
  }
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  setPdfWorker(pdfjs);
  // Copy into a fresh, transferable buffer: callers may hand us a view
  // over a pooled Node buffer, which postMessage refuses to transfer
  // ("Cannot transfer object of unsupported type").
  const data = new Uint8Array(buffer.byteLength);
  data.set(new Uint8Array(buffer));
  const doc = await pdfjs.getDocument({ data }).promise;
  try {
    const parts: string[] = [];
    for (let page = 1; page <= doc.numPages; page += 1) {
      const content = await doc.getPage(page);
      const text = await content.getTextContent();
      // Group text items into lines by their y-position (pdfjs emits
      // per-fragment items; joins produce readable paragraphs).
      let lastY: number | null = null;
      let line = "";
      for (const item of text.items) {
        if ("str" in item) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
            parts.push(line.trimEnd());
            line = "";
          }
          line += item.str;
          lastY = item.transform[5];
        }
      }
      if (line.trim()) parts.push(line.trimEnd());
    }
    return parts.join("\n");
  } finally {
    // pdfjs v6: destroy() lives on the loading task; guard for older shapes.
    await doc.loadingTask?.destroy?.();
  }
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
  return result.value;
}

export async function extractTextFromCv(
  fileName: string,
  buffer: ArrayBuffer,
): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return extractPdfText(buffer);
  if (lower.endsWith(".docx")) return extractDocxText(buffer);
  if (lower.endsWith(".doc")) {
    // Legacy binary .doc has no pure-JS extractor here; surface a clear
    // message so the client can offer the manual fallback.
    throw new Error(
      "Legacy .doc files are not supported yet — save as PDF or DOCX.",
    );
  }
  throw new Error("Unsupported file type.");
}
