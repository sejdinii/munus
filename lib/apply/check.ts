/**
 * W4-live "still open" check: before the user commits to an application,
 * verify the listing's apply URL still responds. A HEAD request is the
 * honest, cheap signal — no scraping, no assumptions. Unreachable does NOT
 * block the redirect (rank-don't-exclude: the user decides), it just gets
 * labeled honestly on the preflight screen.
 */

export type ListingCheck = {
  reachable: boolean;
  status: number | null;
  checkedAt: string;
  /** false when the URL isn't checkable (e.g. mock sample links). */
  checkable: boolean;
};

const TIMEOUT_MS = 8_000;
/** Sample/mock links must never be checked (and never claimed checked). */
export function isCheckableApplyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.hostname !== "example.com"
    );
  } catch {
    return false;
  }
}

export async function checkListingReachable(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ListingCheck> {
  const checkedAt = new Date().toISOString();
  if (!isCheckableApplyUrl(url)) {
    return { reachable: false, status: null, checkedAt, checkable: false };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    /* 2xx/3xx = live listing. 4xx means the URL doesn't resolve to a
       listing anymore; 5xx is the server, not the listing — either way
       the honest label is "couldn't verify / likely closed". */
    return {
      reachable: response.status >= 200 && response.status < 400,
      status: response.status,
      checkedAt,
      checkable: true,
    };
  } catch {
    return { reachable: false, status: null, checkedAt, checkable: true };
  } finally {
    clearTimeout(timer);
  }
}
