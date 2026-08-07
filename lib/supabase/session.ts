"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./client";

export type SessionStatus = "loading" | "unconfigured" | "signedOut" | "signedIn";

export type SessionState = {
  status: SessionStatus;
  user: User | null;
};

/**
 * Reactive auth state for client components.
 * - `unconfigured` when no Supabase env is present (mock/CI mode):
 *   the UI degrades gracefully instead of throwing.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState({ status: "unconfigured", user: null });
      return;
    }

    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({
        status: data.session ? "signedIn" : "signedOut",
        user: data.session?.user ?? null,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({
        status: session ? "signedIn" : "signedOut",
        user: session?.user ?? null,
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
