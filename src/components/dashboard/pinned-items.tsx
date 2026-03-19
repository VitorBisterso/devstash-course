import Link from "next/link";
import {
  Code2,
  Bot,
  FileText,
  Terminal,
  FileCode,
  Image as ImageIcon,
  Link2,
  Pin,
  Star,
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

export function PinnedItems() {
  const pinnedItems = MOCK_ITEMS.filter((item) => item.isPinned);

  if (pinnedItems.length === 0) {
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
        {pinnedItems.map((item) => {
          const type = MOCK_ITEM_TYPES.find((t) => t.id === item.typeId);
          return (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0">
                  {typeIcons[type?.name || "Snippet"]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {type?.name} {item.language && `· ${item.language}`}
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
