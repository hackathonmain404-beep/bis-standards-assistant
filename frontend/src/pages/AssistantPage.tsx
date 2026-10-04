import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { useAssistant } from '../state/AssistantContext';
import { AssistantHeader } from '../components/assistant/AssistantHeader';
import { ChatMessage } from '../components/assistant/ChatMessage';
import { ChatInput } from '../components/assistant/ChatInput';
import { SuggestedPrompts } from '../components/assistant/SuggestedPrompts';
import { AIProcessingState } from '../components/assistant/AIProcessingState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const AssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    loadingStage,
    sendMessage,
    submitClarification,
    openEvidence,
    retryLastMessage,
    newSession,
  } = useAssistant();

  const chatStreamRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Check if user is scrolled within 100px of bottom
  const checkIfNearBottom = useCallback(() => {
    const el = chatStreamRef.current;
    if (!el) return true;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= 100;
  }, []);

  const handleScroll = useCallback(() => {
    const near = checkIfNearBottom();
    setIsNearBottom(near);
    if (near) {
      setHasNewMessages(false);
    }
  }, [checkIfNearBottom]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
    setHasNewMessages(false);
  }, []);

  // Ensure that in empty state or on initial mount, the chat stream starts at top: 0
  useEffect(() => {
    if (messages.length === 0 && chatStreamRef.current) {
      if (typeof chatStreamRef.current.scrollTo === 'function') {
        chatStreamRef.current.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        chatStreamRef.current.scrollTop = 0;
      }
    }
  }, [messages.length]);

  // Smart auto-scroll: only scroll automatically if user was already near bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (isNearBottom) {
        scrollToBottom('smooth');
      } else {
        setHasNewMessages(true);
      }
    } else if (isLoading && isNearBottom) {
      scrollToBottom('smooth');
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isLoading, isNearBottom, scrollToBottom]);

  const handleViewStandard = (standardNumber: string) => {
    navigate(`/standards/${encodeURIComponent(standardNumber)}`);
  };

  const handleStartCompliance = (_standardNumber: string) => {
    navigate('/compliance');
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`bis-assistant-page ${
        hasMessages ? 'bis-assistant-page--active' : 'bis-assistant-page--empty'
      }`}
    >
      {!hasMessages ? (
        /* ------------------------------------------------------------------
           EMPTY / LANDING STATE: Dedicated Centered Hero Container
           ------------------------------------------------------------------ */
        <div
          ref={chatStreamRef}
          className="bis-chat-stream bis-chat-stream--empty"
          role="log"
          aria-label="Conversation history"
          aria-live="polite"
        >
          <div className="bis-assistant-empty-container">
            {/* Title, Badge, Subtitle (Centered) */}
            <AssistantHeader isCompact={false} />

            {/* Suggested Prompts (Centered) */}
            <div className="bis-assistant-top-suggestions">
              <SuggestedPrompts onSelectPrompt={(p) => sendMessage(p)} />
            </div>

            {/* Quick Action Feature Hints */}
            <div className="bis-empty-feature-section">
              <div className="bis-feature-section-header">
                <span className="bis-feature-section-title">Explore BIS Compliance</span>
              </div>
              <div className="bis-empty-feature-cards">
                <div className="bis-feature-hint-card">
                  <span className="bis-feature-hint-icon" aria-hidden="true">🏛️</span>
                  <div className="bis-feature-hint-body">
                    <span className="bis-feature-hint-title">BIS Standard Discovery</span>
                    <span className="bis-feature-hint-text">
                      Locate applicable IS numbers & mandatory QCOs
                    </span>
                  </div>
                </div>
                <div className="bis-feature-hint-card">
                  <span className="bis-feature-hint-icon" aria-hidden="true">📜</span>
                  <div className="bis-feature-hint-body">
                    <span className="bis-feature-hint-title">Certification Schemes</span>
                    <span className="bis-feature-hint-text">
                      Inspect ISI Mark (Scheme I) vs CRS guidelines
                    </span>
                  </div>
                </div>
                <div className="bis-feature-hint-card">
                  <span className="bis-feature-hint-icon" aria-hidden="true">🧪</span>
                  <div className="bis-feature-hint-body">
                    <span className="bis-feature-hint-title">Testing & Laboratories</span>
                    <span className="bis-feature-hint-text">
                      Identify recognized facilities and test parameters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------
           ACTIVE CONVERSATION STATE: Wider Chat Alignment
           ------------------------------------------------------------------ */
        <>
          <AssistantHeader isCompact={true} onNewSession={newSession} />

          <div
            ref={chatStreamRef}
            onScroll={handleScroll}
            className="bis-chat-stream bis-chat-stream--active"
            role="log"
            aria-label="Conversation history"
            aria-live="polite"
          >
            <div className="bis-messages-list">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onOpenEvidence={openEvidence}
                  onSelectSuggestion={(q) => sendMessage(q)}
                  onSubmitClarification={submitClarification}
                  onRetry={retryLastMessage}
                  onViewStandard={handleViewStandard}
                  onStartCompliance={handleStartCompliance}
                />
              ))}

              {isLoading && (
                <div className="bis-chat-loading-slot">
                  <AIProcessingState currentStage={loadingStage} />
                </div>
              )}

              <div ref={messagesEndRef} className="bis-messages-anchor" />
            </div>
          </div>

          {/* Floating "New Response" scroll pill */}
          {hasNewMessages && (
            <button
              type="button"
              className="bis-new-response-pill"
              onClick={() => scrollToBottom('smooth')}
              aria-label="Scroll to new response"
            >
              <ArrowDown size={14} aria-hidden="true" />
              <span>New response</span>
            </button>
          )}

          {/* Optional Follow-up prompts when conversation is active */}
          {!isLoading && (
            <div className="bis-chat-followup-container">
              <SuggestedPrompts onSelectPrompt={(p) => sendMessage(p)} isFollowup />
            </div>
          )}
        </>
      )}

      {/* 4. Chat Composer - FIXED / DOCKED AT BOTTOM */}
      <div className="bis-chat-composer-dock">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
