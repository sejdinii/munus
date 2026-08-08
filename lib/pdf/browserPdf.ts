/**
 * Client-side PDF rendering (W5b free deploy): the phone's own browser
 * renders the composed documents with pdfmake — no server, no TeX engine
 * in production. The LaTeX/Tectonic path (lib/studio/latex.ts +
 * /api/studio/export) stays in the repo as the WASM-upgrade reference.
 *
 * Pure builders are exported for tests; the pdfmake glue is dynamic-
 * imported at download time to keep the main bundle light.
 */

import type { CvDocument, LetterDocument } from "./types";

export type PdfContent = unknown[];

export function buildCvDefinition(doc: CvDocument): { content: PdfContent; defaultStyle?: Record<string, unknown> } {
  const content: PdfContent = [
    {
      text: doc.name,
      fontSize: 22,
      bold: true,
      alignment: "center",
      margin: [0, 0, 0, 2],
    },
    {
      text: doc.headline,
      fontSize: 11,
      italics: true,
      alignment: "center",
      color: "#555555",
      margin: [0, 0, 0, 4],
    },
  ];

  const contact = (doc.contact ?? []).filter((line) => line.trim().length > 0);
  if (contact.length > 0) {
    content.push({
      text: contact.join("  •  "),
      fontSize: 8.5,
      alignment: "center",
      color: "#666666",
      margin: [0, 0, 0, 10],
    });
  }

  for (const section of doc.sections) {
    content.push({
      text: section.heading.toUpperCase(),
      fontSize: 10,
      bold: true,
      color: "#1a1a1a",
      margin: [0, 8, 0, 2],
    });
    content.push({
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.6, lineColor: "#cccccc" }],
      margin: [0, 0, 0, 4],
    });
    content.push({
      ul: section.bullets.map((bullet) => ({
        text: bullet,
        fontSize: 9.5,
        margin: [0, 0, 0, 2],
      })),
    });
  }

  return {
    content,
    defaultStyle: { fontSize: 9.5, lineHeight: 1.3 },
  };
}

export function buildLetterDefinition(doc: LetterDocument): { content: PdfContent; defaultStyle?: Record<string, unknown> } {
  const content: PdfContent = [
    { text: doc.recipientCompany, fontSize: 11, bold: true, margin: [0, 0, 0, 12] },
    ...doc.paragraphs.map((p) => ({
      text: p,
      fontSize: 10.5,
      margin: [0, 0, 0, 10],
      alignment: "justify" as const,
    })),
    { text: doc.signoffName, fontSize: 10.5, bold: true, margin: [0, 14, 0, 0] },
  ];
  return {
    content,
    defaultStyle: { fontSize: 10.5, lineHeight: 1.45 },
  };
}

/** Renders a composed document to a PDF blob — call from the browser only. */
export async function renderPdf(
  definition: { content: PdfContent; defaultStyle?: Record<string, unknown> },
): Promise<Blob> {
  /* The build/pdfmake.js UMD exports createPdf as a method on the module
     object (types lag the 0.3 runtime — cast through the real shape). */
  const [modulePromise, vfsPromise] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  const engine = (modulePromise as unknown as {
    default?: PdfEngine;
    createPdf?: PdfEngine["createPdf"];
  });
  const createPdf = engine.default?.createPdf ?? engine.createPdf;
  const vfs = (vfsPromise as unknown as { default?: { vfs?: Record<string, string> } }).default;
  if (!createPdf || !vfs?.vfs) throw new Error("pdf engine failed to load");
  /* Register the bundled fonts — without them createPdf throws (no
     glyphs to embed) and the download never happens. */
  const engineObj = (engine.default ?? engine) as PdfEngine & { vfs?: Record<string, string> };
  engineObj.vfs = vfs.vfs;
  return new Promise<Blob>((resolve, reject) => {
    try {
      const doc = createPdf(definition as never);
      doc.getBlob((blob: Blob) => resolve(blob));
    } catch (err) {
      reject(err instanceof Error ? err : new Error("pdf render failed"));
    }
  });
}

type PdfEngine = {
  createPdf: (definition: unknown, options?: unknown) => { getBlob: (cb: (blob: Blob) => void) => void };
};
