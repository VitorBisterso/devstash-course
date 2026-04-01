import { prisma } from "@/lib/prisma";

export interface ItemWithType {
  id: string;
  title: string;
  contentType: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  updatedAt: Date;
  type: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: {
      userId,
      isPinned: true,
    },
    orderBy: { updatedAt: "desc" },
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
  });
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
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
  });
}

export interface SystemItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export async function getSystemItemTypes(): Promise<SystemItemType[]> {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });
}

export async function getItemsByType(userId: string, typeName: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: {
      userId,
      type: {
        name: {
          equals: typeName,
          mode: "insensitive",
        },
      },
    },
    orderBy: { updatedAt: "desc" },
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
  });
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  contentType: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  type: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  collections: {
    id: string;
    name: string;
  }[];
}

export async function getItemById(userId: string, itemId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      userId,
    },
    include: {
      type: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
      collections: {
        select: {
          collection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    contentType: item.contentType,
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    language: item.language,
    tags: item.tags.map((t) => t.tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.type,
    collections: item.collections.map((c) => c.collection),
  };
}
