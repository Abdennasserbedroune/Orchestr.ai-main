// FILE: frontend/components/Chat/FreeCounter.tsx
'use client';

import React from 'react';
import { useChatStore } from '@/store/chat';
import { getRemainingMessages } from '@/lib/usage';
import { MODELS } from '@/config/models';
import { Sparkles, Info } from 'lucide-react';

export function FreeCounter() {
  const { selectedModel, modelUsage } = useChatStore();
  
  if (selectedModel === 'auto') return null;
  
  const model = MODELS[selectedModel];
  if (!model) return null;
  
  const remaining = getRemainingMessages(selectedModel);
  const total = 3;
  const used = total - remaining;
  const percentage = (used / total) * 100;

  // Colors based on remaining quota
  const isHealthy = remaining > 1;
  const isWarning = remaining === 1;
  const isDanger = remaining === 0;

  const barColor = isHealthy ? '#6c63ff' : isWarning ? '#f59e0b' : '#ef4444';
  const textColor = isDanger ? '#ef4444' : '#6c63ff';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 16,
      padding: '8px 16px', borderRadius: 24,
      background: 'rgba(10,10,12,0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'oFadeIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <Sparkles size={14} color="#6c63ff" />
        <span style={{ color: '#a1a1aa' }}>Gratuit : {model.name}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Progress bar container */}
        <div style={{
          width: 80, height: 6, borderRadius: 100,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          {/* Progress fill */}
          <div style={{
            height: '100%', width: `${percentage}%`,
            background: barColor, borderRadius: 100,
            transition: 'width 0.5s ease-out, background 0.5s ease'
          }} />
        </div>
        
        <span style={{ fontSize: 11, fontWeight: 700, color: textColor }}>
          {used} / {total}
        </span>
      </div>

      {isDanger && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 10, color: '#ef4444', fontStyle: 'italic',
          paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,0.08)'
        }}>
          <Info size={12} />
          <span>Basculez en mode Auto pour continuer</span>
        </div>
      )}
    </div>
  );
}
