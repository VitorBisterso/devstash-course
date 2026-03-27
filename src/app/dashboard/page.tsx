import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentCollections } from "@/components/dashboard/recent-collections";
import { PinnedItems } from "@/components/dashboard/pinned-items";
import { RecentItems } from "@/components/dashboard/recent-items";
import { getRecentCollections, getFavoriteCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  const [recentCollections, pinnedItems, recentItems, itemTypes, favoriteCollections] =
    await Promise.all([
      getRecentCollections(6),
      getPinnedItems(),
      getRecentItems(10),
      getSystemItemTypes(),
      getFavoriteCollections(),
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
