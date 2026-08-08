import { describe, expect, it } from "vitest";
import { buildCvDefinition, buildLetterDefinition } from "../browserPdf";

const cv = {
  name: "Enes Sejdini",
  headline: "Machine learning engineer",
  contact: ["Leipzig, Germany", "Email: a@b.c"],
  sections: [
    { heading: "Profile", bullets: ["Summary line."] },
    { heading: "Education", bullets: ["MSc Data Science", "BSc CS"] },
  ],
};

describe("buildCvDefinition", () => {
  it("renders the name, headline and contact header", () => {
    const { content } = buildCvDefinition(cv);
    const first = content[0] as { text: string; bold?: boolean };
    expect(first.text).toBe("Enes Sejdini");
    expect(first.bold).toBe(true);
    const contact = content.find(
      (c) => typeof c === "object" && c !== null && (c as { text?: string }).text?.includes("Leipzig"),
    ) as { text: string };
    expect(contact.text).toContain("•");
  });

  it("renders every section with uppercase headings and bullets", () => {
    const { content } = buildCvDefinition(cv);
    const serialized = JSON.stringify(content);
    expect(serialized).toContain("PROFILE");
    expect(serialized).toContain("EDUCATION");
    expect(serialized).toContain("MSc Data Science");
    expect(serialized).toContain("Summary line.");
    const list = content.find((c) => typeof c === "object" && c !== null && "ul" in (c as { ul?: unknown }));
    expect(list).toBeDefined();
  });

  it("omits the contact block when there is none", () => {
    const { content } = buildCvDefinition({ ...cv, contact: [] });
    expect(JSON.stringify(content)).not.toContain("•");
  });
});

describe("buildLetterDefinition", () => {
  it("lays out company, justified paragraphs and signoff", () => {
    const { content, defaultStyle } = buildLetterDefinition({
      recipientCompany: "Monzo",
      paragraphs: ["I am writing to apply.", "Evidence: two years of ML."],
      signoffName: "Enes Sejdini",
    });
    const serialized = JSON.stringify(content);
    expect(serialized).toContain("Monzo");
    expect(serialized).toContain("I am writing to apply.");
    expect(serialized).toContain("Enes Sejdini");
    expect(defaultStyle).toMatchObject({ lineHeight: 1.45 });
  });
});
