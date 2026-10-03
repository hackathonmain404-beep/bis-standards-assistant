import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../state/AssistantContext';
import { ChatMessage } from '../components/assistant/ChatMessage';
import { ChatInput } from '../components/assistant/ChatInput';
import { SuggestedPrompts } from '../components/assistant/SuggestedPrompts';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

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
  } = useAssistant();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleViewStandard = (standardNumber: string) => {
    navigate(`/standards/${encodeURIComponent(standardNumber)}`);
  };

  const handleStartCompliance = (_standardNumber: string) => {
    navigate('/compliance');
  };

  return (
    <div className="bis-assistant-page">
      <div className="bis-chat-stream" role="log" aria-label="Conversation history" aria-live="polite">
        {messages.length === 0 ? (
          <div className="bis-chat-welcome-container">
            <EmptyState
              title="BIS Intelligent Assistant"
              description="Ask natural-language questions regarding Indian Standards, mandatory Quality Control Orders (QCOs), testing protocols, or describe your product to discover applicable standards."
              suggestions={[
                'I manufacture stainless steel water bottles for household use. Which BIS standards apply?',
                'What BIS certification is required for electric steam irons?',
                'I want to get a BIS mark for my electric heater.',
                'What is IS 14543:2016 for packaged drinking water?',
              ]}
              onSelectSuggestion={(q) => sendMessage(q)}
            />
          </div>
        ) : (
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
                <LoadingSkeleton message={loadingStage || 'Consulting BIS knowledge base...'} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Inquiries (when conversation is active) */}
      {messages.length > 0 && !isLoading && (
        <div className="bis-chat-bottom-suggestions">
          <SuggestedPrompts onSelectPrompt={(p) => sendMessage(p)} />
        </div>
      )}

      {/* Fixed Chat Input Area */}
      <div className="bis-chat-input-container">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
