import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { CvFileError, extractCvText, factsExtractor } from "@/lib/facts";
import { store } from "@/lib/store";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  const body = new Uint8Array(await file.arrayBuffer());

  try {
    const text = await extractCvText(file.name, file.type, body);
    const extracted = await factsExtractor.extract(text);
    if (extracted.length === 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't extract career facts from that file. Try a CV with clear experience, skills, and education sections.",
        },
        { status: 422 },
      );
    }
    const meta = {
      fileName: file.name,
      fileSize: body.byteLength,
      uploadedAt: new Date().toISOString(),
    };
    const { facts } = await store.saveCv(user.id, meta, body, extracted);
    return NextResponse.json({
      fileName: meta.fileName,
      fileSize: meta.fileSize,
      factCount: facts.length,
    });
  } catch (error) {
    if (error instanceof CvFileError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("cv upload failed:", error);
    return NextResponse.json(
      { error: "Something went wrong reading the file. Please try again." },
      { status: 500 },
    );
  }
}
