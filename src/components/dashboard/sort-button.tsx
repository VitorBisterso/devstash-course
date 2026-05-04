"use client";

import { type SortField, type SortOrder } from "@/types/sort";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortButtonProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleSort: () => void;
  onSetField: (field: SortField) => void;
}

export function SortButton({
  field,
  label,
  sortField,
  sortOrder,
  onToggleSort,
  onSetField,
}: SortButtonProps) {
  return (
    <button
      onClick={() => {
        if (sortField === field) {
          onToggleSort();
        } else {
          onSetField(field);
        }
      }}
      className={`flex items-center gap-1 hover:text-foreground transition-colors ${
        sortField === field ? "text-foreground" : ""
      }`}
    >
      {label}
      {sortField === field ? (
        sortOrder === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3" />
      )}
    </button>
  );
}
