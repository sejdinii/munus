// Supabase-backed store. RLS scopes every query to the signed-in user; this
// module never touches the service role.

import type { Fact, Profile } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import type { OnboardingAnswers, Store } from "./index";

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

  async saveCv(userId, meta, fileBody, extracted) {
    const supabase = await createSupabaseServerClient();
    const objectPath = `${userId}/${Date.now()}-${meta.fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(objectPath, fileBody, { upsert: true });
    if (uploadError) throw new Error(`cv upload failed: ${uploadError.message}`);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ cv_path: objectPath })
      .eq("id", userId);
    if (profileError) throw new Error(`cv_path update failed: ${profileError.message}`);

    const { error: deleteError } = await supabase
      .from("facts")
      .delete()
      .eq("profile_id", userId);
    if (deleteError) throw new Error(`facts replace failed: ${deleteError.message}`);

    const { data, error: insertError } = await supabase
      .from("facts")
      .insert(
        extracted.map((f) => ({
          profile_id: userId,
          kind: f.kind,
          content: f.content,
          source_span: f.sourceSpan ?? null,
        })),
      )
      .select();
    if (insertError) throw new Error(`facts insert failed: ${insertError.message}`);

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
    const fileName = (data.cv_path as string).split("/").pop() ?? "cv";
    return {
      fileName: fileName.replace(/^\d+-/, ""),
      fileSize: 0, // stored object size isn't tracked on the profile row
      uploadedAt: data.created_at as string,
    };
  },
};
