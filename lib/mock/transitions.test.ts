import { describe, expect, it } from "vitest";
import {
  confirmAppliedIn,
  markOpenedIn,
  openApplicationIn,
  setArchivedIn,
  type Application,
} from "./transitions";

const T1 = 1_000;
const T2 = 2_000;

const prepared: Application = { jobId: "mono", status: "prepared" };
const opened: Application = { jobId: "mono", status: "opened", openedAt: T1 };
const confirmed: Application = {
  jobId: "mono",
  status: "confirmed",
  openedAt: T1,
  confirmedAt: T2,
};

describe("apply-loop state machine (D2)", () => {
  it("advances prepared → opened and stamps openedAt", () => {
    const [a] = markOpenedIn([prepared], "mono", T1);
    expect(a?.status).toBe("opened");
    expect(a?.openedAt).toBe(T1);
  });

  it("re-opening the listing does not re-stamp openedAt", () => {
    const [a] = markOpenedIn(markOpenedIn([prepared], "mono", T1), "mono", T2);
    expect(a?.openedAt).toBe(T1);
  });

  it("advances opened → confirmed and stamps confirmedAt", () => {
    const [a] = confirmAppliedIn([opened], "mono", T2);
    expect(a?.status).toBe("confirmed");
    expect(a?.confirmedAt).toBe(T2);
    expect(a?.openedAt).toBe(T1);
  });

  it("confirming twice is idempotent — a receipt is a record", () => {
    const [a] = confirmAppliedIn(confirmAppliedIn([opened], "mono", T2), "mono", 9_999);
    expect(a?.confirmedAt).toBe(T2);
  });

  it("confirmed is TERMINAL: markOpened cannot downgrade it", () => {
    const [a] = markOpenedIn([confirmed], "mono", 9_999);
    expect(a?.status).toBe("confirmed");
    expect(a?.confirmedAt).toBe(T2);
  });

  it("a user can confirm without ever opening (they applied elsewhere)", () => {
    const [a] = confirmAppliedIn([prepared], "mono", T2);
    expect(a?.status).toBe("confirmed");
    expect(a?.openedAt).toBeUndefined();
  });

  it("transitions never touch other applications", () => {
    const others: Application[] = [prepared, { jobId: "arc", status: "prepared" }];
    const next = confirmAppliedIn(others, "mono", T2);
    expect(next.find((a) => a.jobId === "arc")?.status).toBe("prepared");
  });

  it("archiving is orthogonal to status and reversible", () => {
    const archived = setArchivedIn([confirmed], "mono", true);
    expect(archived[0]?.archived).toBe(true);
    expect(archived[0]?.status).toBe("confirmed");
    expect(archived[0]?.confirmedAt).toBe(T2);
    expect(setArchivedIn(archived, "mono", false)[0]?.archived).toBe(false);
  });

  it("archiving mid-flow preserves the pending status", () => {
    const [a] = setArchivedIn([opened], "mono", true);
    expect(a?.status).toBe("opened");
    expect(a?.openedAt).toBe(T1);
  });

  it("markOpened on an unknown id is a no-op — it never invents a record", () => {
    const next = markOpenedIn([prepared], "ghost", T1);
    expect(next).toHaveLength(1);
    expect(next[0]?.jobId).toBe("mono");
  });

  it("confirmApplied on an unknown id DOES create (applied elsewhere) and leaves others alone", () => {
    const next = confirmAppliedIn([prepared], "ghost", T1);
    expect(next).toHaveLength(2);
    expect(next.find((a) => a.jobId === "mono")?.status).toBe("prepared");
    expect(next.find((a) => a.jobId === "ghost")?.status).toBe("confirmed");
  });
});

describe("atomic create-or-advance (React batching safety)", () => {
  it("openApplicationIn creates an opened record when none exists", () => {
    const [a] = openApplicationIn([], "mono", T1);
    expect(a?.status).toBe("opened");
    expect(a?.openedAt).toBe(T1);
  });

  it("openApplicationIn advances an existing prepared record", () => {
    const [a] = openApplicationIn([prepared], "mono", T1);
    expect(a?.status).toBe("opened");
  });

  it("openApplicationIn never downgrades a confirmed record", () => {
    const [a] = openApplicationIn([confirmed], "mono", 9_999);
    expect(a?.status).toBe("confirmed");
    expect(a?.confirmedAt).toBe(T2);
  });

  it("confirmAppliedIn creates a record when the user applied elsewhere", () => {
    const [a] = confirmAppliedIn([], "mono", T2);
    expect(a?.status).toBe("confirmed");
    expect(a?.confirmedAt).toBe(T2);
  });
});
