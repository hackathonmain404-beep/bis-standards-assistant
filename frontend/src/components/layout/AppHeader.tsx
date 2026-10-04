import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Moon,
  BookOpen,
  Plus,
  LogIn,
  User,
  MoreHorizontal,
  X,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAssistant } from '../../state/AssistantContext';
import { useLanguage } from '../../state/LanguageContext';
import { useTheme } from '../../state/ThemeContext';

export const AppHeader: React.FC = () => {
  const {
    newSession,
    isEvidenceDrawerOpen,
    openEvidence,
    activeEvidence,
  } = useAssistant();
  const { t } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);
  const loginModalRef = useRef<HTMLDivElement>(null);

  // Close overflow menu and login modal on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverflowOpen(false);
        setIsLoginModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  const handleNewSession = () => {
    newSession();
    setIsOverflowOpen(false);
  };

  return (
    <>
      <header className="bis-app-header" role="banner">
        {/* LEFT: BIS Copilot Brand Identity (No Hamburger) */}
        <div className="bis-header-left">
          <div className="bis-header-brand-wrap">
            <div className="bis-header-badge" aria-hidden="true">BIS</div>
            <div className="bis-header-titles">
              <span className="bis-header-title">Copilot</span>
              <span className="bis-header-tagline">Compliance & Standards</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Utility Controls (Theme, Evidence, New Session, Login) */}
        <div className="bis-header-right">
          {/* Theme Toggle (Compact Icon Control) */}
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
              <Sun size={17} className="bis-theme-icon-sun" />
            ) : (
              <Moon size={17} className="bis-theme-icon-moon" />
            )}
          </button>

          {/* Evidence Drawer Toggle (Secondary Action, Desktop) */}
          <button
            type="button"
            className={`bis-header-action-btn bis-header-evidence-desktop ${
              isEvidenceDrawerOpen ? 'bis-header-action-btn--active' : ''
            }`}
            onClick={handleOpenEvidence}
            aria-label={t.header.evidencePanel || 'Evidence Panel'}
            aria-expanded={isEvidenceDrawerOpen}
            title={t.header.evidencePanel || 'Evidence Panel'}
          >
            <BookOpen size={16} className="bis-header-btn-icon" />
            <span className="bis-btn-label-desktop">{t.header.evidencePanel || 'Evidence Panel'}</span>
          </button>

          {/* New Session Button (Secondary Action, Desktop) */}
          <button
            type="button"
            className="bis-header-action-btn bis-header-new-desktop"
            onClick={handleNewSession}
            id="bis-header-new-session-btn"
            aria-label={t.header.newSession || 'New Session'}
            title={t.header.newSession || 'New Session'}
          >
            <Plus size={16} className="bis-header-btn-icon" />
            <span className="bis-btn-label-desktop">{t.header.newSession || 'New Session'}</span>
          </button>

          {/* Primary Action: Login Button */}
          <button
            type="button"
            className={`bis-header-login-btn ${isLoggedIn ? 'bis-header-login-btn--active' : ''}`}
            id="bis-header-login-btn"
            onClick={() => setIsLoginModalOpen(true)}
            aria-label={isLoggedIn ? 'Logged in as BIS Officer' : 'Login to BIS Copilot'}
            title={isLoggedIn ? 'Officer Account' : 'Login to BIS Copilot'}
          >
            {isLoggedIn ? (
              <>
                <User size={15} className="bis-login-icon" />
                <span>Officer</span>
              </>
            ) : (
              <>
                <LogIn size={15} className="bis-login-icon" />
                <span>Login</span>
              </>
            )}
          </button>

          {/* Responsive Overflow "⋯ More" Menu for Mobile (< 768px) */}
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
              {isOverflowOpen ? <X size={17} /> : <MoreHorizontal size={17} />}
            </button>

            {isOverflowOpen && (
              <div className="bis-header-overflow-dropdown" role="menu">
                <div className="bis-overflow-section">
                  <span className="bis-overflow-heading">Quick Actions</span>
                  <button
                    type="button"
                    className="bis-overflow-menu-item"
                    onClick={handleOpenEvidence}
                    role="menuitem"
                  >
                    <BookOpen size={16} />
                    <span>{t.header.evidencePanel || 'Evidence Panel'}</span>
                  </button>
                  <button
                    type="button"
                    className="bis-overflow-menu-item"
                    onClick={handleNewSession}
                    role="menuitem"
                  >
                    <Plus size={16} />
                    <span>{t.header.newSession || 'New Session'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Accessible Login Modal */}
      {isLoginModalOpen && (
        <div
          className="bis-modal-backdrop"
          onClick={() => setIsLoginModalOpen(false)}
          role="presentation"
        >
          <div
            className="bis-modal-dialog bis-login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bis-login-modal-title"
            ref={loginModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bis-login-modal-header">
              <div className="bis-login-modal-title-wrap">
                <div className="bis-login-modal-icon-badge">
                  <Lock size={18} />
                </div>
                <div>
                  <h2 id="bis-login-modal-title" className="bis-login-modal-title">
                    BIS Portal Login
                  </h2>
                  <p className="bis-login-modal-desc">
                    Standards & Compliance Officer / Stakeholder Access
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="bis-login-modal-close"
                onClick={() => setIsLoginModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="bis-login-modal-content">
                <div className="bis-login-officer-card">
                  <CheckCircle2 size={24} className="bis-login-check-icon" />
                  <div className="bis-login-officer-info">
                    <span className="bis-login-officer-name">BIS Compliance Officer</span>
                    <span className="bis-login-officer-dept">Central Quality & Standards Wing</span>
                    <span className="bis-login-officer-id">ID: BIS-NDLS-2026-8841</span>
                  </div>
                </div>
                <div className="bis-login-modal-actions">
                  <button
                    type="button"
                    className="bis-login-btn-secondary"
                    onClick={() => {
                      setIsLoggedIn(false);
                      setIsLoginModalOpen(false);
                    }}
                  >
                    Log Out
                  </button>
                  <button
                    type="button"
                    className="bis-login-btn-primary"
                    onClick={() => setIsLoginModalOpen(false)}
                  >
                    Continue Session
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="bis-login-modal-content"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoggedIn(true);
                  setIsLoginModalOpen(false);
                }}
              >
                <div className="bis-login-field-group">
                  <label htmlFor="bis-login-input-user" className="bis-login-field-label">
                    BIS ID or Official Email
                  </label>
                  <input
                    id="bis-login-input-user"
                    type="text"
                    className="bis-login-text-input"
                    placeholder="officer.hq@bis.gov.in"
                    defaultValue="officer.hq@bis.gov.in"
                    required
                    autoFocus
                  />
                </div>

                <div className="bis-login-field-group">
                  <label htmlFor="bis-login-input-pass" className="bis-login-field-label">
                    Security Credentials
                  </label>
                  <input
                    id="bis-login-input-pass"
                    type="password"
                    className="bis-login-text-input"
                    placeholder="••••••••••••"
                    defaultValue="password123"
                    required
                  />
                </div>

                <div className="bis-login-remember-row">
                  <label className="bis-login-checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Remember credentials on this workstation</span>
                  </label>
                </div>

                <div className="bis-login-modal-actions">
                  <button
                    type="button"
                    className="bis-login-btn-secondary"
                    onClick={() => setIsLoginModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bis-login-btn-primary"
                    id="bis-modal-login-submit"
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

