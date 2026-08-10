// Greenhouse public board API:
// https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
// Payload: { jobs: [{ id, title, updated_at, first_published?, absolute_url,
//   location: { name }, content (HTML-escaped), ... }] }

import type { AtsAdapter, NormalizedJob } from "../types";
import { detectRemote, htmlToText, parseSalaryRange } from "../normalize";

type GreenhouseJob = {
  id: number | string;
  title?: string;
  updated_at?: string;
  first_published?: string;
  absolute_url?: string;
  location?: { name?: string };
  content?: string;
};

export const greenhouseAdapter: AtsAdapter = {
  ats: "greenhouse",

  feedUrl(slug: string): string {
    return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
  },

  parse(payload: unknown): NormalizedJob[] {
    const jobs = (payload as { jobs?: GreenhouseJob[] })?.jobs;
    if (!Array.isArray(jobs)) return [];

    const out: NormalizedJob[] = [];
    for (const job of jobs) {
      if (!job?.id || !job.title || !job.absolute_url) continue;
      const location = job.location?.name?.trim() ?? "";
      // Greenhouse ships content HTML-escaped; unescape once, then strip.
      const rawContent = (job.content ?? "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      const description = htmlToText(rawContent);
      const salary = parseSalaryRange(`${job.title} ${description}`);
      out.push({
        externalId: String(job.id),
        title: job.title.trim(),
        location,
        remote: detectRemote(location, job.title),
        ...salary,
        description,
        applyUrl: job.absolute_url,
        postedAt: job.first_published ?? job.updated_at ?? null,
      });
    }
    return out;
  },
};
