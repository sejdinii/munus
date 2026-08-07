import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { cvToLatex, letterToLatex } from "@/lib/studio/latex";
import type { CvDocument, LetterDocument } from "@/lib/pdf/types";

/**
 * POST /api/studio/export — the LaTeX pipeline (founder direction):
 * the client sends the composed, verifier-gated document (accepted
 * suggestions only); this route renders LaTeX, compiles it with Tectonic
 * and returns the PDF. Auth-bound. The TeX binary is
 * TECTONIC_BIN (env) or `tectonic` on PATH.
 */

export const runtime = "nodejs";
export const maxDuration = 120;

const execFileAsync = promisify(execFile);
const TECTONIC = process.env.TECTONIC_BIN ?? "tectonic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const b = (body ?? {}) as { kind?: unknown; doc?: unknown };
  const kind = b.kind === "letter" ? "letter" : b.kind === "cv" ? "cv" : null;
  if (!kind || !b.doc || typeof b.doc !== "object") {
    return NextResponse.json({ error: "doc required" }, { status: 400 });
  }

  const tex =
    kind === "cv"
      ? cvToLatex(b.doc as CvDocument)
      : letterToLatex(b.doc as LetterDocument);

  const dir = await mkdtemp(path.join(tmpdir(), "munus-export-"));
  const texName = kind === "cv" ? "cv.tex" : "letter.tex";
  try {
    await writeFile(path.join(dir, texName), tex, "utf8");
    /* First run downloads CTAN packages on demand; Tectonic caches them
       under the user profile afterwards. */
    await execFileAsync(TECTONIC, [texName], {
      cwd: dir,
      timeout: 120_000,
      maxBuffer: 16 * 1024 * 1024,
    });
    const pdf = await readFile(path.join(dir, texName.replace(/\.tex$/, ".pdf")));
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${kind === "cv" ? "CV" : "Cover-letter"}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "[export] latex compile failed:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json({ error: "latex compile failed" }, { status: 500 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
