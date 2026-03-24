import Link from "next/link";
import { Clock, Star, Pin } from "lucide-react";
import { type ItemWithType } from "@/lib/db/items";
import { typeIcons, getIconWithColor, MINUTE_MS, HOUR_MS, DAY_MS } from "@/lib/constants";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / MINUTE_MS);
  const diffHours = Math.floor(diffMs / HOUR_MS);
  const diffDays = Math.floor(diffMs / DAY_MS);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

interface RecentItemsProps {
  items: ItemWithType[];
}

export function RecentItems({ items }: RecentItemsProps) {

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" /> Recent Items
        </h2>
        <Link
          href="/items"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="divide-y">
          {items.map((item) => {
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="flex-shrink-0">
                  {getIconWithColor(typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet, item.type.color)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type.name} {item.language && `· ${item.language}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.isPinned && (
                    <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {item.isFavorite && (
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(item.updatedAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
