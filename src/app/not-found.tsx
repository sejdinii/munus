import { ButtonLink } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        symbol="?"
        title="That page doesn't exist"
        body="The link may be old, or the screen hasn't shipped yet."
      >
        <ButtonLink variant="primary" href="/">
          Back to Scout
        </ButtonLink>
      </EmptyState>
    </Screen>
  );
}
