import { prisma } from "@/lib/prisma";

export interface CollectionItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface CollectionWithTypes {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  itemTypes: CollectionItemType[];
  dominantColor: string | null;
}

const DEMO_USER_EMAIL = "demo@devstash.io";

export async function getRecentCollections(limit = 6): Promise<CollectionWithTypes[]> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: {
        select: { items: true },
      },
      items: {
        include: {
          item: {
            include: {
              type: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                  color: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((collection) => {
    const typeCounts: Record<string, { count: number; type: CollectionItemType }> = {};

    for (const ic of collection.items) {
      const type = ic.item.type;
      if (!typeCounts[type.id]) {
        typeCounts[type.id] = { count: 0, type };
      }
      typeCounts[type.id].count++;
    }

    const uniqueTypes = Object.values(typeCounts).map((t) => t.type);
    const dominantTypeEntry = Object.values(typeCounts).sort((a, b) => b.count - a.count)[0];
    const dominantColor = dominantTypeEntry?.type.color ?? null;

    return {
      id: collection.id,
      name: collection.name,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      itemTypes: uniqueTypes,
      dominantColor,
    };
  });
}
