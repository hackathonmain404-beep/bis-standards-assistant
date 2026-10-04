import React from 'react';
import { AlertTriangle, RotateCcw, Plus } from 'lucide-react';

export interface AssistantErrorStateProps {
  onRetry?: () => void;
  onNewInquiry?: () => void;
  message?: string;
}

export const AssistantErrorState: React.FC<AssistantErrorStateProps> = ({
  onRetry,
  onNewInquiry,
  message,
}) => {
  return (
    <div className="bis-assistant-error-card" role="alert">
      <div className="bis-error-header">
        <div className="bis-error-badge">
          <AlertTriangle size={16} className="bis-error-badge-icon" aria-hidden="true" />
          <span className="bis-error-badge-title">WE COULDN'T COMPLETE THIS REQUEST</span>
        </div>
      </div>

      <p className="bis-error-lead">
        The assistant could not retrieve the required regulatory information.
      </p>

      {message && (
        <p className="bis-error-detail-text">
          Notice: {message}
        </p>
      )}

      <div className="bis-error-actions">
        {onRetry && (
          <button
            type="button"
            className="bis-error-btn bis-error-btn--primary"
            onClick={onRetry}
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Try Again</span>
          </button>
        )}

        {onNewInquiry && (
          <button
            type="button"
            className="bis-error-btn bis-error-btn--secondary"
            onClick={onNewInquiry}
          >
            <Plus size={14} aria-hidden="true" />
            <span>Start New Inquiry</span>
          </button>
        )}
      </div>
    </div>
  );
};
