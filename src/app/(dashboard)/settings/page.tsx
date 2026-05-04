import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardShellWrapper } from "@/components/dashboard/dashboard-shell";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  getUserProfile,
  getUserStats,
  getUserAuthMethods,
} from "@/lib/db/profile";
import { SettingsActions } from "@/components/settings/settings-actions";
import { getSystemItemTypes, getRecentItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getSearchData } from "@/lib/db/search";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { EditorPreferencesProvider } from "@/context/editor-preferences-context";
import { EditorPreferences } from "@/components/settings/editor-preferences";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const [
    profile,
    ,
    authMethods,
    itemTypes,
    favoriteCollections,
    recentItems,
    searchData,
    editorPrefs,
  ] = await Promise.all([
    getUserProfile(session.user.id),
    getUserStats(session.user.id),
    getUserAuthMethods(session.user.id),
    getSystemItemTypes(),
    getFavoriteCollections(session.user.id),
    getRecentItems(session.user.id, 5),
    getSearchData(session.user.id),
    getEditorPreferences(session.user.id),
  ]);

  if (!profile) {
    redirect("/api/auth/signin");
  }

  const sidebarData = {
    itemTypes,
    favoriteCollections,
    recentItems,
    userName: session?.user?.name ?? "User",
    userEmail: session?.user?.email ?? "",
    userImage: session?.user?.image ?? null,
  };

  return (
    <EditorPreferencesProvider initialPreferences={editorPrefs}>
      <DashboardShellWrapper sidebarData={sidebarData} searchData={searchData}>
        <div className="space-y-8 max-w-2xl">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings
            </p>
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
                <h2 className="text-xl font-semibold">
                  {profile.name ?? "No name set"}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {profile.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <EditorPreferences initialPreferences={editorPrefs} />

          <SettingsActions
            userId={session.user.id}
            hasPassword={authMethods.hasPassword}
          />
        </div>
      </DashboardShellWrapper>
    </EditorPreferencesProvider>
  );
}
