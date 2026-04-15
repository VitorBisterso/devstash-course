"use client";

import { type ItemWithType } from "@/lib/db/items";
import { Clock, Star, Pin, Download } from "lucide-react";
import { useItemDrawer } from "./item-drawer-controller";
import Link from "next/link";
import { formatFileSize } from "@/lib/format";
import { getFileIconConfig } from "@/lib/file-icons";

interface FileListViewProps {
  items: ItemWithType[];
}

function FileIcon({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded bg-muted font-mono text-xs font-bold"
      style={{ color, borderWidth: 1, borderColor: color }}
    >
      {name}
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FileListView({ items }: FileListViewProps) {
  const { onItemClick } = useItemDrawer();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No files yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-2 flex justify-end">Actions</div>
      </div>
      <div className="divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
          >
            <div className="col-span-1 md:col-span-5 flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0">
                {(() => {
                  const config = getFileIconConfig(item.title);
                  return <FileIcon name={config.name} color={config.color} />;
                })()}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <p className="truncate font-medium text-sm md:text-base">{item.title}</p>
                {item.isPinned && (
                  <Pin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                )}
                {item.isFavorite && (
                  <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                )}
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center text-sm text-muted-foreground md:pl-4">
              <span className="md:hidden text-xs font-medium mr-2">Size:</span>
              {item.fileSize ? formatFileSize(item.fileSize) : "-"}
            </div>
            <div className="col-span-1 md:col-span-3 flex items-center text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-2 md:hidden" />
              {formatDate(item.updatedAt)}
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
              {item.fileUrl && (
                <Link
                  href={`/api/download?key=${encodeURIComponent(item.fileUrl)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
