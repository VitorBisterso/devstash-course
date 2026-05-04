"use client";

import { type ItemWithType } from "@/lib/db/items";
import { type CollectionWithTypes } from "@/lib/db/collections";
import { useItemDrawer } from "./item-drawer-controller";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { getIconWithColor, typeIconsSmall } from "@/lib/constants";
import { formatFileSize } from "@/lib/format";

interface FavoritesListProps {
  items: ItemWithType[];
  collections: CollectionWithTypes[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ItemRow({ item }: { item: ItemWithType }) {
  const { onItemClick } = useItemDrawer();
  const icon = typeIconsSmall[item.type.name] || typeIconsSmall.snippet;
  const iconWithColor = getIconWithColor(icon, item.type.color);

  return (
    <div
      onClick={() => onItemClick(item.id)}
      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-3 py-1.5 hover:bg-accent/50 cursor-pointer transition-colors border-b border-border/50 font-mono text-sm"
    >
      <div className="col-span-1 md:col-span-5 flex items-center gap-2 min-w-0">
        <span className="flex-shrink-0 text-muted-foreground">
          {iconWithColor}
        </span>
        <span className="truncate">{item.title}</span>
        {item.isPinned && (
          <span className="text-muted-foreground text-xs">📌</span>
        )}
      </div>
      <div className="col-span-1 md:col-span-3 flex items-center text-xs text-muted-foreground">
        <span className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">
          {item.type.name}
        </span>
      </div>
      <div className="col-span-1 md:col-span-2 flex items-center text-xs text-muted-foreground">
        {item.fileSize && (
          <span className="mr-2">{formatFileSize(item.fileSize)}</span>
        )}
      </div>
      <div className="col-span-1 md:col-span-2 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {formatDate(item.updatedAt)}
      </div>
    </div>
  );
}

function CollectionRow({ collection }: { collection: CollectionWithTypes }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-3 py-1.5 hover:bg-accent/50 transition-colors border-b border-border/50 font-mono text-sm"
    >
      <div className="col-span-1 md:col-span-5 flex items-center gap-2 min-w-0">
        <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-500 text-yellow-500" />
        <span className="truncate">{collection.name}</span>
      </div>
      <div className="col-span-1 md:col-span-3 flex items-center text-xs text-muted-foreground">
        {collection.itemTypes.slice(0, 2).map((type) => (
          <span
            key={type.id}
            className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 mr-1"
          >
            {type.name}
          </span>
        ))}
      </div>
      <div className="col-span-1 md:col-span-2 flex items-center text-xs text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </div>
      <div className="col-span-1 md:col-span-2 flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {formatDate(new Date())}
      </div>
    </Link>
  );
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const hasItems = items.length > 0;
  const hasCollections = collections.length > 0;

  if (!hasItems && !hasCollections) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No favorites yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Star items and collections to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasItems && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold font-mono">Items</h2>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">
              {items.length}
            </span>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground font-mono">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Modified</div>
            </div>
            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {hasCollections && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold font-mono">Collections</h2>
            <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">
              {collections.length}
            </span>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-3 py-2 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground font-mono">
              <div className="col-span-5">Name</div>
              <div className="col-span-3">Types</div>
              <div className="col-span-2">Items</div>
              <div className="col-span-2">Modified</div>
            </div>
            <div className="divide-y divide-border/50">
              {collections.map((collection) => (
                <CollectionRow key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
