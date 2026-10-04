import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '../components/assistant/ChatInput';
import { LanguageProvider } from '../state/LanguageContext';

describe('ChatInput component', () => {
  it('renders input textarea and send button', () => {
    const handleSend = vi.fn();
    render(
      <LanguageProvider>
        <ChatInput onSendMessage={handleSend} isLoading={false} />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox', { name: /ask about bis indian standards/i });
    expect(textarea).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled(); // Disabled when empty
  });

  it('enables send button when text is entered and triggers submission', () => {
    const handleSend = vi.fn();
    render(
      <LanguageProvider>
        <ChatInput onSendMessage={handleSend} isLoading={false} />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'What is IS 14543?' } });

    const button = screen.getByRole('button', { name: /send/i });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(handleSend).toHaveBeenCalledWith('What is IS 14543?');
  });

  it('submits on Enter key without shift', () => {
    const handleSend = vi.fn();
    render(
      <LanguageProvider>
        <ChatInput onSendMessage={handleSend} isLoading={false} />
      </LanguageProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Tell me about electric irons' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(handleSend).toHaveBeenCalledWith('Tell me about electric irons');
  });
});
