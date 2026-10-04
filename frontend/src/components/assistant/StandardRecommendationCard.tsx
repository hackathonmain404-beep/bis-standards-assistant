import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, BookOpen, ArrowRight, ShieldAlert, Star } from 'lucide-react';
import { StandardRecommendation } from '../../types/standards';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { storage } from '../../utils/storage';
import { WhyThisStandardModal } from '../standards/WhyThisStandardModal';

export interface StandardRecommendationCardProps {
  standard: StandardRecommendation;
  onViewStandard?: (standardNumber: string) => void;
  onOpenEvidence?: (standardNumber: string) => void;
  onStartCompliance?: (standardNumber: string) => void;
}

export const StandardRecommendationCard: React.FC<StandardRecommendationCardProps> = ({
  standard,
  onViewStandard,
  onOpenEvidence,
  onStartCompliance,
}) => {
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => storage.isStandardSaved(standard.standard_number));

  const handleToggleSave = () => {
    storage.toggleSavedStandard(standard.standard_number);
    setIsSaved(!isSaved);
  };

  // Determine relevance status string from match reasons
  const hasMatchedReasons = standard.match_reasons?.some((r) => r.status === 'matched');
  const hasPartialReasons = standard.match_reasons?.some((r) => r.status === 'partial');
  const confidenceLevel = hasMatchedReasons ? 'high' : hasPartialReasons ? 'potential' : 'needs_verification';

  // Determine QCO status text
  const qcoStatus = standard.is_mandatory
    ? 'Applicable (Mandatory Order)'
    : standard.qco_order
    ? 'Applicable'
    : 'Not identified';

  return (
    <div className="bis-standard-recommendation-card" role="article" aria-label={`Standard ${standard.standard_number}`}>
      {/* Header Row */}
      <div className="bis-rec-card-header">
        <div className="bis-rec-heading-group">
          <span className="bis-rec-kicker">POTENTIALLY RELEVANT STANDARD</span>
          <div className="bis-rec-number-badge-row">
            <h3 className="bis-rec-standard-number">{standard.standard_number}</h3>
            <span className={`bis-rec-status-chip bis-rec-status-chip--${standard.status?.toLowerCase().replace(/\s+/g, '-') || 'active'}`}>
              {standard.status || 'Active'}
            </span>
          </div>
        </div>

        <div className="bis-rec-header-meta">
          <ConfidenceIndicator level={confidenceLevel} size="sm" />
          <button
            type="button"
            className={`bis-rec-bookmark-btn ${isSaved ? 'bis-rec-bookmark-btn--active' : ''}`}
            onClick={handleToggleSave}
            title={isSaved ? 'Remove from saved standards' : 'Save standard for later'}
            aria-label={isSaved ? 'Remove from saved standards' : 'Save standard for later'}
          >
            <Star size={16} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Official Title */}
      <h4 className="bis-rec-standard-title">{standard.title}</h4>

      {/* Short Description */}
      {standard.short_description && (
        <p className="bis-rec-standard-desc">{standard.short_description}</p>
      )}

      {/* Metadata Strip: Relevance, Status, QCO */}
      <div className="bis-rec-meta-strip">
        <div className="bis-rec-meta-col">
          <span className="bis-rec-meta-label">Relevance</span>
          <span className="bis-rec-meta-val bis-rec-meta-val--relevance">
            {confidenceLevel === 'high' ? 'High Relevance' : confidenceLevel === 'potential' ? 'Potential Match' : 'Needs Verification'}
          </span>
        </div>

        <div className="bis-rec-meta-col">
          <span className="bis-rec-meta-label">Standard Status</span>
          <span className="bis-rec-meta-val">{standard.status || 'Active'}</span>
        </div>

        <div className="bis-rec-meta-col">
          <span className="bis-rec-meta-label">QCO Status</span>
          <span className={`bis-rec-meta-val ${standard.is_mandatory ? 'bis-rec-meta-val--qco-active' : ''}`}>
            {standard.is_mandatory ? (
              <span className="bis-qco-pill">
                <ShieldAlert size={12} aria-hidden="true" />
                <span>{qcoStatus}</span>
              </span>
            ) : (
              qcoStatus
            )}
          </span>
        </div>
      </div>

      {/* Progressive Disclosure Accordion: "Why this Standard?" */}
      <div className="bis-rec-disclosure-wrap">
        <button
          type="button"
          className="bis-rec-disclosure-trigger"
          onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          aria-expanded={isWhyExpanded}
          aria-label={isWhyExpanded ? 'Collapse relevance explanation' : 'Expand relevance explanation'}
        >
          <span className="bis-rec-disclosure-title">
            Why this Standard? {isWhyExpanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
          </span>
          <span className="bis-rec-disclosure-hint">
            {isWhyExpanded ? 'Hide applicability rationale' : 'View applicability rationale'}
          </span>
        </button>

        {isWhyExpanded && (
          <div className="bis-rec-disclosure-content">
            {standard.qco_order && (
              <div className="bis-rec-qco-banner">
                <strong>Statutory Order: </strong>
                <span>{standard.qco_order}</span>
              </div>
            )}

            {standard.match_reasons && standard.match_reasons.length > 0 ? (
              <ul className="bis-rec-reasons-list">
                {standard.match_reasons.map((reason, idx) => (
                  <li key={idx} className="bis-rec-reason-item">
                    <span className={`bis-rec-reason-bullet bis-rec-reason-bullet--${reason.status}`}>
                      {reason.status === 'matched' ? '✓' : reason.status === 'partial' ? '⚠' : '○'}
                    </span>
                    <div className="bis-rec-reason-text">
                      <strong>{reason.category}: </strong>
                      <span>{reason.label}</span>
                      {reason.detail && (
                        <p className="bis-rec-reason-detail">{reason.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="bis-rec-generic-reason">
                This standard aligns with the product category, specifications, and regulatory classification provided in your query.
              </p>
            )}

            <button
              type="button"
              className="bis-rec-deep-modal-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Open detailed statutory analysis modal →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="bis-rec-actions-toolbar">
        <div className="bis-rec-actions-left">
          <button
            type="button"
            className="bis-rec-action-btn bis-rec-action-btn--outline"
            onClick={() => setIsWhyExpanded(!isWhyExpanded)}
          >
            {isWhyExpanded ? 'Hide Reasoning' : 'Why this standard?'}
          </button>

          {onViewStandard && (
            <button
              type="button"
              className="bis-rec-action-btn bis-rec-action-btn--secondary"
              onClick={() => onViewStandard(standard.standard_number)}
            >
              <ExternalLink size={13} aria-hidden="true" />
              <span>View Standard</span>
            </button>
          )}

          {onOpenEvidence && (
            <button
              type="button"
              className="bis-rec-action-btn bis-rec-action-btn--secondary"
              onClick={() => onOpenEvidence(standard.standard_number)}
            >
              <BookOpen size={13} aria-hidden="true" />
              <span>View Evidence</span>
            </button>
          )}
        </div>

        {onStartCompliance && (
          <button
            type="button"
            className="bis-rec-action-btn bis-rec-action-btn--primary"
            onClick={() => onStartCompliance(standard.standard_number)}
          >
            <span>Compliance Path</span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Deep Rationale Modal */}
      <WhyThisStandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        standard={standard}
      />
    </div>
  );
};
