import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Compass,
  FlaskConical,
  Award,
  Bookmark,
  PlusCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
} from 'lucide-react';
import { useLanguage } from '../../state/LanguageContext';
import { useAssistant } from '../../state/AssistantContext';
import { useSidebar } from '../../state/SidebarContext';

export const AppSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { newSession } = useAssistant();
  const { isCollapsed, toggleCollapse, mobileOpen, setMobileOpen } = useSidebar();

  const navItems = [
    { to: '/assistant', label: t.nav.assistant, icon: <MessageSquare size={20} /> },
    { to: '/standards', label: t.nav.standards, icon: <Search size={20} /> },
    { to: '/compliance', label: t.nav.compliance, icon: <Compass size={20} /> },
    { to: '/laboratories', label: t.nav.laboratories, icon: <FlaskConical size={20} /> },
    { to: '/hallmarking', label: t.nav.hallmarking, icon: <Award size={20} /> },
    { to: '/saved', label: t.nav.saved, icon: <Bookmark size={20} /> },
  ];

  const handleNavClick = () => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

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

      {/* Main Sidebar Element */}
      <aside
        className={`bis-sidebar ${isCollapsed ? 'bis-sidebar--collapsed' : 'bis-sidebar--expanded'} ${
          mobileOpen ? 'bis-sidebar--mobile-open' : ''
        }`}
        aria-label="Application Sidebar"
      >
        {/* Top Header / Branding & Desktop Collapse Toggle */}
        <div className="bis-sidebar-header">
          <div className="bis-sidebar-brand" onClick={handleNavClick}>
            <div className="bis-sidebar-logo-icon">
              <Building2 size={24} />
            </div>
            {!isCollapsed && (
              <div className="bis-sidebar-brand-text">
                <span className="bis-brand-title">BIS Copilot</span>
                <span className="bis-brand-tag">Standards & Compliance</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="bis-sidebar-collapse-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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

                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
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
          {!isCollapsed ? (
            <>
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
                >
                  <PlusCircle size={14} /> New Chat
                </button>
              </div>
              <div className="bis-session-entry bis-session-entry--active">
                <span className="bis-session-dot" />
                <span className="bis-session-text">Current Inquiry Session</span>
              </div>
            </>
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

        {/* Footer Government Emblem / Authority Tag */}
        <div className="bis-sidebar-footer">
          <div className="bis-gov-badge">
            <span className="bis-gov-flag">🇮🇳</span>
            {!isCollapsed && (
              <div className="bis-gov-text">
                <span className="bis-gov-authority">Government of India</span>
                <span className="bis-gov-ministry">Bureau of Indian Standards</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
