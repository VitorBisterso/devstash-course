import { z } from "zod";
import OpenAI from "openai";
import { auth } from "@/auth";
import { type RateLimitResult } from "@/lib/rate-limit";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function requireAuth(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function unauthorizedError(): ActionResult {
  return { success: false, error: "Unauthorized" };
}

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

export function rateLimitError(result: RateLimitResult): ActionResult {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return {
    success: false,
    error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
  };
}

export function handleOpenAIError(error: unknown, context: string): ActionResult {
  if (error instanceof OpenAI.APIError) {
    console.error(`OpenAI API error (${context}):`, error.status, error.message);
    return { success: false, error: "AI service temporarily unavailable" };
  }
  if (error instanceof OpenAI.APIConnectionError) {
    console.error(`OpenAI connection error (${context}):`, error.message);
    return { success: false, error: "AI service temporarily unavailable" };
  }
  console.error(`Failed to ${context}:`, error);
  return { success: false, error: `Failed to ${context}` };
}

export async function toggleAction<T extends string>(
  id: string,
  dbToggle: (userId: string, id: string) => Promise<boolean | null>,
  fieldName: T,
  notFoundMessage: string,
  errorMessage: string
): Promise<ActionResult<Record<T, boolean>>> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  try {
    const result = await dbToggle(userId, id);
    if (result === null) {
      return { success: false, error: notFoundMessage };
    }
    return { success: true, data: { [fieldName]: result } as Record<T, boolean> };
  } catch (error) {
    console.error(`Failed to ${errorMessage}:`, error);
    return { success: false, error: `Failed to ${errorMessage}` };
  }
}
