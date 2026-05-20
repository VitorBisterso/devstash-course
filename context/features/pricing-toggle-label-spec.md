# Pricing Toggle Label Improvement

## Overview

The pricing toggle on the homepage switches between Monthly and Yearly plans, but the toggle button lacks a visible accessible label. It has `aria-label="Toggle pricing"` (good for screen readers) but sighted users don't get a clear visual hint that the toggle's state controls the prices below it. Improve the visual labeling and affordance.

## Requirements

- Make the toggle's purpose and state more visually apparent
- Replace the custom `<button>` toggle with ShadCN's `Switch` component for consistency with the rest of the app
- Ensure the active pricing period label (Monthly/Yearly) has clear visual distinction (current: `text-foreground` vs `text-muted-foreground` — could be stronger)
- Add `aria-checked` / `role="switch"` for proper ARIA semantics (automatically handled by ShadCN Switch)
- Keep the "Save 25%" badge visible when Yearly is selected
- Maintain the same layout and visual style
- Keep the pricing toggle accessible via keyboard

## Current Implementation

- `src/components/landing/pricing-toggle.tsx` uses a raw `<button>` with manual styling
- Labels toggle between `text-foreground` and `text-muted-foreground`
- Toggle has `aria-label="Toggle pricing"`

## Proposed Changes

- Replace the custom toggle `<button>` with ShadCN's `<Switch />` component
- Import from `@/components/ui/switch`
- Add a visible label or tooltip that explains the toggle controls pricing
- Optionally add CSS transition to the price text when switching for better feedback

## References

- `src/components/landing/pricing-toggle.tsx`
- `src/components/ui/switch` (should exist or need to be added via shadcn)
- Homepage pricing section layout
