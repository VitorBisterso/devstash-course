# Stripe Phase 1 — Core Infrastructure

## Overview

Set up the foundational Stripe integration: SDK client, plan constants, usage-limits helpers with unit tests, and environment variables.

## Requirements

- Install `stripe` SDK
- Create `src/lib/stripe.ts` — Stripe client singleton
- Create `src/lib/plans.ts` — Free tier limits and Pro price IDs/features
- Create `src/lib/limits.ts` — `canCreateItem()`, `canCreateCollection()`, `isUserPro()` helpers
- Add unit tests for `src/lib/limits.ts` covering free-tier limits and Pro bypass
- Add `.env` entries for Stripe keys and price IDs

## Files to Create

### 1. `src/lib/stripe.ts`

Stripe SDK client using `STRIPE_SECRET_KEY` from env. API version `2025-02-24` with TypeScript enabled.

### 2. `src/lib/plans.ts`

Export `FREE_TIER` (maxItems: 50, maxCollections: 3), `PRO_PRICES` (monthly/yearly price IDs from env), and `PRO_FEATURES` array.

### 3. `src/lib/limits.ts`

Three async helpers that query Prisma:

- `canCreateItem(userId)` — Pro users always true; free users limited to 50 items
- `canCreateCollection(userId)` — Pro users always true; free users limited to 3 collections
- `isUserPro(userId)` — Returns `isPro` boolean

### 4. `src/lib/limits.test.ts`

Unit tests for `src/lib/limits.ts` with mocked Prisma:

```
src/lib/limits.test.ts
```

```typescript
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
```

## Environment Variables

Add to `.env`:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

Also add `.env.example` entries with placeholder values.

## Testing

1. Run `npm install stripe`
2. Run `npm run test src/lib/limits.test.ts` — all 11 tests pass
3. Verify that the limits module can be imported without runtime errors

## References

- `@docs/stripe-integration-plan.md`
- Existing test patterns: `src/lib/db/items.test.ts`
- Free tier constants: `src/lib/plans.ts`
