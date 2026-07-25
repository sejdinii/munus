"use client";

/* Job detail — outside the (tabs) group by design: it has its own topbar and
   a sticky pass/save footer instead of the tabbar, matching the prototype's
   detail screens (prototypes/scout-pink-v2.html renderDetail, CONTRACTS §4
   binding visual spec). Mock data only (lib/mock/jobs); the real job/deck API
   lands with the matching engine in a later wave. */

import { useParams, useRouter } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { MetaChip } from "@/components/ui/Chip";
import { Topbar } from "@/components/ui/Topbar";
import { useToast } from "@/components/ui/Toast";
import { XIcon } from "@/components/ui/icons";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { ReasonRow } from "./ReasonRow";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, favorites, decide } = useMunusStore();
  const { showToast } = useToast();

  if (!hydrated) return <LoadingState label="Loading role" />;

  const job = jobById(id);

  if (!job) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <Topbar title="Role" backHref="/discover" />
        <ErrorState
          title="Role not found"
          body="This listing may have been removed, or the link is wrong."
        >
          <LinkButton href="/discover" variant="dark" className="w-full">
            Back to Discover
          </LinkButton>
        </ErrorState>
      </section>
    );
  }

  const isFavorited = favorites.includes(job.id);

  function handlePass() {
    decide(job!.id, "pass");
    showToast("Passed");
    router.push("/discover");
  }

  function handleSave() {
    decide(job!.id, "save");
    showToast("Saved to Favorites");
    router.push("/favorites");
  }

  return (
    <section className="screen-in flex flex-1 flex-col">
      <Topbar title={job.company} backHref="/discover" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {/* detail-hero */}
        <div className="mb-[23px] mt-[3px]">
          <div
            className="grid size-[76px] place-items-center rounded-[21px] text-[31px] font-[850] tracking-[-0.06em]"
            style={{ background: job.color }}
            aria-hidden
          >
            {job.monogram}
          </div>
          <h2 className="mb-[5px] mt-[18px] text-[34px] leading-[1.02] tracking-[-0.055em]">
            {job.title}
          </h2>
          <p className="m-0 text-[13px] text-muted">
            {job.company} · {job.location}
          </p>
          <div className="mt-3 flex flex-wrap gap-[7px]">
            <MetaChip>{job.salary}</MetaChip>
            <MetaChip>{job.type}</MetaChip>
            <MetaChip>{job.fresh}</MetaChip>
          </div>
        </div>

        {/* fit section */}
        <section className="border-t border-line py-5">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="m-0 text-[13px]">Why Munus ranked it highly</h3>
            <span className="text-xs font-extrabold text-green">{job.match}%</span>
          </div>
          <ReasonRow tone="ok">{job.reasons[0]}</ReasonRow>
          <ReasonRow tone="ok">{job.reasons[1]}</ReasonRow>
          <ReasonRow tone="concern">{job.concern}</ReasonRow>
        </section>

        {/* about */}
        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">About the role</h3>
          <p className="m-0 text-[13px] leading-[1.55] text-[#4f494c]">{job.about}</p>
        </section>

        {/* source and freshness */}
        <section className="border-t border-line py-5">
          <h3 className="m-0 mb-[13px] text-[13px]">Source and freshness</h3>
          <p className="m-0 text-[13px] leading-[1.55] text-[#4f494c]">
            Found on {job.source}. Munus last verified the listing{" "}
            {job.fresh.toLowerCase()}. You will always review application
            materials before anything is sent.
          </p>
        </section>
      </div>

      {/* detail-actions: sticky pass/save footer */}
      <footer className="sticky bottom-0 grid grid-cols-[52px_1fr] gap-2.5 border-t border-line bg-paper/95 px-[18px] pb-5 pt-3 backdrop-blur-[18px]">
        <button
          type="button"
          aria-label="Pass"
          onClick={handlePass}
          className="grid size-[46px] place-items-center rounded-full border border-line bg-paper text-ink shadow-[0_5px_13px_rgba(31,32,38,0.07)] transition-transform hover:-translate-y-px [&_svg]:size-[22px]"
        >
          <XIcon />
        </button>
        {isFavorited ? (
          <LinkButton href="/favorites" variant="primary" className="w-full">
            Open in favorites
          </LinkButton>
        ) : (
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Save to favorites
          </Button>
        )}
      </footer>
    </section>
  );
}
