import { createRequire } from "module";
import { pathToFileURL } from "url";

/* W5b deploy fix: Vercel's Node runtime throws "DOMMatrix is not defined"
   somewhere inside pdfjs during CV parsing (Node has no DOMMatrix global;
   the local 22.x build tolerates it, Vercel's doesn't). Rather than a
   native dep (breaks Turbopack's bundle), shim the API surface pdfjs
   actually touches. Text extraction never exercises transforms — the
   shim only needs to exist and answer the calls rendering paths make. */
if (typeof globalThis.DOMMatrix === "undefined") {
  class DOMMatrix {
    a: number; b: number; c: number; d: number; e: number; f: number;
    constructor(init?: number[] | string) {
      if (typeof init === "string") {
        const m = init.match(/matrix\(\s*([-\d.e]+)[,\s]+([-\d.e]+)[,\s]+([-\d.e]+)[,\s]+([-\d.e]+)[,\s]+([-\d.e]+)[,\s]+([-\d.e]+)\s*\)/);
        if (m) {
          const nums = m.slice(1).map(Number);
          this.a = nums[0]!; this.b = nums[1]!; this.c = nums[2]!;
          this.d = nums[3]!; this.e = nums[4]!; this.f = nums[5]!;
          return;
        }
      }
      const arr = Array.isArray(init) ? init : [];
      this.a = arr[0] ?? 1;
      this.b = arr[1] ?? 0;
      this.c = arr[2] ?? 0;
      this.d = arr[3] ?? 1;
      this.e = arr[4] ?? 0;
      this.f = arr[5] ?? 0;
    }
    scaleSelf(sx: number, sy = sx) {
      this.a *= sx; this.b *= sx; this.c *= sy; this.d *= sy;
      return this;
    }
    translateSelf(tx: number, ty = 0) {
      this.e += tx; this.f += ty;
      return this;
    }
    multiplySelf(other: DOMMatrix) {
      const { a, b, c, d, e, f } = this;
      this.a = a * other.a + c * other.b;
      this.b = b * other.a + d * other.b;
      this.c = a * other.c + c * other.d;
      this.d = b * other.c + d * other.d;
      this.e = a * other.e + c * other.f + e;
      this.f = b * other.e + d * other.f + f;
      return this;
    }
    inverse() {
      const { a, b, c, d, e, f } = this;
      const det = a * d - b * c;
      if (det === 0) return new DOMMatrix([1, 0, 0, 1, 0, 0]);
      const inv = new DOMMatrix([d / det, -b / det, -c / det, a / det, 0, 0]);
      inv.e = -(inv.a * e + inv.c * f);
      inv.f = -(inv.b * e + inv.d * f);
      return inv;
    }
    transformPoint(p: { x: number; y: number }) {
      return {
        x: this.a * p.x + this.c * p.y + this.e,
        y: this.b * p.x + this.d * p.y + this.f,
      };
    }
  }
  globalThis.DOMMatrix = DOMMatrix as unknown as typeof globalThis.DOMMatrix;
}

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
