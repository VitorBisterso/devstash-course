# Current Feature

## Status

Not Started

## Goals


## Notes



## History

- **2026-03-18**: Initial Next.js setup with Tailwind CSS v4, TypeScript, and App Router.
- **2026-03-18**: Started Dashboard UI Phase 1 implementation.
- **2026-03-18**: Completed Dashboard UI Phase 1 with ShadCN UI initialization, dark mode, dashboard route, top bar, and placeholder layout.
- **2026-03-18**: Completed Dashboard UI Phase 2 with collapsible sidebar, item types with links, favorite collections, recent items, user avatar, mobile drawer, DevStash logo in header, and colored type icons.
- **2026-03-19**: Completed Dashboard UI Phase 3 with stats cards, recent collections, pinned items, recent items and scrollable main area.
- **2026-03-19**: Started Prisma + Neon PostgreSQL setup.
- **2026-03-19**: Completed seed data script with demo user, system item types, collections, and sample items.
- **2026-03-19**: Completed Item-Collection N:N relationship migration with ItemCollection join table.
- **2026-03-19**: Completed Dashboard Collections - replaced dummy data with database collections, added item count, type icons, and dominant color borders.
- **2026-03-20**: Completed Dashboard Items - replaced dummy data with database items, added item type icons for pinned and recent items.
- **2026-03-20**: Completed Stats & Sidebar - replaced mock data with database data for stats, item types, favorite collections, and recent items. Added "View all collections" link. Added colored circles for recent items based on type color.
- **2026-03-24**: Completed Add Pro Badge to Sidebar - added PRO badge to Files and Images sidebar items using ShadCN UI Badge component with clean, subtle styling.
- **2026-03-24**: Completed N+1 Query Fix - optimized getRecentCollections and getCollectionsWithDetails to use raw SQL aggregation instead of loading all items, reducing memory usage and improving performance.
- **2026-03-24**: Completed High Priority Fixes - added DATABASE_URL validation in prisma.ts, removed empty AvatarImage in sidebar.tsx, created error.tsx and loading.tsx for dashboard server components.
- **2026-03-24**: Completed Code Deduplication - extracted typeIcons, typeIconsSmall, typeDisplayNames, typeOrder, getIconWithColor, and time constants (MINUTE_MS, HOUR_MS, DAY_MS) to src/lib/constants.tsx. Updated sidebar.tsx, recent-items.tsx, pinned-items.tsx, and recent-collections.tsx to use shared constants.
- **2026-03-27**: Completed Auth Setup - NextAuth + GitHub Provider with split auth config pattern for edge compatibility, JWT strategy, and route protection for /dashboard/\* routes.
- **2026-03-27**: Completed Auth Credentials - Email/Password Provider - added Credentials provider with bcrypt validation, registration API route at /api/auth/register.
- **2026-03-27**: Completed Auth UI - Sign In, Register & Sign Out - created custom sign-in and register pages with email/password and GitHub OAuth, reusable UserAvatar component with initials fallback, UserMenu dropdown in sidebar with profile and sign out options.
- **2026-03-27**: Completed Email Verification on Register - added Resend for sending verification emails, created verification token on registration, verify email API endpoint, verification page UI, updated sign-in to check email verification, and added resend verification flow.
- **2026-03-27**: Completed Email Verification Toggle - added SKIP_EMAIL_VERIFICATION env variable to bypass email verification during sign-in, registration, and resend verification flows.
- **2026-03-27**: Completed Forgot Password - added forgot password and reset password functionality with email reset links using existing VerificationToken model, created (auth) route group for auth pages.
- **2026-03-27**: Completed Profile Page - created profile page at /profile with user info (email, name, avatar, creation date), usage stats (total items, collections, item type breakdown), and account actions (change password for email users, delete account with confirmation). Protected route requiring authentication.
- **2026-03-27**: Completed Rate Limiting for Auth - added Upstash Redis rate limiting to auth endpoints (login, register, forgot-password, reset-password, resend-verification) with sliding window algorithm, IP extraction from x-forwarded-for, proper 429 responses with Retry-After headers, and fail-open behavior when Redis is unavailable.
- **2026-03-27**: Completed GitHub OAuth Redirect Fix - switched from client-side `signIn` to server-side `signIn` via Server Action, using `redirectTo` (NextAuth v5) for reliable single-click redirect to /dashboard.
- **2026-03-30**: Completed Items List View - created dynamic route `/items/[type]` with type-filtered items, responsive grid layout, and colored left border by item type.
- **2026-03-30**: Completed Demo User Mock - removed DEMO_USER_EMAIL constant, refactored all DB functions to accept userId parameter, added auth redirect to dashboard, and updated all page callers to pass session user ID.
- **2026-03-30**: Completed Items List View Three Columns - changed item listing grid from two columns to three columns on lg screens (1024px+) for better use of screen real estate.
- **2026-04-01**: Completed Item Drawer - added shadcn Sheet drawer that opens from right on item click, fetches full item details via API with skeleton loading state, action bar with Favorite, Pin, Copy, Edit, and Delete, client wrapper for server component compatibility, unit tests for getItemById.
- **2026-04-06**: Completed Item Drawer Edit Mode - added edit mode to item drawer with Save/Cancel buttons, editable fields (Title, Description, Tags, type-specific fields), Zod validation in server action, toast notifications, updateItem server action and query function, disconnect/connect-or-create tag handling, disabled Save button when title is empty, and router.refresh() after save.
- **2026-04-06**: Completed Delete Item Functionality - added shadcn UI AlertDialog confirmation dialog in item drawer, deleteItem database function, DELETE API endpoint, toast notifications on success/error, and unit tests for deleteItem.
- **2026-04-08**: Completed Item Create - added modal dialog from "New Item" button in top bar with shadcn Dialog component, type selector with proper labels, dynamic fields based on selected type (snippet/command: content+language, prompt/note: content, link: URL), server action createItem with Zod validation, query function in lib/db/items.ts, toast notifications, and unit tests.
