import { describe, it, expect, vi, beforeEach } from "vitest";
import { getItemById, updateItem, deleteItem, createItem } from "./items";
import { prisma } from "@/lib/prisma";

const mockItemBase = {
  id: "item-123",
  description: null as string | null,
  contentType: "text",
  content: null as string | null,
  url: null as string | null,
  isFavorite: false,
  isPinned: false,
  language: null as string | null,
  fileUrl: null as string | null,
  fileName: null as string | null,
  fileSize: null as number | null,
  userId: "user-123",
  typeId: "type-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
};

const mockItemType = {
  id: "type-1",
  name: "Snippet",
  icon: "code",
  color: "#000",
};

type MockItem = typeof mockItemBase & {
  title: string;
  tags: { tag: { name: string } }[];
  collections: { collection: { id: string; name: string } }[];
  type: typeof mockItemType;
};

type MockItemMinimal = typeof mockItemBase & {
  title: string;
  tags: never[];
  collections: never[];
  type: typeof mockItemType;
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findFirst: vi.fn<() => Promise<MockItem | MockItemMinimal | null>>(),
      findUnique: vi.fn<() => Promise<MockItem | null>>(),
      update: vi.fn<() => Promise<MockItem>>(),
      delete: vi.fn<() => Promise<MockItem>>(),
      create: vi.fn<() => Promise<MockItem>>(),
    },
    itemTag: {
      deleteMany: vi.fn<() => Promise<{ count: number }>>(),
      create: vi.fn<() => Promise<{ itemId: string; tagId: string }>>(),
    },
    itemCollection: {
      deleteMany: vi.fn<() => Promise<{ count: number }>>(),
    },
    tag: {
      upsert: vi.fn<() => Promise<{ id: string; name: string; userId: string }>>(),
    },
    $transaction: vi.fn(),
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
      fileUrl: null,
      fileName: null,
      fileSize: null,
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

describe("updateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when item not found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await updateItem("user-123", "item-456", {
      title: "Updated Title",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });

    expect(result).toBeNull();
  });

  it("updates item and returns updated item detail", async () => {
    const mockFindResult: MockItemMinimal = {
      ...mockItemBase,
      title: "Old Title",
      description: "Old description",
      content: "Old content",
      tags: [],
      collections: [],
      type: mockItemType,
    };
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockFindResult);

    const mockUpdatedItem: MockItem = {
      ...mockItemBase,
      title: "Updated Title",
      description: "Updated description",
      content: "Updated content",
      language: "javascript",
      tags: [{ tag: { name: "newtag" } }],
      collections: [],
      type: mockItemType,
      updatedAt: new Date("2024-01-03"),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.item.update).mockResolvedValue(mockUpdatedItem);
    vi.mocked(prisma.item.findUnique).mockResolvedValue(mockUpdatedItem);
    vi.mocked(prisma.itemTag.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.tag.upsert).mockResolvedValue({
      id: "tag-1",
      name: "newtag",
      userId: "user-123",
    });
    vi.mocked(prisma.itemTag.create).mockResolvedValue({
      itemId: "item-123",
      tagId: "tag-1",
    });

    const result = await updateItem("user-123", "item-123", {
      title: "Updated Title",
      description: "Updated description",
      content: "Updated content",
      url: null,
      language: "javascript",
      tags: ["newtag"],
    });

    expect(result).not.toBeNull();
    expect(result?.title).toBe("Updated Title");
    expect(result?.description).toBe("Updated description");
    expect(result?.language).toBe("javascript");
    expect(result?.tags).toContain("newtag");
  });

  it("handles tag creation with disconnect and reconnect", async () => {
    const mockFindResult: MockItemMinimal = {
      ...mockItemBase,
      title: "Test",
      tags: [],
      collections: [],
      type: { id: "type-1", name: "Note", icon: "note", color: "#111" },
    };
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockFindResult);

    const mockResult: MockItem = {
      ...mockItemBase,
      title: "Updated",
      tags: [{ tag: { name: "newtag" } }],
      collections: [],
      type: { id: "type-1", name: "Note", icon: "note", color: "#111" },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.item.update).mockResolvedValue(mockResult);
    vi.mocked(prisma.item.findUnique).mockResolvedValue(mockResult);
    vi.mocked(prisma.itemTag.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.tag.upsert).mockResolvedValue({
      id: "tag-new",
      name: "newtag",
      userId: "user-123",
    });
    vi.mocked(prisma.itemTag.create).mockResolvedValue({
      itemId: "item-123",
      tagId: "tag-new",
    });

    const result = await updateItem("user-123", "item-123", {
      title: "Updated",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: ["newtag"],
    });

    expect(prisma.itemTag.deleteMany).toHaveBeenCalledWith({
      where: { itemId: "item-123" },
    });
    expect(result?.tags).toEqual(["newtag"]);
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when item not found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await deleteItem("user-123", "item-456");

    expect(result).toBe(false);
    expect(prisma.item.findFirst).toHaveBeenCalledWith({
      where: { id: "item-456", userId: "user-123" },
    });
  });

  it("deletes item and returns true on success", async () => {
    const mockItemWithRelations = {
      ...mockItemBase,
      title: "Test Item",
      tags: [] as { tag: { name: string } }[],
      collections: [] as { collection: { id: string; name: string } }[],
      type: mockItemType,
    };
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockItemWithRelations);

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.itemTag.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.itemCollection.deleteMany).mockResolvedValue({ count: 0 });
    vi.mocked(prisma.item.delete).mockResolvedValue(
      {
        ...mockItemBase,
        title: "Test Item",
        tags: [],
        collections: [],
        type: mockItemType,
      } as unknown as MockItem
    );

    const result = await deleteItem("user-123", "item-123");

    expect(result).toBe(true);
    expect(prisma.itemTag.deleteMany).toHaveBeenCalledWith({
      where: { itemId: "item-123" },
    });
    expect(prisma.itemCollection.deleteMany).toHaveBeenCalledWith({
      where: { itemId: "item-123" },
    });
    expect(prisma.item.delete).toHaveBeenCalledWith({
      where: { id: "item-123" },
    });
  });
});

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates item with tags", async () => {
    const mockTag = { id: "tag-1", name: "newtag", userId: "user-123" };
    const mockCreatedItem: MockItemMinimal = {
      ...mockItemBase,
      title: "Test Item",
      description: "Test description",
      content: "Test content",
      language: "javascript",
      tags: [],
      collections: [],
      type: mockItemType,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.tag.upsert).mockResolvedValue(mockTag);
    vi.mocked(prisma.item.create).mockResolvedValue(mockCreatedItem);
    vi.mocked(prisma.itemTag.create).mockResolvedValue({
      itemId: "item-123",
      tagId: "tag-1",
    });

    const result = await createItem("user-123", {
      title: "Test Item",
      description: "Test description",
      content: "Test content",
      url: null,
      language: "javascript",
      typeId: "type-1",
      tags: ["newtag"],
    });

    expect(result).toEqual({ id: "item-123" });
    expect(prisma.item.create).toHaveBeenCalledWith({
      data: {
        title: "Test Item",
        description: "Test description",
        content: "Test content",
        url: null,
        language: "javascript",
        contentType: "text/javascript",
        userId: "user-123",
        typeId: "type-1",
      },
    });
  });

  it("creates item without tags", async () => {
    const mockCreatedItem: MockItemMinimal = {
      ...mockItemBase,
      title: "Test Item",
      description: null,
      content: null,
      language: null,
      tags: [],
      collections: [],
      type: mockItemType,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      return callback(prisma);
    });
    vi.mocked(prisma.tag.upsert).mockResolvedValue({ id: "tag-1", name: "newtag", userId: "user-123" });
    vi.mocked(prisma.item.create).mockResolvedValue(mockCreatedItem);

    const result = await createItem("user-123", {
      title: "Test Item",
      description: null,
      content: null,
      url: null,
      language: null,
      typeId: "type-1",
      tags: [],
    });

    expect(result).toEqual({ id: "item-123" });
  });
});
