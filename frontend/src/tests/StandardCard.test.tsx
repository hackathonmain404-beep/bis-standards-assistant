import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StandardCard } from '../components/standards/StandardCard';
import { StandardRecommendation } from '../types/standards';

const sampleStandard: StandardRecommendation = {
  standard_number: 'IS 17526:2021',
  title: 'Stainless Steel Vacuum Flasks and Bottles',
  status: 'Active',
  short_description: 'Covers vacuum insulated domestic containers.',
  is_mandatory: true,
  match_reasons: [
    { category: 'Product Category', label: 'Domestic storage', status: 'matched' },
    { category: 'Material', label: 'Stainless steel grade', status: 'matched' },
  ],
};

describe('StandardCard component', () => {
  it('renders standard number, title, and match reasons', () => {
    render(<StandardCard standard={sampleStandard} />);

    expect(screen.getByText('IS 17526:2021')).toBeInTheDocument();
    expect(screen.getByText('Stainless Steel Vacuum Flasks and Bottles')).toBeInTheDocument();
    expect(screen.getByText(/Mandatory QCO/i)).toBeInTheDocument();
    expect(screen.getByText(/Domestic storage/i)).toBeInTheDocument();
  });

  it('opens WhyThisStandard modal on button click', () => {
    render(<StandardCard standard={sampleStandard} />);

    const whyBtn = screen.getByRole('button', { name: /why this standard\?/i });
    fireEvent.click(whyBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Relevance Rationale — IS 17526:2021/i)).toBeInTheDocument();
  });

  it('calls compliance callback when button clicked', () => {
    const handleCompliance = vi.fn();
    render(<StandardCard standard={sampleStandard} onStartCompliance={handleCompliance} />);

    const complianceBtn = screen.getByRole('button', { name: /compliance path →/i });
    fireEvent.click(complianceBtn);

    expect(handleCompliance).toHaveBeenCalledWith('IS 17526:2021');
  });
});
