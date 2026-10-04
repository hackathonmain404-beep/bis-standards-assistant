import React from 'react';
import { Scale, ShieldAlert, CheckCircle, Info } from 'lucide-react';

export interface RegulatoryStatusCardProps {
  qcoStatus?: 'Applicable' | 'Not identified' | 'Not confirmed' | 'Requires verification' | string;
  qcoOrderName?: string;
  verificationStatus?: 'Required' | 'Recommended' | 'Verified' | string;
  certificationScheme?: string;
  mandatorySince?: string;
}

export const RegulatoryStatusCard: React.FC<RegulatoryStatusCardProps> = ({
  qcoStatus = 'Applicable',
  qcoOrderName,
  verificationStatus = 'Required',
  certificationScheme = 'Scheme I (ISI Mark)',
  mandatorySince,
}) => {
  const isApplicable = qcoStatus.toLowerCase().includes('applicable');

  return (
    <div className="bis-regulatory-status-card" role="region" aria-label="Regulatory and QCO Status">
      <div className="bis-reg-header">
        <div className="bis-reg-badge">
          <Scale size={16} className="bis-reg-badge-icon" aria-hidden="true" />
          <span className="bis-reg-badge-title">REGULATORY STATUS</span>
        </div>
        <span className="bis-reg-disclaimer-pill">
          <Info size={12} aria-hidden="true" />
          <span>Statutory Gazette Advisory</span>
        </span>
      </div>

      <div className="bis-reg-grid">
        {/* QCO Status */}
        <div className="bis-reg-cell">
          <span className="bis-reg-label">Quality Control Order (QCO)</span>
          <div className="bis-reg-value-wrap">
            {isApplicable ? (
              <span className="bis-reg-status-pill bis-reg-status-pill--applicable">
                <ShieldAlert size={13} aria-hidden="true" />
                <span>{qcoStatus}</span>
              </span>
            ) : (
              <span className="bis-reg-status-pill bis-reg-status-pill--neutral">
                <span>{qcoStatus}</span>
              </span>
            )}
          </div>
          {qcoOrderName && (
            <span className="bis-reg-subtext">{qcoOrderName}</span>
          )}
        </div>

        {/* Verification Status */}
        <div className="bis-reg-cell">
          <span className="bis-reg-label">Regulatory Verification</span>
          <div className="bis-reg-value-wrap">
            <span className="bis-reg-status-pill bis-reg-status-pill--warning">
              <span>{verificationStatus}</span>
            </span>
          </div>
          <span className="bis-reg-subtext">Mandatory before commercial manufacture/import</span>
        </div>

        {/* Certification Scheme */}
        <div className="bis-reg-cell">
          <span className="bis-reg-label">Applicable Scheme</span>
          <div className="bis-reg-value-wrap">
            <span className="bis-reg-status-pill bis-reg-status-pill--info">
              <CheckCircle size={13} aria-hidden="true" />
              <span>{certificationScheme}</span>
            </span>
          </div>
          {mandatorySince && (
            <span className="bis-reg-subtext">Enforced: {mandatorySince}</span>
          )}
        </div>
      </div>

      <div className="bis-reg-footer-note">
        <span>Notice: Gazette QCO enforcement dates and compliance obligations are subject to Ministry of Consumer Affairs, Food & Public Distribution statutory orders. Cross-reference official BIS gazettes.</span>
      </div>
    </div>
  );
};
