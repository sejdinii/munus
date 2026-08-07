import { describe, expect, it, vi } from "vitest";
import { extractFactsGroq } from "../facts-groq";

describe("extractFactsGroq", () => {
  it("calls the Groq endpoint with the right model and parses facts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                facts: [
                  { kind: "role", content: "Data Scientist", source_span: "Data Scientist" },
                  { kind: "skill", content: "Python", source_span: "Python" },
                  { kind: "junk", content: "ignored" },
                ],
              }),
            },
          },
        ],
      }),
    });

    const facts = await extractFactsGroq("CV TEXT", "test-key", fetchMock as unknown as typeof fetch);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.groq.com/openai/v1/chat/completions");
    const body = JSON.parse(init.body as string) as { model: string };
    expect(body.model).toBe("openai/gpt-oss-120b");
    expect(facts).toHaveLength(2);
    expect(facts.map((f) => f.kind)).toEqual(["role", "skill"]);
  });

  it("returns [] on API errors instead of throwing", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "unauthorized",
    });
    await expect(
      extractFactsGroq("CV", "bad-key", fetchMock as unknown as typeof fetch),
    ).rejects.toThrow(/401/);
  });

  it("returns [] when the model emits no usable content", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "not json" } }] }),
    });
    const facts = await extractFactsGroq("CV", "key", fetchMock as unknown as typeof fetch);
    expect(facts).toEqual([]);
  });
});
