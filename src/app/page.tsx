import { ButtonLink } from "@/components/ui/button";
import { Overline, Screen, Wordmark } from "@/components/ui/screen";

// Prototype screen 01 recomposed per researched hero pattern (BACKLOG design
// intel 2026-08-08): rose color band + organic blobs + orbit art on top,
// paper sheet overlapping from below. Category analogs (Angi/Airtasker) run
// 35-40% color mass in a top band; the prototype's own pink theme shipped
// dead space there instead.
export default function WelcomePage() {
  return (
    <Screen className="welcome">
      <div className="hero-band">
        <Wordmark />
        <div className="welcome-orbit" aria-hidden="true">
          <span className="orbit-card orbit-one">
            <small>your fit</small>
            <strong>92%</strong>
          </span>
          <span className="orbit-pop">↗</span>
          <span className="orbit-card orbit-two">
            <small>fresh today</small>
            <strong>24</strong>
          </span>
        </div>
      </div>
      <div className="hero-sheet">
        <div>
          <Overline>Your job search, focused</Overline>
          <h1>
            Find the roles worth <em>your time.</em>
          </h1>
          <p className="lead">
            Fresh jobs from company sites and overlooked boards, ranked around
            the work you actually want.
          </p>
        </div>
        <div className="sheet-bottom">
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
      </div>
    </Screen>
  );
}
