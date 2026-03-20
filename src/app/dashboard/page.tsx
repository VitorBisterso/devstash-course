import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentCollections } from "@/components/dashboard/recent-collections";
import { PinnedItems } from "@/components/dashboard/pinned-items";
import { RecentItems } from "@/components/dashboard/recent-items";
import { getRecentCollections, getFavoriteCollections, getDemoUser } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getSystemItemTypes } from "@/lib/db/items";

export default async function DashboardPage() {
  const [recentCollections, pinnedItems, recentItems, itemTypes, favoriteCollections, user] =
    await Promise.all([
      getRecentCollections(6),
      getPinnedItems(),
      getRecentItems(10),
      getSystemItemTypes(),
      getFavoriteCollections(),
      getDemoUser(),
    ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: user?.name ?? "User",
    userEmail: user?.email ?? "",
  };

  return (
    <DashboardShell sidebarData={sidebarData}>
      <div className="space-y-8">
        <StatsCards />
        <RecentCollections collections={recentCollections} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardShell>
  );
}
