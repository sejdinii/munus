/**
 * workers/ingestion/normalize.ts
 *
 * Text-level normalization shared by both adapters: HTML stripping, explicit
 * salary-range extraction, and remote detection. Pure functions, no I/O.
 */

export interface ParsedSalary {
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&euro;": "€",
  "&pound;": "£",
};

/** Strips HTML tags and decodes a small set of common entities. Greenhouse's
 * `content` field (with `?content=true`) is HTML; this is intentionally
 * lightweight (regex-based) rather than a full parser dependency, which is
 * acceptable because the ingestion worker only needs plain-text description
 * and salary-scanning, not structural fidelity. */
export function stripHtml(html: string): string {
  const withoutTags = html.replace(/<[^>]*>/g, " ");
  const withEntitiesDecoded = withoutTags.replace(
    /&[a-zA-Z#0-9]+;/g,
    (entity) => HTML_ENTITIES[entity] ?? entity,
  );
  return withEntitiesDecoded.replace(/\s+/g, " ").trim();
}

const CURRENCY_BY_SYMBOL: Record<string, string> = {
  "€": "EUR", // €
  "£": "GBP", // £
  $: "USD",
};

// Matches explicit ranges like "€65,000–€80,000", "£82-96k", "$150,000 - $180,000".
// Requires a currency symbol AND two numbers joined by a dash/"to" — a lone
// figure ("$120,000 per year") never matches, so absent-range text correctly
// falls through to nulls (CONTRACTS §3 invariant 4 / D13: never estimate).
const SALARY_RANGE_RE =
  /([€£$])\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(k)?\s?(?:-|–|—|to)\s?([€£$])?\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s?(k)?/i;

function toNumber(raw: string, hasK: boolean): number {
  const value = parseFloat(raw.replace(/,/g, ""));
  return hasK ? value * 1000 : value;
}

/** Extracts an explicitly stated salary range from free text. Returns all
 * nulls when no explicit range is present — this function never estimates. */
export function parseSalary(text: string): ParsedSalary {
  const match = SALARY_RANGE_RE.exec(text);
  if (!match) {
    return { salary_min: null, salary_max: null, currency: null };
  }

  const symbol = match[1];
  const rawMin = match[2];
  const minK = match[3];
  const rawMax = match[5];
  const maxK = match[6];

  if (!symbol || !rawMin || !rawMax) {
    return { salary_min: null, salary_max: null, currency: null };
  }

  const currency = CURRENCY_BY_SYMBOL[symbol] ?? null;
  let min = toNumber(rawMin, Boolean(minK));
  const max = toNumber(rawMax, Boolean(maxK));

  // UK-style shorthand "£82-96k" means £82k-£96k: the first number's "k" is
  // implied by the second. Only apply when min lacks its own "k" and is small
  // enough that treating it as raw currency units would be implausible.
  if (!minK && maxK && min < 1000) {
    min *= 1000;
  }

  return { salary_min: min, salary_max: max, currency };
}

/** Remote detection is intentionally scoped to title + location only, per
 * spec — description text is not consulted here. */
export function detectRemote(title: string, location: string): boolean {
  const re = /remote/i;
  return re.test(title) || re.test(location);
}
