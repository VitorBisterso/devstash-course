# Item CRUD Architecture

Research findings for unified CRUD system across all 7 item types.

---

## 1. Overview

DevStash supports 7 built-in item types:
- `snippet` - Code snippets
- `prompt` - AI prompts
- `note` - Notes
- `command` - Terminal commands
- `file` - File uploads
- `image` - Images
- `link` - URLs/Links

---

## 2. Proposed File Structure

```
src/
├── app/
│   └── items/
│       └── [type]/
│           ├── page.tsx          # Dynamic route for each type
│           ├── loading.tsx       # Loading skeleton
│           └── error.tsx         # Error boundary
├── components/
│   └── items/
│       ├── item-card.tsx         # Shared card component
│       ├── item-form.tsx         # Shared form (adapts by type)
│       ├── item-editor.tsx      # Full editor
│       ├── item-list.tsx         # List/grid view
│       ├── type-badge.tsx        # Type indicator
│       └── delete-confirm.tsx    # Delete dialog
└── lib/
    ├── actions/
    │   └── items.ts              # All mutations (create, update, delete)
    └── db/
        └── items.ts              # Data fetching (already exists)
```

---

## 3. Data Fetching (`src/lib/db/items.ts`)

**Current state**: Already exists with these functions:
- `getPinnedItems()` - Returns pinned items
- `getRecentItems(limit)` - Returns recent items
- `getSystemItemTypes()` - Returns the 7 system types

**Proposed additions**:
- `getItemsByType(type: string)` - Fetch items for a specific type
- `getItemById(id: string)` - Single item fetch
- `searchItems(query: string)` - Full-text search
- `getItemsByCollection(collectionId: string)` - Items in a collection

All functions follow the pattern: call Prisma, return typed results, handle demo user.

---

## 4. Mutations (`src/lib/actions/items.ts`)

Single file for all CRUD operations:

```typescript
// Create
export async function createItem(data: CreateItemInput): Promise<Item>
export async function createSnippet(data: SnippetInput): Promise<Item>
export async function createPrompt(data: PromptInput): Promise<Item>
// ... other types

// Update
export async function updateItem(id: string, data: UpdateItemInput): Promise<Item>
export async function toggleFavorite(id: string): Promise<Item>
export async function togglePinned(id: string): Promise<Item>

// Delete
export async function deleteItem(id: string): Promise<void>
export async function deleteItems(ids: string[]): Promise<void>

// Bulk operations
export async function addTagsToItem(itemId: string, tagIds: string[]): Promise<Item>
export async function removeTagsFromItem(itemId: string, tagIds: string[]): Promise<Item>
export async function addToCollection(itemId: string, collectionId: string): Promise<void>
export async function removeFromCollection(itemId: string, collectionId: string): Promise<void>
```

**Input types** should be unified:
```typescript
type CreateItemInput = {
  title: string;
  type: ItemTypeName;           // 'snippet' | 'prompt' | etc.
  content?: string;
  url?: string;
  language?: string;
  description?: string;
  collectionIds?: string[];
  tagIds?: string[];
}
```

---

## 5. Routing (`/items/[type]`)

### Dynamic Route Structure

```
/items/snippet     → All snippets
/items/prompt      → All prompts
/items/note        → All notes
/items/command     → All commands
/items/file        → All files
/items/image       → All images
/items/link        → All links
```

### Page Implementation (`src/app/items/[type]/page.tsx`)

```typescript
type Props = {
  params: Promise<{ type: string }>;
};

export default async function ItemsByTypePage({ params }: Props) {
  const { type } = await params;
  
  // Validate type against allowed types
  if (!isValidItemType(type)) {
    notFound();
  }
  
  const items = await getItemsByType(type);
  const stats = await getItemsStatsByType(type);
  
  return (
    <ItemsView 
      type={type}
      items={items}
      stats={stats}
    />
  );
}
```

### Type Validation

Use constants to validate routes:
```typescript
// src/lib/constants.tsx
export const typeOrder = ["snippet", "prompt", "command", "note", "file", "image", "link"];
export const isValidItemType = (type: string): type is ItemTypeName => 
  typeOrder.includes(type);
```

---

## 6. Component Responsibilities

### `item-card.tsx`
- Displays item preview (title, type icon, excerpt)
- Shows favorite/pinned badges
- Quick actions (favorite, pin, delete)
- Click to open full editor

### `item-form.tsx`
- Unified form that adapts based on type
- Fields shown:
  - All types: title
  - text types (snippet, prompt, note, command): content (with syntax highlighting for snippet/command)
  - link: url, description
  - file/image: file upload, name
- Tag selector
- Collection selector

### `item-editor.tsx`
- Full-screen editing experience
- Type-specific editor:
  - snippet: Code editor with syntax highlighting
  - prompt: Text area with AI optimization button
  - note: Markdown editor
  - command: Terminal-style input
  - file/image: File upload dropzone
  - link: URL preview card

### `item-list.tsx`
- Grid/list toggle
- Sorting options (date, title, type)
- Filtering (favorites, pinned, tags)
- Infinite scroll or pagination
- Empty state by type

### `delete-confirm.tsx`
- Confirmation dialog
- Shows affected items count if bulk delete

---

## 7. Type-Specific Logic

Type-specific behavior lives in **components**, not actions:

| Type | Specific Component Logic |
|------|---------------------------|
| snippet | Language selector, syntax highlighting |
| prompt | AI optimization button |
| note | Markdown preview |
| command | Copy to clipboard button |
| file | File upload, download link |
| image | Thumbnail preview |
| link | Link preview card (favicon, OG image) |

This is achieved via:
```typescript
// In item-form.tsx
const renderTypeSpecificFields = (type: ItemTypeName) => {
  switch (type) {
    case 'snippet':
      return <LanguageSelector />;
    case 'command':
      return <CopyButton />;
    case 'link':
      return <UrlPreview />;
    // ...
  }
};
```

---

## 8. Key Design Decisions

1. **Single action file**: All mutations in `src/lib/actions/items.ts` for maintainability
2. **DB queries in lib/db**: Direct calls from server components, no API routes needed
3. **Dynamic route**: `/items/[type]` handles all 7 types with shared components
4. **Type-specific in components**: UI differences handled in component layer, not data layer
5. **Unified input types**: One `CreateItemInput` / `UpdateItemInput` type with optional fields

---

## 9. Migration Notes

Existing files to update:
- `src/lib/db/items.ts` - Add new query functions
- Create `src/lib/actions/items.ts` - New mutations file
- Create `src/app/items/[type]/` directory structure
- Move/update components from `src/components/dashboard/` to `src/components/items/`

---

## 10. Related Files

- Prisma schema: `prisma/schema.prisma`
- Type constants: `src/lib/constants.tsx`
- Existing DB: `src/lib/db/items.ts`, `src/lib/db/collections.ts`
- Components: `src/components/dashboard/recent-items.tsx`, `src/components/dashboard/pinned-items.tsx`
