import { describe, expect, it } from "vitest";
import { detectRemote, parseSalary, stripHtml } from "./normalize";

describe("stripHtml", () => {
  it("removes tags and decodes common entities", () => {
    expect(stripHtml("<p>Hello &amp; welcome</p>")).toBe("Hello & welcome");
    expect(stripHtml("<strong>€65,000</strong>&nbsp;a year")).toBe("€65,000 a year");
  });

  it("collapses whitespace left behind by removed tags", () => {
    expect(stripHtml("<p>One</p><p>Two</p>")).toBe("One Two");
  });

  it("passes plain text through unchanged (besides trimming)", () => {
    expect(stripHtml("  already plain text  ")).toBe("already plain text");
  });
});

describe("parseSalary — explicit ranges only (CONTRACTS invariant 4 / D13)", () => {
  it("extracts a full euro range with thousands separators", () => {
    expect(parseSalary("Compensation: €65,000–€80,000 depending on experience.")).toEqual({
      salary_min: 65000,
      salary_max: 80000,
      currency: "EUR",
    });
  });

  it("extracts UK shorthand where only the max carries the k suffix", () => {
    expect(parseSalary("Salary: £82-96k depending on experience.")).toEqual({
      salary_min: 82000,
      salary_max: 96000,
      currency: "GBP",
    });
  });

  it("extracts a dollar range with spaced hyphen and no k suffix", () => {
    expect(parseSalary("Base salary range: $150,000 - $180,000 plus equity.")).toEqual({
      salary_min: 150000,
      salary_max: 180000,
      currency: "USD",
    });
  });

  it("returns all nulls when no explicit range is present", () => {
    expect(
      parseSalary(
        "We don't publish a salary range for this role; compensation is discussed during the interview process.",
      ),
    ).toEqual({ salary_min: null, salary_max: null, currency: null });
  });

  it("does not estimate from an unrelated single number", () => {
    expect(parseSalary("You will lead a team of 5-6 engineers.")).toEqual({
      salary_min: null,
      salary_max: null,
      currency: null,
    });
  });

  it("returns nulls for empty text", () => {
    expect(parseSalary("")).toEqual({ salary_min: null, salary_max: null, currency: null });
  });
});

describe("detectRemote — title/location only, per spec", () => {
  it("detects remote from location", () => {
    expect(detectRemote("Product Marketing Manager", "Remote - Europe")).toBe(true);
  });

  it("detects remote from title", () => {
    expect(detectRemote("Remote Site Reliability Engineer", "Anywhere")).toBe(true);
  });

  it("is false when neither title nor location mentions remote", () => {
    expect(detectRemote("Customer Support Specialist", "London, UK")).toBe(false);
  });

  it("does not consult description text", () => {
    // No description parameter exists on the function signature at all —
    // this test documents that constraint rather than exercising it.
    expect(detectRemote("Backend Engineer", "Berlin, Germany")).toBe(false);
  });
});
