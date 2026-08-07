/* One-time re-parse (W3 fix 2026-08-07): re-run the Groq CV→facts pipeline
   on the already-uploaded CV with the extended schema (profile + contact
   kinds) and upsert ONLY the new-kind facts, keeping the existing 42. */

import { readFileSync } from "node:fs";
import { Client } from "pg";
import { extractFactsGroq } from "../lib/cv/facts-groq";

process.loadEnvFile(".env.local");

const CV_PDF = "C:\\Users\\Enes Sejdini\\AppData\\Local\\hermes\\cache\\documents\\doc_ebaedc712037_My_CV.pdf";

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!apiKey || !dbUrl) throw new Error("GROQ_API_KEY / SUPABASE_DB_URL missing");

  // 1. text from the stored CV — pre-extracted to a .txt by the caller
  //    (pdfjs-equivalent extraction; raw PDF bytes are not text).
  const text = readFileSync("C:\\Users\\Enes Sejdini\\AppData\\Local\\Temp\\cv-text.txt", "utf8");
  console.log("cv text chars:", text.length);

  // 2. re-parse with the extended schema (provider: groq).
  const parsed = await extractFactsGroq(text, apiKey);
  console.log("parsed facts:", parsed.length, "provider: groq");
  const byKind = new Map<string, number>();
  for (const f of parsed) byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
  for (const [k, n] of byKind) console.log(`  parsed ${k}: ${n}`);

  // 3. FULL replace: the earlier parse missed outcome/education kinds
  //     entirely, so rebuild the evidence store from one consistent snapshot.
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const profile = await client.query(
    "select id from profiles limit 1",
  );
  if (profile.rowCount === 0) throw new Error("no profile row");
  const profileId = profile.rows[0].id as string;
  console.log("profile:", profileId);

  const deleted = await client.query("delete from facts where profile_id = $1", [profileId]);
  console.log("deleted old facts:", deleted.rowCount);

  let inserted = 0;
  for (const f of parsed) {
    await client.query(
      `insert into facts (profile_id, kind, content, source_span, created_at)
       values ($1, $2, $3, $4, now())`,
      [profileId, f.kind, f.content, f.source_span ?? null],
    );
    inserted += 1;
  }
  const count = await client.query(
    "select kind, count(*) from facts group by kind order by kind",
  );
  console.log("inserted:", inserted);
  for (const row of count.rows) console.log(`  ${row.kind}: ${row.count}`);
  await client.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
