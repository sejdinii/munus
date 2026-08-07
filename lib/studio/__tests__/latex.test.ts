import { describe, expect, it } from "vitest";
import { cvToLatex, letterToLatex, texEscape } from "../latex";

describe("texEscape", () => {
  it("escapes LaTeX specials", () => {
    expect(texEscape("100% & $5 #1 _x {y}")).toBe("100\\% \\& \\$5 \\#1 \\_x \\{y\\}");
  });

  it("escapes backslash, tilde and caret safely", () => {
    const out = texEscape("C:\\dev\\x ~ y ^ z");
    // Raw backslashes are gone (the path no longer appears as-is).
    expect(out).not.toContain("C:\\dev\\x");
    expect(out).toContain("\\textbackslash{}");
    expect(out).toContain("\\textasciitilde{}");
    expect(out).toContain("\\textasciicircum{}");
    // The textbackslash replacement itself must not be re-escaped.
    expect(out).not.toContain("\\textbackslash\\{");
  });

  it("maps typographic quotes and dashes to T1-safe forms", () => {
    expect(texEscape("Master’s — 2018–2022 … done")).toBe(
      "Master's --- 2018--2022 \\ldots{} done",
    );
    expect(texEscape("“quoted” ‘single’")).toBe('"quoted" \'single\'');
  });

  it("leaves plain text untouched", () => {
    expect(texEscape("Senior ML Engineer at Clera")).toBe(
      "Senior ML Engineer at Clera",
    );
  });
});

describe("cvToLatex", () => {
  it("renders name, headline and sections with bullets", () => {
    const tex = cvToLatex({
      name: "Enes Sejdini",
      headline: "Machine Learning Engineer",
      sections: [
        { heading: "Experience", bullets: ["Led analytics work", "Ran 672 experiments"] },
        { heading: "Skills", bullets: ["Python", "scikit-learn"] },
      ],
    });
    expect(tex).toContain("\\begin{document}");
    expect(tex).toContain("\\LARGE\\bfseries Enes Sejdini");
    expect(tex).toContain("\\cvsection{Experience}");
    expect(tex).toContain("\\item Led analytics work");
    expect(tex).toContain("\\item scikit-learn");
    expect(tex).toContain("\\end{document}");
  });

  it("escapes user content inside the document", () => {
    const tex = cvToLatex({
      name: "Enes & Co",
      headline: "100% committed",
      sections: [{ heading: "Skills", bullets: ["R & D", "C++"] }],
    });
    expect(tex).toContain("Enes \\& Co");
    expect(tex).toContain("100\\% committed");
    expect(tex).toContain("R \\& D");
  });
});

describe("letterToLatex", () => {
  it("renders paragraphs and signoff", () => {
    const tex = letterToLatex({
      recipientCompany: "Clera",
      paragraphs: ["Dear Clera team,", "Your Python needs match my skills."],
      signoffName: "Enes Sejdini",
    });
    expect(tex).toContain("\\LARGE\\bfseries Enes Sejdini");
    expect(tex).toContain("Dear Clera team,");
    expect(tex).toContain("Sincerely,");
    expect(tex).toContain("\\end{document}");
  });
});
