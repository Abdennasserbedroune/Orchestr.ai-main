// FILE: frontend/lib/usage.ts

export interface ModelUsage {
  count: number;
  lastReset: string;
}

export interface GlobalUsage {
  [modelId: string]: ModelUsage;
}

const STORAGE_KEY = 'orchestrai_usage';
const FREE_LIMIT = 3;

export function getUsage(): GlobalUsage {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function saveUsage(usage: GlobalUsage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function canUseModel(modelId: string): boolean {
  if (modelId === 'auto') return true;
  
  const usage = getUsage();
  const today = new Date().toISOString().split('T')[0];
  const modelUsage = usage[modelId];

  if (!modelUsage || modelUsage.lastReset !== today) return true;
  return modelUsage.count < FREE_LIMIT;
}

export function incrementUsage(modelId: string): void {
  if (modelId === 'auto') return;

  const usage = getUsage();
  const today = new Date().toISOString().split('T')[0];
  const current = usage[modelId];

  if (!current || current.lastReset !== today) {
    usage[modelId] = { count: 1, lastReset: today };
  } else {
    usage[modelId].count += 1;
  }
  
  saveUsage(usage);
}

export function getRemainingMessages(modelId: string): number {
  if (modelId === 'auto') return Infinity;
  
  const usage = getUsage();
  const today = new Date().toISOString().split('T')[0];
  const modelUsage = usage[modelId];

  if (!modelUsage || modelUsage.lastReset !== today) return FREE_LIMIT;
  return Math.max(0, FREE_LIMIT - modelUsage.count);
}
