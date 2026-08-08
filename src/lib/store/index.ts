// Data-store adapter seam (CONTRACTS.md §3). bw0 scope: profile + facts + CV
// metadata. Supabase adapter when configured, file-backed dev store otherwise.

import { hasSupabase } from "@/lib/env";
import type { Fact, Profile } from "@/lib/types";
import type { ExtractedFact } from "@/lib/facts/types";
import type { SessionUser } from "@/lib/auth";
import { devStore } from "./dev-store";
import { supabaseStore } from "./supabase-store";

export type OnboardingAnswers = {
  roleTargets: string[];
  location: string;
  level: string;
  salaryMin: number | null;
  currency: string;
  alerts: string;
};

export type CvMeta = { fileName: string; fileSize: number; uploadedAt: string };

export interface Store {
  getProfile(userId: string): Promise<Profile | null>;
  saveOnboarding(
    userId: string,
    email: string,
    name: string | null,
    answers: OnboardingAnswers,
  ): Promise<Profile>;
  /**
   * Persist the raw CV and its extracted facts; replaces prior facts.
   * Takes the full session user because a profiles row may not exist yet —
   * CV upload happens at onboarding Q5, before the profile is saved at Q6.
   */
  saveCv(
    user: SessionUser,
    meta: CvMeta,
    fileBody: Uint8Array,
    facts: ExtractedFact[],
  ): Promise<{ facts: Fact[] }>;
  listFacts(userId: string): Promise<Fact[]>;
  getCvMeta(userId: string): Promise<CvMeta | null>;
}

export const store: Store = hasSupabase ? supabaseStore : devStore;

/** Uploaded filenames are attacker-controlled — reduce to a safe basename. */
export function safeFileName(raw: string): string {
  const base = raw.split(/[/\\]/).pop() ?? "cv";
  const cleaned = base.replace(/[^\w.\- ]+/g, "_").replace(/^\.+/, "").trim();
  return cleaned || "cv";
}
