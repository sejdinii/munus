// Field normalization. Conservative by design: salary is set only when the
// text states it — "not listed" is honest, an estimate is not (product truth).

const REMOTE_RE = /\bremote\b|\banywhere\b|\bdistributed\b|\bwork from home\b/i;

export function detectRemote(location: string, title: string): boolean {
  return REMOTE_RE.test(location) || REMOTE_RE.test(title);
}

const CURRENCY_SYMBOL: Record<string, string> = { "€": "EUR", "£": "GBP", $: "USD" };

/**
 * Parse an explicit salary RANGE from free text, e.g. "€78–95k", "€78,000 -
 * €95,000", "£82-96k". Single numbers are ignored (too often equity counts,
 * headcounts, or years). Returns annual amounts.
 */
export function parseSalaryRange(text: string): {
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
} {
  const re =
    /([€£$])\s?(\d{1,3}(?:[.,]\d{3})*|\d{1,3})\s*(k)?\s*(?:–|—|-|to)\s*(?:[€£$]\s?)?(\d{1,3}(?:[.,]\d{3})*|\d{1,3})\s*(k)?\b/i;
  const m = re.exec(text);
  if (!m) return { salaryMin: null, salaryMax: null, currency: null };

  const toAnnual = (raw: string, k: string | undefined): number => {
    const n = Number(raw.replace(/[.,]/g, ""));
    return k ? n * 1000 : n;
  };
  let min = toAnnual(m[2], m[3]);
  let max = toAnnual(m[4], m[5]);
  // "€78–95k": the k on the right side applies to both bounds.
  if (!m[3] && m[5] && min < 1000) min *= 1000;
  if (min > max) [min, max] = [max, min];

  // Sanity: annual salaries, not hourly rates or headcounts.
  if (min < 10_000 || max > 2_000_000) {
    return { salaryMin: null, salaryMax: null, currency: null };
  }
  return { salaryMin: min, salaryMax: max, currency: CURRENCY_SYMBOL[m[1]] ?? null };
}

/** Strip HTML to searchable plain text (feeds ship HTML descriptions). */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;|&\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
