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

/** Create-or-advance in one step: two sequential setState calls
 *  (setApplication then markOpened) would run the second against pre-update
 *  state and silently no-op. */
export function openApplicationIn(
  applications: Application[],
  jobId: string,
  now: number,
): Application[] {
  const existing = applications.find((a) => a.jobId === jobId);
  if (!existing) {
    return [...applications, { jobId, status: "opened", openedAt: now }];
  }
  return markOpenedIn(applications, jobId, now);
}

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
  /* A user may confirm without ever opening through us (they applied from
     the listing elsewhere) — create the record rather than lose the fact. */
  if (!applications.some((a) => a.jobId === jobId)) {
    return [...applications, { jobId, status: "confirmed", confirmedAt: now }];
  }
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
