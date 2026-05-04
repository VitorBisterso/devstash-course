import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { FavoritesList } from "@/components/dashboard/favorites-list";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const [favoriteItems, favoriteCollections, itemTypes, recentItems, searchData] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
    getSystemItemTypes(),
    getRecentItems(userId, 5),
    getSearchData(userId),
  ]);

  const safeSearchData = searchData ?? null;

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
  };

  return (
    <DashboardShellWrapper sidebarData={sidebarData} searchData={safeSearchData}>
      <ItemDrawerController>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold font-mono">Favorites</h1>
            <p className="text-muted-foreground text-sm font-mono">
              {favoriteItems.length + favoriteCollections.length}{" "}
              {favoriteItems.length + favoriteCollections.length === 1
                ? "favorite"
                : "favorites"}
            </p>
          </div>

          <FavoritesList items={favoriteItems} collections={favoriteCollections} />
        </div>
      </ItemDrawerController>
    </DashboardShellWrapper>
  );
}
