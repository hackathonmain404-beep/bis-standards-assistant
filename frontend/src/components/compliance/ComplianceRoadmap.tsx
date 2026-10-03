import React, { useState } from 'react';
import {
  CheckCircle2,
  CircleDot,
  AlertCircle,
  XCircle,
  Circle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { RoadmapStep, RoadmapStepId } from '../../types/compliance';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface ComplianceRoadmapProps {
  steps: RoadmapStep[];
  onStepClick?: (stepId: RoadmapStepId) => void;
  onActionClick?: (step: RoadmapStep) => void;
}

export const ComplianceRoadmap: React.FC<ComplianceRoadmapProps> = ({
  steps,
  onStepClick,
  onActionClick,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<RoadmapStepId | null>(null);

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[0];

  const handleStepClick = (stepId: RoadmapStepId) => {
    setSelectedStepId(stepId);
    if (onStepClick) onStepClick(stepId);
  };

  const getStatusBadgeVariant = (status: RoadmapStep['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'current':
        return 'accent';
      case 'requires_information':
        return 'warning';
      case 'unavailable':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderStatusIcon = (status: RoadmapStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="bis-step-icon-success" />;
      case 'current':
        return <CircleDot size={16} className="bis-step-icon-current" />;
      case 'requires_information':
        return <AlertCircle size={16} className="bis-step-icon-warning" />;
      case 'unavailable':
        return <XCircle size={16} className="bis-step-icon-error" />;
      default:
        return <Circle size={16} className="bis-step-icon-pending" />;
    }
  };

  return (
    <div className="bis-roadmap-container">
      {/* Left Column: Roadmap Stepper Stages */}
      <div className="bis-roadmap-stepper-panel">
        <div className="bis-roadmap-panel-header">
          <h2 className="bis-roadmap-panel-title">Roadmap Stages</h2>
          <span className="bis-roadmap-stage-counter">
            {steps.filter((s) => s.status === 'completed').length} of {steps.length} Complete
          </span>
        </div>

        <div className="bis-roadmap-stepper-list" role="list">
          {steps.map((step, idx) => {
            const isSelected = selectedStep?.id === step.id;
            return (
              <div
                key={step.id}
                className={`bis-stepper-node ${
                  isSelected ? 'bis-stepper-node--selected' : ''
                } bis-stepper-node--${step.status}`}
                onClick={() => handleStepClick(step.id)}
                role="listitem"
                tabIndex={0}
                aria-current={isSelected ? 'step' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStepClick(step.id);
                  }
                }}
              >
                <div className="bis-node-bullet-col">
                  <div className="bis-node-bullet">
                    {renderStatusIcon(step.status)}
                  </div>
                  {idx < steps.length - 1 && <div className="bis-node-line" />}
                </div>

                <div className="bis-node-text-col">
                  <div className="bis-node-header-row">
                    <span className="bis-node-title">{step.title}</span>
                    <Badge variant={getStatusBadgeVariant(step.status)} size="sm">
                      {step.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="bis-node-desc">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Stage Analysis */}
      <div className="bis-roadmap-details-panel">
        {selectedStep ? (
          <div key={selectedStep.id} className="bis-roadmap-step-card bis-fade-in-slide">
            <div className="bis-step-card-header">
              <div>
                <span className="bis-step-meta-badge">Stage Analysis</span>
                <h3 className="bis-step-card-title">{selectedStep.title}</h3>
              </div>
              <Badge variant={getStatusBadgeVariant(selectedStep.status)} size="md">
                {selectedStep.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <p className="bis-step-card-desc">{selectedStep.description}</p>

            {selectedStep.details && (
              <div className="bis-step-details-box">
                <span className="bis-step-details-label">Regulatory Execution Context:</span>
                <p className="bis-step-details-text">{selectedStep.details}</p>
              </div>
            )}

            <div className="bis-step-card-actions">
              {selectedStep.action_label && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onActionClick && onActionClick(selectedStep)}
                  icon={<ArrowRight size={16} />}
                >
                  {selectedStep.action_label}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bis-roadmap-empty">
            <ShieldAlert size={32} className="bis-text-muted" />
            <p>Select any stage on the left to inspect regulatory requirements and take actions.</p>
          </div>
        )}
      </div>
    </div>
  );
};
