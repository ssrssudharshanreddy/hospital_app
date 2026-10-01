import React from 'react';
import Badge from '../common/Badge';

export default function ConsultationStatusBadge({ status, emergency = false, size = 'md' }) {
  const getVariant = (s) => {
    switch (s?.toLowerCase()) {
      case 'waiting':
        return 'waiting';
      case 'in consultation':
      case 'in_consultation':
        return 'inConsultation';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  const displayStatus = (s) => {
    if (s?.toLowerCase() === 'in_consultation' || s?.toLowerCase() === 'in consultation') {
      return 'In Consultation';
    }
    return s || 'Unknown';
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <Badge variant={getVariant(status)} size={size}>
        {displayStatus(status)}
      </Badge>
      {emergency && (
        <Badge variant="emergency" size="sm">
          EMERGENCY
        </Badge>
      )}
    </div>
  );
}
