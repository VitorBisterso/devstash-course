"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { CreateItemModal } from "./create-item-modal";
import { CreateCollectionModal } from "./create-collection-modal";
import { GlobalSearch } from "./global-search";
import { SearchDrawerProvider, useSearchDrawer } from "./search-drawer-context";
import type { SystemItemType } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";
import { Star } from "lucide-react";
import type { SearchData } from "@/lib/db/search";

export interface SidebarData {
  itemTypes: SystemItemType[];
  favoriteCollections: CollectionWithTypes[];
  recentItems: ItemWithType[];
  userName: string;
  userEmail: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarData: SidebarData;
  searchData?: SearchData | null | undefined;
}

export function DashboardShell({
  children,
  sidebarData,
  searchData,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { setOpenItemId } = useSearchDrawer();

  const safeSearchData = searchData ?? null;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-sidebar px-4">
        <div className="flex items-center gap-2 md:hidden">
          <MobileSidebar data={sidebarData} />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </Link>
          <Link href="/dashboard" className="font-semibold hidden sm:inline">DevStash</Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="relative flex-1 max-w-md ml-auto flex h-9 items-center rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-text"
          >
            <span className="text-muted-foreground mr-2">Search...</span>
            <kbd className="ml-auto text-xs text-muted-foreground border border-input bg-background px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2"
          onClick={() => setCreateModalOpen(true)}
        >
          New
        </button>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2"
          onClick={() => setCreateCollectionModalOpen(true)}
        >
          Collection
        </button>
        <Link
          href="/favorites"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9"
          title="Favorites"
        >
          <Star className="h-4 w-4" />
        </Link>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            data={sidebarData}
          />
        </div>
        <main className="flex-1 overflow-y-auto bg-background p-4">
          {children}
        </main>
      </div>
      <CreateItemModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <CreateCollectionModal open={createCollectionModalOpen} onOpenChange={setCreateCollectionModalOpen} />
      <GlobalSearch searchData={safeSearchData} open={searchOpen} onOpenChange={setSearchOpen} onItemSelect={setOpenItemId} />
    </div>
  );
}

export function DashboardShellWrapper(props: DashboardShellProps & { children: React.ReactNode }) {
  const { searchData, ...rest } = props;
  return (
    <SearchDrawerProvider>
      <DashboardShell {...rest} searchData={searchData ?? null}>
        {props.children}
      </DashboardShell>
    </SearchDrawerProvider>
  );
}
