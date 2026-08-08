/**
 * workers/ingestion/config/vertical.ts
 *
 * The beachhead vertical as CONFIG, not code (CONTRACTS §2 rule #7 / FEATURES
 * D13: "seed list + matching thresholds load from config so vertical #2 is a
 * data change, not a build"). This file defines the shape once and exports
 * the current vertical as data. Adding vertical #2 (e.g. engineering, per
 * BACKLOG PROPOSED FEATURES) means writing a new `Vertical` value here — it
 * must never require touching the matching engine or the ingestion adapters.
 *
 * This module does not implement matching itself (that's lib/matching/,
 * orchestrator-owned per CONTRACTS §6) — it only supplies the config that
 * engine reads. titleIncludes/titleExcludes/locationHints are plain lowercase
 * substrings; the matching engine owns tokenization, scoring, and how ties
 * between an include and an exclude are broken.
 */

export interface Vertical {
  /** Stable machine id, e.g. used as a config key / analytics dimension. */
  id: string;
  /** Human-readable label for admin views and job-card copy. */
  label: string;
  /** Lowercase substrings. A job title is in-scope for this vertical when it
   * contains at least one of these. */
  titleIncludes: string[];
  /** Lowercase substrings. A title containing any of these is out of scope
   * even if it also matches titleIncludes (e.g. "UI Developer" — engineering,
   * not design, despite containing "ui"). */
  titleExcludes: string[];
  /** Lowercase substrings matched against a job's location/remote text.
   * Covers named European hub cities, country names, and remote-Europe
   * phrasings. CONTRACTS §2 rule #5 (EU scope): a job qualifies when it has
   * an EU/UK entity/office OR is explicitly scoped to a European location or
   * timezone — "remote — worldwide" with no European anchor does not
   * qualify, so this list intentionally has no bare "remote" entry. */
  locationHints: string[];
}

/** Product/UX design roles, Europe. The MVP beachhead per
 * docs/MUNUS_MVP_PLAN.md §1, confirmed in FEATURES.md decisions. */
export const DESIGN_EUROPE: Vertical = {
  id: "design-europe",
  label: "Product & UX Design — Europe",

  titleIncludes: [
    "product designer",
    "product design",
    "ux designer",
    "ui designer",
    "ux/ui designer",
    "ui/ux designer",
    "digital designer",
    "digital product designer",
    "brand designer",
    "graphic designer",
    "service designer",
    "design lead",
    "lead designer",
    "senior designer",
    "staff designer",
    "principal designer",
    "design manager",
    "head of design",
    "head of product design",
    "director of product design",
    "director, product design",
    "vp of product design",
    "vp, product design",
    "vp ux",
    "design systems",
    "ux researcher",
    "user researcher",
    "product design researcher",
  ],

  titleExcludes: [
    "engineer",
    "engineering",
    "developer",
    "sales",
    "account executive",
    "customer success",
    "customer support",
    "recruiter",
    "recruiting",
    "talent acquisition",
    "finance",
    "legal",
    "human resources",
    "data scientist",
    "solutions architect",
    "marketing manager",
  ],

  locationHints: [
    // Pan-European / remote-Europe phrasings (never bare "remote" — see EU
    // scope rule above).
    "europe",
    "european union",
    "emea",
    "remote - europe",
    "remote (europe)",
    "remote, europe",
    "remote (eu)",
    "europe-based remote",
    "europe based remote",

    // Countries represented across BACKLOG's five seed-list batches.
    "germany",
    "france",
    "united kingdom",
    "uk",
    "ireland",
    "spain",
    "portugal",
    "italy",
    "netherlands",
    "belgium",
    "sweden",
    "finland",
    "denmark",
    "norway",
    "poland",
    "czechia",
    "czech republic",
    "switzerland",
    "austria",
    "greece",
    "romania",
    "estonia",

    // Named hub cities called out by name in the seed-list batches.
    "amsterdam",
    "berlin",
    "munich",
    "hamburg",
    "cologne",
    "heidelberg",
    "paris",
    "london",
    "dublin",
    "cork",
    "kilkenny",
    "madrid",
    "barcelona",
    "valencia",
    "lisbon",
    "porto",
    "stockholm",
    "helsinki",
    "copenhagen",
    "oslo",
    "warsaw",
    "vienna",
    "zurich",
    "geneva",
    "lausanne",
    "milan",
    "rome",
    "athens",
    "bucharest",
    "cluj-napoca",
    "prague",
    "brussels",
    "ghent",
    "tallinn",
  ],
};
