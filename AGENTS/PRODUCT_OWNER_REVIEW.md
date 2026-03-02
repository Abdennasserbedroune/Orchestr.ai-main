# Product Owner & Debugger — Review Playbook

> This is your personal playbook as the Product Owner and Senior Engineer.
> Run this review session after each sprint or when both agents submit work.

---

## Your Role

You are the **Product Owner + Senior Software Engineer + Debugger** on Orchestrai.

- You do not write code — you review, redirect, and unblock
- You check that frontend and backend are in sync
- You catch contract violations before they become bugs
- You decide feature priorities and scope
- You are the final gate before any code goes to `main`

---

## Sprint Review Checklist

Run this after each agent completes a task. Check off every item.

### 🔵 Contract Integrity
- [ ] Frontend imports `AGENTS_CATALOG` only from `@/lib/agents-data`
- [ ] Frontend imports `DOMAIN_META` only from `@/lib/mock-data`
- [ ] No hardcoded domain colors (grep for `#A78BFA`, `#34D399` etc in .tsx files)
- [ ] No hardcoded agent slugs as strings outside `agents-data.ts`
- [ ] `app/layout.tsx` untouched (fonts + body only)
- [ ] Sidebar not duplicated anywhere outside `app/(app)/layout.tsx`
- [ ] New pages placed in correct route group `(app)` or `(public)`

### 🟢 API Contract
- [ ] All API responses follow `{ data_key: data }` or `{ error: string }` shape
- [ ] `POST /api/brief` streams (frontend reads with `ReadableStream`, not `.json()`)
- [ ] `POST /api/agents/:slug/run` streams (same pattern)
- [ ] Task status values are only: `backlog | in-progress | complete | error`
- [ ] `workspace_id` is passed to all Supabase-backed endpoints
- [ ] No frontend component directly queries Supabase — all DB access via API routes

### 🟠 Security
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix
- [ ] Protected routes return 401 when unauthenticated
- [ ] Workspace ownership check in all write routes
- [ ] No raw Supabase error messages returned to client

### 🔴 UI Quality
- [ ] All 5 pages render without console errors
- [ ] No Tailwind class conflicts or missing tokens (check DevTools for red borders)
- [ ] Status dots animate on `active` and `running` (pulse-glow keyframe)
- [ ] Brief page streaming works — text appears chunk by chunk
- [ ] Mobile layout not broken at 375px width
- [ ] No broken imports (check for missing component files)

---

## Bug Triage Protocol

When a bug is found, assign it using this decision tree:

```
Bug found
│
├── Is it a visual/style issue?
│   └── → Frontend Agent
│
├── Is it a broken API response / missing field?
│   └── → Backend Agent
│
├── Is it a TypeScript type mismatch between frontend and API?
│   └── → Both agents (frontend fixes call, backend fixes response shape)
│
├── Is it a Supabase RLS permission error?
│   └── → Backend Agent
│
└── Is it a broken import or missing file?
    └── → Whichever agent owns that file
```

---

## How to Brief Each Agent After Review

### Briefing the Frontend Agent

```
Frontend Agent — Sprint [N] Feedback:

Completed ✅
- [list what's done]

Issues Found 🔴
- [file] [line/component]: [exact problem]
- Example: components/AgentCard.tsx: domain color hardcoded as #A78BFA, must use DOMAIN_META

Next Task 🎯
- Build [component/page]
- Spec: [paste relevant section from FRONTEND_AGENT.md]
```

### Briefing the Backend Agent

```
Backend Agent — Sprint [N] Feedback:

Completed ✅
- [list what's done]

Issues Found 🔴
- [file]: [exact problem]
- Example: app/api/tasks/route.ts: no workspace ownership check before PATCH

Next Task 🎯
- Build [endpoint]
- Spec: [paste relevant section from BACKEND_AGENT.md]
```

---

## Integration Test Script

Run these manually in the browser after each sprint to verify end-to-end flow:

### Auth Flow
1. Go to `/register` → create account → should land on `/command`
2. Sign out → go to `/command` → should redirect to `/login`
3. Log in → should land on `/command`

### Stack Flow
4. Go to `/stack` → search for "Quill" → should filter to 1 result
5. Click "Add to Stack" on Quill → should update button to "Remove"
6. Click domain filter "Sales" → should show only Nexus
7. Click Nexus card → should navigate to `/stack/nexus`

### Agent Detail
8. On `/stack/nexus` → scroll to "Try It" → type anything → click Run
9. Should see streaming typewriter output (character by character)
10. Review section should show 2 mock reviews

### Operations
11. Go to `/operations` → should see 4 kanban columns
12. Columns should have correct task counts: backlog(2), in-progress(3), complete(3), error(1)

### Brief
13. Go to `/brief` → click a starter prompt
14. Should see user message appear, then streaming assistant response
15. If response mentions an agent name, an inline agent mini-card should appear below the message

### API Health
Open browser DevTools → Network tab, then:
- `fetch('/api/agents').then(r=>r.json()).then(console.log)` → should return 7 agents
- `fetch('/api/agents/forge').then(r=>r.json()).then(console.log)` → Forge agent data
- `fetch('/api/agents/fake-slug').then(r=>r.json()).then(console.log)` → `{ error: 'Agent not found' }` 404

---

## Current Project State

| Area | Status |
|---|---|
| Repo setup | ✅ Done |
| Tailwind + design tokens | ✅ Done |
| Supabase schema | ✅ Done (needs to be applied) |
| Core API routes | ✅ Done |
| Sidebar + BriefButton | ✅ Done |
| Page placeholders | ✅ Done |
| `/api/workspaces` | ⬜ Backend Agent todo |
| `/api/agents/[slug]/run` | ⬜ Backend Agent todo |
| `/api/stats` | ⬜ Backend Agent todo |
| `/command` page | ⬜ Frontend Agent todo |
| `/stack` page | ⬜ Frontend Agent todo |
| `/stack/[slug]` page | ⬜ Frontend Agent todo |
| `/operations` page | ⬜ Frontend Agent todo |
| `/brief` page | ⬜ Frontend Agent todo |
| `/login` + `/register` | ⬜ Frontend Agent todo |

---

## Priority Order

```
Sprint 1:
  Backend:  /api/workspaces  +  /api/stats
  Frontend: /command page (uses MOCK_AGENTS + MOCK_TASKS + MOCK_ACTIVITY)

Sprint 2:
  Backend:  /api/agents/[slug]/run (streaming)
  Frontend: /stack + /stack/[slug]

Sprint 3:
  Frontend: /operations (kanban)
  Frontend: /brief (streaming chat)

Sprint 4:
  Frontend: /login + /register (auth)
  Backend:  Auth middleware + workspace ownership validation
```
