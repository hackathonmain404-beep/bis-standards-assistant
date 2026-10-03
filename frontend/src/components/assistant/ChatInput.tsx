import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading || disabled) return;

    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="bis-chat-input-form" onSubmit={handleSubmit}>
      <div className="bis-chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="bis-chat-textarea"
          placeholder={t.chat.placeholder}
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
              className="bis-tool-icon-btn"
              title={t.chat.microphone}
              aria-label={t.chat.microphone}
              onClick={() => alert('Voice input is scheduled for future release in Phase 2.')}
            >
              <Mic size={16} />
            </button>
            <span className="bis-char-counter">{text.length}/5000</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!text.trim() || isLoading || disabled}
            isLoading={isLoading}
            icon={<Send size={15} />}
            id="bis-send-query-btn"
          >
            {t.chat.send}
          </Button>
        </div>
      </div>
    </form>
  );
};
