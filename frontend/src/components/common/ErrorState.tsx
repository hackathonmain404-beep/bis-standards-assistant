import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Temporarily Unavailable',
  message,
  onRetry,
  onReset,
}) => {
  return (
    <div className="bis-error-state" role="alert">
      <div className="bis-error-icon" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="bis-error-title">{title}</h3>
      <p className="bis-error-message">{message}</p>
      <div className="bis-error-actions">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Start New Session
          </Button>
        )}
      </div>
    </div>
  );
};
