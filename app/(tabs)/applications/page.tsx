"use client";

/* Applications — placeholder until wave slice 3 replaces it. */

import Link from "next/link";
import { EmptyState, LoadingState } from "@/components/states";
import { Button } from "@/components/ui/Button";
import { useMunusStore } from "@/lib/mock/store";

export default function ApplicationsPage() {
  const { hydrated } = useMunusStore();

  if (!hydrated) return <LoadingState label="Loading applications" />;

  return (
    <section className="screen-in flex flex-1 flex-col">
      <div className="px-5 pb-[18px] pt-2.5">
        <h1 className="m-0 text-[34px] tracking-[-0.055em]">Applications</h1>
        <p className="mt-[5px] text-xs text-muted">
          Your applications, receipts, and next actions.
        </p>
      </div>
      <EmptyState
        symbol="↗"
        title="No applications yet"
        body="Tailor a favorite, review every answer, then apply on the official listing when you are ready."
      >
        <Link href="/favorites">
          <Button variant="primary" className="w-full">
            Open favorites
          </Button>
        </Link>
      </EmptyState>
    </section>
  );
}
