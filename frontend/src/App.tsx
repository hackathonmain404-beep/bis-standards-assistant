import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './state/ThemeContext';
import { SidebarProvider } from './state/SidebarContext';
import { LanguageProvider } from './state/LanguageContext';
import { ComplianceProvider } from './state/ComplianceContext';
import { AssistantProvider } from './state/AssistantContext';
import { AuthProvider, useAuth } from './state/AuthContext';
import { Layout } from './components/layout/Layout';
import { AssistantPage } from './pages/AssistantPage';
import { StandardsSearchPage } from './pages/StandardsSearchPage';
import { StandardDetailPage } from './pages/StandardDetailPage';
import { CompliancePage } from './pages/CompliancePage';
import { LaboratoriesPage } from './pages/LaboratoriesPage';
import { HallmarkingPage } from './pages/HallmarkingPage';
import { SavedJourneyPage } from './pages/SavedJourneyPage';
import { LoginPage } from './pages/LoginPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/index.css';
import './styles/components.css';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Standalone Full-Viewport Dedicated Login Page (outside Layout: no sidebar, no header, no dashboard behind it) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Initial Application Load: directly load dedicated Login page if unauthenticated, else Assistant */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/assistant" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Main Application with Layout (Header + Hover-expand Sidebar) */}
      <Route element={<Layout />}>
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/standards" element={<StandardsSearchPage />} />
        <Route path="/standards/:id" element={<StandardDetailPage />} />
        <Route path="/compliance" element={<CompliancePage />} />
        <Route path="/laboratories" element={<LaboratoriesPage />} />
        <Route path="/hallmarking" element={<HallmarkingPage />} />
        <Route path="/saved" element={<SavedJourneyPage />} />
      </Route>

      {/* Fallback route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/assistant" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SidebarProvider>
          <LanguageProvider>
            <ComplianceProvider>
              <AssistantProvider>
                <AuthProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </AuthProvider>
              </AssistantProvider>
            </ComplianceProvider>
          </LanguageProvider>
        </SidebarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
