import Link from "next/link";
import { Pin, Star } from "lucide-react";
import { type ItemWithType } from "@/lib/db/items";
import { typeIcons, getIconWithColor } from "@/lib/constants";

interface PinnedItemsProps {
  items: ItemWithType[];
}

export function PinnedItems({ items }: PinnedItemsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Pin className="h-4 w-4" /> Pinned Items
        </h2>
        <Link
          href="/items/pinned"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid gap-3">
        {items.map((item) => {
          return (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0">
                  {getIconWithColor(typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet, item.type.color)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.type.name} {item.language && `· ${item.language}`}
                  </p>
                </div>
                {item.isFavorite && (
                  <Star className="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
