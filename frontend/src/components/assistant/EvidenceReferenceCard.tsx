import React from 'react';
import { BookOpen, ShieldCheck, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { Citation, SourceReference } from '../../types/evidence';

export interface EvidenceReferenceCardProps {
  sources?: SourceReference[];
  citations?: Citation[];
  onOpenEvidence: (source: SourceReference | Citation) => void;
}

export const EvidenceReferenceCard: React.FC<EvidenceReferenceCardProps> = ({
  sources = [],
  citations = [],
  onOpenEvidence,
}) => {
  const allItems = [
    ...citations.map((c) => ({
      id: `cit-${c.index}`,
      index: c.index,
      source: c.source_type ? `BIS (${c.source_type})` : 'BIS (Bureau of Indian Standards)',
      title: c.document_title || c.standard_id || 'Indian Standard Specification',
      docId: c.standard_id || 'Statutory Gazette',
      clause: c.clause ? (String(c.clause).toLowerCase().includes('clause') ? String(c.clause) : `Clause ${c.clause}`) : (c.section ? `Section ${c.section}` : 'Clause reference unavailable'),
      excerpt: c.snippet,
      raw: c,
    })),
    ...sources.map((s, idx) => ({
      id: `src-${idx}`,
      index: idx + 1,
      source: s.source_type ? `BIS (${s.source_type})` : 'BIS (Bureau of Indian Standards)',
      title: s.document_title || s.standard_number || 'Official Standard Reference',
      docId: s.standard_number || 'BIS Gazette',
      clause: s.clause ? (String(s.clause).toLowerCase().includes('clause') ? String(s.clause) : `Clause ${s.clause}`) : (s.section ? `Section ${s.section}` : 'Clause reference unavailable'),
      excerpt: s.snippet,
      raw: s,
    })),
  ];

  if (allItems.length === 0) return null;

  return (
    <div className="bis-evidence-reference-card" role="region" aria-label="Evidence and Official Sources">
      <div className="bis-evidence-card-header">
        <div className="bis-evidence-badge">
          <BookOpen size={16} className="bis-evidence-badge-icon" aria-hidden="true" />
          <span className="bis-evidence-badge-title">OFFICIAL EVIDENCE & STATUTORY SOURCES</span>
        </div>
        <span className="bis-evidence-count-pill">{allItems.length} Grounded References</span>
      </div>

      <div className="bis-evidence-distinction-banner">
        <div className="bis-distinction-item bis-distinction-item--ai">
          <span className="bis-distinction-dot bis-distinction-dot--ai" />
          <span className="bis-distinction-text">
            <strong>AI Interpretation: </strong>Synthesized analysis generated from regulatory parameters
          </span>
        </div>
        <div className="bis-distinction-item bis-distinction-item--official">
          <span className="bis-distinction-dot bis-distinction-dot--official" />
          <span className="bis-distinction-text">
            <strong>Official Source: </strong>Statutory gazettes & certified Bureau of Indian Standards documents
          </span>
        </div>
      </div>

      <div className="bis-evidence-items-list">
        {allItems.map((item) => (
          <div key={item.id} className="bis-evidence-row-item">
            <div className="bis-evidence-row-left">
              <span className="bis-evidence-citation-num">[{item.index}]</span>
              <div className="bis-evidence-row-info">
                <div className="bis-evidence-title-line">
                  <strong className="bis-evidence-doc-id">{item.docId}</strong>
                  <span className="bis-evidence-clause-badge">{item.clause}</span>
                  <span className="bis-evidence-org-badge">{item.source}</span>
                </div>
                <span className="bis-evidence-doc-title">{item.title}</span>
                {item.excerpt && (
                  <p className="bis-evidence-excerpt">“{item.excerpt}”</p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="bis-view-evidence-btn"
              onClick={() => onOpenEvidence(item.raw)}
              aria-label={`View evidence details for ${item.docId}`}
              title="Open full statutory text in Evidence Panel"
            >
              <span>View Evidence</span>
              <ExternalLink size={13} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
