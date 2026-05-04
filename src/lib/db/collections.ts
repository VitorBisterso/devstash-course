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
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  itemTypes: CollectionItemType[];
  dominantColor: string | null;
  updatedAt: Date;
}

interface TypeAggregationRow {
  collectionId: string;
  typeId: string;
  count: bigint;
  type_name: string;
  type_icon: string | null;
  type_color: string | null;
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
  collection: {
    id: string;
    name: string;
    description?: string | null;
    isFavorite: boolean;
    updatedAt: Date;
    _count: { items: number };
  },
  typeAggregations: Map<string, { count: number; type: CollectionItemType }[]>
): CollectionWithTypes {
  const typeEntries = typeAggregations.get(collection.id) ?? [];
  const sorted = typeEntries.sort((a, b) => b.count - a.count);
  const dominantType = sorted[0];
  return {
    id: collection.id,
    name: collection.name,
    description: collection.description ?? null,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    itemTypes: sorted.map((t) => t.type),
    dominantColor: dominantType?.type.color ?? null,
    updatedAt: collection.updatedAt,
  };
}

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      isFavorite: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  if (collections.length === 0) return [];

  const typeAggregations = await getTypeAggregationsForCollections(collections.map((c) => c.id));
  return collections.map((c) => buildCollectionWithTypes(c, typeAggregations));
}

export async function getFavoriteCollections(userId: string): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      name: true,
      isFavorite: true,
      updatedAt: true,
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

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export interface CreateCollectionInput {
  name: string;
  description: string | null;
}

export async function createCollection(
  userId: string,
  data: CreateCollectionInput
): Promise<{ id: string }> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
    },
  });

  return { id: collection.id };
}

export interface CollectionBasic {
  id: string;
  name: string;
}

export async function getCollections(userId: string): Promise<CollectionBasic[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}

export interface PaginatedCollections {
  collections: CollectionWithTypes[];
  totalCount: number;
}

export async function getCollectionsWithDetails(
  userId: string,
  skip = 0,
  take = 21
): Promise<PaginatedCollections> {
  const [collections, totalCount] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      skip,
      take,
    select: {
      id: true,
      name: true,
      isFavorite: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
    }),
    prisma.collection.count({
      where: { userId },
    }),
  ]);

  if (collections.length === 0) return { collections: [], totalCount: 0 };

  const typeAggregations = await getTypeAggregationsForCollections(
    collections.map((c) => c.id)
  );
  return {
    collections: collections.map((c) => buildCollectionWithTypes(c, typeAggregations)),
    totalCount,
  };
}

export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<CollectionWithTypes | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });

  if (!collection) return null;

  const typeAggregations = await getTypeAggregationsForCollections([
    collection.id,
  ]);
  return buildCollectionWithTypes(collection, typeAggregations);
}

export interface UpdateCollectionInput {
  name: string;
  description: string | null;
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionInput
): Promise<{ id: string } | null> {
  const collection = await prisma.collection.update({
    where: { id: collectionId, userId },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  return { id: collection.id };
}

export async function deleteCollection(
  userId: string,
  collectionId: string
): Promise<boolean> {
  await prisma.itemCollection.deleteMany({ where: { collectionId } });
  await prisma.collection.delete({ where: { id: collectionId, userId } });

  return true;
}

export async function removeItemFromCollection(
  userId: string,
  collectionId: string,
  itemId: string
): Promise<boolean> {
  await prisma.itemCollection.deleteMany({
    where: {
      collectionId,
      item: { userId },
      itemId,
    },
  });

  return true;
}

export async function toggleCollectionFavorite(
  userId: string,
  collectionId: string
): Promise<boolean | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { isFavorite: true },
  });

  if (!collection) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId, userId },
    data: { isFavorite: !collection.isFavorite },
  });

  return updated.isFavorite;
}
