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

interface TypeAggregationRow {
  collectionId: string;
  typeId: string;
  count: bigint;
  type_name: string;
  type_icon: string | null;
  type_color: string | null;
}

export async function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
}

async function getTypeAggregationsForCollections(collectionIds: string[]): Promise<Map<string, { count: number; type: CollectionItemType }[]>> {
  if (collectionIds.length === 0) return new Map();

  const placeholders = collectionIds.map((_, i) => `$${i + 1}`).join(", ");
  const query = `
    SELECT 
      ic."collectionId",
      i."typeId",
      COUNT(*)::int as count,
      it.name as type_name,
      it.icon as type_icon,
      it.color as type_color
    FROM "ItemCollection" ic
    JOIN "Item" i ON ic."itemId" = i.id
    JOIN "ItemType" it ON i."typeId" = it.id
    WHERE ic."collectionId" IN (${placeholders})
    GROUP BY ic."collectionId", i."typeId", it.name, it.icon, it.color
  `;

  const result = await prisma.$queryRawUnsafe<TypeAggregationRow[]>(query, ...collectionIds);

  const grouped = new Map<string, { count: number; type: CollectionItemType }[]>();
  for (const row of result) {
    const entry = { count: Number(row.count), type: { id: row.typeId, name: row.type_name, icon: row.type_icon, color: row.type_color } };
    if (!grouped.has(row.collectionId)) {
      grouped.set(row.collectionId, []);
    }
    grouped.get(row.collectionId)!.push(entry);
  }
  return grouped;
}

function buildCollectionWithTypes(
  collection: { id: string; name: string; isFavorite: boolean; _count: { items: number } },
  typeAggregations: Map<string, { count: number; type: CollectionItemType }[]>
): CollectionWithTypes {
  const typeEntries = typeAggregations.get(collection.id) ?? [];
  const sorted = typeEntries.sort((a, b) => b.count - a.count);
  const dominantType = sorted[0];
  return {
    id: collection.id,
    name: collection.name,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    itemTypes: sorted.map((t) => t.type),
    dominantColor: dominantType?.type.color ?? null,
  };
}

export async function getRecentCollections(limit = 6): Promise<CollectionWithTypes[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      isFavorite: true,
      _count: { select: { items: true } },
    },
  });

  if (collections.length === 0) return [];

  const typeAggregations = await getTypeAggregationsForCollections(collections.map((c) => c.id));
  return collections.map((c) => buildCollectionWithTypes(c, typeAggregations));
}

export async function getFavoriteCollections(): Promise<CollectionWithTypes[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      isFavorite: true,
      _count: { select: { items: true } },
    },
  });

  if (collections.length === 0) return [];

  const typeAggregations = await getTypeAggregationsForCollections(collections.map((c) => c.id));
  return collections.map((c) => buildCollectionWithTypes(c, typeAggregations));
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const user = await getDemoUser();

  if (!user) {
    return { totalItems: 0, totalCollections: 0, favoriteItems: 0, favoriteCollections: 0 };
  }

  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id } }),
    prisma.item.count({ where: { userId: user.id, isFavorite: true } }),
    prisma.collection.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
