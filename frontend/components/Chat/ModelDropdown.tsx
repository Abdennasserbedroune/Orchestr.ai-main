// FILE: frontend/components/Chat/ModelDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chat';
import { MODELS } from '@/config/models';
import { ChevronDown, Sparkles } from 'lucide-react';
import { getRemainingMessages } from '@/lib/usage';
import Image from 'next/image';

// Model icon mapping — SVGs served from /public/icons/
const MODEL_ICONS: Record<string, string> = {
  'gemma-3-12b':    '/gemma-color.svg',
  'trinity-mini':   '/arcee-color.svg',
  'step-3.5-flash': '/stepfun-color.svg',
  'llama-groq':     '/meta-color.svg',
};

// Accent colors per provider for the icon wrapper glow
const MODEL_ACCENT: Record<string, string> = {
  'gemma-3-12b':    'rgba(66, 133, 244, 0.2)',
  'trinity-mini':   'rgba(108, 99, 255, 0.2)',
  'step-3.5-flash': 'rgba(16, 185, 129, 0.2)',
  'llama-groq':     'rgba(0, 136, 204, 0.2)',
};

function ModelIcon({ modelId, size = 16 }: { modelId: string; size?: number }): React.ReactElement {
  const src = MODEL_ICONS[modelId];
  if (!src) return <Sparkles size={size} />;
  return (
    <Image
      src={src}
      alt={modelId}
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block' }}
      unoptimized
    />
  );
}

export function ModelDropdown(): React.ReactElement {
  const { selectedModel, setSelectedModel, isLoading, resetUsageIfNewDay } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetUsageIfNewDay();
    const interval = setInterval(resetUsageIfNewDay, 60000);
    return () => clearInterval(interval);
  }, [resetUsageIfNewDay]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = selectedModel === 'auto'
    ? 'Automatique'
    : MODELS[selectedModel]?.name || 'Automatique';

  const handleSelect = (id: string): void => {
    if (isLoading) return;
    if (id !== 'auto') {
      const remaining = getRemainingMessages(id);
      if (remaining <= 0) return;
    }
    setSelectedModel(id);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 9px 5px 7px', borderRadius: 9,
          background: isOpen ? 'rgba(108,99,255,0.1)' : 'transparent',
          border: isOpen ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          color: isOpen ? '#c4bfff' : '#717179',
          transition: 'all 0.15s ease',
          outline: 'none',
          opacity: isLoading ? 0.45 : 1,
        }}
        onMouseEnter={e => {
          if (!isOpen && !isLoading) {
            e.currentTarget.style.color = '#d4d0ff';
            e.currentTarget.style.background = 'rgba(108,99,255,0.07)';
            e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)';
          }
        }}
        onMouseLeave={e => {
          if (!isOpen && !isLoading) {
            e.currentTarget.style.color = '#717179';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        {/* Icon in trigger */}
        <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {selectedModel === 'auto'
            ? <Sparkles size={14} color="#6c63ff" />
            : <ModelIcon modelId={selectedModel} size={14} />
          }
        </span>
        <span style={{
          fontSize: 12.5, fontWeight: 500,
          whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          overflow: 'hidden', maxWidth: 130,
        }}>
          {currentLabel}
        </span>
        <ChevronDown
          size={13}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.7 }}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: 0,
          width: 310,
          background: 'rgba(10,10,18,0.96)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          boxShadow: '0 0 0 1px rgba(108,99,255,0.08), 0 24px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.04)',
          zIndex: 50, padding: '6px',
          animation: 'oSlideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {/* Top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '55%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.5), transparent)',
            borderRadius: 1,
          }} />

          {/* Header */}
          <div style={{
            padding: '10px 12px 6px',
            fontSize: 10, fontWeight: 700,
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Modèle de génération
          </div>

          <div style={{ maxHeight: 330, overflowY: 'auto' }}>
            {/* Auto route */}
            <DropdownItem
              title="Automatique"
              desc="Acheminement intelligent multi-modèles"
              iconNode={<Sparkles size={15} color="#6c63ff" />}
              iconBg="rgba(108,99,255,0.12)"
              isSelected={selectedModel === 'auto'}
              onClick={() => handleSelect('auto')}
              badge="AUTO"
              badgeColor="#9d97ff"
              badgeBg="rgba(108,99,255,0.18)"
            />

            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 8px' }} />

            {/* Individual models */}
            {Object.values(MODELS).map((model) => {
              const remaining = getRemainingMessages(model.id);
              const isSelected = selectedModel === model.id;
              const isDisabled = remaining <= 0;

              return (
                <DropdownItem
                  key={model.id}
                  title={model.name}
                  desc={model.description}
                  iconNode={<ModelIcon modelId={model.id} size={16} />}
                  iconBg={MODEL_ACCENT[model.id] || 'rgba(255,255,255,0.06)'}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onClick={() => handleSelect(model.id)}
                  quotaText={`${remaining} req / j`}
                  quotaWarn={remaining <= 1}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown item subcomponent
// ─────────────────────────────────────────────────────────────────────────────
interface DropdownItemProps {
  title: string;
  desc: string;
  iconNode: React.ReactNode;
  iconBg: string;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  quotaText?: string;
  quotaWarn?: boolean;
}

function DropdownItem({
  title, desc, iconNode, iconBg, isSelected, isDisabled, onClick,
  badge, badgeColor, badgeBg, quotaText, quotaWarn,
}: DropdownItemProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 10px', borderRadius: 10,
        background: isSelected ? 'rgba(108,99,255,0.1)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(108,99,255,0.22)' : 'transparent'}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        textAlign: 'left', opacity: isDisabled ? 0.38 : 1,
        transition: 'background 0.15s, border-color 0.15s, transform 0.12s',
        gap: 10,
      }}
      onMouseEnter={e => {
        if (!isSelected && !isDisabled) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected && !isDisabled) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
      onMouseDown={e => { if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
    >
      {/* Icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        {iconNode}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: isSelected ? 600 : 500,
          color: isSelected ? '#e8e6ff' : '#e4e4e7',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 10.5, color: 'rgba(255,255,255,0.32)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginTop: 1,
        }}>
          {desc}
        </div>
      </div>

      {/* Right badges */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        {badge && (
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: badgeBg, color: badgeColor, letterSpacing: '0.05em',
          }}>
            {badge}
          </span>
        )}
        {quotaText && (
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: quotaWarn ? '#ef4444' : '#22c55e',
          }}>
            {quotaText}
          </span>
        )}
      </div>
    </button>
  );
}
