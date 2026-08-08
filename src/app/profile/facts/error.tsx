"use client";

import { Button } from "@/components/ui/button";
import { Screen, TopBar } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/states";

export default function FactsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen>
      <TopBar title="Career profile" backHref="/" />
      <EmptyState
        symbol="!"
        title="Couldn't load your profile"
        body="Your facts are safe — we just couldn't fetch them right now. Try again in a moment."
      >
        <Button variant="dark" onClick={reset}>
          Try again
        </Button>
      </EmptyState>
    </Screen>
  );
}
