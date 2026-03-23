// FILE: frontend/components/Chat/ModeSelector.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/store/chat';
import { Mode } from '@/config/models';
import { Zap, Brain, Bot } from 'lucide-react';

interface ModeOption {
  id: Mode;
  label: string;
  icon: React.ElementType;
}

const MODES: ModeOption[] = [
  { id: 'workflow', label: 'Workflow', icon: Zap },
  { id: 'skill', label: 'Skill', icon: Brain },
  { id: 'agent', label: 'Agent', icon: Bot },
];

export function ModeSelector() {
  const { mode, setMode, isLoading } = useChatStore();

  const handleModeChange = (newMode: Mode) => {
    if (isLoading || mode === newMode) return;
    setMode(newMode);
  };

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px', borderRadius: 24,
      background: 'rgba(10,10,12,0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        
        return (
          <button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 20,
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: isActive ? '#f4f4f5' : '#71717a',
              border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500,
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={e => {
              if (!isActive && !isLoading) {
                e.currentTarget.style.color = '#e4e4e7';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive && !isLoading) {
                e.currentTarget.style.color = '#71717a';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <Icon size={14} style={{ color: isActive ? '#6c63ff' : 'inherit' }} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
