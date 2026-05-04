"use client";

import { Editor } from "@monaco-editor/react";
import { Check, Copy } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useEditorPreferences } from "@/context/editor-preferences-context";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  minHeight?: number;
}

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  minHeight = 100,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { preferences } = useEditorPreferences();
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);

  const handleEditorBeforeMount = useCallback((monaco: import("@monaco-editor/react").Monaco) => {
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#F8F8F2",
        "editorLineNumber.foreground": "#90908a",
        "editorLineNumber.activeForeground": "#F8F8F2",
      },
    });
    monaco.editor.defineTheme("github-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#c9d1d9",
        "editorLineNumber.foreground": "#8b949e",
        "editorLineNumber.activeForeground": "#c9d1d9",
      },
    });
  }, []);

  const handleEditorMount = useCallback((editor: import("monaco-editor").editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: preferences.fontSize,
        tabSize: preferences.tabSize,
        wordWrap: preferences.wordWrap ? "on" : "off",
        minimap: { enabled: preferences.minimap },
      });
    }
  }, [preferences.fontSize, preferences.tabSize, preferences.wordWrap, preferences.minimap]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-input overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight: 400 }}>
        <Editor
          height={Math.max(minHeight, Math.min(value.split("\n").length * 19 + 40, 400))}
          language={language}
          value={value}
          onChange={(val) => onChange?.(val || "")}
          theme={preferences.theme}
          beforeMount={handleEditorBeforeMount}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: preferences.minimap },
            lineNumbers: "on",
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 4,
            wordWrap: preferences.wordWrap ? "on" : "off",
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 8,
            },
            padding: { top: 8, bottom: 8 },
            fontSize: preferences.fontSize,
            tabSize: preferences.tabSize,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        />
      </div>
    </div>
  );
}