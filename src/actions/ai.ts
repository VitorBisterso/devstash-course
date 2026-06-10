"use server";

import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { canUseAI } from "@/lib/limits";
import openai, { AI_MODEL } from "@/lib/openai";
import { aiRatelimits, checkRateLimit } from "@/lib/rate-limit";
import { AI_TAGS_CONTENT_MAX } from "@/lib/constants";

const generateAutoTagsSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  content: z.string().max(10000).nullable().optional(),
});

export type GenerateAutoTagsInput = z.infer<typeof generateAutoTagsSchema>;

export interface GenerateAutoTagsResult {
  success: boolean;
  data?: { tags: string[] };
  error?: string;
}

function buildTagPrompt(title: string, description: string | null, content: string | null): string {
  let text = `Return JSON tags for:\nTitle: ${title}`;
  if (description) text += `\n\nDescription: ${description}`;
  if (content) {
    const truncated = content.length > AI_TAGS_CONTENT_MAX
      ? content.slice(0, AI_TAGS_CONTENT_MAX) + "..."
      : content;
    text += `\n\nContent: ${truncated}`;
  }
  return text;
}

function parseTagsResponse(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
  }
  if (raw && typeof raw === "object" && "tags" in raw) {
    const tags = (raw as Record<string, unknown>).tags;
    if (Array.isArray(tags)) {
      return tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
    }
  }
  return [];
}

export async function generateAutoTags(data: unknown): Promise<GenerateAutoTagsResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!(await canUseAI(session.user.id))) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const parsed = generateAutoTagsSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.tags, session.user.id);

  if (!rateLimitResult.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
    return {
      success: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  try {
    const prompt = buildTagPrompt(
      parsed.data.title,
      parsed.data.description ?? null,
      parsed.data.content ?? null
    );

    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Suggest 3-5 relevant tags for the given content. " +
        "Respond in JSON format: { \"tags\": [\"tag1\", \"tag2\", \"tag3\"] } OR " +
        "a JSON array [\"tag1\", \"tag2\", \"tag3\"]. Tags should be lowercase, single words or short phrases.",
      input: prompt,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = JSON.parse(response.output_text);
    const tags = parseTagsResponse(raw);

    if (tags.length === 0) {
      return { success: false, error: "Could not generate tags. Try again." };
    }

    return { success: true, data: { tags } };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error.status, error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    if (error instanceof OpenAI.APIConnectionError) {
      console.error("OpenAI connection error:", error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    console.error("Failed to generate auto tags:", error);
    return { success: false, error: "Failed to generate auto tags" };
  }
}
