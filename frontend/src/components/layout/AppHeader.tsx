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
import { MOCK_40_USERS, MockUser } from '../../mocks/mockUsers';

export const AppHeader: React.FC = () => {
  const {
    newSession,
    isEvidenceDrawerOpen,
    openEvidence,
    activeEvidence,
    sendMessage,
  } = useAssistant();
  const { t, setLanguage } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MockUser>(MOCK_40_USERS[0]);
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
            aria-label={isLoggedIn ? `Logged in as ${selectedUser.display_name}` : 'Login to BIS Copilot'}
            title={isLoggedIn ? `${selectedUser.display_name} (${selectedUser.role})` : 'Login to BIS Copilot'}
          >
            {isLoggedIn ? (
              <>
                <User size={15} className="bis-login-icon" />
                <span>{selectedUser.display_name.split(' ')[0]}</span>
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
                    <span className="bis-login-officer-name">{selectedUser.display_name}</span>
                    <span className="bis-login-officer-dept">{selectedUser.role} • {selectedUser.company}</span>
                    <span className="bis-login-officer-id">{selectedUser.city}, {selectedUser.state} • Sector: {selectedUser.sector}</span>
                  </div>
                </div>

                <div style={{ marginTop: '14px', padding: '12px', background: 'var(--surface-sunken)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Sample Query for this Persona:
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '10px', fontStyle: 'italic' }}>
                    "{selectedUser.sample_query}"
                  </div>
                  <button
                    type="button"
                    className="bis-login-btn-primary"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }}
                    onClick={() => {
                      sendMessage(selectedUser.sample_query);
                      setIsLoginModalOpen(false);
                    }}
                  >
                    Ask this question now
                  </button>
                </div>

                <div className="bis-login-modal-actions" style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="bis-login-btn-secondary"
                    onClick={() => {
                      setIsLoggedIn(false);
                    }}
                  >
                    Switch User / Logout
                  </button>
                  <button
                    type="button"
                    className="bis-login-btn-primary"
                    onClick={() => setIsLoginModalOpen(false)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="bis-login-modal-content"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoggedIn(true);
                  if (selectedUser.preferred_language) {
                    setLanguage(selectedUser.preferred_language);
                  }
                  setIsLoginModalOpen(false);
                }}
              >
                <div className="bis-login-field-group">
                  <label htmlFor="bis-demo-user-select" className="bis-login-field-label">
                    Quick Select from 40 Test Personas
                  </label>
                  <select
                    id="bis-demo-user-select"
                    className="bis-login-text-input"
                    value={selectedUser.id}
                    onChange={(e) => {
                      const user = MOCK_40_USERS.find((u) => u.id === e.target.value);
                      if (user) setSelectedUser(user);
                    }}
                  >
                    {MOCK_40_USERS.map((u, idx) => (
                      <option key={u.id} value={u.id}>
                        {idx + 1}. {u.display_name} ({u.role} — {u.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bis-login-field-group">
                  <label htmlFor="bis-login-input-user" className="bis-login-field-label">
                    Email Address
                  </label>
                  <input
                    id="bis-login-input-user"
                    type="text"
                    className="bis-login-text-input"
                    value={selectedUser.email}
                    onChange={(e) => {
                      const found = MOCK_40_USERS.find((u) => u.email === e.target.value);
                      if (found) setSelectedUser(found);
                    }}
                    required
                  />
                </div>

                <div className="bis-login-field-group">
                  <label className="bis-login-field-label">
                    Persona Details
                  </label>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    🏢 <strong>{selectedUser.company}</strong> ({selectedUser.city}, {selectedUser.state})<br />
                    🌐 Preferred Language: <strong>{selectedUser.preferred_language.toUpperCase()}</strong>
                  </div>
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
                    Log In as {selectedUser.display_name.split(' ')[0]}
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

