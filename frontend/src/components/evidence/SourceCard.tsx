import React, { useState } from 'react';
import { Citation, SourceReference } from '../../types/evidence';
import { Badge } from '../common/Badge';

export interface SourceCardProps {
  source: SourceReference | Citation;
  index?: number;
  onOpenEvidence?: (source: SourceReference | Citation) => void;
  initiallyExpanded?: boolean;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  index,
  onOpenEvidence,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  const isCitation = 'index' in source;
  const citationNum = isCitation ? (source as Citation).index : index || 1;
  const standardNumber =
    'standard_id' in source ? (source as Citation).standard_id : (source as SourceReference).standard_number;
  const docTitle = source.document_title;
  const clause = source.clause;
  const section = source.section;
  const snippet = source.snippet;
  const sourceType = source.source_type || 'IS';

  return (
    <div className={`bis-source-card ${isExpanded ? 'bis-source-card--expanded' : ''}`}>
      <div
        className="bis-source-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="bis-source-card-title-group">
          <span className="bis-citation-badge">[{citationNum}]</span>
          <span className="bis-source-standard-num">{standardNumber}</span>
          <span className="bis-source-doc-title">{docTitle}</span>
          {clause && <span className="bis-source-clause-tag">{clause}</span>}
        </div>
        <div className="bis-source-card-meta">
          <Badge variant={sourceType === 'IS' ? 'info' : sourceType === 'QCO' ? 'accent' : 'default'} size="sm">
            {sourceType}
          </Badge>
          <span className="bis-source-chevron" aria-hidden="true">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="bis-source-card-body">
          {section && (
            <div className="bis-source-meta-row">
              <span className="bis-source-meta-label">Section:</span>
              <span className="bis-source-meta-val">{section}</span>
            </div>
          )}
          {clause && (
            <div className="bis-source-meta-row">
              <span className="bis-source-meta-label">Clause:</span>
              <span className="bis-source-meta-val">{clause}</span>
            </div>
          )}

          <div className="bis-source-snippet-box">
            <div className="bis-source-snippet-label">Official Retrieved Excerpt:</div>
            <p className="bis-source-snippet-text">"{snippet}"</p>
          </div>

          <div className="bis-source-card-actions">
            {onOpenEvidence && (
              <button
                type="button"
                className="bis-link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEvidence(source);
                }}
              >
                Inspect in Evidence Drawer →
              </button>
            )}
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bis-link-btn bis-link-external"
                onClick={(e) => e.stopPropagation()}
              >
                Official BIS Document ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
