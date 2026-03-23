// FILE: frontend/store/chat.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalUsage } from '@/lib/usage';
import { Mode } from '@/config/models';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: Mode;
  modelUsed?: string;
  attempts?: number;
  duration?: number;
  timestamp: string;
  isError?: boolean;
}

interface ChatState {
  mode: Mode;
  selectedModel: string; // 'auto' | modelId
  messages: ChatMessage[];
  isLoading: boolean;
  modelUsage: GlobalUsage;
  setMode: (mode: Mode) => void;
  setSelectedModel: (modelId: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
  incrementUsage: (modelId: string) => void;
  resetUsageIfNewDay: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      mode: 'workflow',
      selectedModel: 'auto',
      messages: [],
      isLoading: false,
      modelUsage: {},

      setMode: (mode: Mode) => {
        set({ mode, messages: [] });
      },

      setSelectedModel: (selectedModel: string) => {
        set({ selectedModel });
      },

      addMessage: (msgData) => {
        const id = Math.random().toString(36).substring(7);
        const timestamp = new Date().toISOString();
        const newMessage: ChatMessage = { ...msgData, id, timestamp };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      incrementUsage: (modelId: string) => {
        if (modelId === 'auto') return;

        const { modelUsage } = get();
        const today = new Date().toISOString().split('T')[0];
        const current = modelUsage[modelId];

        const updatedUsage = { ...modelUsage };
        if (!current || current.lastReset !== today) {
          updatedUsage[modelId] = { count: 1, lastReset: today };
        } else {
          updatedUsage[modelId] = { ...current, count: current.count + 1 };
        }
        
        set({ modelUsage: updatedUsage });
      },

      resetUsageIfNewDay: () => {
        const { modelUsage } = get();
        const today = new Date().toISOString().split('T')[0];
        let changed = false;
        
        const updatedUsage = { ...modelUsage };
        for (const [mid, usage] of Object.entries(updatedUsage)) {
          if (usage.lastReset !== today) {
            delete updatedUsage[mid];
            changed = true;
          }
        }
        
        if (changed) set({ modelUsage: updatedUsage });
      },
    }),
    {
      name: 'orchestrai-chat-store',
      // Only persist user-facing state and usage
      partialize: (state) => ({
        messages: state.messages,
        modelUsage: state.modelUsage,
        mode: state.mode,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
