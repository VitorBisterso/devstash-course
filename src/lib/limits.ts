import { prisma } from "@/lib/prisma";
import { FREE_TIER } from "@/lib/plans";

export async function canCreateItem(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user) return false;
  if (user.isPro) return true;

  const itemCount = await prisma.item.count({
    where: { userId },
  });

  return itemCount < FREE_TIER.maxItems;
}

export async function canCreateCollection(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user) return false;
  if (user.isPro) return true;

  const collectionCount = await prisma.collection.count({
    where: { userId },
  });

  return collectionCount < FREE_TIER.maxCollections;
}

export async function isUserPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  return user?.isPro ?? false;
}
