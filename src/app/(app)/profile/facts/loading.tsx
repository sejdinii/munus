import { Screen, TopBar } from "@/components/ui/screen";
import { Generating } from "@/components/ui/states";

export default function FactsLoading() {
  return (
    <Screen>
      <TopBar title="Career profile" backHref="/" />
      <Generating
        label="Opening your evidence"
        sublabel="Loading the verified facts behind your matches."
      />
    </Screen>
  );
}
