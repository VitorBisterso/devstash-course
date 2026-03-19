import Link from "next/link";
import {
  Code2,
  Bot,
  FileText,
  Terminal,
  FileCode,
  Image as ImageIcon,
  Link2,
  Clock,
  Star,
  Pin,
} from "lucide-react";
import { MOCK_ITEMS, MOCK_ITEM_TYPES } from "@/lib/mock-data";

const typeIcons: Record<string, React.ReactNode> = {
  Snippet: <Code2 className="h-4 w-4 text-blue-500" />,
  Prompt: <Bot className="h-4 w-4 text-yellow-500" />,
  Note: <FileText className="h-4 w-4 text-green-500" />,
  Command: <Terminal className="h-4 w-4 text-red-500" />,
  File: <FileCode className="h-4 w-4 text-purple-500" />,
  Image: <ImageIcon className="h-4 w-4 text-pink-500" />,
  URL: <Link2 className="h-4 w-4 text-cyan-500" />,
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentItems() {
  const recentItems = [...MOCK_ITEMS]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 10);

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
          {recentItems.map((item) => {
            const type = MOCK_ITEM_TYPES.find((t) => t.id === item.typeId);
            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="flex-shrink-0">
                  {typeIcons[type?.name || "Snippet"]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {type?.name} {item.language && `· ${item.language}`}
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
                    {formatRelativeTime(new Date(item.updatedAt))}
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
