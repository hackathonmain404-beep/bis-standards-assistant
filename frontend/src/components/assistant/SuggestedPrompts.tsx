import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';

export interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  isFollowup?: boolean;
}

const PRIMARY_PROMPTS = [
  'Find applicable standards for my product',
  'Explain BIS certification requirements',
  'What testing is required?',
  'Find a testing laboratory',
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  onSelectPrompt,
  isFollowup = false,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bis-suggested-prompts-section ${
        isFollowup ? 'bis-suggested-prompts-section--followup' : ''
      }`}
    >
      <div className="bis-suggested-header">
        <Sparkles size={13} className="bis-suggested-icon" aria-hidden="true" />
        <span className="bis-suggested-label">
          {isFollowup ? (t.chat.suggestedTitle || 'Suggested follow-up inquiries:') : 'Try asking:'}
        </span>
      </div>

      <div className="bis-suggested-chips-grid">
        {PRIMARY_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="bis-compact-suggestion-chip"
            style={{ animationDelay: `${idx * 30}ms` }}
            onClick={() => onSelectPrompt(prompt)}
            title={prompt}
          >
            <span className="bis-chip-text">{prompt}</span>
            <ArrowUpRight size={14} className="bis-chip-arrow-icon" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
};
