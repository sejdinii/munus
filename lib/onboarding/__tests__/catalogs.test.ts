import { describe, expect, it } from "vitest";
import { ALL_ROLES, ROLE_GROUPS, searchRoles } from "../roles";
import { ALL_CITIES, EUROPE_LOCATIONS, searchLocations } from "../locations";

describe("role catalog", () => {
  it("covers a wide range of roles across groups", () => {
    expect(ROLE_GROUPS.length).toBeGreaterThanOrEqual(10);
    expect(ALL_ROLES.length).toBeGreaterThanOrEqual(120);
  });

  it("has unique role names", () => {
    const dupes = ALL_ROLES.filter((r, i) => ALL_ROLES.indexOf(r) !== i);
    expect(dupes).toEqual([]);
  });

  it("searches case-insensitively and matches group names", () => {
    const hits = searchRoles("engineer").flatMap((g) => g.roles);
    expect(hits.length).toBeGreaterThan(10);
  });
});

describe("Europe location catalog", () => {
  it("covers every region with a broad city list", () => {
    expect(EUROPE_LOCATIONS.length).toBeGreaterThanOrEqual(30);
    expect(ALL_CITIES.length).toBeGreaterThanOrEqual(200);
  });

  it("has unique city names", () => {
    const dupes = ALL_CITIES.filter((c, i) => ALL_CITIES.indexOf(c) !== i);
    expect(dupes).toEqual([]);
  });

  it("searches cities and countries", () => {
    const byCity = searchLocations("Leipzig");
    expect(byCity.flatMap((g) => g.cities)).toContain("Leipzig");
    const byCountry = searchLocations("Germany");
    expect(byCountry[0]?.cities).toContain("Berlin");
  });
});
