import { describe, expect, it, vi } from "vitest";
import { costOf, countToday, recordUsage, MODEL_RATES } from "../meter";

describe("costOf", () => {
  it("computes per-1M-token cost for gpt-oss-120b", () => {
    // $0.15/M prompt + $0.60/M completion.
    expect(costOf("openai/gpt-oss-120b", 1_000_000, 0)).toBeCloseTo(0.15, 6);
    expect(costOf("openai/gpt-oss-120b", 0, 1_000_000)).toBeCloseTo(0.6, 6);
    expect(costOf("openai/gpt-oss-120b", 100_000, 20_000)).toBeCloseTo(0.027, 6);
  });

  it("is zero for unknown models (never guess a rate)", () => {
    expect(costOf("some-other-model", 1_000_000, 1_000_000)).toBe(0);
  });

  it("rates are known for the configured model", () => {
    expect(MODEL_RATES["openai/gpt-oss-120b"]).toBeDefined();
  });
});

describe("recordUsage", () => {
  it("inserts the row and never throws on failure", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) }),
    };
    await expect(
      recordUsage(supabase as never, {
        profileId: "p1",
        endpoint: "tailor",
        model: "openai/gpt-oss-120b",
        promptTokens: 100,
        completionTokens: 50,
        costEur: 0.000045,
      }),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith("llm_usage");
  });

  it("swallows DB errors (metering must not break the feature)", async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: new Error("down") }) }),
    };
    await expect(
      recordUsage(supabase as never, {
        profileId: "p1",
        endpoint: "cv-parse",
        model: "openai/gpt-oss-120b",
        promptTokens: 0,
        completionTokens: 0,
        costEur: 0,
      }),
    ).resolves.toBeUndefined();
  });
});

describe("countToday", () => {
  /* Thenable chain: every eq/gte link returns the chain, so awaiting at
     ANY position (terminal eq or terminal gte) yields the final result —
     mirroring how the real supabase query builder works. */
  function chainable(result: { count: number | null; error: unknown }) {
    const chain = {
      eq: vi.fn().mockImplementation(() => chain),
      gte: vi.fn().mockImplementation(() => chain),
      then: (resolve: (v: typeof result) => unknown, reject: (e: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };
    return chain;
  }

  it("returns the day's count for a profile+endpoint", async () => {
    const chain = chainable({ count: 3, error: null });
    const supabase = { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chain) }) };
    const count = await countToday(supabase as never, "p1", "tailor");
    expect(count).toBe(3);
    expect(supabase.from).toHaveBeenCalledWith("llm_usage");
  });

  it("returns 0 when nothing recorded", async () => {
    const chain = chainable({ count: null, error: null });
    const supabase = { from: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue(chain) }) };
    const count = await countToday(supabase as never, "p1", "reasons");
    expect(count).toBe(0);
  });
});
