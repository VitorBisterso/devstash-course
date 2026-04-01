"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { typeIcons, getIconWithColor } from "@/lib/constants";
import type { ItemDetail } from "@/lib/db/items";
import { Star, Pin, Pencil, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (res.ok) {
          const data = await res.json();
          setItem(data);
        }
      } catch (error) {
        console.error("Failed to fetch item:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  const handleCopy = async () => {
    if (!item?.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm("Are you sure you want to delete this item?")) return;

    const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Item deleted");
      onClose();
      router.refresh();
    } else {
      toast.error("Failed to delete item");
    }
  };

  const handleFavorite = async () => {
    if (!item) return;
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
    if (res.ok) {
      setItem({ ...item, isFavorite: !item.isFavorite });
      toast.success(item.isFavorite ? "Removed from favorites" : "Added to favorites");
    }
  };

  const handlePin = async () => {
    if (!item) return;
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPinned: !item.isPinned }),
    });
    if (res.ok) {
      setItem({ ...item, isPinned: !item.isPinned });
      toast.success(item.isPinned ? "Unpinned" : "Pinned");
    }
  };

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : item ? (
          <>
            <SheetHeader className="relative">
              <div className="flex items-start gap-3 pr-10">
                <span className="flex-shrink-0 mt-1">
                  {getIconWithColor(
                    typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet,
                    item.type.color
                  )}
                </span>
                <SheetTitle className="text-xl">{item.title}</SheetTitle>
              </div>
            </SheetHeader>

            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className={item.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
              >
                <Star className={`h-4 w-4 ${item.isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePin}>
                <Pin
                  className={`h-4 w-4 ${item.isPinned ? "fill-current text-foreground" : "text-muted-foreground"}`}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {item.url && (
                <div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.content && (
                <div className="rounded-md border bg-muted/50 p-4">
                  <pre className="whitespace-pre-wrap break-all text-sm font-mono">
                    {item.content}
                  </pre>
                </div>
              )}

              {item.description && (
                <div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.type.name}
                  {item.language && ` · ${item.language}`}
                </span>
              </div>

              {item.collections.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Collections</p>
                  <div className="flex flex-wrap gap-1">
                    {item.collections.map((col) => (
                      <span
                        key={col.id}
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
                      >
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading...</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
