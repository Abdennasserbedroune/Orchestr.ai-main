---
name: orchestrai-standards
description: >
  Mandatory standards skill for OrchestrAI covering four critical rules that
  apply to EVERY task without exception: (1) the platform is in French —
  all UI text, labels, buttons, error messages, placeholders, and copy must
  be natural professional French, never machine-translated or mixed-language;
  (2) the em dash character — is permanently banned from all output including
  code comments, strings, markdown, and responses; (3) Vercel deployment
  rules must be respected before any code is written to prevent build failures;
  (4) the competitive benchmark is Claude, Linear, Notion, Vercel, and the
  best AI infrastructure companies — every design and code decision must be
  justified against that bar. Use this skill for EVERY task in this project.
  It applies on top of all other skills and overrides them on these four points.
---

# OrchestrAI — Language, Typography, Deployment & Competitive Standards

> **For free/weak OpenRouter models — these rules are ABSOLUTE.**
> They are not suggestions. They are not "apply when relevant."
> They apply to every file, every string, every comment, every response.
> Read all four sections before touching anything.

---

## RULE 1: THE PLATFORM IS IN FRENCH

### What this means

Every word that a user sees in the interface must be in French.
This is not a translation project. This is a French-native product.
The copy was conceived in French. Write it as a native French speaker would,
not as someone translating from English.

### Scope — French is required in ALL of these

- Page titles and headings
- Navigation labels (sidebar, tabs, breadcrumbs)
- Button labels
- Form labels and input placeholders
- Error messages shown to the user
- Empty state messages
- Loading state messages
- Toast / notification messages
- Tooltips and helper text
- Onboarding copy
- Agent names and descriptions shown in the UI
- Modal titles and body text
- Table column headers
- Status labels (unless they are technical codes)
- Any string in a `t()`, `label`, `placeholder`, `aria-label`, `title` attribute

### What stays in English

- Code: variable names, function names, TypeScript types, class names
- Tailwind class strings
- API route paths (`/api/chat`, `/api/agents`)
- Database column names and table names
- Console logs and error logs (internal only — never shown to user)
- Comments in code (comments are written in English for developer clarity)
- Environment variable names
- Git commit messages

### French Copy Quality Rules

These rules exist because free models produce terrible French. Follow them exactly.

**Rule F1: No machine-translation English sentence structure**
```
❌ "Votre demande a été soumise avec succès."  ← direct translation of "Your request has been submitted successfully"
✅ "Demande envoyée."  ← how a French product actually says this

❌ "Êtes-vous sûr de vouloir supprimer cet agent?"  ← clunky literal translation
✅ "Supprimer cet agent ?"  ← clean, direct, how French UI actually reads

❌ "Veuillez entrer votre adresse email"  ← "Please enter your email address"
✅ "Adresse e-mail"  ← just the label, French UX convention
```

**Rule F2: Tutoiement throughout (use "tu", not "vous")**
OrchestrAI speaks to the user as a peer, not a customer service agent.
```
❌ "Bienvenue sur votre tableau de bord"
✅ "Bienvenue sur ton tableau de bord"

❌ "Vos agents sont prêts"
✅ "Tes agents sont prêts"
```

**Rule F3: French punctuation rules — MANDATORY**
French punctuation is different from English. Apply these without exception:

| Rule | Wrong | Correct |
|------|-------|---------|
| Space before `?` | `Tu veux supprimer?` | `Tu veux supprimer ?` |
| Space before `!` | `Agent activé!` | `Agent activé !` |
| Space before `:` | `Statut:` | `Statut :` |
| Space inside `«»` | `«bonjour»` | `« bonjour »` |
| Ellipsis | `...` (three dots) | `…` (Unicode U+2026) |
| No space before `,` `.` | `agent , actif` | `agent, actif` |

**Rule F4: French UI vocabulary — use these terms consistently**

| English term | French term to use | Never use |
|--------------|--------------------|-----------|
| Dashboard | Tableau de bord | Dashboard |
| Agent | Agent | — |
| Task | Tâche | Task |
| Settings | Paramètres | Settings, Réglages |
| Log out | Se déconnecter | Logout, Déconnexion |
| Profile | Profil | Profile |
| Search | Rechercher | Search |
| Cancel | Annuler | Cancel |
| Confirm | Confirmer | OK (alone, without context) |
| Save | Enregistrer | Sauvegarder |
| Delete | Supprimer | Effacer, Enlever |
| Edit | Modifier | Éditer |
| Create | Créer | Ajouter (unless it's truly "add") |
| Add | Ajouter | Rajouter |
| Enable | Activer | Actif (as a verb) |
| Disable | Désactiver | — |
| Loading | Chargement… | Loading, En cours |
| Error | Erreur | Problème (unless intentional) |
| Success | Succès | — (prefer direct confirmation: "Enregistré !") |
| Overview | Vue d'ensemble | Aperçu (unless brief preview) |
| Workflow | Flux de travail | Workflow (don't anglicize) |
| Command | Commande | — |
| Brief | Rapport | Brief (English word in French UI) |
| Stack | Équipe d'agents | Stack (too technical for UI label) |
| Operations | Opérations | — |

**Rule F5: No false friends and no franglais**
```
❌ "Déleter" — not a word. Use "Supprimer"
❌ "Canceller" — not a word. Use "Annuler"
❌ "Scheduler" — not a word. Use "Planifier"
❌ "Tagger" — use "Étiqueter" or "Marquer"
❌ "Updater" — use "Mettre à jour"
❌ "Checker" — use "Vérifier"
❌ "Cliquer sur le bouton submit" — use "Cliquer sur Envoyer"
```

**Rule F6: Error messages must be calm and actionable**
French users expect errors to explain what happened AND what to do next.
```
❌ "Erreur 500"
❌ "Une erreur est survenue."
✅ "Impossible de charger tes agents. Réessaie dans quelques instants."

❌ "Champ requis"
✅ "Ce champ est obligatoire."

❌ "Mot de passe incorrect"
✅ "Identifiants incorrects. Vérifie ton adresse e-mail et ton mot de passe."
```

---

## RULE 2: THE EM DASH IS PERMANENTLY BANNED

### The character: `—` (U+2014, em dash)

This character is **banned from the entire project** with zero exceptions.
It must never appear in:
- UI strings or copy
- Code comments
- Markdown files
- README files
- SKILL.md files (including this one — use alternatives)
- Git commit messages
- Console output
- Error messages
- Any text generated as part of this project

### Why it's banned

The em dash breaks rendering in multiple deployment contexts, causes
unexpected behavior in some font stacks, is invisible in certain terminal
outputs, creates copy/paste issues across operating systems, and in French
UI looks typographically incorrect (French uses guillemets and tirets, not
em dashes).

### What to use instead

| Instead of em dash | Use this |
|--------------------|----------|
| Connecting two ideas: `A — B` | A colon: `A : B` or rewrite the sentence |
| Parenthetical aside: `word — note — word` | Parentheses: `word (note) word` |
| Range: `10 — 20` | En dash or hyphen: `10-20` |
| Separator in headings | A pipe or colon: `Title : Subtitle` or `Title | Subtitle` |
| Emphasis break in copy | Restructure the sentence. Don't use a dash at all. |
| List-like structure | Use actual bullet points or numbered lists |

### Enforcement

Before submitting any output, scan mentally for `—`.
If you find one, rewrite the sentence without it.
There is no valid reason to use an em dash in this project.

---

## RULE 3: VERCEL DEPLOYMENT COMPLIANCE

Every piece of code written must be deployable to Vercel without errors.
Not "probably deployable." Deployable. Write with the constraints below
as first-class requirements, not afterthoughts.

### 3.1 Build-Breaking Issues to Never Create

**TypeScript errors are build errors on Vercel.**
```typescript
// Vercel runs `tsc --noEmit` before building. These WILL break production:
const x: any = ...         // ❌ strict mode rejects this in tsconfig
const y = data as any      // ❌
// @ts-ignore              // ❌ do not suppress — fix the type
// @ts-expect-error        // ❌ only acceptable in test files
```

**Missing environment variables crash at runtime.**
Every `process.env.X` used in code MUST be declared in:
1. `.env.example` (with a placeholder value)
2. Vercel project settings (Dashboard > Settings > Environment Variables)
3. If it can be undefined, add a startup check:
```typescript
const key = process.env.GROQ_API_KEY;
if (!key) throw new Error('GROQ_API_KEY is not set');
```

**`export const runtime` must match the actual runtime needs.**
```typescript
export const runtime = 'edge';   // Only if: no Node.js built-ins, no heavy SDKs
export const runtime = 'nodejs'; // If: using fs, crypto, heavy packages
// Default (no export) = nodejs runtime
```

Edge runtime rejects: `fs`, `path`, `crypto` (Node built-in), `child_process`,
any package that imports these. If you use any of those, remove `runtime = 'edge'`.

### 3.2 Next.js 14 App Router Vercel-Specific Rules

**Dynamic routes need generateStaticParams or dynamic = 'force-dynamic':**
```typescript
// If a page uses cookies(), headers(), or searchParams, add this:
export const dynamic = 'force-dynamic';

// If a page is fully static with known params:
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

**Image optimization:**
```typescript
// Always use next/image, never <img> for local/important images
import Image from 'next/image';
// External images need domain config in next.config.js:
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'example.com' }]
}
```

**`use client` placement:**
```typescript
// 'use client' must be the VERY FIRST LINE of the file
// Not after imports. Not after comments. The first line.
'use client';          // ← line 1
import { useState } from 'react';  // ← line 2
```

### 3.3 next.config.js — Required Settings

```javascript
// next.config.js — complete canonical config for OrchestrAI
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },

  // Webpack config — only modify if strictly necessary
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
```

### 3.4 Package.json Build Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

Always run `npm run type-check` mentally before declaring any code done.
If you write code that would fail `tsc --noEmit`, it will fail Vercel build.

### 3.5 Common Vercel Build Failures and How to Avoid Them

| Failure | Cause | Fix |
|---------|-------|-----|
| `Type error: ... implicitly has type 'any'` | Missing type annotation | Add explicit type |
| `Module not found: Can't resolve '@/...'` | Wrong import alias | Check tsconfig paths |
| `Error: GROQ_API_KEY is not defined` | Env var not set in Vercel | Add to Vercel dashboard |
| `Dynamic server usage: cookies` | Using cookies() without `force-dynamic` | Add `export const dynamic = 'force-dynamic'` |
| `Edge runtime does not support Node.js modules` | Node API in edge function | Remove `runtime = 'edge'` or remove the Node import |
| `Hydration failed` | Server/client HTML mismatch | Wrap in `<ClientOnly>` or fix the conditional render |
| `useSearchParams() should be wrapped in a Suspense` | Missing Suspense boundary | Wrap the component in `<Suspense fallback={...}>` |

---

## RULE 4: COMPETITIVE BENCHMARK

### The Standard

OrchestrAI competes directly with the best AI infrastructure and productivity
platforms in the world. The benchmark is not "good for a side project."
The benchmark is: Claude.ai, Linear, Vercel Dashboard, Notion, Loom,
Anthropic, OpenAI, Mistral, Perplexity, and Cursor.

Every piece of work produced for this project must be justifiable against
that bar. Not inspired by it. Justifiable against it. Meaning: if you put
this next to a Claude.ai component or a Linear UI, it should not look like
an amateur built it.

### What This Means in Practice

**Design decisions must be intentional.**
Every spacing choice, color, border radius, animation timing, and font weight
has a reason. "It looks fine" is not a reason. Ask: does this communicate
the right thing? Does it feel premium? Does it hold up at 2x zoom?

**Interactions must be immediate and smooth.**
Premium AI products respond instantly. Loading states exist but are elegant.
Transitions take exactly as long as needed and no longer.
A button click that takes 800ms with no feedback is unacceptable.

**Copy must be sharp and intentional.**
Claude.ai's copy is clean, confident, and minimal. Linear's copy respects
the user's intelligence. Write copy as if a professional French UX writer
reviewed it. No filler words. No redundant confirmation messages.
Every word earns its place.

**Error states must be as polished as success states.**
Competitors don't show raw error codes. They show helpful, human messages
that guide the user toward resolution. OrchestrAI does the same, in French.

**Empty states must tell a story.**
When a user has no agents, no tasks, or no messages, the empty state is
an opportunity to guide them, not a hole in the UI. Study how Linear and
Notion handle empty states. Apply the same care here.

### The Litmus Test

Before submitting any UI work, ask:
```
1. Would a French user feel this was built for them, or translated for them?
2. Would this UI embarrass us next to Claude.ai or Linear?
3. Is every interaction state handled? (loading, error, empty, success)
4. Is every piece of French copy written by a native speaker's standard?
5. Does this deploy cleanly to Vercel with zero build warnings?
```

If any answer is "no" or "maybe" — fix it before submitting.

### Competitive Areas to Excel In

**Speed of interaction.** Groq's Llama streaming is fast. The UI should
make that speed feel even faster. Streaming text should render smoothly,
not in chunks. Latency should be invisible wherever possible.

**Information density.** Linear and Vercel pack a lot of information into
small spaces without feeling cluttered. OrchestrAI's operations page and
stack page should feel equally dense and equally readable.

**Agent personality.** What sets OrchestrAI apart from competitors is that
each agent has a distinct voice and purpose. The French copy for each agent
should reinforce its personality. A marketing agent speaks differently than
a finance agent. This is a product differentiator — treat it as one.

**Reliability signaling.** Users trusting AI agents with their business need
to feel the platform is solid. This means: consistent UI patterns, clear
status indicators, proper error handling, and copy that never promises
what the system cannot deliver.

---

## Combined Pre-Task Checklist

Before writing any code or copy for OrchestrAI, confirm:

```
STANDARDS CHECKLIST
────────────────────
FRENCH
□ All UI strings are in French (tutoiement, natural, not translated)
□ French punctuation rules applied (spaces before ? ! :)
□ Vocabulary matches the approved term list (Rule F4)
□ No franglais or false friends (Rule F5)
□ Error messages are calm, specific, and actionable (Rule F6)

TYPOGRAPHY
□ Zero em dash characters (—) in any output
□ Sentences restructured to not need em dashes

VERCEL
□ No TypeScript errors (tsc --noEmit would pass)
□ All env vars used are declared in .env.example
□ runtime = 'edge' only if no Node.js built-ins are used
□ 'use client' is the literal first line of client component files
□ Dynamic routes have generateStaticParams or force-dynamic
□ No <img> tags — next/image only

COMPETITIVE BAR
□ Every interaction state handled (loading, error, empty, success)
□ Copy is minimal, sharp, and respects the user's intelligence
□ UI would not look out of place next to Claude.ai or Linear
□ Agent voices are distinct and reinforce the product's personality
```

All four categories must pass before the work is complete.
