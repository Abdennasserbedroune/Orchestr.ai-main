// FILE: frontend/config/models.ts

export interface Model {
  id: string;
  name: string;
  provider: 'openrouter' | 'groq';
  modelId: string;
  isFree: boolean;
  description: string;
}

export const MODELS: Record<string, Model> = {
  'gemma-3-12b': {
    id: 'gemma-3-12b',
    name: 'Google Gemma 3 (12B)',
    provider: 'openrouter',
    modelId: 'google/gemma-3-12b-it:free',
    isFree: true,
    description: 'Qualité markdown supérieure, idéal pour les skills.',
  },
  'trinity-mini': {
    id: 'trinity-mini',
    name: 'Arcee AI Trinity Mini',
    provider: 'openrouter',
    modelId: 'arcee-ai/trinity-mini:free',
    isFree: true,
    description: 'Excellent pour le raisonnement et les instructions.',
  },
  'step-3.5-flash': {
    id: 'step-3.5-flash',
    name: 'Stepfun Step 3.5 Flash',
    provider: 'openrouter',
    modelId: 'stepfun/step-3.5-flash:free',
    isFree: true,
    description: 'Rapidité extrême, parfait pour les flux JSON.',
  },
  'llama-groq': {
    id: 'llama-groq',
    name: 'Meta Llama 3.3 (Groq)',
    provider: 'groq',
    modelId: 'llama-3.3-70b-versatile',
    isFree: true,
    description: 'Fiable et performant pour le JSON structuré.',
  },
};

export const CHAINS = {
  workflow: [
    MODELS['llama-groq'],
    MODELS['step-3.5-flash'],
    MODELS['gemma-3-12b'],
    MODELS['trinity-mini'],
  ],
  skill: [
    MODELS['llama-groq'],
    MODELS['gemma-3-12b'],
    MODELS['trinity-mini'],
    MODELS['step-3.5-flash'],
  ],
  agent: [
    MODELS['llama-groq'],
    MODELS['trinity-mini'],
    MODELS['gemma-3-12b'],
    MODELS['step-3.5-flash'],
  ],
};

export type Mode = keyof typeof CHAINS;
