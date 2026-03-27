import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getUserProfile, getUserStats, getUserAuthMethods } from "@/lib/db/profile";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileActions } from "@/components/profile/profile-actions";
import { getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [profile, stats, authMethods, itemTypes, favoriteCollections, recentItems] = await Promise.all([
    getUserProfile(session.user.id),
    getUserStats(session.user.id),
    getUserAuthMethods(session.user.id),
    getSystemItemTypes(),
    getFavoriteCollections(),
    getRecentItems(5),
  ]);

  if (!profile) {
    redirect("/api/auth/signin");
  }

  const typeMap = new Map(itemTypes.map((t) => [t.id, t]));

  const statsWithTypes = {
    ...stats,
    itemsByType: stats.itemsByType.map((item) => ({
      ...item,
      type: typeMap.get(item.typeId) ?? null,
    })),
  };

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
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={profile.name}
              image={profile.image}
              size="lg"
              className="h-16 w-16"
            />
            <div>
              <h2 className="text-xl font-semibold">{profile.name ?? "No name set"}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since {profile.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <ProfileStats stats={statsWithTypes} />

        <ProfileActions
          userId={session.user.id}
          hasPassword={authMethods.hasPassword}
        />
      </div>
    </DashboardShell>
  );
}
