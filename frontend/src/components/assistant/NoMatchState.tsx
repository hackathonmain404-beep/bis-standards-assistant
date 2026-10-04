import React from 'react';
import { AlertCircle, Edit3, Search, Layers } from 'lucide-react';

export interface NoMatchStateProps {
  onRefine?: () => void;
  onSearchStandards?: () => void;
  onBrowseCategories?: () => void;
  message?: string;
}

export const NoMatchState: React.FC<NoMatchStateProps> = ({
  onRefine,
  onSearchStandards,
  onBrowseCategories,
  message,
}) => {
  return (
    <div className="bis-no-match-card" role="status">
      <div className="bis-no-match-header">
        <div className="bis-no-match-badge">
          <AlertCircle size={16} className="bis-no-match-badge-icon" aria-hidden="true" />
          <span className="bis-no-match-badge-title">NO RELIABLE MATCH FOUND</span>
        </div>
      </div>

      <h4 className="bis-no-match-title">
        {message || "I couldn't identify a sufficiently reliable standard match from the available information."}
      </h4>

      <p className="bis-no-match-desc">
        Under statutory BIS compliance protocols, we never guess or fabricate Indian Standards without authoritative verification. Try searching by industry term or browsing national division standards.
      </p>

      <div className="bis-no-match-actions">
        {onRefine && (
          <button
            type="button"
            className="bis-info-action-btn bis-info-action-btn--primary"
            onClick={onRefine}
          >
            <Edit3 size={14} aria-hidden="true" />
            <span>Refine Product Description</span>
          </button>
        )}

        {onSearchStandards && (
          <button
            type="button"
            className="bis-info-action-btn bis-info-action-btn--secondary"
            onClick={onSearchStandards}
          >
            <Search size={14} aria-hidden="true" />
            <span>Search Standards</span>
          </button>
        )}

        {onBrowseCategories && (
          <button
            type="button"
            className="bis-info-action-btn bis-info-action-btn--secondary"
            onClick={onBrowseCategories}
          >
            <Layers size={14} aria-hidden="true" />
            <span>Browse Related Categories</span>
          </button>
        )}
      </div>
    </div>
  );
};
