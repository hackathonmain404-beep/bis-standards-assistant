import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

export type ConfidenceLevel =
  | 'high'
  | 'potential'
  | 'needs_verification'
  | 'insufficient'
  | 'no_match';

export interface ConfidenceIndicatorProps {
  level?: ConfidenceLevel | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  level = 'high',
  label,
  size = 'md',
}) => {
  const normLevel = level.toLowerCase();

  let config = {
    text: label || 'High Relevance',
    icon: CheckCircle2,
    className: 'bis-confidence--high',
  };

  if (normLevel.includes('potential') || normLevel.includes('partial') || normLevel === 'medium') {
    config = {
      text: label || 'Potential Match',
      icon: AlertCircle,
      className: 'bis-confidence--potential',
    };
  } else if (normLevel.includes('verif') || normLevel.includes('pending') || normLevel === 'low') {
    config = {
      text: label || 'Needs Verification',
      icon: AlertTriangle,
      className: 'bis-confidence--verification',
    };
  } else if (normLevel.includes('insufficient')) {
    config = {
      text: label || 'Insufficient Information',
      icon: HelpCircle,
      className: 'bis-confidence--insufficient',
    };
  } else if (normLevel.includes('no_match') || normLevel.includes('none')) {
    config = {
      text: label || 'No Reliable Match',
      icon: XCircle,
      className: 'bis-confidence--no-match',
    };
  }

  const Icon = config.icon;

  return (
    <span
      className={`bis-confidence-indicator ${config.className} bis-confidence-indicator--${size}`}
      role="status"
    >
      <Icon size={size === 'sm' ? 12 : 14} className="bis-confidence-icon" aria-hidden="true" />
      <span className="bis-confidence-label">{config.text}</span>
    </span>
  );
};
