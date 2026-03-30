# Item Types

DevStash supports 7 built-in system item types for organizing developer knowledge.

## System Item Types

| Type | Icon | Color | Purpose |
|------|------|-------|---------|
| Snippet | Code2 (Code) | #3b82f6 (Blue) | Code snippets with syntax highlighting |
| Prompt | Bot (Sparkles) | #8b5cf6 (Purple) | AI prompts and templates |
| Command | Terminal | #f97316 (Orange) | Terminal commands and shell scripts |
| Note | FileText (StickyNote) | #fde047 (Yellow) | General notes and documentation |
| File | FileCode | #6b7280 (Gray) | File uploads (docs, templates) |
| Image | Image | #ec4899 (Pink) | Image uploads and screenshots |
| Link | Link2 | #10b981 (Green) | URLs and bookmarks |

## Classification by Content Type

### Text Types
- **snippet**: Code with optional language for syntax highlighting
- **prompt**: AI prompts/templates for LLM interactions
- **note**: General text content, markdown-supported
- **command**: Shell commands, scripts with optional description

**Key field**: `content` (String, optional, db.Text)

### File Types
- **file**: Document uploads, code templates
- **image**: Visual resources, screenshots

**Key fields**:
- `fileUrl` (String) - Cloud storage URL
- `fileName` (String) - Original filename
- `fileSize` (Int) - Size in bytes

### URL Type
- **link**: Web bookmarks and references

**Key field**: `url` (String)

## Shared Properties

All item types share these common fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (cuid) | Unique identifier |
| `title` | String | Item title |
| `description` | String? | Optional description |
| `contentType` | String | "text" (default) |
| `isFavorite` | Boolean | Favorite flag (default: false) |
| `isPinned` | Boolean | Pin status (default: false) |
| `language` | String? | Syntax highlighting language |
| `userId` | String | Owner user reference |
| `typeId` | String | ItemType reference |
| `tags` | ItemTag[] | Associated tags |
| `collections` | ItemCollection[] | Collection memberships |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last modification |

## Display Differences

### UI Icons
- `src/lib/constants.tsx` exports `typeIcons` (h-4 w-4) and `typeIconsSmall` (h-3 w-3)
- Icons rendered using Lucide React: Code2, Bot, FileText, Terminal, FileCode, Image, Link2

### Display Names
- Pluralized labels: "Snippets", "Prompts", "Commands", "Notes", "Files", "Images", "Links"

### Rendering by Type
- **snippet**: Code block with syntax highlighting
- **prompt**: Text with "Sparkles" indicator for AI
- **note**: Markdown-rendered content
- **command**: Monospace with copy button
- **file**: File icon with filename and size
- **image**: Thumbnail preview
- **link**: URL preview with favicon

## Data Model

```
ItemType (system types)
├── id: String
├── name: String (unique per user)
├── icon: String?
├── color: String? (hex)
└── isSystem: Boolean

Item
├── id: String
├── title: String
├── content: String? (text types)
├── contentType: String (default: "text")
├── fileUrl: String? (file/image types)
├── fileName: String? (file/image types)
├── fileSize: Int? (file/image types)
├── url: String? (link type)
├── description: String?
├── isFavorite: Boolean
├── isPinned: Boolean
├── language: String?
├── typeId: String → ItemType
├── userId: String → User
└── collections/tags/createdAt/updatedAt
```

## Custom Types

Pro users can create custom item types beyond the 7 system types. Custom types:
- Set custom name, icon, and color
- Inherit all standard Item fields
- Support both text and file content modes

## Seed Data Reference

System types are seeded in `prisma/seed.ts`:
- snippet: Code, #3b82f6
- prompt: Sparkles, #8b5cf6
- command: Terminal, #f97316
- note: StickyNote, #fde047
- file: File, #6b7280
- image: Image, #ec4899
- link: Link, #10b981
