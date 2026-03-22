---
name: orchestrai-backend
description: >
  Backend skill for OrchestrAI — covers all server-side code under
  frontend/app/api/, backend/api-layer-complete/, supabase/, and any
  Next.js Route Handler or server utility. Use this skill for EVERY
  backend task: writing API routes, Supabase queries, Groq streaming,
  auth middleware, RLS policies, schema changes, server actions,
  edge functions, cron jobs, or any file that runs on the server.
  Also use this skill when debugging 500 errors, CORS issues,
  streaming failures, or database query problems. Never write backend
  code for this project without reading this skill first.
---

# OrchestrAI — Backend & API Skill

> **For weak/free models:** Read every section before touching any file.
> Do not skip sections. Do not guess at patterns — this document contains
> the exact patterns to use. Copy them precisely and adapt only what the
> task requires. Deviation from these patterns introduces bugs.

---

## 0. Mental Model — How the Backend Works

```
Browser (React Client)
        │
        │  fetch('/api/...')
        ▼
Next.js Route Handler  ←── ONLY entry point for all server logic
        │
        ├── Auth check (Supabase JWT)
        ├── Input validation (Zod)
        ├── Business logic
        │       ├── Groq AI calls  (streaming)
        │       ├── Supabase DB    (data)
        │       └── agents-data    (static catalog)
        └── Response  (JSON or ReadableStream)
```

**Key rules:**
- All server logic lives in `app/api/*/route.ts` files
- No business logic in React components — components call API routes
- No Groq or Supabase service keys in client-side code, ever
- Every route is auth-protected unless it is explicitly a public endpoint

---

## 1. File Locations

```
frontend/
└── app/
    └── api/
        ├── chat/
        │   └── route.ts          ← Groq streaming chat
        ├── agents/
        │   └── route.ts          ← Agent CRUD (enable/disable)
        ├── tasks/
        │   └── route.ts          ← Task management
        ├── brief/
        │   └── route.ts          ← AI daily briefing generation
        └── auth/
            └── [...supabase]/
                └── route.ts      ← Supabase Auth callback

backend/
└── api-layer-complete/           ← Standalone API server (if used separately)
    ├── routes/
    ├── middleware/
    └── index.ts

supabase/
└── schema.sql                    ← Single source of truth for DB schema
```

---

## 2. Route Handler Template — Use This Every Time

Every new route MUST follow this exact structure. Do not improvise.

```typescript
// app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

// ── 1. Input schema (Zod) ────────────────────────────────────────────
const RequestSchema = z.object({
  // define ALL expected fields here
});

// ── 2. Response types ────────────────────────────────────────────────
interface SuccessResponse<T> {
  data: T;
  error: null;
}
interface ErrorResponse {
  data: null;
  error: string;
  code: string;
}

// ── 3. Auth helper ───────────────────────────────────────────────────
async function getAuthenticatedUser(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return { user: null, supabase };
  return { user: session.user, supabase };
}

// ── 4. Handler ───────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Step 1: Auth
    const { user, supabase } = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { data: null, error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Step 2: Parse & validate input
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ErrorResponse>(
        { data: null, error: parsed.error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Step 3: Business logic
    // ... your logic here ...

    // Step 4: Return
    return NextResponse.json<SuccessResponse<typeof result>>(
      { data: result, error: null },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API /resource]', error);
    return NextResponse.json<ErrorResponse>(
      { data: null, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

**Allowed HTTP methods and when to use them:**
- `GET` — read data, no body
- `POST` — create data or trigger an action
- `PATCH` — partial update
- `DELETE` — remove a resource

Export ONLY the methods the route actually uses. Never export unused methods.

---

## 3. Groq Streaming — Canonical Pattern

The chat route is the core of OrchestrAI. This pattern is FINAL — do not alter the streaming protocol without updating the client consumer (`CommandInput` component) in the same commit.

```typescript
// app/api/chat/route.ts
import Groq from 'groq-sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAgentById } from '@/lib/agents-data';
import { z } from 'zod';

export const runtime = 'edge';  // REQUIRED — do not remove

const ChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(32000),
  })).min(1).max(50),
  agentId: z.string().min(1),
  domainId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
    // NOTE: return plain Response (not NextResponse) in edge runtime
  }

  // ── Validate ──────────────────────────────────────────────────────
  let body: z.infer<typeof ChatSchema>;
  try {
    const raw = await request.json();
    body = ChatSchema.parse(raw);
  } catch {
    return new Response('Invalid request body', { status: 400 });
  }

  // ── Load agent ────────────────────────────────────────────────────
  const agent = getAgentById(body.agentId);
  if (!agent) {
    return new Response('Agent not found', { status: 404 });
  }

  // ── Rate limit check (simple — expand with Redis if needed) ───────
  // Check message count in last 60s from this user in Supabase
  // If > 20 messages/min, return 429

  // ── Build messages ────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(agent, session.user);
  const groqMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...body.messages,
  ];

  // ── Groq call ─────────────────────────────────────────────────────
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  let groqStream: AsyncIterable<Groq.Chat.ChatCompletionChunk>;
  try {
    groqStream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
    });
  } catch (error) {
    console.error('[chat] Groq error:', error);
    return new Response('AI service unavailable', { status: 503 });
  }

  // ── Return stream ─────────────────────────────────────────────────
  // Protocol: text/plain chunks. Client reads with response.body reader.
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        let fullContent = '';
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            fullContent += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        // Persist message after streaming completes
        await persistMessage(supabase, session.user.id, body.agentId, fullContent);
        controller.close();
      } catch (error) {
        console.error('[chat] Stream error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
      'X-Accel-Buffering': 'no',  // prevents nginx from buffering the stream
    },
  });
}

// ── Helpers ──────────────────────────────────────────────────────────
function buildSystemPrompt(agent: Agent, user: User): string {
  return `${agent.systemPrompt}

Current user: ${user.email}
Current time: ${new Date().toISOString()}
Always be concise. Use markdown for structure. Never hallucinate data.`;
}

async function persistMessage(
  supabase: SupabaseClient,
  userId: string,
  agentId: string,
  content: string
): Promise<void> {
  await supabase.from('messages').insert({
    user_id: userId,
    agent_id: agentId,
    role: 'assistant',
    content,
  });
}
```

---

## 4. Supabase Patterns

### 4.1 Client Creation — Which Client to Use

| Context                        | Client to use                                      |
|--------------------------------|----------------------------------------------------|
| Route Handler (`route.ts`)     | `createRouteHandlerClient({ cookies })`            |
| Server Component (`page.tsx`)  | `createServerComponentClient({ cookies })`         |
| Client Component               | `createClientComponentClient()`                    |
| Edge Runtime                   | `createRouteHandlerClient({ cookies })`            |
| Supabase Admin (bypass RLS)    | `createClient(url, SERVICE_ROLE_KEY)` — server only|

**Never** use the admin/service role client in edge functions or anywhere
the key could leak. Keep `SUPABASE_SERVICE_ROLE_KEY` in server-only env vars.

### 4.2 Typed Query Pattern

```typescript
// Always type your queries
const { data, error } = await supabase
  .from('tasks')
  .select('id, title, status, agent_id, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50)
  .returns<Task[]>();

// Always handle the error before using data
if (error) throw new Error(`DB error: ${error.message}`);
if (!data) return [];
```

### 4.3 RLS Rules — Always Enforced

Every table that contains user data MUST have RLS enabled. The standard policy:

```sql
-- Users can only see their own rows
CREATE POLICY "Users see own rows" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Never use: FOR ALL USING (true) — this is a security hole
```

### 4.4 Schema Change Protocol

1. Write the migration SQL in `supabase/schema.sql`
2. Add a comment with the date: `-- Migration: 2026-03-22 — add tasks table`
3. Never alter the schema in the Supabase dashboard without also updating `schema.sql`
4. After schema changes, update the TypeScript types in `lib/supabase.ts`

```typescript
// lib/supabase.ts — Database type shape
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          agent_id: string;
          title: string;
          status: 'queued' | 'running' | 'completed' | 'failed';
          output: Record<string, unknown> | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      // ... other tables
    };
  };
}
```

---

## 5. Authentication Flow

### 5.1 How Auth Works in OrchestrAI

```
User → /login → Supabase Auth → JWT stored in HttpOnly cookie
                                          │
Every API route ──────────────────────────┘
  └── createRouteHandlerClient reads cookie
  └── session.user.id = authenticated user
```

### 5.2 Auth Middleware

```typescript
// middleware.ts (in frontend/ root)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes: redirect to /login if no session
  const protectedPaths = ['/command', '/stack', '/operations', '/brief'];
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Already logged in: redirect away from login/register
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/command', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};
```

### 5.3 Auth Route Handler

```typescript
// app/api/auth/[...supabase]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/command', request.url));
}
```

---

## 6. Error Handling — Complete Reference

### 6.1 Error Code Taxonomy

Use ONLY these error codes in all routes. Consistent codes let the frontend handle errors properly.

```typescript
// Canonical error codes — frontend checks these strings
export const ErrorCodes = {
  // Auth
  AUTH_REQUIRED:       'AUTH_REQUIRED',       // 401 — no session
  AUTH_FORBIDDEN:      'AUTH_FORBIDDEN',       // 403 — insufficient permissions
  // Input
  VALIDATION_ERROR:    'VALIDATION_ERROR',     // 400 — Zod failure
  MISSING_FIELD:       'MISSING_FIELD',        // 400 — required field absent
  // Resources
  NOT_FOUND:           'NOT_FOUND',            // 404
  CONFLICT:            'CONFLICT',             // 409 — duplicate
  // Rate limits
  RATE_LIMITED:        'RATE_LIMITED',         // 429
  // AI
  AI_UNAVAILABLE:      'AI_UNAVAILABLE',       // 503 — Groq down
  AI_CONTEXT_TOO_LONG: 'AI_CONTEXT_TOO_LONG',  // 400
  // Server
  INTERNAL_ERROR:      'INTERNAL_ERROR',       // 500
  DB_ERROR:            'DB_ERROR',             // 500 — Supabase failure
} as const;
```

### 6.2 Never Let Errors Leak Details to Clients

```typescript
// ❌ WRONG — leaks internal info
return NextResponse.json({ error: error.message }, { status: 500 });

// ✅ CORRECT — log internally, return generic message
console.error('[API /tasks POST]', { userId, error });
return NextResponse.json({
  data: null,
  error: 'Internal server error',
  code: 'INTERNAL_ERROR'
}, { status: 500 });
```

---

## 7. Environment Variables — Server-Side

```bash
# Server-only (no NEXT_PUBLIC_ prefix — never accessible in browser)
GROQ_API_KEY=gsk_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Only for admin operations — use sparingly

# Public (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Validation at startup** — add to `app/api/_startup-check.ts`:
```typescript
const required = ['GROQ_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}
```

---

## 8. Performance Rules

- **Edge runtime** on streaming routes (`export const runtime = 'edge'`)
- **Node runtime** on routes that use Node.js APIs or heavy SDKs
- **Never `await` sequentially** when calls can be parallel:
  ```typescript
  // ❌ Slow — sequential
  const agents = await getAgents(userId);
  const tasks  = await getTasks(userId);

  // ✅ Fast — parallel
  const [agents, tasks] = await Promise.all([
    getAgents(userId),
    getTasks(userId),
  ]);
  ```
- **Limit DB results** — always use `.limit(n)` on list queries. Default max: 100.
- **Select only needed columns** — never `.select('*')` in production routes.

---

## 9. Adding a New API Route — Step-by-Step

Follow these steps in order. Do not skip.

1. Create `app/api/[resource]/route.ts`
2. Copy the Route Handler Template from §2
3. Define the Zod input schema for every HTTP method
4. Define the TypeScript response types
5. Implement auth check (copy from §2 exactly)
6. Write business logic
7. Add the error code from §6.1 for every failure case
8. If the route touches Supabase, check that RLS policies exist
9. Add the route to `lib/api-client.ts` (a typed client wrapper if one exists)
10. Test: unauthenticated request should return 401, malformed body should return 400

---

## 10. Checklist Before Committing Backend Code

- [ ] Auth check is the FIRST operation in every handler
- [ ] All inputs are validated with Zod before use
- [ ] Error codes follow the taxonomy in §6.1
- [ ] No secrets or keys in client-accessible code
- [ ] No `console.log` with user data (use `console.error` for errors only)
- [ ] DB queries use typed returns, not `any`
- [ ] Streaming routes have `export const runtime = 'edge'`
- [ ] RLS is enabled on any new table
- [ ] `schema.sql` is updated for any DB changes
- [ ] `lib/supabase.ts` types are updated to match schema
