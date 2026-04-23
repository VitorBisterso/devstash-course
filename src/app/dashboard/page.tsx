import { redirect } from "next/navigation";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentCollections } from "@/components/dashboard/recent-collections";
import { PinnedItems } from "@/components/dashboard/pinned-items";
import { RecentItems } from "@/components/dashboard/recent-items";
import { getRecentCollections, getFavoriteCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const [recentCollections, pinnedItems, recentItems, itemTypes, favoriteCollections, searchData] =
    await Promise.all([
      getRecentCollections(userId, 6),
      getPinnedItems(userId),
      getRecentItems(userId, 10),
      getSystemItemTypes(),
      getFavoriteCollections(userId),
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
        <div className="space-y-8">
          <StatsCards userId={userId} />
          <RecentCollections collections={recentCollections} />
          <PinnedItems items={pinnedItems} />
          <RecentItems items={recentItems} />
        </div>
      </ItemDrawerController>
    </DashboardShellWrapper>
  );
}
