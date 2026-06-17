"use server";

import { z } from "zod";
import { canCreateCollection } from "@/lib/limits";
import {
  createCollection as dbCreateCollection,
  getCollections as dbGetCollections,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  removeItemFromCollection as dbRemoveItemFromCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";
import { requireAuth, unauthorizedError, formatZodErrors, toggleAction, type ActionResult } from "@/lib/actions/shared";

const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((v) => v.trim()),
  description: z.string().nullable().optional(),
});

const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .transform((v) => v.trim()),
  description: z.string().nullable().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export type CreateCollectionResult = ActionResult<{ id: string }>;

export async function createCollection(
  data: unknown
): Promise<CreateCollectionResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const limitCheck = await canCreateCollection(userId);
  if (!limitCheck) {
    return { success: false, error: "Free plan limited to 3 collections. Upgrade to Pro for unlimited collections." };
  }

  const parsed = createCollectionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await dbCreateCollection(userId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create collection:", error);
    return { success: false, error: "Failed to create collection" };
  }
}

export async function getCollections(): Promise<{ id: string; name: string }[]> {
  const userId = await requireAuth();
  if (!userId) return [];
  return dbGetCollections(userId);
}

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

export type UpdateCollectionResult = ActionResult<{ id: string }>;

export async function updateCollection(
  collectionId: string,
  data: unknown
): Promise<UpdateCollectionResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  const parsed = updateCollectionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await dbUpdateCollection(userId, collectionId, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });

    if (!result) {
      return { success: false, error: "Collection not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update collection:", error);
    return { success: false, error: "Failed to update collection" };
  }
}

export type DeleteCollectionResult = ActionResult;

export async function deleteCollection(
  collectionId: string
): Promise<DeleteCollectionResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  try {
    await dbDeleteCollection(userId, collectionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

export type RemoveItemFromCollectionResult = ActionResult;

export async function removeItemFromCollection(
  collectionId: string,
  itemId: string
): Promise<RemoveItemFromCollectionResult> {
  const userId = await requireAuth();
  if (!userId) return unauthorizedError();

  try {
    await dbRemoveItemFromCollection(userId, collectionId, itemId);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove item from collection:", error);
    return { success: false, error: "Failed to remove item from collection" };
  }
}

export type ToggleCollectionFavoriteResult = ActionResult<{ isFavorite: boolean }>;

export async function toggleCollectionFavorite(
  collectionId: string
): Promise<ToggleCollectionFavoriteResult> {
  return toggleAction(collectionId, dbToggleCollectionFavorite, "isFavorite", "Collection not found", "toggle collection favorite");
}