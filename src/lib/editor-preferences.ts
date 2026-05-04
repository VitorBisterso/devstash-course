export type EditorTheme = "vs-dark" | "monokai" | "github-dark";

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 22, 24];
export const TAB_SIZE_OPTIONS = [2, 4, 8];
export const EDITOR_THEMES: { value: EditorTheme; label: string }[] = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
];
