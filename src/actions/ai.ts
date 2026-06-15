"use server";

import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { canUseAI } from "@/lib/limits";
import openai, { AI_MODEL } from "@/lib/openai";
import { aiRatelimits, checkRateLimit } from "@/lib/rate-limit";
import { AI_TAGS_CONTENT_MAX, AI_DESCRIPTION_CONTENT_MAX, AI_EXPLAIN_CONTENT_MAX } from "@/lib/constants";

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

const generateDescriptionSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().max(10000).nullable().optional(),
  url: z.string().max(2000).nullable().optional(),
});

export type GenerateDescriptionInput = z.infer<typeof generateDescriptionSchema>;

export interface GenerateDescriptionResult {
  success: boolean;
  data?: { description: string };
  error?: string;
}

export async function generateDescription(data: unknown): Promise<GenerateDescriptionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!(await canUseAI(session.user.id))) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const parsed = generateDescriptionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.description, session.user.id);

  if (!rateLimitResult.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
    return {
      success: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  try {
    let text = `Generate a JSON description for:\nTitle: ${parsed.data.title}`;
    if (parsed.data.content) {
      const truncated = parsed.data.content.length > AI_DESCRIPTION_CONTENT_MAX
        ? parsed.data.content.slice(0, AI_DESCRIPTION_CONTENT_MAX) + "..."
        : parsed.data.content;
      text += `\n\nContent: ${truncated}`;
    }
    if (parsed.data.url) {
      text += `\n\nURL: ${parsed.data.url}`;
    }

    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Generate a concise 1-2 sentence description/summary " +
        "for the given item based on its title and content. Make it informative and useful for " +
        "a developer. Respond in JSON format: { \"description\": \"your summary here\" }",
      input: text,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = JSON.parse(response.output_text);

    if (raw && typeof raw === "object" && "description" in raw) {
      const description = String(raw.description).trim();
      if (description.length > 0) {
        return { success: true, data: { description } };
      }
    }

    return { success: false, error: "Could not generate description. Try again." };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error.status, error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    if (error instanceof OpenAI.APIConnectionError) {
      console.error("OpenAI connection error:", error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    console.error("Failed to generate description:", error);
    return { success: false, error: "Failed to generate description" };
  }
}

const explainCodeSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  language: z.string().max(50).nullable().optional(),
});

export type ExplainCodeInput = z.infer<typeof explainCodeSchema>;

export interface ExplainCodeResult {
  success: boolean;
  data?: { explanation: string };
  error?: string;
}

export async function explainCode(data: unknown): Promise<ExplainCodeResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!(await canUseAI(session.user.id))) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const parsed = explainCodeSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.explain, session.user.id);

  if (!rateLimitResult.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
    return {
      success: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
    };
  }

  try {
    let text = `Return JSON explaining this code in ~200-300 words. Cover what the code does and key concepts.\nTitle: ${parsed.data.title}`;
    if (parsed.data.content) {
      const truncated = parsed.data.content.length > AI_EXPLAIN_CONTENT_MAX
        ? parsed.data.content.slice(0, AI_EXPLAIN_CONTENT_MAX) + "..."
        : parsed.data.content;
      text += `\n\nCode:\n${truncated}`;
    }
    if (parsed.data.language) {
      text += `\n\nLanguage: ${parsed.data.language}`;
    }

    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a senior developer explaining code to other developers. " +
        "Write a concise explanation (~200-300 words) covering what the code does, " +
        "how it works, and key concepts involved. Use markdown for formatting. " +
        "Respond in JSON format: { \"explanation\": \"your markdown explanation here\" }",
      input: text,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = JSON.parse(response.output_text);

    if (raw && typeof raw === "object" && "explanation" in raw) {
      const explanation = String(raw.explanation).trim();
      if (explanation.length > 0) {
        return { success: true, data: { explanation } };
      }
    }

    return { success: false, error: "Could not generate explanation. Try again." };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error.status, error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    if (error instanceof OpenAI.APIConnectionError) {
      console.error("OpenAI connection error:", error.message);
      return { success: false, error: "AI service temporarily unavailable" };
    }
    console.error("Failed to generate code explanation:", error);
    return { success: false, error: "Failed to generate code explanation" };
  }
}
