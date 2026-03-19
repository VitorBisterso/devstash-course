import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CollectionWithTypes } from "@/lib/db/collections";
import {
  Code2,
  Bot,
  Terminal,
  StickyNote,
  File,
  Image as ImageIcon,
  Link2,
} from "lucide-react";

const typeIconComponents: Record<string, React.ReactNode> = {
  snippet: <Code2 className="h-3 w-3" />,
  prompt: <Bot className="h-3 w-3" />,
  command: <Terminal className="h-3 w-3" />,
  note: <StickyNote className="h-3 w-3" />,
  file: <File className="h-3 w-3" />,
  image: <ImageIcon className="h-3 w-3" />,
  link: <Link2 className="h-3 w-3" />,
};

interface RecentCollectionsProps {
  collections: CollectionWithTypes[];
}

export function RecentCollections({ collections }: RecentCollectionsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
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
                  {typeIconComponents[type.name.toLowerCase()] ?? (
                    <Code2 className="h-3 w-3" />
                  )}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
