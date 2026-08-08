"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/ui/icons";

/** W5b founder direction: no more guest mock deck — the home page offers a
 *  real "Log in" for existing accounts. Signs in via Google and lands the
 *  user straight on their ranked deck. */
export function LogInButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logIn() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/discover`,
        },
      });
      if (error) setError(error.message);
    } catch {
      setError("Sign-in couldn't start — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void logIn()}
        disabled={busy}
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] border border-transparent bg-transparent px-[18px] font-[710] disabled:opacity-60"
      >
        {busy ? "Opening Google…" : "Log in"}
      </button>
      {error ? <p className="mt-2 text-center text-xs text-rose-ink">{error}</p> : null}
    </div>
  );
}
