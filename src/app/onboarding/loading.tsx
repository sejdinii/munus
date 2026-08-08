import { Screen } from "@/components/ui/screen";
import { Generating } from "@/components/ui/states";

export default function OnboardingLoading() {
  return (
    <Screen>
      <Generating label="Setting up" sublabel="Loading your profile answers." />
    </Screen>
  );
}
