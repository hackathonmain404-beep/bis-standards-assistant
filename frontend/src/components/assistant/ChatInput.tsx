import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Paperclip } from 'lucide-react';
import { Button } from '../common/Button';
import { useLanguage } from '../../state/LanguageContext';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea smoothly up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 24), 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = () => {
    alert('Voice input is scheduled for future release in Phase 2.');
  };

  const handleAttachClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const name = target.files[0].name;
        setText((prev) => (prev ? `${prev} [Attached standard: ${name}]` : `Review compliance for standard: ${name}`));
      }
    };
    input.click();
  };

  return (
    <form className="bis-chat-input-form" onSubmit={handleSubmit} role="search" aria-label="BIS Query Composer">
      <div className="bis-chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="bis-chat-textarea"
          placeholder="Describe your product or ask about a BIS standard..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          rows={1}
          maxLength={5000}
          aria-label="Ask about BIS Indian Standards"
          id="bis-main-query-input"
        />

        <div className="bis-chat-input-toolbar">
          <div className="bis-input-tools-left">
            <button
              type="button"
              className="bis-tool-icon-btn bis-attach-btn"
              title="Attach standard reference or document (PDF, DOCX)"
              aria-label="Attach standard reference or document"
              onClick={handleAttachClick}
              id="bis-chat-attach-btn"
            >
              <Paperclip size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="bis-tool-icon-btn bis-mic-btn"
              title={t.chat.microphone || 'Voice input (Phase 2 upcoming)'}
              aria-label={t.chat.microphone || 'Voice input (Phase 2 upcoming)'}
              onClick={handleMicClick}
              id="bis-chat-mic-btn"
            >
              <Mic size={16} aria-hidden="true" />
            </button>
            <span className="bis-char-counter" aria-live="off">
              {text.length}/5000
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!text.trim() || isLoading || disabled}
            isLoading={isLoading}
            icon={<Send size={15} aria-hidden="true" />}
            id="bis-send-query-btn"
            className="bis-chat-send-btn"
          >
            {t.chat.send}
          </Button>
        </div>
      </div>

      {/* Unified Regulatory Footer / Disclaimer Row */}
      <div className="bis-composer-disclaimer" role="note" aria-label="Official advisory notice">
        <span className="bis-disclaimer-item">Official Regulatory Advisory</span>
        <span className="bis-disclaimer-dot" aria-hidden="true">•</span>
        <span className="bis-disclaimer-item">AI-assisted compliance insights</span>
        <span className="bis-disclaimer-dot" aria-hidden="true">•</span>
        <span className="bis-disclaimer-item">Cross-reference official BIS gazettes</span>
      </div>
    </form>
  );
};
