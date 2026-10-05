import React from 'react';
import { useNavigate, useInRouterContext } from 'react-router-dom';
import { StructuredAIResponse } from '../../types/assistant';
import { Citation, SourceReference } from '../../types/evidence';
import { parseCitations } from '../../utils/citationParser';
import { EvidenceStatusBadge } from '../evidence/EvidenceStatusBadge';
import { ClarificationForm } from './ClarificationForm';
import { ProductUnderstandingCard } from './ProductUnderstandingCard';
import { StandardRecommendationCard } from './StandardRecommendationCard';
import { RegulatoryStatusCard } from './RegulatoryStatusCard';
import { CertificationPath } from './CertificationPath';
import { TestingRequirementsCard } from './TestingRequirementsCard';
import { EvidenceReferenceCard } from './EvidenceReferenceCard';
import { InsufficientInformationState } from './InsufficientInformationState';
import { NoMatchState } from './NoMatchState';
import { ComplianceNextStep } from './ComplianceNextStep';
import { ResponseFeedback } from './ResponseFeedback';

export interface AIResponseViewProps {
  data: StructuredAIResponse;
  onOpenEvidence: (source: SourceReference | Citation) => void;
  onSelectSuggestion?: (query: string) => void;
  onSubmitClarification?: (values: Record<string, string>) => void;
  onViewStandard?: (standardNumber: string) => void;
  onStartCompliance?: (standardNumber: string) => void;
}

interface AIResponseViewInnerProps extends AIResponseViewProps {
  navigate: (to: string) => void;
}

const AIResponseViewInner: React.FC<AIResponseViewInnerProps> = ({
  data,
  onOpenEvidence,
  onSelectSuggestion,
  onSubmitClarification,
  onViewStandard,
  onStartCompliance,
  navigate,
}) => {
  // Parse citations from text
  const textSegments = parseCitations(data.answer);

  const handleCitationClick = (citationIndex: number) => {
    // Look up in citations or sources
    const foundCitation = data.citations?.find((c) => c.index === citationIndex);
    if (foundCitation) {
      onOpenEvidence(foundCitation);
      return;
    }

    if (data.sources && data.sources.length >= citationIndex) {
      onOpenEvidence(data.sources[citationIndex - 1]);
      return;
    }

    if (data.sources && data.sources.length > 0) {
      onOpenEvidence(data.sources[0]);
    }
  };

  const handleStandardEvidenceClick = (stdNumber: string) => {
    const found = data.citations?.find((c) => c.standard_id === stdNumber) ||
      data.sources?.find((s) => s.standard_number === stdNumber);
    if (found) {
      onOpenEvidence(found);
    } else if (data.citations && data.citations.length > 0) {
      onOpenEvidence(data.citations[0]);
    } else if (data.sources && data.sources.length > 0) {
      onOpenEvidence(data.sources[0]);
    }
  };

  const isInsufficient = data.evidence_status === 'insufficient_evidence';
  const hasStandards = data.standards && data.standards.length > 0;
  const isNoMatch = !hasStandards && !data.needs_clarification && !isInsufficient && (data.answer || '').toLowerCase().includes('no reliable standard');

  // Check if primary standard has QCO
  const primaryStandard = data.standards?.[0];
  const hasQcoInfo = primaryStandard?.is_mandatory || primaryStandard?.qco_order;

  return (
    <div className="bis-ai-response-view" role="article" aria-label="Structured BIS Copilot Response">
      {/* 1. Evidence Status & Distinction Header */}
      <div className="bis-ai-response-meta">
        <EvidenceStatusBadge status={data.evidence_status} />
        {data.intent && (
          <span className="bis-intent-tag">
            Workflow: <code>{data.intent.replace(/_/g, ' ')}</code>
          </span>
        )}
      </div>

      {/* 2. Main Answer text with inline citation chips */}
      <div className="bis-ai-answer-prose">
        <div className="bis-ai-interp-label">
          <span className="bis-interp-dot" />
          <span>AI Regulatory Synthesis</span>
        </div>
        <p className="bis-ai-prose-text">
          {textSegments.map((seg, idx) => {
            if (seg.type === 'citation' && seg.citationIndex !== undefined) {
              return (
                <button
                  key={idx}
                  type="button"
                  className="bis-inline-citation-btn"
                  onClick={() => handleCitationClick(seg.citationIndex!)}
                  title={`View supporting evidence for citation [${seg.citationIndex}]`}
                  aria-label={`View evidence reference ${seg.citationIndex}`}
                >
                  [{seg.citationIndex}]
                </button>
              );
            }
            return <span key={idx}>{seg.content}</span>;
          })}
        </p>
      </div>

      {/* 3. Product Understanding Card (Communicates: BIS Copilot understood the user's product description) */}
      {data.product && (
        <ProductUnderstandingCard product={data.product} />
      )}

      {/* 4. Dynamic Missing Information Clarification */}
      {data.needs_clarification &&
        data.missing_information &&
        data.missing_information.length > 0 &&
        onSubmitClarification && (
          <ClarificationForm
            fields={data.missing_information}
            onSubmit={onSubmitClarification}
          />
        )}

      {/* 5. Insufficient Information State */}
      {isInsufficient && (
        <InsufficientInformationState
          onRefine={() => {
            const el = document.getElementById('bis-main-query-input');
            el?.focus();
          }}
          onSearchStandards={() => navigate('/standards')}
          onBrowseCategories={() => navigate('/standards')}
        />
      )}

      {/* 6. No Match State */}
      {isNoMatch && (
        <NoMatchState
          onRefine={() => {
            const el = document.getElementById('bis-main-query-input');
            el?.focus();
          }}
          onSearchStandards={() => navigate('/standards')}
          onBrowseCategories={() => navigate('/standards')}
        />
      )}

      {/* 7. Potentially Relevant Standards Cards */}
      {hasStandards && (
        <div className="bis-response-section bis-standards-section">
          <div className="bis-section-header-row">
            <h4 className="bis-section-title">Potentially Relevant Indian Standards</h4>
            <span className="bis-section-badge-count">{data.standards!.length} Identified</span>
          </div>
          <div className="bis-standards-cards-list">
            {data.standards!.map((std, idx) => (
              <StandardRecommendationCard
                key={std.standard_number || idx}
                standard={std}
                onViewStandard={onViewStandard}
                onOpenEvidence={() => handleStandardEvidenceClick(std.standard_number)}
                onStartCompliance={onStartCompliance}
              />
            ))}
          </div>
        </div>
      )}

      {/* 8. Regulatory & QCO Status Card */}
      {hasQcoInfo && (
        <RegulatoryStatusCard
          qcoStatus={primaryStandard?.is_mandatory ? 'Applicable (Mandatory QCO)' : 'Not confirmed'}
          qcoOrderName={primaryStandard?.qco_order}
          verificationStatus="Required prior to market entry"
          certificationScheme={data.certification?.scheme_name || 'Scheme-I (ISI Mark Scheme)'}
        />
      )}

      {/* 9. Certification Progression Stepper */}
      {data.certification && (
        <CertificationPath
          schemeName={data.certification.scheme_name}
          onNavigateCompliance={() => onStartCompliance && onStartCompliance(primaryStandard?.standard_number || 'IS 17526')}
        />
      )}

      {/* 10. Testing Requirements Section */}
      {data.testing && data.testing.length > 0 && (
        <TestingRequirementsCard
          testing={data.testing}
          onFindLab={() => navigate('/laboratories')}
        />
      )}

      {/* 11. Authoritative Citations & Evidentiary Sources (Distinction from AI interpretation) */}
      {((data.citations && data.citations.length > 0) ||
        (data.sources && data.sources.length > 0)) && (
        <EvidenceReferenceCard
          citations={data.citations}
          sources={data.sources}
          onOpenEvidence={onOpenEvidence}
        />
      )}

      {/* 12. Recommended Next Compliance Action */}
      {hasStandards && (
        <ComplianceNextStep
          standardNumber={primaryStandard?.standard_number}
          onContinueJourney={() => onStartCompliance && onStartCompliance(primaryStandard?.standard_number || '')}
          onFindLaboratory={() => navigate('/laboratories')}
          onOpenEvidence={() => {
            if (data.citations?.[0]) onOpenEvidence(data.citations[0]);
            else if (data.sources?.[0]) onOpenEvidence(data.sources[0]);
          }}
        />
      )}

      {/* 13. Suggested Follow-up Inquiries */}
      {data.follow_up_suggestions && data.follow_up_suggestions.length > 0 && (
        <div className="bis-response-section bis-suggestions-section">
          <div className="bis-card-subheading">
            <span className="bis-subheading-icon">💡</span> Suggested Next Inquiries
          </div>
          <div className="bis-suggestion-chips-grid">
            {data.follow_up_suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                className="bis-suggestion-chip bis-suggestion-chip--response"
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
              >
                <span>{sug}</span>
                <span className="bis-chip-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 14. Response Feedback & Discrepancy Reporting */}
      <ResponseFeedback />
    </div>
  );
};

const AIResponseViewWithRouter: React.FC<AIResponseViewProps> = (props) => {
  const navigate = useNavigate();
  return <AIResponseViewInner {...props} navigate={navigate} />;
};

export const AIResponseView: React.FC<AIResponseViewProps> = (props) => {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <AIResponseViewWithRouter {...props} />;
  }
  return <AIResponseViewInner {...props} navigate={() => {}} />;
};

