import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentCollections } from "@/components/dashboard/recent-collections";
import { PinnedItems } from "@/components/dashboard/pinned-items";
import { RecentItems } from "@/components/dashboard/recent-items";
import { getRecentCollections, getFavoriteCollections } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const [recentCollections, pinnedItems, recentItems, itemTypes, favoriteCollections] =
    await Promise.all([
      getRecentCollections(userId, 6),
      getPinnedItems(userId),
      getRecentItems(userId, 10),
      getSystemItemTypes(),
      getFavoriteCollections(userId),
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
      <ItemDrawerController>
        <div className="space-y-8">
          <StatsCards userId={userId} />
          <RecentCollections collections={recentCollections} />
          <PinnedItems items={pinnedItems} />
          <RecentItems items={recentItems} />
        </div>
      </ItemDrawerController>
    </DashboardShell>
  );
}
