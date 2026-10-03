import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../state/ThemeContext';
import { SidebarProvider, useSidebar } from '../state/SidebarContext';
import { LanguageProvider } from '../state/LanguageContext';
import { ComplianceProvider } from '../state/ComplianceContext';
import { AssistantProvider } from '../state/AssistantContext';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';

const ThemeConsumer: React.FC = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <span data-testid="resolved-theme-val">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

const SidebarConsumer: React.FC = () => {
  const { isCollapsed, toggleCollapse, mobileOpen, toggleMobile, closeMobile } = useSidebar();
  return (
    <div>
      <span data-testid="collapsed-val">{isCollapsed ? 'collapsed' : 'expanded'}</span>
      <span data-testid="mobile-val">{mobileOpen ? 'mobile-open' : 'mobile-closed'}</span>
      <button onClick={toggleCollapse}>Toggle Desktop</button>
      <button onClick={toggleMobile}>Toggle Mobile</button>
      <button onClick={closeMobile}>Close Mobile</button>
    </div>
  );
};

describe('Theme System & Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('initializes with default theme and updates document attributes', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const themeVal = screen.getByTestId('theme-val').textContent;
    expect(themeVal).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('bis_theme')).toBe('dark');
  });

  it('toggles theme between light and dark', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const toggleBtn = screen.getByText('Toggle Theme');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme-val').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme-val').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('Collapsible Sidebar System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages collapsed state and desktop toggle with persistence', () => {
    render(
      <SidebarProvider>
        <SidebarConsumer />
      </SidebarProvider>
    );

    // Initial state is collapsed (compact 70px mode as requested)
    expect(screen.getByTestId('collapsed-val').textContent).toBe('collapsed');

    // Toggle to expanded
    fireEvent.click(screen.getByText('Toggle Desktop'));
    expect(screen.getByTestId('collapsed-val').textContent).toBe('expanded');
    expect(localStorage.getItem('bis_sidebar_collapsed')).toBe('false');

    // Toggle back to collapsed
    fireEvent.click(screen.getByText('Toggle Desktop'));
    expect(screen.getByTestId('collapsed-val').textContent).toBe('collapsed');
    expect(localStorage.getItem('bis_sidebar_collapsed')).toBe('true');
  });

  it('manages mobile drawer and handles Escape key', () => {
    render(
      <SidebarProvider>
        <SidebarConsumer />
      </SidebarProvider>
    );

    expect(screen.getByTestId('mobile-val').textContent).toBe('mobile-closed');

    fireEvent.click(screen.getByText('Toggle Mobile'));
    expect(screen.getByTestId('mobile-val').textContent).toBe('mobile-open');

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('mobile-val').textContent).toBe('mobile-closed');
  });
});

describe('AppHeader and AppSidebar Integration', () => {
  it('renders AppHeader with accessible controls and mode switcher', () => {
    render(
      <ThemeProvider>
        <SidebarProvider>
          <LanguageProvider>
            <ComplianceProvider>
              <AssistantProvider>
                <MemoryRouter>
                  <AppHeader />
                </MemoryRouter>
              </AssistantProvider>
            </ComplianceProvider>
          </LanguageProvider>
        </SidebarProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('Copilot')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    expect(screen.getByText('Industry / MSME')).toBeInTheDocument();
    expect(screen.getByText('Consumer')).toBeInTheDocument();
    expect(screen.getByTitle('Switch to dark mode')).toBeInTheDocument();
  });

  it('renders AppSidebar with navigation links and tooltips in collapsed mode', () => {
    render(
      <ThemeProvider>
        <SidebarProvider>
          <LanguageProvider>
            <ComplianceProvider>
              <AssistantProvider>
                <MemoryRouter>
                  <AppSidebar />
                </MemoryRouter>
              </AssistantProvider>
            </ComplianceProvider>
          </LanguageProvider>
        </SidebarProvider>
      </ThemeProvider>
    );

    const nav = screen.getByRole('navigation', { name: 'Main Navigation' });
    expect(nav).toBeInTheDocument();

    // In default collapsed mode, tooltips are rendered
    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
  });
});
