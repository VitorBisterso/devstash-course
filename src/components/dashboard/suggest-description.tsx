"use client";

import { useState, useEffect } from "react";
import { generateDescription } from "@/actions/ai";
import { getSubscriptionStatus } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SuggestDescriptionProps {
  title: string;
  content: string;
  url: string;
  onDescriptionChange: (description: string) => void;
}

export function SuggestDescription({
  title,
  content,
  url,
  onDescriptionChange,
}: SuggestDescriptionProps) {
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    getSubscriptionStatus().then((status) => {
      setIsPro(status.isPro);
    });
  }, []);

  if (!isPro) return null;

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }

    const hasContent = content.trim() || url.trim();
    if (!hasContent) {
      toast.error("Add content or a URL first");
      return;
    }

    setLoading(true);

    try {
      const result = await generateDescription({ title, content, url });

      if (result.success && result.data) {
        onDescriptionChange(result.data.description);
        toast.success("Description generated");
      } else {
        toast.error(result.error || "Failed to generate description");
      }
    } catch {
      toast.error("Failed to generate description");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="h-7 px-2 text-xs gap-1"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      {loading ? "Generating..." : "Generate Description"}
    </Button>
  );
}
