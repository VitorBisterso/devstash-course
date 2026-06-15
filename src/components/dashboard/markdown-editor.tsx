"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Crown, Loader2, Check, Copy } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  minHeight?: number;
  showOptimize?: boolean;
  isPro?: boolean;
  optimizedPrompt?: string | null;
  optimizeLoading?: boolean;
  onOptimize?: () => void;
  onApplyOptimized?: () => void;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = 100,
  showOptimize = false,
  isPro = false,
  optimizedPrompt = null,
  optimizeLoading = false,
  onOptimize,
  onApplyOptimized,
}: MarkdownEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "original" | "optimized">(
    readOnly ? "preview" : "write"
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showCompare = showOptimize && optimizedPrompt;

  const tabs = showCompare
    ? ["original", "optimized"]
    : readOnly
      ? ["preview"]
      : ["write", "preview"];

  const defaultTab = showCompare ? "original" : readOnly ? "preview" : "write" as "write" | "preview" | "original" | "optimized";

  if (activeTab !== defaultTab && !tabs.includes(activeTab)) {
    setActiveTab(defaultTab);
  }

  const displayValue = showCompare && activeTab === "optimized" ? optimizedPrompt : value;

  return (
    <div className="rounded-lg border border-input overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex items-center gap-1 ml-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "write" | "preview" | "original" | "optimized")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  activeTab === tab
                    ? "bg-[#1e1e1e] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showOptimize && !showCompare && !optimizeLoading && (
            isPro ? (
              <button
                onClick={onOptimize}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-[#3d3d3d]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Optimize</span>
              </button>
            ) : (
              <span
                title="AI features require Pro subscription"
                className="flex items-center gap-1 text-xs text-muted-foreground/50 cursor-not-allowed px-1.5 py-0.5"
              >
                <Crown className="w-3 h-3" />
                <span>Optimize</span>
              </span>
            )
          )}
          {showOptimize && optimizeLoading && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground px-1.5 py-0.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Optimizing...</span>
            </span>
          )}
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
      </div>
      {showCompare && activeTab === "optimized" && onApplyOptimized && (
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/30 border-b border-emerald-900/50">
          <span className="text-xs text-emerald-400 font-medium">Optimized version</span>
          <button
            onClick={onApplyOptimized}
            className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded transition-colors"
          >
            <Check className="w-3 h-3" />
            <span>Use This Version</span>
          </button>
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight: 400 }}>
        {activeTab === "write" && !showCompare ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            readOnly={readOnly}
            className="w-full min-h-[100px] bg-transparent border-0 focus:outline-none focus:ring-0 resize-none font-mono text-sm p-4"
            style={{ minHeight }}
            placeholder="Write your markdown here..."
          />
        ) : (
          <div
            className="markdown-preview p-4 text-sm"
            style={{ minHeight: Math.max(minHeight, 100) }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayValue}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
