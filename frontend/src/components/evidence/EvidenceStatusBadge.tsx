import React from 'react';
import { EvidenceStatus } from '../../types/evidence';
import { Badge } from '../common/Badge';

export interface EvidenceStatusBadgeProps {
  status: EvidenceStatus;
}

export const EvidenceStatusBadge: React.FC<EvidenceStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'strong':
      return (
        <Badge variant="success" size="sm">
          ✓ Verified Evidence Available
        </Badge>
      );
    case 'needs_verification':
      return (
        <Badge variant="warning" size="sm">
          ⚠ Verification Recommended
        </Badge>
      );
    case 'insufficient_evidence':
      return (
        <Badge variant="error" size="sm">
          ⚠ Insufficient Repository Evidence
        </Badge>
      );
    default:
      return null;
  }
};
