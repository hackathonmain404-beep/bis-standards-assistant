import React from 'react';

export interface LoadingSkeletonProps {
  lines?: number;
  message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  message = 'Consulting BIS knowledge base...',
}) => {
  return (
    <div className="bis-loading-container" role="status" aria-live="polite">
      <div className="bis-loading-indicator">
        <span className="bis-loading-dot" />
        <span className="bis-loading-dot" />
        <span className="bis-loading-dot" />
        <span className="bis-loading-text">{message}</span>
      </div>
      <div className="bis-skeleton-group">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="bis-skeleton-line"
            style={{ width: idx === 0 ? '70%' : idx === lines - 1 ? '50%' : '90%' }}
          />
        ))}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};
