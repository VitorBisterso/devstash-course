import { describe, it, expect, vi, beforeEach } from "vitest";
import { getItemById } from "./items";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
    },
  },
}));

describe("getItemById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when item not found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await getItemById("user-123", "item-456");

    expect(result).toBeNull();
    expect(prisma.item.findFirst).toHaveBeenCalledWith({
      where: { id: "item-456", userId: "user-123" },
      include: expect.any(Object),
    });
  });

  it("returns item detail when found", async () => {
    const mockItem = {
      id: "item-123",
      title: "Test Item",
      description: "Test description",
      contentType: "text",
      content: "Test content",
      url: "https://example.com",
      isFavorite: true,
      isPinned: false,
      language: "javascript",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      userId: "user-123",
      typeId: "type-1",
      tags: [{ tag: { name: "tag1" } }],
      collections: [{ collection: { id: "col-1", name: "Collection 1" } }],
      type: { id: "type-1", name: "Snippet", icon: "code", color: "#000" },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
    };
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockItem);

    const result = await getItemById("user-123", "item-123");

    expect(result).toEqual({
      id: "item-123",
      title: "Test Item",
      description: "Test description",
      contentType: "text",
      content: "Test content",
      url: "https://example.com",
      isFavorite: true,
      isPinned: false,
      language: "javascript",
      tags: ["tag1"],
      collections: [{ id: "col-1", name: "Collection 1" }],
      type: { id: "type-1", name: "Snippet", icon: "code", color: "#000" },
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-02"),
    });
  });

  it("handles items without tags and collections", async () => {
    const mockItem = {
      id: "item-123",
      title: "Test Item",
      description: null,
      contentType: "text",
      content: null,
      url: null,
      isFavorite: false,
      isPinned: true,
      language: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      userId: "user-123",
      typeId: "type-1",
      tags: [],
      collections: [],
      type: { id: "type-1", name: "Link", icon: "link", color: "#333" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockItem);

    const result = await getItemById("user-123", "item-123");

    expect(result?.tags).toEqual([]);
    expect(result?.collections).toEqual([]);
    expect(result?.description).toBeNull();
  });
});
