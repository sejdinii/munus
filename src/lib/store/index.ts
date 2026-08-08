// Data-store adapter seam (CONTRACTS.md §3). bw0 scope: profile + facts + CV
// metadata. Supabase adapter when configured, file-backed dev store otherwise.

import { hasSupabase } from "@/lib/env";
import type { Fact, Profile } from "@/lib/types";
import type { ExtractedFact } from "@/lib/facts/types";
import { devStore } from "./dev-store";
import { supabaseStore } from "./supabase-store";

export type OnboardingAnswers = {
  roleTarget: string;
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
  /** Persist the raw CV and its extracted facts atomically-ish; replaces prior facts. */
  saveCv(
    userId: string,
    meta: CvMeta,
    fileBody: Uint8Array,
    facts: ExtractedFact[],
  ): Promise<{ facts: Fact[] }>;
  listFacts(userId: string): Promise<Fact[]>;
  getCvMeta(userId: string): Promise<CvMeta | null>;
}

export const store: Store = hasSupabase ? supabaseStore : devStore;
