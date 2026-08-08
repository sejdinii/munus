import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { hasSupabase } from "@/lib/env";
import { Overline, Screen, Wordmark } from "@/components/ui/screen";

// Unified "Continue" screen. Pattern per BACKLOG.md design intel (2026-08-08):
// Google first then Apple (PWA — Apple's 4.8 prominence rule doesn't bind),
// full-width stacked, brand-locked button anatomy (Google white + color G,
// Apple solid black on light bg), legal copy ABOVE the buttons — the
// Indeed/Glassdoor placement, which fits Scout's trust-first stance.

const ERRORS: Record<string, string> = {
  "unknown-provider": "That sign-in method isn't available. Try Google or Apple.",
  "oauth-start": "We couldn't reach the sign-in provider. Check your connection and try again.",
  "oauth-denied": "Sign-in was cancelled. Nothing was shared with us.",
  "oauth-exchange": "Sign-in didn't complete. Please try again.",
  "no-auth-config": "Sign-in isn't configured on this deployment yet. If you run Scout, set the Supabase environment variables.",
};

function GoogleLogo() {
  // stroke:none blocks the .btn svg icon stroke from outlining the brand mark.
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 18, height: 18, stroke: "none" }}>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 18, height: 18, stroke: "none" }}>
      <path
        fill="currentColor"
        d="M16.7 12.94c.03 3.02 2.65 4.02 2.68 4.03-.02.07-.42 1.44-1.38 2.85-.83 1.22-1.7 2.43-3.06 2.46-1.34.02-1.77-.8-3.3-.8-1.53 0-2 .77-3.27.82-1.31.05-2.32-1.32-3.16-2.53-1.71-2.48-3.02-7-1.26-10.06a4.9 4.9 0 0 1 4.14-2.51c1.29-.03 2.51.87 3.3.87.79 0 2.27-1.07 3.83-.92.65.03 2.48.26 3.66 1.99-.1.06-2.19 1.28-2.16 3.8ZM14.18 5.5c.7-.85 1.17-2.02 1.04-3.19-1.01.04-2.22.67-2.95 1.51-.65.75-1.21 1.95-1.06 3.1 1.12.09 2.27-.57 2.97-1.42Z"
      />
    </svg>
  );
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) {
    // A store failure (e.g. schema not applied yet) must not crash the very
    // first screen — fall back to onboarding and let deeper screens report.
    const cvMeta = await store.getCvMeta(user.id).catch(() => null);
    redirect(cvMeta ? "/profile/facts" : "/onboarding");
  }
  const { error } = await searchParams;
  const errorMessage = error ? (ERRORS[error] ?? ERRORS["oauth-exchange"]) : null;

  return (
    <Screen className="welcome">
      <Wordmark />
      <div className="ready-art" aria-hidden="true" style={{ marginTop: 40 }}>
        <div className="ready-card" />
        <div className="ready-card" />
        <div className="ready-card">
          <div>
            <strong>92</strong>
            <br />
            <span>top match · saved to your account</span>
          </div>
        </div>
      </div>
      <div className="welcome-copy" style={{ marginBottom: 34 }}>
        <Overline>One account, everything saved</Overline>
        <h1 style={{ fontSize: 38, letterSpacing: "-0.055em" }}>
          Continue to <em>Scout.</em>
        </h1>
        <p className="lead">
          Your profile, favorites, and application receipts stay in one place —
          on this phone and the next one.
        </p>
      </div>
      <div>
        {errorMessage ? (
          <p
            role="alert"
            style={{
              margin: "0 0 14px",
              borderRadius: 12,
              background: "#fdf3f4",
              color: "var(--red)",
              padding: "11px 13px",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {errorMessage}
          </p>
        ) : null}
        <p className="privacy" style={{ textAlign: "left", margin: "0 0 12px" }}>
          By continuing you agree to Scout&rsquo;s Terms and acknowledge the
          Privacy Policy. We never contact employers without your review.
        </p>
        <div className="button-stack">
          <a className="btn" href="/api/auth/signin?provider=google">
            <GoogleLogo />
            Continue with Google
          </a>
          <a className="btn btn-dark" href="/api/auth/signin?provider=apple">
            <AppleLogo />
            Continue with Apple
          </a>
        </div>
        {!hasSupabase ? (
          <p className="privacy" style={{ marginTop: 12 }}>
            Dev mode — no auth provider is configured, so either button creates
            a local dev session.
          </p>
        ) : null}
      </div>
    </Screen>
  );
}
