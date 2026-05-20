# Date Format Standardization

## Overview

Dates are displayed in three different formats across the app: `04/05/2026`, `May 18, 2026`, and `2d ago`. This inconsistency creates visual noise and makes the UI feel less polished. Standardize to a single approach: relative for recent dates, absolute for older dates.

## Requirements

- Create a shared `formatDate` utility at `src/lib/format.ts`
- Use consistent formatting across all components:
  - Items updated within the last 7 days → relative: `"2d ago"`, `"5h ago"`, `"just now"`
  - Items updated 7+ days ago → absolute: `"May 18, 2026"` (format: "MMM DD, YYYY")
- Remove the multiple inline date formatting functions

## Current Inconsistent Formats

| Component | File | Current Format |
|-----------|------|----------------|
| Recent Items | `recent-items.tsx:9-21` | Relative (`2d ago`) + `toLocaleDateString()` fallback |
| Dashboard Items Grid | `dashboard-items-grid.tsx:80` | `toLocaleDateString()` (varies by locale) |
| Favorites List | `favorites-list.tsx:19-20` | `toLocaleDateString("en-US", ...)` → "May 18, 2026" |
| File List View | `file-list-view.tsx:25-26` | `toLocaleDateString("en-US", ...)` → same format |
| Profile/Settings | `page.tsx` | `toLocaleDateString()` (varies by locale) |

## Implementation

```typescript
// src/lib/format.ts — add to existing file
export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
```

- Reuse the existing `MINUTE_MS`, `HOUR_MS`, `DAY_MS` constants from `src/lib/constants.tsx`
- Remove the local `formatRelativeTime` in `recent-items.tsx`
- Replace inline `toLocaleDateString` calls in other components

## References

- `src/lib/format.ts` (existing, currently only has `formatFileSize`)
- `src/lib/constants.tsx` (MINUTE_MS, HOUR_MS, DAY_MS constants)
- `src/components/dashboard/recent-items.tsx`
- `src/components/dashboard/dashboard-items-grid.tsx`
- `src/components/dashboard/favorites-list.tsx`
- `src/components/dashboard/file-list-view.tsx`
