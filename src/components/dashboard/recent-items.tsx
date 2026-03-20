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
import { type ItemWithType } from "@/lib/db/items";

const typeIcons: Record<string, React.ReactNode> = {
  snippet: <Code2 className="h-4 w-4 text-blue-500" />,
  prompt: <Bot className="h-4 w-4 text-yellow-500" />,
  note: <FileText className="h-4 w-4 text-green-500" />,
  command: <Terminal className="h-4 w-4 text-red-500" />,
  file: <FileCode className="h-4 w-4 text-purple-500" />,
  image: <ImageIcon className="h-4 w-4 text-pink-500" />,
  link: <Link2 className="h-4 w-4 text-cyan-500" />,
};

function getIconForType(typeName: string): React.ReactNode {
  return typeIcons[typeName.toLowerCase()] || typeIcons.snippet;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

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
                  {getIconForType(item.type.name)}
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
