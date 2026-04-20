import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCollection } from "./collections";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: {
      create: vi.fn<() => Promise<{ id: string; name: string; description: string | null; isFavorite: boolean; userId: string; createdAt: Date; updatedAt: Date }>>(),
    },
  },
}));

describe("createCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a collection with name and description", async () => {
    const mockCollection = {
      id: "col-123",
      name: "Test Collection",
      description: "Test description",
      isFavorite: false,
      userId: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.collection.create).mockResolvedValue(mockCollection);

    const result = await createCollection("user-123", {
      name: "Test Collection",
      description: "Test description",
    });

    expect(result).toEqual({ id: "col-123" });
    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        name: "Test Collection",
        description: "Test description",
        userId: "user-123",
      },
    });
  });

  it("creates a collection without description", async () => {
    const mockCollection = {
      id: "col-456",
      name: "My Collection",
      description: null,
      isFavorite: false,
      userId: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.collection.create).mockResolvedValue(mockCollection);

    const result = await createCollection("user-123", {
      name: "My Collection",
      description: null,
    });

    expect(result).toEqual({ id: "col-456" });
    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        name: "My Collection",
        description: null,
        userId: "user-123",
      },
    });
  });
});