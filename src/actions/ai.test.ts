import { describe, it, expect, vi, beforeEach } from "vitest";
import OpenAI from "openai";
import { generateAutoTags } from "./ai";
import { auth } from "@/auth";
import { canUseAI } from "@/lib/limits";
import openai from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/limits", () => ({
  canUseAI: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
  AI_MODEL: "gpt-5-nano",
  default: {
    responses: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rate-limit")>();
  return {
    ...actual,
    checkRateLimit: vi.fn(),
  };
});

const mockSession = { user: { id: "user-123" } };

const mockRateLimitSuccess = { success: true, remaining: 9, reset: Date.now() + 3600000 };

const mockOpenAIResponse = (tags: string[]) => ({
  output_text: JSON.stringify({ tags }),
});

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(canUseAI).mockResolvedValue(true);
    vi.mocked(checkRateLimit).mockResolvedValue(mockRateLimitSuccess);
  });

  it("returns unauthorized without session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await generateAutoTags({ title: "Test", description: "", content: "" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns unauthorized without user id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} });

    const result = await generateAutoTags({ title: "Test", description: "", content: "" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("gates on Pro subscription", async () => {
    vi.mocked(canUseAI).mockResolvedValue(false);

    const result = await generateAutoTags({ title: "Test", description: "", content: "" });

    expect(result).toEqual({
      success: false,
      error: "AI features require a Pro subscription",
    });
  });

  it("returns error on invalid input", async () => {
    const result = await generateAutoTags({});

    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("returns error on empty title", async () => {
    const result = await generateAutoTags({ title: "", description: "", content: "" });

    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("returns rate limit error when exceeded", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const result = await generateAutoTags({ title: "Test", description: "", content: "" });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Rate limit exceeded");
  });

  it("generates tags successfully", async () => {
    vi.mocked(openai.responses.create).mockResolvedValue(
      mockOpenAIResponse(["javascript", "async", "api"])
    );

    const result = await generateAutoTags({
      title: "Async API Call",
      description: "Making async API calls in JavaScript",
      content: "const data = await fetch(url);",
    });

    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(["javascript", "async", "api"]);
  });

  it("normalizes tags to lowercase", async () => {
    vi.mocked(openai.responses.create).mockResolvedValue(
      mockOpenAIResponse(["JavaScript", "Async", "API"])
    );

    const result = await generateAutoTags({
      title: "Test",
      description: "",
      content: "",
    });

    expect(result.data?.tags).toEqual(["javascript", "async", "api"]);
  });

  it("handles array response format", async () => {
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify(["react", "hooks", "state"]),
    });

    const result = await generateAutoTags({
      title: "React Hooks",
      description: "",
      content: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(["react", "hooks", "state"]);
  });

  it("filters out empty tags", async () => {
    vi.mocked(openai.responses.create).mockResolvedValue(
      mockOpenAIResponse(["react", "", "hooks", "  ", "state"])
    );

    const result = await generateAutoTags({
      title: "Test",
      description: "",
      content: "",
    });

    expect(result.data?.tags).toEqual(["react", "hooks", "state"]);
  });

  it("handles OpenAI API errors", async () => {
    const apiError = new OpenAI.APIError(500, { message: "Internal Server Error" }, "error", { get: () => undefined });
    vi.mocked(openai.responses.create).mockRejectedValue(apiError);

    const result = await generateAutoTags({
      title: "Test",
      description: "",
      content: "",
    });

    expect(result).toEqual({
      success: false,
      error: "AI service temporarily unavailable",
    });
  });

  it("truncates content over 2000 chars", async () => {
    const longContent = "a".repeat(3000);
    vi.mocked(openai.responses.create).mockResolvedValue(
      mockOpenAIResponse(["test"])
    );

    await generateAutoTags({
      title: "Test",
      description: "",
      content: longContent,
    });

    const callArg = vi.mocked(openai.responses.create).mock.calls[0][0];
    const input = callArg.input as string;
    expect(input.length).toBeLessThanOrEqual(2500);
    expect(input).toContain("...");
  });
});
