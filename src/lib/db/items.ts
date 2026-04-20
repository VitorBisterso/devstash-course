import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

function extractR2Key(fileUrl: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return null;
  if (!fileUrl.startsWith(publicUrl)) return null;
  return fileUrl.replace(publicUrl + "/", "");
}

export interface CreateItemInput {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  typeId: string;
  tags: string[];
  collectionIds?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

export async function createItem(
  userId: string,
  data: CreateItemInput
): Promise<{ id: string }> {
  const tagCreations = data.tags.map((tagName) => {
    const normalizedName = tagName.trim().toLowerCase();
    return prisma.tag.upsert({
      where: {
        name_userId: {
          name: normalizedName,
          userId,
        },
      },
      update: {},
      create: {
        name: normalizedName,
        userId,
      },
    });
  });

  const collectionLinks =
    data.collectionIds?.map((collectionId) => ({
      collectionId,
    })) ?? [];

  const result = await prisma.$transaction(async (tx) => {
    const tagRecords = await Promise.all(tagCreations);

    const item = await tx.item.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        language: data.language,
        contentType: data.language ? `text/${data.language}` : undefined,
        fileUrl: data.fileUrl ?? undefined,
        fileName: data.fileName ?? undefined,
        fileSize: data.fileSize ?? undefined,
        userId,
        typeId: data.typeId,
      },
    });

    for (const tag of tagRecords) {
      await tx.itemTag.create({
        data: {
          itemId: item.id,
          tagId: tag.id,
        },
      });
    }

    for (const link of collectionLinks) {
      await tx.itemCollection.create({
        data: {
          itemId: item.id,
          collectionId: link.collectionId,
        },
      });
    }

    return item;
  });

  return { id: result.id };
}

export async function deleteItem(userId: string, itemId: string): Promise<boolean> {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!item) return false;

  if (item.fileUrl) {
    const key = extractR2Key(item.fileUrl);
    if (key) {
      try {
        await deleteFromR2(key);
      } catch (error) {
        console.error("Failed to delete file from R2:", error);
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.itemTag.deleteMany({ where: { itemId } });
    await tx.itemCollection.deleteMany({ where: { itemId } });
    await tx.item.delete({ where: { id: itemId } });
  });

  return true;
}

export interface ItemWithType {
  id: string;
  title: string;
  contentType: string | null;
  content: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    tags: item.tags.map((t) => t.tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.type,
    collections: item.collections.map((c) => c.collection),
  };
}

export interface UpdateItemInput {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      userId,
    },
  });

  if (!item) return null;

  const tagCreations = data.tags.map((tagName) => {
    const normalizedName = tagName.trim().toLowerCase();
    return prisma.tag.upsert({
      where: {
        name_userId: {
          name: normalizedName,
          userId,
        },
      },
      update: {},
      create: {
        name: normalizedName,
        userId,
      },
    });
  });

  const collectionLinks =
    data.collectionIds?.map((collectionId) => ({
      collectionId,
    })) ?? [];

  const result = await prisma.$transaction(async (tx) => {
    await tx.itemTag.deleteMany({ where: { itemId } });

    const tagRecords = await Promise.all(tagCreations);

    await tx.item.update({
      where: { id: itemId },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        language: data.language,
      },
    });

    for (const tag of tagRecords) {
      await tx.itemTag.create({
        data: {
          itemId,
          tagId: tag.id,
        },
      });
    }

    await tx.itemCollection.deleteMany({ where: { itemId } });

    for (const link of collectionLinks) {
      await tx.itemCollection.create({
        data: {
          itemId,
          collectionId: link.collectionId,
        },
      });
    }

    return tx.item.findUnique({
      where: { id: itemId },
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
  });

  if (!result) return null;

  return {
    id: result.id,
    title: result.title,
    description: result.description,
    contentType: result.contentType,
    content: result.content,
    url: result.url,
    isFavorite: result.isFavorite,
    isPinned: result.isPinned,
    language: result.language,
    fileUrl: result.fileUrl,
    fileName: result.fileName,
    fileSize: result.fileSize,
    tags: result.tags.map((t) => t.tag.name),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    type: result.type,
    collections: result.collections.map((c) => c.collection),
  };
}
