import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSearchData } from "./search";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findMany: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
    },
  },
}));

describe("getSearchData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns items and collections for a user", async () => {
    const mockItems = [
      {
        id: "item-1",
        title: "Test Snippet",
        content: "console.log('hello')",
        type: { name: "Snippet", icon: "code", color: "#ff0000" },
      },
    ];
    const mockCollections = [
      { id: "col-1", name: "My Collection", _count: { items: 5 } },
    ];

    vi.mocked(prisma.item.findMany).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockItems as unknown as any,
    );
    vi.mocked(prisma.collection.findMany).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCollections as unknown as any,
    );

    const result = await getSearchData("user-123");

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      id: "item-1",
      title: "Test Snippet",
      typeName: "Snippet",
      typeIcon: "code",
      typeColor: "#ff0000",
      contentPreview: "console.log('hello')".slice(0, 50),
    });
    expect(result.collections).toHaveLength(1);
    expect(result.collections[0]).toEqual({
      id: "col-1",
      name: "My Collection",
      itemCount: 5,
    });
  });

  it("returns empty arrays when user has no items or collections", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([]);
    vi.mocked(prisma.collection.findMany).mockResolvedValue([]);

    const result = await getSearchData("user-123");

    expect(result.items).toHaveLength(0);
    expect(result.collections).toHaveLength(0);
  });

  it("truncates content preview to 50 characters", async () => {
    const longContent = "a".repeat(100);
    const mockItems = [
      {
        id: "item-1",
        title: "Long Item",
        content: longContent,
        type: { name: "Note", icon: "file-text", color: "#00ff00" },
      },
    ];

    vi.mocked(prisma.item.findMany).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockItems as unknown as any,
    );
    vi.mocked(prisma.collection.findMany).mockResolvedValue([]);

    const result = await getSearchData("user-123");

    expect(result.items[0].contentPreview).toHaveLength(50);
    expect(result.items[0].contentPreview).toBe("a".repeat(50));
  });

  it("handles null content", async () => {
    const mockItems = [
      {
        id: "item-1",
        title: "No Content",
        content: null,
        type: { name: "Link", icon: "link", color: "#0000ff" },
      },
    ];

    vi.mocked(prisma.item.findMany).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockItems as unknown as any,
    );
    vi.mocked(prisma.collection.findMany).mockResolvedValue([]);

    const result = await getSearchData("user-123");

    expect(result.items[0].contentPreview).toBeNull();
  });
});
