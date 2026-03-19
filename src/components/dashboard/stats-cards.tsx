import { FileCode, FolderOpen, Star, Pin } from "lucide-react";
import { MOCK_ITEMS, MOCK_COLLECTIONS } from "@/lib/mock-data";

export function StatsCards() {
  const stats = [
    {
      label: "Total Items",
      value: MOCK_ITEMS.length,
      icon: FileCode,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Collections",
      value: MOCK_COLLECTIONS.length,
      icon: FolderOpen,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Favorite Items",
      value: MOCK_ITEMS.filter((i) => i.isFavorite).length,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Favorite Collections",
      value: MOCK_COLLECTIONS.filter((c) => c.isFavorite).length,
      icon: Pin,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
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
  );
}
