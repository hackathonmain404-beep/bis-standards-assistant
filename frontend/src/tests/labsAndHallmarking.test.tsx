import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LaboratoryCard } from '../components/laboratories/LaboratoryCard';
import { LaboratoriesPage } from '../pages/LaboratoriesPage';
import { HallmarkingPage } from '../pages/HallmarkingPage';
import { MOCK_LABORATORIES } from '../mocks/mockLabsData';

describe('LaboratoryCard Component', () => {
  const sampleLab = MOCK_LABORATORIES[0];

  it('renders lab information, capabilities as chips, and status badge', () => {
    render(<LaboratoryCard lab={sampleLab} />);

    expect(screen.getByText(sampleLab.name)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(sampleLab.location.city, 'i'))).toBeInTheDocument();
    expect(screen.getByText(sampleLab.recognition_status)).toBeInTheDocument();

    // Check capabilities rendered as chips
    expect(screen.getByText('Food & Water Microbiological Analysis')).toBeInTheDocument();

    // Check standards chips
    expect(screen.getByText('IS 14543:2016')).toBeInTheDocument();
  });

  it('opens and closes the rich laboratory details modal', () => {
    render(<LaboratoryCard lab={sampleLab} />);

    const viewDetailsBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsBtn);

    // Modal should now be open
    expect(screen.getByText('Technical Capabilities & Scope')).toBeInTheDocument();
    expect(screen.getByText('Facility Address')).toBeInTheDocument();
    expect(screen.getAllByText(sampleLab.location.address!).length).toBeGreaterThan(0);

    // Close button
    const closeBtn = screen.getByRole('button', { name: /^close$/i });
    fireEvent.click(closeBtn);

    // Modal content should be dismissed
    expect(screen.queryByText('Technical Capabilities & Scope')).not.toBeInTheDocument();
  });
});

describe('LaboratoriesPage Component', () => {
  it('renders filter toolbar and handles reset', async () => {
    render(
      <MemoryRouter>
        <LaboratoriesPage />
      </MemoryRouter>
    );

    // Wait for labs to load
    await waitFor(() => {
      expect(screen.getByText(/recognized test facilities/i)).toBeInTheDocument();
    });

    // Check filter controls
    const searchInput = screen.getByPlaceholderText(/search by laboratory name/i);
    expect(searchInput).toBeInTheDocument();

    // Filter by search query
    fireEvent.change(searchInput, { target: { value: 'Sahibabad' } });
    expect(screen.getByDisplayValue('Sahibabad')).toBeInTheDocument();

    // Reset button appears
    const resetBtn = screen.getByRole('button', { name: /reset filters/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(searchInput).toHaveValue('');
  });
});

describe('HallmarkingPage Component', () => {
  it('renders 3 mandatory marks, quick navigation, and purity table', () => {
    render(<HallmarkingPage />);

    // Quick nav cards
    expect(screen.getByText('1. The 3 Mandatory Marks')).toBeInTheDocument();
    expect(screen.getByText('2. Gold Purity & Grades')).toBeInTheDocument();
    expect(screen.getByText('3. HUID Verification App')).toBeInTheDocument();

    // The 3 Mandatory Marks
    expect(screen.getByText('BIS Standard Mark')).toBeInTheDocument();
    expect(screen.getByText('Purity / Fineness Grade')).toBeInTheDocument();
    expect(screen.getByText('6-Digit HUID Code')).toBeInTheDocument();

    // Gold purity table
    expect(screen.getByRole('table', { name: /standard gold purity grades/i })).toBeInTheDocument();
    expect(screen.getAllByText('22K916').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('24K999')).toBeInTheDocument();

    // Consumer verification steps
    expect(screen.getByText('Download BIS CARE')).toBeInTheDocument();
    expect(screen.getByText('Select "Verify HUID"')).toBeInTheDocument();
  });
});
