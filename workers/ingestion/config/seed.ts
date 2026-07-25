/**
 * workers/ingestion/config/seed.ts
 *
 * The seed-list of ingestion companies, transcribed verbatim from
 * BACKLOG.md "SEED LIST" (founder batches 1-5, 2026-07-23 -> 2026-07-26).
 *
 * Ingestion adapter contract rule #1 (CONTRACTS.md §2): feed_url is
 * evidence-confirmed seed data and must NEVER be derived by slugifying
 * `company` — this file does not compute a single URL, it copies each one
 * exactly as the founder recorded it. Nothing here is guessed.
 *
 * Every row's verifiedVia is "search": BACKLOG's own URGENT/RISKS notes say
 * WebFetch was down for all five founder batches, so every slug + ATS pairing
 * was corroborated by finding a live job-posting page at that exact slug via
 * WebSearch, never by a direct HTTP hit on the JSON feed itself. Per rule #1
 * and the wave-5 spec, the standing action item ("one real HTTP pass over
 * every feed_url before the ingestion cron treats them as live") is NOT this
 * slice's job — it is recorded here so the flip from "search" to "http" is a
 * one-line-per-row data change once that verification pass happens, not a
 * schema change.
 *
 * Excluded rows (see final report for the full reasoning):
 * - Pollfish (Batch 4, Workable): the row's own caveat says the slug was
 *   inferred from a marketing subdomain and "NOT independently confirmed
 *   against the ... template the way the others in this batch were — verify
 *   this one first." Rule #1 forbids guessed slugs; this is exactly that.
 */

import type { AtsSource, CompanyFeed } from "../types";

/** How a row's (company, ats, feed_url) triple was corroborated. */
export type VerifiedVia = "search" | "http";

/**
 * One seed-list row. A structural superset of CompanyFeed (every SeedCompany
 * is a valid CompanyFeed) — adapters that only know about CompanyFeed can
 * still consume SEED_COMPANIES unchanged.
 */
export interface SeedCompany extends CompanyFeed {
  verifiedVia: VerifiedVia;
  /** Batch date this row was recorded in BACKLOG.md, ISO yyyy-mm-dd. */
  verifiedAt: string;
}

/** Shorthand for the "search, corroborated on this date" pair every current
 * row carries — see file header. */
function search(verifiedAt: string): Pick<SeedCompany, "verifiedVia" | "verifiedAt"> {
  return { verifiedVia: "search", verifiedAt };
}

function row(company: string, ats: AtsSource, feed_url: string, verifiedAt: string): SeedCompany {
  return { company, ats, feed_url, ...search(verifiedAt) };
}

const BATCH_1 = "2026-07-23"; // 50 companies
const BATCH_2 = "2026-07-23"; // 35 companies (same-day second batch)
const BATCH_3 = "2026-07-24"; // 31 companies
const BATCH_4 = "2026-07-25"; // 27 companies kept (Pollfish excluded)
const BATCH_5 = "2026-07-26"; // 32 companies

export const SEED_COMPANIES: SeedCompany[] = [
  // ---------------------------------------------------------------------
  // Batch 1 — 2026-07-23 (50 companies, all 5 ATS types represented)
  // ---------------------------------------------------------------------
  row("N26", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/n26/jobs?content=true", BATCH_1),
  row("Contentful", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/contentful/jobs?content=true", BATCH_1),
  row("Monzo", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/monzo/jobs?content=true", BATCH_1),
  row("GetYourGuide", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/getyourguide/jobs?content=true", BATCH_1),
  row("GoCardless", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/gocardless/jobs?content=true", BATCH_1),
  row("Typeform", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/typeform/jobs?content=true", BATCH_1),
  row("Algolia", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/algolia/jobs?content=true", BATCH_1),
  row("Snyk", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/snyk/jobs?content=true", BATCH_1),
  row("Miro", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/realtimeboardglobal/jobs?content=true", BATCH_1),
  row("GitLab", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true", BATCH_1),
  row("Bolt", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/boltv2/jobs?content=true", BATCH_1),
  row("Veriff", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/veriff/jobs?content=true", BATCH_1),
  row("Wolt", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/wolt/jobs?content=true", BATCH_1),
  row("Aiven", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/aiven36/jobs?content=true", BATCH_1),
  row("Celonis", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/celonis/jobs?content=true", BATCH_1),
  row("Trade Republic", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/traderepublicbank/jobs?content=true", BATCH_1),
  row("Grover", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/grover/jobs?content=true", BATCH_1),
  row("Choco", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/choco/jobs?content=true", BATCH_1),
  row("Taxfix", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/taxfix2/jobs?content=true", BATCH_1),
  row("Depop", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/depop/jobs?content=true", BATCH_1),
  row("TIER Mobility", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/tiermobility/jobs?content=true", BATCH_1),
  row("sennder", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/sennder/jobs?content=true", BATCH_1),
  row("Truecaller", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/truecaller/jobs?content=true", BATCH_1),
  row("Yubico", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/yubico/jobs?content=true", BATCH_1),
  row("Freetrade", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/freetrade/jobs?content=true", BATCH_1),
  row("TrueLayer", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/truelayer/jobs?content=true", BATCH_1),
  row("Cleo AI", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/cleoai/jobs?content=true", BATCH_1),
  row("Doctolib", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/doctolib/jobs?content=true", BATCH_1),
  row("Payhawk", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/payhawkio/jobs?content=true", BATCH_1),
  row("Mews", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/mewssystems/jobs?content=true", BATCH_1),
  row("Butternut Box", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/butternutbox/jobs?content=true", BATCH_1),

  row("Paddle", "ashby", "https://api.ashbyhq.com/posting-api/job-board/paddle", BATCH_1),
  row("Photoroom", "ashby", "https://api.ashbyhq.com/posting-api/job-board/photoroom", BATCH_1),
  row("Alan", "ashby", "https://api.ashbyhq.com/posting-api/job-board/alan", BATCH_1),
  row("Sorare", "ashby", "https://api.ashbyhq.com/posting-api/job-board/sorare", BATCH_1),
  row("Thought Machine", "ashby", "https://api.ashbyhq.com/posting-api/job-board/thought-machine", BATCH_1),
  row("Ankorstore", "ashby", "https://api.ashbyhq.com/posting-api/job-board/ankorstore", BATCH_1),

  row("Onfido", "workable", "https://apply.workable.com/api/v1/widget/accounts/onfido", BATCH_1),

  row("Spendesk", "lever", "https://api.lever.co/v0/postings/spendesk?mode=json", BATCH_1),
  row("BlaBlaCar", "lever", "https://api.lever.co/v0/postings/blablacar?mode=json", BATCH_1),
  row("Qonto", "lever", "https://api.lever.co/v0/postings/qonto?mode=json", BATCH_1),
  row("Aircall", "lever", "https://api.lever.co/v0/postings/aircall?mode=json", BATCH_1),
  row("Back Market", "lever", "https://api.lever.co/v0/postings/backmarket?mode=json", BATCH_1),
  row("Ledger", "lever", "https://api.lever.co/v0/postings/ledger?mode=json", BATCH_1),
  row("Contentsquare", "lever", "https://api.lever.co/v0/postings/contentsquare?mode=json", BATCH_1),
  row("Swile", "lever", "https://api.lever.co/v0/postings/swile?mode=json", BATCH_1),
  row("Moneybox", "lever", "https://api.lever.co/v0/postings/moneyboxapp?mode=json", BATCH_1),

  row("Wise", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Wise/postings", BATCH_1),
  row("Delivery Hero", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/DeliveryHero/postings", BATCH_1),
  row("Cint", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Cint/postings", BATCH_1),

  // ---------------------------------------------------------------------
  // Batch 2 — 2026-07-23 (35 companies, widened beyond fintech/mobility)
  // ---------------------------------------------------------------------
  row("Adyen", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/adyen/jobs?content=true", BATCH_2),
  row("Picnic", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/try-picnic/jobs?content=true", BATCH_2),
  row("Pleo", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/pleo/jobs?content=true", BATCH_2),
  row("Too Good To Go", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/toogoodtogo/jobs?content=true", BATCH_2),
  row("Oura", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/oura/jobs?content=true", BATCH_2),
  row("Cabify", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/cabify/jobs?content=true", BATCH_2),
  row("Glovo", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/glovo/jobs?content=true", BATCH_2),
  row("TravelPerk", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/travelperk/jobs?content=true", BATCH_2),
  row("Bitpanda", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/bitpanda/jobs?content=true", BATCH_2),
  row("GoStudent", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/gostudent/jobs?content=true", BATCH_2),
  row("Babbel", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/babbel/jobs?content=true", BATCH_2),
  row("Intercom", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/intercom/jobs?content=true", BATCH_2),
  row("HelloFresh", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/hellofresh/jobs?content=true", BATCH_2),
  row("Collibra", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/collibra/jobs?content=true", BATCH_2),
  row("Showpad", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/showpad/jobs?content=true", BATCH_2),
  row("Smartly.io", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/smartlyio/jobs?content=true", BATCH_2),
  row("Mirakl", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/mirakl/jobs?content=true", BATCH_2),
  row("Deliveroo", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/deliveroo/jobs?content=true", BATCH_2),
  row("Ada Health", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/adahealth/jobs?content=true", BATCH_2),
  row("Templafy", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/templafy/jobs?content=true", BATCH_2),
  row("Wallapop", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/wallapop/jobs?content=true", BATCH_2),
  row("Darktrace", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/darktracelimited/jobs?content=true", BATCH_2),
  row("Livi (Kry)", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/livi/jobs?content=true", BATCH_2),
  row("ManyPets", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/manygroup/jobs?content=true", BATCH_2),
  row("Tourlane", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/tourlanegmbh/jobs?content=true", BATCH_2),

  row("Farfetch", "lever", "https://api.lever.co/v0/postings/farfetch?mode=json", BATCH_2),
  row("Vestiaire Collective", "lever", "https://api.lever.co/v0/postings/vestiairecollective?mode=json", BATCH_2),
  row("Trustly", "lever", "https://api.lever.co/v0/postings/trustly?mode=json", BATCH_2),
  row("Deliverect", "lever", "https://api.lever.co/v0/postings/deliverect?mode=json", BATCH_2),

  row("Wayflyer", "ashby", "https://api.ashbyhq.com/posting-api/job-board/wayflyer", BATCH_2),
  row("n8n", "ashby", "https://api.ashbyhq.com/posting-api/job-board/n8n", BATCH_2),
  row("Improbable", "ashby", "https://api.ashbyhq.com/posting-api/job-board/improbable", BATCH_2),

  row("Gousto", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Gousto1/postings", BATCH_2),
  row("Docplanner", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Docplanner/postings", BATCH_2),

  row("Wallbox", "workable", "https://apply.workable.com/api/v1/widget/accounts/wallbox", BATCH_2),

  // ---------------------------------------------------------------------
  // Batch 3 — 2026-07-24 (31 companies, Ashby/Workable/SmartRecruiters push)
  // ---------------------------------------------------------------------
  row("Satispay", "ashby", "https://api.ashbyhq.com/posting-api/job-board/satispay", BATCH_3),
  row("Docebo", "ashby", "https://api.ashbyhq.com/posting-api/job-board/docebo", BATCH_3),
  row("ElevenLabs", "ashby", "https://api.ashbyhq.com/posting-api/job-board/elevenlabs", BATCH_3),
  row("Synthesia", "ashby", "https://api.ashbyhq.com/posting-api/job-board/synthesia", BATCH_3),
  row("Tessl", "ashby", "https://api.ashbyhq.com/posting-api/job-board/tesslcareers", BATCH_3),
  row("Sequence", "ashby", "https://api.ashbyhq.com/posting-api/job-board/sequence", BATCH_3),
  row("bunch", "ashby", "https://api.ashbyhq.com/posting-api/job-board/bunch", BATCH_3),
  row("Voodoo", "ashby", "https://api.ashbyhq.com/posting-api/job-board/voodoo", BATCH_3),
  row("Numeral", "ashby", "https://api.ashbyhq.com/posting-api/job-board/numeral", BATCH_3),
  row("Fanvue", "ashby", "https://api.ashbyhq.com/posting-api/job-board/fanvue.com", BATCH_3),
  row("Lovable", "ashby", "https://api.ashbyhq.com/posting-api/job-board/lovable", BATCH_3),
  row("Rossum", "ashby", "https://api.ashbyhq.com/posting-api/job-board/rossum.ai", BATCH_3),
  row("Aleph Alpha", "ashby", "https://api.ashbyhq.com/posting-api/job-board/AlephAlpha", BATCH_3),
  row("DeepL", "ashby", "https://api.ashbyhq.com/posting-api/job-board/DeepL", BATCH_3),
  row("Multiverse", "ashby", "https://api.ashbyhq.com/posting-api/job-board/multiverse", BATCH_3),

  row("Scalapay", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/scalapaysrl/jobs?content=true", BATCH_3),
  row("Huspy", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/huspy/jobs?content=true", BATCH_3),
  row("Proton", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/proton/jobs?content=true", BATCH_3),
  row("Lenus (Health)", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/lenusehealth/jobs?content=true", BATCH_3),
  row("Feedzai", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/feedzai/jobs?content=true", BATCH_3),
  row("Shift Technology", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/shifttechnology/jobs?content=true", BATCH_3),

  row("Musixmatch", "workable", "https://apply.workable.com/api/v1/widget/accounts/musixmatch", BATCH_3),
  row("Fioneer (SAP Fioneer)", "workable", "https://apply.workable.com/api/v1/widget/accounts/fioneer", BATCH_3),
  row("Ververica", "workable", "https://apply.workable.com/api/v1/widget/accounts/ververica", BATCH_3),
  row("Booksy", "workable", "https://apply.workable.com/api/v1/widget/accounts/booksy-1", BATCH_3),

  row("Sword Health", "lever", "https://api.lever.co/v0/postings/swordhealth?mode=json", BATCH_3),
  row("Mistral AI", "lever", "https://api.lever.co/v0/postings/mistral?mode=json", BATCH_3),
  row("Jobgether", "lever", "https://api.lever.co/v0/postings/jobgether?mode=json", BATCH_3),

  row("Nexthink", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Nexthink/postings", BATCH_3),
  row("SIXT", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/SIXT/postings", BATCH_3),
  row("ABOUT YOU", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/aboutyougmbh/postings", BATCH_3),

  // ---------------------------------------------------------------------
  // Batch 4 — 2026-07-25 (geography gaps + Workable/SmartRecruiters push)
  // Tranche 1 — geography-gap countries. Pollfish EXCLUDED, see file header.
  // ---------------------------------------------------------------------
  row("Tines", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/tines/jobs?content=true", BATCH_4),
  row("LetsGetChecked", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/letsgetchecked/jobs?content=true", BATCH_4),
  row("Flipdish", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/flipdish/jobs?content=true", BATCH_4),
  row("Fenergo", "workable", "https://apply.workable.com/api/v1/widget/accounts/fenergocareers", BATCH_4),
  row("TransferMate", "workable", "https://apply.workable.com/api/v1/widget/accounts/transfermate", BATCH_4),
  row("Version 1", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Version1/postings", BATCH_4),
  row("Cognite", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/cognite/jobs?content=true", BATCH_4),
  row("Supermetrics", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/supermetricsoy/jobs?content=true", BATCH_4),
  row("Dealfront", "workable", "https://apply.workable.com/api/v1/widget/accounts/dealfront", BATCH_4),
  row("MaaS Global (Whim)", "workable", "https://apply.workable.com/api/v1/widget/accounts/maas-global", BATCH_4),
  row("Metacore", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/metacore/jobs?content=true", BATCH_4),
  row("AlphaSense Helsinki", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/alphasensehelsinki/jobs?content=true", BATCH_4),
  row("Skroutz", "workable", "https://apply.workable.com/api/v1/widget/accounts/skroutz", BATCH_4),
  row("Orfium", "workable", "https://apply.workable.com/api/v1/widget/accounts/orfium", BATCH_4),
  row("Epignosis (TalentLMS)", "workable", "https://apply.workable.com/api/v1/widget/accounts/epignosis", BATCH_4),
  // Pollfish excluded here on purpose — see file header.
  row("FreeNow", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/freenow/jobs?content=true", BATCH_4),
  row("UiPath", "ashby", "https://api.ashbyhq.com/posting-api/job-board/uipath", BATCH_4),
  row("MultiversX (fka Elrond)", "lever", "https://api.lever.co/v0/postings/multiversx?mode=json", BATCH_4),

  // Tranche 2 — general Ashby/Lever/SmartRecruiters/Greenhouse push.
  row("Poolside", "ashby", "https://api.ashbyhq.com/posting-api/job-board/poolside", BATCH_4),
  row("Bloomreach", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/bloomreach/jobs?content=true", BATCH_4),
  row("Ledgy", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/ledgy/jobs?content=true", BATCH_4),
  row("Alice & Bob", "lever", "https://api.lever.co/v0/postings/alice-bob?mode=json", BATCH_4),
  row("Deezer", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/Deezer/postings", BATCH_4),
  row("Ubisoft", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/ubisoft2/postings", BATCH_4),
  row("Helsing", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/helsing/jobs?content=true", BATCH_4),
  row("Attio", "ashby", "https://api.ashbyhq.com/posting-api/job-board/attio", BATCH_4),
  row("Silverfin", "lever", "https://api.eu.lever.co/v0/postings/silverfin?mode=json", BATCH_4),

  // ---------------------------------------------------------------------
  // Batch 5 — 2026-07-26 (32 companies, volume push — corrections + new hubs)
  // ---------------------------------------------------------------------
  row("Mollie", "ashby", "https://api.ashbyhq.com/posting-api/job-board/mollie", BATCH_5),
  row("Kittl", "ashby", "https://api.ashbyhq.com/posting-api/job-board/kittl", BATCH_5),
  row("Polarsteps", "ashby", "https://api.ashbyhq.com/posting-api/job-board/polarsteps", BATCH_5),
  row("Packmatic", "lever", "https://api.lever.co/v0/postings/Packmatic?mode=json", BATCH_5),
  row("Axelera AI", "ashby", "https://api.ashbyhq.com/posting-api/job-board/axelera", BATCH_5),
  row("Clera", "ashby", "https://api.ashbyhq.com/posting-api/job-board/Clera", BATCH_5),
  row("Stacks", "ashby", "https://api.ashbyhq.com/posting-api/job-board/stacks", BATCH_5),
  row("TheFork", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/thefork/jobs?content=true", BATCH_5),
  row("OLX Group", "lever", "https://api.eu.lever.co/v0/postings/olx?mode=json", BATCH_5),
  row("Uncapped", "workable", "https://apply.workable.com/api/v1/widget/accounts/uncapped", BATCH_5),
  row("Bondora", "greenhouse", "https://boards-api.eu.greenhouse.io/v1/boards/bondora/jobs?content=true", BATCH_5),
  row("CREALOGIX", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/CREALOGIX/postings", BATCH_5),
  row("Speechify", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/speechify/jobs?content=true", BATCH_5),
  row("Scalable Capital (Scalable GmbH)", "smartrecruiters", "https://api.smartrecruiters.com/v1/companies/ScalableGmbH/postings", BATCH_5),
  row("AutoScout24", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/autoscout24/jobs?content=true", BATCH_5),
  row("Graphcore", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/graphcore/jobs?content=true", BATCH_5),
  row("Mesh", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/mesh/jobs?content=true", BATCH_5),
  row("Zowie", "ashby", "https://api.ashbyhq.com/posting-api/job-board/zowie", BATCH_5),
  row("Prosus", "lever", "https://api.eu.lever.co/v0/postings/prosus?mode=json", BATCH_5),
  row("Netlight", "lever", "https://api.lever.co/v0/postings/netlight?mode=json", BATCH_5),
  row("PropHero", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/prophero/jobs?content=true", BATCH_5),
  row("Marshmallow", "workable", "https://apply.workable.com/api/v1/widget/accounts/marshmallow", BATCH_5),
  row("ComplyAdvantage", "greenhouse", "https://boards-api.greenhouse.io/v1/boards/complyadvantage/jobs?content=true", BATCH_5),
  row("Zego", "workable", "https://apply.workable.com/api/v1/widget/accounts/zego", BATCH_5),
  row("Plum", "workable", "https://apply.workable.com/api/v1/widget/accounts/withplum", BATCH_5),
  row("Moneyfarm", "workable", "https://apply.workable.com/api/v1/widget/accounts/moneyfarm", BATCH_5),
  row("Curve", "workable", "https://apply.workable.com/api/v1/widget/accounts/curve-1", BATCH_5),
  row("Vivid Money", "workable", "https://apply.workable.com/api/v1/widget/accounts/vivid-money", BATCH_5),
  row("Zopa", "lever", "https://api.lever.co/v0/postings/zopa?mode=json", BATCH_5),
  row("Yassir", "lever", "https://api.lever.co/v0/postings/Yassir?mode=json", BATCH_5),
  row("Wagestream", "workable", "https://apply.workable.com/api/v1/widget/accounts/wagestream", BATCH_5),
  row("GoHenry", "workable", "https://apply.workable.com/api/v1/widget/accounts/gohenry", BATCH_5),
];
