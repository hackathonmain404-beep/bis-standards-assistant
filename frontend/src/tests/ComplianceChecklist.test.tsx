import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplianceChecklist } from '../components/compliance/ComplianceChecklist';
import { ChecklistItem } from '../types/compliance';

const sampleItems: ChecklistItem[] = [
  { id: '1', title: 'Confirm Indian Standard', completed: true, required: true, category: 'Standards Review' },
  { id: '2', title: 'Setup In-house Testing Lab', completed: false, required: true, category: 'Testing' },
  { id: '3', title: 'Submit Form-V Application', completed: false, required: true, category: 'Documentation' },
];

describe('ComplianceChecklist component', () => {
  it('renders checklist items and calculates correct progress', () => {
    const handleToggle = vi.fn();
    render(<ComplianceChecklist items={sampleItems} onToggleItem={handleToggle} />);

    expect(screen.getByText('Confirm Indian Standard')).toBeInTheDocument();
    expect(screen.getByText('Setup In-house Testing Lab')).toBeInTheDocument();
    // 1 of 3 completed = 33%
    expect(screen.getByText('(33%)')).toBeInTheDocument();
  });

  it('triggers onToggleItem when an item is clicked', () => {
    const handleToggle = vi.fn();
    render(<ComplianceChecklist items={sampleItems} onToggleItem={handleToggle} />);

    const item = screen.getByText('Setup In-house Testing Lab');
    fireEvent.click(item);

    expect(handleToggle).toHaveBeenCalledWith('2');
  });
});
