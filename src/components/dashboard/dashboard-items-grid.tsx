"use client";

import { typeIcons, getIconWithColor } from "@/lib/constants";
import { type ItemWithType } from "@/lib/db/items";
import { cn } from "@/lib/utils";
import { Clock, Star, Pin, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useItemDrawer } from "./item-drawer-controller";

interface DashboardItemsGridProps {
  items: ItemWithType[];
}

export function DashboardItemsGrid({ items }: DashboardItemsGridProps) {
  const { onItemClick } = useItemDrawer();
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No items yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <CardItem key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
}

function CardItem({ item, onItemClick }: { item: ItemWithType; onItemClick: (id: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.content) return;
    await navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onItemClick(item.id)}
      className={cn(
        "group/card relative rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
        item.type.color && "border-l-4"
      )}
      style={
        item.type.color
          ? { borderLeftColor: item.type.color }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">
          {getIconWithColor(
            typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet,
            item.type.color
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{item.title}</p>
            {item.isPinned && (
              <Pin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-500 text-yellow-500" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {item.type.name}
            {item.language && ` · ${item.language}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 inline mr-1" />
            {new Date(item.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className={cn(
          "absolute right-3 top-3 opacity-0 group-hover/card:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-accent",
          copied && "opacity-100"
        )}
        title="Copy content"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
