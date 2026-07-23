"use client";

/* Favorites — shortlist view over the mock store's favorites list, filtered
   to jobs that have not already become an application (prototype's
   `renderFavorites`: applied jobs graduate to Applications). Wave 1 slice 3. */

import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { Button, LinkButton } from "@/components/ui/Button";
import { jobById } from "@/lib/mock/jobs";
import { useMunusStore } from "@/lib/mock/store";
import { FavoriteRow } from "./FavoriteRow";

/* Mock "fresh" strings ("18 min ago", "2 hr ago", "Today") are display copy,
   not timestamps — this is a best-effort parse so the page's own claim
   ("ordered by freshness") is actually true instead of just asserted. */
function freshnessMinutes(fresh: string): number {
  const min = /(\d+)\s*min/i.exec(fresh);
  if (min) return Number(min[1]);
  const hr = /(\d+)\s*hr/i.exec(fresh);
  if (hr) return Number(hr[1]) * 60;
  if (/today/i.exec(fresh)) return 60 * 4;
  return Number.POSITIVE_INFINITY;
}

function PageHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="px-5 pb-[18px] pt-2.5">
      <h1 className="m-0 text-[34px] tracking-[-0.055em]">Favorites</h1>
      <p className="mt-[5px] text-xs text-muted">{subtitle}</p>
    </div>
  );
}

export default function FavoritesPage() {
  const { hydrated, favorites, applications } = useMunusStore();

  if (!hydrated) return <LoadingState label="Loading favorites" />;

  const shortlistedIds = favorites.filter(
    (id) => !applications.some((a) => a.jobId === id),
  );
  const rows = shortlistedIds
    .map((id) => jobById(id))
    .filter((job): job is NonNullable<typeof job> => Boolean(job))
    .sort((a, b) => freshnessMinutes(a.fresh) - freshnessMinutes(b.fresh));

  // Every saved id failed to resolve to a catalog job (e.g. a delisted role) —
  // a real data error, distinct from having no favorites at all.
  if (shortlistedIds.length > 0 && rows.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <PageHeader subtitle="Your serious shortlist, not another inbox." />
        <ErrorState body="We could not load your saved roles right now. They are still saved — try again in a moment.">
          <Button
            variant="dark"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </ErrorState>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className="screen-in flex flex-1 flex-col">
        <PageHeader subtitle="Your serious shortlist, not another inbox." />
        <EmptyState
          symbol="♡"
          title="No favorites yet"
          body="Save roles from Discover. We will keep checking whether they are still open."
        >
          <LinkButton href="/discover" variant="primary" className="w-full">
            Find fresh roles
          </LinkButton>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="screen-in flex flex-1 flex-col">
      <PageHeader subtitle={`${rows.length} shortlisted · ordered by freshness`} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        {rows.map((job) => (
          <FavoriteRow key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
