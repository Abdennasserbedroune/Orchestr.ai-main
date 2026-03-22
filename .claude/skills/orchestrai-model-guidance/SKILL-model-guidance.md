---
name: orchestrai-model-guidance
description: >
  Critical guidance skill for working with free/weak OpenRouter models on
  OrchestrAI. Use this skill at the START of every Claude Code session before
  any other skill. This skill compensates for the known failure modes of
  free-tier models: context loss, partial writes, inconsistency, hallucinated
  APIs, and plan abandonment mid-task. Contains the mandatory workflow,
  self-check protocol, and recovery procedures. If you are running on a
  free OpenRouter model (deepseek, qwen, mistral-free, llama-free variants,
  gemma, phi, or any model without explicit paid tier), this skill is REQUIRED.
---

# OrchestrAI — Free Model Compensation & Workflow Skill

> **This skill exists because free models tend to:**
> - Write half a file and stop
> - Change one page and accidentally break another
> - Forget what they read 3 steps ago
> - Invent function signatures that don't exist
> - Lose track of the plan mid-execution
> - Mark tasks complete without verifying them
>
> Every rule in this skill directly counteracts one of those failure modes.
> Follow them without exception.

---

## 0. Before You Write a Single Line of Code

Read this checklist. Check each item mentally. Do not skip any.

```
PRE-TASK CHECKLIST
──────────────────
□ 1. What files will I modify?  (list them explicitly)
□ 2. What files will I READ to understand context?  (list them)
□ 3. What is the ONE thing this task changes?
□ 4. What existing behavior must NOT change?
□ 5. Have I read the relevant SKILL.md files for this task?
      - Frontend work?  → orchestrai (SKILL.md)
      - Backend work?   → orchestrai-backend
      - Any user input? → orchestrai-security
□ 6. Do I know the exact function/component signatures I'll call?
      If NO → read the source file before writing
```

If you cannot answer items 1-4 clearly, ask the user for clarification
before writing any code.

---

## 1. The Mandatory Work Cycle

Free models fail at long tasks. Break every task into phases.
Complete and verify each phase before starting the next.

```
PHASE 1: UNDERSTAND
  → Read all files that will be affected
  → Read one level up (the parent component or the calling route)
  → Note the exact imports, types, and function names in use
  → If anything is unclear, STOP and ask — don't guess

PHASE 2: PLAN (write this out before coding)
  → List files to create: [file1, file2, ...]
  → List files to modify: [file3, file4, ...]
  → List files to read but NOT modify: [file5, ...]
  → State the change in ONE sentence

PHASE 3: EXECUTE (one file at a time)
  → Write ONE complete file
  → Verify it is syntactically correct (mentally check: brackets, imports, exports)
  → Verify it uses the correct types from the codebase
  → Only then move to the next file

PHASE 4: VERIFY
  → Re-read the modified files
  → Cross-check: does the consumer of this file still work?
  → Does anything else import from the modified file?
  → Run the consistency checklist (§3)
```

---

## 2. File Writing Rules — Anti-Chunk Protocol

**The #1 cause of broken code from free models is partial file writes.**

### Rule 2.1: Write Complete Files — Always

```
❌ WRONG:
"Here's the updated section of AgentCard.tsx:
  // ... existing code ...
  const newPart = () => { ... }
  // ... rest of file ..."

✅ CORRECT:
Write the ENTIRE file from import to export default.
No "... existing code ..." placeholders. No "rest is unchanged."
The complete, final file. Every line.
```

### Rule 2.2: One File at a Time

Do not interleave changes across multiple files in one response unless they
are single-line fixes. If changing 3 files, show them sequentially, each complete.

### Rule 2.3: Declare What You're Changing

Before each file, write a one-line header:
```
// MODIFYING: frontend/components/AgentCard.tsx
// REASON: Adding toggle callback prop
// AFFECTS: frontend/app/(app)/stack/page.tsx (consumer)
```

### Rule 2.4: No Orphaned Code

If you add a function, it must be called somewhere.
If you add a prop, it must be passed from the parent.
If you add a type, it must be used.
After writing a file, trace: where does this connect to the existing code?

---

## 3. Consistency Checklist — Run After Every Change

```
CONSISTENCY CHECKLIST
─────────────────────
□ Colors: Only CSS custom properties used (var(--...)) — no raw hex values
□ Fonts: DM Sans for body, Plus Jakarta Sans for headings, JetBrains Mono for code
□ Spacing: --page-pad, --card-pad, --section-gap tokens — no arbitrary px values
□ Border radius: rounded-xl for cards, rounded-lg for inner elements
□ New component: Does it match the visual style of its sibling components?
□ API route: Auth check first? Zod validation? Proper error codes?
□ TypeScript: No 'any'? All props typed? Return types explicit?
□ Imports: All used? No circular imports? '@/' alias for absolute imports?
□ Side effects: Does this change affect another page or route? If yes — update it.
```

---

## 4. Memory Aids — Key Facts to Re-Read When Lost

When you lose track of what you were doing, re-read these facts:

**Project:** OrchestrAI — AI Agent Operating System. Next.js 14 App Router.
**Stack:** TypeScript + Tailwind CSS v3 + Supabase + Groq (llama-3.3-70b-versatile).
**Structure:**
- Pages live in `frontend/app/(app)/` (with sidebar) or `frontend/app/(public)/` (without)
- Components live in `frontend/components/`
- API routes live in `frontend/app/api/`
- Agent catalog lives in `frontend/lib/agents-data.ts` (NOT in DB)
- DB types live in `frontend/lib/supabase.ts`

**Design tokens are in `frontend/app/globals.css`.**
**When in doubt about a type, read `frontend/lib/supabase.ts` and `frontend/lib/agents-data.ts` first.**

---

## 5. Hallucination Prevention — Verify Before You Use

Free models frequently invent:
- Supabase methods that don't exist
- Next.js APIs from the wrong version (Pages Router vs App Router)
- Groq SDK methods with wrong signatures
- Non-existent Tailwind classes

### 5.1 Canonical API Reference

**Supabase (auth-helpers-nextjs):**
```typescript
// Route handlers
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
const supabase = createRouteHandlerClient({ cookies });

// Server components
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createServerComponentClient({ cookies });

// Client components
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
const supabase = createClientComponentClient();

// Auth
const { data: { session } } = await supabase.auth.getSession();
const { data: { user } } = await supabase.auth.getUser();

// Queries
await supabase.from('table').select('col1, col2').eq('field', value).limit(50);
await supabase.from('table').insert({ ... });
await supabase.from('table').update({ ... }).eq('id', id).eq('user_id', userId);
await supabase.from('table').delete().eq('id', id).eq('user_id', userId);
```

**Groq SDK:**
```typescript
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Streaming (what we use)
const stream = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'system'|'user'|'assistant', content: string }],
  stream: true,
  max_tokens: 2048,
  temperature: 0.7,
});
for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content ?? '';
}

// Non-streaming
const completion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [...],
  stream: false,
});
const text = completion.choices[0].message.content;
```

**Next.js 14 App Router:**
```typescript
// Route handler export patterns
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }

// Reading request body
const body = await request.json();

// Returning responses
return NextResponse.json({ data }, { status: 200 });
return new Response('text', { status: 200 });  // for streaming / edge

// Dynamic params
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) { ... }

// WRONG — these are Pages Router patterns, do NOT use:
// export default function handler(req, res) { ... }  ← Pages Router
// res.json(...)   ← Pages Router
// res.status(200).send(...)  ← Pages Router
```

**React hooks in App Router:**
```typescript
// Server Components (default in app/) — NO hooks, NO 'use client'
// Client Components — add 'use client' at top, then hooks are fine

// Common mistake: importing hooks in Server Components
// 'use client' must be the VERY FIRST line of the file
'use client';
import { useState, useEffect } from 'react';
```

---

## 6. Self-Correction Protocol

If you notice you've made an error mid-task, follow this protocol:

```
SELF-CORRECTION PROTOCOL
─────────────────────────
1. STOP — do not continue building on top of the error
2. IDENTIFY — state exactly what went wrong and in which file
3. REVERT — show the corrected complete file
4. VERIFY — check if the error affected anything downstream
5. RESUME — continue from the corrected state
```

Never try to "patch around" an error by adding more code.
Never mark a task complete if you notice an error and don't fix it.

---

## 7. Task Completion Protocol

Before declaring a task complete:

```
COMPLETION PROTOCOL
───────────────────
1. Re-read every file you wrote in this session
2. Check: do all imports resolve to real files/packages?
3. Check: are all TypeScript types correctly used?
4. Check: does every new UI element use the design system tokens?
5. Check: if you changed a shared component, did you verify its consumers?
6. Check: if you changed a DB query, did you verify RLS still applies?
7. State: "Task complete. Changed files: [list]. Untouched but verified: [list]."
```

If you cannot complete item 7 confidently, do NOT say the task is done.
Say: "I need to verify X before this is complete" and do that verification.

---

## 8. Common Failure Patterns — Watch for These in Yourself

These are the most common ways free models fail on this codebase.
Monitor your own output for these patterns and self-correct immediately.

| Failure Pattern                          | What to Do Instead                              |
|------------------------------------------|-------------------------------------------------|
| Writing `any` as a type                  | Look up the actual type from the codebase       |
| Using a Pages Router pattern in App Router | Re-read §5.1 canonical API reference           |
| Hardcoding a hex color value             | Use `var(--token-name)` from globals.css        |
| Writing a partial file with `// ...`     | Re-write the complete file                      |
| Calling Groq from client-side            | Move to an API route                            |
| Missing `.eq('user_id', session.user.id)`| Security violation — add it immediately         |
| Forgetting `export const runtime = 'edge'` on streaming routes | Add it |
| Declaring a variable but not using it    | Remove it or use it                             |
| Importing a component that doesn't exist yet | Create it first, THEN import it            |
| Saying "this should work" without verifying | Actually trace the code path                |

---

## 9. When to Stop and Ask

Stop and ask the user when:
- You are about to make a change that affects 5+ files
- You are unsure which of two patterns the codebase uses
- The task description is ambiguous about the expected behavior
- You realize the current architecture doesn't support what's being asked
- You've made an error you're not sure how to fix cleanly

**Never guess silently on architectural decisions.**
**Never silently skip a requirement because it's hard.**
Asking takes 10 seconds. Wrong architectural choices take hours to undo.
