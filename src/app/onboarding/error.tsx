"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/states";

export default function OnboardingError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Screen>
      <EmptyState
        symbol={<Icon name="alert" size={26} />}
        title="Couldn't load onboarding"
        body="We couldn't fetch your saved answers. Try again in a moment."
      >
        <Button variant="dark" onClick={reset}>
          Try again
        </Button>
      </EmptyState>
    </Screen>
  );
}
