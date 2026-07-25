import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";
import { CvPdf } from "./CvPdf";
import { LetterPdf } from "./LetterPdf";
import type { CvDocument, LetterDocument } from "./types";

// Plain .ts (no JSX) per spec — createElement keeps this file free of the
// tsx extension while still handing react-pdf a real element tree.

// react-pdf types `pdf()`'s argument as ReactElement<DocumentProps>, but our
// <CvPdf>/<LetterPdf> wrapper components take their own `doc` prop instead —
// a real element that renders a <Document> underneath, but structurally
// disjoint from DocumentProps at the top level (a known react-pdf typing
// gap). render.test.ts proves the runtime behavior by actually rendering
// bytes, which is what's authoritative here, not this signature.
type PdfInput = Parameters<typeof pdf>[0];

export async function renderCvPdf(doc: CvDocument): Promise<Blob> {
  return pdf(createElement(CvPdf, { doc }) as PdfInput).toBlob();
}

export async function renderLetterPdf(doc: LetterDocument): Promise<Blob> {
  return pdf(createElement(LetterPdf, { doc }) as PdfInput).toBlob();
}

/**
 * Trigger a browser download for an already-rendered PDF blob.
 * No-ops outside a browser (SSR, node test runs) instead of throwing.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    return;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  /* Immediate revocation races the download in non-Chromium browsers
     (critic W3 #13) — defer it. */
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
