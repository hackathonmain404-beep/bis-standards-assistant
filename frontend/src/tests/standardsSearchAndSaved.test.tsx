import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { StandardsSearchPage } from '../pages/StandardsSearchPage';
import { SavedJourneyPage } from '../pages/SavedJourneyPage';
import { AppHeader } from '../components/layout/AppHeader';
import { AssistantProvider } from '../state/AssistantContext';
import { LanguageProvider } from '../state/LanguageContext';
import { ThemeProvider } from '../state/ThemeContext';
import { SidebarProvider } from '../state/SidebarContext';
import { ComplianceProvider } from '../state/ComplianceContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <SidebarProvider>
          <LanguageProvider>
            <ComplianceProvider>
              <AssistantProvider>
                {ui}
              </AssistantProvider>
            </ComplianceProvider>
          </LanguageProvider>
        </SidebarProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('StandardsSearchPage Workspace', () => {
  it('renders search input, filter toolbar, and loads matching standards', async () => {
    renderWithProviders(<StandardsSearchPage />);

    expect(screen.getByText('National Standards Directory')).toBeInTheDocument();
    expect(screen.getByText('Search & Verify Indian Standards')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by is number/i);
    expect(searchInput).toBeInTheDocument();

    // Check primary filter labels on toolbar
    expect(screen.getByLabelText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^status$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^regulatory qco$/i)).toBeInTheDocument();

    // Check More Filters drawer opens and reveals secondary filters
    const moreFiltersBtn = screen.getByRole('button', { name: /more filters/i });
    expect(moreFiltersBtn).toBeInTheDocument();
    fireEvent.click(moreFiltersBtn);
    expect(screen.getByLabelText(/^technical division$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^certification scheme$/i)).toBeInTheDocument();

    // Wait for standards to load
    await waitFor(() => {
      expect(screen.getByText('IS 14543:2016')).toBeInTheDocument();
    });

    expect(screen.getByText('IS 17526:2021')).toBeInTheDocument();
  });

  it('filters by category, renders active filter chips, and allows clearing', async () => {
    renderWithProviders(<StandardsSearchPage />);

    await waitFor(() => {
      expect(screen.getByText('IS 14543:2016')).toBeInTheDocument();
    });

    // Select Food & Beverages category
    const catSelect = screen.getByLabelText(/^category$/i);
    fireEvent.change(catSelect, { target: { value: 'Food & Beverages' } });

    // Active chip appears
    await waitFor(() => {
      expect(screen.getByText(/category: food & beverages/i)).toBeInTheDocument();
    });

    // Clear all chips button
    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    expect(clearAllBtn).toBeInTheDocument();
    fireEvent.click(clearAllBtn);

    // Filter resets back to All
    expect(catSelect).toHaveValue('All');
  });
});

describe('SavedJourneyPage Workspace', () => {
  it('renders stats row, tab controls, and empty or saved items', () => {
    renderWithProviders(<SavedJourneyPage />);

    expect(screen.getByText('Personal Compliance Workspace')).toBeInTheDocument();
    expect(screen.getByText('Saved Items & Milestones')).toBeInTheDocument();

    // Tab buttons
    expect(screen.getByRole('tab', { name: /all workspace items/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /bookmarked standards/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /completed milestones/i })).toBeInTheDocument();

    // Stats
    expect(screen.getAllByText(/Bookmarked Standards/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Milestones Met')).toBeInTheDocument();
  });
});

describe('AppHeader Responsive Navigation & Overflow Menu', () => {
  it('renders brand, theme toggle, handles overflow toggle and login interaction', () => {
    renderWithProviders(<AppHeader />);

    expect(screen.getByText('Copilot')).toBeInTheDocument();
    expect(screen.getByText('Compliance & Standards')).toBeInTheDocument();

    // Theme toggle button
    const themeBtn = screen.getByTitle(/switch to dark mode|switch to light mode/i);
    expect(themeBtn).toBeInTheDocument();

    // Login button
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).toBeInTheDocument();

    // Overflow button
    const overflowBtn = screen.getByLabelText(/more options/i);
    expect(overflowBtn).toBeInTheDocument();

    // Open overflow menu
    fireEvent.click(overflowBtn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();

    // Close on second click
    fireEvent.click(overflowBtn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Open Login dialog
    fireEvent.click(loginBtn);
    expect(screen.getByText('BIS Portal Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/close dialog/i));
    expect(screen.queryByText('BIS Portal Login')).not.toBeInTheDocument();
  });
});

