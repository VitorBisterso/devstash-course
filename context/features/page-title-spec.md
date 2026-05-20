# Page Title & Metadata

## Overview

All pages currently use the default "Create Next App" title from `create-next-app`. Update every page to have a descriptive, unique title and appropriate metadata for SEO and tab identification.

## Requirements

- Update root layout metadata in `src/app/layout.tsx` to `"DevStash"` (base title)
- Add per-page metadata using Next.js `generateMetadata` or `metadata` export:
  - `/` (homepage) → "DevStash — Your Developer Knowledge Hub"
  - `/dashboard` → "Dashboard — DevStash"
  - `/sign-in` → "Sign In — DevStash"
  - `/register` → "Create Account — DevStash"
  - `/favorites` → "Favorites — DevStash"
  - `/collections` → "Collections — DevStash"
  - `/collections/[id]` → dynamic: `"${name} — DevStash"`
  - `/items/[type]` → dynamic: `"${typeDisplayName} — DevStash"`
  - `/settings` → "Settings — DevStash"
  - `/profile` → "Profile — DevStash"
  - `/forgot-password` → "Reset Password — DevStash"
- Use `title.template` in root layout so child pages only need to set `title`
- Add `description` metadata for each page (concise, unique)
- Update `openGraph` and `twitter` metadata on the homepage for social sharing

## References

- `src/app/layout.tsx` (root metadata)
- `src/app/page.tsx`
- Next.js Metadata API
