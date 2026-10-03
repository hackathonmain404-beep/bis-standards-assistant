import React from 'react';
import { useLanguage } from '../../state/LanguageContext';

export interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const { t } = useLanguage();

  const prompts = [
    'I manufacture stainless steel water bottles for household use. Which BIS standards apply?',
    'What BIS certification and testing are required for electric steam irons?',
    'I want to get a BIS mark for my electric heater.',
    'What is IS 14543:2016 for packaged drinking water?',
    'What is the BIS standard for quantum computing cryogenic dilution refrigerators?',
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
