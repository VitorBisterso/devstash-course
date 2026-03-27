import { prisma } from "@/lib/prisma";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

export interface UserStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: { typeId: string; typeName: string; typeIcon: string | null; typeColor: string | null; count: number }[];
}

export interface UserAuthMethods {
  hasPassword: boolean;
  hasGitHub: boolean;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    createdAt: user.createdAt,
  };
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [totalItems, totalCollections, itemsByTypeRaw] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.item.groupBy({
      by: ["typeId"],
      where: { userId },
      _count: { typeId: true },
    }),
  ]);

  const typeIds = itemsByTypeRaw.map((item) => item.typeId);
  const types = await prisma.itemType.findMany({
    where: { id: { in: typeIds } },
    select: { id: true, name: true, icon: true, color: true },
  });

  const typeMap = new Map(types.map((t) => [t.id, t]));

  const itemsByType = itemsByTypeRaw.map((item) => {
    const type = typeMap.get(item.typeId);
    return {
      typeId: item.typeId,
      typeName: type?.name ?? "Unknown",
      typeIcon: type?.icon ?? null,
      typeColor: type?.color ?? null,
      count: item._count.typeId,
    };
  });

  return { totalItems, totalCollections, itemsByType };
}

export async function getUserAuthMethods(userId: string): Promise<UserAuthMethods> {
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: { provider: true },
  });

  const hasPassword = accounts.some((a) => a.provider === "credentials");
  const hasGitHub = accounts.some((a) => a.provider === "github");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (user?.password) {
    return { hasPassword: true, hasGitHub };
  }

  return { hasPassword, hasGitHub };
}

export async function changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const hashedPassword = await import("bcryptjs").then((bcrypt) => bcrypt.hash(newPassword, 10));

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  await prisma.user.delete({
    where: { id: userId },
  });

  return true;
}
