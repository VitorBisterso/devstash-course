import { describe, it, expect, vi, beforeEach } from "vitest";
import { canCreateItem, canCreateCollection, isUserPro } from "./limits";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    item: {
      count: vi.fn(),
    },
    collection: {
      count: vi.fn(),
    },
  },
}));

describe("canCreateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for Pro users regardless of item count", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: true });
    const result = await canCreateItem("user-1");
    expect(result).toBe(true);
    expect(prisma.item.count).not.toHaveBeenCalled();
  });

  it("returns true for free users below the 50-item limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.item.count).mockResolvedValue(30);
    const result = await canCreateItem("user-1");
    expect(result).toBe(true);
  });

  it("returns false for free users at the 50-item limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.item.count).mockResolvedValue(50);
    const result = await canCreateItem("user-1");
    expect(result).toBe(false);
  });

  it("returns false for free users above the 50-item limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.item.count).mockResolvedValue(75);
    const result = await canCreateItem("user-1");
    expect(result).toBe(false);
  });
});

describe("canCreateCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for Pro users regardless of collection count", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: true });
    const result = await canCreateCollection("user-1");
    expect(result).toBe(true);
    expect(prisma.collection.count).not.toHaveBeenCalled();
  });

  it("returns true for free users below the 3-collection limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.collection.count).mockResolvedValue(2);
    const result = await canCreateCollection("user-1");
    expect(result).toBe(true);
  });

  it("returns false for free users at the 3-collection limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.collection.count).mockResolvedValue(3);
    const result = await canCreateCollection("user-1");
    expect(result).toBe(false);
  });

  it("returns false for free users above the 3-collection limit", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    vi.mocked(prisma.collection.count).mockResolvedValue(5);
    const result = await canCreateCollection("user-1");
    expect(result).toBe(false);
  });
});

describe("isUserPro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when user is Pro", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: true });
    const result = await isUserPro("user-1");
    expect(result).toBe(true);
  });

  it("returns false when user is free", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ isPro: false });
    const result = await isUserPro("user-1");
    expect(result).toBe(false);
  });

  it("returns false when user is not found", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const result = await isUserPro("user-1");
    expect(result).toBe(false);
  });
});
