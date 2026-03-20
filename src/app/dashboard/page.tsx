import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentCollections } from "@/components/dashboard/recent-collections";
import { PinnedItems } from "@/components/dashboard/pinned-items";
import { RecentItems } from "@/components/dashboard/recent-items";
import { getRecentCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";

export default async function DashboardPage() {
  const [recentCollections, pinnedItems, recentItems] = await Promise.all([
    getRecentCollections(6),
    getPinnedItems(),
    getRecentItems(10),
  ]);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <StatsCards />
        <RecentCollections collections={recentCollections} />
        <PinnedItems items={pinnedItems} />
        <RecentItems items={recentItems} />
      </div>
    </DashboardShell>
  );
}
