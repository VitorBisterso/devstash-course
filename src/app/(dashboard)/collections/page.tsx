import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { getCollectionsWithDetails, getFavoriteCollections } from "@/lib/db/collections";
import { getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";

export default async function CollectionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const [collections, itemTypes, favoriteCollections, recentItems, searchData] = await Promise.all([
    getCollectionsWithDetails(userId),
    getSystemItemTypes(),
    getFavoriteCollections(userId),
    getRecentItems(userId, 5),
    getSearchData(userId),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
  };

  return (
    <DashboardShellWrapper sidebarData={sidebarData} searchData={searchData}>
      <ItemDrawerController>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Collections</h1>
            <p className="text-muted-foreground">
              {collections.length} {collections.length === 1 ? "collection" : "collections"}
            </p>
          </div>

          {collections.length === 0 ? (
            <p className="text-muted-foreground">
              No collections yet. Create one to organize your items.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </div>
      </ItemDrawerController>
    </DashboardShellWrapper>
  );
}