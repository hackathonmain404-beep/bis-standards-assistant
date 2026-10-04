import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './state/ThemeContext';
import { SidebarProvider } from './state/SidebarContext';
import { LanguageProvider } from './state/LanguageContext';
import { ComplianceProvider } from './state/ComplianceContext';
import { AssistantProvider } from './state/AssistantContext';
import { AuthProvider } from './state/AuthContext';
import { Layout } from './components/layout/Layout';
import { AssistantPage } from './pages/AssistantPage';
import { StandardsSearchPage } from './pages/StandardsSearchPage';
import { StandardDetailPage } from './pages/StandardDetailPage';
import { CompliancePage } from './pages/CompliancePage';
import { LaboratoriesPage } from './pages/LaboratoriesPage';
import { HallmarkingPage } from './pages/HallmarkingPage';
import { SavedJourneyPage } from './pages/SavedJourneyPage';
import { LoginPage } from './pages/LoginPage';
import './styles/index.css';
import './styles/components.css';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LanguageProvider>
          <ComplianceProvider>
            <AssistantProvider>
              <AuthProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Navigate to="/assistant" replace />} />
                      <Route path="assistant" element={<AssistantPage />} />
                      <Route path="standards" element={<StandardsSearchPage />} />
                      <Route path="standards/:id" element={<StandardDetailPage />} />
                      <Route path="compliance" element={<CompliancePage />} />
                      <Route path="laboratories" element={<LaboratoriesPage />} />
                      <Route path="hallmarking" element={<HallmarkingPage />} />
                      <Route path="saved" element={<SavedJourneyPage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="*" element={<Navigate to="/assistant" replace />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </AuthProvider>
            </AssistantProvider>
          </ComplianceProvider>
        </LanguageProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default App;
