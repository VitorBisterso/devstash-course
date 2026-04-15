"use client";

import Link from "next/link";
import { Code2, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { typeIcons, typeDisplayNames, typeOrder, getIconWithColor } from "@/lib/constants";
import type { SystemItemType } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import type { ItemWithType } from "@/lib/db/items";

interface SidebarSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function SidebarSection({ title, icon, children, footer }: SidebarSectionProps) {
  return (
    <section>
      <h3 className="mb-2 px-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon && <span className="h-3 w-3">{icon}</span>}
        {title}
      </h3>
      <ul className="space-y-1">
        {children}
      </ul>
      {footer}
    </section>
  );
}

interface SidebarItemsProps {
  itemTypes: SystemItemType[];
}

export function SidebarItems({ itemTypes }: SidebarItemsProps) {
  const sortedItemTypes = [...itemTypes].sort((a, b) => {
    const indexA = typeOrder.indexOf(a.name.toLowerCase());
    const indexB = typeOrder.indexOf(b.name.toLowerCase());
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return (
    <SidebarSection title="Items">
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
    </SidebarSection>
  );
}

interface SidebarCollectionsProps {
  collections: CollectionWithTypes[];
}

export function SidebarCollections({ collections }: SidebarCollectionsProps) {
  return (
    <SidebarSection
      title="Favorite Collections"
      icon={<Star className="h-3 w-3" />}
      footer={
        <Link
          href="/collections"
          className="mt-2 block px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          View all collections
        </Link>
      }
    >
      {collections.map((collection) => (
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
    </SidebarSection>
  );
}

interface SidebarRecentProps {
  items: ItemWithType[];
}

export function SidebarRecent({ items }: SidebarRecentProps) {
  return (
    <SidebarSection title="Recent" icon={<Clock className="h-3 w-3" />}>
      {items.map((item) => (
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
    </SidebarSection>
  );
}

export { SidebarSection };
