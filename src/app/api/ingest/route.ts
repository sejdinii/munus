import { NextRequest, NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { runIngestion } from "@/lib/ingest/run";

export const maxDuration = 300;

// Triggered by Vercel cron (vercel.json, every 30 min) or manually.
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the env var is
// set; without a secret configured, the route only runs in keyless dev mode.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  } else if (hasSupabase) {
    return NextResponse.json(
      { error: "Set CRON_SECRET to run ingestion against a real database." },
      { status: 401 },
    );
  }

  try {
    const report = await runIngestion();
    console.log(
      `ingest ${report.mode}: ${report.totals.upserted} upserted, ` +
        `${report.totals.closed} closed, ${report.totals.failures} failures`,
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("ingest run failed:", error);
    return NextResponse.json({ error: "Ingestion run failed." }, { status: 500 });
  }
}
