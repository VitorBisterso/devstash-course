import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EDITOR_PREFERENCES,
  EditorPreferences,
} from "@/lib/editor-preferences";

export async function getEditorPreferences(
  userId: string,
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  if (!user?.editorPreferences) {
    return DEFAULT_EDITOR_PREFERENCES;
  }

  return {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...(user.editorPreferences as object),
  } as EditorPreferences;
}

export async function updateEditorPreferences(
  userId: string,
  preferences: Partial<EditorPreferences>,
): Promise<EditorPreferences> {
  const current = await getEditorPreferences(userId);
  const updated = { ...current, ...preferences };

  await prisma.user.update({
    where: { id: userId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editorPreferences: updated as any,
    },
  });

  return updated;
}
