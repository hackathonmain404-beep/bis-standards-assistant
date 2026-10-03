import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Globe,
  BookOpen,
  Plus,
  Building2,
  User,
  FlaskConical,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAssistant } from '../../state/AssistantContext';
import { useLanguage } from '../../state/LanguageContext';
import { useTheme } from '../../state/ThemeContext';
import { useSidebar } from '../../state/SidebarContext';
import { LanguageCode } from '../../types/assistant';
import { isMockMode, setMockMode } from '../../services/apiConfig';
import { Button } from '../common/Button';

export const AppHeader: React.FC = () => {
  const {
    userMode,
    setUserMode,
    newSession,
    isEvidenceDrawerOpen,
    openEvidence,
    activeEvidence,
    loadMockCase,
  } = useAssistant();
  const { language, setLanguage, t } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { toggleCollapse, toggleMobile } = useSidebar();
  const [mockActive, setMockActiveState] = useState(isMockMode);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  const handleToggleMock = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith('case:')) {
      const caseNum = parseInt(val.replace('case:', ''), 10);
      loadMockCase(caseNum);
    } else if (val === 'live') {
      setMockMode(false);
      setMockActiveState(false);
    } else if (val === 'mock') {
      setMockMode(true);
      setMockActiveState(true);
    }
  };

  const handleHamburgerClick = () => {
    if (window.innerWidth < 768) {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };

  // Close overflow menu on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverflowOpen(false);
      }
    };

    if (isOverflowOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOverflowOpen]);

  const handleOpenEvidence = () => {
    if (activeEvidence) {
      openEvidence(activeEvidence);
    } else {
      openEvidence({
        index: 1,
        standard_id: 'IS 17526:2021',
        document_title: 'Stainless Steel Vacuum Flasks and Insulated Bottles',
        section: 'Section 1',
        clause: 'Clause 1.1',
        snippet:
          'Click any citation marker [N] or source card to view exact verified clause texts.',
      });
    }
    setIsOverflowOpen(false);
  };

  return (
    <header className="bis-app-header">
      {/* Group A: Menu Hamburger + Brand Title */}
      <div className="bis-header-left">
        <button
          type="button"
          className="bis-header-menu-btn"
          onClick={handleHamburgerClick}
          aria-label="Toggle navigation menu"
          title="Toggle Navigation (Alt+B)"
        >
          <Menu size={20} />
        </button>

        <div className="bis-header-brand-wrap">
          <div className="bis-header-badge">BIS</div>
          <div className="bis-header-titles">
            <span className="bis-header-title">Copilot</span>
            <span className="bis-header-tagline">Compliance & Standards</span>
          </div>
        </div>
      </div>

      {/* Group B: Mode / Segmented Control (Visible on >= 640px) */}
      <div className="bis-header-center bis-header-center-desktop">
        <div
          className="bis-segmented-control"
          role="radiogroup"
          aria-label={t.header.modeSelector}
        >
          <button
            type="button"
            role="radio"
            aria-checked={userMode === 'industry'}
            className={`bis-segment-btn ${
              userMode === 'industry' ? 'bis-segment-btn--active' : ''
            }`}
            onClick={() => setUserMode('industry')}
          >
            <Building2 size={15} />
            <span>{t.header.modeIndustry}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={userMode === 'consumer'}
            className={`bis-segment-btn ${
              userMode === 'consumer' ? 'bis-segment-btn--active' : ''
            }`}
            onClick={() => setUserMode('consumer')}
          >
            <User size={15} />
            <span>{t.header.modeConsumer}</span>
          </button>
        </div>
      </div>

      {/* Group C: Application Controls */}
      <div className="bis-header-right">
        {/* Language Selector (Visible on >= 990px) */}
        <div className="bis-header-select-pill bis-header-lang-desktop">
          <Globe size={15} className="bis-pill-icon" />
          <select
            id="bis-language-select"
            className="bis-compact-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            aria-label={t.header.language}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="or">ଓଡ଼ିଆ (Odia)</option>
          </select>
        </div>

        {/* Adapter Mode & Test Scenarios (Visible on >= 1200px) */}
        <div className="bis-header-select-pill bis-header-select-pill--adapter bis-header-adapter-desktop">
          <FlaskConical size={15} className="bis-pill-icon" />
          <select
            id="bis-mock-mode-select"
            className="bis-compact-select"
            onChange={handleToggleMock}
            defaultValue={mockActive ? 'mock' : 'live'}
            title="Switch between live backend API and test mock scenarios"
            aria-label="API Adapter and Test Scenarios"
          >
            <optgroup label="Adapter Mode">
              <option value="mock">Mode: Mock Data</option>
              <option value="live">Mode: Live Backend (/api/v1)</option>
            </optgroup>
            <optgroup label="Load Test Scenarios">
              <option value="case:1">Case 1: Standard Rec</option>
              <option value="case:2">Case 2: Missing Info</option>
              <option value="case:3">Case 3: Comparison</option>
              <option value="case:4">Case 4: Insufficient Evid</option>
              <option value="case:5">Case 5: Error & Retry</option>
            </optgroup>
          </select>
        </div>

        {/* Theme Toggle (Always visible directly in header) */}
        <button
          type="button"
          className="bis-header-action-btn bis-theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={
            resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
          title={
            resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
        >
          {resolvedTheme === 'dark' ? (
            <Sun size={18} className="bis-theme-icon-sun" />
          ) : (
            <Moon size={18} className="bis-theme-icon-moon" />
          )}
        </button>

        {/* Evidence Drawer Toggle (Direct on >= 1150px) */}
        <button
          type="button"
          className={`bis-header-action-btn bis-header-evidence-desktop ${
            isEvidenceDrawerOpen ? 'bis-header-action-btn--active' : ''
          }`}
          onClick={handleOpenEvidence}
          title={t.header.evidencePanel}
          aria-label={t.header.evidencePanel}
        >
          <BookOpen size={17} />
          <span className="bis-btn-label-desktop">{t.header.evidencePanel}</span>
        </button>

        {/* New Session Button (Direct on >= 1150px) */}
        <div className="bis-header-new-desktop">
          <Button
            variant="primary"
            size="sm"
            onClick={newSession}
            icon={<Plus size={15} />}
            id="bis-header-new-session-btn"
          >
            <span className="bis-btn-label-desktop">{t.header.newSession}</span>
          </Button>
        </div>

        {/* Responsive Overflow "More ⋯" Menu (Visible on < 1150px) */}
        <div className="bis-header-overflow-wrap" ref={overflowRef}>
          <button
            type="button"
            className={`bis-header-action-btn bis-header-overflow-btn ${
              isOverflowOpen ? 'bis-header-action-btn--active' : ''
            }`}
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
            aria-expanded={isOverflowOpen}
            aria-haspopup="true"
            aria-label="More options"
            title="More application controls"
          >
            {isOverflowOpen ? <X size={18} /> : <MoreHorizontal size={18} />}
          </button>

          {isOverflowOpen && (
            <div className="bis-header-overflow-dropdown" role="menu">
              {/* Mobile Mode Switcher (Visible only on < 640px) */}
              <div className="bis-overflow-section bis-overflow-mobile-mode">
                <span className="bis-overflow-heading">Target Mode</span>
                <div className="bis-segmented-control">
                  <button
                    type="button"
                    className={`bis-segment-btn ${
                      userMode === 'industry' ? 'bis-segment-btn--active' : ''
                    }`}
                    onClick={() => {
                      setUserMode('industry');
                      setIsOverflowOpen(false);
                    }}
                  >
                    <Building2 size={14} />
                    <span>Industry</span>
                  </button>
                  <button
                    type="button"
                    className={`bis-segment-btn ${
                      userMode === 'consumer' ? 'bis-segment-btn--active' : ''
                    }`}
                    onClick={() => {
                      setUserMode('consumer');
                      setIsOverflowOpen(false);
                    }}
                  >
                    <User size={14} />
                    <span>Consumer</span>
                  </button>
                </div>
              </div>

              {/* Tablet/Mobile Language Switcher (Visible on < 990px) */}
              <div className="bis-overflow-section bis-overflow-mobile-lang">
                <span className="bis-overflow-heading">Language</span>
                <div className="bis-header-select-pill">
                  <Globe size={15} className="bis-pill-icon" />
                  <select
                    className="bis-compact-select"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as LanguageCode);
                      setIsOverflowOpen(false);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="or">ଓଡ଼ିଆ (Odia)</option>
                  </select>
                </div>
              </div>

              {/* Actions Section */}
              <div className="bis-overflow-section">
                <span className="bis-overflow-heading">Quick Actions</span>
                <button
                  type="button"
                  className="bis-overflow-menu-item"
                  onClick={handleOpenEvidence}
                >
                  <BookOpen size={16} />
                  <span>{t.header.evidencePanel}</span>
                </button>
                <button
                  type="button"
                  className="bis-overflow-menu-item"
                  onClick={() => {
                    newSession();
                    setIsOverflowOpen(false);
                  }}
                >
                  <Plus size={16} />
                  <span>{t.header.newSession}</span>
                </button>
              </div>

              {/* Adapter & Scenarios Section */}
              <div className="bis-overflow-section">
                <span className="bis-overflow-heading">Environment & Test Scenarios</span>
                <div className="bis-header-select-pill bis-header-select-pill--adapter" style={{ width: '100%' }}>
                  <FlaskConical size={15} className="bis-pill-icon" />
                  <select
                    className="bis-compact-select"
                    style={{ width: '100%' }}
                    onChange={(e) => {
                      handleToggleMock(e);
                      setIsOverflowOpen(false);
                    }}
                    defaultValue={mockActive ? 'mock' : 'live'}
                  >
                    <optgroup label="Adapter Mode">
                      <option value="mock">Mode: Mock Data</option>
                      <option value="live">Mode: Live Backend (/api/v1)</option>
                    </optgroup>
                    <optgroup label="Load Test Scenarios">
                      <option value="case:1">Case 1: Standard Rec</option>
                      <option value="case:2">Case 2: Missing Info</option>
                      <option value="case:3">Case 3: Comparison</option>
                      <option value="case:4">Case 4: Insufficient Evid</option>
                      <option value="case:5">Case 5: Error & Retry</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
