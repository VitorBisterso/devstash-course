# Mobile Tap Target Sizing

## Overview

78% of interactive elements on the dashboard are under 44px in at least one dimension, failing WCAG 2.5.5 Target Size recommendations. On mobile (375px viewport), small interactive targets hurt usability. Increase tap target sizes while preserving the dense, developer-friendly aesthetic.

## Requirements

- Meet WCAG 2.5.5 minimum target size of 44x44 CSS pixels on touch devices
- Use responsive approach — desktop can stay compact, mobile gets larger targets

### Priority targets (under 44px):

**Sidebar links** (`sidebar-sections.tsx`):
- Item type links (currently ~36px height) → increase to min 44px on mobile via `min-h-[44px]` with `md:min-h-0`
- Collection links → same treatment

**Search button** (`dashboard-shell.tsx`):
- Search bar in header (currently ~36px) → increase touch area to 44px on mobile

**Header action buttons** (`dashboard-shell.tsx`):
- "New" and "Collection" buttons → min 44px on mobile

**Favorites link** (`dashboard-shell.tsx`):
- Star icon button → min 44x44 on mobile

**Item cards** (`dashboard-items-grid.tsx`):
- Card padding/height — ensure touch targets within cards are 44px

**Recent / Pinned items** (`recent-items.tsx`, `pinned-items.tsx`):
- List item rows → ensure min 44px touch area

**Copy buttons** (`dashboard-items-grid.tsx`):
- Copy icon button on item cards (currently 30px) → increase to 44px on mobile

**Collection cards** (`collection-card.tsx`):
- Card interactive area → ensure min 44px on mobile

## Approach

- Add responsive classes: `min-h-[44px] md:min-h-0` or `min-w-[44px] md:min-w-0`
- Where layout constraints prevent 44px, use `p-2` or larger clickable area via `before:` pseudo-element
- Focus on mobile-first: small screens get larger targets

## Verification

- Test all interactive elements on 375px viewport
- Each clickable element should have a bounding box ≥ 44x44px
- Use `document.querySelectorAll('a, button, [role="button"]')` to measure

## References

- `src/components/dashboard/sidebar-sections.tsx`
- `src/components/dashboard/dashboard-shell.tsx`
- `src/components/dashboard/dashboard-items-grid.tsx`
- `src/components/dashboard/recent-items.tsx`
- `src/components/dashboard/pinned-items.tsx`
- `src/components/dashboard/collection-card.tsx`
- WCAG 2.5.5 Target Size
