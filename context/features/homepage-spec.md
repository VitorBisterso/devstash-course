# Homepage (Marketing Landing Page)

## Overview

Implement the homepage mockup from `prototypes/homepage/` as the app's marketing landing page at the root route `/`. Unauthenticated users see this page; authenticated users should be redirected to `/dashboard`.

## Requirements

- Route: `src/app/page.tsx` (root, replaces any existing index page)
- Navbar links (Features, Pricing) scroll to sections via anchor `/#features`, `/#pricing`
- Sign In -> `/auth/signin`, "Get Started" buttons -> `/auth/register`
- Logo -> `/` (or redirect to `/dashboard` if authenticated)
- Footer copyright: dynamic current year
- All sections from the prototype: Hero, Features, AI, Pricing, CTA, Footer

## Component Architecture

**Server Components** (default, no `'use client'`):
- `src/app/page.tsx` - Assembles all sections
- `src/components/landing/hero-section.tsx` - Hero text + visual layout
- `src/components/landing/features-section.tsx` - 6 feature cards grid
- `src/components/landing/ai-section.tsx` - AI features checklist + code mockup
- `src/components/landing/pricing-section.tsx` - Free/Pro cards (static)
- `src/components/landing/cta-section.tsx` - Final call-to-action
- `src/components/landing/footer.tsx` - Footer with links and copyright

**Client Components** (`'use client'`):
- `src/components/landing/navbar.tsx` - Scroll-opacity effect, mobile hamburger toggle
- `src/components/landing/chaos-box.tsx` - Animated floating icons (requestAnimationFrame, mouse repel)
- `src/components/landing/pricing-toggle.tsx` - Monthly/yearly toggle with price switching
- `src/components/landing/fade-in-wrapper.tsx` - IntersectionObserver wrapper for scroll-triggered animations

## Styling

- Use Tailwind v4 exclusively (no CSS modules or inline styles)
- ShadCN `Button` component for all CTAs (variants: `default`, `outline`, `ghost`)
- ShadCN `Badge` for "PRO" and "Most Popular" tags
- Item type accent colors mapped from `src/lib/constants.tsx` (via Tailwind classes):
  - Snippet: `#3b82f6`, Prompt: `#f59e0b`, Command: `#06b6d4`
  - Note: `#22c55e`, File: `#64748b`, Image: `#ec4899`, Link: `#6366f1`
- Dark theme matching the rest of the app (`bg-background`, `text-foreground`, etc.)
- Feature cards and pricing cards use ShadCN `Card` component
- Code mockup in AI section is a presentational component (no Monaco) styled with Tailwind

## Chaos Box Animation

- Client-side only: floating icons using `useEffect` + `requestAnimationFrame`
- Icons drift, bounce off walls, repel from mouse cursor
- 8 icons: Notion, GitHub, Slack, VS Code, Browser tabs, Terminal, Text file, Bookmark
- Use inline SVGs for icon shapes (no icon library needed)

## Responsive

- Mobile: stack hero visual vertically, arrow rotates 90deg, single column grids
- Navbar hides text links on mobile, shows hamburger menu
- Standard breakpoints matching the rest of the app

## Key Gotchas

- `page.tsx` must check auth session and redirect authenticated users to `/dashboard` using `redirect()`
- Navbar uses `position: fixed` with `backdrop-filter: blur` — wrap in client component
- Pricing toggle needs client state — extract to client component, keep card content as server children where possible
- Fade-in scroll animations use IntersectionObserver — extract into a reusable client wrapper
- Import type color constants from `src/lib/constants.tsx` for consistency
- Use `next/link` for all navigation links, `next/navigation` for redirects
