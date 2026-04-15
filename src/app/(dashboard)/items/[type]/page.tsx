import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { DashboardItemsGrid } from "@/components/dashboard/dashboard-items-grid";
import { ImageGalleryGrid } from "@/components/dashboard/image-gallery-grid";
import { FileListView } from "@/components/dashboard/file-list-view";
import { getItemsByType, getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { typeIcons, typeDisplayNames, getIconWithColor } from "@/lib/constants";

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
    getItemsByType(session.user.id, typeName),
    getSystemItemTypes(),
    getFavoriteCollections(session.user.id),
    getRecentItems(session.user.id, 5),
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

        <ItemDrawerController>
          {typeParam.toLowerCase() === "image" ? (
            <ImageGalleryGrid items={items} />
          ) : typeParam.toLowerCase() === "file" ? (
            <FileListView items={items} />
          ) : (
            <DashboardItemsGrid items={items} />
          )}
        </ItemDrawerController>
      </div>
    </DashboardShell>
  );
}
