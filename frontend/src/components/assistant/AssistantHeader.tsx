import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';

export interface AssistantHeaderProps {
  isCompact?: boolean;
  onNewSession?: () => void;
  activeStep?: number;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  isCompact = false,
  onNewSession,
  activeStep = 1,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bis-assistant-header ${
        isCompact ? 'bis-assistant-header--compact' : 'bis-assistant-header--expanded'
      }`}
    >
      <div className="bis-assistant-header-content">
        <div className="bis-assistant-header-titles">
          <h1 className="bis-assistant-title">{t.app.title || 'BIS Intelligent Assistant'}</h1>
          {!isCompact && (
            <>
              <p className="bis-assistant-prompt-lead">
                Describe your product or ask about an Indian Standard.
              </p>
              <p className="bis-assistant-subtitle">
                Get guidance on standards, QCOs, certification, testing and compliance.
              </p>

              {/* Subtle Workflow Indicator (Section 5) */}
              <div className="bis-assistant-workflow-indicator" aria-label="BIS Compliance Workflow Progression">
                <div className={`bis-wf-step ${activeStep === 1 ? 'bis-wf-step--active' : ''}`}>
                  <span className="bis-wf-num">1</span>
                  <span className="bis-wf-text">Describe Product</span>
                </div>
                <span className="bis-wf-arrow" aria-hidden="true">→</span>
                <div className={`bis-wf-step ${activeStep === 2 ? 'bis-wf-step--active' : ''}`}>
                  <span className="bis-wf-num">2</span>
                  <span className="bis-wf-text">Find Standards</span>
                </div>
                <span className="bis-wf-arrow" aria-hidden="true">→</span>
                <div className={`bis-wf-step ${activeStep === 3 ? 'bis-wf-step--active' : ''}`}>
                  <span className="bis-wf-num">3</span>
                  <span className="bis-wf-text">Verify Evidence</span>
                </div>
                <span className="bis-wf-arrow" aria-hidden="true">→</span>
                <div className={`bis-wf-step ${activeStep === 4 ? 'bis-wf-step--active' : ''}`}>
                  <span className="bis-wf-num">4</span>
                  <span className="bis-wf-text">Plan Compliance</span>
                </div>
              </div>
            </>
          )}
        </div>

        {isCompact && onNewSession && (
          <button
            type="button"
            className="bis-header-new-chat-btn"
            onClick={onNewSession}
            title="Start new conversation"
            aria-label="Start new conversation"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>New Chat</span>
          </button>
        )}
      </div>
    </div>
  );
};
