"use client";

import { type ItemWithType } from "@/lib/db/items";
import { Star, Pin } from "lucide-react";
import { useItemDrawer } from "./item-drawer-controller";

interface ImageGalleryGridProps {
  items: ItemWithType[];
}

export function ImageGalleryGrid({ items }: ImageGalleryGridProps) {
  const { onItemClick } = useItemDrawer();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No images yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="group relative overflow-hidden rounded-lg border bg-card cursor-pointer"
        >
          <div className="aspect-video overflow-hidden">
            <img
              src={item.fileUrl || ""}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-sm">{item.title}</p>
              {item.isPinned && (
                <Pin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              )}
              {item.isFavorite && (
                <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-500 text-yellow-500" />
              )}
            </div>
            {item.fileSize && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(item.fileSize)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}