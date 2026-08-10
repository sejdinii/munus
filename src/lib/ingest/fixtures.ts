// Recorded fixture feeds, shaped exactly like the live APIs. Used when
// INGEST_FIXTURES=1 (and by default in keyless dev mode) — this container's
// network policy blocks the ATS hosts, and the deck wave needs data either
// way. Companies here are fictional on purpose: fixture data must never be
// mistakable for real listings.

import { FeedError, type FeedFetcher } from "./types";

const GREENHOUSE_NORDLICHT = {
  jobs: [
    {
      id: 90210001,
      title: "Senior Product Designer",
      updated_at: "2026-08-08T09:12:00Z",
      first_published: "2026-08-07T08:00:00Z",
      absolute_url: "https://boards.greenhouse.io/nordlicht/jobs/90210001",
      location: { name: "Berlin, Germany (Hybrid)" },
      content:
        "&lt;p&gt;Own end-to-end design for our workflow platform. Salary €72,000 – €88,000 depending on experience. You will partner with product and engineering from discovery to launch. Figma, design systems, discovery research.&lt;/p&gt;",
    },
    {
      id: 90210002,
      title: "Staff Product Designer, Platform",
      updated_at: "2026-08-08T10:40:00Z",
      first_published: "2026-08-08T06:30:00Z",
      absolute_url: "https://boards.greenhouse.io/nordlicht/jobs/90210002",
      location: { name: "Remote - Europe" },
      content:
        "&lt;p&gt;Shape the design platform: tokens, primitives, tooling. €85–102k. Remote across Europe, quarterly meetups in Copenhagen.&lt;/p&gt;",
    },
    {
      id: 90210003,
      title: "Design Engineer",
      updated_at: "2026-08-08T11:02:00Z",
      absolute_url: "https://boards.greenhouse.io/nordlicht/jobs/90210003",
      location: { name: "Berlin, Germany" },
      content:
        "&lt;p&gt;Bridge design and front-end. React, TypeScript, motion. Compensation shared during process.&lt;/p&gt;",
    },
  ],
};

const LEVER_FJORDWORKS = [
  {
    id: "a1b2c3d4-0001",
    text: "Product Designer, Growth",
    hostedUrl: "https://jobs.lever.co/fjordworks/a1b2c3d4-0001",
    createdAt: 1786175000000,
    categories: { location: "Amsterdam, Netherlands", commitment: "Full-time", team: "Design" },
    descriptionPlain:
      "Design experiments across activation and retention. Salary €65,000 - €78,000 plus equity. Hybrid, two days in office.",
  },
  {
    id: "a1b2c3d4-0002",
    text: "Lead UX Researcher",
    hostedUrl: "https://jobs.lever.co/fjordworks/a1b2c3d4-0002",
    createdAt: 1786220000000,
    categories: { location: "Remote - EMEA", commitment: "Full-time", team: "Research" },
    descriptionPlain:
      "Build the research practice. Interviews, usability testing, evidence synthesis. £70–84k.",
  },
];

/** URL → payload map; unknown URLs 404 like the live world would. */
export const fixtureFetcher: FeedFetcher = async (url: string) => {
  if (url.includes("boards-api.greenhouse.io/v1/boards/nordlicht/")) return GREENHOUSE_NORDLICHT;
  if (url.includes("api.lever.co/v0/postings/fjordworks")) return LEVER_FJORDWORKS;
  throw new FeedError(`fixture not found for ${url}`, 404);
};

export const FIXTURE_SEED = [
  { name: "Nordlicht (fixture)", slug: "nordlicht", ats: "greenhouse" as const },
  { name: "Fjordworks (fixture)", slug: "fjordworks", ats: "lever" as const },
];
