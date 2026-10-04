import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Compass,
  FlaskConical,
  Award,
  Bookmark,
  PlusCircle,
  Building2,
  X,
  BookOpen,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';
import { useAssistant } from '../../state/AssistantContext';
import { useSidebar } from '../../state/SidebarContext';
import { useAuth } from '../../state/AuthContext';

export const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { newSession, openEvidence, activeEvidence } = useAssistant();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = isHovered || isFocused || mobileOpen;

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    // Intentional hover intent (180ms): eliminates accidental triggers from passing cursors
    // and provides a natural, measured response before starting the smooth expansion.
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Controlled collapse buffer (200ms): prevents boundary flicker and provides
    // a relaxed, fluid transition when moving away from the sidebar.
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const handleNavClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    setIsHovered(false);
    setIsFocused(false);
  };

  const handleLogoClick = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    }
  };

  const navItems = [
    { to: '/assistant', label: t.nav.assistant, icon: <MessageSquare size={20} /> },
    { to: '/standards', label: t.nav.standards, icon: <Search size={20} /> },
    { to: '/compliance', label: t.nav.compliance, icon: <Compass size={20} /> },
    { to: '/laboratories', label: t.nav.laboratories, icon: <FlaskConical size={20} /> },
    { to: '/hallmarking', label: t.nav.hallmarking, icon: <Award size={20} /> },
    { to: '/saved', label: t.nav.saved, icon: <Bookmark size={20} /> },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="bis-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element (Compact Icon Rail with Smooth Professional Hover Expansion) */}
      <aside
        className={`bis-sidebar ${
          isExpanded ? 'bis-sidebar--expanded bis-sidebar--hover-expanded' : 'bis-sidebar--collapsed'
        } ${mobileOpen ? 'bis-sidebar--mobile-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label="Application Sidebar"
      >
        {/* Top Header / Branding */}
        <div className="bis-sidebar-header">
          <div className="bis-sidebar-brand" onClick={handleLogoClick}>
            <div className="bis-sidebar-logo-icon">
              <Building2 size={22} />
            </div>
            <div className="bis-sidebar-brand-text">
              <span className="bis-brand-title">BIS Copilot</span>
              <span className="bis-brand-tag">Standards & Compliance</span>
            </div>
          </div>

          {/* Mobile Drawer Close Button (Visible ONLY on mobile) */}
          <button
            type="button"
            className="bis-sidebar-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            title="Close navigation menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="bis-sidebar-nav" aria-label="Main Navigation">
          <ul className="bis-nav-list">
            {navItems.map((item) => (
              <li key={item.to} className="bis-nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `bis-nav-link ${isActive ? 'bis-nav-link--active' : ''}`
                  }
                  onClick={handleNavClick}
                >
                  <span className="bis-nav-icon">{item.icon}</span>
                  <span className="bis-nav-label">{item.label}</span>

                  {/* Tooltip visible in compact mode, smoothly suppressed on expand via CSS */}
                  <span className="bis-nav-tooltip" role="tooltip">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Navigation Drawer Secondary Actions (Hidden on Desktop) */}
        <div className="bis-sidebar-mobile-secondary">
          <div className="bis-mobile-secondary-divider" />
          <span className="bis-mobile-secondary-title">Quick Actions</span>
          <button
            type="button"
            className="bis-mobile-secondary-link"
            onClick={() => {
              openEvidence(activeEvidence);
              setMobileOpen(false);
            }}
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>Evidence Panel</span>
          </button>
          <button
            type="button"
            className="bis-mobile-secondary-link"
            onClick={() => {
              newSession();
              setMobileOpen(false);
            }}
          >
            <PlusCircle size={18} aria-hidden="true" />
            <span>New Session</span>
          </button>
          {isAuthenticated ? (
            <div className="bis-mobile-auth-section">
              <div className="bis-mobile-auth-user">
                <User size={16} aria-hidden="true" />
                <span className="bis-mobile-user-name">{user?.name || user?.role || 'Officer'}</span>
              </div>
              <button
                type="button"
                className="bis-mobile-secondary-link bis-mobile-secondary-link--danger"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="bis-mobile-secondary-link"
              onClick={() => {
                setMobileOpen(false);
                navigate('/login');
              }}
            >
              <LogIn size={18} aria-hidden="true" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Footer Government Authority Tag */}
        <div className="bis-sidebar-footer">
          <div className="bis-gov-badge">
            <span className="bis-gov-flag" aria-hidden="true">🇮🇳</span>
            <div className="bis-gov-text">
              <span className="bis-gov-authority">Government of India</span>
              <span className="bis-gov-ministry">Bureau of Indian Standards</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

