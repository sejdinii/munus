"use client";

/* Mock client-side store — the single stateful interface every screen builds
   against until real API routes exist (W2+). Persists to localStorage so the
   demo survives reloads. Shapes mirror CONTRACTS.md §2:
   decisions.type = save | pass | star | unsave (D14);
   applications.status = prepared | opened | confirmed (D2). */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DecisionType = "save" | "pass" | "star" | "unsave";
export type Decision = { jobId: string; type: DecisionType; at: number };

export type ApplicationStatus = "prepared" | "opened" | "confirmed";
export type Application = {
  jobId: string;
  status: ApplicationStatus;
  confirmedAt?: number;
};

export type StudioState = {
  generated: boolean;
  accepted: string[];
  tone: string | null;
};

export type OnboardingAnswers = {
  role?: string;
  location?: string;
  level?: string;
  salaryFloor?: string;
  cvUploaded?: boolean;
  alerts?: string;
  completed?: boolean;
};

type MunusState = {
  decisions: Decision[];
  favorites: string[];
  dismissed: string[];
  applications: Application[];
  studio: Record<string, StudioState>;
  swipesUsed: number;
  onboarding: OnboardingAnswers;
};

/* northstar starts favorited — prototype parity for the demo. */
const initialState: MunusState = {
  decisions: [],
  favorites: ["northstar"],
  dismissed: [],
  applications: [],
  studio: {},
  swipesUsed: 0,
  onboarding: {},
};

export const FREE_SWIPES = 20;
const STORAGE_KEY = "munus-mock-v1";

type Store = MunusState & {
  hydrated: boolean;
  decide: (jobId: string, type: Exclude<DecisionType, "unsave">) => void;
  undo: () => Decision | undefined;
  unsave: (jobId: string) => void;
  restoreFavorite: (jobId: string) => void;
  setStudio: (jobId: string, patch: Partial<StudioState>) => void;
  setApplication: (jobId: string, status: ApplicationStatus) => void;
  setOnboarding: (patch: Partial<OnboardingAnswers>) => void;
  swipesLeft: number;
  reset: () => void;
};

const MunusContext = createContext<Store | null>(null);

export function MunusStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MunusState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* corrupted storage: start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full/unavailable: state stays in memory */
    }
  }, [state, hydrated]);

  const decide = useCallback(
    (jobId: string, type: Exclude<DecisionType, "unsave">) => {
      setState((s) => ({
        ...s,
        decisions: [...s.decisions, { jobId, type, at: Date.now() }],
        swipesUsed: s.swipesUsed + 1,
        favorites:
          (type === "save" || type === "star") && !s.favorites.includes(jobId)
            ? [...s.favorites, jobId]
            : s.favorites,
        dismissed:
          type === "pass" && !s.dismissed.includes(jobId)
            ? [...s.dismissed, jobId]
            : s.dismissed,
      }));
    },
    [],
  );

  const undo = useCallback(() => {
    let last: Decision | undefined;
    setState((s) => {
      last = s.decisions[s.decisions.length - 1];
      if (!last) return s;
      return {
        ...s,
        decisions: s.decisions.slice(0, -1),
        swipesUsed: Math.max(0, s.swipesUsed - 1),
        favorites:
          last.type === "save" || last.type === "star"
            ? s.favorites.filter((id) => id !== last?.jobId)
            : s.favorites,
        dismissed: s.dismissed.filter((id) => id !== last?.jobId),
      };
    });
    return last;
  }, []);

  const unsave = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      decisions: [...s.decisions, { jobId, type: "unsave", at: Date.now() }],
      favorites: s.favorites.filter((id) => id !== jobId),
    }));
  }, []);

  /* Inverse of unsave for the toast's Undo: restores the favorite and logs a
     save decision WITHOUT consuming a swipe — undoing a removal is not a new
     deck decision. */
  const restoreFavorite = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      decisions: [...s.decisions, { jobId, type: "save", at: Date.now() }],
      favorites: s.favorites.includes(jobId)
        ? s.favorites
        : [...s.favorites, jobId],
    }));
  }, []);

  const setStudio = useCallback(
    (jobId: string, patch: Partial<StudioState>) => {
      setState((s) => ({
        ...s,
        studio: {
          ...s.studio,
          [jobId]: {
            generated: false,
            accepted: [],
            tone: null,
            ...s.studio[jobId],
            ...patch,
          },
        },
      }));
    },
    [],
  );

  const setApplication = useCallback(
    (jobId: string, status: ApplicationStatus) => {
      setState((s) => {
        const existing = s.applications.find((a) => a.jobId === jobId);
        const next: Application = {
          jobId,
          status,
          confirmedAt:
            status === "confirmed" ? Date.now() : existing?.confirmedAt,
        };
        return {
          ...s,
          applications: [
            ...s.applications.filter((a) => a.jobId !== jobId),
            next,
          ],
        };
      });
    },
    [],
  );

  const setOnboarding = useCallback((patch: Partial<OnboardingAnswers>) => {
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...patch } }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      decide,
      undo,
      unsave,
      restoreFavorite,
      setStudio,
      setApplication,
      setOnboarding,
      swipesLeft: Math.max(0, FREE_SWIPES - state.swipesUsed),
      reset,
    }),
    [
      state,
      hydrated,
      decide,
      undo,
      unsave,
      restoreFavorite,
      setStudio,
      setApplication,
      setOnboarding,
      reset,
    ],
  );

  return <MunusContext.Provider value={value}>{children}</MunusContext.Provider>;
}

export function useMunusStore(): Store {
  const store = useContext(MunusContext);
  if (!store) {
    throw new Error("useMunusStore must be used inside MunusStoreProvider");
  }
  return store;
}
