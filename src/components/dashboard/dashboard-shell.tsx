"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { CreateItemModal } from "./create-item-modal";
import type { SystemItemType } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";

export interface SidebarData {
  itemTypes: SystemItemType[];
  favoriteCollections: CollectionWithTypes[];
  recentItems: ItemWithType[];
  userName: string;
  userEmail: string;
}

export function DashboardShell({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-sidebar px-4">
        <div className="flex items-center gap-2 md:hidden">
          <MobileSidebar data={sidebarData} />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-primary-foreground text-sm font-bold">D</span>
          </div>
          <span className="font-semibold hidden sm:inline">DevStash</span>
          <div className="relative flex-1 max-w-md ml-auto">
            <input
              type="search"
              placeholder="Search..."
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
            />
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2"
          onClick={() => setCreateModalOpen(true)}
        >
          New
        </button>
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
    </div>
  );
}
