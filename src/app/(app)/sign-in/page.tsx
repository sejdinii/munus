import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { store } from "@/lib/store";
import { hasSupabase } from "@/lib/env";
import { Icon } from "@/components/ui/icons";
import { Screen, Wordmark } from "@/components/ui/screen";

// Auth screen — not in the JobSwipe5 template; composed in its language:
// centered glass card with icon circle + 24px/400 title + centered sub,
// pill buttons, uppercase micro-label. Sign-in structure itself follows the
// researched consensus (BACKLOG 2026-08-08): Google first, Apple second,
// legal copy above the buttons, brand-locked button fills.

const ERRORS: Record<string, string> = {
  "unknown-provider": "That sign-in method isn't available. Try Google or Apple.",
  "oauth-start": "We couldn't reach the sign-in provider. Check your connection and try again.",
  "oauth-denied": "Sign-in was cancelled. Nothing was shared with us.",
  "oauth-exchange": "Sign-in didn't complete. Please try again.",
  "no-auth-config":
    "Sign-in isn't configured on this deployment yet. If you run Scout, set the Supabase environment variables.",
};

function GoogleLogo() {
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
    const cvMeta = await store.getCvMeta(user.id).catch(() => null);
    redirect(cvMeta ? "/profile/facts" : "/onboarding");
  }
  const { error } = await searchParams;
  const errorMessage = error ? (ERRORS[error] ?? ERRORS["oauth-exchange"]) : null;

  return (
    <Screen className="onboarding">
      <div className="app-header" style={{ padding: "6px 0 22px" }}>
        <Wordmark />
      </div>

      <div className="onb-card liquid-glass fade-up" style={{ animationDelay: "0.15s" }}>
        <div className="onb-icon liquid-glass" aria-hidden="true">
          <Icon name="shield-check" size={26} />
        </div>
        <h1>
          Continue to <em style={{ color: "var(--gold-bright)", fontStyle: "normal" }}>Scout.</em>
        </h1>
        <p className="onb-sub">
          Your profile, favorites, and application receipts stay in one place —
          on this phone and the next one.
        </p>

        {errorMessage ? (
          <p
            role="alert"
            style={{
              margin: "0 0 14px",
              borderRadius: 16,
              background: "var(--bad-soft)",
              color: "var(--bad)",
              padding: "11px 13px",
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            {errorMessage}
          </p>
        ) : null}

        <div style={{ marginTop: "auto" }}>
          <p className="privacy" style={{ textAlign: "left", margin: "0 0 12px" }}>
            By continuing you agree to Scout&rsquo;s Terms and acknowledge the
            Privacy Policy. We never contact employers without your review.
          </p>
          <div className="button-stack">
            <a
              className="btn"
              style={{ background: "#ffffff", color: "#1f1f1f" }}
              href="/api/auth/signin?provider=google"
            >
              <GoogleLogo />
              Continue with Google
            </a>
            <a
              className="btn"
              style={{ background: "#ffffff", color: "#111111" }}
              href="/api/auth/signin?provider=apple"
            >
              <AppleLogo />
              Continue with Apple
            </a>
          </div>
          {!hasSupabase ? (
            <p className="privacy" style={{ marginTop: 12 }}>
              Dev mode — no auth provider is configured, so either button
              creates a local dev session.
            </p>
          ) : null}
        </div>

        <span className="step-label">One account, everything saved</span>
      </div>
    </Screen>
  );
}
