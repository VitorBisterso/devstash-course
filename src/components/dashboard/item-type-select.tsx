"use client";

import { typeDisplayNames } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SystemItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface ItemTypeSelectProps {
  value: string;
  typeName: string;
  itemTypes: SystemItemType[];
  onChange: (id: string, name: string) => void;
}

export function ItemTypeSelect({
  value,
  typeName,
  itemTypes,
  onChange,
}: ItemTypeSelectProps) {
  const selectedType = itemTypes.find((t) => t.id === value);

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="type" className="text-right">
        Type
      </Label>
      <Select
        value={value}
        onValueChange={(id) => {
          const type = itemTypes.find((t) => t.id === id);
          onChange(id || "", type?.name || "");
        }}
        required
      >
        <SelectTrigger className="col-span-3">
          {value && typeName ? (
            <div className="flex items-center gap-2">
              {selectedType?.color && (
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: selectedType.color }}
                />
              )}
              {typeDisplayNames[typeName.toLowerCase()] || typeName}
            </div>
          ) : (
            <SelectValue placeholder="Select type" />
          )}
        </SelectTrigger>
        <SelectContent>
          {itemTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <div className="flex items-center gap-2">
                {type.color && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                )}
                {typeDisplayNames[type.name.toLowerCase()] || type.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
