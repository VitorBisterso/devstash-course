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
                  {getIconForType(item.type.name)}
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
