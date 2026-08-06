import { describe, expect, it } from "vitest";
import { resolveAuthCallback } from "./callback";

const okExchange = async () => ({ error: null });
const failExchange = async () => ({ error: { message: "invalid code" } });

describe("resolveAuthCallback", () => {
  const base = new URL("https://munus.example/auth/callback");

  it("redirects to onboarding when the code is missing", async () => {
    const res = await resolveAuthCallback(base, okExchange);
    expect(res.ok).toBe(false);
    expect(res.redirect).toContain("/onboarding?auth=error");
    expect(res.reason).toBe("missing code");
  });

  it("redirects to onboarding with error when the exchange fails", async () => {
    const url = new URL(base);
    url.searchParams.set("code", "abc");
    const res = await resolveAuthCallback(url, failExchange);
    expect(res.ok).toBe(false);
    expect(res.redirect).toContain("/onboarding?auth=error");
    expect(res.reason).toBe("invalid code");
  });

  it("redirects to onboarding after a successful exchange (default next)", async () => {
    const url = new URL(base);
    url.searchParams.set("code", "abc");
    const res = await resolveAuthCallback(url, okExchange);
    expect(res.ok).toBe(true);
    expect(res.redirect).toBe("https://munus.example/onboarding");
  });

  it("honours a safe explicit next destination", async () => {
    const url = new URL(base);
    url.searchParams.set("code", "abc");
    url.searchParams.set("next", "/profile");
    const res = await resolveAuthCallback(url, okExchange);
    expect(res.redirect).toBe("https://munus.example/profile");
  });

  it("never follows an absolute or protocol-relative next", async () => {
    for (const evil of ["//evil.example", "https://evil.example", "/\\evil.example"]) {
      const url = new URL(base);
      url.searchParams.set("code", "abc");
      url.searchParams.set("next", evil);
      const res = await resolveAuthCallback(url, okExchange);
      expect(res.redirect).toBe("https://munus.example/onboarding");
    }
  });
});
