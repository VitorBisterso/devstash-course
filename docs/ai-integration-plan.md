# AI Integration Plan: GPT-5 Nano in DevStash

## Overview

Integrate OpenAI's **GPT-5 Nano** model to power four AI features: auto-tagging content, AI-generated summaries, code explanation, and prompt optimization. GPT-5 Nano is OpenAI's fastest, cheapest GPT-5 variant at **$0.05/1M input tokens** and **$0.40/1M output tokens**, with a **400K context window** and **128K max output tokens**. It supports streaming, function calling, structured outputs, and prompt caching.

---

## 1. OpenAI SDK Setup & Configuration

### Installation

```bash
npm install openai
```

### Client Initialization

Create `src/lib/openai.ts` as a singleton — never instantiate on the client:

```ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
```

### Environment Variable

Already present in `.env.example`:

```env
OPENAI_API_KEY=""
```

---

## 2. Server Action Patterns for AI Calls

Create `src/actions/ai.ts` following the existing server action patterns in `src/actions/items.ts` and `src/actions/collections.ts`:

| Pattern | Existing Example | AI Equivalent |
|---|---|---|
| Auth guard | `if (!session?.user?.id) return { success: false, error: "Unauthorized" }` | Same |
| Pro gating | `canCreateItem(session.user.id)` | `isUserPro(session.user.id)` |
| Zod validation | `createItemSchema.safeParse(data)` | Validate itemId + options |
| Try/catch | `try { ... } catch (error) { console.error(...); }` | Same + OpenAI error types |
| Result type | `{ success, data?, error?, fieldErrors? }` | `{ success, data?, error? }` |

### Proposed AI Actions

```ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { isUserPro } from "@/lib/limits";
import openai from "@/lib/openai";

// --- Auto-tagging ---
export async function generateTags(itemId: string): Promise<...>

// --- AI Summary ---
export async function generateSummary(itemId: string): Promise<...>

// --- Code Explanation ---
export async function explainCode(itemId: string): Promise<...>

// --- Prompt Optimization ---
export async function optimizePrompt(itemId: string): Promise<...>
```

---

## 3. Streaming vs Non-Streaming Responses

| Feature | Approach | Why |
|---|---|---|
| **Auto-tagging** | Non-streaming (`chat.completions.create`) | Short JSON output; structured output via `response_format` |
| **AI Summary** | Non-streaming | Concise text returned once; store alongside item |
| **Code Explanation** | Streaming (`stream: true`) | Long output; progressive UI rendering improves UX |
| **Prompt Optimization** | Non-streaming | Structured suggestions with before/after comparison |

### Non-Streaming Pattern (Auto-Tagging / Summary / Prompt Optimization)

```ts
const completion = await openai.chat.completions.create({
  model: "gpt-5-nano",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ],
  response_format: { type: "json_object" }, // for tagging
  temperature: 0.1, // low for deterministic tagging
});

const result = JSON.parse(completion.choices[0].message.content!);
```

### Streaming Pattern (Code Explanation)

Use Next.js route handler with streaming response, returning `ReadableStream` via `text/event-stream` headers:

```ts
// app/api/ai/explain/route.ts
const completion = await openai.chat.completions.create({
  model: "gpt-5-nano",
  messages: [...],
  stream: true,
});

const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of completion) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) controller.enqueue(new TextEncoder().encode(text));
    }
    controller.close();
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

---

## 4. Error Handling & Rate Limiting

### OpenAI SDK Error Types

Use the built-in error classes (from Context7 docs + OpenAI docs):

```ts
import OpenAI from "openai";

try {
  // ...
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    // 401, 403, 429, 500, etc.
    console.error("OpenAI API error:", error.status, error.message);
  } else if (error instanceof OpenAI.APIConnectionError) {
    // Network issue
    console.error("Connection error:", error.message);
  } else if (error instanceof OpenAI.RateLimitError) {
    // 429 — implement exponential backoff
    console.error("Rate limited:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
  return { success: false, error: "AI service temporarily unavailable" };
}
```

### Application-Level Rate Limiting

Reuse the existing `@upstash/ratelimit` pattern from `src/lib/rate-limit.ts`:

```ts
export const aiRatelimits = {
  tags: createRateLimiter(50, 3600, "ratelimit:ai:tags"),    // 50/hr per user
  summary: createRateLimiter(30, 3600, "ratelimit:ai:summary"),
  explain: createRateLimiter(20, 3600, "ratelimit:ai:explain"),
  optimize: createRateLimiter(20, 3600, "ratelimit:ai:optimize"),
};
```

---

## 5. Pro User Gating Patterns

Follow the existing `src/lib/limits.ts` pattern. Currently "AI features" is already listed as a Pro feature in:

- `src/components/landing/ai-section.tsx` — marketing page with AI checklist
- `src/components/upgrade/upgrade-content.tsx` — `PRO_FEATURES` includes "AI features"
- `src/components/landing/pricing-toggle.tsx` — same

### Implementation

```ts
export async function canUseAI(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });
  return user?.isPro ?? false;
}
```

Guard every AI action:

```ts
if (!(await canUseAI(session.user.id))) {
  return { success: false, error: "AI features require a Pro subscription" };
}
```

---

## 6. Cost Optimization Strategies

### GPT-5 Nano Pricing

| Metric | Cost |
|---|---|
| Input tokens | $0.05 / 1M |
| Cached input tokens | $0.005 / 1M (90% discount) |
| Output tokens | $0.40 / 1M |
| Batch API (50% off) | $0.025 / 1M input, $0.20 / 1M output |

### Estimated Per-Request Costs

| Feature | Avg Input Tokens | Avg Output Tokens | Cost/Request |
|---|---|---|---|
| Auto-tagging | ~500 (content + system prompt) | ~50 (JSON tags) | ~$0.000045 |
| AI Summary | ~1,000 | ~150 | ~$0.00011 |
| Code Explanation | ~1,500 | ~500 | ~$0.000275 |
| Prompt Optimization | ~800 | ~300 | ~$0.00016 |

**Monthly estimate** for 1,000 requests/feature = ~$0.59/month total.

### Optimization Tactics

1. **Prompt caching**: Cache system prompts (90% discount on repeated input). System prompts for tagging, summary, etc. are identical per call.
2. **Batch API**: Queue non-urgent requests (auto-tagging after creation) for 50% discount.
3. **Temperature tuning**: Use `temperature: 0.1` for deterministic tasks (tagging, classification); avoids retries.
4. **Token limits**: Set `max_tokens` explicitly per feature to prevent runaway output.
5. **Caching**: Store AI-generated tags/summaries in the database; only regenerate on content change.

---

## 7. UI Patterns for AI Features

### Loading States

Follow the existing `ItemDrawerLoading` skeleton pattern from `src/components/dashboard/item-drawer-header.tsx`:

- Auto-tagging: Button with spinner "Generating tags..."
- Summary: Collapsible section with shimmer placeholder
- Code explanation: Inline badge with streaming text reveal

### Accept/Reject Suggestions

For auto-tagging, use inline tag badges with confirmation:

```
[suggestion: api] [suggestion: async] [suggestion: data-fetching]
          ✓                ✓                ✗
```

User clicks checkmark to accept (adds tag to item) or X to dismiss.

### UI Placement

| Feature | UI Location |
|---|---|
| Auto-tagging | Item drawer tags section + create item modal |
| AI Summary | Item drawer description area, collapsible |
| Code Explanation | Code editor toolbar → overlay/badge |
| Prompt Optimization | Edit item modal → "Optimize" button next to content field |

### Existing Component Patterns to Follow

- `src/components/dashboard/item-drawer.tsx` — Sheet drawer patterns, loading/error states
- `src/components/dashboard/item-drawer-content.tsx` — Tags display, TypeMeta, content rendering
- `src/components/ui/skeleton.tsx` — Loading shimmer component

---

## 8. Security Considerations

### API Key Handling

- `OPENAI_API_KEY` is already in `.env.example` — keep it server-side only
- Initialize OpenAI client server-side (`src/lib/openai.ts`)
- Never pass API key to client components or expose in API responses

### Input Sanitization

- Limit content length sent to API (e.g., truncate to 50K tokens for GPT-5 Nano's 400K context)
- Strip sensitive data (passwords, tokens) before sending user content
- Validate content is non-empty and of expected type before making API call

### Content Moderation

- Consider using OpenAI's Moderation API for user-submitted content before AI processing
- Rate limit per user to prevent abuse (use existing Upstash Redis rate limiter)

### Logging

- Log error types and request IDs without logging actual prompts/responses or tokens
- Follow existing `console.error("Failed to ...:", error)` pattern

### Data Privacy

- User content sent to OpenAI should be clearly communicated in UI/privacy policy
- Consider setting `store: false` on Chat Completions API calls to opt out of OpenAI training data usage

---

## Architecture Diagram

```
Client Component                 Server Action / Route           OpenAI
─────────────────               ─────────────────────           ──────
[Item Drawer] ──► generateTags() ──► auth + pro check
                  (server action)    ├── rate limit check
                                     ├── call OpenAI API ──► GPT-5 Nano
                                     ├── store result in DB
                                     └── return tags ──► [UI shows tags]

[Code Editor] ──► /api/ai/explain ──► auth + pro check
                  (route handler)    ├── rate limit check
                                     ├── stream OpenAI ──► GPT-5 Nano
                                     └── SSE stream ──► [Streaming text]
```

## Key Files to Create/Modify

| File | Purpose |
|---|---|
| `src/lib/openai.ts` | OpenAI client singleton |
| `src/actions/ai.ts` | Server actions for AI features |
| `src/lib/limits.ts` | Add `canUseAI()` function |
| `src/lib/rate-limit.ts` | Add `aiRatelimits` |
| `src/app/api/ai/explain/route.ts` | Streaming endpoint for code explanation |
| `prisma/schema.prisma` | Add `summary`, `aiTags` to Item model (optional) |
| `.env.example` | Already has `OPENAI_API_KEY` — verify documentation |

## References

- **OpenAI GPT-5 Nano docs**: https://platform.openai.com/docs/models/gpt-5-nano
- **OpenAI SDK (JS/TS)**: https://www.npmjs.com/package/openai
- **Existing server actions**: `src/actions/items.ts`, `src/actions/collections.ts`
- **Pro gating**: `src/lib/limits.ts`
- **Rate limiting**: `src/lib/rate-limit.ts`
- **AI marketing copy**: `src/components/landing/ai-section.tsx`
- **Item drawer UI**: `src/components/dashboard/item-drawer.tsx`
