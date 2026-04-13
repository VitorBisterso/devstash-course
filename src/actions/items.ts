"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as dbUpdateItem, createItem as dbCreateItem, getSystemItemTypes } from "@/lib/db/items";

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
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export interface CreateItemResult {
  success: boolean;
  data?: { id: string };
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createItem(data: unknown): Promise<CreateItemResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(data);

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
    const result = await dbCreateItem(session.user.id, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content ?? null,
      url: parsed.data.url ?? null,
      language: parsed.data.language ?? null,
      typeId: parsed.data.typeId,
      tags: parsed.data.tags,
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
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(data);

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
    const dbData = {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      content: parsed.data.content ?? null,
      url: parsed.data.url ?? null,
      language: parsed.data.language ?? null,
      tags: parsed.data.tags,
    };
    const result = await dbUpdateItem(session.user.id, itemId, dbData);

    if (!result) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update item:", error);
    return { success: false, error: "Failed to update item" };
  }
}
