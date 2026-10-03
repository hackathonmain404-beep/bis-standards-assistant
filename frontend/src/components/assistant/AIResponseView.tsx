import React from 'react';
import { StructuredAIResponse } from '../../types/assistant';
import { Citation, SourceReference } from '../../types/evidence';
import { parseCitations } from '../../utils/citationParser';
import { EvidenceStatusBadge } from '../evidence/EvidenceStatusBadge';
import { SourceCard } from '../evidence/SourceCard';
import { StandardCard } from '../standards/StandardCard';
import { ClarificationForm } from './ClarificationForm';
import { Button } from '../common/Button';

export interface AIResponseViewProps {
  data: StructuredAIResponse;
  onOpenEvidence: (source: SourceReference | Citation) => void;
  onSelectSuggestion?: (query: string) => void;
  onSubmitClarification?: (values: Record<string, string>) => void;
  onViewStandard?: (standardNumber: string) => void;
  onStartCompliance?: (standardNumber: string) => void;
}

export const AIResponseView: React.FC<AIResponseViewProps> = ({
  data,
  onOpenEvidence,
  onSelectSuggestion,
  onSubmitClarification,
  onViewStandard,
  onStartCompliance,
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

  return (
    <div className="bis-ai-response-view">
      {/* Evidence Status Header */}
      <div className="bis-ai-response-meta">
        <EvidenceStatusBadge status={data.evidence_status} />
        {data.intent && (
          <span className="bis-intent-tag">
            Intent: <code>{data.intent}</code>
          </span>
        )}
      </div>

      {/* Main Answer text with inline citation chips */}
      <div className="bis-ai-answer-prose">
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
      </div>

      {/* Product Understanding Section */}
      {data.product && (
        <div className="bis-product-understanding-card">
          <div className="bis-card-subheading">
            <span className="bis-subheading-icon">📦</span> Product Understanding
          </div>
          <div className="bis-product-specs-grid">
            <div className="bis-product-spec-item">
              <span className="bis-spec-label">Identified Product:</span>
              <span className="bis-spec-value">{data.product.name}</span>
            </div>
            {data.product.category && (
              <div className="bis-product-spec-item">
                <span className="bis-spec-label">Domain Category:</span>
                <span className="bis-spec-value">{data.product.category}</span>
              </div>
            )}
            {data.product.intended_use && (
              <div className="bis-product-spec-item">
                <span className="bis-spec-label">Intended Use:</span>
                <span className="bis-spec-value">{data.product.intended_use}</span>
              </div>
            )}
          </div>

          {data.product.attributes && data.product.attributes.length > 0 && (
            <div className="bis-product-attributes-row">
              {data.product.attributes.map((attr, idx) => (
                <div key={idx} className="bis-attr-pill">
                  <span className="bis-attr-key">{attr.key}:</span>
                  <span className="bis-attr-val">{attr.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Missing Information Clarification */}
      {data.needs_clarification &&
        data.missing_information &&
        data.missing_information.length > 0 &&
        onSubmitClarification && (
          <ClarificationForm
            fields={data.missing_information}
            onSubmit={onSubmitClarification}
          />
        )}

      {/* Potentially Relevant Standards Cards */}
      {data.standards && data.standards.length > 0 && (
        <div className="bis-response-section">
          <div className="bis-section-header-row">
            <h4 className="bis-section-title">Potentially Relevant Indian Standards</h4>
            <span className="bis-section-badge-count">{data.standards.length} Identified</span>
          </div>
          <div className="bis-standards-cards-list">
            {data.standards.map((std, idx) => (
              <StandardCard
                key={idx}
                standard={std}
                onViewStandard={onViewStandard}
                onStartCompliance={onStartCompliance}
              />
            ))}
          </div>
        </div>
      )}

      {/* Certification Quick Summary */}
      {data.certification && (
        <div className="bis-response-section bis-certification-preview-box">
          <div className="bis-card-subheading">
            <span className="bis-subheading-icon">🛡️</span> Recommended Certification Scheme
          </div>
          <div className="bis-cert-preview-details">
            <div className="bis-cert-title-line">
              <strong>{data.certification.scheme_name}</strong>
            </div>
            <p className="bis-cert-eligibility-line">{data.certification.eligibility}</p>
            {data.certification.process_steps && (
              <div className="bis-cert-steps-mini">
                {data.certification.process_steps.map((st) => (
                  <span key={st.step_number} className="bis-step-mini-tag">
                    Step {st.step_number}: {st.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources & Evidence Section */}
      {((data.citations && data.citations.length > 0) ||
        (data.sources && data.sources.length > 0)) && (
        <div className="bis-response-section">
          <div className="bis-section-header-row">
            <h4 className="bis-section-title">Authoritative Citations & Evidentiary Sources</h4>
            <span className="bis-section-badge-count">
              {(data.citations?.length || 0) + (data.sources?.length || 0)} References
            </span>
          </div>

          <div className="bis-sources-list">
            {data.citations?.map((cit) => (
              <SourceCard
                key={`cit-${cit.index}`}
                source={cit}
                onOpenEvidence={onOpenEvidence}
              />
            ))}

            {data.sources &&
              (!data.citations || data.citations.length === 0) &&
              data.sources.map((src, idx) => (
                <SourceCard
                  key={`src-${idx}`}
                  source={src}
                  index={idx + 1}
                  onOpenEvidence={onOpenEvidence}
                />
              ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-up Inquiries */}
      {data.follow_up_suggestions && data.follow_up_suggestions.length > 0 && (
        <div className="bis-response-section bis-suggestions-section">
          <div className="bis-card-subheading">
            <span className="bis-subheading-icon">💡</span> Suggested Next Actions
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
    </div>
  );
};
