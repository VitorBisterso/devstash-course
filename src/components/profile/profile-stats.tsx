import { FileCode, FolderOpen } from "lucide-react";
import type { UserStats } from "@/lib/db/profile";
import type { SystemItemType } from "@/lib/db/items";

interface StatsWithTypes extends UserStats {
  itemsByType: (UserStats["itemsByType"][0] & { type: SystemItemType | null })[];
}

interface ProfileStatsProps {
  stats: StatsWithTypes;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const cards = [
    {
      label: "Total Items",
      value: stats.totalItems,
      icon: FileCode,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Collections",
      value: stats.totalCollections,
      icon: FolderOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Usage Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-md p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <h3 className="font-medium mb-3">Items by Type</h3>
        {stats.itemsByType.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet</p>
        ) : (
          <div className="space-y-2">
            {stats.itemsByType.map((item) => (
              <div key={item.typeId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full w-3 h-3"
                    style={{ backgroundColor: item.typeColor ?? "#888" }}
                  />
                  <span className="text-sm">{item.typeName}</span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
