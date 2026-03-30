import { FileCode, FolderOpen, Star, Pin } from "lucide-react";
import { getDashboardStats } from "@/lib/db/collections";

interface StatsCardsProps {
  userId: string;
}

export async function StatsCards({ userId }: StatsCardsProps) {
  const stats = await getDashboardStats(userId);

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
    {
      label: "Favorite Items",
      value: stats.favoriteItems,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Favorite Collections",
      value: stats.favoriteCollections,
      icon: Pin,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
  );
}
