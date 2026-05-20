# SVG Icon Accessibility (Aria-Labels)

## Overview

All SVG icons (63 on the dashboard) rendered via lucide-react lack `aria-label` or `<title>` elements. Screen readers cannot identify these icons, making the interface less accessible. Interactive icons (buttons, links) are the highest priority; decorative icons should be hidden from assistive technology.

## Requirements

- Add `aria-label` to all **interactive** SVG icons that serve as the sole label for a control:
  - Sidebar collapse/expand toggle button
  - Search button in header
  - Favorites link icon
  - "New" button icon
  - User menu trigger icon
  - Copy content buttons on item cards
  - Favorites list sort buttons
- Add `aria-label` or `aria-labelledby` to **informative** icons that convey meaning:
  - Item type icons in sidebar (Snippets, Prompts, etc.)
  - Favorite collection star icons
  - Pin icons on pinned items
  - Stats card icons (Total Items, Collections, etc.)
- Set `aria-hidden="true"` on purely **decorative** SVGs (no semantic meaning):
  - Icons that appear alongside visible text labels (e.g., heading icons like Clock, Star, Pin in section headers with visible text)
- Update the `getIconWithColor` utility if needed to propagate aria attributes

## Technical Approach

- For lucide-react icons: wrap in `<span>` with `aria-hidden` or add `aria-label` via props
- For icon-only buttons: the parent `<button>` or `<a>` element should already have `aria-label`; the SVG inside should have `aria-hidden="true"`
- Add a `label` prop option to icon rendering utilities

## Verification

- Use a screen reader (e.g., VoiceOver, NVDA) to tab through the dashboard sidebar
- Confirm all interactive elements are announced with their purpose
- Confirm decorative icons are skipped

## References

- `src/lib/constants.tsx` (typeIcons, typeIconsSmall, getIconWithColor)
- `src/components/dashboard/sidebar-sections.tsx` (sidebar item icons)
- `src/components/dashboard/dashboard-shell.tsx` (header icons)
- `src/components/dashboard/dashboard-items-grid.tsx` (item card icons)
- `src/components/dashboard/stats-cards.tsx` (stat icons)
- WCAG 2.1 — Non-text Content (1.1.1)
