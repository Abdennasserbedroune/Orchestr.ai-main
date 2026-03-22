---
name: orchestrai
description: >
  Master skill for the OrchestrAI project — an AI Agent Operating System built on
  Next.js 14 App Router, Tailwind CSS v3, Supabase, and Groq. Use this skill for
  EVERY task in this codebase: adding pages, editing components, fixing bugs,
  writing API routes, styling UI, wiring agents, or touching any file under
  frontend/, backend/, or supabase/. This skill is the single source of truth
  for design consistency, code architecture, agent logic, and cross-page coherence.
  Never touch this project without reading this skill first.
---

# OrchestrAI — Master Coding & Design Skill

> **Prime directive:** Every change must be consistent with every other page.
> Before writing a single line of code, read this skill top-to-bottom.
> Violating the design system or architecture patterns below is never acceptable,
> even for "quick fixes."

---

## 1. Project Identity

OrchestrAI is an **AI Agent Operating System** — a dark-themed, data-dense,
command-center interface that lets businesses run on a fleet of AI agents.
The aesthetic is **mission-critical software**: precise, intentional, no decorative
fluff. Think NASA control room meets Figma's editor meets Linear's dashboard.

**Emotional register:** Powerful. Focused. Intelligent. Calm under pressure.
Every pixel must reinforce that the user is in command of something serious.

---

## 2. Tech Stack (canonical — never deviate)

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Framework   | Next.js 14 — App Router only (no pages/)        |
| Styling     | Tailwind CSS v3 + CSS custom properties          |
| Fonts       | DM Sans (UI body) · Plus Jakarta Sans (headings) · JetBrains Mono (code/mono) |
| Database    | Supabase — PostgreSQL + RLS + Auth               |
| AI          | Groq API — `llama-3.3-70b-versatile` streaming  |
| Deploy      | Vercel                                           |
| Language    | TypeScript — strict mode, no `any`               |

---

## 3. Repository Layout

```
orchestrai/
├── frontend/
│   ├── app/
│   │   ├── (app)/                ← authenticated shell (sidebar present)
│   │   │   ├── layout.tsx        ← injects <Sidebar /> + main content area
│   │   │   ├── command/          ← AI chat / command center  (default route)
│   │   │   ├── stack/            ← agent catalog & management
│   │   │   ├── operations/       ← live task monitoring & logs
│   │   │   └── brief/            ← daily AI-generated briefing
│   │   ├── (public)/             ← unauthenticated pages (no sidebar)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/                  ← Next.js Route Handlers (server-side only)
│   │   │   ├── chat/route.ts     ← Groq streaming endpoint
│   │   │   └── agents/route.ts
│   │   ├── layout.tsx            ← root layout: fonts + globals only
│   │   └── globals.css           ← SINGLE SOURCE OF TRUTH for design tokens
│   ├── components/               ← all reusable UI — never inline one-off styles
│   └── lib/
│       ├── agents-data.ts        ← agent catalog (NOT in DB — source of truth)
│       ├── mock-data.ts          ← domain meta, mock agents/tasks/activity
│       └── supabase.ts           ← typed Supabase client
└── supabase/
    └── schema.sql
```

---

## 4. Design System — The Law

### 4.1 Color Tokens (globals.css)

All colors are CSS custom properties consumed via Tailwind's `[]` syntax or
directly in CSS. **Never hardcode hex values in components.**

```css
:root {
  /* Backgrounds — layered depth */
  --bg-base:        #0a0a0f;   /* page background */
  --bg-surface:     #0f0f18;   /* card / panel surface */
  --bg-elevated:    #141420;   /* modals, dropdowns, hover states */
  --bg-overlay:     #1a1a2e;   /* tooltips, popovers */

  /* Borders */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.18);

  /* Brand — electric violet-blue */
  --brand:          #6c63ff;
  --brand-dim:      rgba(108,99,255,0.15);
  --brand-glow:     rgba(108,99,255,0.35);

  /* Accent — cyan signal */
  --accent:         #00d4ff;
  --accent-dim:     rgba(0,212,255,0.12);

  /* Status */
  --success:        #22c55e;
  --warning:        #f59e0b;
  --danger:         #ef4444;
  --info:           #3b82f6;

  /* Text hierarchy */
  --text-primary:   rgba(255,255,255,0.92);
  --text-secondary: rgba(255,255,255,0.60);
  --text-muted:     rgba(255,255,255,0.35);
  --text-disabled:  rgba(255,255,255,0.20);

  /* Sidebar */
  --sidebar-width:  240px;
  --sidebar-bg:     #0c0c16;
  --sidebar-border: rgba(255,255,255,0.07);

  /* Spacing rhythm */
  --page-pad:       1.5rem;   /* horizontal page padding */
  --card-pad:       1.25rem;
  --section-gap:    2rem;

  /* Motion */
  --ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast:  120ms;
  --duration-base:  200ms;
  --duration-slow:  350ms;
}
```

### 4.2 Typography Scale

| Role            | Font              | Size        | Weight | Color              |
|-----------------|-------------------|-------------|--------|--------------------|
| Page title      | Plus Jakarta Sans | 1.5rem      | 700    | `--text-primary`   |
| Section heading | Plus Jakarta Sans | 1.125rem    | 600    | `--text-primary`   |
| Body            | DM Sans           | 0.9375rem   | 400    | `--text-secondary` |
| Label / caption | DM Sans           | 0.8125rem   | 500    | `--text-muted`     |
| Code / mono     | JetBrains Mono    | 0.8125rem   | 400    | `--accent`         |
| Button          | DM Sans           | 0.875rem    | 500    | —                  |

- Line-height: `1.6` for body, `1.3` for headings
- Letter-spacing: `-0.01em` for headings ≥ 1.25rem
- **Never use `font-bold` on body copy — only headings and labels use bold**

### 4.3 Component Anatomy — Primitives

**Card / Panel**
```tsx
// CORRECT
<div className="rounded-xl border bg-[var(--bg-surface)] border-[var(--border-default)] p-[var(--card-pad)]">
```
- Always `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inner elements
- Shadow: `shadow-[0_1px_3px_rgba(0,0,0,0.4)]` on cards — never `shadow-md` etc.
- On hover: border transitions to `--border-strong`, background to `--bg-elevated`

**Button hierarchy**
```
Primary   → bg brand + white text + brand glow on hover
Secondary → bg transparent + border-default + text-primary → bg-elevated on hover
Ghost     → no border, bg transparent → bg-elevated on hover
Danger    → bg transparent + danger border/text → bg danger/10 on hover
```

**Input / Textarea**
```tsx
<input className="
  w-full rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]
  px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
  text-sm font-['DM_Sans']
  focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand-dim)]
  transition-colors duration-[var(--duration-base)]
" />
```

**Status badge**
```tsx
// Agent status indicator — always use these exact classes
const statusStyles = {
  active:  'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
  idle:    'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20',
  error:   'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20',
  running: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20',
}
// Wrap: rounded-full border text-xs font-medium px-2 py-0.5
```

### 4.4 Sidebar

The sidebar is `240px` wide, always pinned left, always visible on desktop.
- Background: `--sidebar-bg` (`#0c0c16`)
- Right border: `1px solid var(--sidebar-border)`
- Nav items: `rounded-lg`, `px-3 py-2`, icon + label
- Active item: `bg-[var(--brand-dim)] text-[var(--brand)]`
- Hover item: `bg-[var(--bg-elevated)] text-[var(--text-primary)]`
- Logo area: `h-14` header, `px-4`, brand mark + "OrchestrAI" in Plus Jakarta Sans 600
- Bottom: user avatar / workspace info

The sidebar **never scrolls independently** from the page unless the nav list
overflows — in which case only the nav list scrolls, not the logo or footer.

### 4.5 Page Layout Shell

Every authenticated page follows this exact shell:

```
┌─ sidebar (240px, fixed) ──┬─ main (flex-1, overflow-y-auto) ─────────────────┐
│                           │  ┌─ page header (sticky top-0) ──────────────────┤
│  logo                     │  │  page title  +  actions (right-aligned)        │
│                           │  └───────────────────────────────────────────────-┤
│  nav items                │                                                    │
│                           │  page content (padding: var(--page-pad))          │
│  ...                      │                                                    │
│                           │                                                    │
│  user                     │                                                    │
└───────────────────────────┴────────────────────────────────────────────────────┘
```

Page header: `sticky top-0 z-20 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-[var(--page-pad)] h-14 flex items-center justify-between`

### 4.6 Motion Rules

- **Hover transitions:** always `transition-[property] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]`
- **Enter animations:** use `@keyframes slideUp` + `animation-fill-mode: both` — never JS for mount animations unless interactive
- **Loading states:** skeleton shimmer via `animate-pulse bg-[var(--bg-elevated)]` — never spinners inside content areas
- **Page transitions:** none (Next.js default) — keep it instant and clean
- **Stagger:** list items get `animation-delay: calc(var(--index) * 40ms)`

---

## 5. Pages — Intent & Component Map

### 5.1 `/command` — AI Command Center
**Purpose:** Natural language interface to all agents. The "terminal" of the OS.
- Full-height split: left = conversation history; right = context panel (agent status, active tasks)
- Messages render as chat bubbles — user right-aligned, AI left-aligned
- AI responses stream token-by-token via the `/api/chat` route (Groq)
- Bottom input bar is sticky, always visible
- **Key component:** `<CommandInput />` with `/` slash-command support

### 5.2 `/stack` — Agent Catalog
**Purpose:** View, enable, configure all AI agents.
- Grid layout: agent cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card: agent avatar (icon in colored circle) + name + description + status badge + toggle
- Filter bar: by category (Marketing, Sales, Ops, Finance…)
- Agent data source: `lib/agents-data.ts` (NOT Supabase — this is static catalog data)
- **Key component:** `<AgentCard />` — must be pixel-identical across all category filters

### 5.3 `/operations` — Live Task Monitor
**Purpose:** Real-time view of what every agent is doing.
- Table or feed layout: task row = agent icon + task name + status + time elapsed + actions
- Status column uses the status badge primitive (§4.3)
- Rows are sortable, filterable
- Live refresh: polling or Supabase realtime subscription
- **Key component:** `<TaskRow />`, `<OperationsTable />`

### 5.4 `/brief` — Daily Briefing
**Purpose:** AI-generated morning brief — KPIs, completed tasks, recommendations.
- Single-column, readable width (max `680px`), centered
- Sections: Yesterday's summary / Today's agenda / Recommendations / Alerts
- Markdown rendered with consistent type styles (no raw HTML from AI)
- **Key component:** `<BriefSection />`, `<BriefCard />`

### 5.5 `/login` & `/register` — Auth Pages
- Centered card on `--bg-base` background
- Card: `max-w-[400px]`, `--bg-surface`, `rounded-2xl`, `border-[var(--border-default)]`
- Logo at top of card
- No sidebar, no header

---

## 6. Agent System — Architecture

### 6.1 agents-data.ts (Source of Truth)

```typescript
// lib/agents-data.ts — canonical shape, never deviate
export type AgentCategory =
  | 'marketing' | 'sales' | 'operations'
  | 'finance' | 'hr' | 'customer-success' | 'engineering';

export interface Agent {
  id: string;              // kebab-case, stable
  name: string;
  description: string;     // one sentence, action-oriented
  category: AgentCategory;
  icon: string;            // lucide icon name
  color: string;           // tailwind color name for avatar bg: 'violet' | 'cyan' | 'emerald' etc.
  capabilities: string[];  // what it can actually do
  systemPrompt: string;    // injected into Groq calls
  isEnabled: boolean;      // default enabled state (user can override in DB)
}
```

### 6.2 API Route — /api/chat

```typescript
// app/api/chat/route.ts — canonical streaming pattern
import Groq from 'groq-sdk';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'edge'; // always edge for Groq streaming

export async function POST(req: Request) {
  const { messages, agentId, domainId } = await req.json();

  // 1. Auth check via Supabase
  // 2. Load agent system prompt from agents-data
  // 3. Stream from Groq
  // 4. Return ReadableStream with text/plain; charset=utf-8

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: agent.systemPrompt },
      ...messages
    ],
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      }
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
```

### 6.3 Agent Logic Rules

- **One agent = one system prompt** in `agents-data.ts`. Never build prompts dynamically by string concatenation across components.
- Agent system prompts follow this template:
  ```
  You are [Name], an AI agent specialized in [domain] for OrchestrAI.
  Your role: [1-sentence role description]
  Your capabilities: [bullet list]
  Always respond in a [tone] manner. Be concise. Use markdown for structure.
  Current context: {domain}, {user_name}
  ```
- Agents never break character. If asked something outside their domain, they redirect: "That's outside my domain. Route this to the [X] agent."
- **Multi-agent routing:** The `/command` page reads the user's input and picks the best agent via a lightweight classification call (separate from the main chat).

---

## 7. Code Quality Rules — Non-Negotiable

### 7.1 TypeScript

```typescript
// ALWAYS: explicit return types on functions
function getAgentById(id: string): Agent | undefined { ... }

// ALWAYS: type API responses
interface ChatResponse { content: string; agentId: string; timestamp: string; }

// NEVER: any
const data: any = ...; // ❌

// ALWAYS: discriminated unions for state
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

### 7.2 Component Architecture

- **Single Responsibility:** Each component does ONE thing. A card does not fetch data.
- **Colocation:** Types for a component live at the top of the same file. Only move to a shared `types.ts` if used in 3+ files.
- **Props interface always named `[ComponentName]Props`:**
  ```typescript
  interface AgentCardProps {
    agent: Agent;
    isEnabled: boolean;
    onToggle: (id: string) => void;
  }
  ```
- **Default exports for pages, named exports for components:**
  ```typescript
  export default function CommandPage() { ... }   // page
  export function AgentCard(props: AgentCardProps) { ... }  // component
  ```
- **No inline styles.** Ever. Use CSS custom properties via Tailwind `[]` syntax.

### 7.3 Data Fetching

```typescript
// Server Component (App Router) — preferred for static/SSR data
export default async function StackPage() {
  const supabase = createServerClient();
  const { data: userAgents } = await supabase.from('user_agents').select('*');
  const agents = getAgentsData(); // from agents-data.ts
  return <StackClient agents={agents} userAgents={userAgents} />;
}

// Client Component — only for interactive/real-time features
'use client';
export function OperationsClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    // Supabase realtime subscription
  }, []);
}
```

### 7.4 Error Handling

Every API route must return typed errors:
```typescript
// Consistent error shape across ALL routes
return Response.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
```

Every component that can fail must have an error boundary or inline error state
using the `RequestState` type — never let unhandled errors crash the page.

### 7.5 File Naming

| Type              | Convention              | Example                        |
|-------------------|-------------------------|--------------------------------|
| Page              | `page.tsx`              | `app/(app)/stack/page.tsx`     |
| Layout            | `layout.tsx`            | `app/(app)/layout.tsx`         |
| Component         | PascalCase.tsx          | `components/AgentCard.tsx`     |
| Hook              | camelCase, `use` prefix | `hooks/useAgentStream.ts`      |
| Utility           | camelCase               | `lib/formatDate.ts`            |
| Type file         | camelCase               | `types/agent.ts`               |
| API Route         | `route.ts`              | `app/api/chat/route.ts`        |

---

## 8. Cross-Page Consistency Checklist

Before committing ANY change, verify:

- [ ] **Colors:** Only CSS custom properties used — no hardcoded hex, no Tailwind named colors for brand/background
- [ ] **Spacing:** `--page-pad` for page edges, `--card-pad` for card internals, `--section-gap` between sections
- [ ] **Typography:** Correct font for the role (§4.2), no arbitrary font sizes
- [ ] **Borders:** `--border-subtle` / `--border-default` / `--border-strong` only
- [ ] **Hover states:** Every interactive element has a visible hover state with `transition`
- [ ] **Loading states:** Every async operation has a skeleton or loading indicator
- [ ] **Empty states:** Every list/table has an empty state with icon + message
- [ ] **Mobile:** Sidebar collapses to overlay on < 768px, grids reflow correctly
- [ ] **TypeScript:** Zero `any`, all props typed, no missing return types
- [ ] **Imports:** No unused imports, no relative `../../../` beyond 2 levels — use `@/` alias

---

## 9. Prohibited Patterns — Never Do These

```typescript
// ❌ Hardcoded color
<div style={{ background: '#1a1a2e' }}>

// ❌ Tailwind arbitrary values for brand colors with raw hex
<div className="bg-[#6c63ff]">   // use bg-[var(--brand)] instead

// ❌ Mixing font families arbitrarily
<p className="font-mono text-lg font-bold">  // mono is only for code/data

// ❌ Importing from wrong layer
// In a Server Component:
import { useState } from 'react'; // ❌ — needs 'use client' directive

// ❌ Calling Groq client-side
// Groq API key must NEVER touch the browser. Only call from /api routes.

// ❌ Inconsistent page structure
// Every (app) page must use the established shell. No custom full-bleed layouts
// unless the page is explicitly designed as a special case (and noted here).

// ❌ Breaking agent data structure
// Never add fields to Agent type without updating ALL agents in agents-data.ts

// ❌ Chunk-writing components
// Never write half a component, save, and continue in a new message.
// Write each component file completely before moving to the next.
```

---

## 10. Workflow — How to Approach Any Task

1. **Read the task.** Identify which files will be touched.
2. **Map dependencies.** What components does the target page use? What data does it need?
3. **Check the design system.** Which tokens, which patterns from §4 apply?
4. **Write complete files.** Never write partial components. If a file is being edited, show the COMPLETE final file, not a diff of fragments.
5. **Propagate consistently.** If you change a shared component (e.g., `AgentCard`), verify every page that uses it still works and looks correct.
6. **Verify the checklist (§8).** Before declaring done.

### When adding a new page:
1. Create `app/(app)/[pagename]/page.tsx` as a Server Component
2. Add a nav item in the Sidebar component with the correct icon and active state
3. Match the page header pattern exactly (§4.5)
4. Add the route to the route config if one exists

### When adding a new agent:
1. Add to `lib/agents-data.ts` with ALL required fields
2. Write a focused, capable `systemPrompt`
3. Assign a unique `id`, appropriate `category`, `color`, and `icon`
4. The agent is immediately available in `/stack` — no other wiring needed for display

### When modifying the AI chat:
1. Only modify `app/api/chat/route.ts` for logic changes
2. The streaming protocol (text/plain chunked) must remain unchanged
3. Client-side streaming consumption is in `components/CommandInput.tsx` — respect its API
4. Never add client-side AI SDK calls. All AI calls go through Next.js API routes.

---

## 11. Supabase Schema Reference

```sql
-- Users (Supabase Auth — not a custom table)

-- Domains (workspace/company)
create table domains (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- User agent preferences (which agents are enabled per user)
create table user_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  agent_id text not null,  -- matches Agent.id from agents-data.ts
  is_enabled boolean default true,
  config jsonb default '{}',
  updated_at timestamptz default now()
);

-- Tasks (agent-executed work items)
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  agent_id text not null,
  title text not null,
  status text check (status in ('queued', 'running', 'completed', 'failed')),
  output jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Conversations
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  agent_id text not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);
```

TypeScript types for all tables live in `lib/supabase.ts` under the `Database` interface.

---

## 12. Environment Variables

```bash
# Required — never expose GROQ_API_KEY to the client
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
GROQ_API_KEY=[groq-key]   # server-only — never NEXT_PUBLIC_
```

If adding new env vars: server-only vars have no prefix; client-safe vars use `NEXT_PUBLIC_`.
Always add to `.env.example` with a descriptive placeholder.

---

## 13. Quick Reference — Design Tokens in Tailwind

```
bg-[var(--bg-base)]           → page background
bg-[var(--bg-surface)]        → card/panel background
bg-[var(--bg-elevated)]       → raised elements, hover states
border-[var(--border-default)] → standard borders
border-[var(--border-subtle)] → dividers, faint separators
text-[var(--text-primary)]    → main content text
text-[var(--text-secondary)]  → supporting text
text-[var(--text-muted)]      → labels, captions, placeholders
text-[var(--brand)]           → brand-colored text
text-[var(--accent)]          → accent / highlight text
bg-[var(--brand-dim)]         → brand-tinted background
```

---

*Last updated: March 2026 — reflects the Next.js 14 App Router architecture.*
*When in doubt: consistency over cleverness. The design system is the contract.*
