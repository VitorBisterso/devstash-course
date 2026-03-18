"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Code2,
  Bot,
  FileText,
  Terminal,
  FileCode,
  Image as ImageIcon,
  Link2,
  Star,
  Clock,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MOCK_USER,
  MOCK_ITEM_TYPES,
  MOCK_COLLECTIONS,
  MOCK_ITEMS,
} from "@/lib/mock-data";

const typeIcons: Record<string, React.ReactNode> = {
  Snippet: <Code2 className="h-4 w-4 text-blue-500" />,
  Prompt: <Bot className="h-4 w-4 text-yellow-500" />,
  Note: <FileText className="h-4 w-4 text-green-500" />,
  Command: <Terminal className="h-4 w-4 text-red-500" />,
  File: <FileCode className="h-4 w-4 text-purple-500" />,
  Image: <ImageIcon className="h-4 w-4 text-pink-500" />,
  URL: <Link2 className="h-4 w-4 text-cyan-500" />,
};

function SidebarContent() {
  const favoriteCollections = MOCK_COLLECTIONS.filter((c) => c.isFavorite);
  const recentItems = MOCK_ITEMS.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-6">
          <section>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Items
            </h3>
            <ul className="space-y-1">
              {MOCK_ITEM_TYPES.map((type) => (
                <li key={type.id}>
                  <Link
                    href={`/items/${type.name.toLowerCase()}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{typeIcons[type.name] || <Code2 className="h-4 w-4" />}</span>
                    {type.name}
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
              {favoriteCollections.map((collection) => (
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
          </section>

          <Separator />

          <section>
            <h3 className="mb-2 px-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3 w-3" /> Recent
            </h3>
            <ul className="space-y-1">
              {recentItems.map((item) => {
                const type = MOCK_ITEM_TYPES.find((t) => t.id === item.typeId);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/items/${item.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="truncate">
                        {typeIcons[type?.name || "Snippet"]}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={MOCK_USER.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {MOCK_USER.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{MOCK_USER.name}</p>
            <p className="text-xs text-muted-foreground truncate">{MOCK_USER.email}</p>
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
}

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
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
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <span className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 cursor-pointer">
          <PanelLeft className="h-4 w-4" />
        </span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
