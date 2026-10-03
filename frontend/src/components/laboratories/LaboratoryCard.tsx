import React, { useState } from 'react';
import {
  FlaskConical,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { LaboratoryInfo } from '../../types/laboratory';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export interface LaboratoryCardProps {
  lab: LaboratoryInfo;
  onSelectStandard?: (standard: string) => void;
}

export const LaboratoryCard: React.FC<LaboratoryCardProps> = ({ lab, onSelectStandard }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedStandards, setExpandedStandards] = useState(false);

  const getBadgeVariant = (status: string) => {
    if (status.includes('Central')) return 'accent';
    if (status.includes('Regional')) return 'info';
    return 'success';
  };

  const visibleStandards = expandedStandards
    ? lab.tested_standards
    : (lab.tested_standards || []).slice(0, 4);
  const remainingStandards = (lab.tested_standards?.length || 0) - 4;

  return (
    <>
      <div className="bis-lab-card">
        {/* Card Header */}
        <div className="bis-lab-card-header">
          <div className="bis-lab-title-group">
            <div className="bis-lab-icon-box">
              <FlaskConical size={20} className="bis-lab-main-icon" />
            </div>
            <div>
              <div className="bis-lab-city-row">
                <MapPin size={13} className="bis-lab-location-icon" />
                <span className="bis-lab-city-text">
                  {lab.location.city}, {lab.location.state}
                </span>
              </div>
              <h3 className="bis-lab-title">{lab.name}</h3>
            </div>
          </div>
          <Badge variant={getBadgeVariant(lab.recognition_status)} size="sm">
            {lab.recognition_status}
          </Badge>
        </div>

        {lab.location.address && (
          <p className="bis-lab-address">{lab.location.address}</p>
        )}

        {/* Technical Capabilities Section */}
        <div className="bis-lab-section">
          <div className="bis-lab-section-header">
            <CheckCircle2 size={14} className="bis-section-icon" />
            <span className="bis-lab-section-title">Tested Technical Capabilities</span>
          </div>
          <div className="bis-lab-capabilities-grid">
            {lab.capabilities.map((cap, idx) => (
              <span key={idx} className="bis-lab-cap-chip">
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Supported Standards Section */}
        {lab.tested_standards && lab.tested_standards.length > 0 && (
          <div className="bis-lab-section">
            <div className="bis-lab-section-header">
              <BookOpen size={14} className="bis-section-icon" />
              <span className="bis-lab-section-title">Recognized Indian Standards</span>
            </div>
            <div className="bis-lab-standards-chips">
              {visibleStandards.map((std, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="bis-lab-std-chip"
                  onClick={() => onSelectStandard && onSelectStandard(std)}
                  title={`Filter by ${std}`}
                >
                  {std}
                </button>
              ))}
              {!expandedStandards && remainingStandards > 0 && (
                <button
                  type="button"
                  className="bis-lab-std-more-btn"
                  onClick={() => setExpandedStandards(true)}
                  title="Show all recognized standards"
                >
                  +{remainingStandards} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contact and Actions Footer */}
        <div className="bis-lab-card-footer">
          <div className="bis-lab-contact-items">
            {lab.contact?.phone && (
              <a href={`tel:${lab.contact.phone}`} className="bis-lab-contact-link" title="Call Laboratory">
                <Phone size={13} />
                <span>{lab.contact.phone}</span>
              </a>
            )}
            {lab.contact?.email && (
              <a href={`mailto:${lab.contact.email}`} className="bis-lab-contact-link" title="Email Laboratory">
                <Mail size={13} />
                <span>{lab.contact.email}</span>
              </a>
            )}
          </div>

          <div className="bis-lab-action-btns">
            {lab.contact?.website && (
              <a
                href={lab.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bis-lab-portal-link"
                title="Open Official Lab Portal"
              >
                <span>Lab Portal</span>
                <ExternalLink size={13} />
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsOpen(true)}
              icon={<ArrowRight size={14} />}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Laboratory Details Modal */}
      {detailsOpen && (
        <Modal
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title={lab.name}
          maxWidth="lg"
          footer={
            <div className="bis-modal-actions-right">
              {lab.contact?.website && (
                <a
                  href={lab.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bis-button bis-button--secondary bis-button--sm"
                >
                  <span>Open Official BIS Portal</span>
                  <ExternalLink size={14} />
                </a>
              )}
              <Button variant="primary" size="sm" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="bis-lab-modal-content">
            <div className="bis-lab-modal-meta-row">
              <Badge variant={getBadgeVariant(lab.recognition_status)} size="md">
                <ShieldCheck size={14} style={{ marginRight: 4 }} />
                {lab.recognition_status}
              </Badge>
              <div className="bis-lab-city-row">
                <MapPin size={15} className="bis-lab-location-icon" />
                <span>
                  {lab.location.city}, {lab.location.state}
                  {lab.location.pincode && ` — PIN: ${lab.location.pincode}`}
                </span>
              </div>
            </div>

            {lab.location.address && (
              <div className="bis-lab-modal-section">
                <h4 className="bis-lab-modal-heading">Facility Address</h4>
                <p className="bis-lab-modal-text">{lab.location.address}</p>
              </div>
            )}

            <div className="bis-lab-modal-section">
              <h4 className="bis-lab-modal-heading">Technical Capabilities & Scope</h4>
              <div className="bis-lab-capabilities-grid">
                {lab.capabilities.map((cap, idx) => (
                  <div key={idx} className="bis-lab-cap-detail-card">
                    <CheckCircle2 size={15} className="bis-text-accent" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {lab.tested_standards && lab.tested_standards.length > 0 && (
              <div className="bis-lab-modal-section">
                <h4 className="bis-lab-modal-heading">Recognized Indian Standards Coverage</h4>
                <div className="bis-lab-standards-chips">
                  {lab.tested_standards.map((std, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="bis-lab-std-chip"
                      onClick={() => {
                        setDetailsOpen(false);
                        if (onSelectStandard) onSelectStandard(std);
                      }}
                      title={`Filter by ${std}`}
                    >
                      {std}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bis-lab-modal-section">
              <h4 className="bis-lab-modal-heading">Official Contact & Inquiry</h4>
              <div className="bis-lab-modal-contact-grid">
                {lab.contact?.phone && (
                  <div className="bis-contact-item">
                    <Phone size={15} className="bis-text-muted" />
                    <div>
                      <span className="bis-contact-label">Telephone</span>
                      <a href={`tel:${lab.contact.phone}`} className="bis-contact-val">
                        {lab.contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {lab.contact?.email && (
                  <div className="bis-contact-item">
                    <Mail size={15} className="bis-text-muted" />
                    <div>
                      <span className="bis-contact-label">Official Email</span>
                      <a href={`mailto:${lab.contact.email}`} className="bis-contact-val">
                        {lab.contact.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
