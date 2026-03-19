# Prisma + Neon PostgreSQL Setup

Set up Prisma ORM with Neon PostgreSQL database for DevStash.

## Status

In Progress

## Goals

- Install Prisma 7 with PostgreSQL adapter for Neon
- Create initial schema with User, Item, ItemType, Collection, Tag, ItemTag models
- Add NextAuth models (Account, Session, VerificationToken)
- Add indexes and cascade deletes
- Configure Prisma client singleton with driver adapter
- Create and run initial migration

## Notes

- Prisma 7 requires ESM and driver adapters
- Use `prisma migrate dev` (never `db push`)
- Run `prisma migrate status` before committing
- Neon uses serverless PostgreSQL with connection pooling

We will have a development branch that we work on that will be in DATABASE_URL and then we will have a production branch. So we ALWAYS create migrations and never push directly unless specified.

IMPORTANT! Use Prisma 7, which has some breaking changes. Read the entire upgrade guide at https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7 to get a good idea of the changes.

You can also look at the setup guide here - https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

## History

- **2026-03-18**: Initial Next.js setup with Tailwind CSS v4, TypeScript, and App Router.
- **2026-03-18**: Started Dashboard UI Phase 1 implementation.
- **2026-03-18**: Completed Dashboard UI Phase 1 with ShadCN UI initialization, dark mode, dashboard route, top bar, and placeholder layout.
- **2026-03-18**: Completed Dashboard UI Phase 2 with collapsible sidebar, item types with links, favorite collections, recent items, user avatar, mobile drawer, DevStash logo in header, and colored type icons.
- **2026-03-19**: Completed Dashboard UI Phase 3 with stats cards, recent collections, pinned items, recent items and scrollable main area.
- **2026-03-19**: Started Prisma + Neon PostgreSQL setup.
