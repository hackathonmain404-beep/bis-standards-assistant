import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckSquare, ShieldCheck } from 'lucide-react';
import { useCompliance } from '../state/ComplianceContext';
import { ComplianceRoadmap } from '../components/compliance/ComplianceRoadmap';
import { ComplianceChecklist } from '../components/compliance/ComplianceChecklist';
import { CertificationCard } from '../components/compliance/CertificationCard';
import { MOCK_CERTIFICATION_SCHEMES } from '../mocks/mockCertificationData';

export const CompliancePage: React.FC = () => {
  const navigate = useNavigate();
  const { roadmapSteps, checklist, toggleChecklistItem } = useCompliance();
  const [activeTab, setActiveTab] = useState<'roadmap' | 'checklist' | 'schemes'>('roadmap');

  return (
    <div className="bis-page-container">
      {/* Visual Hierarchy: Eyebrow -> Main Title -> Subtitle */}
      <div className="bis-page-header">
        <div className="bis-page-eyebrow">
          <Compass size={14} className="bis-eyebrow-icon" />
          <span>Regulatory Compliance Engine</span>
        </div>
        <h1 className="bis-page-title">BIS Compliance Copilot & Journey Hub</h1>
        <p className="bis-page-subtitle">
          Guided end-to-end compliance workflow from initial product classification and standard identification to factory lab readiness, testing, and standard mark license grant.
        </p>
      </div>

      {/* Main Segmented Tabs */}
      <div className="bis-compliance-main-tabs" role="tablist" aria-label="Compliance Hub Sections">
        <button
          type="button"
          className={`bis-comp-tab-btn ${activeTab === 'roadmap' ? 'bis-comp-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
          role="tab"
          aria-selected={activeTab === 'roadmap'}
          id="tab-roadmap"
          aria-controls="panel-roadmap"
        >
          <Compass size={16} />
          <span>Compliance Roadmap Stepper</span>
        </button>
        <button
          type="button"
          className={`bis-comp-tab-btn ${activeTab === 'checklist' ? 'bis-comp-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('checklist')}
          role="tab"
          aria-selected={activeTab === 'checklist'}
          id="tab-checklist"
          aria-controls="panel-checklist"
        >
          <CheckSquare size={16} />
          <span>Actionable Compliance Checklist</span>
        </button>
        <button
          type="button"
          className={`bis-comp-tab-btn ${activeTab === 'schemes' ? 'bis-comp-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('schemes')}
          role="tab"
          aria-selected={activeTab === 'schemes'}
          id="tab-schemes"
          aria-controls="panel-schemes"
        >
          <ShieldCheck size={16} />
          <span>Certification Schemes (ISI / CRS)</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bis-compliance-tab-content">
        {activeTab === 'roadmap' && (
          <div id="panel-roadmap" role="tabpanel" aria-labelledby="tab-roadmap" className="bis-tab-panel-enter">
            <ComplianceRoadmap
              steps={roadmapSteps}
              onActionClick={(step) => {
                if (step.id === 'laboratory') {
                  navigate('/laboratories');
                } else if (step.id === 'standard') {
                  navigate('/standards');
                } else if (step.id === 'scheme') {
                  setActiveTab('schemes');
                } else {
                  setActiveTab('checklist');
                }
              }}
            />
          </div>
        )}

        {activeTab === 'checklist' && (
          <div id="panel-checklist" role="tabpanel" aria-labelledby="tab-checklist" className="bis-tab-panel-enter">
            <ComplianceChecklist items={checklist} onToggleItem={toggleChecklistItem} />
          </div>
        )}

        {activeTab === 'schemes' && (
          <div id="panel-schemes" role="tabpanel" aria-labelledby="tab-schemes" className="bis-tab-panel-enter">
            <div className="bis-schemes-list">
              {MOCK_CERTIFICATION_SCHEMES.map((scheme) => (
                <CertificationCard key={scheme.scheme_code} scheme={scheme} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
