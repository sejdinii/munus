import { createElement } from "react";
import { describe, expect, it } from "vitest";
// Node-side entry: renderToBuffer only exists on @react-pdf/renderer's node
// build (its browser build throws "environment error" for this export — see
// node_modules/@react-pdf/renderer/lib/react-pdf.browser.js). Under vitest's
// default "node" test environment, Vite's SSR module resolution reads the
// package's "main" field rather than "browser", so this plain import already
// resolves to the real node renderer — no dynamic import / node: condition
// workaround was needed in practice (verified by asserting a real, non-mock
// %PDF buffer below rather than trusting the import silently).
import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdf } from "./CvPdf";
import { LetterPdf } from "./LetterPdf";
import type { CvDocument, LetterDocument } from "./types";

const fixtureCv: CvDocument = {
  name: "Arben Sejdiu",
  headline: "Senior Product Designer · Europe",
  sections: [
    {
      heading: "Experience",
      bullets: [
        "Led discovery and product design for a new workflow product through launch at Aster.",
        "Partnered with engineering to ship a design system used across four product squads.",
      ],
    },
    {
      heading: "Skills",
      bullets: ["Product design", "Design systems", "User research"],
    },
  ],
};

const fixtureLetter: LetterDocument = {
  recipientCompany: "Northstar",
  paragraphs: [
    "Hello Northstar team,",
    "I'm applying for the Senior Product Designer role because the challenge closely matches the products I have spent the last six years designing.",
    "I would welcome the opportunity to discuss the work.",
  ],
  signoffName: "Arben Sejdiu",
};

function assertLooksLikePdf(buffer: Buffer) {
  expect(buffer.length).toBeGreaterThan(1000);
  expect(buffer.subarray(0, 4).toString("utf-8")).toBe("%PDF");
}

// Same typing gap as lib/pdf/render.ts: renderToBuffer wants
// ReactElement<DocumentProps>, our components expose a `doc` prop instead.
type RenderInput = Parameters<typeof renderToBuffer>[0];

describe("renderToBuffer(CvPdf) — node-side real render", () => {
  it("produces a real PDF buffer from fixture CV content", async () => {
    const buffer = await renderToBuffer(createElement(CvPdf, { doc: fixtureCv }) as RenderInput);
    assertLooksLikePdf(buffer);
  });
});

describe("renderToBuffer(LetterPdf) — node-side real render", () => {
  it("produces a real PDF buffer from fixture letter content", async () => {
    const buffer = await renderToBuffer(createElement(LetterPdf, { doc: fixtureLetter }) as RenderInput);
    assertLooksLikePdf(buffer);
  });
});
