# Stripe Subscription Integration Plan

## Overview

Integrate Stripe subscriptions (Pro at $8/mo or $72/yr) into DevStash. The schema already has `isPro`, `stripeCustomerId`, and `stripeSubscriptionId` on the `User` model — they just need to be wired up.

---

## 1. Files to Create

### 1.1 `src/lib/stripe.ts` — Stripe SDK Client

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24",
  typescript: true,
});
```

### 1.2 `src/lib/plans.ts` — Plan Constants

```typescript
export const FREE_TIER = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

export const PRO_FEATURES = [
  "file",
  "image",
  "custom-types",
  "ai",
  "export",
] as const;
```

### 1.3 `src/app/api/webhooks/stripe/route.ts` — Webhook Handler

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.customer && session.subscription) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeCustomerId = subscription.customer as string;
        const status = subscription.status;
        await prisma.user.update({
          where: { stripeCustomerId },
          data: {
            isPro: status === "active" || status === "trialing",
            stripeSubscriptionId:
              status === "active" || status === "trialing"
                ? subscription.id
                : null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
```

### 1.4 `src/app/api/stripe/create-checkout/route.ts` — Checkout Session

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { priceId } = await request.json();
  if (!priceId) {
    return NextResponse.json({ error: "priceId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email!,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId: session.user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?checkout=cancelled`,
    subscription_data: {
      metadata: { userId: session.user.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### 1.5 `src/app/api/stripe/portal/route.ts` — Customer Portal

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

### 1.6 `src/components/settings/subscription-section.tsx` — Subscription UI

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SubscriptionSectionProps {
  isPro: boolean;
  stripeCustomerId: string | null;
}

export function SubscriptionSection({ isPro, stripeCustomerId }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (isPro) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pro Plan</h3>
            <p className="text-sm text-muted-foreground">You have full access to all features.</p>
          </div>
          <Badge variant="default" className="text-xs">Active</Badge>
        </div>
        <Button variant="outline" className="mt-4" onClick={handlePortal} disabled={loading}>
          Manage Subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold mb-1">Upgrade to Pro</h3>
      <p className="text-sm text-muted-foreground mb-4">Unlock unlimited items, collections, AI features, and more.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY!)} disabled={loading}>
          $8/month
        </Button>
        <Button variant="outline" onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY!)} disabled={loading}>
          $72/year (Save 25%)
        </Button>
      </div>
    </div>
  );
}
```

### 1.7 `src/actions/billing.ts` — Billing Server Action

```typescript
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSubscriptionStatus(): Promise<{
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });

  if (!user) {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null };
  }

  return user;
}
```

### 1.8 `src/lib/limits.ts` — Limit Check Helpers

```typescript
import { prisma } from "@/lib/prisma";
import { FREE_TIER } from "@/lib/plans";

export async function canCreateItem(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (user?.isPro) return true;

  const count = await prisma.item.count({ where: { userId } });
  return count < FREE_TIER.maxItems;
}

export async function canCreateCollection(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (user?.isPro) return true;

  const count = await prisma.collection.count({ where: { userId } });
  return count < FREE_TIER.maxCollections;
}

export async function isUserPro(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
```

---

## 2. Files to Modify

### 2.1 `src/auth.ts` — JWT Callback: Sync `isPro` from DB

Add `isPro` to JWT token and session:

```typescript
jwt({ token, user }) {
  if (user?.id) {
    token.id = user.id;
  }
  return token;
},
session({ session, token }) {
  if (token?.id && session.user) {
    session.user.id = token.id as string;
    session.user.isPro = token.isPro as boolean;
  }
  return session;
},
```

### 2.2 `src/types/next-auth.d.ts` — Session Type Augmentation

```typescript
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & Session["user"];
  }
}
```

### 2.3 `src/actions/items.ts` — Add Free Tier Check to `createItem`

After auth check and before validation, add limit check:

```typescript
const canCreate = await canCreateItem(session.user.id);
if (!canCreate) {
  return { success: false, error: "Free plan limited to 50 items. Upgrade to Pro for unlimited items." };
}
```

Import: `import { canCreateItem } from "@/lib/limits";`

### 2.4 `src/actions/collections.ts` — Add Free Tier Check to `createCollection`

After auth check and before validation:

```typescript
const canCreate = await canCreateCollection(session.user.id);
if (!canCreate) {
  return { success: false, error: "Free plan limited to 3 collections. Upgrade to Pro for unlimited collections." };
}
```

Import: `import { canCreateCollection } from "@/lib/limits";`

### 2.5 `src/app/(dashboard)/settings/page.tsx` — Add Subscription Section

- Import and call `getSubscriptionStatus()` server action
- Render `SubscriptionSection` component below `<SettingsActions>`
- Pass `isPro`, `stripeCustomerId` as props

### 2.6 `src/components/dashboard/sidebar-sections.tsx` — Dynamic PRO Badge

- Make the PRO badge on Files/Images conditional on `isPro`
- Accept `isPro` prop, hide badge when user is Pro (no need to advertise upgrade)

### 2.7 `src/app/api/upload/route.ts` — Gate File Uploads to Pro

After auth check:

```typescript
import { isUserPro } from "@/lib/limits";

const pro = await isUserPro(session.user.id);
if (!pro) {
  return new NextResponse("File uploads are a Pro feature", { status: 403 });
}
```

### 2.8 `.env` — Add Public Stripe Key & Portal Config

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
```

### 2.9 `src/components/landing/pricing-toggle.tsx` — Wire Pro Button to Checkout

- Replace the `<a href="/register">` on the Pro card with a client component that calls `/api/stripe/create-checkout`
- Or link to `/settings?upgrade=true`

---

## 3. Stripe Dashboard Setup

### Products & Prices (already created — IDs in `.env`)
- **Monthly Pro**: `price_1TbecMJeEA7LE26Hx97MCrAs` — $8/month
- **Yearly Pro**: `price_1Tbed2JeEA7LE26HnjTAaKzK` — $72/year

### Webhook Endpoint
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### Customer Portal (optional but recommended)
1. Stripe Dashboard → Settings → Billing → Customer Portal
2. Configure allowed actions (cancel, upgrade/downgrade, update payment method)
3. Portal is already linked via `/api/stripe/portal`

---

## 4. Testing Checklist

- [ ] npm install `stripe`
- [ ] Run `createItem` as free user with < 50 items — succeeds
- [ ] Run `createItem` as free user with >= 50 items — returns error
- [ ] Run `createCollection` as free user with < 3 collections — succeeds
- [ ] Run `createCollection` as free user with >= 3 collections — returns error
- [ ] Pro users can create unlimited items and collections
- [ ] Checkout session creation returns a Stripe Checkout URL
- [ ] Webhook `checkout.session.completed` sets `isPro=true` on user
- [ ] Webhook `customer.subscription.deleted` sets `isPro=false`
- [ ] Session picks up `isPro` change on next page load (JWT sync)
- [ ] File upload API rejects non-Pro users with 403
- [ ] Settings page shows subscription section
- [ ] Billing portal opens and allows cancellation
- [ ] Landing page Pro button links to checkout

---

## 5. Implementation Order

1. **Install Stripe SDK**: `npm install stripe`
2. **Create lib files**: `stripe.ts`, `plans.ts`, `limits.ts`
3. **Create API routes**: `create-checkout`, `portal`, `webhooks/stripe`
4. **Update NextAuth**: Modify `src/auth.ts` JWT callback + session, update types
5. **Add limit enforcement**: Modify `src/actions/items.ts` and `src/actions/collections.ts`
6. **Gate uploads**: Modify `src/app/api/upload/route.ts`
7. **Add subscription UI**: Create `subscription-section.tsx`, update settings page
8. **Update sidebar**: Make PRO badge dynamic
9. **Configure Stripe Dashboard**: Set up webhook endpoint
10. **Set env vars**: Add `NEXT_PUBLIC_*` keys and webhook secret
11. **Test end-to-end**: Use Stripe test card `4242 4242 4242 4242`
