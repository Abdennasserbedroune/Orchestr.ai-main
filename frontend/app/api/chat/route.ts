import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'
import { buildSystemPrompt } from '@/lib/system-prompt'

// ── Rate limiting ─────────────────────────────────────────────────────
// NOTE: In-memory rate limiter resets on Vercel cold starts.
// For production, replace with @upstash/ratelimit + Redis.
const RATE_LIMIT_WINDOW_MS   = 60_000
const RATE_LIMIT_MAX_REQUESTS = 15
const ipRequestMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipRequestMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false
  entry.count++
  return true
}

// ── Input validation ──────────────────────────────────────────────────
type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

function validateMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object') return null
  const { messages } = body as Record<string, unknown>
  if (!Array.isArray(messages)) return null
  if (messages.length === 0 || messages.length > 50) return null
  for (const m of messages) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as Record<string, unknown>
    if (!['user', 'assistant'].includes(role as string)) return null
    if (typeof content !== 'string' || content.length === 0) return null
    if (content.length > 8000) return null
  }
  return messages as ChatMessage[]
}

// ── Groq client (lazy init) ───────────────────────────────────────────
let groqClient: Groq | null = null
function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY environment variable is not set.')
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

// ── HuggingFace fallback ──────────────────────────────────────────────
async function streamFromHuggingFace(
  messages: ChatMessage[],
  systemPrompt: string,
  controller: ReadableStreamDefaultController
) {
  const hfKey = process.env.HUGGINGFACE_API_KEY
  if (!hfKey) throw new Error('No LLM provider available. Set GROQ_API_KEY or HUGGINGFACE_API_KEY.')

  const model = 'mistralai/Mistral-7B-Instruct-v0.3'
  const prompt = [
    `<s>[INST] ${systemPrompt} [/INST]`,
    ...messages.map(m =>
      m.role === 'user' ? `[INST] ${m.content} [/INST]` : `${m.content}`
    ),
  ].join('\n')

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 1024, temperature: 0.7, return_full_text: false },
        stream: true,
      }),
    }
  )
  if (!res.ok || !res.body) throw new Error(`HuggingFace error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value, { stream: true })
    for (const line of text.split('\n')) {
      if (!line.startsWith('data:')) continue
      try {
        const json = JSON.parse(line.slice(5).trim())
        const token = json?.token?.text ?? ''
        if (token) controller.enqueue(new TextEncoder().encode(token))
      } catch { /* skip malformed SSE lines */ }
    }
  }
}

// ── Route handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return new Response(
      JSON.stringify({ error: 'Trop de requ\u00eates. Attendez une minute et r\u00e9essayez.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Parse & validate
  let body: unknown
  try { body = await req.json() } catch {
    return new Response(
      JSON.stringify({ error: 'Corps de requ\u00eate invalide.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const messages = validateMessages(body)
  if (!messages) {
    return new Response(
      JSON.stringify({ error: 'Format de messages invalide.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 3. System prompt
  const systemPrompt = buildSystemPrompt()

  // 4. Stream response
  // Note: Transfer-Encoding: chunked is NOT set — Vercel serverless handles framing automatically.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

        if (process.env.GROQ_API_KEY) {
          const groq = getGroqClient()
          const completion = await groq.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages,
            ],
            stream: true,
            temperature: 0.72,
            max_tokens: 2048,
            top_p: 0.95,
          })
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) controller.enqueue(new TextEncoder().encode(text))
          }
        } else {
          await streamFromHuggingFace(messages, systemPrompt, controller)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        console.error('[OrchestrAI /api/chat]', msg)
        controller.enqueue(
          new TextEncoder().encode('\n\n> **Erreur syst\u00e8me** \u2014 ' + msg)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Transfer-Encoding: chunked intentionally omitted — breaks Vercel serverless
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  })
}
