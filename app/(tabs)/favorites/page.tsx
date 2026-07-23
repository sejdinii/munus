"use client";

/* Favorites — placeholder until wave slice 3 replaces it. Ships the real
   empty state from the prototype so the shell is honest today. */

import Link from "next/link";
import { EmptyState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { useMunusStore } from "@/lib/mock/store";

export default function FavoritesPage() {
  const { hydrated, favorites } = useMunusStore();

  if (!hydrated) return <LoadingState label="Loading favorites" />;

  return (
    <section className="screen-in flex flex-1 flex-col">
      <div className="px-5 pb-[18px] pt-2.5">
        <h1 className="m-0 text-[34px] tracking-[-0.055em]">Favorites</h1>
        <p className="mt-[5px] text-xs text-muted">
          {favorites.length
            ? `${favorites.length} shortlisted`
            : "Your serious shortlist, not another inbox."}
        </p>
      </div>
      <EmptyState
        symbol="♡"
        title="No favorites yet"
        body="Save roles from Discover. We will keep checking whether they are still open."
      >
        <Link href="/discover">
          <Button variant="primary" className="w-full">
            Find fresh roles
          </Button>
        </Link>
      </EmptyState>
    </section>
  );
}
