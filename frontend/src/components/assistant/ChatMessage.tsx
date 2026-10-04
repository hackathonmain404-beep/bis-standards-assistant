import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types/assistant';
import { Citation, SourceReference } from '../../types/evidence';
import { AIResponseView } from './AIResponseView';
import { AssistantErrorState } from './AssistantErrorState';
import { Button } from '../common/Button';

export interface ChatMessageProps {
  message: ChatMessageType;
  onOpenEvidence: (source: SourceReference | Citation) => void;
  onSelectSuggestion?: (query: string) => void;
  onSubmitClarification?: (values: Record<string, string>) => void;
  onRetry?: () => void;
  onViewStandard?: (standardNumber: string) => void;
  onStartCompliance?: (standardNumber: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenEvidence,
  onSelectSuggestion,
  onSubmitClarification,
  onRetry,
  onViewStandard,
  onStartCompliance,
}) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`bis-message-wrapper ${
        isUser
          ? 'bis-message-wrapper--user'
          : isError
          ? 'bis-message-wrapper--error'
          : 'bis-message-wrapper--assistant'
      }`}
    >
      <div className="bis-message-avatar" aria-hidden="true">
        {isUser ? '👤' : isError ? '⚠️' : '🏛️'}
      </div>

      <div className="bis-message-content-container">
        <div className="bis-message-header">
          <span className="bis-message-author">
            {isUser ? 'You' : isError ? 'System Notice' : 'BIS Intelligent Assistant'}
          </span>
          <span className="bis-message-time">{message.timestamp}</span>
        </div>

        {isUser ? (
          <div className="bis-user-message-bubble">
            <p>{message.content}</p>
          </div>
        ) : isError ? (
          <AssistantErrorState
            message={message.errorMessage || message.content}
            onRetry={onRetry}
            onNewInquiry={() => {
              const el = document.getElementById('bis-main-query-input');
              el?.focus();
            }}
          />
        ) : message.structuredData ? (
          <AIResponseView
            data={message.structuredData}
            onOpenEvidence={onOpenEvidence}
            onSelectSuggestion={onSelectSuggestion}
            onSubmitClarification={onSubmitClarification}
            onViewStandard={onViewStandard}
            onStartCompliance={onStartCompliance}
          />
        ) : (
          <div className="bis-assistant-plain-bubble">
            <p>{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
