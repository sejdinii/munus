/**
 * One-time W1 script: flips verifiedVia search -> http for seed rows whose
 * feed passed the real HTTP pass (dry-run 2026-08-07). Broken rows stay
 * "search" so nobody trusts them until re-checked. Run: npx tsx scripts/flip-seed-http.mts
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "workers", "ingestion", "config", "seed.ts");
const logPath = path.join(root, "w1-dryrun-full.log");

const log = readFileSync(logPath, "utf8");
const broken = new Set(
  [...log.matchAll(/✗ (.+?) \((greenhouse|lever|ashby|workable|smartrecruiters)\)/g)].map(
    (m) => `${m[1]}::${m[2]}`,
  ),
);
console.log(`broken rows from log: ${broken.size}`);

const lines = readFileSync(seedPath, "utf8").split("\n");
let flipped = 0;
let kept = 0;
const out = lines.map((line) => {
  const m = line.match(
    /^(\s*)row\("((?:[^"\\]|\\.)*)", "(greenhouse|lever|ashby|workable|smartrecruiters)", "((?:[^"\\]|\\.)*)", ([A-Z_0-9]+)\),/,
  );
  if (!m) return line;
  const [, indent, company, ats, url, batch] = m;
  const key = `${company}::${ats}`;
  if (broken.has(key)) {
    kept += 1;
    return line;
  }
  flipped += 1;
  return `${indent}httpRow("${company}", "${ats}", "${url}", ${batch}),`;
});

// Add the httpRow helper next to row().
let result = out.join("\n");
if (!result.includes("function httpRow(")) {
  result = result.replace(
    /^function row\(/m,
    `function httpRow(company: string, ats: AtsSource, feed_url: string, verifiedAt: string): SeedCompany {
  return { company, ats, feed_url, verifiedVia: "http", verifiedAt };
}

function row(`,
  );
}
writeFileSync(seedPath, result);
console.log(`flipped to http: ${flipped}`);
console.log(`kept as search:  ${kept}`);
