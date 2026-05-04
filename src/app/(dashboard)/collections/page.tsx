import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { ItemDrawerController } from "@/components/dashboard/item-drawer-controller";
import { CollectionCard } from "@/components/dashboard/collection-card";
import { Pagination } from "@/components/pagination";
import { getCollectionsWithDetails, getFavoriteCollections } from "@/lib/db/collections";
import { getRecentItems, getSystemItemTypes } from "@/lib/db/items";
import { getSearchData } from "@/lib/db/search";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * COLLECTIONS_PER_PAGE;

  const userId = session.user.id;

  const [result, itemTypes, favoriteCollections, recentItems, searchData] = await Promise.all([
    getCollectionsWithDetails(userId, skip, COLLECTIONS_PER_PAGE),
    getSystemItemTypes(),
    getFavoriteCollections(userId),
    getRecentItems(userId, 5),
    getSearchData(userId),
  ]);

  const safeSearchData = searchData ?? null;

  const { collections, totalCount } = result;
  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);

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
            <h1 className="text-2xl font-bold">Collections</h1>
            <p className="text-muted-foreground">
              {totalCount} {totalCount === 1 ? "collection" : "collections"}
            </p>
          </div>

          {totalCount === 0 ? (
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/collections"
          />
        </div>
      </ItemDrawerController>
    </DashboardShellWrapper>
  );
}
