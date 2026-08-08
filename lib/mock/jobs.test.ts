import { describe, expect, it } from "vitest";
import { jobById, jobs } from "./jobs";

describe("mock jobs (prototype data)", () => {
  it("has unique ids", () => {
    expect(new Set(jobs.map((j) => j.id)).size).toBe(jobs.length);
  });

  it("every job carries exactly two reasons and one concern", () => {
    for (const job of jobs) {
      expect(job.reasons).toHaveLength(2);
      expect(job.concern.length).toBeGreaterThan(0);
    }
  });

  it("never exposes a direct-submit flag (redirect apply only, D2)", () => {
    for (const job of jobs) {
      expect("supported" in job).toBe(false);
    }
  });

  it("jobById resolves and misses safely", () => {
    expect(jobById("northstar")?.company).toBe("Northstar");
    expect(jobById("nope")).toBeUndefined();
  });
});
