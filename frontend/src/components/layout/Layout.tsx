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

  return (
    <div className={`bis-app-shell ${isCollapsed ? 'bis-shell--collapsed' : 'bis-shell--expanded'}`}>
      <div className="bis-layout-body">
        {/* Sidebar (handles its own mobile overlay and desktop collapsed/expanded states) */}
        <AppSidebar />

        {/* Content Column */}
        <div className="bis-main-column">
          <AppHeader />

          <main className="bis-main-content">
            <div key={location.pathname} className="bis-page-transition">
              <Outlet />
            </div>
          </main>

          <AppFooter />
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

