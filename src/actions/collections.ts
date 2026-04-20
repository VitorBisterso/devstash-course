"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";

const createCollectionSchema = z.object({
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