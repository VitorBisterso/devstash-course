import Link from "next/link";
import { FolderOpen, Star } from "lucide-react";
import { MOCK_COLLECTIONS } from "@/lib/mock-data";

export function RecentCollections() {
  const collections = MOCK_COLLECTIONS.slice(0, 4);

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
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="mb-2 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-purple-500" />
              {collection.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              )}
            </div>
            <p className="truncate font-medium">{collection.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
