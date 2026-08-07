"use client";

/* Mock client-side store — the single stateful interface every screen builds
   against until real API routes exist (W2+). Persists to localStorage so the
   demo survives reloads. Shapes mirror CONTRACTS.md §2:
   decisions.type = save | pass | star | unsave (D14);
   applications.status = prepared | opened | confirmed (D2). */

import {
  confirmAppliedIn,
  markOpenedIn,
  openApplicationIn,
  setArchivedIn,
  type Application,
  type ApplicationStatus,
} from "./transitions";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DecisionType = "save" | "pass" | "star" | "unsave";
export type Decision = { jobId: string; type: DecisionType; at: number };

/* The apply-loop shapes and transitions live in ./transitions as pure,
   directly-tested functions (D2 state machine). */
export type { Application, ApplicationStatus };

export type StudioState = {
  generated: boolean;
  accepted: string[];
  tone: string | null;
};

export type OnboardingAnswers = {
  roles?: string[];
  levels?: string[];
  workTypes?: string[];
  locations?: string[];
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
  coached: boolean;
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
  coached: false,
};

export const FREE_SWIPES = 20;
const STORAGE_KEY = "munus-mock-v1";

type Store = MunusState & {
  hydrated: boolean;
  storageError: boolean;
  decide: (
    jobId: string,
    type: Exclude<DecisionType, "unsave">,
    opts?: { meter?: boolean },
  ) => void;
  undo: () => Decision | undefined;
  unsave: (jobId: string) => void;
  restoreFavorite: (jobId: string) => void;
  setStudio: (jobId: string, patch: Partial<StudioState>) => void;
  setApplication: (jobId: string, status: ApplicationStatus) => void;
  markOpened: (jobId: string) => void;
  /** Atomic create-or-advance to `opened` (redirect apply). */
  openApplication: (jobId: string) => void;
  confirmApplied: (jobId: string) => void;
  setArchived: (jobId: string, archived: boolean) => void;
  setOnboarding: (patch: Partial<OnboardingAnswers>) => void;
  setCoached: () => void;
  swipesLeft: number;
  reset: () => void;
};

const MunusContext = createContext<Store | null>(null);

export function MunusStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MunusState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  /* Synchronous mirror of state for actions that must READ current state
     when called (undo returns the reverted decision). Reading inside a
     setState updater and returning it does NOT work — updaters run after
     the handler, so callers would always get undefined. */
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {
      /* corrupted storage: start fresh, but say so — screens can offer a
         real error state instead of silently losing data (critic W2 #5) */
      setStorageError(true);
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

  /* meter:false = decisions made outside the deck (e.g. from job detail)
     — swipes are the deck's currency only (critic W2 finding 4, D9). A pass
     always removes any favorite: passing is an explicit negative signal and
     favorited+dismissed is a contradiction. */
  const decide = useCallback(
    (
      jobId: string,
      type: Exclude<DecisionType, "unsave">,
      opts?: { meter?: boolean },
    ) => {
      const meter = opts?.meter !== false;
      setState((s) => ({
        ...s,
        decisions: [...s.decisions, { jobId, type, at: Date.now() }],
        swipesUsed: meter ? s.swipesUsed + 1 : s.swipesUsed,
        favorites:
          type === "pass"
            ? s.favorites.filter((id) => id !== jobId)
            : (type === "save" || type === "star") &&
                !s.favorites.includes(jobId)
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
    const last =
      stateRef.current.decisions[stateRef.current.decisions.length - 1];
    /* unsave is not a deck decision: undoing it here would leak a free
       swipe and not restore the favorite (critic W2 finding 2). */
    if (!last || last.type === "unsave") return undefined;
    setState((s) => ({
      ...s,
      decisions: s.decisions.slice(0, -1),
      swipesUsed: Math.max(0, s.swipesUsed - 1),
      favorites:
        last.type === "save" || last.type === "star"
          ? s.favorites.filter((id) => id !== last.jobId)
          : s.favorites,
      dismissed: s.dismissed.filter((id) => id !== last.jobId),
    }));
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

  /* Apply-loop transitions (D2 state machine): prepared → opened →
     confirmed. markOpened never downgrades a confirmed application;
     confirmApplied is terminal. */
  const markOpened = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      applications: markOpenedIn(s.applications, jobId, Date.now()),
    }));
  }, []);

  const openApplication = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      applications: openApplicationIn(s.applications, jobId, Date.now()),
    }));
  }, []);

  const confirmApplied = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      applications: confirmAppliedIn(s.applications, jobId, Date.now()),
    }));
  }, []);

  const setArchived = useCallback((jobId: string, archived: boolean) => {
    setState((s) => ({
      ...s,
      applications: setArchivedIn(s.applications, jobId, archived),
    }));
  }, []);

  const setOnboarding = useCallback((patch: Partial<OnboardingAnswers>) => {
    setState((s) => ({ ...s, onboarding: { ...s.onboarding, ...patch } }));
  }, []);

  const setCoached = useCallback(() => {
    setState((s) => ({ ...s, coached: true }));
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      storageError,
      decide,
      undo,
      unsave,
      restoreFavorite,
      setStudio,
      setApplication,
      markOpened,
      openApplication,
      confirmApplied,
      setArchived,
      setOnboarding,
      setCoached,
      swipesLeft: Math.max(0, FREE_SWIPES - state.swipesUsed),
      reset,
    }),
    [
      state,
      hydrated,
      storageError,
      decide,
      undo,
      unsave,
      restoreFavorite,
      setStudio,
      setApplication,
      markOpened,
      openApplication,
      confirmApplied,
      setArchived,
      setOnboarding,
      setCoached,
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
