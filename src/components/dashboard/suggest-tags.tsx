"use client";

import { useState, useEffect } from "react";
import { generateAutoTags } from "@/actions/ai";
import { getSubscriptionStatus } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SuggestTagsProps {
  title: string;
  description: string;
  content: string;
  currentTags: string;
  onTagsChange: (tags: string) => void;
}

export function SuggestTags({ title, description, content, currentTags, onTagsChange }: SuggestTagsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    getSubscriptionStatus().then((status) => {
      setIsPro(status.isPro);
    });
  }, []);

  if (!isPro) return null;

  const handleSuggest = async () => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }

    const hasContent = description.trim() || content.trim();
    if (!hasContent) {
      toast.error("Add content or description first");
      return;
    }

    setLoading(true);
    setSuggestions([]);

    try {
      const result = await generateAutoTags({ title, description, content });

      if (result.success && result.data) {
        setSuggestions(result.data.tags);
      } else {
        toast.error(result.error || "Failed to generate tags");
      }
    } catch {
      toast.error("Failed to generate tags");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (tag: string) => {
    const currentList = currentTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (currentList.includes(tag.toLowerCase())) {
      toast.info("Tag already added");
      return;
    }

    const newList = [...currentList, tag.toLowerCase()];
    onTagsChange(newList.join(", "));
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  const handleReject = (tag: string) => {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={loading}
        className="h-7 px-2 text-xs gap-1"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {loading ? "Generating tags..." : "Suggest Tags"}
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
              {tag}
              <button
                type="button"
                onClick={() => handleAccept(tag)}
                className="hover:text-green-500 transition-colors"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => handleReject(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
