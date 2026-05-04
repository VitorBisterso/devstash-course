"use server";

import { auth } from "@/auth";
import { updateEditorPreferences } from "@/lib/db/editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES, EditorPreferences } from "@/lib/editor-preferences";
import { revalidatePath } from "next/cache";

export async function saveEditorPreferences(
  preferences: Partial<EditorPreferences>
): Promise<{ success: boolean; error?: string; data?: EditorPreferences }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updated = await updateEditorPreferences(session.user.id, preferences);
    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to save editor preferences:", error);
    return { success: false, error: "Failed to save preferences" };
  }
}

export async function getEditorPreferencesAction(): Promise<EditorPreferences> {
  const session = await auth();

  if (!session?.user?.id) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  const { getEditorPreferences } = await import("@/lib/db/editor-preferences");
  return getEditorPreferences(session.user.id);
}
