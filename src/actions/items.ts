"use server";

import { z } from "zod";
import { canCreateItem } from "@/lib/limits";
import { updateItem as dbUpdateItem, createItem as dbCreateItem, getSystemItemTypes, toggleItemFavorite as dbToggleItemFavorite, toggleItemPin as dbToggleItemPin } from "@/lib/db/items";
import { requireAuth, unauthorizedError, formatZodErrors, toggleAction, type ActionResult } from "@/lib/actions/shared";

const createItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .transform((v) => v.trim()),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .url("Invalid URL")
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  language: z.string().nullable().optional(),
  typeId: z.string().min(1, "Type is required"),
  tags: z.array(z.string().min(1).transform((v) => v.trim())).default([]),
  collectionIds: z.array(z.string()).default([]),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export type CreateItemResult = ActionResult<{ id: string }>;

export async function createItem(data: unknown): Promise<CreateItemResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const limitCheck = await canCreateItem(userId);
  if (!limitCheck) {
    return { success: false, error: "Free plan limited to 50 items. Upgrade to Pro for unlimited items." };
  }

  const parsed = createItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await dbCreateItem(userId, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content ?? null,
      url: parsed.data.url ?? null,
      language: parsed.data.language ?? null,
      typeId: parsed.data.typeId,
      tags: parsed.data.tags,
      collectionIds: parsed.data.collectionIds,
      fileUrl: parsed.data.fileUrl ?? null,
      fileName: parsed.data.fileName ?? null,
      fileSize: parsed.data.fileSize ?? null,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

export async function getItemTypes() {
  return getSystemItemTypes();
}

const updateItemSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .transform((v) => v.trim()),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .url("Invalid URL")
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().min(1).transform((v) => v.trim())).default([]),
  collectionIds: z.array(z.string()).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export interface UpdateItemResult {
  success: boolean;
  data?: {
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
  };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateItem(
  itemId: string,
  data: unknown
): Promise<UpdateItemResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const parsed = updateItemSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const dbData = {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content ?? null,
      url: parsed.data.url ?? null,
      language: parsed.data.language ?? null,
      tags: parsed.data.tags,
      collectionIds: parsed.data.collectionIds,
    };
    const result = await dbUpdateItem(userId, itemId, dbData);

    if (!result) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export type ToggleItemFavoriteResult = ActionResult<{ isFavorite: boolean }>;

export type ToggleItemPinResult = ActionResult<{ isPinned: boolean }>;

export async function toggleItemPin(
  itemId: string
): Promise<ToggleItemPinResult> {
  return toggleAction(itemId, dbToggleItemPin, "isPinned", "Item not found", "toggle item pin");
}

export async function toggleItemFavorite(
  itemId: string
): Promise<ToggleItemFavoriteResult> {
  return toggleAction(itemId, dbToggleItemFavorite, "isFavorite", "Item not found", "toggle item favorite");
}
