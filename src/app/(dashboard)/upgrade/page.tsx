import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getSearchData } from "@/lib/db/search";
import { UpgradeContent } from "@/components/upgrade/upgrade-content";
import { PRO_PRICES } from "@/lib/plans";

export default async function UpgradePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  if (session.user.isPro) {
    redirect("/dashboard");
  }

  const [itemTypes, favoriteCollections, recentItems, searchData] = await Promise.all([
    getSystemItemTypes(),
    getFavoriteCollections(session.user.id),
    getRecentItems(session.user.id, 5),
    getSearchData(session.user.id),
  ]);

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
    isPro: session.user.isPro,
  };

  return (
    <DashboardShellWrapper sidebarData={sidebarData} searchData={searchData}>
      <UpgradeContent
        monthlyPriceId={PRO_PRICES.monthly}
        yearlyPriceId={PRO_PRICES.yearly}
      />
    </DashboardShellWrapper>
  );
}
