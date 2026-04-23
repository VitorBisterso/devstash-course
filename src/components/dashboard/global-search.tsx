"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandDialogContent,
  CommandDialogTitle,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { typeIcons, getIconWithColor } from "@/lib/constants";
import type { SearchData } from "@/lib/db/search";
import { Folder } from "lucide-react";

interface GlobalSearchProps {
  searchData: SearchData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSelect?: (itemId: string) => void;
}

export function GlobalSearch({ searchData, open, onOpenChange, onItemSelect }: GlobalSearchProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const handleSelect = (type: "item" | "collection", id: string) => {
    onOpenChange(false);
    if (type === "item" && onItemSelect) {
      onItemSelect(id);
    } else if (type === "collection") {
      router.push(`/collections/${id}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchData) return [];
    if (!searchQuery) return searchData.items.slice(0, 10);
    const query = searchQuery.toLowerCase();
    return searchData.items
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.contentPreview?.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [searchData, searchQuery]);

  const filteredCollections = useMemo(() => {
    if (!searchData) return [];
    if (!searchQuery) return searchData.collections.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return searchData.collections
      .filter((collection) => collection.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [searchData, searchQuery]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandDialogContent className="p-0">
        <VisuallyHidden>
          <CommandDialogTitle>Search</CommandDialogTitle>
        </VisuallyHidden>
        <Command>
          <CommandInput
            placeholder="Search items and collections..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredItems.length > 0 && (
              <CommandGroup heading="Items">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.title} ${item.contentPreview || ""}`}
                    onSelect={() => handleSelect("item", item.id)}
                  >
                    {getIconWithColor(
                      typeIcons[item.typeName.toLowerCase()] || typeIcons.snippet,
                      item.typeColor
                    )}
                    <div className="flex flex-col ml-2">
                      <span className="text-sm">{item.title}</span>
                      {item.contentPreview && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {item.contentPreview}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {filteredItems.length > 0 && filteredCollections.length > 0 && (
              <CommandSeparator />
            )}
            {filteredCollections.length > 0 && (
              <CommandGroup heading="Collections">
                {filteredCollections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    value={collection.name}
                    onSelect={() => handleSelect("collection", collection.id)}
                  >
                    <Folder className="h-4 w-4" />
                    <div className="flex flex-col ml-2">
                      <span className="text-sm">{collection.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {collection.itemCount} items
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialogContent>
    </CommandDialog>
  );
}