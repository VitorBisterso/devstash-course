"use server";

import { z } from "zod";
import { canUseAI } from "@/lib/limits";
import openai, { AI_MODEL } from "@/lib/openai";
import { aiRatelimits, checkRateLimit } from "@/lib/rate-limit";
import { AI_TAGS_CONTENT_MAX, AI_DESCRIPTION_CONTENT_MAX, AI_EXPLAIN_CONTENT_MAX, AI_OPTIMIZE_CONTENT_MAX } from "@/lib/constants";
import { requireAuth, unauthorizedError, rateLimitError, handleOpenAIError } from "@/lib/actions/shared";

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

async function checkAI(userId: string) {
  if (!(await canUseAI(userId))) {
    return { success: false as const, error: "AI features require a Pro subscription" };
  }
  return null;
}

export async function generateAutoTags(data: unknown): Promise<GenerateAutoTagsResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const aiCheck = await checkAI(userId);
  if (aiCheck) return aiCheck;

  const parsed = generateAutoTagsSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.tags, userId);

  if (!rateLimitResult.success) {
    return rateLimitError(rateLimitResult);
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
    return handleOpenAIError(error, "generate auto tags");
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
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const aiCheck = await checkAI(userId);
  if (aiCheck) return aiCheck;

  const parsed = generateDescriptionSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.description, userId);

  if (!rateLimitResult.success) {
    return rateLimitError(rateLimitResult);
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
    return handleOpenAIError(error, "generate description");
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
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const aiCheck = await checkAI(userId);
  if (aiCheck) return aiCheck;

  const parsed = explainCodeSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.explain, userId);

  if (!rateLimitResult.success) {
    return rateLimitError(rateLimitResult);
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
    return handleOpenAIError(error, "generate code explanation");
  }
}

const optimizePromptSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
});

export type OptimizePromptInput = z.infer<typeof optimizePromptSchema>;

export interface OptimizePromptResult {
  success: boolean;
  data?: { optimized: string };
  error?: string;
}

export async function optimizePrompt(data: unknown): Promise<OptimizePromptResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const aiCheck = await checkAI(userId);
  if (aiCheck) return aiCheck;

  const parsed = optimizePromptSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const rateLimitResult = await checkRateLimit(aiRatelimits.optimize, userId);

  if (!rateLimitResult.success) {
    return rateLimitError(rateLimitResult);
  }

  try {
    let text = `Return JSON with the optimized version of this prompt:\nTitle: ${parsed.data.title}`;
    if (parsed.data.content) {
      const truncated = parsed.data.content.length > AI_OPTIMIZE_CONTENT_MAX
        ? parsed.data.content.slice(0, AI_OPTIMIZE_CONTENT_MAX) + "..."
        : parsed.data.content;
      text += `\n\nPrompt:\n${truncated}`;
    }

    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a prompt engineering expert. Analyze the given prompt and refine it to be more " +
        "effective, clear, and specific. Improve structure, add context where helpful, and ensure " +
        "the prompt guides the AI toward the desired output. Keep the same core intent but make it " +
        "more precise and actionable. Return the optimized version in JSON format: " +
        '{ "optimized": "the optimized prompt here" }',
      input: text,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = JSON.parse(response.output_text);

    if (raw && typeof raw === "object" && "optimized" in raw) {
      const optimized = String(raw.optimized).trim();
      if (optimized.length > 0) {
        return { success: true, data: { optimized } };
      }
    }

    return { success: false, error: "Could not optimize prompt. Try again." };
  } catch (error) {
    return handleOpenAIError(error, "optimize prompt");
  }
}
