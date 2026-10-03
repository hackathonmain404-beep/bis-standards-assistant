import React, { useState } from 'react';
import { StandardRecommendation } from '../../types/standards';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { WhyThisStandardModal } from './WhyThisStandardModal';
import { storage } from '../../utils/storage';

export interface StandardCardProps {
  standard: StandardRecommendation;
  onViewStandard?: (standardNumber: string) => void;
  onStartCompliance?: (standardNumber: string) => void;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  standard,
  onViewStandard,
  onStartCompliance,
}) => {
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(() => storage.isStandardSaved(standard.standard_number));

  const handleToggleSave = () => {
    storage.toggleSavedStandard(standard.standard_number);
    setIsSaved(!isSaved);
  };

  return (
    <div className="bis-standard-card">
      <div className="bis-standard-card-header">
        <div className="bis-standard-number-row">
          <span className="bis-is-badge">{standard.standard_number}</span>
          <div className="bis-standard-status-group">
            <Badge variant={standard.status === 'Active' ? 'success' : 'warning'} size="sm">
              {standard.status}
            </Badge>
            {standard.is_mandatory && (
              <Badge variant="accent" size="sm">
                Mandatory QCO
              </Badge>
            )}
          </div>
        </div>
        <button
          type="button"
          className={`bis-bookmark-btn ${isSaved ? 'bis-bookmark-btn--active' : ''}`}
          onClick={handleToggleSave}
          aria-label={isSaved ? 'Remove from saved' : 'Save standard'}
          title={isSaved ? 'Saved to your list' : 'Save for later'}
        >
          {isSaved ? '★' : '☆'}
        </button>
      </div>

      <h4 className="bis-standard-card-title">{standard.title}</h4>

      {standard.short_description && (
        <p className="bis-standard-card-desc">{standard.short_description}</p>
      )}

      {/* Why it may be relevant */}
      {standard.match_reasons && standard.match_reasons.length > 0 && (
        <div className="bis-standard-reasons-preview">
          <div className="bis-reasons-header">
            <span className="bis-reasons-title">Relevance Assessment:</span>
            <span className="bis-provisional-tag">Requires User Verification</span>
          </div>
          <ul className="bis-reasons-list">
            {standard.match_reasons.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="bis-reason-item">
                <span
                  className={`bis-reason-icon bis-reason-icon--${reason.status}`}
                  aria-hidden="true"
                >
                  {reason.status === 'matched' ? '✓' : reason.status === 'partial' ? '⚠' : '○'}
                </span>
                <span className="bis-reason-label">
                  <strong>{reason.category}:</strong> {reason.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bis-standard-card-actions">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsWhyModalOpen(true)}
        >
          Why this standard?
        </Button>

        {onViewStandard && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewStandard(standard.standard_number)}
          >
            View Details
          </Button>
        )}

        {onStartCompliance && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onStartCompliance(standard.standard_number)}
          >
            Compliance Path →
          </Button>
        )}
      </div>

      {/* Modal for Why This Standard explanation */}
      <WhyThisStandardModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        standard={standard}
      />
    </div>
  );
};
