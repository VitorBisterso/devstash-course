import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

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

export async function getPinnedItems(): Promise<ItemWithType[]> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) return [];

  return prisma.item.findMany({
    where: {
      userId: user.id,
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

export async function getRecentItems(limit = 10): Promise<ItemWithType[]> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) return [];

  return prisma.item.findMany({
    where: { userId: user.id },
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

export async function getItemsByType(typeName: string): Promise<ItemWithType[]> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });

  if (!user) return [];

  return prisma.item.findMany({
    where: {
      userId: user.id,
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
