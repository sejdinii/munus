/**
 * LaTeX renderer for tailored documents (founder direction 2026-08-07:
 * "do the CV tailoring with latex and pdf conversion"). The export pipeline
 * is: accepted verifier-gated suggestions → compose → LaTeX → Tectonic →
 * PDF. This module is deterministic and dependency-light: article class +
 * geometry + enumitem only, so Tectonic's on-demand CTAN fetch stays tiny.
 */

import type { CvDocument, LetterDocument } from "@/lib/pdf/types";

/**
 * Escape arbitrary text for LaTeX. Order matters: backslash is parked in a
 * placeholder first so the \textbackslash{} replacement (which itself
 * contains braces) is never re-escaped.
 */
export function texEscape(input: string): string {
  const PLACEHOLDER = "\u0000";
  return input
    .replace(/\\/g, PLACEHOLDER)
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    /* Typographic chars not covered by T1 fonts (missing-glyph warnings
       from the compile) — map to TeX equivalents. */
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, "\"")
    .replace(/\u201d/g, "\"")
    .replace(/\u2013/g, "--")
    .replace(/\u2014/g, "---")
    .replace(/\u2026/g, "\\ldots{}")
    .replace(new RegExp(PLACEHOLDER, "g"), "\\textbackslash{}");
}

const CV_PREAMBLE = `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=1.9cm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\newcommand{\\cvsection}[1]{%
  \\vspace{8pt}%
  {\\large\\bfseries #1}\\\\[2pt]%
  \\rule{\\linewidth}{0.4pt}\\\\[5pt]%
}
\\begin{document}`;

const CV_CLOSING = `\\end{document}`;

export function cvToLatex(doc: CvDocument): string {
  const contactLines = (doc.contact ?? [])
    .filter((line) => line.trim().length > 0)
    .map((line) => texEscape(line))
    .join("  \\textbullet{}  ");
  const contactBlock = contactLines
    ? `\\begin{center}
  {\\small ${contactLines}}
\\end{center}`
    : "";

  const sections = doc.sections
    .map((section) => {
      const bullets = section.bullets
        .map((b) => `  \\item ${texEscape(b)}`)
        .join("\n");
      return `\\cvsection{${texEscape(section.heading)}}
\\begin{itemize}[leftmargin=1.2em,itemsep=1pt,topsep=2pt]
${bullets}
\\end{itemize}`;
    })
    .join("\n");

  return `${CV_PREAMBLE}
\\begin{center}
  {\\LARGE\\bfseries ${texEscape(doc.name)}}\\\\[3pt]
  {\\small\\itshape ${texEscape(doc.headline)}}\\\\[4pt]
  ${contactBlock ? `{\\footnotesize ${contactLines}}\\\\[2pt]` : ""}
\\end{center}
\\vspace{4pt}
${sections}
${CV_CLOSING}
`;
}

const LETTER_PREAMBLE = `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=2.2cm]{geometry}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}
\\begin{document}`;

export function letterToLatex(doc: LetterDocument): string {
  const paragraphs = doc.paragraphs.map((p) => texEscape(p)).join("\n\n");
  return `${LETTER_PREAMBLE}
{\\LARGE\\bfseries ${texEscape(doc.signoffName)}}\\\\[10pt]
${paragraphs}

\\vspace{16pt}
Sincerely,

${texEscape(doc.signoffName)}
\\end{document}
`;
}
