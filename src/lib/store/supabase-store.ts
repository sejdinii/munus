// Supabase-backed store. RLS scopes every query to the signed-in user; this
// module never touches the service role.

import type { Fact, Profile } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { safeFileName, type OnboardingAnswers, type Store } from "./index";

type ProfileRow = {
  id: string;
  name: string | null;
  email: string;
  role_target: string | null;
  level: string | null;
  locations: string[];
  remote_ok: boolean;
  salary_min: number | null;
  currency: string;
  alerts: string | null;
  cv_path: string | null;
  plan: "free" | "plus";
  stripe_customer_id: string | null;
  created_at: string;
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleTarget: row.role_target,
    level: row.level,
    locations: row.locations,
    remoteOk: row.remote_ok,
    salaryMin: row.salary_min,
    currency: row.currency,
    alerts: row.alerts,
    cvPath: row.cv_path,
    plan: row.plan,
    stripeCustomerId: row.stripe_customer_id,
    createdAt: row.created_at,
  };
}

export const supabaseStore: Store = {
  async getProfile(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(`profiles select failed: ${error.message}`);
    return data ? toProfile(data as ProfileRow) : null;
  },

  async saveOnboarding(userId, email, name, answers: OnboardingAnswers) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        name,
        role_target: answers.roleTarget,
        level: answers.level,
        locations: [answers.location],
        remote_ok: /remote/i.test(answers.location),
        salary_min: answers.salaryMin,
        currency: answers.currency,
        alerts: answers.alerts,
      })
      .select()
      .single();
    if (error) throw new Error(`profiles upsert failed: ${error.message}`);
    return toProfile(data as ProfileRow);
  },

  async saveCv(user, meta, fileBody, extracted) {
    const supabase = await createSupabaseServerClient();

    // CV upload happens at onboarding Q5, before /api/profile runs — make
    // sure the profiles row (facts' FK target) exists. The DB trigger covers
    // new signups; this covers users created before the trigger shipped.
    const { error: ensureError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });
    if (ensureError) throw new Error(`profile ensure failed: ${ensureError.message}`);

    const objectPath = `${user.id}/${Date.now()}-${safeFileName(meta.fileName)}`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(objectPath, fileBody, { upsert: true });
    if (uploadError) throw new Error(`cv upload failed: ${uploadError.message}`);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ cv_path: objectPath })
      .eq("id", user.id);
    if (profileError) throw new Error(`cv_path update failed: ${profileError.message}`);

    // Replace facts non-destructively: insert the new set first, then remove
    // the old rows — a failure mid-way leaves duplicates, never zero evidence.
    const { data: oldRows, error: oldError } = await supabase
      .from("facts")
      .select("id")
      .eq("profile_id", user.id);
    if (oldError) throw new Error(`facts read failed: ${oldError.message}`);

    const { data, error: insertError } = await supabase
      .from("facts")
      .insert(
        extracted.map((f) => ({
          profile_id: user.id,
          kind: f.kind,
          content: f.content,
          source_span: f.sourceSpan ?? null,
        })),
      )
      .select();
    if (insertError) throw new Error(`facts insert failed: ${insertError.message}`);

    const oldIds = (oldRows ?? []).map((row) => row.id as string);
    if (oldIds.length > 0) {
      const { error: deleteError } = await supabase.from("facts").delete().in("id", oldIds);
      if (deleteError) throw new Error(`facts cleanup failed: ${deleteError.message}`);
    }

    const facts: Fact[] = (data ?? []).map((row) => ({
      id: row.id as string,
      profileId: row.profile_id as string,
      kind: row.kind as Fact["kind"],
      content: row.content as string,
      sourceSpan: (row.source_span as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
    return { facts };
  },

  async listFacts(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("facts")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(`facts select failed: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      profileId: row.profile_id as string,
      kind: row.kind as Fact["kind"],
      content: row.content as string,
      sourceSpan: (row.source_span as string | null) ?? null,
      createdAt: row.created_at as string,
    }));
  },

  async getCvMeta(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("cv_path, created_at")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data?.cv_path) return null;
    const objectName = (data.cv_path as string).split("/").pop() ?? "cv";
    const stamp = /^(\d{10,})-/.exec(objectName)?.[1];
    return {
      fileName: objectName.replace(/^\d{10,}-/, ""),
      fileSize: 0, // object size isn't tracked on the profile row; UI hides 0
      uploadedAt: stamp
        ? new Date(Number(stamp)).toISOString()
        : (data.created_at as string),
    };
  },
};
