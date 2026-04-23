"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  getCollections as dbGetCollections,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  removeItemFromCollection as dbRemoveItemFromCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";

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

export interface CreateCollectionResult {
  success: boolean;
  data?: { id: string };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createCollection(
  data: unknown
): Promise<CreateCollectionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const error of parsed.error.issues) {
      const path = error.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(error.message);
    }
    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  try {
    const result = await dbCreateCollection(session.user.id, {
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
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }
  return dbGetCollections(session.user.id);
}

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

export interface UpdateCollectionResult {
  success: boolean;
  data?: { id: string };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateCollection(
  collectionId: string,
  data: unknown
): Promise<UpdateCollectionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(data);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const error of parsed.error.issues) {
      const path = error.path.join(".");
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(error.message);
    }
    return {
      success: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  try {
    const result = await dbUpdateCollection(session.user.id, collectionId, {
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

export interface DeleteCollectionResult {
  success: boolean;
  error?: string;
}

export async function deleteCollection(
  collectionId: string
): Promise<DeleteCollectionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbDeleteCollection(session.user.id, collectionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

export interface RemoveItemFromCollectionResult {
  success: boolean;
  error?: string;
}

export async function removeItemFromCollection(
  collectionId: string,
  itemId: string
): Promise<RemoveItemFromCollectionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await dbRemoveItemFromCollection(session.user.id, collectionId, itemId);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove item from collection:", error);
    return { success: false, error: "Failed to remove item from collection" };
  }
}

export interface ToggleCollectionFavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

export async function toggleCollectionFavorite(
  collectionId: string
): Promise<ToggleCollectionFavoriteResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const isFavorite = await dbToggleCollectionFavorite(session.user.id, collectionId);

    if (isFavorite === null) {
      return { success: false, error: "Collection not found" };
    }

    return { success: true, isFavorite };
  } catch (error) {
    console.error("Failed to toggle collection favorite:", error);
    return { success: false, error: "Failed to toggle collection favorite" };
  }
}