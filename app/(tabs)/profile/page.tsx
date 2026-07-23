"use client";

/* Profile — placeholder until wave slice 4 replaces it. */

import { LoadingState } from "@/components/states";
import { useMunusStore } from "@/lib/mock/store";

export default function ProfilePage() {
  const { hydrated, swipesLeft, onboarding } = useMunusStore();

  if (!hydrated) return <LoadingState label="Loading profile" />;

  return (
    <section className="screen-in flex flex-1 flex-col">
      <div className="px-5 pb-[18px] pt-2.5">
        <h1 className="m-0 text-[34px] tracking-[-0.055em]">Profile</h1>
        <p className="mt-[5px] text-xs text-muted">
          The evidence and preferences behind your matches.
        </p>
      </div>
      <div className="flex-1 px-5">
        <div className="border-b border-line pb-[22px] pt-1">
          <div className="grid size-[68px] place-items-center rounded-[23px] bg-[#251e21] text-[21px] font-extrabold text-white">
            ?
          </div>
          <h2 className="mb-[3px] mt-3.5 text-[25px] tracking-[-0.04em]">
            {onboarding.completed ? "Profile ready" : "No profile yet"}
          </h2>
          <p className="text-[11px] text-muted">
            {onboarding.completed
              ? `${onboarding.role ?? "Role"} · ${onboarding.location ?? "Location"}`
              : "Complete onboarding to build your evidence store."}
          </p>
        </div>
        <div className="grid min-h-[58px] grid-cols-[1fr_auto] items-center border-b border-line text-[13px]">
          <span>Plan</span>
          <small className="text-[10px] text-muted">
            Free · {swipesLeft} swipes left
          </small>
        </div>
      </div>
    </section>
  );
}
