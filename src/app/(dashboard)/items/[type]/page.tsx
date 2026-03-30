import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getItemsByType, getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { typeIcons, typeDisplayNames, getIconWithColor } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Clock, Star, Pin } from "lucide-react";

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

export default async function ItemsByTypePage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const { type: typeParam } = await params;
  const typeName = typeParam.charAt(0).toUpperCase() + typeParam.slice(1).toLowerCase();

  const [items, itemTypes, favoriteCollections, recentItems] = await Promise.all([
    getItemsByType(typeName),
    getSystemItemTypes(),
    getFavoriteCollections(),
    getRecentItems(5),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
  };

  const currentType = itemTypes.find(
    (t) => t.name.toLowerCase() === typeParam.toLowerCase()
  );

  return (
    <DashboardShell sidebarData={sidebarData}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {currentType && (
            <span className="flex-shrink-0">
              {getIconWithColor(
                typeIcons[currentType.name.toLowerCase()] || typeIcons.snippet,
                currentType.color
              )}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {typeDisplayNames[typeParam.toLowerCase()] || typeName}
            </h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No {typeDisplayNames[typeParam.toLowerCase()] || typeName.toLowerCase()} items yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className={cn(
                  "rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  item.type.color && "border-l-4"
                )}
                style={
                  item.type.color
                    ? { borderLeftColor: item.type.color }
                    : undefined
                }
              >
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-0.5">
                    {getIconWithColor(
                      typeIcons[item.type.name.toLowerCase()] || typeIcons.snippet,
                      item.type.color
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{item.title}</p>
                      {item.isPinned && (
                        <Pin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      )}
                      {item.isFavorite && (
                        <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type.name}
                      {item.language && ` · ${item.language}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
