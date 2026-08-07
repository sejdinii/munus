import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { extractTextFromCv } from "../text";

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "cv-fixture.pdf",
);

describe("extractTextFromCv (PDF)", () => {
  it("extracts readable text from a real PDF", async () => {
    const buffer = readFileSync(FIXTURE).buffer;
    const text = await extractTextFromCv("cv-fixture.pdf", buffer);
    expect(text).toContain("Enes Sejdini");
    expect(text).toContain("Product Designer");
    expect(text).toContain("design system");
  });

  it("rejects unsupported file names", async () => {
    await expect(
      extractTextFromCv("cv.txt", new Uint8Array([1, 2, 3]).buffer),
    ).rejects.toThrow(/Unsupported file type/);
  });
});
