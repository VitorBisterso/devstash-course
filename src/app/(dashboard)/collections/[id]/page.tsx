import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { DashboardItemsGrid } from "@/components/dashboard/dashboard-items-grid";
import { ImageGalleryGrid } from "@/components/dashboard/image-gallery-grid";
import { FileListView } from "@/components/dashboard/file-list-view";
import { CollectionActions } from "@/components/dashboard/collection-actions";
import { getCollectionById, getFavoriteCollections } from "@/lib/db/collections";
import { getItemsByCollection, getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { FolderOpen, Star } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const { id: collectionId } = await params;
  const userId = session.user.id;

  const [collection, itemTypes, favoriteCollections, recentItems, items] = await Promise.all([
    getCollectionById(userId, collectionId),
    getSystemItemTypes(),
    getFavoriteCollections(userId),
    getRecentItems(userId, 5),
    getItemsByCollection(userId, collectionId),
  ]);

  if (!collection) {
    notFound();
  }

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
  };

  const dominantTypeName = collection.itemTypes[0]?.name.toLowerCase();

  return (
    <DashboardShell sidebarData={sidebarData}>
      <ItemDrawerController>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold">{collection.name}</h1>
                {collection.description && (
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="text-muted-foreground">
                  {items.length} {items.length === 1 ? "item" : "items"}
                  {collection.isFavorite && " · "}
                  {collection.isFavorite && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      Favorite
                    </span>
                  )}
                </p>
              </div>
            </div>
            <CollectionActions
              collectionId={collection.id}
              initialName={collection.name}
              initialDescription={collection.description}
              initialIsFavorite={collection.isFavorite}
            />
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground">
              No items in this collection yet.
            </p>
          ) : dominantTypeName === "image" ? (
            <ImageGalleryGrid items={items} />
          ) : dominantTypeName === "file" ? (
            <FileListView items={items} />
          ) : (
            <DashboardItemsGrid items={items} />
          )}
        </div>
      </ItemDrawerController>
    </DashboardShell>
  );
}