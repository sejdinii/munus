import { ButtonLink } from "@/components/ui/button";
import { Overline, Screen, Wordmark } from "@/components/ui/screen";

// Prototype screen 01 · Value proposition (pink theme hides the orbit art).
// Deviation from prototype: the "Preview with sample data" secondary CTA is
// deferred until the Discover deck exists (phase 2) — a dead-end button is
// worse than one honest CTA. Logged in FEATURES.md DISCOVERED GAPS.
export default function WelcomePage() {
  return (
    <Screen className="welcome">
      <Wordmark />
      <div className="welcome-copy">
        <Overline>Your job search, focused</Overline>
        <h1>
          Find the roles worth <em>your time.</em>
        </h1>
        <p className="lead">
          Fresh jobs from company sites and overlooked boards, ranked around
          the work you actually want.
        </p>
      </div>
      <div>
        <p className="trust-line">
          <span aria-hidden="true">✓</span>
          <span>You review every application before it is sent</span>
        </p>
        <div className="button-stack">
          <ButtonLink variant="primary" href="/sign-in">
            Build my job profile
          </ButtonLink>
        </div>
      </div>
    </Screen>
  );
}
