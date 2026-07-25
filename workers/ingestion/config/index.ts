/**
 * workers/ingestion/config/index.ts
 *
 * Barrel for the ingestion config module: the seed-list of companies and the
 * beachhead vertical, both data rather than code (CONTRACTS §2 rules #1, #7).
 */

export type { SeedCompany, VerifiedVia } from "./seed";
export { SEED_COMPANIES } from "./seed";

export type { Vertical } from "./vertical";
export { DESIGN_EUROPE } from "./vertical";
