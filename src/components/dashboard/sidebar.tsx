"use client";

import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/dashboard/user-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SystemItemType } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";
import {
  SidebarItems,
  SidebarCollections,
  SidebarRecent,
} from "./sidebar-sections";

interface SidebarData {
  itemTypes: SystemItemType[];
  favoriteCollections: CollectionWithTypes[];
  recentItems: ItemWithType[];
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

function SidebarContent({ data }: { data: SidebarData }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          <SidebarItems itemTypes={data.itemTypes} />
          <SidebarCollections collections={data.favoriteCollections} />
          <SidebarRecent items={data.recentItems} />
        </nav>
      </div>

      <UserMenu
        name={data.userName}
        email={data.userEmail}
        image={data.userImage}
      />
    </div>
  );
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  data: SidebarData;
}

export function Sidebar({ collapsed = false, onToggle, className, data }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-end border-b px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SidebarContent data={data} />
    </aside>
  );
}

export function MobileSidebar({ data }: { data: SidebarData }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 cursor-pointer">
          <PanelLeft className="h-4 w-4" />
        </span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SidebarContent data={data} />
      </SheetContent>
    </Sheet>
  );
}
