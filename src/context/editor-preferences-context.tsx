"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DEFAULT_EDITOR_PREFERENCES, EditorPreferences } from "@/lib/editor-preferences";
import { getEditorPreferencesAction } from "@/lib/actions/editor-preferences";

interface EditorPreferencesContextType {
  preferences: EditorPreferences;
  updatePreferences: (preferences: Partial<EditorPreferences>) => void;
  isLoaded: boolean;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextType | undefined>(
  undefined
);

export function EditorPreferencesProvider({
  children,
  initialPreferences,
}: {
  children: ReactNode;
  initialPreferences?: EditorPreferences;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(
    initialPreferences || DEFAULT_EDITOR_PREFERENCES
  );
  const [isLoaded, setIsLoaded] = useState(!!initialPreferences);

  useEffect(() => {
    if (!initialPreferences) {
      getEditorPreferencesAction().then((prefs) => {
        setPreferences(prefs);
        setIsLoaded(true);
      });
    }
  }, [initialPreferences]);

  const updatePreferences = (newPrefs: Partial<EditorPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }));
  };

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreferences, isLoaded }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error("useEditorPreferences must be used within EditorPreferencesProvider");
  }
  return context;
}
