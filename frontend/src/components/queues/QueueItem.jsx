import React from 'react';
import Badge from '../common/Badge';

export default function QueueItem({
  item,
  isNext = false,
  index,
  style = {}
}) {
  if (!item) return null;

  const isEmergency = item.emergency;
  const formattedToken = item.formattedToken || String(item.tokenNo).padStart(3, '0');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 0.85rem',
        borderRadius: '6px',
        backgroundColor: isNext
          ? (isEmergency ? '#fef2f2' : '#eff6ff')
          : '#ffffff',
        border: `1px solid ${
          isNext
            ? (isEmergency ? '#f87171' : '#60a5fa')
            : '#e2e8f0'
        }`,
        boxShadow: isNext ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
        marginBottom: '0.4rem',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {index !== undefined && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', width: '16px' }}>
            #{index + 1}
          </span>
        )}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: '700',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: isEmergency ? '#dc2626' : '#2563eb',
            color: '#ffffff',
            letterSpacing: '0.05em',
          }}
        >
          {formattedToken}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
            Patient #{item.patientId}
          </div>
          {item.healthIssue && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.healthIssue}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {isEmergency && (
          <Badge variant="emergency" size="sm">
            EMERGENCY
          </Badge>
        )}
        {isNext && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: isEmergency ? '#fee2e2' : '#dbeafe',
              color: isEmergency ? '#991b1b' : '#1e40af',
            }}
          >
            NEXT IN LINE
          </span>
        )}
      </div>
    </div>
  );
}
