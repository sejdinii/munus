"use client";

import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/states";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen>
      <EmptyState
        symbol="!"
        title="Something broke"
        body="Not your fault. Your profile and documents are safe — try again, and if this keeps happening we want to know."
      >
        <Button variant="dark" onClick={reset}>
          Try again
        </Button>
      </EmptyState>
    </Screen>
  );
}
