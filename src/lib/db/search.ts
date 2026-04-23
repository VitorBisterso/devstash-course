import { prisma } from "@/lib/prisma";

export interface SearchableItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string | null;
  typeColor: string | null;
  contentPreview: string | null;
}

export interface SearchableCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchData {
  items: SearchableItem[];
  collections: SearchableCollection[];
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        content: true,
        type: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        _count: {
          select: { items: true },
        },
      },
    }),
  ]);

  const searchableItems: SearchableItem[] = items.map((item) => {
    let contentPreview: string | null = null;
    if (item.content) {
      contentPreview = item.content.slice(0, 50);
    }
    return {
      id: item.id,
      title: item.title,
      typeName: item.type.name,
      typeIcon: item.type.icon,
      typeColor: item.type.color,
      contentPreview,
    };
  });

  const searchableCollections: SearchableCollection[] = collections.map((col) => ({
    id: col.id,
    name: col.name,
    itemCount: col._count.items,
  }));

  return {
    items: searchableItems,
    collections: searchableCollections,
  };
}