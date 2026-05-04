"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { saveEditorPreferences } from "@/lib/actions/editor-preferences";
import { useEditorPreferences } from "@/context/editor-preferences-context";
import {
  EditorPreferences as EditorPreferencesType,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  EDITOR_THEMES,
} from "@/lib/editor-preferences";

interface EditorPreferencesProps {
  initialPreferences: EditorPreferencesType;
}

export function EditorPreferences({
  initialPreferences,
}: EditorPreferencesProps) {
  const router = useRouter();
  const { updatePreferences } = useEditorPreferences();
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    key: keyof EditorPreferencesType,
    value: string | number | boolean,
  ) => {
    startTransition(async () => {
      const result = await saveEditorPreferences({ [key]: value });
      if (result.success) {
        updatePreferences({ [key]: value });
        toast.success("Editor preferences saved");
      } else {
        toast.error(result.error || "Failed to save preferences");
      }
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Editor Preferences
      </h2>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select
              value={String(initialPreferences.fontSize)}
              onValueChange={(value) =>
                value && handleChange("fontSize", parseInt(value))
              }
            >
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tabSize">Tab Size</Label>
            <Select
              value={String(initialPreferences.tabSize)}
              onValueChange={(value) =>
                value && handleChange("tabSize", parseInt(value))
              }
            >
              <SelectTrigger id="tabSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAB_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} spaces
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={initialPreferences.theme}
              onValueChange={(value) =>
                value && handleChange("theme", value)
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDITOR_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="wordWrap">Word Wrap</Label>
              <p className="text-sm text-muted-foreground">
                Wrap text to next line when it reaches the editor width
              </p>
            </div>
            <Switch
              id="wordWrap"
              checked={initialPreferences.wordWrap}
              onCheckedChange={(checked) => handleChange("wordWrap", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="minimap">Minimap</Label>
              <p className="text-sm text-muted-foreground">
                Show a miniature preview of the entire file on the right side
              </p>
            </div>
            <Switch
              id="minimap"
              checked={initialPreferences.minimap}
              onCheckedChange={(checked) => handleChange("minimap", checked)}
            />
          </div>
        </div>

        {isPending && (
          <p className="text-sm text-muted-foreground text-center">Saving...</p>
        )}
      </div>
    </div>
  );
}
