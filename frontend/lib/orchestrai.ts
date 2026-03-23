// FILE: frontend/lib/orchestrai.ts

import Groq from 'groq-sdk';
import { Model } from '@/config/models';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FallbackResult {
  content: string;
  modelUsed: string;
  attempts: number;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

async function callOpenRouter(modelId: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY est manquante.');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://orchestrai.app',
      'X-Title': 'OrchestrAI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`OpenRouter Error ${res.status} : ${error?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGroq(modelId: string, messages: ChatMessage[]): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY est manquante.');

  const completion = await groq.chat.completions.create({
    model: modelId,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices?.[0]?.message?.content || '';
}

/**
 * Executes a chain of models until one succeeds.
 * Silently falls back on failure.
 */
export async function callWithFallback(
  chain: Model[],
  messages: ChatMessage[]
): Promise<FallbackResult> {
  let attempts = 0;
  let lastError: Error | null = null;

  for (const model of chain) {
    attempts++;
    try {
      let content = '';
      if (model.provider === 'groq') {
        content = await callGroq(model.modelId, messages);
      } else {
        content = await callOpenRouter(model.modelId, messages);
      }

      if (content) {
        return {
          content,
          modelUsed: model.name,
          attempts,
        };
      }
    } catch (err) {
      console.error(`[OrchestrAI] Échec du modèle ${model.name} :`, err);
      lastError = err instanceof Error ? err : new Error('Erreur inconnue');
      // Wait a bit before next attempt if it was a rate limit or server error
      if (attempts < chain.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError || new Error('Tous les modèles ont échoué.');
}
