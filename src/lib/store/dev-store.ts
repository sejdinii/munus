// Keyless dev store: JSON file under .dev-data/ (gitignored). Exercises the
// same screens and states as the Supabase adapter — no dev-only UI branches.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Fact, Profile } from "@/lib/types";
import { safeFileName, type CvMeta, type OnboardingAnswers, type Store } from "./index";

const DATA_DIR = path.join(process.cwd(), ".dev-data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

type DevData = {
  profiles: Record<string, Profile>;
  facts: Record<string, Fact[]>;
  cvMeta: Record<string, CvMeta>;
};

async function load(): Promise<DevData> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8")) as DevData;
  } catch {
    return { profiles: {}, facts: {}, cvMeta: {} };
  }
}

async function save(data: DevData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const devStore: Store = {
  async getProfile(userId) {
    const data = await load();
    return data.profiles[userId] ?? null;
  },

  async saveOnboarding(userId, email, name, answers: OnboardingAnswers) {
    const data = await load();
    const existing = data.profiles[userId];
    const profile: Profile = {
      id: userId,
      email,
      name,
      roleTargets: answers.roleTargets,
      level: answers.level,
      locations: [answers.location],
      remoteOk: /remote/i.test(answers.location),
      salaryMin: answers.salaryMin,
      currency: answers.currency,
      alerts: answers.alerts,
      cvPath: existing?.cvPath ?? null,
      plan: existing?.plan ?? "free",
      stripeCustomerId: existing?.stripeCustomerId ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    data.profiles[userId] = profile;
    await save(data);
    return profile;
  },

  async saveCv(user, meta, fileBody, extracted) {
    const data = await load();
    await mkdir(path.join(DATA_DIR, "cvs"), { recursive: true });
    const storedName = safeFileName(meta.fileName);
    const filePath = path.join(DATA_DIR, "cvs", `${user.id}-${storedName}`);
    await writeFile(filePath, fileBody);
    const now = new Date().toISOString();
    const facts: Fact[] = extracted.map((f) => ({
      id: randomUUID(),
      profileId: user.id,
      kind: f.kind,
      content: f.content,
      sourceSpan: f.sourceSpan ?? null,
      createdAt: now,
    }));
    data.facts[user.id] = facts;
    data.cvMeta[user.id] = { ...meta, fileName: storedName };
    // CV can land before onboarding finishes — make sure a profile row exists.
    const existing = data.profiles[user.id];
    data.profiles[user.id] = existing
      ? { ...existing, cvPath: filePath }
      : {
          id: user.id,
          email: user.email,
          name: user.name,
          roleTargets: [],
          level: null,
          locations: [],
          remoteOk: true,
          salaryMin: null,
          currency: "EUR",
          alerts: null,
          cvPath: filePath,
          plan: "free",
          stripeCustomerId: null,
          createdAt: now,
        };
    await save(data);
    return { facts };
  },

  async listFacts(userId) {
    const data = await load();
    return data.facts[userId] ?? [];
  },

  async getCvMeta(userId) {
    const data = await load();
    return data.cvMeta[userId] ?? null;
  },
};
