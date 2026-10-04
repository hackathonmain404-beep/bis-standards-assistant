import React from 'react';
import { Check, Clock, ArrowRight, ShieldCheck, FileText, FlaskConical, Award } from 'lucide-react';

export type StepState = 'completed' | 'current' | 'pending' | 'unknown';

export interface CertificationStepItem {
  id: string;
  name: string;
  state: StepState;
  description?: string;
}

export interface CertificationPathProps {
  steps?: CertificationStepItem[];
  schemeName?: string;
  onNavigateCompliance?: () => void;
}

const DEFAULT_STEPS: CertificationStepItem[] = [
  { id: '1', name: 'Standard Identified', state: 'completed', description: 'Applicable IS confirmed' },
  { id: '2', name: 'Laboratory Testing', state: 'current', description: 'Product sample audit' },
  { id: '3', name: 'Certification Scheme', state: 'pending', description: 'Manakonline application' },
  { id: '4', name: 'Compliance Grant', state: 'pending', description: 'ISI Mark / CML License' },
];

export const CertificationPath: React.FC<CertificationPathProps> = ({
  steps = DEFAULT_STEPS,
  schemeName = 'Scheme I (ISI Mark)',
  onNavigateCompliance,
}) => {
  const getStepIcon = (state: StepState, idx: number) => {
    if (state === 'completed') return <Check size={14} className="bis-step-icon--done" />;
    if (state === 'current') return <Clock size={14} className="bis-step-icon--curr" />;
    return <span className="bis-step-num">{idx + 1}</span>;
  };

  return (
    <div className="bis-certification-path-card" role="region" aria-label="Certification Progression Stepper">
      <div className="bis-cert-path-header">
        <div className="bis-cert-path-badge">
          <Award size={16} className="bis-cert-path-badge-icon" aria-hidden="true" />
          <span className="bis-cert-path-title">CERTIFICATION PROGRESSION</span>
        </div>
        <span className="bis-cert-scheme-label">{schemeName}</span>
      </div>

      <div className="bis-cert-stepper-container">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <React.Fragment key={step.id}>
              <div className={`bis-cert-step-node bis-cert-step-node--${step.state}`}>
                <div className="bis-cert-step-bubble">
                  {getStepIcon(step.state, idx)}
                </div>
                <div className="bis-cert-step-info">
                  <strong className="bis-cert-step-name">{step.name}</strong>
                  {step.description && (
                    <span className="bis-cert-step-desc">{step.description}</span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className={`bis-cert-stepper-line bis-cert-stepper-line--${step.state === 'completed' ? 'active' : 'inactive'}`}>
                  <ArrowRight size={14} className="bis-stepper-arrow-icon" aria-hidden="true" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {onNavigateCompliance && (
        <div className="bis-cert-path-footer">
          <button
            type="button"
            className="bis-cert-open-roadmap-btn"
            onClick={onNavigateCompliance}
          >
            <span>View Full 9-Stage Statutory Roadmap</span>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};
