"use client";

/* W5a — the meter (admin only). Owner email check on the API; this page
   just renders whatever /api/admin/usage returns. Users never see this. */

import { useEffect, useState } from "react";
import { Topbar } from "@/components/ui/Topbar";
import { LoadingState, ErrorState } from "@/components/states";

type UsagePayload = {
  owner?: string;
  totals?: { calls: number; costEur: number; promptTokens: number; completionTokens: number };
  byEndpoint?: Array<{ endpoint: string; calls: number; costEur: number }>;
  recent?: Array<{ endpoint: string; model: string; prompt_tokens: number; completion_tokens: number; cost_eur: number; created_at: string }>;
  topUsers?: Array<{ profileId: string; costEur: number }>;
  error?: string;
};

export default function AdminUsagePage() {
  const [state, setState] = useState<{ loading: boolean; data: UsagePayload | null; forbidden: boolean }>({
    loading: true,
    data: null,
    forbidden: false,
  });

  useEffect(() => {
    fetch("/api/admin/usage")
      .then(async (r) => {
        if (r.status === 403) {
          setState({ loading: false, data: null, forbidden: true });
          return null;
        }
        return (await r.json()) as UsagePayload;
      })
      .then((data) => {
        if (data) setState({ loading: false, data, forbidden: false });
      })
      .catch(() => setState({ loading: false, data: null, forbidden: false }));
  }, []);

  if (state.loading) return <LoadingState label="Loading the meter" />;
  if (state.forbidden) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Meter" backHref="/profile" />
        <ErrorState title="Not for you" body="This view is operator-only." />
      </section>
    );
  }
  const d = state.data;
  if (!d || !d.totals) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Meter" backHref="/profile" />
        <ErrorState title="Meter unavailable" body="No data yet — AI calls are recorded as they happen." />
      </section>
    );
  }

  return (
    <section className="screen-in flex min-h-0 flex-1 flex-col">
      <Topbar title="AI cost meter" backHref="/profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <p className="m-0 mb-1.5 text-[11px] font-[760] uppercase tracking-[0.1em] text-rose-ink">
          Admin · {d.owner}
        </p>
        <h2 className="m-0 mb-4 text-[33px] tracking-[-0.055em]">
          {d.totals.costEur.toFixed(4)} €
        </h2>
        <p className="m-0 mb-6 text-xs text-muted">
          {d.totals.calls} AI calls · {d.totals.promptTokens.toLocaleString()} prompt tokens ·{" "}
          {d.totals.completionTokens.toLocaleString()} completion tokens
        </p>

        <h3 className="m-0 mb-2 text-[13px]">By endpoint</h3>
        <div className="mb-6 grid gap-2">
          {d.byEndpoint!.map((e) => (
            <div key={e.endpoint} className="flex items-center justify-between rounded-xl bg-quiet px-3.5 py-3">
              <span className="text-[12px] font-[650]">{e.endpoint}</span>
              <span className="text-[12px] text-muted">
                {e.calls} calls · {e.costEur.toFixed(4)} €
              </span>
            </div>
          ))}
        </div>

        <h3 className="m-0 mb-2 text-[13px]">Most recent</h3>
        <div className="mb-6 grid gap-1.5">
          {d.recent!.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-quiet/60 px-3 py-2">
              <span className="text-[11px]">{r.endpoint}</span>
              <span className="text-[11px] text-muted">
                {r.prompt_tokens + r.completion_tokens} tok · {Number(r.cost_eur).toFixed(4)} € ·{" "}
                {new Date(r.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>

        <h3 className="m-0 mb-2 text-[13px]">Top users</h3>
        <div className="grid gap-1.5">
          {d.topUsers!.map((u) => (
            <div key={u.profileId} className="flex items-center justify-between rounded-lg bg-quiet/60 px-3 py-2">
              <span className="font-mono text-[10px]">{u.profileId.slice(0, 8)}…</span>
              <span className="text-[11px] text-muted">{u.costEur.toFixed(4)} €</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
