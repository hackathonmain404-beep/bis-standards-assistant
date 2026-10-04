import React from 'react';
import { Sparkles, MessageSquarePlus, ArrowRight, Check } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  capabilities?: string[];
  suggestions?: string[];
  onSelectSuggestion?: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  capabilities = [
    'Find potentially relevant standards',
    'Explain certification paths',
    'Identify testing requirements',
    'Find recognized laboratories',
    'Explain BIS terminology',
  ],
  suggestions,
  onSelectSuggestion,
}) => {
  return (
    <div className="bis-empty-state">
      <div className="bis-empty-state-icon" aria-hidden="true">
        {icon || <Sparkles size={36} className="bis-text-accent" />}
      </div>
      <h3 className="bis-empty-state-title">{title}</h3>
      <p className="bis-empty-state-desc">{description}</p>

      {/* What I can help with guidance */}
      {capabilities && capabilities.length > 0 && (
        <div className="bis-empty-state-capabilities">
          <span className="bis-capabilities-heading">What I can help with</span>
          <div className="bis-capabilities-chips">
            {capabilities.map((cap, idx) => (
              <span key={idx} className="bis-capability-pill">
                <Check size={13} className="bis-cap-check-icon" aria-hidden="true" />
                <span>{cap}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}

      {suggestions && suggestions.length > 0 && onSelectSuggestion && (
        <div className="bis-empty-state-suggestions">
          <span className="bis-empty-state-suggestions-label">Explore sample compliance inquiries:</span>
          <div className="bis-prompt-cards-grid">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="bis-prompt-card"
                onClick={() => onSelectSuggestion(s)}
              >
                <div className="bis-prompt-card-icon">
                  <MessageSquarePlus size={16} />
                </div>
                <span className="bis-prompt-card-text">{s}</span>
                <ArrowRight size={14} className="bis-prompt-card-arrow" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
