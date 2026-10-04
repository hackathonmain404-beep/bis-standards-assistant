import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  BookOpen,
  Plus,
  LogIn,
  User,
  MoreHorizontal,
  X,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import bisLogo from '../../assets/bis-logo.png';
import { useAssistant } from '../../state/AssistantContext';
import { useLanguage } from '../../state/LanguageContext';
import { useTheme } from '../../state/ThemeContext';
import { useAuth } from '../../state/AuthContext';

export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const {
    newSession,
    isEvidenceDrawerOpen,
    openEvidence,
    activeEvidence,
  } = useAssistant();
  const { t } = useLanguage();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAuthenticated, login, logout } = useAuth();

  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const overflowRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setIsOverflowOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverflowOpen(false);
        setIsUserMenuOpen(false);
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
    openEvidence(activeEvidence);
    setIsOverflowOpen(false);
  };

  const handleNewSession = () => {
    newSession();
    setIsOverflowOpen(false);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="bis-app-header" role="banner">
        {/* LEFT: BIS Copilot Brand Identity */}
        <div className="bis-header-left">
          <div
            className="bis-header-brand-wrap"
            onClick={() => navigate('/assistant')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/assistant');
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="BIS Copilot Home"
          >
            <img
              src={bisLogo}
              alt="Bureau of Indian Standards"
              className="bis-header-logo-img"
            />
            <div className="bis-header-titles">
              <span className="bis-header-title">
                <span className="bis-header-title-bis">BIS </span>Copilot
              </span>
              <span className="bis-header-tagline">Compliance & Standards</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Utility Controls */}
        <div className="bis-header-right">
          {/* Single-Thumb Moving Pill Theme Switch inspired by Reference Image */}
          <button
            type="button"
            className={`bis-pill-theme-switch ${
              resolvedTheme === 'dark' ? 'bis-pill-theme-switch--dark' : 'bis-pill-theme-switch--light'
            }`}
            onClick={toggleTheme}
            role="switch"
            aria-checked={resolvedTheme === 'dark'}
            aria-label={
              resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            title={
              resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {/* Ambient Track Icons (faint track background) */}
            <span className="bis-pill-track-icons" aria-hidden="true">
              <span className="bis-pill-track-icon bis-pill-track-icon--sun">
                <Sun size={13} strokeWidth={2.4} />
              </span>
              <span className="bis-pill-track-icon bis-pill-track-icon--moon">
                <Moon size={13} strokeWidth={2.4} />
              </span>
            </span>

            {/* Sliding Circular Thumb with active crisp white icon inside */}
            <span className="bis-pill-thumb" aria-hidden="true">
              <span
                className={`bis-pill-thumb-icon bis-pill-thumb-icon--sun ${
                  resolvedTheme !== 'dark' ? 'is-active' : ''
                }`}
              >
                <Sun size={13} strokeWidth={2.4} />
              </span>
              <span
                className={`bis-pill-thumb-icon bis-pill-thumb-icon--moon ${
                  resolvedTheme === 'dark' ? 'is-active' : ''
                }`}
              >
                <Moon size={13} strokeWidth={2.4} />
              </span>
            </span>
          </button>

          {/* Evidence Drawer Toggle */}
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

          {/* New Session Button */}
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

          {/* Primary Action: Login / User Account */}
          <div className="bis-header-auth-wrap" ref={userMenuRef}>
            <button
              type="button"
              className={`bis-header-login-btn ${isAuthenticated ? 'bis-header-login-btn--active' : ''}`}
              id="bis-header-login-btn"
              onClick={handleLoginClick}
              aria-label={isAuthenticated ? `Logged in as ${user?.name || 'Officer'}` : 'Login to BIS Copilot'}
              title={isAuthenticated ? 'Account Menu' : 'Login to BIS Copilot'}
            >
              {isAuthenticated ? (
                <>
                  <User size={15} className="bis-login-icon" />
                  <span>{user?.role || 'Officer'}</span>
                </>
              ) : (
                <>
                  <LogIn size={15} className="bis-login-icon" />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Authenticated User Dropdown Menu */}
            {isAuthenticated && isUserMenuOpen && user && (
              <div className="bis-header-user-dropdown" role="menu">
                <div className="bis-user-dropdown-header">
                  <div className="bis-user-dropdown-avatar">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="bis-user-dropdown-info">
                    <strong className="bis-user-dropdown-name">{user.name}</strong>
                    <span className="bis-user-dropdown-email">{user.email}</span>
                    <span className="bis-user-dropdown-role">{user.role}</span>
                  </div>
                </div>
                <div className="bis-user-dropdown-divider" />
                <button
                  type="button"
                  className="bis-user-dropdown-item bis-user-dropdown-item--danger"
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  role="menuitem"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Responsive Overflow "⋯ More" Menu for Mobile */}
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
                  {!isAuthenticated && (
                    <button
                      type="button"
                      className="bis-overflow-menu-item"
                      onClick={() => {
                        setIsOverflowOpen(false);
                        navigate('/login');
                      }}
                      role="menuitem"
                    >
                      <LogIn size={16} />
                      <span>Login</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
