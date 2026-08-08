import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromCv } from "@/lib/cv/text";
import { extractFacts } from "@/lib/cv/facts";
import { recordUsage, costOf } from "@/lib/llm/meter";
import type { CvParseResult } from "@/lib/cv/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CV_BYTES = 10 * 1024 * 1024; // storage bucket limit (EVID-102)
const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

/**
 * POST /api/cv — upload the source CV, extract text, parse facts.
 * Server-side only: writes the file to the private `cv-uploads` bucket and
 * the facts to the `facts` table under the caller's profile (RLS-owned).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.includes(file.type) && !/\.(pdf|docx)$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Please choose a PDF or DOCX file." },
      { status: 400 },
    );
  }
  if (file.size > MAX_CV_BYTES) {
    return NextResponse.json(
      { error: "That file is larger than 10 MB — try a smaller export." },
      { status: 413 },
    );
  }

  const buffer = await file.arrayBuffer();

  // 1. Store the source file (private bucket; path is per-user).
  const objectPath = `${user.id}/${crypto.randomUUID()}.${file.name.toLowerCase().endsWith(".docx") ? "docx" : "pdf"}`;
  const { error: uploadError } = await supabase.storage
    .from("cv-uploads")
    .upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json(
      { error: "Could not store your CV — please try again." },
      { status: 500 },
    );
  }

  // 2. Extract text.
  let text: string;
  try {
    text = await extractTextFromCv(file.name, buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read that file.";
    return NextResponse.json({ error: message, documentId: null }, { status: 422 });
  }
  if (text.trim().length === 0) {
    return NextResponse.json(
      { error: "No readable text found in that file.", documentId: null },
      { status: 422 },
    );
  }

  // 3. Parse facts (Groq when configured, mock otherwise). Metered.
  const { facts, provider } = await extractFacts(
    text,
    { groqApiKey: process.env["GROQ_API_KEY"] },
    (usage) => {
      if (!usage) return;
      void recordUsage(supabase, {
        profileId: user.id,
        endpoint: "cv-parse",
        model: "openai/gpt-oss-120b",
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        costEur: costOf("openai/gpt-oss-120b", usage.promptTokens, usage.completionTokens),
      });
    },
  );

  // 4. Persist: replace the profile's fact set (one source of truth per upload).
  const { error: deleteError } = await supabase
    .from("facts")
    .delete()
    .eq("profile_id", user.id);
  if (deleteError) {
    return NextResponse.json(
      { error: "Could not update your profile facts." },
      { status: 500 },
    );
  }
  const rows = facts.map((fact) => ({
    profile_id: user.id,
    kind: fact.kind,
    content: fact.content,
    source_span: fact.source_span ?? null,
  }));
  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("facts").insert(rows);
    if (insertError) {
      return NextResponse.json(
        { error: "Could not save your profile facts." },
        { status: 500 },
      );
    }
  }

  const result: CvParseResult = {
    documentId: objectPath,
    fileName: file.name,
    facts,
    provider,
  };
  return NextResponse.json(result);
}
