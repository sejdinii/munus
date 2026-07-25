/* Apply-loop state machine (CONTRACTS §3.3 / FEATURES D2) as PURE
   functions, deliberately outside React so the transitions that carry the
   product's honesty guarantee can be tested directly and can never be
   corrupted by a stray UI path:

     prepared ──openListing──► opened ──confirmApplied──► confirmed
                                 │                            │
                                 └──── confirmApplied ────────┘
                                        (terminal)

   Rules the tests lock down:
   - confirmed is TERMINAL: nothing downgrades it (a receipt is a record).
   - markOpened only advances prepared → opened; it never resurrects or
     re-stamps a confirmed application.
   - openedAt/confirmedAt are stamped once, on the transition that earns
     them — never overwritten by a later call.
   - archiving is orthogonal to status and always reversible. */

export type ApplicationStatus = "prepared" | "opened" | "confirmed";

export type Application = {
  jobId: string;
  status: ApplicationStatus;
  openedAt?: number;
  confirmedAt?: number;
  archived?: boolean;
};

export function markOpenedIn(
  applications: Application[],
  jobId: string,
  now: number,
): Application[] {
  return applications.map((a) =>
    a.jobId === jobId && a.status === "prepared"
      ? { ...a, status: "opened" as const, openedAt: a.openedAt ?? now }
      : a,
  );
}

export function confirmAppliedIn(
  applications: Application[],
  jobId: string,
  now: number,
): Application[] {
  return applications.map((a) =>
    a.jobId === jobId && a.status !== "confirmed"
      ? { ...a, status: "confirmed" as const, confirmedAt: a.confirmedAt ?? now }
      : a,
  );
}

export function setArchivedIn(
  applications: Application[],
  jobId: string,
  archived: boolean,
): Application[] {
  return applications.map((a) => (a.jobId === jobId ? { ...a, archived } : a));
}
