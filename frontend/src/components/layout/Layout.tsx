import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';
import { EvidenceDrawer } from '../evidence/EvidenceDrawer';
import { useAssistant } from '../../state/AssistantContext';
import { useSidebar } from '../../state/SidebarContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { isEvidenceDrawerOpen, closeEvidence, activeEvidence } = useAssistant();
  const { isCollapsed } = useSidebar();
  const mainContentRef = React.useRef<HTMLElement>(null);

  // Smooth scroll-to-top when navigating to a new route
  React.useEffect(() => {
    if (mainContentRef.current) {
      if (typeof mainContentRef.current.scrollTo === 'function') {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        mainContentRef.current.scrollTop = 0;
      }
    }
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const isAssistant = location.pathname === '/assistant' || location.pathname === '/';

  return (
    <div className={`bis-app-shell ${isCollapsed ? 'bis-shell--collapsed' : 'bis-shell--expanded'}`}>
      <div className="bis-layout-body">
        {/* Sidebar (handles its own mobile overlay and desktop collapsed/expanded states) */}
        <AppSidebar />

        {/* Content Column */}
        <div className="bis-main-column">
          <AppHeader />

          <main
            ref={mainContentRef}
            className={`bis-main-content ${isAssistant ? 'bis-main-content--assistant' : ''}`}
          >
            <div
              key={location.pathname}
              className={`bis-page-transition ${isAssistant ? 'bis-page-transition--assistant' : ''}`}
            >
              <Outlet />
            </div>

            {!isAssistant && <AppFooter />}
          </main>
        </div>
      </div>

      {/* Slide-over Evidence Panel */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={closeEvidence}
        evidence={activeEvidence}
      />
    </div>
  );
};

