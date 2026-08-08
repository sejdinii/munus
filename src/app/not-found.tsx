import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <div className="app-frame">
      <Screen>
      <EmptyState
        symbol={<Icon name="x" size={26} />}
        title="That page doesn't exist"
        body="The link may be old, or the screen hasn't shipped yet."
      >
        <ButtonLink variant="primary" href="/">
          Back to Scout
        </ButtonLink>
      </EmptyState>
      </Screen>
    </div>
  );
}
