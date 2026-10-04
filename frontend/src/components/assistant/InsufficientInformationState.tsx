import React from 'react';
import { HelpCircle, Search, Layers, Edit3 } from 'lucide-react';

export interface InsufficientInformationStateProps {
  onRefine?: () => void;
  onSearchStandards?: () => void;
  onBrowseCategories?: () => void;
  message?: string;
}

export const InsufficientInformationState: React.FC<InsufficientInformationStateProps> = ({
  onRefine,
  onSearchStandards,
  onBrowseCategories,
  message,
}) => {
  return (
    <div className="bis-insufficient-info-card" role="status">
      <div className="bis-insufficient-header">
        <div className="bis-insufficient-badge">
          <HelpCircle size={16} className="bis-insufficient-badge-icon" aria-hidden="true" />
          <span className="bis-insufficient-badge-title">MORE INFORMATION NEEDED</span>
        </div>
      </div>

      <h4 className="bis-insufficient-title">
        {message || 'The current product description is not sufficient to identify a definitive standard match.'}
      </h4>

      <p className="bis-insufficient-desc">
        To locate the exact Indian Standard (IS), mandatory Quality Control Order (QCO), or testing lab, please specify attributes such as manufacturing material, intended use (domestic/industrial), voltage, capacity, or primary application.
      </p>

      <div className="bis-insufficient-actions">
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
            <span>Search Standards Directory</span>
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
