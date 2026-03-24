"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Code2,
  Star,
  Clock,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SystemItemType } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";
import { typeIcons, typeDisplayNames, typeOrder, getIconWithColor } from "@/lib/constants";

interface SidebarData {
  itemTypes: SystemItemType[];
  favoriteCollections: CollectionWithTypes[];
  recentItems: ItemWithType[];
  userName: string;
  userEmail: string;
}

function SidebarContent({ data }: { data: SidebarData }) {
  const sortedItemTypes = [...data.itemTypes].sort((a, b) => {
    const indexA = typeOrder.indexOf(a.name.toLowerCase());
    const indexB = typeOrder.indexOf(b.name.toLowerCase());
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          <section>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </h3>
            <ul className="space-y-1">
              {sortedItemTypes.map((type) => (
                <li key={type.id}>
                  <Link
                    href={`/items/${type.name.toLowerCase()}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{getIconWithColor(typeIcons[type.name.toLowerCase()] || <Code2 className="h-4 w-4" />, type.color)}</span>
                    <span className="flex items-center gap-1.5">
                      {typeDisplayNames[type.name.toLowerCase()] || type.name}
                      {(type.name.toLowerCase() === "file" || type.name.toLowerCase() === "image") && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium">
                          PRO
                        </Badge>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          <section>
            <h3 className="mb-2 px-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Star className="h-3 w-3" /> Favorite Collections
            </h3>
            <ul className="space-y-1">
              {data.favoriteCollections.map((collection) => (
                <li key={collection.id}>
                  <Link
                    href={`/collections/${collection.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/collections"
              className="mt-2 block px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              View all collections
            </Link>
          </section>

          <Separator />

          <section>
            <h3 className="mb-2 px-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3 w-3" /> Recent
            </h3>
            <ul className="space-y-1">
              {data.recentItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/items/${item.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.type.color ? (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.type.color }}
                      />
                    ) : (
                      <span className="truncate">
                        {typeIcons[item.type.name] || <Code2 className="h-4 w-4" />}
                      </span>
                    )}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {data.userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{data.userName}</p>
            <p className="text-xs text-muted-foreground truncate">{data.userEmail}</p>
          </div>
        </div>
      </div>
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
