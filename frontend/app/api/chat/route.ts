// FILE: frontend/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { buildSystemPrompt } from '@/config/prompts';
import { callWithFallback } from '@/lib/orchestrai';
import { MODELS, CHAINS, Mode } from '@/config/models';

/**
 * Validateur de requête Zod
 */
const RequestSchema = z.object({
  message: z.string().min(1).max(8000),
  mode: z.enum(['workflow', 'skill', 'agent']),
  selectedModel: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional()
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification — Toujours en premier
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { 
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set({ name, value, ...options })
              })
            } catch (error) {}
          }
        },
      }
    );
    
    // Fallback: check Authorization header if cookie fails
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    
    const { data: { user } } = token 
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Accès non autorisé. Connecte-toi pour continuer.', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // 2. Validation des données
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: 'Format de requête invalide.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { message, mode, selectedModel, history = [] } = parsed.data;

    // Guardrail de détection d'injection de prompt
    const INJECTION_PATTERNS = [
      /ignore.{0,20}(previous|prior|above|instructions)/i,
      /reveal.{0,20}(prompt|system|instructions)/i,
      /show.{0,20}(prompt|system|instructions)/i,
      /what are you/i,
      /qui es.?tu/i,
      /montre.{0,10}(ton|le|ce).{0,10}prompt/i,
      /répète.{0,10}(tes|les).{0,10}instructions/i,
      /oublie.{0,10}(tes|les).{0,10}instructions/i,
      /act as/i,
      /jailbreak/i,
      /DAN/,
    ];

    const isInjection = INJECTION_PATTERNS.some(p => p.test(message));
    if (isInjection) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const content = "Je suis OrchestrAI ton assistant pour générer des workflows n8n, des skills .md et des agents IA. Comment puis-je t'aider ? 😊";
          
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: 'meta', modelUsed: 'guardrail', attempts: 0, duration: 0 })}\n\n`
          ));
          
          const words = content.split(' ');
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              const chunk = (i === 0 ? '' : ' ') + words[i];
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`
              ));
              i++;
            } else {
              controller.enqueue(encoder.encode(
                `data: ${JSON.stringify({ type: 'done' })}\n\n`
              ));
              clearInterval(interval);
              controller.close();
            }
          }, 18);
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 3. Prompt système par mode
    const systemPrompt = buildSystemPrompt(mode as Mode);

    // 4. Chaîne de fallback des modèles
    let chain = CHAINS[mode as Mode];
    if (selectedModel !== 'auto' && MODELS[selectedModel]) {
      const chosen = MODELS[selectedModel];
      const rest = chain.filter(m => m.id !== selectedModel);
      chain = [chosen, ...rest];
    }

    // 5. Préparation de l'historique
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ];

    // 6. Appel avec fallback OrchestrAI
    const start = Date.now();
    const result = await callWithFallback(chain, messages);
    const duration = Date.now() - start;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send model info first as a header chunk
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: 'meta', modelUsed: result.modelUsed, attempts: result.attempts, duration })}\n\n`
        ));
        
        // Stream the content word by word
        const words = result.content.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            const chunk = (i === 0 ? '' : ' ') + words[i];
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`
            ));
            i++;
          } else {
            controller.enqueue(encoder.encode(
              `data: ${JSON.stringify({ type: 'done' })}\n\n`
            ));
            clearInterval(interval);
            controller.close();
          }
        }, 18); // ~18ms between words = natural reading speed
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[API /chat]', error);
    return NextResponse.json(
      { data: null, error: 'Erreur interne du serveur.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
