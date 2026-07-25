/* Bridges the seed config to the runner (slice B's shared-change request).

   The runner groups by `companyId` so a company mid-ATS-migration (Alan,
   Back Market, Ledger — contract rule #4) resolves to ONE authoritative
   feed instead of double-listing its jobs. That only works if both of a
   company's rows carry the SAME id, so identity is derived from the
   company name rather than from the feed URL.

   Deliberately NOT a random uuid: the id must be stable across runs and
   across processes, because it is how a job found today is recognised as
   the same company's job tomorrow. The database assigns real uuids on
   insert; this is the ingestion-side correlation key. */

import type { SeedCompany } from "./seed";
import { SEED_COMPANIES } from "./seed";

export type RunnerSeedCompany = SeedCompany & { companyId: string };

/** Stable slug from a display name: "Trade Republic" → "trade-republic". */
export function companyIdFor(company: string): string {
  return company
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The seed list in the shape the runner consumes. */
export function runnerCompanies(
  companies: SeedCompany[] = SEED_COMPANIES,
): RunnerSeedCompany[] {
  return companies.map((c) => ({ ...c, companyId: companyIdFor(c.company) }));
}

/** Company names that appear on more than one ATS — the dual-ATS set the
 *  runner must collapse. Exposed for observability, not control flow. */
export function dualAtsCompanyIds(
  companies: SeedCompany[] = SEED_COMPANIES,
): string[] {
  const seen = new Map<string, Set<string>>();
  for (const c of companies) {
    const id = companyIdFor(c.company);
    const sources = seen.get(id) ?? new Set<string>();
    sources.add(c.ats);
    seen.set(id, sources);
  }
  return [...seen.entries()]
    .filter(([, sources]) => sources.size > 1)
    .map(([id]) => id);
}
