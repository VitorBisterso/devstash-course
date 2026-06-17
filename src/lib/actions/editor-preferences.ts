"use server";

import { updateEditorPreferences } from "@/lib/db/editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES, EditorPreferences } from "@/lib/editor-preferences";
import { revalidatePath } from "next/cache";
import { requireAuth, unauthorizedError, type ActionResult } from "@/lib/actions/shared";

export async function saveEditorPreferences(
  preferences: Partial<EditorPreferences>
): Promise<ActionResult<EditorPreferences>> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  try {
    const updated = await updateEditorPreferences(userId, preferences);
    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to save editor preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

export async function getEditorPreferencesAction(): Promise<EditorPreferences> {
  const userId = await requireAuth();
  if (!userId) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const { getEditorPreferences } = await import("@/lib/db/editor-preferences");
  return getEditorPreferences(userId);
}
