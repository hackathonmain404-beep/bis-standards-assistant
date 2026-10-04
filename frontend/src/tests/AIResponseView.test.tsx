import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIResponseView } from '../components/assistant/AIResponseView';
import { MOCK_CASE_1_RECOMMENDATION } from '../mocks/mockAssistantData';

describe('AIResponseView component', () => {
  it('renders answer text, evidence status badge, and product understanding', () => {
    const handleOpenEvidence = vi.fn();
    render(
      <AIResponseView
        data={MOCK_CASE_1_RECOMMENDATION}
        onOpenEvidence={handleOpenEvidence}
      />
    );

    expect(screen.getByText(/Verified Evidence Available/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Stainless Steel Water Bottle/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/IS 17526:2021/i)[0]).toBeInTheDocument();
  });

  it('triggers onOpenEvidence when inline citation [1] is clicked', () => {
    const handleOpenEvidence = vi.fn();
    render(
      <AIResponseView
        data={MOCK_CASE_1_RECOMMENDATION}
        onOpenEvidence={handleOpenEvidence}
      />
    );

    const citationBtn = screen.getByRole('button', { name: /view evidence reference 1/i });
    expect(citationBtn).toBeInTheDocument();

    fireEvent.click(citationBtn);
    expect(handleOpenEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ standard_id: 'IS 17526:2021' })
    );
  });
});
