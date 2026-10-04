import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Compass,
  FlaskConical,
  Award,
  Bookmark,
  PlusCircle,
  Building2,
} from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';
import { useAssistant } from '../../state/AssistantContext';
import { useSidebar } from '../../state/SidebarContext';

export const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { newSession } = useAssistant();
  const { mobileOpen, setMobileOpen } = useSidebar();

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
    // Hover intent delay: 60ms to prevent accidental twitch opening
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 60);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    // Collapse safety buffer: 120ms to allow smooth cursor transition without flickering
    collapseTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 120);
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
    // Collapse on click for clean page focus
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

      {/* Main Sidebar Element (Compact Icon Rail with Smooth Hover Expansion) */}
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

                  {/* Tooltip visible only in compact mode before hover expansion */}
                  {!isExpanded && (
                    <span className="bis-nav-tooltip" role="tooltip">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Active Workspace / New Session */}
        <div className="bis-sidebar-workspace">
          {isExpanded ? (
            <div className="bis-workspace-expanded-content">
              <div className="bis-workspace-header">
                <span className="bis-workspace-title">Active Workspace</span>
                <button
                  type="button"
                  className="bis-new-chat-btn"
                  onClick={() => {
                    newSession();
                    handleNavClick();
                  }}
                  title="Start a new inquiry"
                  aria-label="New Chat"
                >
                  <PlusCircle size={14} className="bis-btn-icon-subtle" />
                  <span>New Chat</span>
                </button>
              </div>
              <div className="bis-session-entry bis-session-entry--active">
                <span className="bis-session-dot" />
                <span className="bis-session-text">Current Inquiry Session</span>
              </div>
            </div>
          ) : (
            <div className="bis-workspace-collapsed">
              <button
                type="button"
                className="bis-new-chat-icon-btn"
                onClick={() => {
                  newSession();
                  handleNavClick();
                }}
                title="New Chat Session"
                aria-label="New Chat Session"
              >
                <PlusCircle size={20} />
              </button>
              <span className="bis-nav-tooltip" role="tooltip">
                New Chat Session
              </span>
            </div>
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

