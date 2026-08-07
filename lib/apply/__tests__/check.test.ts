import { describe, expect, it, vi } from "vitest";
import { checkListingReachable, isCheckableApplyUrl } from "../check";

describe("isCheckableApplyUrl", () => {
  it("accepts http(s) urls only", () => {
    expect(isCheckableApplyUrl("https://boards.greenhouse.io/clera/jobs/123")).toBe(true);
    expect(isCheckableApplyUrl("http://jobs.company.de/x")).toBe(true);
    expect(isCheckableApplyUrl("ftp://example.com")).toBe(false);
    expect(isCheckableApplyUrl("not a url")).toBe(false);
    expect(isCheckableApplyUrl("")).toBe(false);
  });
});

describe("checkListingReachable", () => {
  it("reports reachable for a healthy HEAD response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 } as Response);
    const result = await checkListingReachable("https://boards.greenhouse.io/jobs/1", fetchMock);
    expect(result.reachable).toBe(true);
    expect(result.status).toBe(200);
    expect(result.checkable).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://boards.greenhouse.io/jobs/1",
      expect.objectContaining({ method: "HEAD", redirect: "follow" }),
    );
  });

  it("reports unreachable on 4xx/5xx and network errors", async () => {
    const gone = await checkListingReachable(
      "https://jobs.acme.com/404",
      vi.fn().mockResolvedValue({ status: 404 } as Response),
    );
    expect(gone.reachable).toBe(false);
    expect(gone.status).toBe(404);

    const threw = await checkListingReachable(
      "https://jobs.acme.com/down",
      vi.fn().mockRejectedValue(new Error("ECONNREFUSED")),
    );
    expect(threw.reachable).toBe(false);
    expect(threw.status).toBeNull();
  });

  it("never checks sample/mock links and says so", async () => {
    const fetchMock = vi.fn();
    const result = await checkListingReachable("https://example.com/sample-listing/northstar", fetchMock);
    expect(result.checkable).toBe(false);
    expect(result.reachable).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
