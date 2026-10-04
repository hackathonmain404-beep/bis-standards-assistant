import React, { useState } from 'react';
import { Citation, SourceReference } from '../../types/evidence';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: Citation | SourceReference | null;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isCitation = evidence && 'index' in evidence;
  const citationNum = isCitation ? (evidence as Citation).index : null;
  const standardNumber = evidence
    ? 'standard_id' in evidence
      ? (evidence as Citation).standard_id
      : (evidence as SourceReference).standard_number
    : '';

  const docTitle = evidence?.document_title || '';
  const clause = evidence?.clause || '';
  const section = evidence?.section || '';
  const snippet = evidence?.snippet || '';
  const url = evidence?.url;
  const sourceType = evidence?.source_type || 'IS';

  const handleCopyCitation = () => {
    const formatted = `${docTitle} (${standardNumber}), ${section ? section + ', ' : ''}${clause ? clause : ''}. Retrieved from BIS Knowledge Repository.`;
    navigator.clipboard?.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div
        className="bis-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="bis-evidence-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bis-drawer-title"
      >
        <div className="bis-drawer-header">
          <div className="bis-drawer-header-left">
            <span className="bis-drawer-icon" aria-hidden="true">
              📖
            </span>
            <div>
              <h3 id="bis-drawer-title" className="bis-drawer-title">
                Sources & Grounded Evidence
              </h3>
              <p className="bis-drawer-subtitle">
                Official regulatory excerpts extracted from BIS standards
              </p>
            </div>
          </div>
          <button
            type="button"
            className="bis-drawer-close"
            onClick={onClose}
            aria-label="Close evidence panel"
          >
            ✕
          </button>
        </div>

        <div className="bis-drawer-content">
          {evidence ? (
            <div className="bis-drawer-evidence-block">
              {/* Grounded Evidence Banner */}
              <div className="bis-evidence-distinction-banner">
                <span className="bis-distinction-icon">🛡️</span>
                <div>
                  <strong>Official Repository Evidence</strong>
                  <p>
                    The snippet below is verbatim authoritative text, not AI-synthesized phrasing.
                  </p>
                </div>
              </div>

              {/* Standard Header */}
              <div className="bis-evidence-main-card">
                <div className="bis-evidence-card-top">
                  {citationNum && (
                    <span className="bis-citation-badge">[{citationNum}]</span>
                  )}
                  <Badge variant="info">{sourceType}</Badge>
                  <span className="bis-evidence-standard-code">{standardNumber}</span>
                </div>

                <h4 className="bis-evidence-doc-title">{docTitle}</h4>

                <div className="bis-evidence-metadata-grid">
                  {section && (
                    <div className="bis-meta-item">
                      <span className="bis-meta-label">Section</span>
                      <span className="bis-meta-value">{section}</span>
                    </div>
                  )}
                  {clause && (
                    <div className="bis-meta-item">
                      <span className="bis-meta-label">Clause</span>
                      <span className="bis-meta-value">{clause}</span>
                    </div>
                  )}
                  <div className="bis-meta-item">
                    <span className="bis-meta-label">Jurisdiction</span>
                    <span className="bis-meta-value">Bureau of Indian Standards</span>
                  </div>
                </div>

                {/* Verbatim snippet */}
                <div className="bis-evidence-quote-box">
                  <div className="bis-quote-label">Verified Text Snippet:</div>
                  <blockquote className="bis-quote-text">
                    "{snippet}"
                  </blockquote>
                </div>

                {/* Action buttons */}
                <div className="bis-evidence-actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCopyCitation}
                  >
                    {copied ? '✓ Citation Copied' : 'Copy Citation'}
                  </Button>

                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bis-button bis-button--outline bis-button--sm"
                    >
                      Open Standard Document ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="bis-drawer-regulatory-note">
                <strong>Notice:</strong> Conformity determination requires purchasing and referencing the full, officially stamped Indian Standard available via the BIS portal or authorized sales offices.
              </div>
            </div>
          ) : (
            <div className="bis-drawer-empty">
              <span className="bis-drawer-empty-icon" aria-hidden="true">📖</span>
              <h4 className="bis-drawer-empty-title">No supporting evidence was retrieved.</h4>
              <p className="bis-drawer-empty-desc">
                Ask a compliance inquiry in the Assistant or click any citation reference <code>[N]</code> or source card to inspect verified clause excerpts.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
