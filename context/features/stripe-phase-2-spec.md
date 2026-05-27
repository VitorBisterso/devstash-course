# Stripe Phase 2 — Integration & UI

## Overview

Wire everything together: webhook handler, checkout/portal API routes, subscription UI component, billing server action, Auth.js JWT sync, feature gating in existing actions/routes, and dynamic sidebar badge.

## Requirements

- Create webhook handler at `src/app/api/webhooks/stripe/route.ts`
- Create checkout session API route at `src/app/api/stripe/create-checkout/route.ts`
- Create billing portal API route at `src/app/api/stripe/portal/route.ts`
- Create `src/components/settings/subscription-section.tsx` — upgrade/manage UI
- Create `src/actions/billing.ts` — `getSubscriptionStatus()` server action
- Update `src/auth.ts` — Add `isPro` to JWT callback and session
- Update `src/types/next-auth.d.ts` — Add `isPro` to Session type
- Update `src/actions/items.ts` — Gate `createItem` with `canCreateItem()`
- Update `src/actions/collections.ts` — Gate `createCollection` with `canCreateCollection()`
- Update `src/app/api/upload/route.ts` — Gate file uploads with `isUserPro()`
- Update `src/app/(dashboard)/settings/page.tsx` — Render `SubscriptionSection`
- Update `src/components/dashboard/sidebar-sections.tsx` — Dynamic PRO badge
- Update landing page Pro card to link to `/settings?upgrade=true`

## Files to Create

### 1. `src/app/api/webhooks/stripe/route.ts`

`POST` handler that:

- Reads raw body and `stripe-signature` header
- Validates signature with `STRIPE_WEBHOOK_SECRET`
- Handles `checkout.session.completed` — sets `isPro=true`, `stripeCustomerId`, `stripeSubscriptionId`
- Handles `customer.subscription.updated` / `customer.subscription.deleted` — syncs `isPro` and subscription ID
- Returns 400 on invalid signature, 500 on handler error

### 2. `src/app/api/stripe/create-checkout/route.ts`

`POST` handler that:

- Authenticates user via `auth()`
- Accepts `{ priceId }` in body
- Looks up or creates Stripe customer
- Creates Stripe Checkout Session with `userId` in metadata
- Returns `{ url }` to redirect the user

### 3. `src/app/api/stripe/portal/route.ts`

`POST` handler that:

- Authenticates user via `auth()`
- Looks up `stripeCustomerId`
- Creates Stripe Billing Portal session with return URL to `/settings`
- Returns `{ url }`

### 4. `src/components/settings/subscription-section.tsx`

Client component that:

- Accepts `isPro`, `stripeCustomerId` props
- Shows "Pro Plan" card with "Manage Subscription" button when Pro
- Shows "Upgrade to Pro" card with $8/month and $72/year buttons when free
- Calls `/api/stripe/create-checkout` or `/api/stripe/portal`
- Handles loading state and toast errors

### 5. `src/actions/billing.ts`

Server action exporting `getSubscriptionStatus()` that:

- Authenticates user
- Queries Prisma for `isPro`, `stripeCustomerId`, `stripeSubscriptionId`
- Returns defaults when unauthenticated or user not found

## Files to Modify

### 6. `src/auth.ts`

Add to JWT callback:

- Fetch user's `isPro` from DB and attach to token
- This ensures `isPro` syncs on every token refresh (page navigation)

Add to session callback:

- Pass `token.isPro` to `session.user.isPro`

### 7. `src/types/next-auth.d.ts`

Extend `Session.user` with `isPro: boolean`.

### 8. `src/actions/items.ts`

In `createItem`, after auth check:

```typescript
const canCreate = await canCreateItem(session.user.id);
if (!canCreate) {
  return { success: false, error: "Free plan limited to 50 items. Upgrade to Pro for unlimited items." };
}
```

### 9. `src/actions/collections.ts`

In `createCollection`, after auth check:

```typescript
const canCreate = await canCreateCollection(session.user.id);
if (!canCreate) {
  return { success: false, error: "Free plan limited to 3 collections. Upgrade to Pro for unlimited collections." };
}
```

### 10. `src/app/api/upload/route.ts`

After auth check:

```typescript
const pro = await isUserPro(session.user.id);
if (!pro) {
  return new NextResponse("File uploads are a Pro feature", { status: 403 });
}
```

### 11. `src/app/(dashboard)/settings/page.tsx`

- Import `getSubscriptionStatus` and `SubscriptionSection`
- Call `getSubscriptionStatus()` in the page component
- Render `<SubscriptionSection isPro={...} stripeCustomerId={...} />` below existing settings

### 12. `src/components/dashboard/sidebar-sections.tsx`

- Accept `isPro` prop
- Hide the PRO badge on Files/Images when user is already Pro (no need to advertise upgrade)
- Show badge when user is free

## Key Gotchas

- Webhook signature verification requires the **raw** request body (`request.text()`) — do not parse JSON first
- Stripe Checkout redirects happen on the client via `window.location.href` — the API only returns the URL
- JWT callback runs on every token refresh (page navigation), so `isPro` syncs automatically after webhook updates the DB
- Use `stripe.webhooks.constructEvent(payload, signature, secret)` — not manual signature verification
- The `auth()` call in API routes must match the auth config from Phase 1

## Environment Variables (additional)

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing (requires Stripe CLI)

### Stripe CLI Setup

1. Install Stripe CLI: `winget install stripe` or follow [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward events: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Test Scenarios

1. **Free tier limits:**
   - Create items as a free user until hitting 50 — verify error response
   - Create collections as a free user until hitting 3 — verify error response

2. **Pro bypass:**
   - Manually set `isPro=true` in the database
   - Verify item/collection creation succeeds beyond limits
   - Verify file uploads succeed

3. **Checkout flow (Stripe test card `4242 4242 4242 4242`):**
   - Call `/api/stripe/create-checkout` with a Pro price ID
   - Verify it returns a Stripe Checkout URL
   - Complete payment with test card
   - Verify webhook fires and user's `isPro` is set to `true`

4. **Subscription management:**
   - Open billing portal via `/api/stripe/portal`
   - Cancel subscription in the portal
   - Verify `customer.subscription.deleted` webhook fires and `isPro` reverts to `false`

5. **Auth sync:**
   - After webhook updates DB, navigate to another page
   - Verify `session.user.isPro` reflects the new value

6. **File upload gating:**
   - Upload a file as a free user — expect 403
   - Upload a file as a Pro user — expect success

7. **Settings page:**
   - Visit `/settings` as a free user — see "Upgrade to Pro" card
   - Visit `/settings` as a Pro user — see "Pro Plan" card with "Manage Subscription"

8. **Sidebar badge:**
   - Free user sees PRO badges next to Files/Images
   - Pro user does not see PRO badges

9. **Landing page:**
   - Click the Pro CTA — redirects to `/settings?upgrade=true`

## References

- `@docs/stripe-integration-plan.md`
- Stripe webhooks: https://stripe.com/docs/webhooks
- Stripe Checkout: https://stripe.com/docs/payments/checkout
- Stripe Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal
- Stripe CLI: https://stripe.com/docs/stripe-cli
