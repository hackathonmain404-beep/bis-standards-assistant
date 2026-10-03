import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { standardsApi } from '../services/standardsApi';
import { StandardDetail } from '../types/standards';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { TestingRequirementsTable } from '../components/compliance/TestingRequirementsTable';
import { SourceCard } from '../components/evidence/SourceCard';
import { useAssistant } from '../state/AssistantContext';

export const StandardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openEvidence } = useAssistant();
  const [standard, setStandard] = useState<StandardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'testing' | 'certification' | 'sources'>('overview');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    standardsApi
      .getStandardById(id)
      .then((data) => {
        setStandard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bis-page-container">
        <LoadingSkeleton lines={5} message="Loading standard specifications..." />
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="bis-page-container">
        <p>Standard not found.</p>
        <Button variant="secondary" onClick={() => navigate('/standards')}>
          Back to Standards
        </Button>
      </div>
    );
  }

  return (
    <div className="bis-page-container">
      {/* Top Breadcrumb & Nav */}
      <div className="bis-detail-breadcrumb">
        <button
          type="button"
          className="bis-back-link"
          onClick={() => navigate('/standards')}
        >
          ← Back to Standards Directory
        </button>
      </div>

      {/* Main Standard Header */}
      <div className="bis-standard-detail-header">
        <div className="bis-detail-header-top">
          <span className="bis-is-badge bis-is-badge--lg">{standard.standard_number}</span>
          <div className="bis-detail-badges">
            <Badge variant="success">{standard.status}</Badge>
            {standard.is_mandatory && <Badge variant="accent">Mandatory QCO Enforced</Badge>}
            <Badge variant="info">{standard.department}</Badge>
          </div>
        </div>

        <h2 className="bis-detail-title">{standard.title}</h2>

        {standard.qco_reference && (
          <div className="bis-qco-callout">
            <span className="bis-qco-icon">⚖️</span>
            <div>
              <strong>Enforcement Order:</strong> {standard.qco_reference}
              <p>
                Commercial manufacturing or distribution without BIS Certification (Standard Mark) is prohibited under the BIS Act, 2016.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bis-detail-tabs-bar" role="tablist">
        {(['overview', 'requirements', 'testing', 'certification', 'sources'] as const).map(
          (tab) => (
            <button
              key={tab}
              type="button"
              className={`bis-detail-tab ${activeTab === tab ? 'bis-detail-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Tab Contents */}
      <div className="bis-detail-tab-content">
        {activeTab === 'overview' && (
          <div className="bis-tab-pane">
            <section className="bis-spec-section">
              <h3 className="bis-spec-section-title">Overview</h3>
              <p>{standard.overview}</p>
            </section>

            <section className="bis-spec-section">
              <h3 className="bis-spec-section-title">Scope of Application</h3>
              <p>{standard.scope}</p>
            </section>

            <section className="bis-spec-section">
              <h3 className="bis-spec-section-title">Related Standards</h3>
              <ul className="bis-related-standards-list">
                {standard.related_standards.map((rel, idx) => (
                  <li key={idx} className="bis-related-std-item">
                    <span className="bis-related-rel-badge">{rel.relation_type}:</span>
                    <strong className="bis-related-code">{rel.standard_number}</strong> — {rel.title}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="bis-tab-pane">
            <h3 className="bis-spec-section-title">Key Regulatory Clauses & Requirements</h3>
            <div className="bis-requirements-list">
              {standard.requirements.map((req, idx) => (
                <div key={idx} className="bis-requirement-box">
                  <div className="bis-req-box-header">
                    <span className="bis-req-clause-tag">{req.clause}</span>
                    <h4 className="bis-req-title">{req.title}</h4>
                    <span className="bis-req-section-tag">{req.section}</span>
                  </div>
                  <p className="bis-req-desc">{req.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="bis-tab-pane">
            <h3 className="bis-spec-section-title">Mandatory & Quality Control Tests</h3>
            <TestingRequirementsTable
              tests={standard.testing_methods.map((t, idx) => ({
                id: `test-${idx}`,
                test_name: t.name,
                requirement_description: t.description,
                status: t.mandatory ? 'mandatory' : 'optional',
                standard_clause: t.clause,
              }))}
              onOpenEvidence={(clause) => {
                openEvidence({
                  index: 1,
                  standard_id: standard.standard_number,
                  document_title: standard.title,
                  section: 'Testing Methods',
                  clause,
                  snippet: `Testing procedure for ${clause} as prescribed under ${standard.standard_number}.`,
                });
              }}
            />
          </div>
        )}

        {activeTab === 'certification' && (
          <div className="bis-tab-pane">
            <h3 className="bis-spec-section-title">Applicable Certification Schemes</h3>
            <div className="bis-cert-schemes-container">
              {standard.certification_schemes.map((sch, idx) => (
                <div key={idx} className="bis-cert-scheme-badge-card">
                  <span className="bis-cert-icon">🛡️</span>
                  <div>
                    <h4>{sch}</h4>
                    <p>Requires in-house factory testing capabilities conforming to the standard SIT.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/compliance')}
                    >
                      View Certification Roadmap →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="bis-tab-pane">
            <h3 className="bis-spec-section-title">Evidentiary Citations & Sources</h3>
            <div className="bis-sources-list">
              {standard.sources.map((src, idx) => (
                <SourceCard key={idx} source={src} index={idx + 1} onOpenEvidence={openEvidence} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
