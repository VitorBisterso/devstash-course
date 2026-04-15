"use client";

import { SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function ItemDrawerLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function ItemDrawerEmpty() {
  return (
    <div className="p-4 text-center text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
      <p>Loading...</p>
    </div>
  );
}

interface ItemDrawerViewHeaderProps {
  title: string;
  typeIcon: React.ReactNode;
}

export function ItemDrawerViewHeader({
  title,
  typeIcon,
}: ItemDrawerViewHeaderProps) {
  return (
    <SheetHeader className="relative">
      <div className="flex items-start gap-3 pr-10">
        <span className="flex-shrink-0 mt-1">{typeIcon}</span>
        <SheetTitle className="text-xl">{title}</SheetTitle>
      </div>
    </SheetHeader>
  );
}

interface ItemDrawerEditHeaderProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function ItemDrawerEditHeader({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: ItemDrawerEditHeaderProps) {
  return (
    <SheetHeader className="relative">
      <div className="space-y-4 pr-10">
        <div>
          <Label htmlFor="edit-title" className="mb-1 block">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Item title"
          />
        </div>
        <div>
          <Label htmlFor="edit-description" className="mb-1 block">Description</Label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Optional description"
            className="w-full min-h-[60px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 resize-none"
          />
        </div>
      </div>
    </SheetHeader>
  );
}
