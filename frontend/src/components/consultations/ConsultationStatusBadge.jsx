import React from 'react';
import Badge from '../common/Badge';

export default function ConsultationStatusBadge({ status, emergency = false, size = 'md' }) {
  const getVariant = (s) => {
    switch (s?.toLowerCase()) {
      case 'waiting':
        return 'waiting';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <Badge variant={getVariant(status)} size={size}>
        {status || 'Unknown'}
      </Badge>
      {emergency && (
        <Badge variant="emergency" size="sm">
          EMERGENCY
        </Badge>
      )}
    </div>
  );
}
