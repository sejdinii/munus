"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";

const CALLBACK = "/auth/callback?next=/onboarding";

/**
 * Sign-in panel shown at the CV-upload moment for signed-out guests
 * (D16: everything before this is guest-previewable).
 * Google first; Apple lands before beta (D16).
 */
export function SignInGate() {
  const { status } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const authFailed = searchParams.get("auth") === "error";

  async function continueWithGoogle() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}${CALLBACK}` },
      });
      if (error) {
        setError(
          error.message.includes("not enabled")
            ? "Google sign-in is still being set up — check back shortly."
            : error.message,
        );
        setBusy(false);
      }
      // Success navigates away via the provider flow; busy stays true.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed. Try again.");
      setBusy(false);
    }
  }

  if (status === "unconfigured") {
    return (
      <div className="rounded-[18px] border border-line bg-paper px-5 py-6 text-center">
        <p className="m-0 text-sm text-muted">
          Sign-in is not configured in this environment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-line bg-paper px-5 py-7 text-center">
      <div className="mx-auto mb-3 grid size-[46px] place-items-center rounded-[15px] bg-rose-soft text-rose-ink">
        <GoogleIcon className="size-5" />
      </div>
      <h3 className="m-0 text-base">Sign in to keep your work</h3>
      <p className="mx-auto mb-4 mt-2 max-w-[260px] text-xs leading-[1.45] text-muted">
        Your answers and CV become the evidence source for matching and
        tailoring — tied to your account, private by default.
      </p>
      {authFailed && !error && (
        <p className="mb-3 text-xs text-rose-ink" role="alert">
          Sign-in did not complete — please try again.
        </p>
      )}
      {error && (
        <p className="mb-3 text-xs text-rose-ink" role="alert">
          {error}
        </p>
      )}
      <Button variant="primary" onClick={continueWithGoogle} disabled={busy}>
        {busy ? "Opening Google…" : "Continue with Google"}
      </Button>
      <p className="mt-3 text-[10px] leading-[1.4] text-muted">
        By continuing you agree to our Privacy Policy. Apple sign-in arrives
        before beta.
      </p>
    </div>
  );
}
