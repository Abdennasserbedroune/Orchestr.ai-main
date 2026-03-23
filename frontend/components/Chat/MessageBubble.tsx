// FILE: frontend/components/Chat/MessageBubble.tsx
'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/store/chat';
import { Copy, Download, Check, AlertTriangle, Clock, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { triggerDownload, detectFileType } from '@/lib/download';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  const fileType = detectFileType(message.content);
  const hasDownload = isAssistant && fileType !== 'txt';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    triggerDownload(message.content, message.mode);
  };

  return (
    <div className={clsx(
      "w-full flex flex-col gap-2 group animate-fade-in-up",
      isAssistant ? "items-start" : "items-end"
    )}>
      {/* Message Content */}
      <div className={clsx(
        "max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl relative transition-all duration-300",
        isAssistant 
          ? "bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-md" 
          : "bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/10"
      )}>
        {/* Actions (visible on hover for assistant) */}
        {isAssistant && (
          <div className="absolute -top-3 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg p-1 shadow-xl">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-[var(--bg-surface)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Copier"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {hasDownload && (
              <button
                onClick={handleDownload}
                className="p-1.5 hover:bg-[var(--bg-surface)] rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title={`Télécharger .${fileType}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className={clsx(
          "prose prose-sm prose-invert max-w-none leading-relaxed",
          "prose-pre:bg-[var(--bg-base)] prose-pre:border prose-pre:border-[var(--border-default)] prose-pre:rounded-xl",
          "prose-pre:p-4 prose-code:text-[var(--accent)] prose-code:font-mono",
          "prose-a:text-[var(--brand)] prose-strong:text-white"
        )}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Metadata (Assistant only) */}
      {isAssistant && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[10px] text-[var(--text-muted)] font-medium">
          {message.modelUsed && (
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              <span>{message.modelUsed}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <div className={clsx(
              "w-1 h-1 rounded-full",
              message.mode === 'workflow' ? "bg-[var(--warning)]" :
              message.mode === 'skill' ? "bg-[var(--brand)]" : "bg-[var(--success)]"
            )} />
            <span className="capitalize">Mode {message.mode}</span>
          </div>

          {message.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{(message.duration / 1000).toFixed(1)}s</span>
            </div>
          )}

          {message.attempts && message.attempts > 1 && (
            <div className="flex items-center gap-1 text-[var(--warning)] px-1.5 py-0.5 rounded bg-[var(--warning)]/10 border border-[var(--warning)]/20">
              <AlertTriangle className="w-2.5 h-2.5" />
              <span>Fallback après {message.attempts} essais</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
