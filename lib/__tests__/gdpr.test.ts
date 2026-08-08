import { describe, expect, it, vi } from "vitest";
import { collectExport, deleteAccount } from "../gdpr";

function fakeDb(overrides: Partial<Record<string, unknown>> = {}) {
  /* Thenable chain: eq/order at any position yield the table's rows. */
  function table(name: string) {
    type Chain = {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      order: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      insert: ReturnType<typeof vi.fn>;
      then: (resolve: (v: { data: unknown[] | null; error: unknown }) => unknown, reject: (e: unknown) => unknown) => Promise<unknown>;
    };
    const result = (overrides[name] ?? { data: [], error: null }) as { data: unknown[] | null; error: unknown };
    const chain: Chain = {
      select: vi.fn().mockImplementation(() => chain),
      eq: vi.fn().mockImplementation(() => chain),
      order: vi.fn().mockImplementation(() => chain),
      delete: vi.fn().mockImplementation(() => chain),
      insert: vi.fn().mockResolvedValue({ error: null }),
      then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    };
    return chain;
  }
  return { from: vi.fn((name: string) => table(name)) } as never;
}

function fakeStorage(files: Array<{ name: string }> = []) {
  const storage = {
    from: vi.fn().mockReturnValue({
      list: vi.fn().mockResolvedValue({ data: files, error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    }),
  };
  return storage as never;
}

describe("collectExport", () => {
  it("packages profile, facts, usage and files", async () => {
    const db = fakeDb({
      profiles: {
        data: [{ id: "u1", role_targets: ["Machine learning engineer"] }],
        error: null,
      },
      facts: {
        data: [
          { kind: "skill", content: "Python", source_span: "Line 12", created_at: "2026-08-01T00:00:00Z" },
        ],
        error: null,
      },
      llm_usage: {
        data: [
          { endpoint: "tailor", model: "openai/gpt-oss-120b", prompt_tokens: 100, completion_tokens: 50, cost_eur: 0.0001, created_at: "2026-08-01T00:00:00Z" },
        ],
        error: null,
      },
    });
    const storage = fakeStorage([{ name: "doc_x.pdf" }]);
    const out = await collectExport(db, storage, "u1", "a@b.c", "A B");
    expect(out.user.email).toBe("a@b.c");
    expect(out.profile).toMatchObject({ id: "u1" });
    expect(out.facts).toHaveLength(1);
    expect(out.facts[0]?.kind).toBe("skill");
    expect(out.llmUsage).toHaveLength(1);
    expect(out.llmUsage[0]?.endpoint).toBe("tailor");
    expect(out.files).toEqual([{ name: "doc_x.pdf", kind: "file", size: null }]);
  });

  it("never throws on empty stores", async () => {
    const db = fakeDb();
    const out = await collectExport(db, fakeStorage(), "u1", undefined, undefined);
    expect(out.profile).toBeNull();
    expect(out.facts).toEqual([]);
    expect(out.files).toEqual([]);
  });
});

describe("deleteAccount", () => {
  it("removes storage files then the profile", async () => {
    const db = fakeDb();
    const storage = fakeStorage([{ name: "doc_x.pdf" }]);
    await deleteAccount(db, storage, "u1");
    const storageMock = storage as unknown as { from: ReturnType<typeof vi.fn> };
    expect(storageMock.from).toHaveBeenCalledWith("cv-uploads");
    const removeMock = storageMock.from.mock.results[0]?.value.remove as ReturnType<typeof vi.fn>;
    expect(removeMock).toHaveBeenCalledWith(["doc_x.pdf"]);
    const dbMock = db as unknown as { from: ReturnType<typeof vi.fn> };
    expect(dbMock.from).toHaveBeenCalledWith("profiles");
  });
});
