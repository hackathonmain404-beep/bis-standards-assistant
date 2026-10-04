import React, { useState, useEffect } from 'react';
import { Check, Loader2, Circle, ShieldCheck } from 'lucide-react';

export interface AIProcessingStateProps {
  currentStage?: string;
}

const STAGES = [
  'Understanding product description',
  'Searching relevant Indian Standards (IS)',
  'Preparing regulatory & QCO information',
  'Verifying official evidence & citations',
  'Formulating compliance recommendations',
];

export const AIProcessingState: React.FC<AIProcessingStateProps> = ({ currentStage }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // Step forward every 400ms smoothly up to stage 3
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bis-ai-processing-card" role="status" aria-live="polite">
      <div className="bis-processing-header">
        <div className="bis-processing-brand">
          <ShieldCheck size={16} className="bis-processing-brand-icon" aria-hidden="true" />
          <span className="bis-processing-title">BIS Copilot Compliance Engine</span>
        </div>
        <span className="bis-processing-status-tag">Analyzing Regulatory Database</span>
      </div>

      <div className="bis-processing-stages-list">
        {STAGES.map((stageName, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div
              key={idx}
              className={`bis-processing-stage-item ${
                isDone
                  ? 'bis-processing-stage-item--done'
                  : isCurrent
                  ? 'bis-processing-stage-item--current'
                  : 'bis-processing-stage-item--pending'
              }`}
            >
              <div className="bis-processing-step-indicator" aria-hidden="true">
                {isDone ? (
                  <Check size={13} className="bis-proc-icon-done" />
                ) : isCurrent ? (
                  <Loader2 size={13} className="bis-proc-icon-spin" />
                ) : (
                  <Circle size={10} className="bis-proc-icon-pending" />
                )}
              </div>
              <span className="bis-processing-step-text">
                {stageName}
                {isDone && <span className="bis-proc-check-symbol"> ✓</span>}
                {isCurrent && <span className="bis-proc-pulse-dot"> ◉</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div className="bis-processing-footer">
        <span className="bis-processing-footer-text">
          {currentStage || 'Cross-referencing National Standards Registry & Ministry QCO notifications...'}
        </span>
      </div>
    </div>
  );
};
