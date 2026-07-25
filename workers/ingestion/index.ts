/* Ingestion entry point.

   Two modes, and the split matters for unblocking:

     --dry-run  Hits the REAL feeds and reports what came back. Writes
                nothing, needs no database — so it requires ONLY the
                network policy, not Supabase credentials. This is the
                overdue "one real HTTP pass over every feed_url" action
                item from BACKLOG RISKS, automated: it tells us which of
                the 175 search-corroborated rows actually answer, and
                which need their slug re-checked before ingestion trusts
                them (contract rule #1).

     (default)  The real run, which needs a JobStore backed by Supabase.
                That implementation lands with credentials; until then
                this mode refuses to run rather than pretending.

   Run: npx tsx workers/ingestion/index.ts --dry-run [--limit 20] [--ats greenhouse]
*/

import { runnerCompanies } from "./config/identity";
import { runIngestion } from "./runner/run";
import type { FetchJson, FetchResult } from "./types";
import type { FeedHealth, JobStore, RunnerCompany } from "./runner/types";

/** Real network fetch — the only place in the worker that touches the wire. */
const httpFetchJson: FetchJson = async (url: string): Promise<FetchResult> => {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return { status: response.status, json: null };
    return { status: 200, json: await response.json() };
  } catch (error) {
    /* Network failure is not an HTTP status; surface it as a 0 so the
       runner records the company unhealthy instead of throwing the run.
       (FetchResult carries no error field — the adapters translate a
       non-200 into their own unhealthy result with a reason.) */
    void error;
    return { status: 0, json: null };
  }
};

/** Reports instead of persisting. The dry run must never write. */
function createDryRunStore(health: FeedHealth[]): JobStore {
  return {
    async upsertJobs(jobs) {
      return { count: jobs.length };
    },
    async markMissing() {
      return 0;
    },
    async recordFeedHealth(record) {
      health.push(record);
    },
  };
}

function parseArgs(argv: string[]) {
  const has = (flag: string) => argv.includes(flag);
  const value = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const limit = Number(value("--limit"));
  return {
    dryRun: has("--dry-run"),
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    ats: value("--ats"),
  };
}

export async function main(argv: string[] = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (!args.dryRun) {
    console.error(
      "Refusing to run: the live mode needs a Supabase-backed JobStore, which\n" +
        "lands with credentials. Use --dry-run to verify feeds without a database.",
    );
    process.exitCode = 1;
    return;
  }

  let companies: RunnerCompany[] = runnerCompanies();
  if (args.ats) companies = companies.filter((c) => c.ats === args.ats);
  if (args.limit) companies = companies.slice(0, args.limit);

  console.log(`Dry run · ${companies.length} feeds · no writes\n`);

  const health: FeedHealth[] = [];
  const summary = await runIngestion(companies, {
    fetchJson: httpFetchJson,
    now: () => Date.now(),
    log: () => {},
    store: createDryRunStore(health),
  });

  const healthy = health.filter((h) => h.ok);
  const quiet = healthy.filter((h) => h.jobCount === 0);
  const broken = health.filter((h) => !h.ok);

  console.log(`live      ${healthy.length - quiet.length}`);
  console.log(`quiet     ${quiet.length}  (200 with zero postings — healthy)`);
  console.log(`broken    ${broken.length}`);
  console.log(`jobs seen ${summary.jobsUpserted}`);
  console.log(`took      ${summary.durationMs}ms\n`);

  if (broken.length) {
    /* If EVERY feed failed the same way, the problem is almost certainly on
       our side (blocked egress / proxy), not 175 simultaneously-wrong slugs.
       Say so, rather than sending someone to re-verify good data. */
    const reasons = new Set(broken.map((h) => h.error ?? "unknown"));
    const allFailedIdentically =
      broken.length === health.length && reasons.size === 1;

    if (allFailedIdentically) {
      console.log(
        `All ${broken.length} feeds failed identically (${[...reasons][0]}).\n` +
          "That is an environment problem, not a data problem — check the\n" +
          "network policy allows the ATS hosts before re-verifying any slug.",
      );
    } else {
      console.log("Feeds needing a slug re-check before ingestion trusts them:");
      for (const h of broken) {
        console.log(`  ✗ ${h.company} (${h.ats}) — ${h.error ?? "unknown"}`);
      }
    }
  }
  return { summary, health };
}

/* Only self-execute as a script, never on import (tests import this file). */
const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1]?.includes("workers/ingestion/index");
if (isDirectRun) void main();
