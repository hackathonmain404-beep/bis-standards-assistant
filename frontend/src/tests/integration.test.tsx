import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../state/LanguageContext';
import { ComplianceProvider } from '../state/ComplianceContext';
import { AssistantProvider } from '../state/AssistantContext';
import { AssistantPage } from '../pages/AssistantPage';

describe('Assistant Integration Flow', () => {
  it('submits a user query and renders the structured AI copilot response', async () => {
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

    // Initial empty state should be visible
    expect(screen.getByText('BIS Intelligent Assistant')).toBeInTheDocument();

    // Type query in chat input
    const input = screen.getByRole('textbox', { name: /ask about bis indian standards/i });
    fireEvent.change(input, {
      target: { value: 'I manufacture stainless steel water bottles for household use. Which BIS standards apply?' },
    });

    const sendBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendBtn);

    // Should display the user message immediately
    expect(screen.getByText(/I manufacture stainless steel water bottles/i)).toBeInTheDocument();

    // Wait for the mock API response to resolve and render structured response
    await waitFor(
      () => {
        expect(screen.getAllByText(/IS 17526:2021/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Verified Evidence Available/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
