# Hydration Mismatch Error Fix

## Overview

A React hydration mismatch error occurs on all authenticated pages. The server and client generate different `id` attributes on base-ui components (SheetTrigger, DropdownMenuTrigger). This causes a console error and may cause UI flicker or unexpected re-renders.

## Requirements

- Fix the hydration mismatch in the DashboardShell component tree
- Two approaches (pick one):
  - **A:** Replace `SheetTrigger` and `DropdownMenuTrigger` from base-ui with shadcn's `Sheet.Trigger` and `DropdownMenu.Trigger` wrappers (if available) that handle SSR consistently
  - **B:** Add `suppressHydrationWarning` on the specific elements as a fallback, OR pre-generate deterministic IDs on the server using a custom ID provider
- Verify no hydration errors in console on any authenticated page

## Affected Components

- `src/components/dashboard/dashboard-shell.tsx` — Contains `SheetTrigger` (mobile sidebar) and `DropdownMenu` (user menu)
- `src/components/dashboard/sidebar.tsx` — Contains `DropdownMenuTrigger`
- `src/components/dashboard/user-menu.tsx` — Contains `DropdownMenuTrigger`

## Verification

- Load `/dashboard`, `/items/snippet`, `/favorites`, `/collections` and confirm no hydration warnings in browser console
- Test with empty cache / hard reload to ensure SSR snapshot matches client

## References

- `src/components/dashboard/dashboard-shell.tsx`
- `src/components/dashboard/sidebar.tsx`
- `src/components/dashboard/user-menu.tsx`
- https://react.dev/link/hydration-mismatch
