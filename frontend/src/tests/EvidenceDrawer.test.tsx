import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import { Citation } from '../types/evidence';

const sampleCitation: Citation = {
  index: 1,
  standard_id: 'IS 14543:2016',
  document_title: 'Packaged Drinking Water — Specification',
  section: 'Section 4.2',
  clause: 'Clause 4.2',
  snippet: 'The pH value of packaged drinking water shall be between 6.5 and 8.5.',
  url: 'https://standardsbis.bsbedge.com',
};

describe('EvidenceDrawer component', () => {
  it('renders nothing when isOpen is false', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <EvidenceDrawer isOpen={false} onClose={handleClose} evidence={sampleCitation} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders evidence details and verbatim snippet when open', () => {
    const handleClose = vi.fn();
    render(
      <EvidenceDrawer isOpen={true} onClose={handleClose} evidence={sampleCitation} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('IS 14543:2016')).toBeInTheDocument();
    expect(screen.getByText(/The pH value of packaged drinking water/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Repository Evidence/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <EvidenceDrawer isOpen={true} onClose={handleClose} evidence={sampleCitation} />
    );

    const closeBtn = screen.getByRole('button', { name: /close evidence panel/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
