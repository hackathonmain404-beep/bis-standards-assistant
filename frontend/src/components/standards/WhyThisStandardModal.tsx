import React from 'react';
import { StandardRecommendation } from '../../types/standards';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface WhyThisStandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  standard: StandardRecommendation;
}

export const WhyThisStandardModal: React.FC<WhyThisStandardModalProps> = ({
  isOpen,
  onClose,
  standard,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Relevance Rationale — ${standard.standard_number}`}
      maxWidth="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Rationale
          </Button>
        </div>
      }
    >
      <div className="bis-why-modal-content">
        <div className="bis-why-standard-summary">
          <h4>{standard.title}</h4>
          {standard.qco_order && (
            <p className="bis-why-qco">
              <strong>Quality Control Order:</strong> {standard.qco_order}
            </p>
          )}
        </div>

        <div className="bis-why-table-container">
          <table className="bis-table bis-why-table">
            <thead>
              <tr>
                <th scope="col">Evaluation Attribute</th>
                <th scope="col">Extracted Relevance</th>
                <th scope="col">Match Status</th>
              </tr>
            </thead>
            <tbody>
              {standard.match_reasons.map((reason, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{reason.category}</strong>
                  </td>
                  <td>
                    <span>{reason.label}</span>
                    {reason.detail && (
                      <span className="bis-why-detail-hint">{reason.detail}</span>
                    )}
                  </td>
                  <td>
                    <Badge
                      variant={
                        reason.status === 'matched'
                          ? 'success'
                          : reason.status === 'partial'
                          ? 'warning'
                          : 'default'
                      }
                      size="sm"
                    >
                      {reason.status === 'matched'
                        ? '✓ Matched'
                        : reason.status === 'partial'
                        ? '⚠ Partial'
                        : '○ Pending Info'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bis-disclaimer-box">
          <span className="bis-disclaimer-icon">ℹ️</span>
          <p>
            <strong>Compliance Advisory:</strong> This matching breakdown is based strictly on the parameters extracted from your description and retrieved BIS scope provisions. Official conformity assessment requires verification against the current gazette-notified standard text.
          </p>
        </div>
      </div>
    </Modal>
  );
};
