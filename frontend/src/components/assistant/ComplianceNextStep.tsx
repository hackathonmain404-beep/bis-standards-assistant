import React from 'react';
import { ArrowRight, BookOpen, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

export interface ComplianceNextStepProps {
  onContinueJourney?: () => void;
  onOpenEvidence?: () => void;
  onFindLaboratory?: () => void;
  standardNumber?: string;
  schemeName?: string;
}

export const ComplianceNextStep: React.FC<ComplianceNextStepProps> = ({
  onContinueJourney,
  onOpenEvidence,
  onFindLaboratory,
  standardNumber,
  schemeName = 'Scheme I (ISI Mark)',
}) => {
  return (
    <div className="bis-compliance-next-step-card" role="region" aria-label="Recommended Next Compliance Step">
      <div className="bis-next-step-header">
        <div className="bis-next-step-badge">
          <ShieldCheck size={16} className="bis-next-badge-icon" aria-hidden="true" />
          <span className="bis-next-badge-title">RECOMMENDED NEXT COMPLIANCE ACTION</span>
        </div>
      </div>

      <div className="bis-next-step-body">
        <div className="bis-next-step-text-wrap">
          <h4 className="bis-next-step-title">
            {standardNumber ? `Begin formal statutory roadmap for ${standardNumber}` : 'Continue your BIS Compliance Journey'}
          </h4>
          <p className="bis-next-step-desc">
            Transition from standard discovery into statutory preparation, factory inspection checklist, laboratory testing, and online Manakonline submission.
          </p>
        </div>

        <div className="bis-next-step-buttons">
          {onContinueJourney && (
            <button
              type="button"
              className="bis-next-btn bis-next-btn--primary"
              onClick={onContinueJourney}
            >
              <span>Continue Compliance Journey</span>
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}

          {onFindLaboratory && (
            <button
              type="button"
              className="bis-next-btn bis-next-btn--secondary"
              onClick={onFindLaboratory}
            >
              <MapPin size={14} aria-hidden="true" />
              <span>Find Testing Labs</span>
            </button>
          )}

          {onOpenEvidence && (
            <button
              type="button"
              className="bis-next-btn bis-next-btn--secondary"
              onClick={onOpenEvidence}
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>Review Evidence</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
