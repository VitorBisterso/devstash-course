import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { typeIconsSmall } from "@/lib/constants";

interface CollectionCardProps {
  collection: CollectionWithTypes;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className={cn(
        "rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        collection.dominantColor && "border-l-4"
      )}
      style={
        collection.dominantColor
          ? { borderLeftColor: collection.dominantColor }
          : undefined
      }
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-purple-500" />
          {collection.isFavorite && (
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {collection.itemCount} items
        </span>
      </div>
      <p className="truncate font-medium">{collection.name}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {collection.itemTypes.slice(0, 4).map((type) => (
          <span
            key={type.id}
            className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-secondary-foreground"
            title={type.name}
          >
            {typeIconsSmall[type.name.toLowerCase()]}
          </span>
        ))}
      </div>
    </Link>
  );
}