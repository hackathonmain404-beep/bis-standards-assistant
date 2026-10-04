import React, { useState } from 'react';
import { FlaskConical, ChevronDown, ChevronUp, MapPin, CheckCircle2 } from 'lucide-react';
import { TestingRequirement } from '../../types/compliance';

export interface TestingRequirementsCardProps {
  testing: TestingRequirement[];
  onFindLab?: () => void;
  initialLimit?: number;
}

export const TestingRequirementsCard: React.FC<TestingRequirementsCardProps> = ({
  testing,
  onFindLab,
  initialLimit = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!testing || testing.length === 0) return null;

  const visibleTests = isExpanded ? testing : testing.slice(0, initialLimit);
  const remainingCount = testing.length - initialLimit;

  return (
    <div className="bis-testing-requirements-card" role="region" aria-label="Testing Requirements">
      <div className="bis-testing-header">
        <div className="bis-testing-badge">
          <FlaskConical size={16} className="bis-testing-badge-icon" aria-hidden="true" />
          <span className="bis-testing-badge-title">TESTING REQUIREMENTS</span>
        </div>
        <span className="bis-testing-count-tag">{testing.length} Parameters Specified</span>
      </div>

      <p className="bis-testing-subtext">
        Statutory parameters that must be evaluated at an authorized or BIS-recognized laboratory:
      </p>

      <div className="bis-testing-chips-grid">
        {visibleTests.map((t) => (
          <div key={t.id || t.test_name} className="bis-test-item-card">
            <div className="bis-test-top-line">
              <span className="bis-test-name">
                <CheckCircle2 size={13} className="bis-test-check" aria-hidden="true" />
                <strong>{t.test_name}</strong>
              </span>
              {t.status && (
                <span className={`bis-test-status-pill bis-test-status-pill--${t.status}`}>
                  {t.status.toUpperCase()}
                </span>
              )}
            </div>

            {t.standard_clause && (
              <span className="bis-test-clause">Clause: {t.standard_clause}</span>
            )}

            {t.requirement_description && (
              <p className="bis-test-desc">{t.requirement_description}</p>
            )}

            {t.acceptance_criteria && (
              <div className="bis-test-criteria">
                <span className="bis-criteria-label">Acceptance: </span>
                <span>{t.acceptance_criteria}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bis-testing-actions-bar">
        {remainingCount > 0 && (
          <button
            type="button"
            className="bis-testing-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Show Fewer Requirements</span>
                <ChevronUp size={14} aria-hidden="true" />
              </>
            ) : (
              <>
                <span>+ {remainingCount} More Testing Requirements</span>
                <ChevronDown size={14} aria-hidden="true" />
              </>
            )}
          </button>
        )}

        {onFindLab && (
          <button
            type="button"
            className="bis-find-lab-btn"
            onClick={onFindLab}
          >
            <MapPin size={14} aria-hidden="true" />
            <span>Find Recognized Laboratory</span>
          </button>
        )}
      </div>
    </div>
  );
};
