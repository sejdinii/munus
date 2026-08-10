// Lever public postings API:
// https://api.lever.co/v0/postings/{slug}?mode=json
// Payload: [{ id, text (title), hostedUrl, applyUrl, createdAt (ms),
//   categories: { location, commitment, team }, descriptionPlain, ... }]

import type { AtsAdapter, NormalizedJob } from "../types";
import { detectRemote, parseSalaryRange } from "../normalize";

type LeverPosting = {
  id?: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number;
  categories?: { location?: string; commitment?: string; team?: string };
  descriptionPlain?: string;
};

export const leverAdapter: AtsAdapter = {
  ats: "lever",

  feedUrl(slug: string): string {
    return `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
  },

  parse(payload: unknown): NormalizedJob[] {
    if (!Array.isArray(payload)) return [];

    const out: NormalizedJob[] = [];
    for (const post of payload as LeverPosting[]) {
      if (!post?.id || !post.text) continue;
      const applyUrl = post.hostedUrl ?? post.applyUrl;
      if (!applyUrl) continue;
      const location = post.categories?.location?.trim() ?? "";
      const description = (post.descriptionPlain ?? "").trim();
      const salary = parseSalaryRange(`${post.text} ${description}`);
      out.push({
        externalId: post.id,
        title: post.text.trim(),
        location,
        remote: detectRemote(location, post.text),
        ...salary,
        description,
        applyUrl,
        postedAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
      });
    }
    return out;
  },
};
