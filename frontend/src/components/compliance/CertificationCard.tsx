import React, { useState } from 'react';
import { CertificationInfo } from '../../types/compliance';
import { Badge } from '../common/Badge';

export interface CertificationCardProps {
  scheme: CertificationInfo;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({ scheme }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'documents'>('steps');

  return (
    <div className="bis-certification-card">
      <div className="bis-cert-card-header">
        <div className="bis-cert-title-group">
          <Badge variant="accent" size="md">
            {scheme.scheme_code}
          </Badge>
          <h3 className="bis-cert-card-title">{scheme.scheme_name}</h3>
        </div>
        <a
          href={scheme.official_portal_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bis-link-btn bis-link-external"
        >
          Official Portal ↗
        </a>
      </div>

      <div className="bis-cert-eligibility-box">
        <strong>Eligibility & Scope:</strong>
        <p>{scheme.eligibility}</p>
      </div>

      {scheme.fee_structure_notice && (
        <div className="bis-cert-concession-banner">
          <span className="bis-concession-icon">🏷️</span>
          <span>{scheme.fee_structure_notice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bis-cert-tabs-row" role="tablist">
        <button
          type="button"
          className={`bis-cert-tab-btn ${activeTab === 'steps' ? 'bis-cert-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('steps')}
          role="tab"
          aria-selected={activeTab === 'steps'}
        >
          Process Steps ({scheme.process_steps.length})
        </button>
        <button
          type="button"
          className={`bis-cert-tab-btn ${activeTab === 'documents' ? 'bis-cert-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('documents')}
          role="tab"
          aria-selected={activeTab === 'documents'}
        >
          Required Documents ({scheme.required_documents.length})
        </button>
      </div>

      <div className="bis-cert-tab-content">
        {activeTab === 'steps' ? (
          <div className="bis-cert-timeline">
            {scheme.process_steps.map((step) => (
              <div key={step.step_number} className="bis-timeline-step">
                <div className="bis-timeline-marker">
                  <span className="bis-marker-num">{step.step_number}</span>
                </div>
                <div className="bis-timeline-info">
                  <div className="bis-timeline-header">
                    <h4 className="bis-step-name">{step.name}</h4>
                    {step.timeline && (
                      <span className="bis-step-time-tag">⏱ {step.timeline}</span>
                    )}
                  </div>
                  <p className="bis-step-desc">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bis-cert-docs-list">
            <ul>
              {scheme.required_documents.map((doc, idx) => (
                <li key={idx} className="bis-doc-item">
                  <span className="bis-doc-icon" aria-hidden="true">
                    📄
                  </span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
