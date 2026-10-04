import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../state/LanguageContext';
import { ComplianceProvider } from '../state/ComplianceContext';
import { AssistantProvider } from '../state/AssistantContext';
import { AssistantHeader } from '../components/assistant/AssistantHeader';
import { SuggestedPrompts } from '../components/assistant/SuggestedPrompts';
import { ChatInput } from '../components/assistant/ChatInput';
import { AssistantPage } from '../pages/AssistantPage';

describe('Assistant Chat UI Refinements', () => {
  describe('AssistantHeader Component', () => {
    it('renders BIS Standards Knowledge Copilot badge, title, and subtitle when expanded', () => {
      render(
        <LanguageProvider>
          <AssistantHeader isCompact={false} />
        </LanguageProvider>
      );

      expect(screen.getByText(/BIS Standards Knowledge Copilot/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /BIS Intelligent Assistant/i })).toBeInTheDocument();
      expect(screen.getByText(/Get guidance on standards, QCOs, certification, testing and compliance/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /start new conversation/i })).not.toBeInTheDocument();
    });

    it('renders compact header with New Chat button when active conversation', () => {
      const handleNewChat = vi.fn();
      render(
        <LanguageProvider>
          <AssistantHeader isCompact={true} onNewSession={handleNewChat} />
        </LanguageProvider>
      );

      expect(screen.getByRole('heading', { level: 1, name: /BIS Intelligent Assistant/i })).toBeInTheDocument();
      expect(screen.queryByText(/Get guidance on standards, QCOs, certification, testing and compliance/i)).not.toBeInTheDocument();
      const newChatBtn = screen.getByRole('button', { name: /start new conversation/i });
      expect(newChatBtn).toBeInTheDocument();
      fireEvent.click(newChatBtn);
      expect(handleNewChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('SuggestedPrompts Component', () => {
    it('renders Try asking label and 4 compact chips with staggered animation delays', () => {
      const handleSelect = vi.fn();
      const { container } = render(
        <LanguageProvider>
          <SuggestedPrompts onSelectPrompt={handleSelect} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Try asking:/i)).toBeInTheDocument();

      const chips = screen.getAllByRole('button');
      expect(chips).toHaveLength(4);
      expect(screen.getByText('Find applicable standards for my product')).toBeInTheDocument();
      expect(screen.getByText('Explain BIS certification requirements')).toBeInTheDocument();
      expect(screen.getByText('What testing is required?')).toBeInTheDocument();
      expect(screen.getByText('Find a testing laboratory')).toBeInTheDocument();

      // Check staggered delays
      expect(chips[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(chips[1]).toHaveStyle({ animationDelay: '30ms' });
      expect(chips[2]).toHaveStyle({ animationDelay: '60ms' });
      expect(chips[3]).toHaveStyle({ animationDelay: '90ms' });

      // Click a chip
      fireEvent.click(chips[0]);
      expect(handleSelect).toHaveBeenCalledWith('Find applicable standards for my product');
    });

    it('renders follow-up label when isFollowup is true', () => {
      const handleSelect = vi.fn();
      render(
        <LanguageProvider>
          <SuggestedPrompts onSelectPrompt={handleSelect} isFollowup={true} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Suggested Inquiries|Suggested follow-up inquiries:/i)).toBeInTheDocument();
    });
  });

  describe('ChatInput Visual Focus & Accessibility', () => {
    it('renders accessible textarea, Send button, mic button, counter, and disclaimer', () => {
      const handleSend = vi.fn();
      render(
        <LanguageProvider>
          <ChatInput onSendMessage={handleSend} isLoading={false} />
        </LanguageProvider>
      );

      const textarea = screen.getByRole('textbox', { name: /ask about bis indian standards/i });
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('id', 'bis-main-query-input');

      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn).toBeInTheDocument();
      expect(sendBtn).toHaveAttribute('id', 'bis-send-query-btn');
      expect(sendBtn).toBeDisabled();

      const micBtn = screen.getByRole('button', { name: /voice input/i });
      expect(micBtn).toBeInTheDocument();

      expect(screen.getByText(/0\/5000/i)).toBeInTheDocument();
      expect(screen.getByText(/Official Regulatory Advisory/i)).toBeInTheDocument();
      expect(screen.getByText(/Cross-reference official BIS gazettes/i)).toBeInTheDocument();
    });

    it('handles typing, char counter updates, and Enter key submission', () => {
      const handleSend = vi.fn();
      render(
        <LanguageProvider>
          <ChatInput onSendMessage={handleSend} isLoading={false} />
        </LanguageProvider>
      );

      const textarea = screen.getByRole('textbox', { name: /ask about bis indian standards/i });
      fireEvent.change(textarea, { target: { value: 'What is ISI mark scheme I?' } });

      expect(screen.getByText(/26\/5000/i)).toBeInTheDocument();

      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn).not.toBeDisabled();

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      expect(handleSend).toHaveBeenCalledWith('What is ISI mark scheme I?');
    });
  });

  describe('AssistantPage Viewport Layout & Flow', () => {
    it('renders initial empty state with top suggestions and bottom composer dock', () => {
      render(
        <LanguageProvider>
          <ComplianceProvider>
            <AssistantProvider>
              <MemoryRouter>
                <AssistantPage />
              </MemoryRouter>
            </AssistantProvider>
          </ComplianceProvider>
        </LanguageProvider>
      );

      // Assistant identity
      expect(screen.getByRole('heading', { level: 1, name: /BIS Intelligent Assistant/i })).toBeInTheDocument();

      // Top suggestions are immediately visible without scrolling
      expect(screen.getByText(/Try asking:/i)).toBeInTheDocument();
      expect(screen.getByText('Find applicable standards for my product')).toBeInTheDocument();

      // Viewport hint cards
      expect(screen.getByText(/BIS Standard Discovery/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Certification Schemes/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Testing & Laboratories/i)).toBeInTheDocument();

      // Composer dock at bottom
      expect(screen.getByRole('textbox', { name: /ask about bis indian standards/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('clicking a suggested prompt sends message and transitions to active conversation', async () => {
      render(
        <LanguageProvider>
          <ComplianceProvider>
            <AssistantProvider>
              <MemoryRouter>
                <AssistantPage />
              </MemoryRouter>
            </AssistantProvider>
          </ComplianceProvider>
        </LanguageProvider>
      );

      const promptBtn = screen.getByRole('button', { name: /Find applicable standards for my product/i });
      fireEvent.click(promptBtn);

      // User message bubble appears immediately
      expect(screen.getByText('Find applicable standards for my product')).toBeInTheDocument();

      // Header becomes compact with New Chat button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start new conversation/i })).toBeInTheDocument();
      });
    });

    it('ensures top assistant content is rendered inside the primary chat stream container for natural mobile scrolling', () => {
      const { container } = render(
        <LanguageProvider>
          <ComplianceProvider>
            <AssistantProvider>
              <MemoryRouter>
                <AssistantPage />
              </MemoryRouter>
            </AssistantProvider>
          </ComplianceProvider>
        </LanguageProvider>
      );

      // Verify the single vertical scroll container exists
      const chatStream = container.querySelector('.bis-chat-stream');
      expect(chatStream).toBeInTheDocument();
      expect(chatStream).toHaveClass('bis-chat-stream--empty');

      // Verify empty state container exists inside chat stream
      const emptyContainer = container.querySelector<HTMLElement>('.bis-assistant-empty-container');
      expect(emptyContainer).toBeInTheDocument();
      expect(chatStream).toContainElement(emptyContainer);

      // Verify all upper content is inside this emptyContainer at the top:
      // 1. Heading
      const heading = screen.getByRole('heading', { level: 1, name: /BIS Intelligent Assistant/i });
      expect(emptyContainer).toContainElement(heading);

      // 2. Badge & Subtitle
      expect(screen.getByText(/BIS Standards Knowledge Copilot/i)).toBeInTheDocument();
      expect(screen.getByText(/Get guidance on standards, QCOs, certification, testing and compliance/i)).toBeInTheDocument();

      // 3. Workflow indicator
      expect(screen.getByText(/Describe Product/i)).toBeInTheDocument();
      expect(screen.getByText(/Find Standards/i)).toBeInTheDocument();

      // 4. Suggested Prompts
      expect(screen.getByText(/Try asking:/i)).toBeInTheDocument();
      expect(screen.getByText('Find applicable standards for my product')).toBeInTheDocument();

      // 5. Explore BIS Compliance Quick Action Cards
      expect(screen.getByText(/Explore BIS Compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/BIS Standard Discovery/i)).toBeInTheDocument();
      expect(screen.getByText(/Certification Schemes/i)).toBeInTheDocument();
      expect(screen.getByText(/Testing & Laboratories/i)).toBeInTheDocument();
    });
  });
});
