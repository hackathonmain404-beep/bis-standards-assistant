import React from 'react';
import { useLanguage } from '../../state/LanguageContext';

export interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const { t } = useLanguage();

  const prompts = [
    'Find the applicable BIS standard for my product',
    'Check mandatory QCO requirements for electrical appliances',
    'Inspect certification schemes (ISI vs CRS) and testing guidelines',
    'Locate BIS recognized laboratories and accredited testing facilities',
  ];

  return (
    <div className="bis-suggested-prompts-container">
      <div className="bis-suggested-header">
        <span className="bis-suggested-icon">💡</span>
        <span className="bis-suggested-title">{t.chat.suggestedTitle}</span>
      </div>
      <div className="bis-suggested-list">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="bis-suggested-chip"
            onClick={() => onSelectPrompt(prompt)}
          >
            <span>{prompt}</span>
            <span className="bis-chip-arrow">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
};
