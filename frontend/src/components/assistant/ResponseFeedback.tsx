import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Check, X } from 'lucide-react';

export interface ResponseFeedbackProps {
  messageId?: string;
}

export const ResponseFeedback: React.FC<ResponseFeedbackProps> = () => {
  const [feedback, setFeedback] = useState<'helpful' | 'unhelpful' | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleThumbClick = (type: 'helpful' | 'unhelpful') => {
    setFeedback(type);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportOpen(false);
    }, 1500);
  };

  return (
    <div className="bis-response-feedback-bar" role="group" aria-label="Response Feedback">
      <div className="bis-feedback-content">
        <span className="bis-feedback-prompt">Was this helpful?</span>

        <div className="bis-feedback-buttons">
          <button
            type="button"
            className={`bis-feedback-btn ${feedback === 'helpful' ? 'bis-feedback-btn--active-positive' : ''}`}
            onClick={() => handleThumbClick('helpful')}
            aria-label="Mark response as helpful"
            title="Helpful"
          >
            <ThumbsUp size={13} aria-hidden="true" />
            <span>Yes</span>
          </button>

          <button
            type="button"
            className={`bis-feedback-btn ${feedback === 'unhelpful' ? 'bis-feedback-btn--active-negative' : ''}`}
            onClick={() => handleThumbClick('unhelpful')}
            aria-label="Mark response as unhelpful"
            title="Needs improvement"
          >
            <ThumbsDown size={13} aria-hidden="true" />
            <span>No</span>
          </button>
        </div>

        <button
          type="button"
          className="bis-report-issue-trigger"
          onClick={() => setIsReportOpen(!isReportOpen)}
          aria-expanded={isReportOpen}
        >
          <Flag size={12} aria-hidden="true" />
          <span>Report discrepancy</span>
        </button>
      </div>

      {feedback && !isReportOpen && (
        <span className="bis-feedback-acknowledgment">
          ✓ Thank you for your feedback
        </span>
      )}

      {/* Lightweight Report Modal/Dropdown */}
      {isReportOpen && (
        <div className="bis-report-popover" role="dialog" aria-label="Report discrepancy in response">
          <div className="bis-report-popover-header">
            <strong>Report Discrepancy</strong>
            <button
              type="button"
              className="bis-report-close-btn"
              onClick={() => setIsReportOpen(false)}
              aria-label="Close report dialog"
            >
              <X size={14} />
            </button>
          </div>

          {reportSubmitted ? (
            <div className="bis-report-success">
              <Check size={16} className="bis-report-check-icon" />
              <span>Thank you. Reported to BIS Copilot review queue.</span>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="bis-report-form">
              <span className="bis-report-label">Select reason:</span>
              <div className="bis-report-radio-group">
                {[
                  'Incorrect standard number or title',
                  'Incorrect regulatory / QCO information',
                  'Missing or inaccurate statutory source',
                  'Other regulatory discrepancy',
                ].map((reason) => (
                  <label key={reason} className="bis-report-radio-label">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="bis-report-actions">
                <button
                  type="button"
                  className="bis-report-cancel-btn"
                  onClick={() => setIsReportOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bis-report-submit-btn"
                  disabled={!reportReason}
                >
                  Submit Report
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
