export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { AGENTS_CATALOG } from '@/lib/agents-data'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const agentList = AGENTS_CATALOG
  .map(a => `- ${a.name} (${a.role}, domain: ${a.domain})`)
  .join('\n')

const SYSTEM_PROMPT = `You are Brief, the AI assistant inside Orchestrai — an AI agent operating system.
You help users understand which AI agents from The Stack fit their business needs.

Available agents:
${agentList}

Rules:
- Always recommend specific agents by name when relevant
- Be concise and direct — max 3-4 sentences per response
- Speak like a smart ops consultant, not a chatbot
- If the user's need is unclear, ask one clarifying question
- Never make up agents that are not in the list above`

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  let messages: ChatMessage[]

  try {
    const body = await req.json()
    messages = body.messages
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  // Validate messages array
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(
      m =>
        m &&
        typeof m === 'object' &&
        typeof m.role === 'string' &&
        typeof m.content === 'string'
    )
  ) {
    return NextResponse.json(
      { error: 'messages must be a non-empty array with role and content fields.' },
      { status: 400 }
    )
  }

  // Cap at last 20 messages to prevent token overflow
  const cappedMessages = messages.slice(-20)

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...cappedMessages],
    stream: true,
    max_tokens: 512,
    temperature: 0.7,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
